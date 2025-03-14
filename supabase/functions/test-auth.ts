
// Test script for authentication system
// Run using: deno run --allow-net --allow-env supabase/functions/test-auth.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configuration - Replace these with your actual values for testing
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://tgnpbgngsdlwxphntibh.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbnBiZ25nc2Rsd3hwaG50aWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1ODg2ODMsImV4cCI6MjA1NzE2NDY4M30.n5nf_WWQmj8RAF4r3Kyl9P63StqywKgjMZUoBeqY50k";
const TEST_EMAIL = "test.auth@example.com";
const TEST_PASSWORD = "testpass123";

async function testAuthenticationSystem() {
  console.log("=== HalalChat Authentication System Test ===");
  
  try {
    console.log("\nInitializing Supabase client...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // First, check if our test user exists and delete it if it does
    console.log("\nCleaning up existing test user...");
    const { data: existingUser, error: lookupError } = await supabase.auth.admin.listUsers();
    
    if (lookupError) {
      console.log("Error looking up users:", lookupError.message);
    } else {
      const testUser = existingUser.users.find(u => u.email === TEST_EMAIL);
      if (testUser) {
        console.log("Found existing test user, will delete it");
        const { error: deleteError } = await supabase.auth.admin.deleteUser(testUser.id);
        if (deleteError) {
          console.log("Error deleting test user:", deleteError.message);
        } else {
          console.log("Successfully deleted test user");
        }
      } else {
        console.log("No existing test user found");
      }
    }
    
    // Test 1: Sign Up
    console.log("\n=== Test 1: Sign Up ===");
    console.log("Creating a new user account...");
    
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
      console.error("❌ Sign up failed:", signUpError.message);
    } else {
      console.log("✅ Sign up successful!");
      console.log("User ID:", signUpData.user?.id);
      console.log("Email confirmation required:", !signUpData.session);
      
      // Check if the user profile was created in the users table
      console.log("\nChecking if user profile was created...");
      
      // Wait a second for the database to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signUpData.user?.id || '')
        .single();
      
      if (profileError) {
        console.error("❌ User profile check failed:", profileError.message);
        
        // Let's try to create the profile manually
        console.log("\nAttempting to create user profile manually...");
        const { error: createProfileError } = await supabase
          .from('users')
          .insert([
            { 
              id: signUpData.user?.id, 
              email: signUpData.user?.email,
              credits: 20,
              display_name: signUpData.user?.email?.split('@')[0] || 'User'
            }
          ]);
          
        if (createProfileError) {
          console.error("❌ Manual profile creation failed:", createProfileError.message);
          
          // Check if foreign key constraint is the issue
          if (createProfileError.message.includes("violates foreign key constraint")) {
            console.log("\n⚠️ DIAGNOSIS: Foreign key constraint issue detected!");
            console.log("This typically means the auth.users entry hasn't fully propagated to the public schema");
            console.log("RECOMMENDATION: Add a delay before creating profiles after signup");
          }
        } else {
          console.log("✅ Manual profile creation successful!");
        }
      } else {
        console.log("✅ User profile exists:", profileData);
      }
    }
    
    // Test 2: Sign In
    console.log("\n=== Test 2: Sign In ===");
    
    // For email confirmation workflow, we need special handling for tests
    if (!signUpData?.session) {
      console.log("⚠️ Email confirmation is required for the new account");
      console.log("For testing purposes, we'll use admin API to auto-confirm the user...");
      
      // In production this would be handled via the email confirmation flow
      // For testing we'll use the admin API to simulate confirmation
      const { data: adminUserData, error: adminError } = await supabase.auth.admin.getUserById(
        signUpData?.user?.id || ''
      );
      
      if (adminError) {
        console.error("❌ Could not retrieve user for confirmation:", adminError.message);
      } else {
        console.log("Retrieved user for confirmation:", adminUserData.user?.email);
        
        // Set user as confirmed
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          adminUserData.user?.id || '',
          { email_confirm: true }
        );
        
        if (updateError) {
          console.error("❌ Could not confirm user:", updateError.message);
        } else {
          console.log("✅ User email confirmed for testing");
        }
      }
    }
    
    // Now try to sign in
    console.log("\nAttempting to sign in with test account...");
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) {
      console.error("❌ Sign in failed:", signInError.message);
      
      if (signInError.message.includes("Email not confirmed")) {
        console.log("\n⚠️ DIAGNOSIS: Email confirmation issue");
        console.log("RECOMMENDATION: Configure Supabase to auto-confirm emails in development");
      }
    } else {
      console.log("✅ Sign in successful!");
      console.log("User:", signInData.user?.email);
      console.log("Session valid:", !!signInData.session);
      
      // Check again that profile exists
      console.log("\nChecking user profile after sign in...");
      const { data: profileAfterSignIn, error: profileCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user?.id || '')
        .single();
      
      if (profileCheckError) {
        console.error("❌ User profile check after sign in failed:", profileCheckError.message);
      } else {
        console.log("✅ User profile exists after sign in:", profileAfterSignIn);
      }
    }
    
    // Test 3: Sign Out
    if (signInData?.session) {
      console.log("\n=== Test 3: Sign Out ===");
      console.log("Signing out...");
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error("❌ Sign out failed:", signOutError.message);
      } else {
        console.log("✅ Sign out successful!");
        
        // Verify we're signed out
        const { data: sessionCheck } = await supabase.auth.getSession();
        console.log("Session after sign out:", sessionCheck.session ? "Still active (error)" : "Null (correct)");
      }
    }
    
    // Final assessment
    console.log("\n=== Authentication System Assessment ===");
    const issues = [];
    
    if (signUpError) issues.push("Sign up functionality");
    if (!signUpData?.user) issues.push("User creation");
    if (signInError) issues.push("Sign in functionality");
    if (!signInData?.session) issues.push("Session management");
    
    if (issues.length > 0) {
      console.log("❌ The following components have issues:");
      issues.forEach(issue => console.log(`  - ${issue}`));
      console.log("\nRecommendation: Check the error messages above for specific fixes");
    } else {
      console.log("✅ All basic authentication flows are working correctly!");
    }
    
  } catch (error) {
    console.error(`❌ Test failed with exception: ${error.message}`);
  }
}

// Run the test
testAuthenticationSystem();
