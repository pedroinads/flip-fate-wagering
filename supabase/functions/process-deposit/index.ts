import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client for user authentication
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { amount } = await req.json();

    if (!amount || amount < 10) {
      throw new Error("Valor mínimo para depósito é R$ 10,00");
    }

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // For MVP: simulate successful PIX payment
    // In production, this would integrate with a payment provider
    const externalId = `PIX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseService
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount,
        status: 'completed', // In MVP, auto-complete
        external_id: externalId,
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error("Failed to create transaction");
    }

    // Update wallet balance
    const { data: wallet, error: walletError } = await supabaseService
      .from('wallets')
      .select('balance, total_deposited')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      throw new Error("Wallet not found");
    }

    const newBalance = wallet.balance + amount;
    const newTotalDeposited = wallet.total_deposited + amount;

    const { error: updateError } = await supabaseService
      .from('wallets')
      .update({ 
        balance: newBalance,
        total_deposited: newTotalDeposited,
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error("Failed to update wallet");
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.id,
        newBalance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in process-deposit:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});