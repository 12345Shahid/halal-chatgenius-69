
// This is a test script for the HalalChat APIs
// Run using: deno run --allow-net --allow-env supabase/functions/test-apis.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configuration - Replace these with your actual values for testing
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "your-supabase-url";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "your-supabase-anon-key";
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "test-password";

// Function to test content generation
async function testContentGeneration(authToken: string, userId: string) {
  console.log("\n----- Testing Content Generation API -----");
  
  // Test cases for content generation
  const testCases = [
    {
      name: "Basic text generation",
      input: {
        prompt: "Write a short post about the importance of prayer in Islam",
        wordCount: 200,
        tone: "informative",
        toolType: "blog",
        userId
      }
    },
    {
      name: "Halal check - should pass",
      input: {
        prompt: "Write about the benefits of eating healthy food",
        wordCount: 150,
        tone: "conversational",
        toolType: "general",
        userId
      }
    },
    {
      name: "Halal check - should detect haram content",
      input: {
        prompt: "Write about the best wines to drink with pork",
        wordCount: 150,
        tone: "formal",
        toolType: "blog",
        userId
      }
    },
    {
      name: "Test with negative prompt",
      input: {
        prompt: "Write about the benefits of exercise",
        negativePrompt: "running, jogging",
        wordCount: 150,
        tone: "persuasive",
        toolType: "blog",
        userId
      }
    },
    {
      name: "Test visualization detection",
      input: {
        prompt: "Compare the five pillars of Islam in a structured way",
        wordCount: 300,
        tone: "informative",
        toolType: "research",
        userId
      }
    }
  ];

  // Run the test cases
  for (const testCase of testCases) {
    console.log(`\nRunning test: ${testCase.name}`);
    console.log(`Input: ${JSON.stringify(testCase.input, null, 2)}`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(testCase.input)
      });
      
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        console.log("Success!");
        console.log(`Content Length: ${data.content?.length || 0} characters`);
        console.log(`Visualization Data: ${data.visualizationData ? "Present" : "None"}`);
      } else {
        console.log(`Error: ${data.error}`);
        if (data.details) console.log(`Details: ${data.details}`);
        if (data.haramPhrases) console.log(`Haram Phrases: ${data.haramPhrases.join(", ")}`);
        if (data.halalSuggestion) console.log(`Halal Suggestion Available: Yes`);
      }
    } catch (error) {
      console.error(`Test failed with exception:`, error);
    }
  }
}

// Function to test referral system
async function testReferralSystem(authToken: string) {
  console.log("\n----- Testing Referral System -----");
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Create two test users for referral testing
  console.log("Creating test users for referral testing...");
  
  // Create first test user (referrer)
  const { data: referrer, error: referrerError } = await supabase.auth.signUp({
    email: `referrer-${Date.now()}@example.com`,
    password: "TestPassword123!"
  });
  
  if (referrerError) {
    console.error("Failed to create referrer user:", referrerError);
    return;
  }
  
  const referrerId = referrer.user?.id;
  console.log(`Created referrer with ID: ${referrerId}`);
  
  // Create second test user (referred)
  const { data: referred, error: referredError } = await supabase.auth.signUp({
    email: `referred-${Date.now()}@example.com`,
    password: "TestPassword123!"
  });
  
  if (referredError) {
    console.error("Failed to create referred user:", referredError);
    return;
  }
  
  const referredId = referred.user?.id;
  console.log(`Created referred user with ID: ${referredId}`);
  
  // Test the referral API
  console.log("\nTesting the handle-referral API...");
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/handle-referral`, {
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
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    
    // Test duplicate referral handling
    console.log("\nTesting duplicate referral handling...");
    
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
    
    const duplicateData = await duplicateResponse.json();
    
    console.log(`Status: ${duplicateResponse.status}`);
    console.log(`Response: ${JSON.stringify(duplicateData, null, 2)}`);
    
    // Check credits after referral
    console.log("\nChecking referrer credits...");
    
    const { data: referrerCredits, error: referrerCreditsError } = await supabase
      .from("credits")
      .select("total_credits, referral_credits")
      .eq("user_id", referrerId)
      .single();
    
    if (referrerCreditsError) {
      console.error("Error fetching referrer credits:", referrerCreditsError);
    } else {
      console.log(`Referrer credits: ${JSON.stringify(referrerCredits, null, 2)}`);
    }
    
    console.log("\nChecking referred user credits...");
    
    const { data: referredCredits, error: referredCreditsError } = await supabase
      .from("credits")
      .select("total_credits")
      .eq("user_id", referredId)
      .single();
    
    if (referredCreditsError) {
      console.error("Error fetching referred user credits:", referredCreditsError);
    } else {
      console.log(`Referred user credits: ${JSON.stringify(referredCredits, null, 2)}`);
    }
    
  } catch (error) {
    console.error("Test failed with exception:", error);
  }
}

// Main function to run all tests
async function runTests() {
  console.log("Starting API tests for HalalChat...");
  
  try {
    // Authenticate to get a test token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log(`Authenticating with test account...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error("Authentication failed:", error);
      return;
    }
    
    const authToken = data.session?.access_token;
    const userId = data.user?.id;
    
    if (!authToken || !userId) {
      console.error("Could not get authentication token or user ID");
      return;
    }
    
    console.log("Successfully authenticated!");
    
    // Run content generation tests
    await testContentGeneration(authToken, userId);
    
    // Run referral system tests
    await testReferralSystem(authToken);
    
    console.log("\nAll tests completed!");
    
  } catch (error) {
    console.error("Test suite failed with exception:", error);
  }
}

// Run the tests
runTests();
