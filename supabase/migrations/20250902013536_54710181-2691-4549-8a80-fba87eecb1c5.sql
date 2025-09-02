-- Fix remaining security issues

-- 1. Fix the demo_accounts policies (remove public access)
DROP POLICY IF EXISTS "Demo accounts can only be accessed via secure functions" ON public.demo_accounts;

-- Create proper restrictive policy for demo_accounts
CREATE POLICY "Demo accounts restricted access" 
ON public.demo_accounts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Verify and fix transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions" ON public.transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Verify and fix wallets table policies  
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Service role can manage wallets" ON public.wallets;

CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage wallets" ON public.wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Ensure no anonymous access to sensitive tables
REVOKE ALL ON public.demo_accounts FROM anon;
REVOKE ALL ON public.transactions FROM anon;
REVOKE ALL ON public.wallets FROM anon;
REVOKE ALL ON public.bets FROM anon;

-- 5. Grant only necessary permissions to authenticated users
GRANT SELECT ON public.demo_accounts TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;
GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.bets TO authenticated;