const { MongoClient } = require('mongodb')
const fs = require('fs')

// Manually load environment variables from .env file
let envVars = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.log('No .env file found, using defaults');
}

const MONGO_URL = envVars.MONGO_URL
const DB_NAME = envVars.DB_NAME || 'school_management_db'

async function migrate() {
  if (!MONGO_URL) {
    console.error('MONGO_URL not found in .env')
    process.exit(1)
  }

  const client = new MongoClient(MONGO_URL)

  try {
    await client.connect()
    console.log('Connected to MongoDB')
    const db = client.db(DB_NAME)

    // 1. Update Schools Collection
    console.log('Updating schools collection...')
    const schools = await db.collection('schools').find({}).toArray()
    
    for (const school of schools) {
      // Set default subscription status for existing schools
      // Using 'grace_period' temporarily so they don't get locked out immediately
      // or 'active' if you want to give them free time
      
      const updateDoc = {
        $set: {
          subscriptionStatus: school.subscriptionStatus || 'trial', // Default to trial for existing
          subscriptionStartDate: school.subscriptionStartDate || new Date().toISOString(),
          // Default 30 days trial if not set
          subscriptionEndDate: school.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          gracePeriodEndDate: school.gracePeriodEndDate || null,
          paymentProvider: 'paystack'
        }
      }

      await db.collection('schools').updateOne({ id: school.id }, updateDoc)
    }
    console.log(`Updated ${schools.length} schools`)

    // 2. Create fee_payments collection if not exists
    console.log('Setting up fee_payments collection...')
    const collections = await db.listCollections({ name: 'fee_payments' }).toArray()
    if (collections.length === 0) {
      await db.createCollection('fee_payments')
      console.log('Created fee_payments collection')
      
      // Create indexes
      await db.collection('fee_payments').createIndex({ schoolId: 1 })
      await db.collection('fee_payments').createIndex({ studentId: 1 })
      await db.collection('fee_payments').createIndex({ parentId: 1 })
      await db.collection('fee_payments').createIndex({ status: 1 })
    } else {
      console.log('fee_payments collection already exists')
    }

    console.log('Migration completed successfully')

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await client.close()
  }
}

migrate()
