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

    const { choice, amount } = await req.json();

    if (!choice || !amount || amount <= 0) {
      throw new Error("Invalid bet parameters");
    }

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check user wallet balance
    const { data: wallet, error: walletError } = await supabaseService
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Generate random result (provably fair)
    const seed = crypto.randomUUID();
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed + Date.now()));
    const randomValue = new Uint8Array(hash)[0];
    const result = randomValue % 2 === 0 ? 'cara' : 'coroa';
    
    const won = choice === result;
    const payout = won ? amount * 1.9 : 0; // 1.9x payout (10% house edge)

    // Start transaction
    const { error: betError } = await supabaseService
      .from('bets')
      .insert({
        user_id: user.id,
        amount,
        choice,
        result,
        won,
        payout,
        seed,
      });

    if (betError) {
      throw new Error("Failed to record bet");
    }

    // Update wallet balance
    const newBalance = won ? wallet.balance + payout - amount : wallet.balance - amount;
    
    const { error: updateError } = await supabaseService
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error("Failed to update wallet");
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        won,
        payout,
        newBalance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in place-bet:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});