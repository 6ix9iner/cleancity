# Quick Start Guide - Clean City Nigeria Backend

## 📋 Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Cloudinary account  
- Gmail account with app password

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create .env File
In the Backend directory, create `.env`:
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/cleancity
JWT_SECRET=your_secret_key_here_min_32_chars_recommended
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
```

### 3. Start Server
```bash
npm run dev
```
Server runs on: `http://localhost:5000`

## 🧪 Quick API Test

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+234123456789"
  }
```

### 2. Verify Email
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d {
    "email": "john@example.com",
    "code": "123456"
  }
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "john@example.com",
    "password": "password123"
  }
```

## 📁 What's Included

| File | Purpose |
|------|---------|
| `server.js` | Express app setup |
| `config/db.js` | MongoDB connection |
| `config/cloudinary.js` | Image storage config |
| `models/*` | Database schemas |
| `controllers/*` | Business logic |
| `routes/*` | API endpoints |
| `middleware/*` | Auth, roles, uploads |
| `utils/*` | Helper functions |

## 🔐 Key Features

✅ User authentication with JWT  
✅ Email verification  
✅ Report submission with image upload  
✅ Geospatial tracking (GPS)  
✅ Auto agency assignment  
✅ Reward token system  
✅ Role-based access control  
✅ Input validation  
✅ Error handling  

## 📚 Full Documentation

See these files for complete info:
- [README.md](./README.md) - Detailed API documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Architecture & features

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use different port
PORT=5001 npm run dev
```

### MongoDB Connection Failed
- Check MONGO_URI in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure database credentials are correct

### Emails Not Sending
- Enable "Less secure apps" or use app password for Gmail
- Check EMAIL_USER and EMAIL_PASS in .env
- Verify SMTP settings

### Images Not Uploading
- Verify Cloudinary credentials
- Check file size (max 10MB)
- Ensure format is jpg, png, or gif

## 🚀 Next Steps

1. **Test all endpoints** in Postman or Insomnia
2. **Connect with frontend** using API base URL
3. **Configure MongoDB** with proper security rules
4. **Set up Gmail** for email notifications
5. **Add env variables** for production deployment

## 💡 Tips

- Check logs in console for detailed error messages
- Use Postman to test API before frontend integration
- MongoDB queries can be tested in MongoDB Atlas shell
- Cloudinary dashboard shows uploaded images

## 📞 Support

For issues:
1. Check .env variables are correct
2. Verify all services (MongoDB, Cloudinary, Gmail) are accessible
3. Check console logs for detailed error messages
4. Review API response status codes and messages

---

**Backend is now ready for frontend integration! 🎉**
