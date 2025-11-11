const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

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

const MONGO_URL = envVars.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = envVars.DB_NAME || 'school_management';
const JWT_SECRET = envVars.JWT_SECRET || 'your-secret-key';

async function testLogin() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URL:', MONGO_URL);
    console.log('DB_NAME:', DB_NAME);
    
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Test credentials
    const testEmail = 'dev@system.com';
    const testPassword = 'dev123';
    
    console.log('\n--- Testing Login Functionality ---');
    console.log('Test Email:', testEmail);
    console.log('Test Password:', testPassword);
    
    // Find user by email
    console.log('\n1. Searching for user in database...');
    const user = await usersCollection.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found in database');
      
      // Let's check what users exist
      console.log('\n--- Checking existing users ---');
      const allUsers = await usersCollection.find({}).toArray();
      console.log('Total users in database:', allUsers.length);
      
      allUsers.forEach((u, index) => {
        console.log(`User ${index + 1}:`, {
          email: u.email,
          role: u.role,
          hasPassword: !!u.password
        });
      });
      
      return;
    }
    
    console.log('✅ User found:', {
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });
    
    // Test password comparison
    console.log('\n2. Testing password verification...');
    console.log('Stored password hash:', user.password);
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      
      // Let's test if the password was hashed correctly
      console.log('\n--- Testing password hashing ---');
      const testHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash for same password:', testHash);
      
      const testComparison = await bcrypt.compare(testPassword, testHash);
      console.log('Test hash comparison:', testComparison);
      
      return;
    }
    
    console.log('✅ Password verification successful');
    
    // Test JWT token generation
    console.log('\n3. Testing JWT token generation...');
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ JWT token generated successfully');
    console.log('Token payload:', tokenPayload);
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT token verification successful');
    console.log('Decoded token:', decoded);
    
    console.log('\n🎉 All login tests passed! The authentication logic is working correctly.');
    
  } catch (error) {
    console.error('❌ Error during login test:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed');
    }
  }
}

testLogin();