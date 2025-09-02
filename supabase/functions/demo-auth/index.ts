import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { email, action } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (action === 'login') {
      // Generate secure demo session
      const { data, error } = await supabaseClient.rpc('create_demo_session', {
        demo_email: email
      });

      if (error) {
        console.error('Demo login error:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid demo account or expired' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          session_token: data,
          message: 'Demo session created successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'validate') {
      const { session_token } = await req.json();

      if (!session_token) {
        return new Response(
          JSON.stringify({ error: 'Session token is required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Validate demo session
      const { data, error } = await supabaseClient.rpc('validate_demo_session', {
        token: session_token
      });

      if (error || !data || data.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          account: data[0],
          message: 'Session is valid'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'cleanup') {
      // Clean up expired demo accounts (admin only)
      const { data, error } = await supabaseClient.rpc('cleanup_demo_accounts');

      if (error) {
        console.error('Cleanup error:', error);
        return new Response(
          JSON.stringify({ error: 'Cleanup failed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          cleaned_accounts: data,
          message: `Cleaned up ${data} expired demo accounts`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );

  } catch (error) {
    console.error('Demo auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});