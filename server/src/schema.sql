-- Add columns for password reset if they don't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_reset_token') THEN
    ALTER TABLE users ADD COLUMN password_reset_token TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_reset_expires_at') THEN
    ALTER TABLE users ADD COLUMN password_reset_expires_at TIMESTAMPTZ;
  END IF;
  -- Gamification Fields
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='points') THEN
    ALTER TABLE users ADD COLUMN points BIGINT DEFAULT 0;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tokens') THEN
    ALTER TABLE users ADD COLUMN tokens INT DEFAULT 0;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') THEN
    ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
  END IF;
END $$;
<<<<<<< HEAD
-- ==== PROFILE COLUMNS (run once) ====
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_name') THEN
    ALTER TABLE users ADD COLUMN first_name TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_name') THEN
    ALTER TABLE users ADD COLUMN last_name TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address_line1') THEN
    ALTER TABLE users ADD COLUMN address_line1 TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='city') THEN
    ALTER TABLE users ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='zip_code') THEN
    ALTER TABLE users ADD COLUMN zip_code TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='country') THEN
    ALTER TABLE users ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='profile_completed') THEN
    ALTER TABLE users ADD COLUMN profile_completed INTEGER DEFAULT 0;
  END IF;
END $$;
=======
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('password','google')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sessions table (optional for blacklisting/management)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  jwt_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Product catalog
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  img TEXT,
  specs TEXT[] DEFAULT '{}'
);

-- Lessons catalog
CREATE TABLE IF NOT EXISTS instruments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  instrument_id TEXT NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  summary TEXT
);

CREATE TABLE IF NOT EXISTS instructors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instrument_id TEXT NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
  bio TEXT,
  img TEXT
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- Gamification Tables
CREATE TABLE IF NOT EXISTS levels (
  level INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  points_required BIGINT NOT NULL,
  reward INTEGER DEFAULT 5
);

-- Populate levels if it's empty
INSERT INTO levels (level, name, points_required, reward) VALUES
  (1, 'Beginner', 0, 5),
  (2, 'Novice', 1000, 5),
  (3, 'Apprentice', 2500, 5),
  (4, 'Adept', 5000, 5),
  (5, 'Virtuoso', 10000, 5),
  (6, 'Expert', 20000, 5),
  (7, 'Master', 40000, 5),
  (8, 'Grandmaster', 80000, 5),
  (9, 'Legend', 150000, 5),
  (10, 'Maestro', 300000, 50)
ON CONFLICT (level) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    points_earned INTEGER,
    tokens_earned NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
<<<<<<< HEAD
);

-- Order processing tables
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to a user if they are logged in
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE, -- Ensures items are deleted if the order is
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(12, 2) NOT NULL
);

-- ==== REWARDS SYSTEM ====
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS user_unlocked_rewards (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, reward_id)
);

-- Seed rewards
INSERT INTO rewards (id, name, description, price) VALUES
  ('game_chord_builder', 'Chord Builder Game', 'Unlock the Chord Builder game for Piano ranked mode.', 500),
  ('pack_guitar_chords', 'Guitar Chords Pack', 'Unlocks a set of advanced chord diagrams and lessons for guitar.', 150),
  ('game_rhythm_master', 'Rhythm Master Game', 'Unlock the Rhythm Master challenge for Guitar ranked mode.', 300)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price;

-- ==== SEED A TEST USER WITH MAX LEVEL ====
-- High scores table
CREATE TABLE IF NOT EXISTS user_high_scores (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  high_score BIGINT DEFAULT 0,
  PRIMARY KEY (user_id, game_type)
);

-- This user will have enough points for the highest level (Maestro)
-- and will be set as a Google-authenticated user.
INSERT INTO users (email, name, provider, points, avatar_url, profile_completed)
VALUES ('admin@1000gmail.com', 'Maestro User', 'password', 350000, 'https://api.dicebear.com/8.x/bottts/svg?seed=Maestro', 89)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  points = EXCLUDED.points,
  avatar_url = EXCLUDED.avatar_url,
  profile_completed = EXCLUDED.profile_completed;
=======
);
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
