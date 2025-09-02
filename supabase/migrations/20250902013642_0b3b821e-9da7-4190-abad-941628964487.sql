-- Fix the policy conflict by dropping existing and recreating

-- Drop all existing policies for demo_accounts
DROP POLICY IF EXISTS "Admins can manage demo accounts" ON public.demo_accounts;
DROP POLICY IF EXISTS "Demo accounts restricted access" ON public.demo_accounts;

-- Create single, secure policy for demo_accounts
CREATE POLICY "Admin only demo account access" 
ON public.demo_accounts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Revoke any public access from anonymous users
REVOKE ALL ON public.demo_accounts FROM anon;
REVOKE ALL ON public.transactions FROM anon;
REVOKE ALL ON public.wallets FROM anon;
REVOKE ALL ON public.bets FROM anon;