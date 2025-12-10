from supabase import create_client, Client
from app.core.config import settings
from typing import Optional, Dict, List, Any
import pandas as pd


class SupabaseService:
    """Service for interacting with Supabase database for CSV/XLSX data storage."""

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

    async def create_table_from_dataframe(
        self,
        table_name: str,
        df: pd.DataFrame,
        user_id: int,
        company_id: int
    ) -> Dict[str, Any]:
        """
        Create or update a table in Supabase from a pandas DataFrame.

        Args:
            table_name: Name of the table (will be sanitized)
            df: Pandas DataFrame with the data
            user_id: ID of the user uploading the data
            company_id: ID of the company this data belongs to

        Returns:
            Dictionary with operation status and details
        """
        if not self.is_configured():
            raise Exception("Supabase is not configured. Please add credentials to .env")

        # Sanitize table name (remove special characters, spaces, etc.)
        safe_table_name = self._sanitize_table_name(table_name)

        # Convert DataFrame to list of dictionaries
        records = df.to_dict('records')

        # Add metadata to each record
        for record in records:
            record['_user_id'] = user_id
            record['_company_id'] = company_id
            record['_table_name'] = safe_table_name

        try:
            # Insert data into Supabase
            # Note: This assumes you have a generic table structure in Supabase
            # You might need to create tables dynamically or use a JSON column
            response = self.client.table('imported_data').insert(records).execute()

            return {
                "success": True,
                "table_name": safe_table_name,
                "rows_inserted": len(records),
                "columns": list(df.columns)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "table_name": safe_table_name
            }

    async def get_table_data(
        self,
        table_name: str,
        company_id: int,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieve data from a table for a specific company.

        Args:
            table_name: Name of the table
            company_id: ID of the company
            limit: Maximum number of rows to return

        Returns:
            List of records
        """
        if not self.is_configured():
            raise Exception("Supabase is not configured")

        safe_table_name = self._sanitize_table_name(table_name)

        try:
            response = (
                self.client.table('imported_data')
                .select('*')
                .eq('_company_id', company_id)
                .eq('_table_name', safe_table_name)
                .limit(limit)
                .execute()
            )

            return response.data
        except Exception as e:
            raise Exception(f"Failed to retrieve data: {str(e)}")

    async def export_table_to_csv(
        self,
        table_name: str,
        company_id: int
    ) -> pd.DataFrame:
        """
        Export table data to a pandas DataFrame for CSV export.

        Args:
            table_name: Name of the table
            company_id: ID of the company

        Returns:
            Pandas DataFrame with the data
        """
        data = await self.get_table_data(table_name, company_id, limit=10000)

        if not data:
            return pd.DataFrame()

        # Convert to DataFrame
        df = pd.DataFrame(data)

        # Remove metadata columns
        metadata_cols = ['_user_id', '_company_id', '_table_name', 'id', 'created_at']
        df = df.drop(columns=[col for col in metadata_cols if col in df.columns])

        return df

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
