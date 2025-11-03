console.log('PG env:', process.env.PGHOST, process.env.PGDATABASE, process.env.PGUSER, typeof process.env.PGPASSWORD)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { query } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function migrate(){
  try {
    // Ensure pgcrypto for gen_random_uuid
    await query('CREATE EXTENSION IF NOT EXISTS pgcrypto;')
    const schemaPath = path.join(__dirname, 'schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    await query(sql)
    // Seed data
    await query(`
      INSERT INTO categories (id, name) VALUES
        ('guitars','Guitars'),
        ('keyboards','Keyboards'),
        ('drums','Drums'),
        ('accessories','Accessories')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO products (id, name, price, category_id, img, specs) VALUES
        ('gtr-neo','Neo Strat Electric Guitar', 499, 'guitars', 'https://www.bajaao.com/cdn/shop/files/fgn-electric-guitars-faded-cherry-burst-fgn-nls10rfm-neo-classic-series-6-string-electric-guitar-33861569773747.jpg?v=1700817705&width=1000', ARRAY['Alder body','Maple neck','HSS pickups']),
        ('gtr-jazz','Jazz Classic Hollowbody', 899, 'guitars', 'https://cloudadmin.rockshop.co.nz/media/catalog/product/b/o/boss2_25.jpg?width=369', ARRAY['Maple body','Hollow design','Warm humbuckers']),
        ('key-pro','Pro Stage Keyboard 88', 1199, 'keyboards', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPdJif7ZE2vZh9AI2UnqRXB6voD_xZaN0gKw&s', ARRAY['88 keys','Weighted action','256 voices']),
        ('drm-fusion','Fusion Drum Kit', 1299, 'drums', 'https://acemusic.in/cdn/shop/products/1_719c0549-ccce-4512-acef-7db39c050f0e.png?v=1682238737', ARRAY['Birch shells','20" kick','Hardware included']),
        ('acc-stand','Adjustable Guitar Stand', 39, 'accessories', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI5MPeJm0pnsm4mBo42EMr1da87gwmA68xiw&s', ARRAY['Foldable','Non-slip','Universal'])
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO instruments (id, name) VALUES
        ('guitar','Guitar'),
        ('piano','Piano'),
        ('drums','Drums'),
        ('violin','Violin'),
        ('voice','Voice')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO courses (id, instrument_id, level, duration, price, summary) VALUES
        ('gtr-beginner','guitar','Beginner','8 weeks',199,'Foundations: chords, rhythm, and your first songs.'),
        ('gtr-adv','guitar','Advanced','10 weeks',349,'Modes, improvisation, and advanced techniques.'),
        ('pno-int','piano','Intermediate','10 weeks',299,'Scales, arpeggios, and expressive playing.'),
        ('drm-beginner','drums','Beginner','8 weeks',219,'Grooves, fills, and coordination.')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO instructors (id, name, instrument_id, bio, img) VALUES
        ('erin','Erin Park','piano','Concert pianist with 12 years of teaching.','https://www.rollingstone.com/wp-content/uploads/2018/06/rs-18737-zimmer-1800-1397663777.jpg?w=1581&h=1054&crop=1'),
        ('leo','Leo Martins','guitar','Session guitarist and touring musician.','https://sheeranguitars.com/cdn/shop/files/Ed_-_Belfast049_EDIT2_1296x864_crop_center.jpg?v=1655734872'),
        ('nina','Nina Patel','voice','Vocal coach specializing in pop technique.','https://www.therevolverclub.com/cdn/shop/articles/Shreya_Ghoshal_s_Journey.jpg?v=1700559084&width=1366')
      ON CONFLICT (id) DO NOTHING;
    `)
    console.log('Migration and seed complete')
    process.exit(0)
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }
}

migrate()

