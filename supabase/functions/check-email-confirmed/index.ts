
// Follow this setup guide to integrate the Deno runtime and middleware with your application:
// https://deno.land/manual/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
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

    console.log(`Checking if email is confirmed: ${email}`);
    
    // Use admin API to check if user exists and is confirmed
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });

    if (error) {
      console.error("Error checking user:", error);
      return new Response(
        JSON.stringify({ error: "Error checking user status" }),
        { status: 500, headers }
      );
    }

    const user = users?.[0];
    
    // Consider user confirmed if email_confirmed_at is set
    const isConfirmed = user && user.email_confirmed_at;
    
    console.log(`User exists: ${!!user}, Email confirmed: ${!!isConfirmed}`);
    
    return new Response(
      JSON.stringify({ 
        confirmed: !!isConfirmed 
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
