# EduManage Nigeria - School Management System

A comprehensive School Management System built with Next.js, MongoDB, and modern web technologies. Features multi-tenancy, real-time communication, payments, and gamification.

## 🚀 Features

### ✅ Implemented Features
- **Multi-tenant Architecture** - Support for multiple schools
- **Authentication & Authorization** - JWT-based with role-based access control
- **User Roles**: Developer, School Admin, Teacher, Parent
- **Student Management** - Complete CRUD operations
- **Teacher Management** - Profile management and assignments
- **Parent Management** - Account creation and student linking
- **Class & Subject Management** - Academic structure setup
- **Attendance System** - Mark and track student attendance
- **Real-time Chat System** - Private and group messaging
- **Push Notifications** - Real-time notification delivery
- **Payment Integration** - Stripe and Paystack support
- **Billing Dashboard** - Subscription management
- **Gamification System** - Points, badges, and leaderboards
- **School Settings** - Branding and customization
- **Dashboard Analytics** - Role-based statistics

### 🔄 In Progress
- File Storage (Firebase integration)
- Advanced Reports & Export
- Dark/Light Mode
- Mobile App (Capacitor)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: JWT
- **Payments**: Stripe, Paystack
- **Real-time**: Socket.io
- **UI Components**: Radix UI, Lucide Icons
- **Charts**: Recharts
- **File Processing**: jsPDF, xlsx

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd school_ms
npm install
```

### 2. Environment Setup
Copy the `.env` file and update with your credentials:

```env
# Database
MONGO_URL=your_mongodb_connection_string
DB_NAME=school_management_db

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key

# Payment Providers (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Firebase (Optional - for file storage)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 3. Initialize Database
```bash
npm run init-db
```

This will create:
- Default subscription plans
- Developer account (dev@system.com / dev123)
- Database indexes

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 👥 Default Accounts

After running `npm run init-db`:

- **Developer**: dev@system.com / dev123
- **Demo School Admin**: admin@school.com / admin123 (create via developer dashboard)

## 🏗️ Project Structure

```
school_ms/
├── app/
│   ├── api/                 # API routes
│   │   ├── [[...path]]/     # Main API handler
│   │   ├── payments/        # Payment processing
│   │   ├── gamification/    # Points & badges
│   │   └── reports/         # Report generation
│   ├── globals.css          # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Main application
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── chat/               # Chat system
│   ├── billing/            # Billing dashboard
│   ├── gamification/       # Gamification features
│   └── notifications/      # Notification system
├── lib/                    # Utility functions
├── scripts/
│   └── init-db.js         # Database initialization
└── public/                # Static assets
```

## 🔐 User Roles & Permissions

### Developer (Master Admin)
- Create and manage schools
- View system-wide statistics
- Access all system features

### School Admin
- Manage students, teachers, parents
- Create classes and subjects
- Assign teachers to subjects
- Mark attendance
- View school analytics
- Manage billing and subscriptions

### Teacher
- View assigned classes and subjects
- Mark attendance for assigned classes
- Communicate with parents
- View student information

### Parent
- View children's information
- Check attendance records
- Make payments
- Communicate with teachers

## 💳 Payment Integration

The system supports both Stripe and Paystack for subscription payments:

### Stripe Setup
1. Get API keys from Stripe Dashboard
2. Add to environment variables
3. Configure webhook endpoints

### Paystack Setup
1. Get API keys from Paystack Dashboard
2. Add to environment variables
3. Configure webhook endpoints

## 📱 Real-time Features

- **Chat System**: Private messaging between parents and teachers
- **Notifications**: Real-time updates for assignments, attendance, etc.
- **Live Updates**: Dashboard statistics update in real-time

## 🎮 Gamification

- **Points System**: Earn points for attendance, performance
- **Badges**: Achievement badges for milestones
- **Leaderboards**: Daily, weekly, monthly rankings
- **Streaks**: Attendance streak tracking

## 🔧 Development

### Adding New Features
1. Create API routes in `app/api/`
2. Add UI components in `components/`
3. Update main page logic in `app/page.js`
4. Test with different user roles

### Database Schema
The system uses MongoDB with collections:
- `users` - All user accounts
- `schools` - School information
- `students` - Student records
- `teachers` - Teacher profiles
- `classes` - Class definitions
- `subjects` - Subject catalog
- `attendance` - Attendance records
- `notifications` - System notifications
- `payments` - Payment transactions
- `subscription_plans` - Available plans

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure reverse proxy (nginx)

## 📞 Support

For issues and questions:
1. Check the implementation plan in `IMPLEMENTATION_PLAN.md`
2. Review API documentation
3. Check console logs for errors

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

**EduManage Nigeria** - Empowering Education Through Technology 🎓