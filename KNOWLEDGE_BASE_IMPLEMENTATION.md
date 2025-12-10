# Knowledge Base CSV Upload Implementation Guide

## Completed Changes

### 1. Header Logo Click Handler ✅
**File**: `app/frontend/src/components/Header.tsx`

Added click handler to redirect based on user role:
- Client → WINDOW_0 (main dashboard)
- Manager → WINDOW_MANAGER_DASHBOARD
- Admin → WINDOW_ADMIN_DASHBOARD

### 2. Backend API Endpoints ✅
**File**: `app/api/v1/knowledge_base.py` (NEW)

Created endpoints:
- `POST /api/v1/knowledge-base/upload-csv` - Upload CSV files
- `GET /api/v1/knowledge-base/list` - List all KBs for user
- `GET /api/v1/knowledge-base/data/{table_name}` - Get KB data
- `DELETE /api/v1/knowledge-base/delete/{table_name}` - Delete KB

### 3. Supabase Service ✅
**File**: `app/services/supabase.py` (COMPLETELY REWRITTEN)

Implemented:
- CSV row conversion for Product and Service schemas
- Automatic external_id generation from SKU or product_name
- Type conversion (numeric, text, JSONB for cities)
- Upsert logic by external_id (prevents duplicates)
- Validation: Only ONE Product and ONE Service KB per company
- Registry tracking in `kb_registry` table

### 4. Main API Router ✅
**File**: `app/main.py`

Added knowledge_base router to FastAPI application.

### 5. Supabase Setup SQL ✅
**File**: `supabase_setup.sql` (NEW)

Created SQL script for:
- `kb_registry` table with RLS policies
- Indexes for performance
- Unique constraint on (user_id, company_name, kb_type)

## Implementation Details

### Workflow

1. **User uploads CSV** via frontend
2. **Backend receives CSV** → validates file type
3. **Check existing KB** → ensures only 1 Product and 1 Service per company
4. **Generate table name** → e.g., `kb_company_name_product`
5. **Call Supabase RPC** → creates table using SQL functions provided
6. **Convert CSV data** → maps columns to Product/Service schema
7. **Upsert data** → by external_id (prevents duplicates)
8. **Register in kb_registry** → tracks metadata
9. **Return success** → frontend displays the data

### Data Type Conversions

**Product Schema**:
```typescript
external_id: Generated from SKU or product_name
product_name: text (required)
sku: text
price_eur, logistics_price_eur, free_delivery: float
stock_units, delivery_time_hours, payment_reminder: integer
cities: JSONB array (parsed from CSV comma-separated or JSON)
source_updated_at: timestamptz (auto-set to now())
```

**Service Schema**:
```typescript
external_id: Generated from SKU or product_name
product_name: text (required)
service_category, service_subcategory: text
price_eur: float
stock_units, payment_reminder: integer
source_updated_at: timestamptz (auto-set to now())
```

### Upsert Logic

The backend uses `on_conflict='external_id'` which means:
- If SKU already exists → **UPDATE** the row
- If SKU is new → **INSERT** a new row

This prevents duplicate entries when re-uploading CSVs.

## Frontend Integration Tasks (TODO)

### Task 1: Remove Activate KB Function
**File**: `app/frontend/src/components/KnowledgeBase.tsx`

Remove these functions and UI elements:
- `showActivateModal` state
- `handleActivate` function
- Activate button in the UI
- Activate modal component

The KB is automatically "activated" upon CSV upload.

### Task 2: Integrate CSV Upload with Backend
**File**: `app/frontend/src/components/KnowledgeBase.tsx`

Update the `handleBulkUpload` function:

```typescript
const handleBulkUpload = async () => {
  if (!csvData || csvData.length === 0) {
    alert('No data to upload');
    return;
  }

  if (!selectedCompany) {
    alert(language === 'EN' ? 'Please select a company' : 'Por favor selecciona una empresa');
    return;
  }

  try {
    // Convert csvData back to CSV format
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => csvHeaders.map(h => row[h] || '').join(','))
    ].join('\n');

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], `${kbName || 'knowledge_base'}.csv`, { type: 'text/csv' });

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_name', selectedCompany);
    formData.append('kb_type', kbType);

    // Get auth token
    const token = localStorage.getItem('access_token');

    // Upload to backend
    const response = await fetch('http://localhost:8000/api/v1/knowledge-base/upload-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || 'Upload failed');
    }

    alert(language === 'EN'
      ? `Knowledge base created successfully! ${result.rows_imported} rows imported.`
      : `¡Base de conocimiento creada exitosamente! ${result.rows_imported} filas importadas.`
    );

    // Refresh the registry
    await fetchKBRegistry();

    // Close modal and reset state
    setShowBulkUploadModal(false);
    setCsvData([]);
    setCsvHeaders([]);
    setKbName('');

  } catch (error: any) {
    alert(language === 'EN'
      ? `Failed to upload: ${error.message}`
      : `Error al cargar: ${error.message}`
    );
  }
};
```

### Task 3: Fetch and Display KB Data
**File**: `app/frontend/src/components/KnowledgeBase.tsx`

Add functions to fetch data from backend:

```typescript
// Fetch KB registry on component mount
const fetchKBRegistry = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const url = selectedCompany
      ? `http://localhost:8000/api/v1/knowledge-base/list?company_name=${encodeURIComponent(selectedCompany)}`
      : 'http://localhost:8000/api/v1/knowledge-base/list';

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok && result.knowledge_bases) {
      // Transform backend data to registry format
      const transformedRegistry: KBRegistryEntry[] = result.knowledge_bases.map((kb: any) => ({
        kb_id: kb.table_name,
        kb_name: kb.table_name,
        kb_type: kb.kb_type,
        linked_company: kb.company_name,
        total_rows: kb.row_count || 0,
        media_count: 0,
        activated_at: kb.created_at,
        status: 'Activated'
      }));

      setRegistry(transformedRegistry);
    }
  } catch (error) {
    console.error('Failed to fetch KB registry:', error);
  }
};

// Fetch KB data when user selects a company
const fetchKBData = async (tableName: string) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(
      `http://localhost:8000/api/v1/knowledge-base/data/${tableName}?limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (response.ok && result.data) {
      // Set the rows based on KB type
      const kbEntry = registry.find(r => r.kb_id === tableName);
      if (kbEntry) {
        if (kbEntry.kb_type === 'Product') {
          setProductRows(result.data);
        } else {
          setServiceRows(result.data);
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch KB data:', error);
  }
};

// Call on component mount and when selectedCompany changes
useEffect(() => {
  fetchKBRegistry();
}, [selectedCompany]);

// Call when registry updates
useEffect(() => {
  if (selectedCompany && registry.length > 0) {
    const companyKB = registry.find(r => r.linked_company === selectedCompany);
    if (companyKB) {
      fetchKBData(companyKB.kb_id);
    }
  }
}, [registry, selectedCompany]);
```

### Task 4: Update UI to Show Backend Data

Replace localStorage-based data loading with API calls:

1. Remove all localStorage.getItem/setItem for KB data
2. Use fetchKBRegistry() and fetchKBData() instead
3. Show loading states while fetching
4. Display error messages if fetch fails

### Task 5: Validation on Upload

Add UI validation before upload:

```typescript
// Check if company already has this KB type
const existingKB = registry.find(
  r => r.linked_company === selectedCompany && r.kb_type === kbType
);

if (existingKB) {
  alert(language === 'EN'
    ? `This company already has a ${kbType} knowledge base. Only one ${kbType} KB per company is allowed.`
    : `Esta empresa ya tiene una base de conocimiento de ${kbType}. Solo se permite una KB de ${kbType} por empresa.`
  );
  return;
}
```

## Supabase Setup Instructions

### Step 1: Run SQL Functions

In Supabase SQL Editor, run the SQL provided by the user for:
1. `admin_create_catalog_table` (Product)
2. `admin_create_service_table` (Service)

### Step 2: Create kb_registry Table

Run the SQL in `supabase_setup.sql`:

```bash
# From project root:
cat supabase_setup.sql
# Copy and paste into Supabase SQL Editor
```

### Step 3: Verify Setup

```sql
-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('admin_create_catalog_table', 'admin_create_service_table');

-- Check if kb_registry table exists
SELECT * FROM information_schema.tables WHERE table_name = 'kb_registry';
```

## Testing the Implementation

### Backend Testing

```bash
# Start the backend
cd app
uvicorn main:app --reload --port 8000

# Test the endpoint
curl -X POST "http://localhost:8000/api/v1/knowledge-base/upload-csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.csv" \
  -F "company_name=Test Company" \
  -F "kb_type=Product"
```

### Frontend Testing

1. Upload a CSV with Product columns
2. Check Supabase for new table: `kb_test_company_product`
3. Verify data in kb_registry table
4. Try uploading another CSV for same company/type → should fail with error
5. Upload CSV with Service type → should succeed

## CSV Format Examples

### Product CSV
```csv
product_name,sku,description,price_eur,stock_units,cities
Product 1,SKU001,Description,29.99,100,"Madrid,Barcelona"
Product 2,SKU002,Description,39.99,50,"['Valencia','Sevilla']"
```

### Service CSV
```csv
product_name,sku,service_category,service_subcategory,price_eur,location
Service 1,SVC001,Consulting,Business,99.99,Madrid
Service 2,SVC002,Training,Technical,149.99,Barcelona
```

## Common Issues and Solutions

### Issue 1: "Supabase is not configured"
**Solution**: Add to `app/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Issue 2: "Failed to create table: table_already_exists"
**Solution**: Table exists from previous upload. Either:
- Use the existing table (upsert will update data)
- Delete table manually in Supabase
- Use a different company name

### Issue 3: "Only one Product/Service KB per company is allowed"
**Solution**: This is intentional. Delete the existing KB first or use a different company name.

### Issue 4: CSV columns don't match schema
**Solution**: Backend auto-maps common column names. Ensure CSV has at least:
- `product_name` (required)
- `sku` (recommended for upsert)

Missing columns will be set to NULL.

## Next Steps

1. ✅ Run Supabase SQL setup
2. ⏳ Update KnowledgeBase.tsx frontend component
3. ⏳ Remove Activate KB function
4. ⏳ Test CSV upload end-to-end
5. ⏳ Add error handling and loading states
6. ⏳ Add data export functionality (optional)

## API Documentation

Full API docs available at: `http://localhost:8000/docs` after starting the backend.

## Environment Variables Required

```env
# Add to app/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key  # Optional, not used by backend
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Required
```
