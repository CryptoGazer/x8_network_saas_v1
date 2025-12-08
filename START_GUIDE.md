# X8 Network SaaS - Quick Start Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- PostgreSQL running
- Virtual environment activated

## Starting the Application

### 1. Start Backend Server

```bash
# From project root directory
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 2. Start Frontend Development Server

```bash
# In a new terminal, navigate to frontend directory
cd app/frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Authentication Flow

### Email-Based Authentication (Implemented)

1. **Registration**:
   - User enters email, password, and full name
   - Backend creates user account
   - Returns JWT access and refresh tokens
   - User is automatically logged in

2. **Login**:
   - User enters email and password
   - Backend validates credentials
   - Returns JWT access and refresh tokens

3. **OAuth Providers (Placeholder)**:
   - Google, Facebook, and Apple buttons are displayed
   - Clicking them shows an alert: "Will be implemented in next iteration"
   - No backend implementation yet

## Testing the API

Run the test script:

```bash
./test_auth.sh
```

Or manually test with curl:

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "client"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Get current user (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Environment Variables

### Backend (.env in app/ directory)
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost/x8network
SECRET_KEY=your-secret-key
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env in app/frontend/ directory)
```
VITE_API_URL=http://localhost:8000
```

## Common Issues

### CORS Errors
- Ensure `BACKEND_CORS_ORIGINS` includes your frontend URL
- Default: `http://localhost:5173`

### Database Connection
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Run migrations: `alembic upgrade head`

### Token Issues
- Tokens are stored in localStorage
- Clear localStorage if you encounter auth issues
- Access token expires in 30 minutes
- Refresh token expires in 7 days

## Project Structure

```
x8_network_saas_v1/
├── app/
│   ├── api/v1/
│   │   └── auth.py          # Auth endpoints
│   ├── frontend/
│   │   └── src/
│   │       ├── components/
│   │       │   └── AuthPage.tsx  # Login/Register UI
│   │       ├── utils/
│   │       │   └── api.ts        # API client
│   │       └── App.tsx           # Main app with auth check
│   ├── models/
│   │   ├── user.py          # User model
│   │   └── verification_code.py
│   ├── services/
│   │   ├── auth.py          # Auth business logic
│   │   └── email.py         # Email service (dev mode)
│   └── main.py              # FastAPI app
└── test_auth.sh             # API test script
```

## Next Steps (To Be Implemented)

1. **OAuth Integration**:
   - Google OAuth 2.0
   - Facebook Login
   - Apple Sign In

2. **Two-Factor Authentication**:
   - Email verification codes
   - SMS verification (optional)

3. **Password Reset Flow**

4. **Social Login State Management**

## Support

For issues or questions, check:
- Backend logs in the terminal running uvicorn
- Frontend logs in browser console
- API documentation at `http://localhost:8000/docs`
