
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
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers }
      );
    }

    console.log(`Attempting to verify email for: ${email}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find the user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });

    if (getUserError) {
      console.error("Error finding user:", getUserError);
      return new Response(
        JSON.stringify({ error: "Error finding user", details: getUserError.message }),
        { status: 500, headers }
      );
    }

    if (!users || users.length === 0) {
      // If no user found, try to create one
      console.log("User not found, attempting to create user");
      return new Response(
        JSON.stringify({ error: "User not found", status: "not_found" }),
        { status: 404, headers }
      );
    }

    const user = users[0];
    console.log("Found user:", user.id);
    
    // If the user is already confirmed, return success
    if (user.email_confirmed_at) {
      console.log("Email already confirmed for user:", user.id);
      // Ensure user profile exists
      await ensureUserProfile(supabase, user);
      
      return new Response(
        JSON.stringify({ 
          message: "Email already confirmed",
          user_id: user.id,
          email_confirmed_at: user.email_confirmed_at
        }),
        { status: 200, headers }
      );
    }

    // Confirm the user's email
    console.log("Confirming email for user:", user.id);
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirmed_at: new Date().toISOString() }
    );

    if (updateError) {
      console.error("Error confirming email:", updateError);
      return new Response(
        JSON.stringify({ error: "Error confirming email", details: updateError.message }),
        { status: 500, headers }
      );
    }

    // Ensure user profile exists
    await ensureUserProfile(supabase, user);

    console.log(`Successfully confirmed email for: ${email} (User: ${user.id})`);
    
    return new Response(
      JSON.stringify({ 
        message: "Email confirmed successfully",
        user_id: user.id,
        status: "confirmed"
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers }
    );
  }
});

// Helper function to ensure user profile exists
async function ensureUserProfile(supabase, user) {
  try {
    // First check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error("Error checking for profile:", profileCheckError);
      // Continue anyway, since the main function is email confirmation
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log("Creating user profile for:", user.id);
      const displayName = user.email.split('@')[0] || 'User';
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            id: user.id, 
            email: user.email,
            credits: 20,
            display_name: displayName
          }
        ]);
        
      if (insertError) {
        console.error("Error creating profile:", insertError);
        return false;
      }
      
      console.log("Successfully created profile for user:", user.id);
      return true;
    }
    
    console.log("User profile already exists for:", user.id);
    return true;
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return false;
  }
}
