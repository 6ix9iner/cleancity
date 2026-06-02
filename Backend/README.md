# Clean City Nigeria - Backend API

A comprehensive REST API backend for environmental reporting and reward system platform in Nigeria.

## Features

- **User Management**: Citizen registration, email verification, authentication
- **Report System**: Submit environmental issues (dumpsites, overflowing bins, hazardous waste)
- **Agency Management**: Register and manage cleaning agencies
- **Reward System**: Token-based rewards for verified reports
- **Location Tracking**: GPS-based report submission and agency assignment
- **Leaderboard**: User rankings based on report tokens earned

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account (for image storage)
- Gmail account with app password (for email notifications)

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Setup environment variables** - Create a `.env` file in the root directory:
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cleancity

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Frontend URL
CLIENT_URL=http://localhost:5173

# Server
PORT=5000
```

## Running the Server

**Development** (with hot reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Documentation

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /verify-email` - Verify email with code
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `GET /stats` - Get user statistics

### Report Routes (`/api/reports`)
- `POST /` - Create new report (with file upload)
- `GET /` - Get all reports (with filters)
- `GET /my-reports` - Get user's reports
- `GET /:id` - Get single report
- `PATCH /:id/status` - Update report status
- `DELETE /:id` - Delete report
- `GET /nearby` - Get reports near location

### Agency Routes (`/api/agencies`)
- `POST /register` - Register new agency
- `GET /` - Get all agencies
- `GET /:agencyId` - Get agency profile
- `GET /assigned-reports` - Get assigned reports (agency)
- `PUT /profile` - Update agency profile (agency)
- `GET /stats` - Get agency statistics (agency)
- `PATCH /:agencyId/verify` - Verify agency (admin)

### Reward Routes (`/api/rewards`)
- `GET /my-rewards` - Get user rewards
- `GET /my-tokens` - Get user tokens
- `GET /:rewardId` - Get reward details
- `POST /redeem` - Redeem tokens
- `GET /leaderboard` - Get leaderboard
- `POST /bonus` - Give bonus tokens (admin)

## Database Models

### User
- Email authentication
- Role-based access (citizen, agency, admin)
- Token balance tracking
- Report statistics

### Report
- GPS location with geospatial indexing
- Image uploads via Cloudinary
- Status workflow
- Agency assignment
- Reward token generation

### Agency
- Organization details
- Service areas
- Report handling statistics
- Verification status

### Reward & Token
- User reward history
- Token issuance and redemption
- Expiration tracking

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Development Notes

- All file uploads are processed through Cloudinary
- Emails are sent via Gmail SMTP
- Location data uses geospatial queries for nearby search
- Rewards are automatically issued when reports are marked as resolved
- Email verification codes expire after 24 hours

## Security

- Passwords are hashed using bcryptjs
- JWT tokens expire after the configured duration
- Role-based access control on protected routes
- File upload restrictions to images only
- CORS enabled with configurable origin

## License

ISC
