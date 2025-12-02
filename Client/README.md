# infodocs Client

React frontend application for certificate and document management system.

## Project Structure

```
Client/
├── src/
│   ├── api/                    # API service files
│   │   ├── Admin/             # Admin API endpoints
│   │   ├── Auth/              # Authentication API
│   │   ├── Manager/           # Manager API endpoints
│   │   └── Users/             # User/Candidate API endpoints
│   ├── components/            # Reusable components
│   │   └── Layout.jsx        # Main layout with navigation
│   ├── pages/                 # Page components
│   │   ├── Admin/            # Admin pages
│   │   ├── Manager/          # Manager pages
│   │   ├── auth/             # Authentication pages
│   │   └── common/           # Common/public pages
│   ├── router/               # Routing configuration
│   │   └── AppRouter.jsx    # Main router
│   ├── utils/                # Utility functions
│   │   ├── apiConfig.js     # Axios configuration
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── constants.js     # App constants
│   ├── App.jsx               # Main app component
│   └── main.jsx             # Entry point
├── package.json
└── vite.config.js
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_BASE_URL=https://infodocs.api.d0s369.co.in/api
```

3. Start development server:
```bash
npm run dev
```

## Features

### Authentication
- Login with username/email and password
- Login with OTP
- User registration
- Protected routes based on user roles

### Admin Features
- Dashboard with analytics
- Certificate template management
- User management
- Certificate generation
- View all certificates

### Manager Features
- Dashboard
- View certificates
- View candidates
- Generate certificates for candidates

### Common Features
- Public certificate creation
- Form submission
- Certificate verification
- User profile management

## Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/certificate-creation` - Public certificate creation
- `/forms` - Candidate form submission
- `/verify-certificate` - Certificate verification

### Protected Routes - Admin
- `/admin/dashboard` - Admin dashboard
- `/admin/templates` - Template management
- `/admin/certificates` - View all certificates
- `/admin/users` - User management
- `/admin/certificate-creation` - Create certificates

### Protected Routes - Manager
- `/manager/dashboard` - Manager dashboard
- `/manager/certificates` - View certificates
- `/manager/candidates` - View candidates
- `/manager/certificate-creation` - Create certificates

### Protected Routes - Common
- `/profile` - User profile

## Technologies

- React 19
- React Router DOM
- Axios
- TailwindCSS
- Vite

## API Integration

All API calls are organized by role:
- `adminApi` - Admin endpoints
- `managerApi` - Manager endpoints
- `usersApi` - User/Candidate endpoints
- `authApi` - Authentication endpoints

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

