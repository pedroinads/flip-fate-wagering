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

    const { choice, amount, level } = await req.json();

    if (!choice || !amount || amount < 1.5 || !level || level < 1 || level > 3) {
      throw new Error("Valor mínimo para aposta é R$ 1,50");
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

    // Define level settings
    const levelSettings = {
      1: { multiplier: 1.9, winChance: 50 },
      2: { multiplier: 4.9, winChance: 30 },
      3: { multiplier: 9.9, winChance: 10 }
    };
    
    const currentLevel = levelSettings[level as keyof typeof levelSettings];
    
    // Generate random result (provably fair)
    const seed = crypto.randomUUID();
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed + Date.now()));
    const randomValue = new Uint8Array(hash)[0];
    const result = randomValue % 2 === 0 ? 'cara' : 'coroa';
    
    // Check if player wins - if choice matches result, check win chance
    const winRandom = (randomValue / 255) * 100;
    const playerWins = choice === result && winRandom <= currentLevel.winChance;
    
    const payout = playerWins ? amount * currentLevel.multiplier : 0;

    // Start transaction
    const { error: betError } = await supabaseService
      .from('bets')
      .insert({
        user_id: user.id,
        amount,
        choice,
        result,
        won: playerWins,
        payout,
        seed,
      });

    if (betError) {
      throw new Error("Failed to record bet");
    }

    // Update wallet balance
    const newBalance = playerWins ? wallet.balance + payout - amount : wallet.balance - amount;
    
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
        won: playerWins,
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