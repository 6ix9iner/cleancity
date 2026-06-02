# CleanCity Frontend - React + Vite + Tailwind CSS

A modern, responsive web application for reporting and managing environmental issues in Nigeria.

## 🚀 Features

### For Citizens (Reporters)
- **User Registration & Authentication** - Email verification with 6-digit code
- **Report Submission** - Submit environmental issues with:
  - Multiple image uploads (max 5 images)
  - GPS location tracking
  - Detailed descriptions
  - Issue categorization
- **Dashboard** - Track all submitted reports with real-time status updates
- **Reward System** - Earn and track tokens for verified reports
- **Report Details** - View comprehensive information about each report

### For Cleaning Agencies
- **Agency Dashboard** - View and manage assigned reports
- **Status Management** - Update report status (assigned → in_progress → resolved)
- **Statistics** - Track performance metrics and resolved reports
- **Report Filtering** - Filter by status and category

### For All Users
- **Profile Management** - Update personal information
- **Reward Tracking** - View token balance and reward history
- **Responsive Design** - Seamless experience on desktop, tablet, and mobile

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running on `http://localhost:5000`

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update with your production API URL:

```env
VITE_API_URL=https://api.cleancity.com/api
```

## 🏃 Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Header.jsx          # Navigation header
│   ├── ProtectedRoute.jsx  # Route protection wrapper
│   └── UI.jsx              # Button, Input, Card, etc.
│
├── contexts/               # React contexts
│   └── AuthContext.jsx     # Authentication state management
│
├── services/               # API service layer
│   └── api.js              # API client with interceptors
│
├── pages/                  # Page components
│   ├── Home.jsx            # Landing page
│   ├── Register.jsx        # Registration page
│   ├── Login.jsx           # Login page
│   ├── EmailVerification.jsx
│   ├── CitizenDashboard.jsx
│   ├── SubmitReport.jsx
│   ├── ReportDetails.jsx
│   ├── AgencyDashboard.jsx
│   ├── Rewards.jsx
│   ├── Profile.jsx
│   └── NotFound.jsx
│
├── constants/              # App constants
│   └── index.js            # Categories, statuses, states, etc.
│
├── utils/                  # Helper functions
│   └── helpers.js          # Date formatting, validation, etc.
│
├── App.jsx                 # Main app with routing
├── App.css                 # Global styles
├── index.css               # Tailwind CSS import
└── main.jsx                # Entry point
```

## 🔐 Authentication Flow

1. User registers with email and password
2. Verification email with 6-digit code is sent
3. User verifies email and can then login
4. JWT token is stored in localStorage
5. Token is included in all API requests via Authorization header
6. On 401 response, user is redirected to login

## 📱 Key Pages

### 🏠 Home Page (`/`)
- Landing page with features overview
- Quick stats
- Call-to-action buttons
- Footer

### 📝 Register (`/register`)
- User registration with role selection
- Email, password, phone, state, LGA fields
- Role selection: Citizen or Cleaning Agency

### 🔑 Login (`/login`)
- Email and password login
- Remember me option
- Forgot password link (placeholder)

### ✉️ Email Verification (`/verify-email`)
- 6-digit code entry
- Countdown timer (5 minutes)
- Resend code option

### 👤 Citizen Dashboard (`/dashboard`)
- Statistics cards (total reports, tokens, resolved, in progress)
- Recent reports list with status
- Quick action to submit new report
- Filter and search capabilities

### 📮 Submit Report (`/submit-report`)
- Report category selection
- Detailed description textarea
- Image uploads (drag & drop or click)
- GPS location capture
- Address and LGA fields
- Form validation

### 📋 Report Details (`/reports/:id`)
- Full report information
- Images gallery
- Location map data
- Reported by information
- Status timeline
- Assigned agency info
- Token earned (if resolved)

### 🏢 Agency Dashboard (`/agency/dashboard`)
- Assigned reports count
- Resolved reports count
- In-progress reports count
- Filterable report list
- Status update buttons
- Report details link

### 🎁 Rewards (`/rewards`)
- Total token balance (large display)
- Token breakdown by type
- Token history with dates
- Available rewards with costs
- Token earning information

### 👥 Profile (`/profile`)
- User information display
- Editable fields (name, phone, state, LGA)
- Account type and verification status
- Member since date
- Update profile button

## 🎨 UI Components

All reusable components are in `components/UI.jsx`:

- **Button** - Multiple variants (primary, secondary, danger, outline)
- **Input** - Text input with label and error
- **Card** - Container component
- **Alert** - Info, success, warning, error messages
- **Badge** - Status badges with color variants
- **Select** - Dropdown select
- **TextArea** - Multi-line text input
- **Loading** - Loading spinner

## 🔌 API Integration

The app integrates with the CleanCity backend API:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-email` - Verify email
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `GET /auth/stats` - Get user statistics

### Reports
- `POST /reports` - Create report (with image upload)
- `GET /reports` - Get all reports
- `GET /reports/my-reports` - Get user's reports
- `GET /reports/:id` - Get report details
- `PATCH /reports/:id/status` - Update report status
- `DELETE /reports/:id` - Delete report
- `GET /reports/nearby` - Get nearby reports

### Agencies
- `POST /agencies/register` - Register agency
- `GET /agencies` - List agencies
- `GET /agencies/assigned-reports` - Get assigned reports
- `PUT /agencies/profile` - Update agency profile
- `GET /agencies/stats` - Get agency stats

### Rewards
- `GET /rewards/my-rewards` - Get user rewards
- `GET /rewards/my-tokens` - Get token history

## 🎨 Styling

- **Framework**: Tailwind CSS v4
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Color Scheme**: Green primary (#16a34a), with blue, purple, orange, yellow accents

## ✅ Form Validation

All forms include client-side validation for:
- Required fields
- Email format
- Password strength (minimum 6 characters)
- Password matching
- Image upload limits (max 5 images)

## 📱 Responsive Design

- Mobile-first approach
- Tailwind breakpoints (sm, md, lg)
- Hamburger menu on mobile
- Stacked layouts on small screens
- Grid layouts on large screens

## 🚨 Error Handling

- Global API error handler with automatic logout on 401
- User-friendly error messages
- Toast notifications for actions
- Alert components for errors and success

## 🔐 Protected Routes

Routes are protected using the `ProtectedRoute` component:

- Public routes: Home, Login, Register, Email Verification
- Citizen-only routes: Dashboard, Submit Report
- Agency-only routes: Agency Dashboard
- All-user routes: Reports, Rewards, Profile

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running on port 5000
- Check `VITE_API_URL` environment variable
- Check browser console for CORS errors

### Location Permission
- Grant browser permission for location access
- Use HTTPS in production (geolocation requires secure context)

### Image Upload Issues
- Check image file size (should be < 10MB each)
- Verify image format (PNG, JPG, GIF)
- Check Cloudinary configuration on backend

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Lucide Icons](https://lucide.dev)

## 📝 License

ISC License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please email support@cleancity.com or create an issue on GitHub.
