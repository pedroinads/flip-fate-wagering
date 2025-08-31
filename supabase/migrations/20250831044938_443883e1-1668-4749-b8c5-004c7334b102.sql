-- Disable email confirmation requirement
UPDATE auth.config SET enable_signup = true, enable_email_confirmations = false WHERE project_id = 'ozubododfkoeyqpxiifl';