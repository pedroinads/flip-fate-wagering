-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create system_settings table for customizations
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage system settings
CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create demo_accounts table
CREATE TABLE public.demo_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 1000.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS on demo_accounts
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage demo accounts
CREATE POLICY "Admins can manage demo accounts"
ON public.demo_accounts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add level column to bets table for better tracking
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Add pix_key to transactions table if not exists
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pix_key TEXT;

-- Add approval fields to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Insert default admin user role (this will be set after user creation)
-- We'll handle this in the application code

-- Insert default system settings
INSERT INTO public.system_settings (key, value) VALUES 
('site_logo', '""'),
('site_colors', '{"primary": "#D4AF37", "secondary": "#1a1a2e", "accent": "#16213e"}'),
('pix_api_config', '{"provider": "", "api_key": "", "webhook_url": ""}'),
('webhook_config', '{"zapier_url": "", "meta_pixel_id": ""}'),
('game_settings', '{"level1_multiplier": 1.9, "level2_multiplier": 4.9, "level3_multiplier": 9.9, "level1_chance": 50, "level2_chance": 30, "level3_chance": 10}')
ON CONFLICT (key) DO NOTHING;