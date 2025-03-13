
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
  console.log("[generate-content] Request received:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[generate-content] Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const requestBody = await req.json();
    console.log("[generate-content] Request body received:", JSON.stringify(requestBody));
    
    const { prompt, negativePrompt, wordCount, tone, toolType, userId } = requestBody;
    
    // Validate essential parameters
    if (!prompt || !userId) {
      console.log("[generate-content] Missing required parameters:", { prompt, userId });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    console.log("[generate-content] Initializing Supabase client with URL:", SUPABASE_URL);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user has enough credits
    console.log("[generate-content] Checking credits for user:", userId);
    const { data: credits, error: creditsError } = await supabase
      .from("credits")
      .select("total_credits")
      .eq("user_id", userId)
      .maybeSingle();

    if (creditsError) {
      console.error("[generate-content] Error checking credits:", creditsError);
      
      // If credits table doesn't exist for the user, create it with initial credits
      if (creditsError.code === "PGRST116") {
        console.log("[generate-content] Creating initial credits for user:", userId);
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
        console.error("[generate-content] Unhandled error checking credits:", creditsError);
        return new Response(
          JSON.stringify({ error: "Error checking credits" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (!credits || credits.total_credits <= 0) {
      console.log("[generate-content] User has insufficient credits:", credits?.total_credits);
      return new Response(
        JSON.stringify({ error: "Not enough credits" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the prompt contains haram content
    console.log("[generate-content] Checking for haram content in prompt");
    const isHaramContent = await checkForHaramContent(prompt);
    if (isHaramContent.isHaram) {
      // Generate a halal alternative suggestion
      console.log("[generate-content] Haram content detected, generating alternative");
      const halalSuggestion = await generateHalalAlternative(prompt, isHaramContent.haramPhrases);
      
      return new Response(
        JSON.stringify({ 
          error: "Haram content detected", 
          details: isHaramContent.explanation,
          haramPhrases: isHaramContent.haramPhrases,
          halalSuggestion
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze if the prompt would benefit from visualizations
    console.log("[generate-content] Analyzing if visualization would be beneficial");
    const shouldVisualize = await shouldUseVisualization(prompt);
    
    // Generate content using Hugging Face API
    console.log("[generate-content] Generating content with HuggingFace API");
    const generatedContentResponse = await generateContentWithHuggingFace(
      prompt, 
      negativePrompt, 
      wordCount, 
      tone,
      shouldVisualize.shouldVisualize
    );
    
    let generatedContent = generatedContentResponse.text;
    let visualizationData = null;
    
    // If visualization is recommended, extract and prepare visualization data
    if (shouldVisualize.shouldVisualize && generatedContentResponse.visualizationData) {
      console.log("[generate-content] Preparing visualization data");
      visualizationData = {
        type: shouldVisualize.visualizationType,
        data: generatedContentResponse.visualizationData,
        title: shouldVisualize.title || "Generated Visualization"
      };
    }

    // Deduct credits if the user has them
    if (credits) {
      console.log("[generate-content] Deducting 1 credit from user:", userId);
      await supabase
        .from("credits")
        .update({ 
          total_credits: credits.total_credits - 1,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
    }

    // Save the generated content in the content table
    console.log("[generate-content] Saving generated content to database");
    const { data: savedContent, error: contentError } = await supabase
      .from("content")
      .insert({
        user_id: userId,
        title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
        content: generatedContent,
        visualization_data: visualizationData,
        type: toolType || "general"
      })
      .select()
      .single();

    if (contentError) {
      console.error("[generate-content] Error saving content:", contentError);
    }

    console.log("[generate-content] Successfully generated content, returning response");
    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        contentId: savedContent?.id || null,
        visualizationData: visualizationData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-content] Error in generate-content function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function shouldUseVisualization(prompt: string): Promise<{
  shouldVisualize: boolean;
  visualizationType?: "chart" | "table" | "list" | "timeline";
  title?: string;
}> {
  try {
    console.log("[visualization-analysis] Analyzing prompt for visualization potential:", prompt);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: `You are an AI assistant that helps determine if a prompt would benefit from visualization. Analyze the following prompt and decide if it should include a chart, table, list, or timeline to better present the information, or if plain text is sufficient.

Prompt: "${prompt}"

First, determine if this prompt is asking for or would clearly benefit from a visualization. Then, if a visualization would be helpful, specify which type would be most appropriate.

Your response must be in this format:
Visualization: [Yes/No]
Type: [chart/table/list/timeline, if applicable]
Title: [Suggested title for the visualization, if applicable]
Explanation: [Brief explanation of your decision]`,
          parameters: {
            max_new_tokens: 256,
            temperature: 0.1,
            do_sample: false,
          },
        }),
      }
    );

    const result = await response.json();
    
    if (result.error) {
      if (result.error.includes("rate limit") || result.error.includes("quota")) {
        console.warn("[visualization-analysis] HuggingFace API rate limit reached:", result.error);
        // Return a safe default in case of rate limit
        return { shouldVisualize: false };
      }
      
      console.error("[visualization-analysis] Error in visualization analysis:", result.error);
      return { shouldVisualize: false };
    }
    
    const analysisText = result[0]?.generated_text || "";
    console.log("[visualization-analysis] Analysis result:", analysisText);
    
    // Parse the AI response to extract information
    const shouldVisualize = /Visualization:\s*Yes/i.test(analysisText);
    
    if (!shouldVisualize) {
      return { shouldVisualize: false };
    }
    
    // Extract visualization type
    const typeMatch = analysisText.match(/Type:\s*(chart|table|list|timeline)/i);
    const visualizationType = typeMatch ? typeMatch[1].toLowerCase() as "chart" | "table" | "list" | "timeline" : undefined;
    
    // Extract title
    const titleMatch = analysisText.match(/Title:\s*(.+?)(?=\n|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;
    
    console.log("[visualization-analysis] Visualization recommendation:", { shouldVisualize, visualizationType, title });
    return {
      shouldVisualize,
      visualizationType,
      title
    };
  } catch (error) {
    console.error("[visualization-analysis] Error in visualization analysis:", error);
    return { shouldVisualize: false };
  }
}

async function checkForHaramContent(prompt: string): Promise<{isHaram: boolean, explanation?: string, haramPhrases?: string[], categories?: string[]}> {
  try {
    console.log("[haram-check] Checking prompt for haram content:", prompt);
    // First, use a more sophisticated AI model to analyze the content
    const analysisResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: `You are an Islamic content moderation assistant. Analyze the following text and determine if it contains any content that would be considered haram (forbidden) according to Islamic principles. Common haram content includes references to alcohol, gambling, sexual content, interest-based finance, music with instruments, idol worship, and consumption of forbidden foods like pork.

Text to analyze: "${prompt}"

First, identify if this text contains any haram content. Then, if it does, explain in detail why it is considered haram in Islam with specific references to Islamic principles. Include the exact phrases that are problematic.

Your response must be in this format:
Haram: [Yes/No]
Categories: [List of haram categories found, if any]
Explanation: [Detailed explanation of why it's haram, if applicable]
Problematic phrases: [List of specific phrases that are problematic]`,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.1,
            do_sample: false,
          },
        }),
      }
    );

    const analysisResult = await analysisResponse.json();
    
    if (analysisResult.error) {
      if (analysisResult.error.includes("rate limit") || analysisResult.error.includes("quota")) {
        console.warn("[haram-check] HuggingFace API rate limit reached:", analysisResult.error);
        // Gracefully handle rate limit by returning a default value
        return { isHaram: false };
      }
      
      console.error("[haram-check] Error in AI analysis:", analysisResult.error);
      // Fall back to simple classification as backup
      return fallbackHaramCheck(prompt);
    }
    
    const analysisText = analysisResult[0]?.generated_text || "";
    console.log("[haram-check] Analysis result:", analysisText);
    
    // Parse the AI response to extract information
    const isHaram = /Haram:\s*Yes/i.test(analysisText);
    
    if (!isHaram) {
      return { isHaram: false };
    }
    
    // Extract explanation
    const explanationMatch = analysisText.match(/Explanation:\s*([\s\S]+?)(?=Problematic phrases:|$)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : "This content contains elements that are not permissible according to Islamic principles.";
    
    // Extract problematic phrases
    const phrasesMatch = analysisText.match(/Problematic phrases:\s*([\s\S]+?)(?=$)/i);
    const haramPhrases = phrasesMatch 
      ? phrasesMatch[1].split(/\n|,/).map(phrase => phrase.trim()).filter(Boolean)
      : [];
    
    // Extract categories
    const categoriesMatch = analysisText.match(/Categories:\s*([\s\S]+?)(?=Explanation:|$)/i);
    const categories = categoriesMatch
      ? categoriesMatch[1].split(/\n|,/).map(category => category.trim()).filter(Boolean)
      : [];
    
    console.log("[haram-check] Haram content detected:", { isHaram, explanation, haramPhrases, categories });
    return {
      isHaram,
      explanation,
      haramPhrases,
      categories
    };
  } catch (error) {
    console.error("[haram-check] Error checking for haram content:", error);
    // Fall back to simpler classification method
    return fallbackHaramCheck(prompt);
  }
}

// Fallback to the original classification method if the AI analysis fails
async function fallbackHaramCheck(prompt: string): Promise<{isHaram: boolean, explanation?: string, haramPhrases?: string[]}> {
  try {
    console.log("[fallback-haram-check] Using fallback method for haram check");
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
    
    if (result.error) {
      if (result.error.includes("rate limit") || result.error.includes("quota")) {
        console.warn("[fallback-haram-check] HuggingFace API rate limit reached:", result.error);
        // For rate limit issues, let's not block content
        return { isHaram: false };
      }
      console.error("[fallback-haram-check] Error in fallback check:", result.error);
      // If there's another type of API error, we'll proceed without blocking
      return { isHaram: false };
    }
    
    // Check if any haram categories have high scores
    const haramLabels = result.labels.filter((label: string) => 
      label !== "halal content" && 
      result.scores[result.labels.indexOf(label)] > 0.7
    );
    
    if (haramLabels.length > 0) {
      const explanation = `The content appears to contain references to ${haramLabels.join(", ")}, which is not permissible according to Islamic principles.`;
      const haramPhrases = identifyPotentialHaramPhrases(prompt, haramLabels);
      console.log("[fallback-haram-check] Haram content detected:", { haramLabels, haramPhrases });
      return {
        isHaram: true,
        explanation,
        haramPhrases
      };
    }
    
    return { isHaram: false };
  } catch (error) {
    console.error("[fallback-haram-check] Error in fallback haram check:", error);
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

async function generateHalalAlternative(originalPrompt: string, haramPhrases: string[] = []): Promise<string> {
  try {
    console.log("[halal-alternative] Generating halal alternative for prompt with phrases:", haramPhrases);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: `You are an Islamic content assistant. The following prompt has been identified as containing elements that may not be permissible according to Islamic principles:

"${originalPrompt}"

${haramPhrases.length > 0 ? `Specifically, these phrases were identified as problematic: ${haramPhrases.join(", ")}` : ""}

Please rewrite this prompt to be fully compliant with Islamic principles while maintaining its original intent as much as possible. Make sure to remove or modify any references to alcohol, gambling, inappropriate relationships, interest-based finance, or other elements that would be considered haram.

Provide ONLY the rewritten prompt without any explanation or introduction.`,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.1,
            do_sample: false,
          },
        }),
      }
    );

    const result = await response.json();
    
    if (result.error) {
      if (result.error.includes("rate limit") || result.error.includes("quota")) {
        console.warn("[halal-alternative] HuggingFace API rate limit reached:", result.error);
        return "I'm unable to suggest an alternative. Please try again in a few minutes when our services have capacity.";
      }
      console.error("[halal-alternative] Error generating alternative:", result.error);
      return "I'm unable to suggest an alternative. Please modify your prompt to avoid haram content.";
    }
    
    const suggestion = result[0]?.generated_text || "I'm unable to suggest an alternative. Please modify your prompt to avoid haram content.";
    console.log("[halal-alternative] Generated alternative:", suggestion);
    return suggestion;
  } catch (error) {
    console.error("[halal-alternative] Error generating halal alternative:", error);
    return "I'm unable to suggest an alternative at this time. Please try modifying your prompt to avoid haram content.";
  }
}

interface ContentGenerationResult {
  text: string;
  visualizationData?: any;
}

async function generateContentWithHuggingFace(
  prompt: string, 
  negativePrompt?: string, 
  wordCount?: number,
  tone?: string,
  includeVisualization: boolean = false
): Promise<ContentGenerationResult> {
  try {
    console.log("[content-generation] Generating content with parameters:", { prompt, negativePrompt, wordCount, tone, includeVisualization });
    
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
    
    // Add specific instructions for halal content and visualization if needed
    if (includeVisualization) {
      enhancedPrompt = `Generate content that is halal (permissible according to Islamic principles) about the following: ${enhancedPrompt}

If this content would benefit from a visualization (chart, table, list, etc.), please include structured data that can be used to create the visualization at the end of your response.

For tables or lists, format the data as a JSON array at the end of your response, labeled with ===VISUALIZATION_DATA=== before the JSON.
For charts, provide the data points as a JSON object with labels and values.

Example for a chart:
===VISUALIZATION_DATA===
{"labels": ["Category A", "Category B", "Category C"], "values": [10, 25, 15]}

Example for a table:
===VISUALIZATION_DATA===
[{"column1": "value1", "column2": "value2"}, {"column1": "value3", "column2": "value4"}]`;
    } else {
      enhancedPrompt = `Generate content that is halal (permissible according to Islamic principles) about the following: ${enhancedPrompt}`;
    }

    console.log("[content-generation] Enhanced prompt:", enhancedPrompt);

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
      console.error("[content-generation] Hugging Face API error:", result.error);
      
      if (result.error.includes("rate limit") || result.error.includes("quota")) {
        return { 
          text: "We're currently experiencing high traffic on our AI services. Please try again in a few minutes. We're working to improve our service capacity. Thank you for your patience." 
        };
      }
      
      return { text: "Error generating content. Please try again later." };
    }
    
    const generatedText = result[0]?.generated_text || "No content generated";
    console.log("[content-generation] Content generated successfully, length:", generatedText.length);
    
    // Check if the response contains visualization data
    const visualizationDataMatch = generatedText.match(/===VISUALIZATION_DATA===\s*(\{.*\}|\[.*\])/s);
    
    if (visualizationDataMatch && visualizationDataMatch[1]) {
      try {
        const jsonData = JSON.parse(visualizationDataMatch[1].trim());
        console.log("[content-generation] Visualization data extracted:", jsonData);
        
        // Return both the text (with visualization data marker removed) and the parsed data
        return { 
          text: generatedText.replace(/===VISUALIZATION_DATA===\s*(\{.*\}|\[.*\])/s, "").trim(),
          visualizationData: jsonData
        };
      } catch (error) {
        console.error("[content-generation] Error parsing visualization data:", error);
        return { text: generatedText };
      }
    }
    
    return { text: generatedText };
  } catch (error) {
    console.error("[content-generation] Error generating content with Hugging Face:", error);
    return { text: "Error generating content. Please try again later." };
  }
}
