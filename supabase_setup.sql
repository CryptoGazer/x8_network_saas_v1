-- Knowledge Base Registry Table
-- This table tracks all knowledge bases created by users

CREATE TABLE IF NOT EXISTS public.kb_registry (
    id uuid NOT NULL DEFAULT extensions.gen_random_uuid(),
    user_id integer NOT NULL,
    company_name text NOT NULL,
    kb_type text NOT NULL CHECK (kb_type IN ('Product', 'Service')),
    table_name text NOT NULL UNIQUE,
    row_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT kb_registry_pkey PRIMARY KEY (id),
    CONSTRAINT kb_registry_unique_company_type UNIQUE (user_id, company_name, kb_type)
) TABLESPACE pg_default;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_kb_registry_user_id ON public.kb_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_registry_company_name ON public.kb_registry(company_name);
CREATE INDEX IF NOT EXISTS idx_kb_registry_table_name ON public.kb_registry(table_name);

-- Enable Row Level Security
ALTER TABLE public.kb_registry ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own knowledge bases
CREATE POLICY "Users can view their own knowledge bases"
    ON public.kb_registry
    FOR SELECT
    USING (auth.uid()::text::integer = user_id);

-- Policy: Users can insert their own knowledge bases
CREATE POLICY "Users can create their own knowledge bases"
    ON public.kb_registry
    FOR INSERT
    WITH CHECK (auth.uid()::text::integer = user_id);

-- Policy: Users can update their own knowledge bases
CREATE POLICY "Users can update their own knowledge bases"
    ON public.kb_registry
    FOR UPDATE
    USING (auth.uid()::text::integer = user_id);

-- Policy: Users can delete their own knowledge bases
CREATE POLICY "Users can delete their own knowledge bases"
    ON public.kb_registry
    FOR DELETE
    USING (auth.uid()::text::integer = user_id);

-- Grant permissions to service role (for backend API)
GRANT ALL ON public.kb_registry TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Comment on table
COMMENT ON TABLE public.kb_registry IS 'Registry of all knowledge base tables created by users';
