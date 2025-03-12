import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MainNav from '@/components/layout/MainNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Download, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/use-credits';

const ToolInterface = () => {
  const { toolType } = useParams<{ toolType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, loading: creditsLoading, refetch: refetchCredits } = useCredits();
  
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [wordCount, setWordCount] = useState<number>(300);
  const [tone, setTone] = useState<string>("informative");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [contentId, setContentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [haramDetails, setHaramDetails] = useState<{
    explanation?: string;
    haramPhrases?: string[];
  } | null>(null);

  const toolTypeLabel = () => {
    switch (toolType) {
      case "blog":
        return "Blog Post Generator";
      case "research":
        return "Research Content Generator";
      case "youtube":
        return "YouTube Script Generator";
      case "developer":
        return "Code Assistant";
      default:
        return "Content Generator";
    }
  };

  const toolPromptPlaceholder = () => {
    switch (toolType) {
      case "blog":
        return "Enter a topic or title for your blog post...";
      case "research":
        return "Enter a research topic or question...";
      case "youtube":
        return "Enter a title or topic for your YouTube video...";
      case "developer":
        return "Describe what you need help with (e.g., 'Create a React form with validation')...";
      default:
        return "What would you like to create?";
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (!credits || credits.total_credits <= 0) {
      toast.error("You don't have enough credits to generate content");
      setError("Not enough credits. Please get more credits to continue.");
      return;
    }

    setGenerating(true);
    setError(null);
    setHaramDetails(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabase.auth.getSession()}`
        },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          wordCount: wordCount || undefined,
          tone: tone || undefined,
          toolType: toolType || "general",
          userId: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Haram content detected") {
          setHaramDetails({
            explanation: data.details,
            haramPhrases: data.haramPhrases
          });
          setError("The content you requested contains elements that are not permissible according to Islamic principles.");
        } else if (data.error === "Not enough credits") {
          setError("You don't have enough credits. Please get more credits to continue.");
        } else {
          setError(data.error || "Failed to generate content");
        }
        return;
      }

      setGeneratedContent(data.content);
      setContentId(data.contentId);
      refetchCredits(); // Refresh credits after generation
    } catch (error) {
      console.error("Error generating content:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setGenerating(false);
    }
  };

  const saveContent = () => {
    if (contentId) {
      navigate(`/editor/${contentId}`);
    } else if (generatedContent) {
      // Save the content first, then navigate
      saveAndNavigate();
    }
  };

  const saveAndNavigate = async () => {
    if (!user || !generatedContent) return;

    try {
      const { data, error } = await supabase
        .from("content")
        .insert({
          user_id: user.id,
          title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
          content: generatedContent,
          type: toolType || "general"
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving content:", error);
        toast.error("Failed to save content");
        return;
      }

      navigate(`/editor/${data.id}`);
    } catch (error) {
      console.error("Error in saveAndNavigate:", error);
      toast.error("Failed to save content");
    }
  };

  const downloadContent = () => {
    if (!generatedContent) return;

    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${prompt.substring(0, 30)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">{toolTypeLabel()}</h1>
          <div className="flex items-center">
            <div className="text-sm mr-4">
              Credits: <span className="font-semibold">{creditsLoading ? "..." : credits?.total_credits || 0}</span>
            </div>
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>What would you like to create?</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Textarea
                      id="prompt"
                      placeholder={toolPromptPlaceholder()}
                      className="mt-1 h-32"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>

                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic">
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="tone">Tone</Label>
                          <Select
                            value={tone}
                            onValueChange={setTone}
                          >
                            <SelectTrigger id="tone">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="informative">Informative</SelectItem>
                              <SelectItem value="conversational">Conversational</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="persuasive">Persuasive</SelectItem>
                              <SelectItem value="entertaining">Entertaining</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="wordCount">Word Count (approximate)</Label>
                          <Input
                            id="wordCount"
                            type="number"
                            min="50"
                            max="2000"
                            value={wordCount}
                            onChange={(e) => setWordCount(parseInt(e.target.value) || 300)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="advanced">
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="negativePrompt">Avoid Including (optional)</Label>
                          <Textarea
                            id="negativePrompt"
                            placeholder="Topics, phrases, or styles to avoid..."
                            className="mt-1"
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                      
                      {haramDetails && haramDetails.haramPhrases && haramDetails.haramPhrases.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Detected phrases:</p>
                          <ul className="list-disc pl-5 mt-1">
                            {haramDetails.haramPhrases.map((phrase, idx) => (
                              <li key={idx} className="text-sm">{phrase}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Alert>
                  )}

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={generateContent}
                      disabled={generating || !prompt.trim()}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {generating ? "Generating..." : "Generate Content"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Generated Content</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadContent}
                      disabled={!generatedContent}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveContent}
                      disabled={!generatedContent}
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
                <div className="relative min-h-[400px] border rounded-lg p-4 bg-muted/20">
                  {generating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                        <p className="mt-2 text-muted-foreground">Generating content...</p>
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <div className="whitespace-pre-wrap">{generatedContent}</div>
                  ) : (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                      <p>Generated content will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolInterface;
