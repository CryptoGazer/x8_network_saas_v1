# X8 Network SaaS - Remaining Implementation Guide

This document outlines all the remaining tasks needed to complete the subscription and company management system.

## ✅ Completed Tasks

1. **Growth Plan Updated** - Changed from 5 to 6 channels in both frontend and backend
2. **Knowledge Base Mock Data Cleared** - Removed all demo data from Knowledge Base component
3. **Stripe Payment Links Backend** - Created payment link generation endpoints
4. **Supabase Configuration** - Added environment variables and client utilities

---

## 🔨 Remaining Implementation Tasks

### 1. Update CompanySetup Component - Growth Plan Channels

**File:** `app/frontend/src/components/CompanySetup.tsx`

**Location:** Line ~120-135 (getMaxChannels function)

**Change Required:**
```typescript
const getMaxChannels = (planId: string): number => {
  switch (planId) {
    case 'single':
      return 1;
    case 'double':
      return 2;
    case 'growth':
      return 6;  // Change from 5 to 6
    case 'special':
      return 999;
    default:
      return 1;
  }
};
```

---

### 2. Clear Mock Data from Remaining Components

#### A. IntegrationsTokens Component
**File:** `app/frontend/src/components/IntegrationsTokens.tsx`

**Task:** Remove any demo/mock integration data. Look for:
- Mock API keys
- Demo webhook URLs
- Sample token data

**Pattern to find:** Search for `useState` initialization with arrays or objects containing dummy data.

#### B. ConversationCenter Component
**File:** `app/frontend/src/components/ConversationCenter.tsx`

**Task:** Remove mock conversation data. This component likely has:
- Sample chat messages
- Demo user conversations
- Mock conversation statistics

**Action:** Set initial state to empty arrays `[]` instead of demo data.

#### C. OrderCalendar Component
**File:** `app/frontend/src/components/OrderCalendar.tsx`

**Task:** Remove sample orders/events. Look for:
- Demo calendar events
- Sample order data
- Mock booking information

#### D. ActivityLogs Component
**File:** `app/frontend/src/components/ActivityLogs.tsx`

**Task:** Clear activity log entries. Remove:
- Sample log entries
- Demo user activities
- Mock timestamps

#### E. TrainingStudio Component
**File:** `app/frontend/src/components/TrainingStudio.tsx`

**Task:** Remove training data examples:
- Demo training sessions
- Sample Q&A pairs
- Mock training results

#### F. AnalyticsDashboard Component
**File:** `app/frontend/src/components/AnalyticsDashboard.tsx`

**Task:** Clear analytics mock data:
- Sample charts data
- Demo statistics
- Mock metrics

**General Pattern for All Components:**
```typescript
// BEFORE (with mock data)
const [data, setData] = useState([
  { id: 1, name: "Demo Item", ... },
  { id: 2, name: "Sample Data", ... }
]);

// AFTER (empty)
const [data, setData] = useState([]);
```

---

### 3. Merge Billing & Subscriptions with Company Setup

This is a MAJOR task that requires creating a new combined component.

#### Step 3.1: Create New Combined Component

**New File:** `app/frontend/src/components/SubscriptionsCompanySetup.tsx`

**Structure:**
```typescript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';

export const SubscriptionsCompanySetup: React.FC = ({ language, onNavigate }) => {
  // State management
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState([]);

  // ... rest of implementation

  return (
    <div style={{ padding: '24px' }}>
      {/* Section 1: Plans & Subscriptions (from old Billing) */}
      <div className="plans-section">
        {/* Display subscription plans with Activate buttons */}
      </div>

      {/* Section 2: Company Setup (complete functionality from old CompanySetup) */}
      <div className="company-setup-section">
        {/* Channel selection, company creation, etc. */}
      </div>
    </div>
  );
};
```

#### Step 3.2: Copy Functionality

**From BillingSubscriptions.tsx:**
- Lines 200-380: Plans & Subscriptions section
- The subscription plan cards (Single, Double, Growth, Special Offer)
- Activate button logic

**From CompanySetup.tsx:**
- Entire component logic for:
  - Channel selection
  - Company name input
  - Company type selection (Product/Service)
  - Create company functionality

#### Step 3.3: Update Main Dashboard Router

**File:** `app/frontend/src/App.tsx` or wherever routing is defined

**Change:**
- Remove separate routes for "Billing & Subscriptions" and "Company Setup"
- Add single route for "Subscriptions & Company Setup"

---

### 4. Replace Payment Links with Stripe Subscriptions

Currently, the system creates one-time payment links. You need recurring subscriptions.

#### Step 4.1: Update Backend Endpoint

**File:** `app/api/v1/subscriptions.py`

**Current:** Lines 50-133 (`create_payment_link` function)

**Replace with:**
```python
@router.post("/create-subscription", response_model=dict)
async def create_subscription(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe subscription (not a payment link) for recurring billing.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured"
        )

    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan ID"
        )

    plan = SUBSCRIPTION_PLANS[plan_id]

    try:
        # Create or get Stripe customer
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.full_name,
                metadata={"user_id": str(current_user.id)}
            )
            current_user.stripe_customer_id = customer.id
            await db.commit()

        # Create a Price object (one-time, can be reused)
        price = stripe.Price.create(
            currency=plan["currency"],
            unit_amount=plan["amount"],
            recurring={"interval": "month"},
            product_data={
                "name": plan["name"],
                "description": plan["description"]
            }
        )

        # Create Checkout Session for SUBSCRIPTION (not payment link)
        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                "price": price.id,
                "quantity": 1
            }],
            mode='subscription',  # KEY: This makes it a subscription
            success_url=f"{settings.FRONTEND_URL}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?payment=cancelled",
            metadata={
                "user_id": str(current_user.id),
                "plan_id": plan_id
            }
        )

        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id,
            "plan": plan_id
        }

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
```

#### Step 4.2: Update Frontend API Client

**File:** `app/frontend/src/utils/api.ts`

**Change:** Lines 311-331

```typescript
async createSubscription(planId: string): Promise<{
  checkout_url: string;
  session_id: string;
  plan: string;
}> {
  const response = await fetch(`${this.baseUrl}/api/v1/subscriptions/create-subscription?plan_id=${planId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create subscription');
  }

  return await response.json();
}
```

#### Step 4.3: Update Frontend Handler

**File:** `app/frontend/src/components/SubscriptionsCompanySetup.tsx` (or BillingSubscriptions.tsx)

**Change:** Lines 61-71

```typescript
const handleActivatePlan = async (planId: string) => {
  try {
    const response = await apiClient.createSubscription(planId);  // Changed method name
    window.location.href = response.checkout_url;  // Changed property name
  } catch (error) {
    console.error('Failed to create subscription:', error);
    alert(language === 'EN'
      ? 'Failed to create subscription. Please try again.'
      : 'Error al crear suscripción. Inténtelo de nuevo.');
  }
};
```

---

### 5. Add Subscription Status Checking

You need to track whether a subscription is active for each company.

#### Step 5.1: Create Company-Subscription Link

**Database Migration Needed:**

Create a new migration to link companies with subscriptions:

```bash
cd /Users/cryptogazer/Desktop/PABLO/Freelance/WebApps/X8_Network_SaaS/x8_network_saas_v1
source .venv/bin/activate
alembic revision -m "add_subscription_id_to_companies"
```

**Migration File Content:**
```python
def upgrade() -> None:
    op.add_column('companies', sa.Column('subscription_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_companies_subscription', 'companies', 'subscriptions', ['subscription_id'], ['id'])

def downgrade() -> None:
    op.drop_constraint('fk_companies_subscription', 'companies', type_='foreignkey')
    op.drop_column('companies', 'subscription_id')
```

**Run Migration:**
```bash
alembic upgrade head
```

#### Step 5.2: Update Company Model

**File:** `app/models/company.py`

**Add after line 31:**
```python
subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)

# Add relationship
subscription = relationship("Subscription", back_populates="company")
```

#### Step 5.3: Create Status Check Endpoint

**File:** `app/api/v1/companies.py`

**Add new endpoint:**
```python
@router.get("/{company_id}/subscription-status")
async def get_company_subscription_status(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Check if company has an active subscription."""
    result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.user_id == current_user.id
        )
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if not company.subscription_id:
        return {"status": "inactive", "has_subscription": False}

    # Check subscription status
    result = await db.execute(
        select(Subscription).where(Subscription.id == company.subscription_id)
    )
    subscription = result.scalar_one_or_none()

    if not subscription or subscription.status != SubscriptionStatus.ACTIVE:
        return {"status": "inactive", "has_subscription": False}

    return {
        "status": "active",
        "has_subscription": True,
        "plan": subscription.plan,
        "end_date": subscription.end_date
    }
```

---

### 6. Add Disconnect/Cancel Subscription Option

#### Step 6.1: Backend Cancellation Endpoint

**File:** `app/api/v1/subscriptions.py`

**Add after webhook handler:**
```python
@router.post("/cancel/{subscription_id}")
async def cancel_subscription(
    subscription_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel a user's subscription."""
    # Get subscription
    result = await db.execute(
        select(Subscription).where(
            Subscription.id == subscription_id,
            Subscription.user_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    # Cancel in Stripe
    if subscription.stripe_subscription_id:
        try:
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to cancel in Stripe: {str(e)}"
            )

    # Update local database
    subscription.status = SubscriptionStatus.CANCELLED
    subscription.cancelled_at = datetime.utcnow()
    await db.commit()

    return {"message": "Subscription cancelled successfully"}
```

#### Step 6.2: Frontend Cancel Button

**Add to SubscriptionsCompanySetup.tsx:**

```typescript
const handleCancelSubscription = async (subscriptionId: number) => {
  if (!confirm(language === 'EN'
    ? 'Are you sure you want to cancel this subscription?'
    : '¿Está seguro de que desea cancelar esta suscripción?')) {
    return;
  }

  try {
    await apiClient.cancelSubscription(subscriptionId);
    alert(language === 'EN'
      ? 'Subscription cancelled successfully'
      : 'Suscripción cancelada exitosamente');
    // Refresh subscriptions list
    loadSubscriptions();
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    alert(language === 'EN'
      ? 'Failed to cancel subscription'
      : 'Error al cancelar suscripción');
  }
};

// In the UI, show cancel button for active subscriptions:
{subscription.status === 'active' && (
  <button
    onClick={() => handleCancelSubscription(subscription.id)}
    style={{
      padding: '8px 16px',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }}
  >
    {language === 'EN' ? 'Cancel Subscription' : 'Cancelar Suscripción'}
  </button>
)}
```

---

### 7. Channel Selection UI for Downgrading Plans

When a user downgrades (e.g., from Growth to Double), they need to deselect extra channels.

#### Implementation

**File:** `app/frontend/src/components/SubscriptionsCompanySetup.tsx`

**Add state for showing channel reduction modal:**
```typescript
const [showChannelReductionModal, setShowChannelReductionModal] = useState(false);
const [pendingPlanChange, setPendingPlanChange] = useState<{
  fromPlan: string;
  toPlan: string;
  currentChannels: string[];
  maxAllowed: number;
} | null>(null);

const handlePlanChange = (newPlanId: string) => {
  const currentPlan = getCurrentPlan(); // Get user's current plan
  const currentChannels = getCurrentChannels(); // Get currently selected channels

  const newMaxChannels = getMaxChannels(newPlanId);
  const currentMaxChannels = getMaxChannels(currentPlan);

  // Check if downgrading (reducing channels)
  if (newMaxChannels < currentChannels.length) {
    // Show modal to select which channels to keep
    setPendingPlanChange({
      fromPlan: currentPlan,
      toPlan: newPlanId,
      currentChannels: currentChannels,
      maxAllowed: newMaxChannels
    });
    setShowChannelReductionModal(true);
  } else {
    // No channel reduction needed, proceed with plan change
    activatePlan(newPlanId);
  }
};
```

**Channel Reduction Modal:**
```typescript
{showChannelReductionModal && pendingPlanChange && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>
        {language === 'EN'
          ? 'Select Channels to Keep'
          : 'Seleccionar Canales a Mantener'}
      </h3>
      <p>
        {language === 'EN'
          ? `Your new plan allows only ${pendingPlanChange.maxAllowed} channels. Please deselect ${pendingPlanChange.currentChannels.length - pendingPlanChange.maxAllowed} channel(s).`
          : `Su nuevo plan permite solo ${pendingPlanChange.maxAllowed} canales. Por favor deseleccione ${pendingPlanChange.currentChannels.length - pendingPlanChange.maxAllowed} canal(es).`}
      </p>

      <div className="channel-list">
        {pendingPlanChange.currentChannels.map(channel => (
          <div key={channel} className="channel-item">
            <input
              type="checkbox"
              checked={selectedChannelsForKeep.includes(channel)}
              onChange={() => toggleChannelForKeep(channel)}
              disabled={
                selectedChannelsForKeep.length >= pendingPlanChange.maxAllowed &&
                !selectedChannelsForKeep.includes(channel)
              }
            />
            <label>{channel}</label>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button onClick={() => setShowChannelReductionModal(false)}>
          {language === 'EN' ? 'Cancel' : 'Cancelar'}
        </button>
        <button
          onClick={confirmChannelReduction}
          disabled={selectedChannelsForKeep.length !== pendingPlanChange.maxAllowed}
        >
          {language === 'EN' ? 'Confirm' : 'Confirmar'}
        </button>
      </div>
    </div>
  </div>
)}
```

---

### 8. Blur Company Data When Subscription Inactive

#### Implementation

**File:** `app/frontend/src/components/SubscriptionsCompanySetup.tsx`

**Add conditional rendering:**
```typescript
const CompanyDataSection = ({ company }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'active' | 'inactive'>('loading');

  useEffect(() => {
    // Check subscription status
    apiClient.getCompanySubscriptionStatus(company.id)
      .then(status => {
        setSubscriptionStatus(status.has_subscription ? 'active' : 'inactive');
      })
      .catch(() => setSubscriptionStatus('inactive'));
  }, [company.id]);

  if (subscriptionStatus === 'loading') {
    return <div>Loading...</div>;
  }

  if (subscriptionStatus === 'inactive') {
    return (
      <div
        style={{
          position: 'relative',
          filter: 'blur(8px)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        {/* Blurred company data */}
        <div style={{ padding: '20px' }}>
          <p>Company Name: {company.name}</p>
          <p>Channels: {company.channels.join(', ')}</p>
          <p>Type: {company.type}</p>
        </div>

        {/* Overlay message */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            filter: 'none',
            pointerEvents: 'auto',
            textAlign: 'center'
          }}
        >
          <h3>
            {language === 'EN'
              ? 'Subscription Required'
              : 'Suscripción Requerida'}
          </h3>
          <p>
            {language === 'EN'
              ? 'Please activate a subscription to access company data'
              : 'Por favor active una suscripción para acceder a los datos de la empresa'}
          </p>
          <button
            onClick={() => scrollToPlansSection()}
            style={{
              padding: '10px 20px',
              background: 'var(--brand-cyan)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {language === 'EN' ? 'View Plans' : 'Ver Planes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Normal unblurred company data */}
      <div style={{ padding: '20px' }}>
        <p>Company Name: {company.name}</p>
        <p>Channels: {company.channels.join(', ')}</p>
        <p>Type: {company.type}</p>
      </div>
    </div>
  );
};
```

---

### 9. Update Account Overview to Show Multiple Companies

#### Current State
Account Overview shows a single company name.

#### Required Change
**File:** `app/frontend/src/components/BillingSubscriptions.tsx` (or the new combined component)

**Find:** Lines with company name display (around line 140-150)

**Replace with:**
```typescript
// Fetch all user companies
const [userCompanies, setUserCompanies] = useState<string[]>([]);

useEffect(() => {
  // Load companies from API or localStorage
  const loadCompanies = async () => {
    try {
      const companies = await apiClient.getUserCompanies();
      setUserCompanies(companies.map(c => c.name));
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };
  loadCompanies();
}, []);

// In the Account Overview section:
<div style={{ marginBottom: '16px' }}>
  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
    {language === 'EN' ? 'Companies' : 'Empresas'}
  </div>
  <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
    {userCompanies.length > 0
      ? userCompanies.join(', ')
      : '-'
    }
  </div>
</div>
```

---

## 🎯 Summary Checklist

### Quick Wins (30 mins - 1 hour each)
- [ ] Update CompanySetup getMaxChannels to 6 for growth plan
- [ ] Clear mock data from IntegrationsTokens
- [ ] Clear mock data from ConversationCenter
- [ ] Clear mock data from OrderCalendar
- [ ] Clear mock data from ActivityLogs
- [ ] Clear mock data from TrainingStudio
- [ ] Clear mock data from AnalyticsDashboard
- [ ] Update Account Overview to show multiple companies

### Medium Tasks (2-4 hours each)
- [ ] Create combined SubscriptionsCompanySetup component
- [ ] Replace payment links with Stripe subscriptions
- [ ] Add subscription status checking
- [ ] Add cancel subscription functionality

### Complex Tasks (4-8 hours each)
- [ ] Implement channel selection UI for downgrades
- [ ] Implement data blurring for inactive subscriptions
- [ ] Full integration testing

---

## 📝 Testing Checklist

After implementing each feature, test:

### Subscription Flow
1. Create a new subscription
2. Verify Stripe checkout opens
3. Complete payment in Stripe test mode
4. Verify webhook updates subscription status
5. Check that company data is accessible

### Cancellation Flow
1. Cancel an active subscription
2. Verify cancellation in Stripe dashboard
3. Check that subscription status updates
4. Verify company data becomes blurred

### Downgrade Flow
1. Upgrade from Single to Growth
2. Select 6 channels
3. Downgrade from Growth to Double
4. Verify channel selection modal appears
5. Select 2 channels to keep
6. Confirm downgrade works

### Data Access Control
1. Create company without subscription
2. Verify data is blurred
3. Activate subscription
4. Verify data becomes accessible
5. Cancel subscription
6. Verify data gets blurred again

---

## 🚀 Deployment Notes

### Environment Variables Required
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (when implementing CSV import)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Stripe Webhook Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/v1/subscriptions/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Database Migrations
Run all pending migrations before deployment:
```bash
alembic upgrade head
```

---

## 💡 Tips & Best Practices

1. **Test with Stripe Test Mode**: Use test credit card `4242 4242 4242 4242`
2. **Use Stripe CLI for webhook testing locally**: `stripe listen --forward-to localhost:8000/api/v1/subscriptions/webhook`
3. **Clear localStorage**: When testing, clear browser localStorage to reset demo data
4. **Check subscription status**: Always verify subscription status before showing data
5. **Handle edge cases**: User cancels during checkout, payment fails, etc.

---

## 📚 Useful Resources

- [Stripe Subscriptions API](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [FastAPI SQLAlchemy Async](https://fastapi.tiangolo.com/advanced/async-sql-databases/)
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)

---

**Last Updated:** December 10, 2025
**Version:** 1.0
**Author:** Claude Code Implementation Assistant
