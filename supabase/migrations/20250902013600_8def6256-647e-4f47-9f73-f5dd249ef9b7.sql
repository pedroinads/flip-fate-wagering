-- Fix remaining security issues for system_settings, user_roles, and profiles tables

-- 1. Fix system_settings table - restrict to admins only
REVOKE ALL ON public.system_settings FROM anon;
REVOKE ALL ON public.system_settings FROM authenticated;

-- Only admins can access system settings
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;

-- Verify the existing policy is correct for system_settings
-- (Already has: "Admins can manage system settings" policy)

-- 2. Fix user_roles table - users can only see their own roles
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;

-- Add policy for users to view only their own roles (complementing existing admin policy)
CREATE POLICY "Users can view own roles only" ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Fix profiles table - already has good policies but ensure no anon access
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- The existing policies for profiles are already secure:
-- "Users can view their own profile"
-- "Users can insert their own profile"  
-- "Users can update their own profile"