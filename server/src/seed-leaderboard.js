import { query } from './db.js'
import crypto from 'crypto'

// List of game types that should have leaderboard data
const GAME_TYPES = [
  'notefall_game',
  'melodic_memory_game',
  'scale_runner_game',
  'chord_builder_game',
  'chord_challenge_game',
  'rhythm_master_game'
]

// Realistic player names
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Skylar', 'Rowan', 'Sage', 'River', 'Phoenix', 'Dakota', 'Charlie', 'Sam',
  'Blake', 'Cameron', 'Drew', 'Finley', 'Harper', 'Hayden', 'Jamie', 'Jesse',
  'Kai', 'Logan', 'Marley', 'Parker', 'Peyton', 'Reese', 'Sydney', 'Winter'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Allen', 'Young'
]

// Generate a random avatar URL
function generateAvatarUrl(name) {
  const seed = name.replace(/\s/g, '').toLowerCase()
  const styles = ['avataaars', 'bottts', 'personas', 'lorelei', 'notionists', 'adventurer']
  const style = styles[Math.floor(Math.random() * styles.length)]
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`
}

// Generate random score based on difficulty curve
function generateScore(gameType, skillLevel) {
  const baseScores = {
    'notefall_game': { min: 500, max: 15000 },
    'melodic_memory_game': { min: 300, max: 8000 },
    'scale_runner_game': { min: 1000, max: 20000 },
    'chord_builder_game': { min: 400, max: 10000 },
    'chord_challenge_game': { min: 600, max: 12000 },
    'rhythm_master_game': { min: 800, max: 18000 }
  }

  const base = baseScores[gameType] || { min: 500, max: 10000 }
  const range = base.max - base.min
  
  // Skill level affects the score distribution (0-1)
  const skillModifier = Math.pow(skillLevel, 1.5)
  const randomFactor = Math.random() * 0.3 + 0.85 // 0.85 to 1.15
  
  return Math.floor(base.min + (range * skillModifier * randomFactor))
}

// Generate a random date within the last 30 days
function generateRecentDate() {
  const now = Date.now()
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
  const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo)
  return new Date(randomTime)
}

async function seedLeaderboardData() {
  console.log('🎮 Starting leaderboard data seeding...\n')

  try {
    await query('BEGIN')

    // Generate 50 mock players
    const numPlayers = 50
    const players = []

    for (let i = 0; i < numPlayers; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
      const fullName = `${firstName} ${lastName}`
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@harmoniq.mock`
      const avatarUrl = generateAvatarUrl(fullName)
      
      // Assign a skill level (affects score distribution)
      const skillLevel = Math.random() // 0 = beginner, 1 = expert

      // Insert user
      const { rows } = await query(
        `INSERT INTO users (email, name, provider, avatar_url, points, tokens)
         VALUES ($1, $2, 'password', $3, 0, 0)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [email, fullName, avatarUrl]
      )

      players.push({
        id: rows[0].id,
        name: fullName,
        email,
        skillLevel
      })

      console.log(`✓ Created player ${i + 1}/${numPlayers}: ${fullName}`)
    }

    console.log('\n🎯 Generating game activities...\n')

    // Generate game activities for each player
    let totalActivities = 0
    for (const player of players) {
      // Each player plays a random subset of games
      const numGamesPlayed = Math.floor(Math.random() * GAME_TYPES.length) + 1
      const gamesForPlayer = [...GAME_TYPES]
        .sort(() => Math.random() - 0.5)
        .slice(0, numGamesPlayed)

      for (const gameType of gamesForPlayer) {
        // Each player has 1-10 play sessions per game
        const numSessions = Math.floor(Math.random() * 10) + 1

        for (let session = 0; session < numSessions; session++) {
          const pointsEarned = generateScore(gameType, player.skillLevel)
          const tokensEarned = Math.floor(pointsEarned / 100) // 1 token per 100 points
          const playedAt = generateRecentDate()

          // Log activity
          await query(
            `INSERT INTO user_activity_log (user_id, activity_type, points_earned, tokens_earned, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [player.id, gameType, pointsEarned, tokensEarned, playedAt]
          )

          // Update user points and tokens
          await query(
            `UPDATE users SET points = points + $1, tokens = tokens + $2 WHERE id = $3`,
            [pointsEarned, tokensEarned, player.id]
          )

          // Update high score
          await query(
            `INSERT INTO user_high_scores (user_id, game_type, high_score)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, game_type)
             DO UPDATE SET high_score = GREATEST(user_high_scores.high_score, EXCLUDED.high_score)`,
            [player.id, gameType, pointsEarned]
          )

          totalActivities++
        }
      }
    }

    await query('COMMIT')

    console.log(`\n✅ Seeding completed successfully!`)
    console.log(`   • ${numPlayers} players created`)
    console.log(`   • ${totalActivities} game activities logged`)
    console.log(`   • ${GAME_TYPES.length} game types populated\n`)

    // Display summary statistics
    console.log('📊 Leaderboard Summary:\n')
    for (const gameType of GAME_TYPES) {
      const { rows } = await query(
        `SELECT COUNT(DISTINCT user_id) as player_count, MAX(high_score) as top_score
         FROM user_high_scores WHERE game_type = $1`,
        [gameType]
      )
      const stats = rows[0]
      console.log(`   ${gameType}:`)
      console.log(`      Players: ${stats.player_count}`)
      console.log(`      Top Score: ${stats.top_score}\n`)
    }

    // Show top 5 global players
    const { rows: topPlayers } = await query(`
      SELECT u.name, SUM(ual.points_earned)::BIGINT as total_xp
      FROM users u
      JOIN user_activity_log ual ON u.id = ual.user_id
      WHERE ual.activity_type = ANY($1::TEXT[])
      GROUP BY u.id, u.name
      ORDER BY total_xp DESC
      LIMIT 5
    `, [GAME_TYPES])

    console.log('🏆 Top 5 Global Players:\n')
    topPlayers.forEach((player, index) => {
      console.log(`   ${index + 1}. ${player.name} - ${player.total_xp.toLocaleString()} XP`)
    })
    console.log('')

  } catch (error) {
    await query('ROLLBACK')
    console.error('❌ Error seeding leaderboard data:', error)
    throw error
  }
}

// Run the seeding function
seedLeaderboardData()
  .then(() => {
    console.log('🎉 All done! Your leaderboards are now populated.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Failed to seed data:', error)
    process.exit(1)
  })