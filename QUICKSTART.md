# 🚀 CleanCity - Quick Start Guide

Get up and running with CleanCity in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (free tier is fine)
- Cloudinary account (free tier)
- Gmail account with app password
- Two terminal windows

## ⚡ Express Setup (5 minutes)

### Terminal 1 - Backend Setup

```bash
# 1. Navigate to backend
cd Backend

# 2. Install dependencies
npm install

# 3. Create .env file and add:
cat > .env << EOF
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/cleancity
JWT_SECRET=your_secret_key_12345_change_in_production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
PORT=5000
EOF

# 4. Start backend
npm run dev
```

Expected output:
```
Connected to MongoDB
Server running on port 5000
```

### Terminal 2 - Frontend Setup

```bash
# 1. Navigate to frontend (in a NEW terminal)
cd Frontend/cleancitynigeria

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# 4. Start frontend
npm run dev
```

Expected output:
```
VITE v... ready in 123 ms
➜  Local:   http://localhost:5173/
```

## ✅ Verify Setup

1. Open `http://localhost:5173` in your browser
2. See the CleanCity home page ✓
3. Click "Register" to create account
4. Enter test user details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Phone: 08012345678
5. Check backend console for verification code (6 digits)
6. Enter code in email verification page
7. Login and submit a report!

## 📝 Test Verification Code

When you register, check your **backend console** for the verification code:

```
Verification code: 123456
```

Copy this and paste into the frontend verification form.

## 🎯 Test Features

### 1. Submit a Report
- Go to Dashboard → Submit Report
- Add description, choose category
- Click "Get My Current Location" (requires browser permission)
- Add images (optional)
- Submit

### 2. Check Dashboard
- Dashboard shows all your reports
- Click on a report to see details
- Track status and tokens

### 3. View Rewards
- Click Rewards in navigation
- See token balance
- View token history

### 4. Agency Features (if registered as agency)
- Go to Agency Dashboard
- See assigned reports
- Update report status

## 🔐 Test Account Details

**For Testing:**
```
Email: test@example.com
Password: password123
Role: Citizen
Location: Lagos
```

## 🛑 Stop Development Servers

When done:

```bash
# In each terminal, press Ctrl+C
```

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Check MongoDB URI in Backend/.env
- Ensure database cluster is active in MongoDB Atlas
- Verify username/password are correct

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### "Frontend can't connect to API"
- Ensure backend is running on port 5000
- Check VITE_API_URL in Frontend/.env
- Reload frontend page

### "Email not sending"
- Verify Gmail app password (not regular password)
- Enable 2-factor authentication on Gmail
- Check EMAIL_USER and EMAIL_PASS in .env

### "Image upload fails"
- Verify Cloudinary credentials in Backend/.env
- Check image file size (max 10MB)
- Clear browser cache and try again

## 📚 Next Steps

1. **Read Full Documentation**:
   - [Backend README](Backend/README.md)
   - [Frontend README](Frontend/cleancitynigeria/FRONTEND_README.md)
   - [Setup Guide](SETUP_GUIDE.md)

2. **Customize**:
   - Update colors in tailwind config
   - Add your branding/logo
   - Modify constants

3. **Deploy**:
   - Deploy frontend to Vercel/Netlify
   - Deploy backend to Heroku/Railway
   - Update API URLs in production

## 🎓 Project Structure

**Key Backend Files:**
- `server.js` - Express app setup
- `routes/` - API endpoints
- `controllers/` - Business logic
- `models/` - Database schemas
- `middleware/` - Auth, validation

**Key Frontend Files:**
- `src/App.jsx` - Main app with routing
- `src/pages/` - Page components
- `src/components/` - Reusable UI components
- `src/contexts/AuthContext.jsx` - Auth state
- `src/services/api.js` - API client

## 💡 Tips

1. **Check Console**: Always check browser console for errors
2. **Backend Logs**: Watch backend terminal for request logs
3. **Network Tab**: Use DevTools Network tab to debug API calls
4. **Code Comments**: Most files have helpful comments
5. **Git**: Commit your customizations regularly

## 📞 Support

If you run into issues:
1. Check console errors
2. Review the documentation
3. Check backend logs
4. Verify all environment variables
5. Try clearing cache and restarting servers

## 🎉 You're All Set!

You now have a fully functional CleanCity application! 

- ✅ User authentication with email verification
- ✅ Report submission with image upload
- ✅ Real-time status tracking
- ✅ Reward system
- ✅ Responsive design
- ✅ Production-ready code

**Happy coding!** 🚀✨
