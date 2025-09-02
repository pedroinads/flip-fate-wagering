-- SECURITY FIX: Remove password hashes from demo accounts and implement secure token-based system

-- 1. Remove the password_hash column (major security risk)
ALTER TABLE public.demo_accounts DROP COLUMN IF EXISTS password_hash;

-- 2. Add a secure session token system for demo accounts
ALTER TABLE public.demo_accounts 
ADD COLUMN session_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
ADD COLUMN last_activity TIMESTAMPTZ DEFAULT now();

-- 3. Create function to generate secure demo session
CREATE OR REPLACE FUNCTION public.create_demo_session(demo_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    session_token TEXT;
    account_exists BOOLEAN;
BEGIN
    -- Check if demo account exists and is active
    SELECT EXISTS(
        SELECT 1 FROM demo_accounts 
        WHERE email = demo_email 
        AND is_active = true 
        AND expires_at > now()
    ) INTO account_exists;
    
    IF NOT account_exists THEN
        RAISE EXCEPTION 'Demo account not found or expired';
    END IF;
    
    -- Generate new session token
    session_token := encode(gen_random_bytes(32), 'hex');
    
    -- Update account with new session token and activity
    UPDATE demo_accounts 
    SET session_token = session_token,
        last_activity = now()
    WHERE email = demo_email 
    AND is_active = true 
    AND expires_at > now();
    
    RETURN session_token;
END;
$$;

-- 4. Create function to validate demo session
CREATE OR REPLACE FUNCTION public.validate_demo_session(token TEXT)
RETURNS TABLE(email TEXT, balance NUMERIC, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update last activity and return account info if valid
    UPDATE demo_accounts 
    SET last_activity = now()
    WHERE session_token = token 
    AND is_active = true 
    AND expires_at > now()
    AND last_activity > (now() - interval '24 hours'); -- Session expires after 24h of inactivity
    
    RETURN QUERY
    SELECT d.email, d.balance, d.expires_at
    FROM demo_accounts d
    WHERE d.session_token = token 
    AND d.is_active = true 
    AND d.expires_at > now()
    AND d.last_activity > (now() - interval '24 hours');
END;
$$;

-- 5. Create function to cleanup expired demo accounts and sessions
CREATE OR REPLACE FUNCTION public.cleanup_demo_accounts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    -- Delete expired accounts and inactive sessions
    DELETE FROM demo_accounts 
    WHERE expires_at < now() 
    OR (last_activity < (now() - interval '7 days') AND last_activity IS NOT NULL);
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    -- Clear session tokens for accounts that have been inactive for more than 24 hours
    UPDATE demo_accounts 
    SET session_token = NULL 
    WHERE last_activity < (now() - interval '24 hours')
    AND session_token IS NOT NULL;
    
    RETURN cleanup_count;
END;
$$;

-- 6. Add RLS policy for demo session validation (additional security layer)
CREATE POLICY "Demo accounts can only be accessed via secure functions" 
ON public.demo_accounts
FOR ALL
TO authenticated, anon
USING (false)  -- Block direct access
WITH CHECK (false);

-- 7. Allow admin access (keep existing admin functionality)
CREATE POLICY "Admins can manage demo accounts securely" 
ON public.demo_accounts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. Create index for performance on session lookups
CREATE INDEX IF NOT EXISTS idx_demo_accounts_session_token 
ON public.demo_accounts(session_token) 
WHERE session_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_demo_accounts_activity 
ON public.demo_accounts(last_activity) 
WHERE last_activity IS NOT NULL;