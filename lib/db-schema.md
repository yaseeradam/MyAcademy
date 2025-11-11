# Database Schema Documentation

## Collections

### 1. users
```javascript
{
  id: UUID,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['developer', 'school_admin', 'teacher', 'parent'],
  schoolId: UUID (null for developer),
  phoneNumber: String,
  address: String,
  profileImage: String (URL),
  active: Boolean,
  createdAt: ISO Date,
  updatedAt: ISO Date,
  deletedAt: ISO Date,
  lastLogin: ISO Date,
  sessions: Array [{
    sessionId: UUID,
    deviceInfo: String,
    ipAddress: String,
    loginAt: ISO Date,
    lastActivity: ISO Date
  }]
}
```

### 2. schools
```javascript
{
  id: UUID,
  name: String,
  adminId: UUID,
  logo: String (URL),
  theme: Object {
    primaryColor: String,
    secondaryColor: String
  },
  active: Boolean,
  subscription: Object {
    plan: Enum ['trial', 'monthly', 'yearly'],
    status: Enum ['active', 'expired', 'cancelled'],
    startDate: ISO Date,
    endDate: ISO Date,
    paymentMethod: String,
    lastPaymentDate: ISO Date,
    nextBillingDate: ISO Date
  },
  createdAt: ISO Date,
  updatedAt: ISO Date,
  deletedAt: ISO Date
}
```

### 3. school_settings
```javascript
{
  schoolId: UUID,
  schoolName: String,
  logo: String (URL),
  primaryColor: String,
  secondaryColor: String,
  address: String,
  phoneNumber: String,
  email: String,
  website: String,
  timezone: String,
  academicYear: String,
  updatedAt: ISO Date
}
```

### 4. students
```javascript
{
  id: UUID,
  schoolId: UUID,
  firstName: String,
  lastName: String,
  email: String,
  dateOfBirth: ISO Date,
  gender: Enum ['male', 'female', 'other'],
  address: String,
  phoneNumber: String,
  parentId: UUID,
  classId: UUID,
  admissionNumber: String (unique per school),
  admissionDate: ISO Date,
  emergencyContact: String,
  profileImage: String (URL),
  bloodGroup: String,
  medicalInfo: String,
  active: Boolean,
  createdAt: ISO Date,
  updatedAt: ISO Date,
  deletedAt: ISO Date
}
```

### 5. teachers
```javascript
{
  id: UUID,
  schoolId: UUID,
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  address: String,
  qualification: String,
  experience: String,
  specialization: String,
  dateOfJoining: ISO Date,
  employeeId: String (unique per school),
  profileImage: String (URL),
  active: Boolean,
  createdAt: ISO Date,
  updatedAt: ISO Date,
  deletedAt: ISO Date
}
```

### 6. classes
```javascript
{
  id: UUID,
  schoolId: UUID,
  name: String,
  description: String,
  capacity: Number,
  academicYear: String,
  classTeacherId: UUID,
  active: Boolean,
  createdAt: ISO Date,
  updatedAt: ISO Date,
  deletedAt: ISO Date
}
```

### 7. subjects
```javascript
{
  id: UUID,
  schoolId: UUID,
  name: String,
  code: String (unique per school),
  description: String,
  credits: Number,
  active: Boolean,
  createdAt: ISO Date,
  updatedAt: ISO Date,
  deletedAt: ISO Date
}
```

### 8. teacher_assignments
```javascript
{
  id: UUID,
  schoolId: UUID,
  teacherId: UUID,
  classId: UUID,
  subjectId: UUID,
  subjectName: String,
  className: String,
  active: Boolean,
  createdAt: ISO Date
}
```

### 9. attendance
```javascript
{
  id: UUID,
  schoolId: UUID,
  studentId: UUID,
  classId: UUID,
  date: ISO Date,
  status: Enum ['present', 'absent', 'late', 'excused'],
  markedBy: UUID,
  remarks: String,
  createdAt: ISO Date
}
```

### 10. notifications
```javascript
{
  id: UUID,
  schoolId: UUID,
  recipientId: UUID,
  senderId: UUID,
  title: String,
  message: String,
  type: Enum ['announcement', 'attendance', 'assignment', 'message', 'payment', 'system'],
  priority: Enum ['low', 'medium', 'high'],
  read: Boolean,
  readAt: ISO Date,
  actionUrl: String,
  metadata: Object,
  createdAt: ISO Date
}
```

### 11. chat_conversations
```javascript
{
  id: UUID,
  schoolId: UUID,
  type: Enum ['private', 'group'],
  name: String (for groups),
  participants: Array [UUID],
  createdBy: UUID,
  status: Enum ['pending', 'approved', 'rejected'],
  lastMessageAt: ISO Date,
  createdAt: ISO Date,
  updatedAt: ISO Date
}
```

### 12. chat_messages
```javascript
{
  id: UUID,
  conversationId: UUID,
  schoolId: UUID,
  senderId: UUID,
  messageType: Enum ['text', 'image', 'file', 'voice', 'video'],
  content: String,
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  read: Boolean,
  readBy: Array [UUID],
  createdAt: ISO Date,
  deletedAt: ISO Date
}
```

### 13. payments
```javascript
{
  id: UUID,
  schoolId: UUID,
  amount: Number,
  currency: String,
  plan: Enum ['monthly', 'yearly'],
  status: Enum ['pending', 'completed', 'failed', 'refunded'],
  paymentMethod: String,
  paymentGateway: Enum ['stripe', 'paystack'],
  transactionId: String,
  invoiceUrl: String,
  metadata: Object,
  createdAt: ISO Date,
  completedAt: ISO Date
}
```

### 14. gamification_points
```javascript
{
  id: UUID,
  schoolId: UUID,
  userId: UUID,
  userType: Enum ['student', 'teacher', 'parent'],
  points: Number,
  reason: String,
  category: Enum ['attendance', 'performance', 'engagement', 'communication'],
  metadata: Object,
  createdAt: ISO Date
}
```

### 15. gamification_badges
```javascript
{
  id: UUID,
  schoolId: UUID,
  userId: UUID,
  userType: Enum ['student', 'teacher', 'parent'],
  badgeType: String,
  badgeName: String,
  badgeIcon: String (URL),
  description: String,
  earnedAt: ISO Date
}
```

### 16. gamification_leaderboards
```javascript
{
  id: UUID,
  schoolId: UUID,
  period: Enum ['daily', 'weekly', 'monthly', 'yearly'],
  category: Enum ['attendance', 'performance', 'engagement'],
  rankings: Array [{
    userId: UUID,
    userName: String,
    userType: String,
    score: Number,
    rank: Number
  }],
  generatedAt: ISO Date
}
```

### 17. announcements
```javascript
{
  id: UUID,
  schoolId: UUID,
  createdBy: UUID,
  title: String,
  content: String,
  targetAudience: Array [Enum ['all', 'teachers', 'parents', 'students']],
  priority: Enum ['low', 'medium', 'high'],
  attachments: Array [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  publishedAt: ISO Date,
  expiresAt: ISO Date,
  createdAt: ISO Date
}
```

### 18. reports
```javascript
{
  id: UUID,
  schoolId: UUID,
  reportType: Enum ['attendance', 'performance', 'financial', 'custom'],
  generatedBy: UUID,
  parameters: Object,
  fileUrl: String,
  format: Enum ['pdf', 'excel', 'csv'],
  status: Enum ['generating', 'completed', 'failed'],
  createdAt: ISO Date,
  completedAt: ISO Date
}
```

### 19. file_uploads
```javascript
{
  id: UUID,
  schoolId: UUID,
  uploadedBy: UUID,
  fileName: String,
  fileUrl: String,
  fileType: String,
  fileSize: Number,
  category: Enum ['profile', 'document', 'assignment', 'chat', 'report'],
  metadata: Object,
  createdAt: ISO Date
}
```

### 20. user_sessions
```javascript
{
  id: UUID,
  userId: UUID,
  deviceInfo: Object {
    type: String, // 'desktop', 'mobile', 'tablet'
    browser: String,
    os: String,
    platform: String
  },
  ipAddress: String,
  location: String, // City, Country or 'Unknown'
  userAgent: String,
  createdAt: ISO Date,
  lastActivity: ISO Date,
  expiresAt: ISO Date,
  active: Boolean,
  terminatedAt: ISO Date,
  terminatedBy: UUID
}
```

### 21. system_logs
```javascript
{
  id: UUID,
  schoolId: UUID,
  userId: UUID,
  action: String,
  entityType: String,
  entityId: UUID,
  changes: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: ISO Date
}
```

## Indexes

### users
- email (unique)
- schoolId + role
- schoolId + active

### students
- schoolId + admissionNumber (unique)
- schoolId + classId
- schoolId + parentId
- schoolId + active

### teachers
- schoolId + employeeId (unique)
- schoolId + active

### attendance
- schoolId + studentId + date
- schoolId + classId + date
- schoolId + date

### chat_messages
- conversationId + createdAt
- schoolId + senderId

### notifications
- schoolId + recipientId + read
- schoolId + recipientId + createdAt

### payments
- schoolId + status
- schoolId + createdAt

### gamification_points
- schoolId + userId + createdAt
- schoolId + userType + points
