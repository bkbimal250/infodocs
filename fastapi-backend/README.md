# FastAPI Backend - infodocs

FastAPI backend for certificate and document management system using MongoDB.

## Project Structure

```
fastapi-backend/
├── main.py                 # FastAPI application entry point
├── config/                 # Configuration
│   ├── settings.py         # Application settings
│   └── database.py        # MongoDB connection
├── core/                   # Core utilities
│   ├── exceptions.py      # Custom exceptions
│   ├── middleware.py      # Custom middleware
│   ├── dependencies.py    # FastAPI dependencies
│   └── utils.py           # Utility functions
├── apps/                   # Application modules
│   ├── users/             # User management
│   │   ├── models.py      # MongoDB models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── routers.py     # API routes
│   ├── certificates/      # Certificate management
│   ├── forms_app/         # Form submissions
│   ├── analytics/         # Analytics
│   └── notifications/    # Notifications
├── requirements.txt       # Python dependencies
└── .env.example          # Environment variables example
```

## Setup

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and set your MongoDB URL:
# MONGODB_URL=mongodb://localhost:27017
```

4. **Start MongoDB:**
Make sure MongoDB is running on your local machine or update `MONGODB_URL` in `.env`

5. **Run the server:**
```bash
python main.py
# Or using uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8009/docs
- ReDoc: http://localhost:8009/redoc

## Environment Variables

Key environment variables (see `.env.example`):

- `MONGODB_URL`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `MONGODB_DB_NAME`: Database name (default: `infodocs`)
- `SECRET_KEY`: Secret key for JWT tokens
- `DEBUG`: Enable debug mode (default: `True`)
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

## Features

- ✅ User authentication (JWT tokens)
- ✅ User registration and login
- ✅ OTP-based authentication
- ✅ Role-based access control (Admin, HR, Manager, Candidate)
- ✅ MongoDB integration
- ✅ RESTful API structure
- ✅ Automatic API documentation
- ✅ CORS support
- ✅ Error handling

## API Endpoints

### Authentication
- `POST /api/users/auth/register` - User registration
- `POST /api/users/auth/login` - Login with username/email
- `POST /api/users/auth/login_with_email` - Login with email
- `POST /api/users/auth/request_login_otp` - Request OTP
- `POST /api/users/auth/login_with_otp` - Login with OTP
- `GET /api/users/auth/user` - Get current user

### Users
- `GET /api/users` - List users (Admin/HR only)
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user

### Certificates
- `GET /api/certificates/templates` - List templates
- `POST /api/certificates/templates` - Create template

### Forms
- `GET /api/forms/spas` - List SPAs
- `POST /api/forms/candidate-forms` - Submit form

### Analytics
- `GET /api/analytics` - Get analytics (Admin/HR/Manager)

## Development

The project follows FastAPI best practices:
- Separation of concerns (models, schemas, services, routers)
- Dependency injection for authentication
- Role-based access control
- MongoDB with Motor (async driver)
- Pydantic for data validation

## Notes

- MongoDB collections are created automatically on first use
- JWT tokens expire after 30 days (configurable)
- OTP codes expire after 10 minutes
- All timestamps are stored in UTC

