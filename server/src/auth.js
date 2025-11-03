import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { query } from './db.js'

const COOKIE_NAME = process.env.COOKIE_NAME || 'harmoniq_jwt'
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || 'Lax'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export function signToken(payload, opts = {}) {
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };

  // Only add jwtid to the options if it exists and is a string
  if (opts.jwtid) {
    options.jwtid = opts.jwtid;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

export function setAuthCookie(res, token){
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
}

export function clearAuthCookie(res){
  res.clearCookie(COOKIE_NAME, { path: '/' })
}

export function authMiddleware(req, res, next){
  const token = req.cookies[COOKIE_NAME]
  if(!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export async function verifyGoogleIdToken(idToken){
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
  const payload = ticket.getPayload()
  return payload
}

export async function findUserByEmail(email){
  const { rows } = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email])
  return rows[0]
}

export async function createUser({ email, name, password, avatar_url, provider }){
  const password_hash = password ? await bcrypt.hash(password, 12) : null
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, name, avatar_url, provider)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, avatar_url, provider, created_at, updated_at`,
     [email, password_hash, name, avatar_url, provider]
  )
  return rows[0]
}

<<<<<<< HEAD
// auth.js  (replace the existing publicUser)
export function publicUser(u){
  if(!u) return null
  const {
    id, email, name, avatar_url, provider,
    first_name, last_name, phone,
    address_line1, city, zip_code, country,
    profile_completed,
    created_at, updated_at
  } = u
  return {
    id, email, name, avatar_url, provider,
    first_name, last_name, phone,
    address_line1, city, zip_code, country,
    profile_completed,
    created_at, updated_at
  }
}

export async function handleGoogleSignIn(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is required.' });
  }

  try {
    // 1. Verify the Google token and get user info
    const payload = await verifyGoogleIdToken(token);
    const { email, name, picture: avatar_url } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google.' });
    }

    // 2. Find an existing user by email
    let user = await findUserByEmail(email);

    // 3. If no user exists, create one
    if (!user) {
      user = await createUser({
        email,
        name,
        avatar_url,
        provider: 'google'
      });
    } else {
      // Optional: If the user exists but has no avatar, update it from Google.
      if (!user.avatar_url && avatar_url) {
        const { rows } = await query(
          'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *',
          [avatar_url, user.id]
        );
        user = rows[0];
      }
    }

    // 4. Create a session token (JWT) and set the cookie
    const jwtToken = signToken({ id: user.id, email: user.email });
    setAuthCookie(res, jwtToken);

    res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(500).json({ message: 'Authentication failed due to a server error.' });
  }
}
=======
export function publicUser(u){
  if(!u) return null
  const { id, email, name, avatar_url, provider, created_at, updated_at } = u
  return { id, email, name, avatar_url, provider, created_at, updated_at }
}

>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
