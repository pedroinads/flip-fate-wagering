-- Fix RLS policies to prevent public access to sensitive data

-- Remove existing public access policies and add proper user-specific policies
DROP POLICY IF EXISTS "Service can manage wallets" ON public.wallets;
DROP POLICY IF EXISTS "Service can manage bets" ON public.bets;  
DROP POLICY IF EXISTS "Service can manage transactions" ON public.transactions;

-- Create secure policies for wallets (users can only see their own)
CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Service role can still manage wallets for edge functions
CREATE POLICY "Service role can manage wallets" ON public.wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create secure policies for bets (users can only see their own)
CREATE POLICY "Users can view own bets" ON public.bets
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Service role can manage bets for edge functions  
CREATE POLICY "Service role can manage bets" ON public.bets
  FOR ALL
  TO service_role  
  USING (true)
  WITH CHECK (true);

-- Create secure policies for transactions (users can only see their own)
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage transactions for edge functions
CREATE POLICY "Service role can manage transactions" ON public.transactions  
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);