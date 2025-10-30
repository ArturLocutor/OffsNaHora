-- Fix RLS policies for clients table to allow initialization
-- This script addresses the error: "new row violates row-level security policy for table clients"

-- Drop existing policies for clients table
DROP POLICY IF EXISTS "Permitir leitura pública de clientes" ON public.clients;
DROP POLICY IF EXISTS "Permitir escrita para usuários autenticados" ON public.clients;

-- Create new policies that allow both public read and initialization
CREATE POLICY "Permitir leitura pública de clientes" ON public.clients 
    FOR SELECT USING (true);

-- Allow INSERT for both authenticated users and system initialization
CREATE POLICY "Permitir inserção de clientes" ON public.clients 
    FOR INSERT WITH CHECK (true);

-- Allow UPDATE only for authenticated users
CREATE POLICY "Permitir atualização para usuários autenticados" ON public.clients 
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow DELETE only for authenticated users
CREATE POLICY "Permitir exclusão para usuários autenticados" ON public.clients 
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'clients';