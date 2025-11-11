// Simple test script to verify broadcast functionality
const io = require('socket.io-client');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_TOKEN = 'your-test-token'; // Replace with actual token

console.log('Testing broadcast functionality...');

// Create socket connection
const socket = io(SERVER_URL, {
  auth: {
    token: TEST_TOKEN
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Test broadcast
  socket.emit('broadcast_notification', {
    title: 'Test Broadcast',
    message: 'This is a test broadcast message',
    targetAudience: ['teachers'],
    priority: 'medium'
  });
});

socket.on('broadcast_sent', (data) => {
  console.log('✅ Broadcast sent successfully:', data);
  process.exit(0);
});

socket.on('error', (error) => {
  console.log('❌ Error:', error);
  process.exit(1);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('❌ Test timeout');
  process.exit(1);
}, 10000);