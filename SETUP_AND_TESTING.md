# Clean City Nigeria - Complete Setup & Testing Guide

## ✅ Issues Fixed

### 1. **Email Verification Code Not Sending** ✓
- **Problem**: User model field mismatch between `verificationCodeExpiry` and `verificationExpires`
- **Solution**: Standardized field name to `verificationExpires` in User model
- **Status**: Fixed in `Backend/models/User.js`

### 2. **Frontend API Parameter Mismatch** ✓
- **Problem**: EmailVerification.jsx sending `verificationCode` but backend expects `code`
- **Solution**: Updated EmailVerification.jsx to send correct parameter name
- **Status**: Fixed in `Frontend/cleancitynigeria/src/pages/EmailVerification.jsx`

### 3. **Report Submission Data Format Issue** ✓
- **Problem**: Frontend sends location as `{coordinates: [lng, lat]}` but backend expected separate `latitude` and `longitude` fields
- **Solution**: Updated backend controller to handle both formats
- **Status**: Fixed in `Backend/controllers/reportController.js`

### 4. **Email Service Configuration** ✓
- **Status**: Configured with valid Gmail App Password in `Backend/.env`

---

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend
cd Backend

# Install dependencies
npm install

# Start server (development)
npm run dev

# Or start in production
npm start
```

**Server runs on**: `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd Frontend/cleancitynigeria

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build
```

**Frontend runs on**: `http://localhost:5173`

---

## 📋 Prerequisites

### Required:
1. **Node.js** (v16+)
2. **MongoDB** (Running locally or Atlas connection string)
3. **Cloudinary Account** (For image uploads)
4. **Gmail Account** (For email verification)

### Environment Variables

#### Backend: `.env`
```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/CleanCityNigeria
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

#### Frontend: `.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Complete Testing Flow

### Step 1: Registration Flow ✅
1. Navigate to `http://localhost:5173`
2. Click "Get Started"
3. Fill registration form:
   - Name: Test User
   - Email: testuser@example.com
   - Password: test123456
   - Phone: +2348012345678
   - Role: Citizen
   - State: Lagos
4. Click "Create Account"
5. **Expected**: Redirected to Email Verification page

### Step 2: Email Verification ✅
1. Check email inbox for verification code
2. Enter 6-digit code
3. Click "Verify Email"
4. **Expected**: Redirected to login page with success message

### Step 3: Login ✅
1. Enter email and password
2. Click "Sign In"
3. **Expected**: Redirected to Citizen Dashboard

### Step 4: Submit Report ✅
1. From dashboard, click "Submit Report"
2. Fill form:
   - Description: "Illegal dumpsite on 5th Avenue"
   - Category: Illegal Dumpsite
   - Get Location (GPS)
   - Upload 1-5 images
3. Click "Submit"
4. **Expected**: Report created and displayed with success message

### Step 5: View Dashboard ✅
1. Navigate to Dashboard
2. **Verify**:
   - Recent reports appear
   - Stats display correctly (total reports, tokens, rewards)
   - Report status shows (submitted/assigned/etc)

### Step 6: Rewards System ✅
1. Navigate to Rewards page
2. **Verify**:
   - Token balance displays
   - Token history shows all earned tokens
   - Reward status updates when reports are resolved

### Step 7: Profile Management ✅
1. Navigate to Profile
2. Update name, phone, state, LGA
3. Click "Save Changes"
4. **Expected**: Profile updated with success message

### Step 8: Agency Registration (if applicable) ✅
1. Register new account with role "Cleaning Agency"
2. Fill agency details
3. **Expected**: Agency dashboard accessible with assigned reports

---

## 🔧 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Reports
- `POST /api/reports` - Submit new report (Protected)
- `GET /api/reports` - Get all reports (Protected)
- `GET /api/reports/my-reports` - Get user's reports (Protected)
- `GET /api/reports/nearby` - Get nearby reports
- `GET /api/reports/:id` - Get report details
- `PATCH /api/reports/:id/status` - Update report status (Protected)
- `DELETE /api/reports/:id` - Delete report (Protected)

### Rewards
- `GET /api/rewards/my-rewards` - Get user rewards (Protected)
- `GET /api/rewards/leaderboard` - Get top contributors

### Agencies
- `POST /api/agencies/register` - Register agency (Protected)
- `GET /api/agencies` - Get all agencies
- `GET /api/agencies/assigned-reports` - Get assigned reports (Protected)
- `GET /api/agencies/stats` - Get agency stats (Protected)

---

## 🐛 Troubleshooting

### Email not sending?
1. Check `Backend/.env` has valid EMAIL_USER and EMAIL_PASS
2. Verify Gmail App Password is correct (16 chars, spaces removed)
3. Check MongoDB logs for errors
4. Verify SMTP connection with test email

### Reports not submitting?
1. Ensure location permission is enabled in browser
2. Check if images are properly uploaded to Cloudinary
3. Verify MONGO_URI is correct and MongoDB is running
4. Check browser console for API errors

### Login fails after email verification?
1. Check token is properly saved in localStorage
2. Verify JWT_SECRET is consistent in backend
3. Check token expiration settings

### API calls failing?
1. Ensure backend is running on correct port (5000)
2. Check VITE_API_URL in frontend .env
3. Verify CORS is properly configured
4. Check network tab in browser DevTools

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'citizen' | 'agency' | 'admin',
  state: String,
  lga: String,
  isVerified: Boolean,
  verificationCode: String (hidden),
  verificationExpires: Date (hidden),
  tokenBalance: Number,
  totalReports: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Report Collection
```javascript
{
  _id: ObjectId,
  reportedBy: ObjectId (ref: User),
  images: [String], // Cloudinary URLs
  description: String,
  category: 'illegal_dumpsite' | 'overflowing_bin' | 'hazardous_waste' | 'other',
  location: {
    type: 'Point',
    coordinates: [Number, Number], // [longitude, latitude]
    address: String,
    lga: String,
    state: String
  },
  status: 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected',
  assignedAgency: ObjectId (ref: Agency),
  rewardToken: String,
  tokenIssued: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✨ Features Verified

- ✅ User Registration with email verification
- ✅ Email verification code delivery (Gmail SMTP)
- ✅ User Authentication (JWT)
- ✅ Report submission with GPS location
- ✅ Image upload to Cloudinary
- ✅ Report status tracking
- ✅ Agency assignment based on location
- ✅ Rewards/Token system
- ✅ User profile management
- ✅ Role-based access control (Citizen/Agency/Admin)
- ✅ MongoDB integration
- ✅ API error handling and validation

---

## 📝 Notes

- Email verification code valid for 24 hours
- All passwords hashed with bcryptjs
- JWT tokens expire after 7 days
- Max 5 images per report
- Cloudinary handles image optimization
- MongoDB uses geospatial indexing for location queries

---

## 🎯 Next Steps

1. Configure production database (MongoDB Atlas)
2. Set up proper email service for production
3. Implement image moderation
4. Add payment integration for reward redemption
5. Set up monitoring and logging
6. Deploy to production servers

---

**Last Updated**: 2026-05-15
**Status**: ✅ All critical features functional and tested
