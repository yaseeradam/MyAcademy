const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
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

const MONGO_URL = envVars.MONGO_URL || 'mongodb+srv://schooladmin:prince.yk0Q@cluster0.toicg4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const DB_NAME = envVars.DB_NAME || 'school_management_db'

async function initializeDatabase() {
  const client = new MongoClient(MONGO_URL)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    
    // Initialize subscription plans
    const existingPlans = await db.collection('subscription_plans').countDocuments()
    
    if (existingPlans === 0) {
      console.log('Creating default subscription plans...')
      
      const plans = [
        {
          id: uuidv4(),
          name: 'Starter',
          description: 'Perfect for small schools getting started',
          price: 29.99,
          currency: 'usd',
          duration: 1,
          features: [
            'Up to 100 students',
            'Basic attendance tracking',
            'Parent communication',
            'Basic reports',
            '1GB storage',
            'Email support'
          ],
          maxUsers: 100,
          maxStorage: 1024, // 1GB in MB
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'Professional',
          description: 'Ideal for growing schools with advanced needs',
          price: 59.99,
          currency: 'usd',
          duration: 1,
          features: [
            'Up to 500 students',
            'Advanced attendance tracking',
            'Parent & teacher communication',
            'Advanced reports & analytics',
            'Gradebook management',
            'Assignment tracking',
            '5GB storage',
            'Priority email support',
            'Chat system'
          ],
          maxUsers: 500,
          maxStorage: 5120, // 5GB in MB
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'Enterprise',
          description: 'Complete solution for large educational institutions',
          price: 99.99,
          currency: 'usd',
          duration: 1,
          features: [
            'Unlimited students',
            'Full attendance management',
            'Complete communication suite',
            'Advanced analytics & insights',
            'Custom reports',
            'Gradebook & assessments',
            'Assignment & homework tracking',
            'Gamification system',
            'Unlimited storage',
            '24/7 phone & email support',
            'Custom integrations',
            'API access'
          ],
          maxUsers: 999999,
          maxStorage: 999999, // Unlimited
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      await db.collection('subscription_plans').insertMany(plans)
      console.log('✅ Subscription plans created successfully')
    } else {
      console.log('✅ Subscription plans already exist')
    }
    
    // Check if developer account exists
    const existingDev = await db.collection('users').findOne({ role: 'developer' })
    
    if (!existingDev) {
      console.log('Creating default developer account...')
      
      const hashedPassword = await bcrypt.hash('dev123', 10)
      const developer = {
        id: uuidv4(),
        name: 'System Developer',
        email: 'dev@system.com',
        password: hashedPassword,
        role: 'developer',
        createdAt: new Date().toISOString(),
        active: true
      }
      
      await db.collection('users').insertOne(developer)
      console.log('✅ Developer account created: dev@system.com / dev123')
    } else {
      console.log('✅ Developer account already exists')
    }
    
    // Create indexes for better performance
    console.log('Creating database indexes...')
    
    const indexes = [
      { collection: 'users', index: { email: 1 }, options: { unique: true } },
      { collection: 'users', index: { schoolId: 1 } },
      { collection: 'students', index: { schoolId: 1 } },
      { collection: 'teachers', index: { schoolId: 1 } },
      { collection: 'classes', index: { schoolId: 1 } },
      { collection: 'subjects', index: { schoolId: 1 } },
      { collection: 'attendance', index: { schoolId: 1, date: 1, studentId: 1 } },
      { collection: 'notifications', index: { recipientId: 1, schoolId: 1 } },
      { collection: 'payments', index: { schoolId: 1 } },
      { collection: 'chat_conversations', index: { schoolId: 1, participants: 1 } },
      { collection: 'chat_messages', index: { conversationId: 1, schoolId: 1 } },
      { collection: 'chat_messages', index: { conversationId: 1, createdAt: 1 } },
      { collection: 'student_scores', index: { schoolId: 1, studentId: 1, classId: 1, subjectId: 1 }, options: { unique: true } },
      { collection: 'student_scores', index: { schoolId: 1, classId: 1, subjectId: 1 } },
      { collection: 'student_scores', index: { schoolId: 1, teacherId: 1, createdAt: 1 } }
    ]
    
    for (const { collection, index, options } of indexes) {
      try {
        await db.collection(collection).createIndex(index, options || {})
        console.log(`✅ Index created for ${collection}`)
      } catch (error) {
        if (error.code === 11000 || error.codeName === 'IndexOptionsConflict') {
          console.log(`ℹ️  Index already exists for ${collection}`)
        } else {
          console.log(`⚠️  Could not create index for ${collection}:`, error.message)
        }
      }
    }
    
    console.log('✅ Database indexes setup completed')
    
    console.log('\n🎉 Database initialization completed successfully!')
    console.log('\nDefault credentials:')
    console.log('Developer: dev@system.com / dev123')
    console.log('\nNext steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Visit http://localhost:3000')
    console.log('3. Login with developer credentials')
    console.log('4. Create your first school from the developer dashboard')
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
  } finally {
    await client.close()
  }
}

// Run initialization
initializeDatabase()