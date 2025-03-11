
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referrerId, referredId } = await req.json();
    
    if (!referrerId || !referredId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if the referrer exists
    const { data: referrer, error: referrerError } = await supabase
      .from("users")
      .select("id")
      .eq("id", referrerId)
      .single();

    if (referrerError || !referrer) {
      return new Response(
        JSON.stringify({ error: "Invalid referrer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the referred user exists
    const { data: referred, error: referredError } = await supabase
      .from("users")
      .select("id")
      .eq("id", referredId)
      .single();

    if (referredError || !referred) {
      return new Response(
        JSON.stringify({ error: "Invalid referred user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this referral already exists
    const { data: existingReferral, error: referralCheckError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("referred_id", referredId);

    if (existingReferral && existingReferral.length > 0) {
      return new Response(
        JSON.stringify({ message: "Referral already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the referral
    const { error: referralError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrerId,
        referred_id: referredId
      });

    if (referralError) {
      return new Response(
        JSON.stringify({ error: "Failed to create referral" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add credits to the referrer
    const { error: creditsError } = await supabase
      .from("credits")
      .update({
        referral_credits: supabase.rpc("increment", { x: 1 }),
        total_credits: supabase.rpc("increment", { x: 1 }),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", referrerId);

    if (creditsError) {
      console.error("Error updating credits:", creditsError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Referral processed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in handle-referral function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
