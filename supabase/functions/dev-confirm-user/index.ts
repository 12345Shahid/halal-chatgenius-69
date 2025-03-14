
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
        JSON.stringify({ error: "Error finding user" }),
        { status: 500, headers }
      );
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers }
      );
    }

    const user = users[0];
    
    // If the user is already confirmed, return success
    if (user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ message: "Email already confirmed" }),
        { status: 200, headers }
      );
    }

    // Confirm the user's email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirmed_at: new Date().toISOString() }
    );

    if (updateError) {
      console.error("Error confirming email:", updateError);
      return new Response(
        JSON.stringify({ error: "Error confirming email" }),
        { status: 500, headers }
      );
    }

    // Now create the user profile if it doesn't exist
    // First check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error("Error checking for profile:", profileCheckError);
      // Continue anyway, since email confirmation is more important
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log("Creating user profile for:", user.id);
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            id: user.id, 
            email: email,
            credits: 20,
            display_name: email.split('@')[0] || 'User'
          }
        ]);
        
      if (insertError) {
        console.error("Error creating profile:", insertError);
        // Return success for the email confirmation part, but note the profile error
        return new Response(
          JSON.stringify({ 
            message: "Email confirmed successfully, but profile creation failed", 
            profile_error: insertError.message,
            user_id: user.id
          }),
          { status: 200, headers }
        );
      }
    }

    console.log(`Successfully confirmed email for: ${email}`);
    
    return new Response(
      JSON.stringify({ 
        message: "Email confirmed successfully",
        user_id: user.id
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
