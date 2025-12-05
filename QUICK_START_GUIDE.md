# X8 Network SaaS - Quick Start Guide

## 🎉 Your Application is Ready!

Both backend and frontend servers are now running successfully.

---

## 🌐 Access Your Application

- **Frontend:** [http://localhost:5174](http://localhost:5174)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 👥 Test Accounts

### Admin Account
- **Email:** `admin@x8work.com`
- **Password:** `admin123`
- **Dashboard:** Full system access with stats and manager management

### Manager Account
- **Email:** `manager@x8work.com`
- **Password:** `manager123`
- **Dashboard:** View and manage assigned clients

### Client Accounts
1. **Basic Tier Client**
   - **Email:** `client1@test.com`
   - **Password:** `client123`

2. **Pro Tier Client**
   - **Email:** `client2@test.com`
   - **Password:** `client123`

3. **Trial Tier Client**
   - **Email:** `client3@test.com`
   - **Password:** `client123`

---

## 🚀 How to Start Servers

### Method 1: Using the Startup Script (Recommended)
```bash
./start_dev.sh
```

### Method 2: Manually Start Each Server

**Terminal 1 - Backend:**
```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd app/frontend
npm run dev
```

---

## 🛠️ What Was Fixed

### Backend Issues Fixed:
1. ✅ Added `role` and `manager_id` fields to `RegisterRequest` schema
2. ✅ Fixed missing `status` import in managers.py
3. ✅ Added `await db.commit()` in register endpoint
4. ✅ Created admin and test users

### Frontend Issues Fixed:
1. ✅ Moved `user` state inside the App component (was outside)
2. ✅ Added loading state for user data
3. ✅ Fixed role-based routing logic
4. ✅ Added proper error handling for authentication
5. ✅ Fixed authentication flow to load user data correctly

### Dependencies Installed:
- ✅ `greenlet` package for async SQLAlchemy operations

---

## 🧪 Testing the Application

### 1. Test Registration
1. Go to [http://localhost:5174](http://localhost:5174)
2. Click "Register"
3. Fill in the form with new credentials
4. You'll be automatically logged in as a CLIENT user

### 2. Test Login - Admin
1. Go to [http://localhost:5174](http://localhost:5174)
2. Click "Login"
3. Use admin credentials: `admin@x8work.com` / `admin123`
4. You'll see the **Admin Dashboard** with:
   - Total managers count
   - Total clients count
   - List of all managers
   - System statistics

### 3. Test Login - Manager
1. Logout (if logged in)
2. Login with: `manager@x8work.com` / `manager123`
3. You'll see the **Manager Dashboard** with:
   - List of assigned clients
   - Client details (subscription tier, email, etc.)
   - Conversation center (placeholder)

### 4. Test Login - Client
1. Logout (if logged in)
2. Login with: `client1@test.com` / `client123`
3. You'll see the full **Client Dashboard** with:
   - Company management
   - Analytics charts
   - Subscription information
   - All the existing features

---

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Manager Endpoints (Requires MANAGER role)
- `GET /api/v1/managers/clients` - Get all clients assigned to manager
- `GET /api/v1/managers/clients/{client_id}` - Get specific client details

### Admin Endpoints (Requires ADMIN role)
- `GET /api/v1/admin/managers` - Get all managers
- `GET /api/v1/admin/clients` - Get all clients
- `GET /api/v1/admin/stats` - Get system statistics

---

## 🔧 Troubleshooting

### Port Already in Use
If you see "Port 5173 is in use", Vite automatically uses the next available port (5174, 5175, etc.)

### Database Connection Issues
```bash
# Check if PostgreSQL is running
psql -U app -d app -h localhost

# Check migration status
alembic current

# Run migrations if needed
alembic upgrade head
```

### Frontend Blank Page
- Clear browser cache and localStorage
- Check browser console for errors
- Ensure backend is running on port 8000

### 500 Errors on Login/Register
- Check backend logs in the terminal
- Ensure database migrations are up to date
- Verify all required fields are being sent

---

## 📚 Project Structure

```
x8_network_saas_v1/
├── app/
│   ├── api/v1/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── admin.py         # Admin endpoints
│   │   ├── managers.py      # Manager endpoints
│   │   └── ...
│   ├── core/
│   │   ├── deps.py          # Role-based dependencies
│   │   └── security.py      # Password hashing, JWT
│   ├── models/
│   │   └── user.py          # User model with roles
│   ├── schemas/
│   │   ├── auth.py          # Auth request/response schemas
│   │   └── user.py          # User schemas
│   ├── services/
│   │   └── auth.py          # Authentication business logic
│   ├── frontend/            # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── ManagerDashboard.tsx
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   └── api.ts   # API client
│   │   │   └── App.tsx      # Main app with routing
│   └── main.py              # FastAPI app entry point
├── create_admin.py          # Script to create admin user
├── create_test_users.py     # Script to create test users
├── start_dev.sh             # Development startup script
└── alembic/                 # Database migrations
```

---

## 🎯 Next Steps

1. **Customize Dashboards:** Update AdminDashboard.tsx and ManagerDashboard.tsx with more features
2. **Add Features:** Implement company management, messaging, analytics, etc.
3. **Security:** Change default passwords in production
4. **Deploy:** Configure environment variables for production

---

## 📞 Need Help?

Check the detailed implementation guide in [ROLE_BASED_AUTH_IMPLEMENTATION.md](ROLE_BASED_AUTH_IMPLEMENTATION.md)

---

**Enjoy building with X8 Network SaaS! 🚀**
