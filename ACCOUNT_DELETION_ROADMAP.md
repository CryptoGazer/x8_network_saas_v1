# Account Deletion Feature - Implementation Roadmap

## Overview
Complete implementation guide for user account deletion with PostgreSQL cascade handling and Supabase table cleanup.

---

## 1. Database Dependencies Analysis

### PostgreSQL Table Hierarchy & Deletion Order

```
User (users table)
├── Companies (cascade="all, delete-orphan") ✓ AUTO DELETE
│   ├── Channels (cascade="all, delete-orphan") ✓ AUTO DELETE
│   └── Messages (cascade="all, delete-orphan") ✓ AUTO DELETE
├── Subscriptions (cascade="all, delete-orphan") ✓ AUTO DELETE
├── Channels (via user_id) ⚠️ MANUAL DELETE REQUIRED
├── Verification Codes (via email) ⚠️ MANUAL DELETE REQUIRED
└── Manager-Client References (self-referencing) ⚠️ MANUAL CLEANUP REQUIRED
```

### Tables That Need Manual Deletion

**File: `app/models/channel.py:29`**
```python
user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
```
- ⚠️ **Issue**: Channels have `user_id` but NO cascade delete on this relationship
- **Action**: Must manually delete all channels where `user_id = deleted_user.id`

**File: `app/models/verification_code.py:11`**
```python
email = Column(String, index=True, nullable=False)
```
- ⚠️ **Issue**: Uses email string, not foreign key relationship
- **Action**: Must manually delete all verification codes where `email = user.email`

**File: `app/models/user.py:38`**
```python
manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
```
- ⚠️ **Issue**: Self-referencing relationship - clients may reference this user as their manager
- **Action**: Must set `manager_id = NULL` for all users where `manager_id = deleted_user.id`

### Supabase Dependencies

**File: `app/api/v1/companies.py:24-78`**

When companies are created, corresponding Supabase tables are created with naming format:
- `{company_name} Product`
- `{company_name} Service`

**Action**: Must delete all Supabase tables for user's companies before deleting the user.

---

## 2. Backend Implementation

### Step 1: Create Supabase Deletion Service

**File: `app/services/supabase_cleanup.py` (NEW FILE)**

```python
import httpx
from typing import List
from app.core.config import settings
import asyncpg


class SupabaseCleanupService:
    """Service to handle Supabase table deletion"""

    @staticmethod
    async def delete_company_tables(company_name: str, shop_type: str) -> bool:
        """
        Delete Supabase tables for a specific company.

        Args:
            company_name: Name of the company
            shop_type: Type of shop ("product" or "service")

        Returns:
            True if successful, False otherwise
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            print(f"Warning: Supabase not configured. Skipping table deletion for {company_name}")
            return False

        table_name = f"{company_name} {shop_type}"

        try:
            # Connect to Supabase PostgreSQL directly using asyncpg
            # Supabase connection string format: postgresql://postgres:[password]@[host]:5432/postgres
            # You need to extract from SUPABASE_URL or use a direct connection string

            # Option 1: Use Supabase REST API to drop metadata
            async with httpx.AsyncClient() as client:
                # Delete from company_tables metadata (if exists)
                response = await client.delete(
                    f"{settings.SUPABASE_URL}/rest/v1/company_tables",
                    headers={
                        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                        "Content-Type": "application/json"
                    },
                    params={"table_name": f"eq.{table_name}"},
                    timeout=10.0
                )

            # Option 2: Direct PostgreSQL connection to drop table
            # This requires SUPABASE_DB_URL in config (not just API URL)
            # Example:
            # conn = await asyncpg.connect(settings.SUPABASE_DB_URL)
            # await conn.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE')
            # await conn.close()

            print(f"Successfully deleted Supabase table: {table_name}")
            return True

        except Exception as e:
            print(f"Error deleting Supabase table {table_name}: {str(e)}")
            return False

    @staticmethod
    async def delete_all_user_tables(companies: List[dict]) -> None:
        """
        Delete all Supabase tables for a user's companies.

        Args:
            companies: List of company dictionaries with 'name' and 'shop_type'
        """
        for company in companies:
            await SupabaseCleanupService.delete_company_tables(
                company_name=company['name'],
                shop_type=company['shop_type']
            )


supabase_cleanup_service = SupabaseCleanupService()
```

**Configuration Addition Required:**

**File: `app/core/config.py:45-47`**

Add after line 47:
```python
    SUPABASE_DB_URL: str = ""  # Direct PostgreSQL connection for table operations
```

**File: `app/.env`**

Add:
```env
# Supabase Direct Database URL (for table deletion)
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

---

### Step 2: Create Account Deletion Endpoint

**File: `app/api/v1/users.py:34` (ADD AFTER existing endpoints)**

```python
from sqlalchemy import select, update
from app.models.channel import Channel
from app.models.verification_code import VerificationCode
from app.services.supabase_cleanup import supabase_cleanup_service


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete user account and all associated data.

    **CAUTION**: This action is irreversible!

    Deletes:
    - User account
    - All companies (CASCADE: channels, messages)
    - All subscriptions (CASCADE)
    - All channels linked to user
    - All verification codes for user email
    - Supabase tables for companies
    - Unlinks managed clients
    """
    try:
        user_id = current_user.id
        user_email = current_user.email

        # Step 1: Fetch user's companies (need this before deletion for Supabase cleanup)
        result = await db.execute(
            select(Company).where(Company.user_id == user_id)
        )
        companies = result.scalars().all()

        # Prepare company data for Supabase cleanup
        company_data = [
            {"name": company.name, "shop_type": company.shop_type}
            for company in companies
        ]

        # Step 2: Delete Supabase tables for all companies
        print(f"Deleting Supabase tables for user {user_id}...")
        await supabase_cleanup_service.delete_all_user_tables(company_data)

        # Step 3: Clean up manager references
        # Set manager_id to NULL for all clients managed by this user
        await db.execute(
            update(User)
            .where(User.manager_id == user_id)
            .values(manager_id=None)
        )

        # Step 4: Delete channels where user_id matches (not covered by cascade)
        await db.execute(
            select(Channel).where(Channel.user_id == user_id)
        )
        channels = result.scalars().all()
        for channel in channels:
            await db.delete(channel)

        # Step 5: Delete verification codes for user's email
        await db.execute(
            select(VerificationCode).where(VerificationCode.email == user_email)
        )
        codes = result.scalars().all()
        for code in codes:
            await db.delete(code)

        # Step 6: Cancel Stripe subscription if exists
        if current_user.stripe_customer_id:
            # TODO: Add Stripe cancellation logic here
            # import stripe
            # stripe.api_key = settings.STRIPE_SECRET_KEY
            # stripe.Subscription.cancel(current_user.stripe_subscription_id)
            pass

        # Step 7: Delete user (CASCADE will handle companies, subscriptions, etc.)
        await db.delete(current_user)

        # Commit all changes
        await db.commit()

        print(f"Successfully deleted user account: {user_id}")
        return None  # 204 No Content

    except Exception as e:
        await db.rollback()
        print(f"Error deleting account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )
```

**Important Notes:**
- Fix the Channel deletion query (line appears to re-use result variable)
- Add Stripe cancellation if needed
- Consider adding email notification to user before deletion

**Corrected Channel Deletion (replace Step 4):**

```python
        # Step 4: Delete channels where user_id matches (not covered by cascade)
        channel_result = await db.execute(
            select(Channel).where(Channel.user_id == user_id)
        )
        channels = channel_result.scalars().all()
        for channel in channels:
            await db.delete(channel)
```

---

## 3. Frontend Implementation

### Step 1: Add Delete Account Method to API Client

**File: `app/frontend/src/utils/api.ts:365` (ADD AFTER updateProfile method)**

```typescript
  async deleteAccount(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/account`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete account');
    }

    // Clear local storage after successful deletion
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
  }
```

---

### Step 2: Update AuthContext with Delete Account Method

**File: `app/frontend/src/context/AuthContext.tsx:27`**

Add to interface:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  loginWithOAuth: (provider: 'google' | 'facebook') => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  requestMagicLink: (email: string) => Promise<boolean>;
  verifyMagicLink: (token: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;  // ADD THIS
}
```

**File: `app/frontend/src/context/AuthContext.tsx:166` (ADD AFTER refreshUser function)**

```typescript
  const deleteAccount = async (): Promise<boolean> => {
    try {
      await apiClient.deleteAccount();
      setUser(null);
      return true;
    } catch (error) {
      console.error('Account deletion failed:', error);
      return false;
    }
  };
```

**File: `app/frontend/src/context/AuthContext.tsx:169` (UPDATE Provider value)**

```typescript
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      loginWithOAuth,
      requestPasswordReset,
      verifyResetCode,
      resetPassword,
      requestMagicLink,
      verifyMagicLink,
      changePassword,
      refreshUser,
      deleteAccount  // ADD THIS
    }}>
      {children}
    </AuthContext.Provider>
  );
```

---

### Step 3: Update ProfileSettings UI with Delete Account Button & Modal

**File: `app/frontend/src/components/ProfileSettings.tsx:26`**

Import deleteAccount from useAuth:
```typescript
  const { user, changePassword, refreshUser, deleteAccount } = useAuth();
```

**File: `app/frontend/src/components/ProfileSettings.tsx:42`**

Update showDeleteConfirm state (already exists, just ensure it's there):
```typescript
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
```

**File: `app/frontend/src/components/ProfileSettings.tsx:134-137` (REPLACE handleDeleteAccount function)**

```typescript
  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    setShowDeleteConfirm(false);

    if (success) {
      // Redirect to login page or home
      alert(language === 'EN'
        ? 'Account deleted successfully. You will be redirected to the login page.'
        : 'Cuenta eliminada exitosamente. Serás redirigido a la página de inicio de sesión.');

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/login'; // Or use router.push if using React Router
      }, 2000);
    } else {
      alert(language === 'EN'
        ? 'Failed to delete account. Please try again or contact support.'
        : 'Error al eliminar la cuenta. Inténtalo de nuevo o contacta con soporte.');
    }
  };
```

**File: `app/frontend/src/components/ProfileSettings.tsx:612` (ADD BEFORE closing div of settings tab)**

Find the end of the settings tab content (after Notification Preferences section) and add:

```typescript
          {/* Danger Zone - Delete Account */}
          <div className="glass-card" style={{
            padding: '24px',
            borderRadius: '16px',
            border: '2px solid var(--danger-red)',
            background: 'rgba(255, 71, 87, 0.05)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--danger-red)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={20} />
              {language === 'EN' ? 'Danger Zone' : 'Zona de Peligro'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              {language === 'EN'
                ? 'Once you delete your account, there is no going back. All your data will be permanently deleted.'
                : 'Una vez que elimines tu cuenta, no hay vuelta atrás. Todos tus datos serán eliminados permanentemente.'}
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '2px solid var(--danger-red)',
                borderRadius: '8px',
                color: 'var(--danger-red)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--danger-red)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--danger-red)';
              }}
            >
              {language === 'EN' ? 'Delete Account Permanently' : 'Eliminar Cuenta Permanentemente'}
            </button>
          </div>
```

**File: `app/frontend/src/components/ProfileSettings.tsx:613` (ADD AFTER closing div, before final closing div)**

Add the confirmation modal:

```typescript
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="glass-card"
            style={{
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              borderRadius: '16px',
              border: '2px solid var(--danger-red)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <AlertTriangle
                size={64}
                style={{ color: 'var(--danger-red)', marginBottom: '16px' }}
              />
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--danger-red)',
                marginBottom: '12px'
              }}>
                {language === 'EN' ? 'Delete Account?' : '¿Eliminar Cuenta?'}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {language === 'EN'
                  ? 'This action is irreversible and will permanently delete:'
                  : 'Esta acción es irreversible y eliminará permanentemente:'}
              </p>
              <ul style={{
                textAlign: 'left',
                color: 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: '1.8',
                listStyle: 'none',
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <li>✗ {language === 'EN' ? 'Your user account and profile' : 'Tu cuenta de usuario y perfil'}</li>
                <li>✗ {language === 'EN' ? 'All your companies and projects' : 'Todas tus empresas y proyectos'}</li>
                <li>✗ {language === 'EN' ? 'All connected channels (WhatsApp, Telegram, etc.)' : 'Todos los canales conectados (WhatsApp, Telegram, etc.)'}</li>
                <li>✗ {language === 'EN' ? 'All messages and conversation history' : 'Todos los mensajes e historial de conversaciones'}</li>
                <li>✗ {language === 'EN' ? 'All subscription and billing data' : 'Todos los datos de suscripción y facturación'}</li>
                <li>✗ {language === 'EN' ? 'All knowledge base tables in Supabase' : 'Todas las tablas de base de conocimiento en Supabase'}</li>
              </ul>
              <div style={{
                padding: '12px',
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid var(--danger-red)',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <p style={{
                  color: 'var(--danger-red)',
                  fontSize: '13px',
                  fontWeight: 600,
                  margin: 0
                }}>
                  {language === 'EN'
                    ? '⚠️ This action cannot be undone. All data will be lost forever.'
                    : '⚠️ Esta acción no se puede deshacer. Todos los datos se perderán para siempre.'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {language === 'EN' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'var(--danger-red)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {language === 'EN' ? 'Yes, Delete Everything' : 'Sí, Eliminar Todo'}
              </button>
            </div>
          </div>
        </div>
      )}
```

---

## 4. Testing Checklist

### Backend Testing

1. **Test Manual Deletions**
   ```bash
   # Test channel deletion for user
   SELECT * FROM channels WHERE user_id = [test_user_id];

   # Test verification code deletion
   SELECT * FROM verification_codes WHERE email = '[test_user_email]';

   # Test manager reference cleanup
   SELECT * FROM users WHERE manager_id = [test_user_id];
   ```

2. **Test CASCADE Deletions**
   ```bash
   # Verify companies deleted
   SELECT * FROM companies WHERE user_id = [deleted_user_id];

   # Verify channels deleted (via company cascade)
   SELECT * FROM channels WHERE company_id IN (
     SELECT id FROM companies WHERE user_id = [deleted_user_id]
   );

   # Verify messages deleted
   SELECT * FROM messages WHERE company_id IN (
     SELECT id FROM companies WHERE user_id = [deleted_user_id]
   );

   # Verify subscriptions deleted
   SELECT * FROM subscriptions WHERE user_id = [deleted_user_id];
   ```

3. **Test Supabase Cleanup**
   - Check Supabase dashboard to verify tables are deleted
   - Check company_tables metadata table

### Frontend Testing

1. **UI Flow**
   - Navigate to Profile Settings > Settings tab
   - Verify "Danger Zone" section appears with red border
   - Click "Delete Account Permanently" button
   - Verify confirmation modal appears with warning message
   - Click "Cancel" - modal should close
   - Click "Yes, Delete Everything" - account should be deleted

2. **Post-Deletion**
   - Verify redirect to login page
   - Verify cannot login with deleted credentials
   - Verify user data is gone from database

---

## 5. Security Considerations

1. **Authentication Required**: Endpoint requires valid JWT token
2. **No Soft Delete**: This is a hard delete - consider adding soft delete option
3. **Audit Trail**: Consider logging deletion events before deleting
4. **Stripe Webhook**: Ensure Stripe subscription is cancelled to prevent future charges
5. **Email Notification**: Send confirmation email before deletion (optional)

---

## 6. Optional Enhancements

### Add Confirmation Code

Require user to type "DELETE" or their email to confirm:

**In ProfileSettings.tsx modal, add before buttons:**

```typescript
const [confirmText, setConfirmText] = useState('');

// ... in modal JSX:

<div style={{ marginBottom: '20px' }}>
  <label style={{
    display: 'block',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    fontWeight: 600
  }}>
    {language === 'EN'
      ? 'Type DELETE to confirm:'
      : 'Escribe ELIMINAR para confirmar:'}
  </label>
  <input
    type="text"
    value={confirmText}
    onChange={(e) => setConfirmText(e.target.value)}
    placeholder={language === 'EN' ? 'DELETE' : 'ELIMINAR'}
    style={{
      width: '100%',
      padding: '12px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      color: 'var(--text-primary)',
      fontSize: '14px',
      outline: 'none'
    }}
  />
</div>

// Update delete button:
<button
  onClick={handleDeleteAccount}
  disabled={confirmText !== (language === 'EN' ? 'DELETE' : 'ELIMINAR')}
  style={{
    flex: 1,
    padding: '14px',
    background: confirmText !== (language === 'EN' ? 'DELETE' : 'ELIMINAR')
      ? 'var(--bg-secondary)'
      : 'var(--danger-red)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: 700,
    cursor: confirmText !== (language === 'EN' ? 'DELETE' : 'ELIMINAR')
      ? 'not-allowed'
      : 'pointer',
    fontSize: '14px',
    opacity: confirmText !== (language === 'EN' ? 'DELETE' : 'ELIMINAR') ? 0.5 : 1
  }}
>
  {language === 'EN' ? 'Yes, Delete Everything' : 'Sí, Eliminar Todo'}
</button>
```

---

## 7. Implementation Order

**Follow this exact order:**

1. ✅ **Backend First**
   - [ ] Add `SUPABASE_DB_URL` to config.py and .env
   - [ ] Create `app/services/supabase_cleanup.py`
   - [ ] Update `app/api/v1/users.py` with delete endpoint
   - [ ] Test endpoint with Postman/curl

2. ✅ **Frontend API Client**
   - [ ] Add `deleteAccount()` to `app/frontend/src/utils/api.ts`
   - [ ] Add `deleteAccount` to AuthContext interface
   - [ ] Add `deleteAccount` function to AuthProvider
   - [ ] Update AuthContext Provider value

3. ✅ **Frontend UI**
   - [ ] Import `deleteAccount` in ProfileSettings
   - [ ] Update `handleDeleteAccount` function
   - [ ] Add "Danger Zone" section to Settings tab
   - [ ] Add confirmation modal
   - [ ] Test UI flow

4. ✅ **Testing**
   - [ ] Create test user account
   - [ ] Create test companies and channels
   - [ ] Delete account via UI
   - [ ] Verify all data deleted from PostgreSQL
   - [ ] Verify Supabase tables deleted
   - [ ] Verify redirect to login works

---

## 8. Rollback Plan

If something goes wrong:

1. **Database Backup**: Always backup before testing deletion
   ```bash
   pg_dump -h localhost -U app -d app > backup_before_deletion.sql
   ```

2. **Restore if needed**:
   ```bash
   psql -h localhost -U app -d app < backup_before_deletion.sql
   ```

3. **Disable endpoint**: Comment out the delete endpoint in production if issues arise

---

## Summary

This roadmap provides a complete implementation of account deletion with:
- ✅ Proper PostgreSQL cascade handling
- ✅ Manual cleanup of non-cascade relationships
- ✅ Supabase table deletion
- ✅ Frontend confirmation UI with warnings
- ✅ Security and testing guidelines

**Total Implementation Time**: ~4-6 hours
**Files to Create**: 1 new file
**Files to Modify**: 4 existing files
**Database Changes**: None (only deletions)
