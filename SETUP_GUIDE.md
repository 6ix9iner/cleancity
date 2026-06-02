# CleanCity - Full Stack Setup Guide

Complete setup instructions for both Backend and Frontend of the CleanCity Nigeria platform.

## 📦 System Requirements

- **Node.js**: v16 or higher
- **npm**: v7 or higher (comes with Node.js)
- **MongoDB**: Atlas account or local instance
- **Git**: For version control
- **Code Editor**: VS Code recommended

## 🗂️ Project Structure

```
Clean-City-Nigeria/
├── Backend/                          # Node.js Express API
│   ├── config/                       # Configuration files
│   ├── controllers/                  # Business logic
│   ├── middleware/                   # Express middleware
│   ├── models/                       # Mongoose schemas
│   ├── routes/                       # API routes
│   ├── utils/                        # Utility functions
│   ├── server.js                     # Entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── Frontend/
    └── cleancitynigeria/             # React + Vite app
        ├── src/
        │   ├── components/
        │   ├── contexts/
        │   ├── pages/
        │   ├── services/
        │   ├── utils/
        │   ├── constants/
        │   ├── App.jsx
        │   ├── main.jsx
        │   └── index.css
        ├── public/
        ├── package.json
        ├── vite.config.js
        ├── .env.example
        └── FRONTEND_README.md
```

## 🚀 Backend Setup

### 1. Navigate to Backend Directory

```bash
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the `Backend/` directory. Copy from `.env.example` and fill in your details:

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

# Email Service (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Frontend URL
CLIENT_URL=http://localhost:5173

# Server
PORT=5000
```

### 4. Create MongoDB Database

1. Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create a database named `cleancity`
4. Get your connection string and add to `.env` as `MONGO_URI`

### 5. Setup Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Add to `.env`

### 6. Setup Gmail for Email Service

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Create an "App Password" for Gmail
4. Add email and app password to `.env`

### 7. Start Backend Server

**Development** (with hot reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will start on `http://localhost:5000`

### 8. Verify Backend is Running

```bash
curl http://localhost:5000/api/health
```

Should return: `{ "success": true, "message": "Clean City Nigeria API is running" }`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd Frontend/cleancitynigeria
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in `Frontend/cleancitynigeria/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 5. Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## ✅ Testing the Setup

### 1. Test Backend APIs

Use Postman or curl to test endpoints:

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "08012345678",
    "state": "Lagos",
    "role": "citizen"
  }'
```

### 2. Test Frontend

1. Open `http://localhost:5173` in your browser
2. Try registering a new account
3. Verify email with test code (check backend logs)
4. Login and navigate to dashboard
5. Try submitting a report

## 🐛 Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running and connection string is correct in `.env`

#### PORT Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change PORT in `.env` or kill process using port 5000

#### Cloudinary Upload Fails
**Solution**: Verify Cloudinary credentials in `.env` are correct

#### Email Not Sending
**Solution**: 
- Verify Gmail app password is correct
- Enable "Less secure app access" if using regular password
- Check email credentials in `.env`

### Frontend Issues

#### API Not Connecting
```
Error: Network Error or 404
```
**Solution**: 
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

#### Page Showing Blank
**Solution**: Check browser console for errors, clear cache and reload

#### Images Not Uploading
**Solution**: 
- Ensure backend has Cloudinary configured
- Check image size (max 10MB)
- Verify image format (PNG, JPG, GIF)

## 📚 Key Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Reports
- `POST /api/reports` - Submit report
- `GET /api/reports` - Get all reports
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports/:id` - Get report details

### Agencies
- `POST /api/agencies/register` - Register agency
- `GET /api/agencies/assigned-reports` - Get assigned reports

### Rewards
- `GET /api/rewards/my-rewards` - Get rewards
- `GET /api/rewards/my-tokens` - Get tokens

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend Deployment (Heroku/Railway)

```bash
# Install CLI
npm i -g heroku

# Login and deploy
heroku login
heroku create your-app-name
git push heroku main
```

## 📝 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/new-feature
```

### 2. Make Changes
```bash
# Backend
cd Backend
npm run dev

# Frontend (in new terminal)
cd Frontend/cleancitynigeria
npm run dev
```

### 3. Test Changes
- Test all affected endpoints
- Test UI in different screen sizes
- Check console for errors

### 4. Commit and Push
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 5. Create Pull Request
Submit PR on GitHub for review

## 🔐 Security Notes

⚠️ **Never commit `.env` files to version control**

- `.env` files are listed in `.gitignore`
- Passwords and API keys must be kept secret
- Always use environment variables for sensitive data
- Rotate API keys periodically

## 📞 Support & Resources

- [Backend README](Backend/README.md)
- [Frontend README](Frontend/cleancitynigeria/FRONTEND_README.md)
- [Backend Implementation Summary](Backend/IMPLEMENTATION_SUMMARY.md)

## 🎉 You're Ready!

Both backend and frontend are now set up and running. You can now:

1. Create user accounts
2. Submit environmental reports
3. Track rewards and tokens
4. View and manage reports
5. Track agency performance

Happy cleaning! 🌍✨
