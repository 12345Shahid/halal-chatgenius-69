
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const HUGGING_FACE_API_KEY = Deno.env.get("HUGGING_FACE_API_KEY") || "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";
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
    // Get the request body
    const { prompt, negativePrompt, wordCount, tone, toolType, userId } = await req.json();
    
    // Validate essential parameters
    if (!prompt || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user has enough credits
    const { data: credits, error: creditsError } = await supabase
      .from("credits")
      .select("total_credits")
      .eq("user_id", userId)
      .maybeSingle();

    if (creditsError) {
      console.error("Error checking credits:", creditsError);
      
      // If credits table doesn't exist for the user, create it with initial credits
      if (creditsError.code === "PGRST116") {
        await supabase
          .from("credits")
          .insert({
            user_id: userId,
            total_credits: 5, // Start with 5 credits
            referral_credits: 0,
            ad_credits: 0
          });
          
        // Continue with content generation since we just added credits
      } else {
        return new Response(
          JSON.stringify({ error: "Error checking credits" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (!credits || credits.total_credits <= 0) {
      return new Response(
        JSON.stringify({ error: "Not enough credits" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the prompt contains haram content
    const isHaramContent = await checkForHaramContent(prompt);
    if (isHaramContent.isHaram) {
      return new Response(
        JSON.stringify({ 
          error: "Haram content detected", 
          details: isHaramContent.explanation,
          haramPhrases: isHaramContent.haramPhrases
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate content using Hugging Face API
    const generatedContent = await generateContentWithHuggingFace(
      prompt, 
      negativePrompt, 
      wordCount, 
      tone
    );

    // Deduct credits if the user has them
    if (credits) {
      await supabase
        .from("credits")
        .update({ 
          total_credits: credits.total_credits - 1,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
    }

    // Save the generated content in the content table
    const { data: savedContent, error: contentError } = await supabase
      .from("content")
      .insert({
        user_id: userId,
        title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
        content: generatedContent,
        type: toolType || "general"
      })
      .select()
      .single();

    if (contentError) {
      console.error("Error saving content:", contentError);
    }

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        contentId: savedContent?.id || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkForHaramContent(prompt: string): Promise<{isHaram: boolean, explanation?: string, haramPhrases?: string[]}> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            candidate_labels: [
              "halal content", 
              "haram content",
              "alcohol", 
              "gambling", 
              "pornography", 
              "interest-based finance"
            ]
          },
        }),
      }
    );

    const result = await response.json();
    
    // Check if any haram categories have high scores
    const haramLabels = result.labels.filter((label: string) => 
      label !== "halal content" && 
      result.scores[result.labels.indexOf(label)] > 0.7
    );
    
    if (haramLabels.length > 0) {
      return {
        isHaram: true,
        explanation: `The content appears to contain references to ${haramLabels.join(", ")}, which is not permissible according to Islamic principles.`,
        haramPhrases: identifyPotentialHaramPhrases(prompt, haramLabels)
      };
    }
    
    return { isHaram: false };
  } catch (error) {
    console.error("Error checking for haram content:", error);
    // In case of error, let's proceed but log the issue
    return { isHaram: false };
  }
}

function identifyPotentialHaramPhrases(text: string, categories: string[]): string[] {
  // A simple implementation - in real world this would be more sophisticated
  const keywordMap: Record<string, string[]> = {
    "alcohol": ["alcohol", "wine", "beer", "liquor", "drunk", "drinking"],
    "gambling": ["gambling", "bet", "casino", "lottery", "poker"],
    "pornography": ["porn", "naked", "nude", "sex", "explicit"],
    "interest-based finance": ["interest", "riba", "usury", "conventional loan"]
  };
  
  const phrases: string[] = [];
  const words = text.toLowerCase().split(/\s+/);
  
  categories.forEach(category => {
    if (keywordMap[category]) {
      keywordMap[category].forEach(keyword => {
        const index = words.findIndex(w => w.includes(keyword));
        if (index >= 0) {
          // Extract a phrase around the keyword (3 words before and after)
          const start = Math.max(0, index - 3);
          const end = Math.min(words.length, index + 4);
          phrases.push(words.slice(start, end).join(" "));
        }
      });
    }
  });
  
  return [...new Set(phrases)]; // Remove duplicates
}

async function generateContentWithHuggingFace(
  prompt: string, 
  negativePrompt?: string, 
  wordCount?: number,
  tone?: string
): Promise<string> {
  try {
    // Construct a more detailed prompt
    let enhancedPrompt = prompt;
    
    if (tone) {
      enhancedPrompt = `Generate a ${tone} response to: ${prompt}`;
    }
    
    if (wordCount) {
      enhancedPrompt = `${enhancedPrompt} (in approximately ${wordCount} words)`;
    }
    
    if (negativePrompt) {
      enhancedPrompt = `${enhancedPrompt} (avoid: ${negativePrompt})`;
    }
    
    // Add specific instruction for halal content
    enhancedPrompt = `Generate content that is halal (permissible according to Islamic principles) about the following: ${enhancedPrompt}`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            max_new_tokens: wordCount ? Math.min(wordCount * 6, 2048) : 1024,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
          },
        }),
      }
    );

    const result = await response.json();
    
    if (result.error) {
      console.error("Hugging Face API error:", result.error);
      return "Error generating content. Please try again later.";
    }
    
    return result[0].generated_text || "No content generated";
  } catch (error) {
    console.error("Error generating content with Hugging Face:", error);
    return "Error generating content. Please try again later.";
  }
}
