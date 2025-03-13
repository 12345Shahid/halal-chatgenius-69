
// Test script for API rate limit handling
// Run using: deno run --allow-net --allow-env supabase/functions/test-api-limits.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configuration - Replace these with your actual values for testing
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "your-supabase-url";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "your-supabase-anon-key";
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "test-password";

async function testApiRateLimitHandling() {
  console.log("=== HalalChat API Rate Limit Handling Test ===");
  
  try {
    // Authenticate to get a test token
    console.log("\nAuthenticating with test account...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    const authToken = data.session?.access_token;
    const userId = data.user?.id;
    
    if (!authToken || !userId) {
      throw new Error("Could not get authentication token or user ID");
    }
    
    console.log("Successfully authenticated!");
    
    // Test rate limit handling by making multiple requests in quick succession
    console.log("\nSending multiple requests to test rate limit handling...");
    
    const prompt = "Generate content about the importance of prayer in Islam";
    const numberOfRequests = 5; // Adjust this based on the actual rate limits
    const results = [];
    
    for (let i = 0; i < numberOfRequests; i++) {
      console.log(`\nSending request ${i+1} of ${numberOfRequests}`);
      
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            prompt,
            wordCount: 100,
            tone: "informative",
            toolType: "general",
            userId
          })
        });
        
        const result = await response.json();
        
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          console.log("Success! Content generated.");
          results.push({ status: "success", contentLength: result.content?.length || 0 });
        } else {
          console.log(`Error: ${result.error}`);
          
          // Check if this is a rate limit error
          const isRateLimitError = 
            result.error?.includes("rate limit") || 
            result.error?.includes("high traffic") ||
            result.error?.includes("try again") ||
            result.error?.includes("quota");
          
          if (isRateLimitError) {
            console.log("✅ Rate limit error detected and handled properly");
          }
          
          results.push({ status: "error", error: result.error, isRateLimitError });
        }
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (requestError) {
        console.error(`Request ${i+1} failed with exception:`, requestError);
        results.push({ status: "exception", error: requestError.message });
      }
    }
    
    // Analyze results
    console.log("\n=== Rate Limit Test Results ===");
    const successCount = results.filter(r => r.status === "success").length;
    const rateLimitErrorCount = results.filter(r => r.status === "error" && r.isRateLimitError).length;
    const otherErrorCount = results.filter(r => (r.status === "error" && !r.isRateLimitError) || r.status === "exception").length;
    
    console.log(`Total requests: ${numberOfRequests}`);
    console.log(`Successful requests: ${successCount}`);
    console.log(`Rate limit errors: ${rateLimitErrorCount}`);
    console.log(`Other errors: ${otherErrorCount}`);
    
    if (rateLimitErrorCount > 0) {
      console.log("\n✅ The API correctly detected and handled rate limiting!");
    } else if (successCount === numberOfRequests) {
      console.log("\n⚠️ All requests succeeded. Either the rate limit is higher than expected or the test didn't trigger it.");
    } else {
      console.log("\n❌ Some requests failed, but not with proper rate limit error handling.");
    }
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
testApiRateLimitHandling();
