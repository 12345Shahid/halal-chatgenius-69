
// A Deno script to test authentication
// Run with: deno run --allow-net --allow-env supabase/functions/test-auth.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Test user credentials
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "test1234";

// Get Supabase URL and anon key from environment variables
// If not available, use default values (update these to match your project)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://tgnpbgngsdlwxphntibh.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbnBiZ25nc2Rsd3hwaG50aWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1ODg2ODMsImV4cCI6MjA1NzE2NDY4M30.n5nf_WWQmj8RAF4r3Kyl9P63StqywKgjMZUoBeqY50k";

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthentication() {
  console.log("🔑 Testing authentication flow...");
  console.log("-------------------------------");
  
  // 1. Sign Up
  console.log("1. Testing Sign Up");
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          credits: 20
        }
      }
    });
    
    if (signUpError) {
      console.log("❌ Sign Up failed:", signUpError.message);
      if (signUpError.message.includes("already registered")) {
        console.log("✓ This is normal if the test user already exists");
      } else {
        throw signUpError;
      }
    } else {
      console.log("✅ Sign Up successful:", signUpData.user?.email);
      console.log("User confirmation status:", signUpData.user?.confirmed_at ? "Confirmed" : "Not confirmed");
    }
  } catch (error) {
    console.error("❌ Sign Up exception:", error);
  }
  
  // Wait a bit before trying to sign in
  console.log("\nWaiting 2 seconds before sign in attempt...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 2. Sign In
  console.log("\n2. Testing Sign In");
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (signInError) {
      console.log("❌ Sign In failed:", signInError.message);
      
      // If sign in fails because email is not confirmed, try to confirm it (for development only)
      if (signInError.message.includes("Email not confirmed") || signInError.message.includes("Invalid login credentials")) {
        console.log("Attempting to confirm email via development helper...");
        
        // Call the dev-confirm-user function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/dev-confirm-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: TEST_EMAIL })
        });
        
        if (response.ok) {
          console.log("✅ Email confirmed successfully via development helper");
          console.log("Trying sign in again...");
          
          // Try sign in again
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
          });
          
          if (retryError) {
            console.log("❌ Sign In retry failed:", retryError.message);
          } else {
            console.log("✅ Sign In retry successful:", retryData.user?.email);
          }
        } else {
          const errorData = await response.json();
          console.log("❌ Failed to confirm email:", errorData.error);
        }
      }
    } else {
      console.log("✅ Sign In successful:", signInData.user?.email);
      
      // 3. Check user profile
      console.log("\n3. Checking user profile");
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user?.id)
        .single();
      
      if (userError) {
        console.log("❌ User profile check failed:", userError.message);
        
        // Try to create the user profile if it doesn't exist
        if (userError.code === 'PGRST116') {
          console.log("User profile doesn't exist, attempting to create one...");
          
          // Wait a bit before creating the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { error: createError } = await supabase
            .from('users')
            .insert([
              { 
                id: signInData.user?.id, 
                email: signInData.user?.email,
                credits: 20,
                display_name: signInData.user?.email?.split('@')[0] || 'User'
              }
            ]);
            
          if (createError) {
            console.log("❌ Failed to create user profile:", createError.message);
          } else {
            console.log("✅ User profile created successfully");
          }
        }
      } else {
        console.log("✅ User profile exists:", userData);
      }
    }
  } catch (error) {
    console.error("❌ Sign In exception:", error);
  }
  
  // 4. Sign Out
  console.log("\n4. Testing Sign Out");
  try {
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log("❌ Sign Out failed:", signOutError.message);
    } else {
      console.log("✅ Sign Out successful");
    }
  } catch (error) {
    console.error("❌ Sign Out exception:", error);
  }
  
  console.log("\n✨ Authentication test completed");
}

// Run the test
console.log("=== SUPABASE AUTHENTICATION TEST ===");
console.log(`Testing with URL: ${SUPABASE_URL}`);
testAuthentication();
