
// Follow this setup guide to integrate the Deno runtime and middleware with your application:
// https://deno.land/manual/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // This endpoint is for DEVELOPMENT only and should NOT be used in production
  const isDevelopment = true; // Change to false in production
  
  if (!isDevelopment) {
    return new Response(
      JSON.stringify({ error: "This endpoint is disabled in production" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Add CORS headers to all responses
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers }
      );
    }

    console.log(`Attempting to auto-confirm user: ${email}`);
    
    // Use admin API to get the user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email,
      }
    });

    if (listError) {
      console.error("Error looking up user:", listError);
      return new Response(
        JSON.stringify({ error: "Error looking up user" }),
        { status: 500, headers }
      );
    }

    const user = users?.[0];
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers }
      );
    }

    // Check if already confirmed
    if (user.email_confirmed_at) {
      console.log("User already confirmed");
      return new Response(
        JSON.stringify({ message: "User already confirmed" }),
        { status: 200, headers }
      );
    }

    // For development only - confirm the user's email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("Error confirming user:", updateError);
      return new Response(
        JSON.stringify({ error: "Error confirming user" }),
        { status: 500, headers }
      );
    }

    console.log("User confirmed successfully:", email);
    
    return new Response(
      JSON.stringify({ 
        message: "User confirmed successfully"
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers }
    );
  }
});
