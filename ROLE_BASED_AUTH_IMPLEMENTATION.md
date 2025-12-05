# Role-Based Authentication Implementation Guide

## Overview

This document outlines the complete implementation of a three-tier user system:
1. **Clients** - Regular users with subscription tiers (Trial, Basic, Pro, Enterprise)
2. **Managers** - Staff who manage and assist specific clients
3. **Admin** - Single administrator with full system access

## Current Progress ✅

### Backend - Completed

1. **User Model Updated** - [app/models/user.py](app/models/user.py)
   - Added `role` field (CLIENT, MANAGER, ADMIN)
   - Added `subscription_tier` (TRIAL, BASIC, PRO, ENTERPRISE)
   - Added `trial_ends_at` (7-day trial for new clients)
   - Added `subscription_ends_at`
   - Added `manager_id` (foreign key to manager)
   - Added `manager` relationship (one-to-many)

2. **Auth Service Updated** - [app/services/auth.py](app/services/auth.py)
   - `create_user()` now accepts `role` and `manager_id`
   - Automatically sets 7-day trial for new CLIENT users
   - Validates only one ADMIN can exist
   - Validates manager_id references valid MANAGER user

3. **Role-Based Dependencies** - [app/core/deps.py](app/core/deps.py)
   - `get_current_client()` - Requires CLIENT role
   - `get_current_manager()` - Requires MANAGER role
   - `get_current_admin()` - Requires ADMIN role
   - `get_current_manager_or_admin()` - Requires MANAGER or ADMIN

4. **User Schemas Updated** - [app/schemas/user.py](app/schemas/user.py)
   - Added role fields to schemas
   - Added subscription fields
   - `UserCreate` now includes `role` and `manager_id`

---

## Remaining Implementation Tasks

### Phase 1: Database Migration

```bash
cd /path/to/x8_network_saas_v1
source .venv/bin/activate
alembic revision --autogenerate -m "Add user roles and subscription tiers"
alembic upgrade head
```

### Phase 2: Backend API Endpoints

#### 2.1 Update Auth Endpoints

**File:** `app/api/v1/auth.py`

Update register endpoint to accept role:
```python
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,  # Add role and manager_id fields
    db: AsyncSession = Depends(get_db)
):
    user = await create_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role,  # NEW
        manager_id=request.manager_id  # NEW
    )
    # ... rest of code
```

Update `/auth/me` to return role information:
```python
@router.get("/me", response_model=UserSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user  # Now includes role, subscription_tier, etc.
```

#### 2.2 Create Manager Endpoints

**Create new file:** `app/api/v1/managers.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.user import User as UserSchema
from app.core.deps import get_current_manager, get_current_admin
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v1/managers", tags=["managers"])

@router.get("/clients", response_model=List[UserSchema])
async def get_my_clients(
    current_manager: User = Depends(get_current_manager),
    db: AsyncSession = Depends(get_db)
):
    """Get all clients assigned to this manager"""
    result = await db.execute(
        select(User).where(
            User.manager_id == current_manager.id,
            User.role == UserRole.CLIENT
        )
    )
    clients = result.scalars().all()
    return clients

@router.get("/clients/{client_id}", response_model=UserSchema)
async def get_client_details(
    client_id: int,
    current_manager: User = Depends(get_current_manager),
    db: AsyncSession = Depends(get_db)
):
    """Get specific client details (non-confidential)"""
    result = await db.execute(
        select(User).where(
            User.id == client_id,
            User.manager_id == current_manager.id,
            User.role == UserRole.CLIENT
        )
    )
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found or not assigned to you"
        )

    return client

# Add more manager-specific endpoints
```

**Register router in `app/main.py`:**
```python
from app.api.v1 import auth, users, companies, subscriptions, managers

app.include_router(managers.router)
```

#### 2.3 Create Admin Endpoints

**Create new file:** `app/api/v1/admin.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.db.session import get_db
from app.schemas.user import User as UserSchema
from app.core.deps import get_current_admin
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

@router.get("/managers", response_model=List[UserSchema])
async def get_all_managers(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all managers with statistics"""
    result = await db.execute(
        select(User).where(User.role == UserRole.MANAGER)
    )
    managers = result.scalars().all()
    return managers

@router.get("/clients", response_model=List[UserSchema])
async def get_all_clients(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all clients (non-confidential data)"""
    result = await db.execute(
        select(User).where(User.role == UserRole.CLIENT)
    )
    clients = result.scalars().all()
    return clients

@router.get("/stats")
async def get_system_stats(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get system-wide statistics"""
    # Count users by role
    manager_count = await db.scalar(
        select(func.count()).select_from(User).where(User.role == UserRole.MANAGER)
    )
    client_count = await db.scalar(
        select(func.count()).select_from(User).where(User.role == UserRole.CLIENT)
    )

    return {
        "total_managers": manager_count,
        "total_clients": client_count,
        "total_users": manager_count + client_count + 1  # +1 for admin
    }
```

**Register router in `app/main.py`:**
```python
from app.api.v1 import auth, users, companies, subscriptions, managers, admin

app.include_router(admin.router)
```

---

### Phase 3: Frontend Implementation

#### 3.1 Update API Client

**File:** `app/frontend/src/lib/api.ts`

Add role to interfaces and methods:
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'client' | 'manager' | 'admin';  // NEW
  manager_id?: number;  // NEW
}

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'client' | 'manager' | 'admin';  // NEW
  subscription_tier?: string;  // NEW
  trial_ends_at?: string;  // NEW
  is_active: boolean;
  created_at: string;
}

// Add new methods
async getMyClients(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/managers/clients`, {
    headers: this.getAuthHeaders()
  });
  return response.json();
}

async getAllManagers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/admin/managers`, {
    headers: this.getAuthHeaders()
  });
  return response.json();
}

async getAllClients(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/admin/clients`, {
    headers: this.getAuthHeaders()
  });
  return response.json();
}
```

#### 3.2 Update Register Component

**File:** `app/frontend/src/components/Register.tsx`

Add role selection (only show for admin creating accounts):
```typescript
// For public registration, always use CLIENT role
// For admin panel, show role selector

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    const response = await apiClient.register({
      ...formData,
      role: 'client'  // Always client for public registration
    });
    apiClient.saveTokens(response);
    onSuccess();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Registration failed');
  } finally {
    setLoading(false);
  }
};
```

#### 3.3 Create Manager Dashboard

**Create new file:** `app/frontend/src/components/ManagerDashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { ConversationCenter } from './ConversationCenter';  // Extract from sidebar
import { apiClient } from '../lib/api';

interface Client {
  id: number;
  email: string;
  full_name: string;
  subscription_tier: string;
  created_at: string;
}

export const ManagerDashboard: React.FC<{
  language: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
}> = ({ language, onLanguageChange, onLogout }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await apiClient.getMyClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <Header
        onNavigate={() => {}}
        onLogout={onLogout}
        language={language}
        onLanguageChange={onLanguageChange}
      />

      <main style={{
        marginTop: '80px',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px'
      }}>
        {/* Conversation Center on left */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            {language === 'EN' ? 'Conversation Center' : 'Centro de Conversaciones'}
          </h2>
          {/* Add conversation center content */}
        </div>

        {/* Client list on right */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            {language === 'EN' ? 'My Clients' : 'Mis Clientes'}
          </h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            {clients.map((client) => (
              <div
                key={client.id}
                className="glass-card neon-border"
                onClick={() => setSelectedClient(client)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {client.full_name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  {client.email}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '8px'
                }}>
                  Plan: {client.subscription_tier}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
```

#### 3.4 Create Admin Dashboard

**Create new file:** `app/frontend/src/components/AdminDashboard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Users, Activity, TrendingUp } from 'lucide-react';
import { apiClient } from '../lib/api';

interface Manager {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

interface Stats {
  total_managers: number;
  total_clients: number;
  total_users: number;
}

export const AdminDashboard: React.FC<{
  language: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
}> = ({ language, onLanguageChange, onLogout }) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [managersData, statsData] = await Promise.all([
        apiClient.getAllManagers(),
        fetch('/api/v1/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }).then(r => r.json())
      ]);
      setManagers(managersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <Header
        onNavigate={() => {}}
        onLogout={onLogout}
        language={language}
        onLanguageChange={onLanguageChange}
      />

      <main style={{
        marginTop: '80px',
        padding: '24px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '32px'
        }}>
          {language === 'EN' ? 'Admin Dashboard' : 'Panel de Administración'}
        </h1>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={32} color="var(--brand-cyan)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total Managers
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.total_managers || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={32} color="var(--brand-teal)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total Clients
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.total_clients || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={32} color="var(--brand-neon)" />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Total Users
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stats?.total_users || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Managers List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '24px'
          }}>
            {language === 'EN' ? 'Managers' : 'Gerentes'}
          </h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            {managers.map((manager) => (
              <div
                key={manager.id}
                className="glass-card neon-border"
                style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {manager.full_name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    {manager.email}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  Joined: {new Date(manager.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
```

#### 3.5 Update App.tsx for Role-Based Routing

**File:** `app/frontend/src/App.tsx`

Add role-based dashboard routing:
```typescript
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';

// Add state for user data
const [user, setUser] = useState<any>(null);

// Load user data after authentication
const handleAuthSuccess = async () => {
  setIsAuthenticated(true);

  try {
    const userData = await apiClient.getCurrentUser();
    setUser(userData);
    setCurrentWindow('WINDOW_0');
  } catch (error) {
    console.error('Failed to load user:', error);
  }
};

// Route based on user role
if (isAuthenticated && user) {
  if (user.role === 'admin') {
    return (
      <AdminDashboard
        language={language}
        onLanguageChange={setLanguage}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === 'manager') {
    return (
      <ManagerDashboard
        language={language}
        onLanguageChange={setLanguage}
        onLogout={handleLogout}
      />
    );
  }

  // Client dashboard (existing dashboard)
  if (currentWindow === 'WINDOW_0') {
    return (/* existing client dashboard */);
  }
}
```

---

## Testing the Implementation

### 1. Create Admin User (First Time Setup)

```bash
# Via Python shell
python -c "
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine('postgresql://app:app@localhost:5432/app')
session = Session(engine)

admin = User(
    email='admin@x8work.com',
    hashed_password=get_password_hash('admin123'),
    full_name='System Admin',
    role=UserRole.ADMIN,
    is_superuser=True,
    is_active=True
)

session.add(admin)
session.commit()
print('Admin created successfully!')
"
```

### 2. Test User Flow

1. **Admin logs in** → See Admin Dashboard with manager/client stats
2. **Manager logs in** → See Manager Dashboard with assigned clients
3. **Client logs in** → See full Client Dashboard (existing UI)

### 3. Test API Endpoints

```bash
# Get all managers (admin only)
curl -H "Authorization: Bearer <admin_token>" http://localhost:8000/api/v1/admin/managers

# Get my clients (manager only)
curl -H "Authorization: Bearer <manager_token>" http://localhost:8000/api/v1/managers/clients

# Access should be denied for wrong roles
curl -H "Authorization: Bearer <client_token>" http://localhost:8000/api/v1/admin/managers
# Should return 403 Forbidden
```

---

## Summary of Changes

### Database Schema
- `users` table: Added `role`, `subscription_tier`, `trial_ends_at`, `subscription_ends_at`, `manager_id`
- New relationship: `manager ↔ managed_clients` (one-to-many)

### Backend (Python/FastAPI)
- Updated models, schemas, services
- New role-based permission dependencies
- New API endpoints for managers and admin
- Registration now supports role assignment

### Frontend (React/TypeScript)
- Updated API client with role support
- New ManagerDashboard component
- New AdminDashboard component
- Role-based routing in App.tsx
- Updated Register component (optional role field)

---

## Next Steps

1. Run database migration
2. Create API endpoints for managers and admin
3. Build frontend dashboards
4. Create admin user (first-time setup)
5. Test complete flow with all three roles

This implementation provides a complete role-based access control system while maintaining your existing UI/UX design patterns!
