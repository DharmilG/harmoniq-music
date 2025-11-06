import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'

import { authMiddleware, signToken, setAuthCookie, clearAuthCookie, verifyGoogleIdToken, findUserByEmail, createUser, publicUser, handleGoogleSignIn } from './auth.js'
import { query, pool } from './db.js'

dotenv.config({ path: new URL('../.env', import.meta.url).pathname })

const app = express()
const PORT = Number(process.env.PORT || 4000)

app.set('trust proxy', 1)
app.use(helmet())
app.use(express.json())
// Paytm callback posts application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : ['http://localhost:5173']

app.use(cors({
  origin(origin, callback) {
    // allow requests with no origin (e.g., curl) or if in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  skip: (req) => req.method === 'OPTIONS', // Skip preflight requests
})
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, skip: (req) => req.method === 'OPTIONS'
})

// --- NEW: Helper function to calculate profile completion ---
async function calculateAndUpdateProfileCompletion(userId) {
  const { rows } = await query(`
    SELECT name, avatar_url, first_name, last_name, phone, address_line1, city, zip_code, country
    FROM users WHERE id = $1
  `, [userId])
  
  if (!rows[0]) return 0
  
  const user = rows[0]
  const fields = [
    user.name,
    user.avatar_url,
    user.first_name,
    user.last_name,
    user.phone,
    user.address_line1,
    user.city,
    user.zip_code,
    user.country
  ]
  const totalFields = fields.length
  const completedFields = fields.filter(field => field && field.trim() !== '').length
  const percentage = Math.round((completedFields / totalFields) * 100)
  
  await query(
    'UPDATE users SET profile_completed = $1 WHERE id = $2',
    [percentage, userId]
  )
  
  return percentage
}
// --- END NEW HELPER ---

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Harmoniq Auth Server is running!',
    healthcheck: '/api/health'
  })
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

// ============================================
// CATALOG ROUTES
// ============================================

// Catalog: categories
app.get('/api/categories', async (req, res) => {
  const { rows } = await query('SELECT id, name FROM categories ORDER BY name ASC')
  return res.json({ categories: rows })
})

// Catalog: products
app.get('/api/products', async (req, res) => {
  const { rows } = await query(`
    SELECT p.id, p.name, p.price::float AS price, p.category_id AS category, p.img, p.specs
    FROM products p
    ORDER BY p.name ASC
  `)
  return res.json({ products: rows })
})

// ============================================
// LESSONS ROUTES
// ============================================

// Lessons: instruments
app.get('/api/lessons/instruments', async (req, res) => {
  const { rows } = await query('SELECT id, name FROM instruments ORDER BY name ASC')
  // Frontend expects array of names
  const instruments = rows.map(r => r.name)
  return res.json({ instruments })
})

// Lessons: courses
app.get('/api/lessons/courses', async (req, res) => {
  const { rows } = await query(`
    SELECT c.id,
           i.name AS instrument,
           c.level,
           c.duration,
           c.price::float AS price,
           c.summary
    FROM courses c
    JOIN instruments i ON i.id = c.instrument_id
    ORDER BY i.name, c.level
  `)
  return res.json({ courses: rows })
})

// Lessons: instructors
app.get('/api/lessons/instructors', async (req, res) => {
  const { rows } = await query(`
    SELECT inst.id, inst.name, i.name AS instrument, inst.bio, inst.img
    FROM instructors inst
    JOIN instruments i ON i.id = inst.instrument_id
    ORDER BY inst.name ASC
  `)
  return res.json({ instructors: rows })
})

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
  })
  const parsed = schema.safeParse(req.body)
  if(!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues })

  const { email, password, name } = parsed.data
  const exists = await findUserByEmail(email)
  if(exists) return res.status(409).json({ error: 'An account with this email already exists' })

  const avatar_url = `https://www.gravatar.com/avatar/${Buffer.from(email).toString('base64').replace(/=/g,'')}?d=identicon`
  const user = await createUser({ email, password, name, avatar_url, provider: 'password' });
  
  // --- NEW: Calculate initial profile completion after creation ---
  await calculateAndUpdateProfileCompletion(user.id)
  // --- END NEW ---
  
  const token = signToken({ sub: user.id, email: user.email, name: user.name })
  setAuthCookie(res, token)
  return res.status(201).json({ user: publicUser(user) })
})

// Google Sign-in
app.post('/api/auth/google-signin', authLimiter, handleGoogleSignIn)

// Login
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
  const parsed = schema.safeParse(req.body)
  if(!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const { email, password } = parsed.data

  const user = await findUserByEmail(email)
  if(!user || !user.password_hash) return res.status(400).json({ error: 'Invalid email or password' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if(!ok) return res.status(400).json({ error: 'Invalid email or password' })

  // --- NEW: Daily Login and Streak Bonus Logic ---
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastLoginDate = user.last_login ? new Date(user.last_login) : null
  const lastLoginDay = lastLoginDate ? new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate()) : null

  let tokensToAdd = 0
  let newStreak = user.login_streak || 0
  let bonusMessage = ''

  // Check if it's a new day login
  if (!lastLoginDay || lastLoginDay.getTime() < today.getTime()) {
    tokensToAdd = 1 // Base daily login bonus
    bonusMessage = 'Daily Login Bonus: +1 Token!'

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check for streak
    if (lastLoginDay && lastLoginDay.getTime() === yesterday.getTime()) {
      newStreak++
    } else {
      newStreak = 1 // Reset streak
    }

    // Check for streak bonus
    if (newStreak > 0 && newStreak % 3 === 0) {
      tokensToAdd += 1 // Streak bonus
      bonusMessage = `3-Day Streak Bonus: +${tokensToAdd} Tokens! 🎉`
    }

    await query(
      'UPDATE users SET last_login = NOW(), tokens = tokens + $1, login_streak = $2 WHERE id = $3',
      [tokensToAdd, newStreak, user.id]
    )
    // Update user object for the response
    user.tokens = (user.tokens || 0) + tokensToAdd
    user.login_streak = newStreak
  } else {
    // It's a subsequent login on the same day, just update the timestamp
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])
  }
  // --- END NEW ---

  // --- NEW: Ensure profile completion is calculated on login ---
  await calculateAndUpdateProfileCompletion(user.id)
  // --- END NEW ---

  const token = signToken({ sub: user.id, email: user.email, name: user.name })
  setAuthCookie(res, token)
  return res.json({ user: publicUser(user), bonusMessage: bonusMessage || null })
})

// Logout
app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res)
  return res.json({ ok: true })
})

// Me
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const { rows } = await query(`
    SELECT id, email, name, avatar_url, provider,
           first_name, last_name, phone,
           address_line1, city, zip_code, country,
           profile_completed,
           COALESCE(points, 0) as points, 
           COALESCE(tokens, 0) as tokens, 
           COALESCE(login_streak, 0) as login_streak,
           created_at, updated_at
    FROM users WHERE id = $1
  `, [req.user.sub])
  const user = rows[0]
  if(!user) return res.status(404).json({ error: 'User not found' })
  
  // --- NEW: Calculate if not set (fallback) ---
  if (!user.profile_completed || user.profile_completed === 0) {
    user.profile_completed = await calculateAndUpdateProfileCompletion(req.user.sub)
  }
  // --- END NEW ---
  
  return res.json({ user: publicUser(user) });
})

// Forgot Password
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  const schema = z.object({ email: z.string().email() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email' })

  const { email } = parsed.data
  const user = await findUserByEmail(email)

  if (user && user.provider === 'password') {
    // Generate a 6-digit code
    const resetCode = crypto.randomInt(100000, 999999).toString()
    const passwordResetToken = crypto.createHash('sha256').update(resetCode).digest('hex')
    const passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE id = $3',
      [passwordResetToken, passwordResetExpiresAt, user.id]
    )

    // In a real app, you would send an email with the code here.
    // For this project, we'll log the code to the console.
    console.log('--- PASSWORD RESET ---')
    console.log(`Password reset code for ${email}: ${resetCode}`)
    console.log('--------------------')
  }

  // Always return a success message to prevent email enumeration attacks
  return res.json({ message: 'If an account with that email exists, a password reset code has been sent.' })
})

// Verify Reset Code and issue a grant token
app.post('/api/auth/verify-reset-code', authLimiter, async (req, res) => {
  const schema = z.object({ email: z.string().email(), code: z.string().length(6) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const { email, code } = parsed.data
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex')

  const { rows } = await query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND password_reset_token = $2 AND password_reset_expires_at > NOW()',
    [email, hashedCode]
  )
  const user = rows[0]

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired code.' })
  }

  // Issue a single-use, short-lived grant token for the password reset form
  const grantToken = crypto.randomBytes(32).toString('hex')
  const grantTokenHash = crypto.createHash('sha256').update(grantToken).digest('hex')
  const grantTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes to change password

  await query(
    'UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE id = $3',
    [grantTokenHash, grantTokenExpiresAt, user.id]
  )

  return res.json({ grant_token: grantToken })
})

// Reset Password (now uses a grant_token)
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const schema = z.object({
    token: z.string().min(1), // This is now the grant_token
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues })

  const { token, password } = parsed.data
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const { rows } = await query(
    'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires_at > NOW()',
    [hashedToken]
  )
  const user = rows[0]

  if (!user) {
    return res.status(400).json({ error: 'Token is invalid or has expired. Please try again.' })
  }

  const newPasswordHash = await bcrypt.hash(password, 12)
  await query(
    'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires_at = NULL, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, user.id]
  )

  return res.json({ message: 'Password has been reset successfully.' })
})

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

app.patch('/api/users/me', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user

  const schema = z.object({
    name:          z.string().min(2).optional(),
    avatar_url:    z.string().url().optional(),
    first_name:    z.string().optional(),
    last_name:     z.string().optional(),
    phone:         z.string().optional(),
    address_line1: z.string().optional(),
    city:          z.string().optional(),
    zip_code:      z.string().optional(),
    country:       z.string().optional(),
  }).strip()               // ignore any extra keys

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues })

  const updates = parsed.data
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nothing to update' })

  // Build dynamic UPDATE … SET … WHERE id = $n
  const setParts = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`)
  const values    = [...Object.values(updates), userId]

  const sql = `
    UPDATE users
    SET ${setParts.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING *
  `
  const { rows } = await query(sql, values)

  // ---- recalc profile completion ----
  await calculateAndUpdateProfileCompletion(userId)

  return res.json({ user: publicUser(rows[0]) })
})
// Change Password
app.patch('/api/users/me/password', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues })
  }

  const { currentPassword, newPassword } = parsed.data

  const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId])
  const user = rows[0]

  if (!user || !user.password_hash) {
    return res.status(400).json({ error: 'Password change is not available for this account (e.g., Google Sign-In).' })
  }

  const ok = await bcrypt.compare(currentPassword, user.password_hash)
  if (!ok) return res.status(400).json({ error: 'Incorrect current password.' })

  const newPasswordHash = await bcrypt.hash(newPassword, 12)
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, userId])

  return res.status(200).json({ message: 'Password updated successfully.' })
})

// Delete User Account
app.delete('/api/users/me', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user

  try {
    // The database schema should ideally use ON DELETE CASCADE for this.
    // To be safe, we explicitly delete related data first.
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId])
    await query('DELETE FROM users WHERE id = $1', [userId])

    clearAuthCookie(res)
    res.status(200).json({ message: 'Account deleted successfully' })
  } catch (e) {
    console.error('Failed to delete account:', e)
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

// ============================================
// CART ROUTES
// ============================================

// Cart - Get cart items
app.get('/api/cart', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user
  const { rows } = await query(`
    SELECT p.id, p.name, p.price::float, p.img, ci.qty
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = $1
  `, [userId])
  return res.json({ items: rows })
})

// Cart - Add item to cart
app.post('/api/cart', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user
  const schema = z.object({
    productId: z.string().min(1),
    qty: z.number().int().positive().optional().default(1)
  })
  const parsed = schema.safeParse(req.body)
  if(!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues })

  const { productId, qty } = parsed.data

  // Use INSERT ... ON CONFLICT to either insert a new cart item or update the quantity if it already exists.
  const { rows } = await query(`
    INSERT INTO cart_items (user_id, product_id, qty)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET qty = cart_items.qty + $3
    RETURNING (SELECT p.id FROM products p WHERE p.id = $2),
              (SELECT p.name FROM products p WHERE p.id = $2),
              (SELECT p.price::float FROM products p WHERE p.id = $2),
              (SELECT p.img FROM products p WHERE p.id = $2),
              qty
  `, [userId, productId, qty])

  const [ updatedItem ] = rows
  if (!updatedItem) return res.status(404).json({ error: 'Product not found' })

  return res.status(200).json({ item: updatedItem })
})

// Cart - Clear cart
app.delete('/api/cart', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId])
  return res.status(204).send()
})

// ============================================
// ORDERS ROUTES
// ============================================

// Orders - Place a new order
app.post('/api/orders', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user

  const schema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
    paymentMethod: z.string(),
    cardNumber: z.string().optional(),
    expiryMonth: z.string().optional(),
    expiryYear: z.string().optional(),
    cvv: z.string().optional(),
    cardHolderName: z.string().optional(),
    total: z.number().positive(),
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      qty: z.number().positive()
    })).min(1)
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    console.error('Order validation failed:', parsed.error.issues)
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues })
  }

  const {
    fullName,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,
    total,
    items
  } = parsed.data

  try {
    await query('BEGIN')

    // Insert order
    const { rows: orderRows } = await query(`
      INSERT INTO orders (
        user_id, full_name, email, phone, address_line1, address_line2,
        city, state, zip_code, country, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING order_id
    `, [
      userId,
      fullName,
      email,
      phone || null,
      addressLine1,
      addressLine2 || null,
      city,
      state,
      zipCode,
      country,
      total
    ])

    const orderId = orderRows[0].order_id

    // Insert order items
    for (const item of items) {
      await query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
      `, [orderId, item.id, item.name, item.qty, item.price])
    }

    // Clear cart after successful order
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId])

    await query('COMMIT')

    console.log('Order placed successfully:', orderId)
    return res.json({ success: true, orderId, id: orderId })
  } catch (error) {
    await query('ROLLBACK')
    console.error('Order placement failed:', error)
    return res.status(500).json({ error: 'Failed to place order', details: error.message })
  }
})

// Orders - Get user's order history
app.get('/api/orders', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user
  
  try {
    const { rows } = await query(`
      SELECT o.order_id, o.full_name, o.email, o.total_amount, o.order_date as created_at, o.state,
             json_agg(json_build_object(
               'id', oi.product_id,
               'name', oi.product_name,
               'price', oi.price,
               'qty', oi.quantity
             )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
    `, [userId])
    
    return res.json({ orders: rows })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ============================================
// REWARDS ROUTES
// ============================================

// Get all available rewards
app.get('/api/rewards', async (req, res) => {
  try {
    const { rows } = await query('SELECT id, name, description, price FROM rewards ORDER BY price ASC');
    res.json({ rewards: rows });
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Get rewards unlocked by the current user
app.get('/api/user/rewards', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user;
  try {
    const { rows } = await query('SELECT reward_id FROM user_unlocked_rewards WHERE user_id = $1', [userId]);
    res.json({ unlockedRewardIds: rows.map(r => r.reward_id) });
  } catch (error) {
    console.error('Failed to fetch user rewards:', error);
    res.status(500).json({ error: 'Failed to fetch user rewards' });
  }
});

// Purchase a reward
app.post('/api/user/rewards', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user;
  const { rewardId } = req.body;

  if (!rewardId) {
    return res.status(400).json({ error: 'Reward ID is required.' });
  }

  try {
    await query('BEGIN');

    // 1. Get reward price and user tokens
    const { rows: rewardRows } = await query('SELECT price FROM rewards WHERE id = $1', [rewardId]);
    const { rows: userRows } = await query('SELECT tokens FROM users WHERE id = $1 FOR UPDATE', [userId]);

    if (rewardRows.length === 0) throw new Error('Reward not found.');
    if (userRows.length === 0) throw new Error('User not found.');

    const price = rewardRows[0].price;
    const userTokens = userRows[0].tokens;

    if (userTokens < price) throw new Error('Not enough tokens.');

    // 2. Deduct tokens and grant reward
    await query('UPDATE users SET tokens = tokens - $1 WHERE id = $2', [price, userId]);
    await query('INSERT INTO user_unlocked_rewards (user_id, reward_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, rewardId]);

    await query('COMMIT');
    res.status(201).json({ success: true, message: 'Reward unlocked!' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Failed to purchase reward:', error);
    res.status(400).json({ error: error.message || 'Failed to purchase reward.' });
  }
});

// ============================================
// GAMIFICATION ROUTES
// ============================================

// Gamification: Get user stats
app.get('/api/gamification/stats', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user
  const { rows } = await query('SELECT points, tokens FROM users WHERE id = $1', [userId])
  if (!rows[0]) return res.status(404).json({ error: 'User not found' })
  return res.json(rows[0])
})

// Gamification: Check if daily quiz is available
app.get('/api/quiz/status', authMiddleware, async (req, res) => {
  const { sub: userId } = req.user;
  try {
    const { rows } = await query(
      `SELECT 1 FROM user_activity_log
       WHERE user_id = $1
       AND activity_type = 'daily_quiz'
       AND created_at >= NOW() - INTERVAL '24 hours'`,
      [userId]
    );
    const canTakeQuiz = rows.length === 0;
    res.json({ canTakeQuiz });
  } catch (e) {
    console.error('Failed to get quiz status:', e);
    res.status(500).json({ error: 'Failed to get quiz status' });
  }
});

// ============================================
// DEBUG ROUTE (optional - remove in production)
// ============================================
console.log('Registering routes...')

// Test route
app.get('/api/orders/test', (req, res) => {
  res.json({ message: 'Orders endpoint is working!' })
})

// ============================================
// HIGH SCORE & ACTIVITY ROUTES (consolidated)
// ============================================

/**
 * @route   GET /api/user/highscore/:gameType
 * @desc    Get the high score for the current user for a specific game
 * @access  Private
 */
app.get('/api/user/highscore/:gameType', authMiddleware, async (req, res) => {
  const { gameType } = req.params;
  const userId = req.user.sub; // Correctly get user ID from authMiddleware

  if (!gameType) {
    return res.status(400).json({ error: 'Game type is required.' });
  }

  try {
    const result = await query( // Using the existing query helper
      'SELECT high_score FROM user_high_scores WHERE user_id = $1 AND game_type = $2',
      [userId, gameType]
    );

    const highScore = result.rows.length > 0 ? result.rows[0].high_score : 0;
    res.status(200).json({ gameType, highScore: Number(highScore) });
  } catch (error) {
    console.error('Error fetching high score:', error);
    res.status(500).json({ error: 'Failed to fetch high score.' });
  }
});

/**
 * @route   POST /api/activity/log
 * @desc    Log user activity, earn points/tokens, and update high score
 * @access  Private
 */
app.post('/api/activity/log', authMiddleware, async (req, res) => {
  const { type, pointsEarned, tokensEarned = 0 } = req.body;
  const userId = req.user.sub; // Correctly get user ID from authMiddleware

  if (!type || pointsEarned == null) {
    return res.status(400).json({ error: 'Missing required activity data: type and pointsEarned are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Log the general activity
    await client.query(
      `INSERT INTO user_activity_log (user_id, activity_type, points_earned, tokens_earned) VALUES ($1, $2, $3, $4)`,
      [userId, type, pointsEarned, tokensEarned]
    );

    // 2. Update user's total points and tokens
    await client.query(
      `UPDATE users SET points = points + $1, tokens = tokens + $2 WHERE id = $3`,
      [pointsEarned, tokensEarned, userId]
    );

    // 3. Insert or Update the high score if the new score is higher
    await client.query(
      `INSERT INTO user_high_scores (user_id, game_type, high_score)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, game_type)
       DO UPDATE SET high_score = EXCLUDED.high_score
       WHERE user_high_scores.high_score < EXCLUDED.high_score`,
      [userId, type, pointsEarned]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Activity logged successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity.' });
  } finally {
    client.release();
  }
});

// ============================================
// LEADERBOARD ROUTES
// ============================================

/**
 * @route   GET /api/leaderboard
 * @desc    Get global leaderboard (all games combined, based on total XP)
 * @access  Public
 */
app.get('/api/leaderboard', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 1000);

  try {
    // Get all ranked game types
    const rankedGameTypes = [
      'notefall_game',
      'melodic_memory_game',
      'scale_runner_game',
      'chord_builder_game',
      'chord_challenge_game',
      'rhythm_master_game'
    ];

    const { rows } = await query(`
      SELECT 
        u.id,
        u.name,
        u.avatar_url,
        COALESCE(SUM(ual.points_earned), 0)::BIGINT as total_xp,
        COUNT(ual.id) as games_played,
        MAX(ual.created_at) as last_played
      FROM users u
      INNER JOIN user_activity_log ual ON u.id = ual.user_id 
        AND ual.activity_type = ANY($1::TEXT[])
      GROUP BY u.id, u.name, u.avatar_url
      HAVING COALESCE(SUM(ual.points_earned), 0) > 0
      ORDER BY total_xp DESC, last_played DESC
      LIMIT $2
    `, [rankedGameTypes, limit]);

    // Get current user's rank if authenticated
    let userRank = null;
    let userEntry = null;
    const token = req.cookies[process.env.COOKIE_NAME || 'harmoniq_jwt'];
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.sub;
        const { rows: rankRows } = await query(`
          WITH ranked_users AS (
          SELECT 
            u.id,
            u.name,
            u.avatar_url,
            COALESCE(SUM(ual.points_earned), 0)::BIGINT as total_xp,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ual.points_earned), 0) DESC, MAX(ual.created_at) DESC) as rank
          FROM users u
          INNER JOIN user_activity_log ual ON u.id = ual.user_id 
            AND ual.activity_type = ANY($1::TEXT[])
          GROUP BY u.id, u.name, u.avatar_url
          HAVING COALESCE(SUM(ual.points_earned), 0) > 0
          )
          SELECT *, total_xp FROM ranked_users WHERE id = $2
        `, [rankedGameTypes, userId]);

        if (rankRows.length > 0) {
          userRank = rankRows[0].rank;
          userEntry = {
            rank: userRank,
            id: rankRows[0].id,
            name: rankRows[0].name,
            avatar_url: rankRows[0].avatar_url,
            total_xp: rankRows[0].total_xp
          };
        }
      } catch (e) {
        // Invalid token, ignore
      }
    }

    res.json({ 
      leaderboard: rows.map((row, index) => ({
        rank: index + 1,
        id: row.id,
        name: row.name,
        avatar_url: row.avatar_url,
        total_xp: Number(row.total_xp),
        games_played: Number(row.games_played),
        last_played: row.last_played
      })),
      userRank,
      userEntry
    });
  } catch (error) {
    console.error('Failed to fetch global leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

/**
 * @route   GET /api/leaderboard/:gameType
 * @desc    Get leaderboard for a specific game type (based on total XP earned)
 * @access  Public
 */
app.get('/api/leaderboard/:gameType', async (req, res) => {
  const { gameType } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 100, 1000); // Max 1000 entries

  try {
    const { rows } = await query(`
      SELECT 
        u.id,
        u.name,
        u.avatar_url,
        COALESCE(SUM(ual.points_earned), 0)::BIGINT as total_xp,
        COUNT(ual.id) as games_played,
        MAX(ual.created_at) as last_played
      FROM users u
      INNER JOIN user_activity_log ual ON u.id = ual.user_id AND ual.activity_type = $1
      GROUP BY u.id, u.name, u.avatar_url
      HAVING COALESCE(SUM(ual.points_earned), 0) > 0
      ORDER BY total_xp DESC, last_played DESC
      LIMIT $2
    `, [gameType, limit]);

    // Get current user's rank if authenticated
    let userRank = null;
    let userEntry = null;
    const token = req.cookies[process.env.COOKIE_NAME || 'harmoniq_jwt'];
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.sub;
        const { rows: rankRows } = await query(`
          WITH ranked_users AS (
          SELECT 
            u.id,
            u.name,
            u.avatar_url,
            COALESCE(SUM(ual.points_earned), 0)::BIGINT as total_xp,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ual.points_earned), 0) DESC, MAX(ual.created_at) DESC) as rank
          FROM users u
          INNER JOIN user_activity_log ual ON u.id = ual.user_id AND ual.activity_type = $1
          GROUP BY u.id, u.name, u.avatar_url
          HAVING COALESCE(SUM(ual.points_earned), 0) > 0
          )
          SELECT *, total_xp FROM ranked_users WHERE id = $2
        `, [gameType, userId]);

        if (rankRows.length > 0) {
          userRank = rankRows[0].rank;
          userEntry = {
            rank: userRank,
            id: rankRows[0].id,
            name: rankRows[0].name,
            avatar_url: rankRows[0].avatar_url,
            total_xp: rankRows[0].total_xp
          };
        }
      } catch (e) {
        // Invalid token, ignore
      }
    }

    res.json({ 
      gameType,
      leaderboard: rows.map((row, index) => ({
        rank: index + 1,
        id: row.id,
        name: row.name,
        avatar_url: row.avatar_url,
        total_xp: Number(row.total_xp),
        games_played: Number(row.games_played),
        last_played: row.last_played
      })),
      userRank,
      userEntry
    });
  } catch (error) {
    console.error('Failed to fetch game leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`)
  console.log('Available routes:')
  app._router.stack.forEach(r => {
    if (r.route && r.route.path) {
      console.log(`  ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`)
    }
  })
})