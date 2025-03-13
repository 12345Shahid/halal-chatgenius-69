
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[handle-referral] Request received:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[handle-referral] Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("[handle-referral] Request body received:", JSON.stringify(requestBody));
    
    const { referrerId, referredId } = requestBody;
    
    if (!referrerId || !referredId) {
      console.log("[handle-referral] Missing required parameters:", { referrerId, referredId });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    console.log("[handle-referral] Initializing Supabase client with URL:", SUPABASE_URL);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if the referrer exists
    console.log("[handle-referral] Checking if referrer exists:", referrerId);
    const { data: referrer, error: referrerError } = await supabase
      .from("users")
      .select("id")
      .eq("id", referrerId)
      .single();

    if (referrerError || !referrer) {
      console.error("[handle-referral] Invalid referrer:", referrerError);
      return new Response(
        JSON.stringify({ error: "Invalid referrer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the referred user exists
    console.log("[handle-referral] Checking if referred user exists:", referredId);
    const { data: referred, error: referredError } = await supabase
      .from("users")
      .select("id")
      .eq("id", referredId)
      .single();

    if (referredError || !referred) {
      console.error("[handle-referral] Invalid referred user:", referredError);
      return new Response(
        JSON.stringify({ error: "Invalid referred user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this referral already exists
    console.log("[handle-referral] Checking if referral already exists");
    const { data: existingReferral, error: referralCheckError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("referred_id", referredId);

    if (existingReferral && existingReferral.length > 0) {
      console.log("[handle-referral] Referral already exists");
      return new Response(
        JSON.stringify({ message: "Referral already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the referral
    console.log("[handle-referral] Creating new referral record");
    const { error: referralError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrerId,
        referred_id: referredId
      });

    if (referralError) {
      console.error("[handle-referral] Failed to create referral:", referralError);
      return new Response(
        JSON.stringify({ error: "Failed to create referral" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if credits entry exists for the referrer
    console.log("[handle-referral] Checking referrer credits");
    const { data: referrerCredits, error: creditsCheckError } = await supabase
      .from("credits")
      .select("id, total_credits, referral_credits")
      .eq("user_id", referrerId)
      .maybeSingle();

    console.log("[handle-referral] Referrer credits status:", { referrerCredits, error: creditsCheckError });

    // If no credits entry exists, create one
    if (!referrerCredits) {
      console.log("[handle-referral] Creating new credits entry for referrer");
      await supabase
        .from("credits")
        .insert({
          user_id: referrerId,
          total_credits: 1,
          referral_credits: 1,
          ad_credits: 0
        });
    } else {
      // Add credits to the referrer
      console.log("[handle-referral] Updating referrer credits");
      await supabase
        .from("credits")
        .update({
          referral_credits: supabase.rpc("increment", { x: 1 }),
          total_credits: supabase.rpc("increment", { x: 1 }),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", referrerId);
    }

    // Check if credits entry exists for the referred user
    console.log("[handle-referral] Checking referred user credits");
    const { data: referredCredits } = await supabase
      .from("credits")
      .select("id, total_credits")
      .eq("user_id", referredId)
      .maybeSingle();

    console.log("[handle-referral] Referred user credits status:", referredCredits);

    // If no credits entry exists, create one with initial credits
    if (!referredCredits) {
      console.log("[handle-referral] Creating new credits entry for referred user");
      await supabase
        .from("credits")
        .insert({
          user_id: referredId,
          total_credits: 3, // Give 3 initial credits to referred user
          referral_credits: 0,
          ad_credits: 0
        });
    } else {
      // Add bonus credits to the referred user
      console.log("[handle-referral] Adding bonus credits to referred user");
      await supabase
        .from("credits")
        .update({
          total_credits: supabase.rpc("increment", { x: 3 }),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", referredId);
    }

    console.log("[handle-referral] Referral process completed successfully");
    return new Response(
      JSON.stringify({ success: true, message: "Referral processed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[handle-referral] Error in handle-referral function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
