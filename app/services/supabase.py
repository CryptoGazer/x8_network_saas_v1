from supabase import create_client, Client
from uuid import UUID
from app.core.config import settings
from typing import Optional, Dict, List, Any
import pandas as pd
import re
from decimal import Decimal
from datetime import datetime
import json
import asyncio


class SupabaseService:
    """Service for interacting with Supabase database for Knowledge Base CSV data storage."""

    def __init__(self):
        self.client: Optional[Client] = None
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            self.client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )

    def is_configured(self) -> bool:
        """Check if Supabase is properly configured."""
        return self.client is not None

    def _normalize_column_name(self, column_name: str) -> str:
        """
        Normalize column names for flexible matching.
        Handles: case-insensitive, spaces, underscores, special chars.

        Examples:
        - "Service Name" -> "servicename"
        - "service_name" -> "servicename"
        - "SERVICE NAME" -> "servicename"
        - "ServiceName" -> "servicename"
        - "Price A (€)" -> "pricea"
        """
        # Convert to lowercase
        normalized = column_name.lower()
        # Remove special characters (keep only alphanumeric)
        normalized = re.sub(r'[^a-z0-9]', '', normalized)
        return normalized

    def generate_table_name(self, company_name: str, kb_type: str) -> str:
        """
        Generate table name with format: "{CompanyName} {Type}".
        Example: "DB Service AIAgent Service" or "DB Service AIAgent Product"
        """
        # Keep original company name and add space + capitalized type
        # This matches the required format: "DB Product {CompanyName}" or "DB Service {CompanyName}"
        return f"DB {kb_type} {company_name}"

    async def check_existing_kb(self, user_id: int, company_name: str, kb_type: str) -> Dict[str, Any]:
        """
        Check if a KB table already exists by trying to query it.
        Since we don't use kb_registry, we directly check if the table exists.
        """
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            table_name = self.generate_table_name(company_name, kb_type)
            # Try to query the table - if it exists, we'll get a response
            response = self.client.table(table_name).select('*', count='exact').limit(1).execute()

            # Table exists
            return {
                "count": 1,
                "existing": [{"table_name": table_name}]
            }
        except Exception as e:
            # Table doesn't exist or error accessing it
            error_msg = str(e).lower()
            if 'not found' in error_msg or 'does not exist' in error_msg or 'pgrst' in error_msg:
                return {"count": 0, "existing": []}
            # For other errors, also return 0
            return {"count": 0, "existing": []}

    def _convert_csv_row_to_product(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a CSV row to match Product table schema."""
        converted = {}

        # Normalized field mapping: normalized_name -> database_column
        # All keys MUST be normalized (no spaces, lowercase, no special chars)
        normalized_field_mapping = {
            # Product Name variations
            'productname': 'product_name',
            'name': 'product_name',
            # SKU
            'sku': 'sku',
            # Description
            'description': 'description',
            # Unit/Package Type variations
            'unit': 'unit',
            'packagetype': 'unit',
            # Website/Webpage URL variations
            'webpagelink': 'website_url',
            'websiteurl': 'website_url',
            'webpage': 'website_url',
            'website': 'website_url',
            # Image URL variations
            'productimage': 'image_url',
            'imageurl': 'image_url',
            'image': 'image_url',
            # Video URL variations
            'videolink': 'video_url',
            'videourl': 'video_url',
            'video': 'video_url',
            # Price variations
            'pricea': 'price_eur',
            'price': 'price_eur',
            'priceeur': 'price_eur',
            # Delivery Price variations
            'deliveryprice': 'logistics_price_eur',
            'deliverypriceeur': 'logistics_price_eur',
            'logisticsprice': 'logistics_price_eur',
            'logisticspriceeur': 'logistics_price_eur',
            # Free Delivery variations
            'sumfreedelivery': 'free_delivery',
            'sumfreedeliveryeur': 'free_delivery',
            'freedelivery': 'free_delivery',
            # Stock variations
            'stockactual': 'stock_units',
            'stock': 'stock_units',
            'stockunits': 'stock_units',
            # Delivery Time variations
            'deliverytime': 'delivery_time_hours',
            'deliverytimehours': 'delivery_time_hours',
            # Payment Reminder variations
            'paymentreminder': 'payment_reminder',
            'paymentreminderdays': 'payment_reminder',
            'reminder': 'payment_reminder',
            # Supplier Contact variations
            'suppliercontact': 'supplier_contact',
            'suppliercontactdetails': 'supplier_contact',
            # Supplier Company Services variations
            'suppliercompanyservices': 'supplier_company_services',
            'supplierservices': 'supplier_company_services',
            # Warehouse Address variations
            'warehouseaddress': 'warehouse_address',
            'warehousephysicaladdress': 'warehouse_address',
            'warehouse': 'warehouse_address',
            # Cities
            'cities': 'cities',
            'city': 'cities'
        }

        # Process each row field
        for csv_col, value in row.items():
            # Normalize the CSV column name
            normalized_col = self._normalize_column_name(csv_col)

            # Skip Nº/Number column
            if normalized_col in ['n', 'no', 'number']:
                continue

            # Get mapped database column name
            if normalized_col in normalized_field_mapping:
                db_col = normalized_field_mapping[normalized_col]

                # Check if value is empty/null
                is_empty = pd.isna(value) or value == ''

                # Convert numeric fields
                if db_col in ['price_eur', 'logistics_price_eur', 'free_delivery']:
                    try:
                        converted[db_col] = float(value) if not is_empty else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                elif db_col in ['stock_units', 'delivery_time_hours', 'payment_reminder']:
                    try:
                        converted[db_col] = int(value) if not is_empty else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                elif db_col == 'cities':
                    # Handle cities as JSONB
                    if is_empty:
                        converted['cities'] = []
                    else:
                        try:
                            if isinstance(value, str):
                                # Try to parse as JSON array
                                converted['cities'] = json.loads(value)
                            elif isinstance(value, list):
                                converted['cities'] = value
                            else:
                                converted['cities'] = [str(value)]
                        except json.JSONDecodeError:
                            # If not JSON, split by comma
                            converted['cities'] = [c.strip() for c in str(value).split(',')]
                else:
                    # For text fields, store empty string instead of None to avoid NOT NULL violations
                    converted[db_col] = str(value) if not is_empty else ''

        # Set source_updated_at
        converted['source_updated_at'] = datetime.now().isoformat()

        return converted

    def _convert_csv_row_to_service(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert a CSV row to match Service table schema.
        Uses flexible column name matching (case-insensitive, spaces, underscores).
        """
        converted = {}

        # Normalized field mapping: normalized_name -> database_column
        # All keys MUST be normalized (no spaces, lowercase, no special chars) since we use _normalize_column_name()
        normalized_field_mapping = {
            # Service/Product Name variations
            'servicename': 'product_name',
            'productname': 'product_name',
            'name': 'product_name',
            # Service Subcategory variations
            'servicesubcategory': 'service_subcategory',
            'subcategory': 'service_subcategory',
            # Service Category variations
            'servicecategory': 'service_category',
            'category': 'service_category',
            # SKU
            'sku': 'sku',
            # Unit
            'unit': 'unit',
            # Duration
            'duration': 'duration',
            'durationhours': 'duration',
            # Format
            'format': 'format',
            # Description
            'description': 'description',
            # Included
            'included': 'included',
            # Not Included variations
            'notincluded': 'not_included',
            # What Guarantee variations
            'whatguarantee': 'what_guarantee',
            'guarantee': 'what_guarantee',
            # What Not Guarantee variations
            'whatnotguarantee': 'what_not_guarantee',
            'notguarantee': 'what_not_guarantee',
            # Suitable For variations
            'suitablefor': 'suitable_for',
            # Not Suitable For variations
            'notsuitablefor': 'not_suitable_for',
            # Specialist Initials variations
            'specialistinitials': 'specialist_initials',
            'initials': 'specialist_initials',
            # Specialist Area variations
            'specialistarea': 'specialist_area',
            'area': 'specialist_area',
            # Website/Webpage URL variations
            'webpagelink': 'website_url',
            'websiteurl': 'website_url',
            'webpage': 'website_url',
            'website': 'website_url',
            # Image URL variations
            'productimage': 'image_url',
            'imageurl': 'image_url',
            'image': 'image_url',
            # Video URL variations
            'videolink': 'video_url',
            'videourl': 'video_url',
            'video': 'video_url',
            # Price variations
            'pricea': 'price_eur',
            'price': 'price_eur',
            'priceeur': 'price_eur',
            # Payment Reminder variations
            'paymentreminder': 'payment_reminder',
            'paymentreminderdays': 'payment_reminder',
            'reminder': 'payment_reminder',
            # Stock variations
            'stockactual': 'stock_units',
            'stock': 'stock_units',
            'stockunits': 'stock_units',
            # Location
            'location': 'location',
            # Specialist Contacts variations
            'specialistcontacts': 'specialist_contacts',
            'contacts': 'specialist_contacts',
            # Company
            'company': 'company',
            'companyname': 'company',
            # Details
            'details': 'details'
        }

        # Debug: Track unmapped columns
        unmapped_cols = []

        # Process each row
        for csv_col, value in row.items():
            # Normalize the CSV column name for flexible matching
            normalized_col = self._normalize_column_name(csv_col)

            # Skip Nº/Number column
            if normalized_col in ['n', 'no', 'number']:
                continue

            # Get mapped database column name
            if normalized_col in normalized_field_mapping:
                db_col = normalized_field_mapping[normalized_col]

                # Check if value is empty/null
                is_empty = pd.isna(value) or value == '' or str(value).strip() == ''

                # Convert numeric fields
                if db_col in ['price_eur']:
                    try:
                        converted[db_col] = float(value) if not is_empty else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                elif db_col in ['stock_units', 'payment_reminder']:
                    try:
                        converted[db_col] = int(value) if not is_empty else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                else:
                    # For text fields, preserve actual values
                    if not is_empty:
                        converted[db_col] = str(value).strip()
                    else:
                        converted[db_col] = ''
            else:
                # Track unmapped column for debugging
                unmapped_cols.append(f"'{csv_col}' -> normalized: '{normalized_col}'")

        # Log unmapped columns once at the end
        if unmapped_cols:
            print(f"⚠️  Unmapped Service columns: {', '.join(unmapped_cols[:5])}")  # Show first 5 only

        # Ensure product_name is never empty (it's required)
        # if 'product_name' not in converted or not converted['product_name']:
        #     converted['product_name'] = 'Unnamed Service'

        # Set source_updated_at
        converted['source_updated_at'] = datetime.now().isoformat()

        return converted

    async def create_kb_table(
        self,
        table_name: str,
        df: pd.DataFrame,
        kb_type: str,
        user_id: int,
        company_name: str
    ) -> Dict[str, Any]:
        """
        Create a new knowledge base table and upload CSV data.
        If table already exists, upsert the data instead.
        Uses Supabase RPC to create the table dynamically.
        """
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Step 1: Check if table already exists by trying to query it
            table_exists = False
            try:
                test_query = self.client.table(table_name).select('*').limit(1).execute()
                table_exists = True
                print(f"Table '{table_name}' already exists. Will upsert data.")
            except Exception as e:
                error_msg = str(e).lower()
                if 'not found' in error_msg or 'does not exist' in error_msg or 'pgrst205' in error_msg:
                    table_exists = False
                    print(f"Table '{table_name}' does not exist. Will create it.")
                else:
                    raise

            # Step 2: Create table if it doesn't exist
            if not table_exists:
                if kb_type == "Product":
                    rpc_result = self.client.rpc('admin_create_catalog_table', {'p_table': table_name}).execute()
                else:  # Service
                    rpc_result = self.client.rpc('admin_create_service_table', {'p_service_table': table_name}).execute()

                if not rpc_result.data.get('ok'):
                    raise Exception(f"Failed to create table: {rpc_result.data.get('error', 'Unknown error')}")

                # IMPORTANT: Wait for Supabase schema cache to refresh after table creation
                # Without this delay, the insert operation may fail with "table not found in schema cache"
                await asyncio.sleep(3)

            # Step 3: Clean DataFrame - remove empty rows AGGRESSIVELY
            # A row is considered empty if ALL its values are NaN/empty
            df_cleaned = df.dropna(how='all')  # Drop rows where ALL columns are NaN

            # Find the actual name column (Service Name, Product Name, or just Name)
            name_column = None
            for col in df_cleaned.columns:
                col_normalized = self._normalize_column_name(col)
                if col_normalized in ['servicename', 'productname', 'name']:
                    name_column = col
                    break

            # Filter out rows where the name column is empty
            if name_column:
                df_cleaned = df_cleaned[
                    df_cleaned[name_column].notna() &
                    (df_cleaned[name_column] != '') &
                    (df_cleaned[name_column].astype(str).str.strip() != '')
                ]
                print(f"📊 Original DataFrame rows: {len(df)}, After filtering by '{name_column}': {len(df_cleaned)}")
            else:
                print(f"⚠️  WARNING: Could not find name column for filtering. Processing all {len(df_cleaned)} rows.")
                print(f"📊 Original DataFrame rows: {len(df)}, After cleaning: {len(df_cleaned)}")

            # Step 4: Convert DataFrame rows to match schema
            records = []
            for idx, row in df_cleaned.iterrows():
                try:
                    if kb_type == "Product":
                        converted_row = self._convert_csv_row_to_product(row.to_dict())
                    else:
                        converted_row = self._convert_csv_row_to_service(row.to_dict())

                    # Only add if the row has a product_name (required field)
                    if converted_row.get('product_name') and converted_row['product_name'].strip():
                        records.append(converted_row)
                    else:
                        print(f"⚠️  Skipping row {idx}: No product_name found")
                except Exception as e:
                    print(f"⚠️  Error converting row {idx}: {str(e)}")
                    continue

            print(f"✅ Valid records to insert: {len(records)}")

            # Step 4: Insert or upsert data based on SKU field
            if records:
                if table_exists:
                    # Table exists - UPSERT the data (update existing by SKU or insert new)
                    # Supabase upsert() uses ON CONFLICT to handle duplicates
                    # The 'sku' field will be used as the conflict resolution key
                    response = self.client.table(table_name).upsert(
                        records,
                        on_conflict='sku'  # If SKU matches, update; otherwise insert
                    ).execute()
                    print(f"✅ UPSERT completed: {len(records)} records processed (updated existing or inserted new)")
                else:
                    # New table - insert data
                    response = self.client.table(table_name).insert(records).execute()
                    print(f"✅ INSERT completed: {len(records)} records inserted")

            # No kb_registry needed - tables are just named "DB {kb_type} {company_name}"

            return {
                "success": True,
                "rows_imported": len(records),
                "table_name": table_name
            }

        except Exception as e:
            raise Exception(f"Failed to create KB table: {str(e)}")

    async def list_user_kbs(
        self,
        user_id: int,
        company_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List all knowledge bases for a user by checking which tables exist in Supabase.

        Since we use naming convention "DB {kb_type} {company_name}", we can check
        if tables exist for each company.
        """
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        kbs = []

        # If company_name is provided, only check for that company's KBs
        # Otherwise, we'd need to get list of companies from PostgreSQL
        if company_name:
            companies_to_check = [company_name]
        else:
            # For now, if no company specified, return empty list
            # In production, you'd query PostgreSQL for all user's companies
            return []

        # Check for both Product and Service tables for each company
        for company in companies_to_check:
            for kb_type in ["Product", "Service"]:
                table_name = self.generate_table_name(company, kb_type)

                try:
                    # Try to query the table and get row count
                    response = self.client.table(table_name).select('*', count='exact').limit(1).execute()

                    # Table exists - get the count
                    row_count = response.count if hasattr(response, 'count') else 0

                    # Only add to list if table has data
                    if row_count > 0:
                        kbs.append({
                            "table_name": table_name,
                            "company_name": company,
                            "kb_type": kb_type,
                            "row_count": row_count,
                            "created_at": datetime.now().isoformat()  # We don't have actual creation time
                        })
                        print(f"✅ Found KB table: {table_name} with {row_count} rows")

                except Exception as e:
                    # Table doesn't exist or error - skip it
                    error_msg = str(e).lower()
                    if 'not found' not in error_msg and 'does not exist' not in error_msg:
                        print(f"⚠️  Error checking table {table_name}: {str(e)}")
                    continue

        return kbs

    async def get_kb_data(
        self,
        table_name: str,
        user_id: int,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get data from a knowledge base table."""
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Get total count
            count_response = self.client.table(table_name).select('*', count='exact').execute()
            total_count = count_response.count if hasattr(count_response, 'count') else len(count_response.data)

            # Get paginated data
            response = self.client.table(table_name)\
                .select('*')\
                .range(offset, offset + limit - 1)\
                .execute()

            return {
                "rows": response.data,
                "total_count": total_count
            }

        except Exception as e:
            raise Exception(f"Failed to retrieve KB data: {str(e)}")

    async def delete_kb_table(self, table_name: str, user_id: int) -> Dict[str, Any]:
        """Delete a knowledge base table."""
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Note: Supabase doesn't allow dropping tables via client SDK
            # You would need to use admin SQL or manual deletion
            # For now, we'll just remove from registry

            self.client.table('kb_registry')\
                .delete()\
                .eq('table_name', table_name)\
                .eq('user_id', user_id)\
                .execute()

            return {"success": True}

        except Exception as e:
            raise Exception(f"Failed to delete KB: {str(e)}")

    async def add_row(
        self,
        table_name: str,
        row_data: Dict[str, Any],
        user_id: int
    ) -> Dict[str, Any]:
        """Add a new row to a knowledge base table."""
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Add source_updated_at timestamp
            row_data['source_updated_at'] = datetime.now().isoformat()

            # Insert the row
            response = self.client.table(table_name).insert(row_data).execute()

            if response.data and len(response.data) > 0:
                # Update row count in registry
                await self._update_registry_row_count(table_name, user_id)
                return response.data[0]
            else:
                raise Exception("No data returned from insert")

        except Exception as e:
            raise Exception(f"Failed to add row: {str(e)}")

    async def update_row(
        self,
        table_name: str,
        row_id: str,
        row_data: Dict[str, Any],
        user_id: int
    ) -> Dict[str, Any]:
        """Update a row in a knowledge base table."""
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Update source_updated_at timestamp
            row_data['source_updated_at'] = datetime.now().isoformat()

            # Update the row
            response = self.client.table(table_name)\
                .update(row_data)\
                .eq('id', row_id)\
                .execute()

            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                raise Exception("No data returned from update")

        except Exception as e:
            raise Exception(f"Failed to update row: {str(e)}")

    async def delete_row(
        self,
        table_name: str,
        row_id: str,
        user_id: int
    ) -> Dict[str, Any]:
        """Delete a row from a knowledge base table."""
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Delete the row
            response = self.client.table(table_name)\
                .delete()\
                .eq('id', row_id)\
                .execute()

            # Update row count in registry
            await self._update_registry_row_count(table_name, user_id)

            return {"success": True}

        except Exception as e:
            raise Exception(f"Failed to delete row: {str(e)}")

    async def _update_registry_row_count(self, table_name: str, user_id: int):
        """Update the row count in kb_registry after add/delete operations."""
        try:
            # Get current row count
            count_response = self.client.table(table_name).select('*', count='exact').execute()
            total_count = count_response.count if hasattr(count_response, 'count') else len(count_response.data)

            # Update registry
            self.client.table('kb_registry')\
                .update({'row_count': total_count})\
                .eq('table_name', table_name)\
                .eq('user_id', user_id)\
                .execute()

        except Exception as e:
            # Don't fail the operation if registry update fails
            print(f"Warning: Failed to update registry row count: {str(e)}")

    def _sanitize_table_name(self, name: str) -> str:
        """Sanitize table name to be database-safe."""
        # Replace spaces and special characters with underscores
        safe_name = ''.join(c if c.isalnum() or c == '_' else '_' for c in name)
        # Remove consecutive underscores
        safe_name = '_'.join(filter(None, safe_name.split('_')))
        # Convert to lowercase
        safe_name = safe_name.lower()
        # Limit length
        return safe_name[:50]


# Singleton instance
supabase_service = SupabaseService()
