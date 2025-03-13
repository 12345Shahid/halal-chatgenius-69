
// Focused test script for the referral system
// Run using: deno run --allow-net --allow-env supabase/functions/test-referral.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configuration - Replace these with your actual values for testing
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "your-supabase-url";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "your-supabase-anon-key";

async function testReferralSystem() {
  console.log("=== HalalChat Referral System Test ===");
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Step 1: Create test users
    console.log("\nStep 1: Creating test users...");
    
    // Generate unique emails for this test run
    const timestamp = Date.now();
    const referrerEmail = `referrer-${timestamp}@test.com`;
    const referredEmail = `referred-${timestamp}@test.com`;
    
    console.log(`Creating referrer: ${referrerEmail}`);
    const { data: referrerData, error: referrerError } = await supabase.auth.signUp({
      email: referrerEmail,
      password: "TestPassword123!"
    });
    
    if (referrerError) {
      throw new Error(`Failed to create referrer: ${referrerError.message}`);
    }
    
    const referrerId = referrerData.user?.id;
    if (!referrerId) {
      throw new Error("Failed to get referrer ID");
    }
    console.log(`Created referrer with ID: ${referrerId}`);
    
    console.log(`Creating referred user: ${referredEmail}`);
    const { data: referredData, error: referredError } = await supabase.auth.signUp({
      email: referredEmail,
      password: "TestPassword123!"
    });
    
    if (referredError) {
      throw new Error(`Failed to create referred user: ${referredError.message}`);
    }
    
    const referredId = referredData.user?.id;
    if (!referredId) {
      throw new Error("Failed to get referred user ID");
    }
    console.log(`Created referred user with ID: ${referredId}`);
    
    // Step 2: Authenticate to get a session
    console.log("\nStep 2: Authenticating...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: referrerEmail,
      password: "TestPassword123!"
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    const authToken = authData.session?.access_token;
    if (!authToken) {
      throw new Error("Failed to get authentication token");
    }
    console.log("Authentication successful");
    
    // Step 3: Test the handle-referral function
    console.log("\nStep 3: Testing handle-referral function...");
    const referralResponse = await fetch(`${SUPABASE_URL}/functions/v1/handle-referral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        referrerId,
        referredId
      })
    });
    
    const referralResult = await referralResponse.json();
    console.log(`Response status: ${referralResponse.status}`);
    console.log(`Response body: ${JSON.stringify(referralResult, null, 2)}`);
    
    if (!referralResponse.ok) {
      throw new Error(`Referral processing failed: ${referralResult.error || "Unknown error"}`);
    }
    
    console.log("Referral processing successful");
    
    // Step 4: Verify referral was recorded in database
    console.log("\nStep 4: Verifying referral record in database...");
    const { data: referralData, error: referralError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", referrerId)
      .eq("referred_id", referredId);
    
    if (referralError) {
      throw new Error(`Failed to verify referral: ${referralError.message}`);
    }
    
    if (!referralData || referralData.length === 0) {
      throw new Error("Referral record not found in database");
    }
    
    console.log(`Referral record found: ${JSON.stringify(referralData[0], null, 2)}`);
    
    // Step 5: Check referrer's credits
    console.log("\nStep 5: Checking referrer's credits...");
    const { data: referrerCredits, error: referrerCreditsError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", referrerId)
      .single();
    
    if (referrerCreditsError) {
      throw new Error(`Failed to check referrer credits: ${referrerCreditsError.message}`);
    }
    
    console.log(`Referrer credits: ${JSON.stringify(referrerCredits, null, 2)}`);
    
    // Step 6: Check referred user's credits
    console.log("\nStep 6: Checking referred user's credits...");
    const { data: referredCredits, error: referredCreditsError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", referredId)
      .single();
    
    if (referredCreditsError) {
      throw new Error(`Failed to check referred user credits: ${referredCreditsError.message}`);
    }
    
    console.log(`Referred user credits: ${JSON.stringify(referredCredits, null, 2)}`);
    
    // Step 7: Test duplicate referral handling
    console.log("\nStep 7: Testing duplicate referral handling...");
    const duplicateResponse = await fetch(`${SUPABASE_URL}/functions/v1/handle-referral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        referrerId,
        referredId
      })
    });
    
    const duplicateResult = await duplicateResponse.json();
    console.log(`Response status: ${duplicateResponse.status}`);
    console.log(`Response body: ${JSON.stringify(duplicateResult, null, 2)}`);
    
    // Step 8: Verify credits didn't change after duplicate attempt
    console.log("\nStep 8: Verifying credits after duplicate attempt...");
    const { data: updatedCredits, error: updatedCreditsError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", referrerId)
      .single();
    
    if (updatedCreditsError) {
      throw new Error(`Failed to check updated credits: ${updatedCreditsError.message}`);
    }
    
    console.log(`Updated referrer credits: ${JSON.stringify(updatedCredits, null, 2)}`);
    
    if (referrerCredits.total_credits !== updatedCredits.total_credits) {
      console.warn("Warning: Credits changed after duplicate referral attempt");
    } else {
      console.log("Credits remained the same after duplicate referral attempt, as expected");
    }
    
    console.log("\n✅ Referral system test completed successfully!");
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
testReferralSystem();
