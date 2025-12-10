from supabase import create_client, Client
from app.core.config import settings
from typing import Optional, Dict, List, Any
import pandas as pd
import re
from decimal import Decimal
from datetime import datetime
import json


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

    def generate_table_name(self, company_name: str, kb_type: str) -> str:
        """Generate a safe table name from company name and KB type."""
        # Sanitize company name
        safe_company = re.sub(r'[^a-zA-Z0-9]+', '_', company_name.lower())
        safe_type = kb_type.lower()
        return f"kb_{safe_company}_{safe_type}"

    async def check_existing_kb(self, user_id: int, company_name: str, kb_type: str) -> Dict[str, Any]:
        """Check if a KB of this type already exists for this company."""
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Query the kb_registry table
            response = self.client.table('kb_registry')\
                .select('*', count='exact')\
                .eq('user_id', user_id)\
                .eq('company_name', company_name)\
                .eq('kb_type', kb_type)\
                .execute()

            return {
                "count": response.count if hasattr(response, 'count') else len(response.data),
                "existing": response.data
            }
        except Exception as e:
            # If table doesn't exist, return count 0
            return {"count": 0, "existing": []}

    def _convert_csv_row_to_product(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a CSV row to match Product table schema."""
        converted = {}

        # Generate external_id from SKU or product_name
        if 'sku' in row and pd.notna(row['sku']):
            converted['external_id'] = str(row['sku'])
        elif 'product_name' in row and pd.notna(row['product_name']):
            converted['external_id'] = re.sub(r'[^a-zA-Z0-9]+', '_', str(row['product_name']).lower())
        else:
            converted['external_id'] = f"product_{datetime.now().timestamp()}"

        # Map CSV columns to Product schema
        field_mapping = {
            'product_name': 'product_name',
            'sku': 'sku',
            'description': 'description',
            'unit': 'unit',
            'website_url': 'website_url',
            'image_url': 'image_url',
            'video_url': 'video_url',
            'price_eur': 'price_eur',
            'logistics_price_eur': 'logistics_price_eur',
            'free_delivery': 'free_delivery',
            'stock_units': 'stock_units',
            'delivery_time_hours': 'delivery_time_hours',
            'payment_reminder': 'payment_reminder',
            'supplier_contact': 'supplier_contact',
            'supplier_company_services': 'supplier_company_services',
            'warehouse_address': 'warehouse_address',
            'price_id': 'price_id',
            'delivery_id': 'delivery_id'
        }

        for csv_col, db_col in field_mapping.items():
            if csv_col in row and pd.notna(row[csv_col]):
                value = row[csv_col]

                # Convert numeric fields
                if db_col in ['price_eur', 'logistics_price_eur', 'free_delivery']:
                    try:
                        converted[db_col] = float(value) if value else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                elif db_col in ['stock_units', 'delivery_time_hours', 'payment_reminder']:
                    try:
                        converted[db_col] = int(value) if value else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                else:
                    converted[db_col] = str(value)

        # Handle cities as JSONB
        if 'cities' in row and pd.notna(row['cities']):
            try:
                if isinstance(row['cities'], str):
                    # Try to parse as JSON array
                    converted['cities'] = json.loads(row['cities'])
                elif isinstance(row['cities'], list):
                    converted['cities'] = row['cities']
                else:
                    converted['cities'] = [str(row['cities'])]
            except json.JSONDecodeError:
                # If not JSON, split by comma
                converted['cities'] = [c.strip() for c in str(row['cities']).split(',')]
        else:
            converted['cities'] = []

        # Set source_updated_at
        converted['source_updated_at'] = datetime.now().isoformat()

        return converted

    def _convert_csv_row_to_service(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a CSV row to match Service table schema."""
        converted = {}

        # Generate external_id from SKU or product_name
        if 'sku' in row and pd.notna(row['sku']):
            converted['external_id'] = str(row['sku'])
        elif 'product_name' in row and pd.notna(row['product_name']):
            converted['external_id'] = re.sub(r'[^a-zA-Z0-9]+', '_', str(row['product_name']).lower())
        else:
            converted['external_id'] = f"service_{datetime.now().timestamp()}"

        # Map CSV columns to Service schema
        field_mapping = {
            'product_name': 'product_name',
            'service_subcategory': 'service_subcategory',
            'service_category': 'service_category',
            'sku': 'sku',
            'unit': 'unit',
            'duration': 'duration',
            'format': 'format',
            'description': 'description',
            'included': 'included',
            'not_included': 'not_included',
            'what_guarantee': 'what_guarantee',
            'what_not_guarantee': 'what_not_guarantee',
            'suitable_for': 'suitable_for',
            'not_suitable_for': 'not_suitable_for',
            'specialist_initials': 'specialist_initials',
            'specialist_area': 'specialist_area',
            'website_url': 'website_url',
            'image_url': 'image_url',
            'video_url': 'video_url',
            'price_eur': 'price_eur',
            'stock_units': 'stock_units',
            'payment_reminder': 'payment_reminder',
            'location': 'location',
            'specialist_contacts': 'specialist_contacts',
            'company': 'company',
            'details': 'details',
            'price_id': 'price_id',
            'delivery_id': 'delivery_id'
        }

        for csv_col, db_col in field_mapping.items():
            if csv_col in row and pd.notna(row[csv_col]):
                value = row[csv_col]

                # Convert numeric fields
                if db_col in ['price_eur']:
                    try:
                        converted[db_col] = float(value) if value else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                elif db_col in ['stock_units', 'payment_reminder']:
                    try:
                        converted[db_col] = int(value) if value else None
                    except (ValueError, TypeError):
                        converted[db_col] = None
                else:
                    converted[db_col] = str(value)

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
        Uses Supabase RPC to create the table dynamically.
        """
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            # Step 1: Call Supabase RPC function to create the table
            if kb_type == "Product":
                rpc_result = self.client.rpc('admin_create_catalog_table', {'p_table': table_name}).execute()
            else:  # Service
                rpc_result = self.client.rpc('admin_create_service_table', {'p_service_table': table_name}).execute()

            if not rpc_result.data.get('ok'):
                raise Exception(f"Failed to create table: {rpc_result.data.get('error', 'Unknown error')}")

            # Step 2: Convert DataFrame rows to match schema
            records = []
            for _, row in df.iterrows():
                if kb_type == "Product":
                    converted_row = self._convert_csv_row_to_product(row.to_dict())
                else:
                    converted_row = self._convert_csv_row_to_service(row.to_dict())

                converted_row['source_table'] = table_name
                records.append(converted_row)

            # Step 3: Upsert data (by external_id)
            if records:
                response = self.client.table(table_name).upsert(
                    records,
                    on_conflict='external_id'
                ).execute()

            # Step 4: Register in kb_registry table
            registry_entry = {
                'user_id': user_id,
                'company_name': company_name,
                'kb_type': kb_type,
                'table_name': table_name,
                'row_count': len(records),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            # Upsert registry entry
            try:
                self.client.table('kb_registry').upsert(
                    registry_entry,
                    on_conflict='user_id,company_name,kb_type'
                ).execute()
            except Exception:
                # If kb_registry table doesn't exist, skip registration
                pass

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
        """List all knowledge bases for a user."""
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        try:
            query = self.client.table('kb_registry').select('*').eq('user_id', user_id)

            if company_name:
                query = query.eq('company_name', company_name)

            response = query.execute()
            return response.data

        except Exception:
            # If table doesn't exist, return empty list
            return []

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
