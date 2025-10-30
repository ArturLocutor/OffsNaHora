-- Ensure required extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NULL,
  color text NOT NULL DEFAULT 'blue',
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NULL
);

-- Create or replace an updated_at trigger to auto-update the column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'services_set_updated_at'
  ) THEN
    CREATE TRIGGER services_set_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Permitir leitura pública de services" ON public.services;
DROP POLICY IF EXISTS "Permitir inserção de services" ON public.services;
DROP POLICY IF EXISTS "Permitir atualização de services" ON public.services;
DROP POLICY IF EXISTS "Permitir exclusão de services" ON public.services;

-- IMPORTANT: The app admin uses local auth (not Supabase auth),
-- so we need to allow writes for anonymous users as well.
-- In production, consider tightening UPDATE/DELETE to authenticated users only.

-- Allow public SELECT
CREATE POLICY "Permitir leitura pública de services"
ON public.services
FOR SELECT
USING (true);

-- Allow INSERT for everyone (anon + authenticated)
CREATE POLICY "Permitir inserção de services"
ON public.services
FOR INSERT
WITH CHECK (true);

-- Allow UPDATE for everyone (anon + authenticated)
CREATE POLICY "Permitir atualização de services"
ON public.services
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow DELETE for everyone (anon + authenticated)
CREATE POLICY "Permitir exclusão de services"
ON public.services
FOR DELETE
USING (true);

-- Optional grants (RLS still applies)
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;

-- ------------------------------
-- NEW: Random color by default (without sending from client)
-- ------------------------------
-- Set a random color from the allowed palette when column is omitted
ALTER TABLE public.services
  ALTER COLUMN color SET DEFAULT (
    ARRAY['blue','purple','green','orange','red','indigo','teal','pink','yellow','cyan','slate','violet','emerald']
  )[GREATEST(1, LEAST(13, FLOOR(random()*13 + 1)))::int];

-- order_position manterá o default configurado na tabela; nenhuma trigger adicional necessária.