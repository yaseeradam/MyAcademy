# API Keys Setup Guide

## Required API Keys for EduManage Nigeria

### Paystack (Primary Payment Gateway)
**Get your keys from:** https://dashboard.paystack.com/#/settings/developers

Replace in `.env`:
```
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

**Paystack supports:**
- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- USSD
- Mobile money
- QR codes

---

### 3. Firebase (File Storage - Optional)
**Setup:**
1. Go to: https://console.firebase.google.com/
2. Create new project or use existing
3. Go to Project Settings > General
4. Scroll to "Your apps" > Web app
5. Copy configuration values

Replace in `.env`:
```
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

**Enable Storage:**
1. In Firebase Console > Storage
2. Click "Get Started"
3. Set rules to allow authenticated uploads

---

## Quick Start (Test Mode)

### For Development/Testing:

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVC

**Paystack Test Cards:**
- Success: `5060 6666 6666 6666 6666`
- PIN: `1234`
- OTP: `123456`

**Test Bank Transfer:**
- Use test mode to generate account numbers
- Payments auto-confirm in test mode

---

## Current Status

✅ **Already Configured:**
- MongoDB Database
- JWT Authentication
- Base URL
- CORS Settings

❌ **Needs Configuration:**
- Paystack Keys (for all payments)
- Firebase (for file uploads - optional)

---

## Notes

1. **Payment providers are optional** - The system works without them, but payment features will be disabled
2. **Firebase is optional** - Used only for file storage (logos, documents)
3. **Use test keys** during development
4. **Switch to live keys** only when ready for production

---

## Testing Without Payment Keys

The system will work without payment keys, but:
- Payment buttons will show errors
- Billing features will be limited
- File uploads won't work (if Firebase not configured)

All other features (students, teachers, classes, attendance, etc.) work independently.
