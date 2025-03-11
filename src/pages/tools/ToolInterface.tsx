
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainNav from "@/components/layout/MainNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Copy, Download, Edit, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ToolMapping {
  [key: string]: {
    name: string;
    icon: string;
    placeholderPrompt: string;
    color: string;
    exampleInputs: string[];
  };
}

const ToolInterface = () => {
  const { toolType } = useParams<{ toolType: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [wordCount, setWordCount] = useState([1500]);
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  
  const toolMapping: ToolMapping = {
    blogging: {
      name: "Blogging Tool",
      icon: "📝",
      placeholderPrompt: "Write a blog post about the benefits of Halal food and its impact on health...",
      color: "bg-blue-100 text-blue-600",
      exampleInputs: [
        "Write a blog post about the importance of prayer in daily life",
        "Create an article about sustainable living from an Islamic perspective",
        "Write a guide to Ramadan for beginners"
      ]
    },
    youtube: {
      name: "YouTube Tool",
      icon: "🎬",
      placeholderPrompt: "Create a script for a YouTube video explaining the basics of Islamic finance...",
      color: "bg-red-100 text-red-600",
      exampleInputs: [
        "Create a YouTube script about common misconceptions about Islam",
        "Write an engaging video script about the history of Islamic architecture",
        "Script a Q&A video about Halal lifestyle choices"
      ]
    },
    research: {
      name: "Research Tool",
      icon: "🔍",
      placeholderPrompt: "Research the historical contributions of Muslim scholars to mathematics and science...",
      color: "bg-purple-100 text-purple-600",
      exampleInputs: [
        "Research the evolution of Islamic calligraphy through history",
        "Compile information about the Golden Age of Islam and its scientific achievements",
        "Analyze the impact of Islamic banking on global finance"
      ]
    },
    developer: {
      name: "Developer Tool",
      icon: "💻",
      placeholderPrompt: "Generate a React component for a prayer times calculator...",
      color: "bg-green-100 text-green-600",
      exampleInputs: [
        "Create a JavaScript function to calculate Zakat",
        "Generate a React component for displaying Quranic verses",
        "Write a MongoDB schema for a Halal food delivery app"
      ]
    },
    general: {
      name: "General Tool",
      icon: "📄",
      placeholderPrompt: "Create a guide on incorporating Islamic principles into modern daily life...",
      color: "bg-orange-100 text-orange-600",
      exampleInputs: [
        "Write a short story with Islamic moral values",
        "Create a daily dhikr schedule for busy professionals",
        "Design a flyer for an Islamic community event"
      ]
    }
  };

  const currentTool = toolMapping[toolType || "general"];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Reset state when tool type changes
    setPrompt("");
    setNegativePrompt("");
    setWordCount([1500]);
    setTone("professional");
    setGeneratedContent("");
  }, [toolType, user, navigate]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt before generating content");
      return;
    }

    setIsGenerating(true);
    
    // Simulate content generation (this would normally call an AI API)
    setTimeout(() => {
      // Mock generated content
      const mockContent = `# ${prompt.split(" ").slice(0, 5).join(" ")}...

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris auctor, nisl eget aliquam lacinia, nunc nisl tincidunt nunc, eget lacinia nisl nisl eget nisl. Mauris auctor, nisl eget aliquam lacinia, nunc nisl tincidunt nunc, eget lacinia nisl nisl eget nisl.

## Main Points

1. **First Point**: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris auctor, nisl eget aliquam lacinia, nunc nisl tincidunt nunc, eget lacinia nisl nisl eget nisl.

2. **Second Point**: Mauris auctor, nisl eget aliquam lacinia, nunc nisl tincidunt nunc, eget lacinia nisl nisl eget nisl.

3. **Third Point**: Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Islamic Perspective

From an Islamic perspective, this topic relates to several key principles:

- **Principle 1**: Lorem ipsum dolor sit amet
- **Principle 2**: Consectetur adipiscing elit
- **Principle 3**: Mauris auctor, nisl eget aliquam lacinia

## Conclusion

In conclusion, we can see that this topic has significant implications for Muslims in their daily lives. By following the guidance from Islamic teachings, we can approach this matter with wisdom and balance.

*May Allah guide us all to what is best and most pleasing to Him.*`;

      setGeneratedContent(mockContent);
      setIsGenerating(false);
      
      // Create a mock content ID and redirect to the editor
      const contentId = Math.random().toString(36).substring(2, 15);
      navigate(`/editor/${contentId}`);
    }, 3000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Content copied to clipboard");
  };

  const downloadContent = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${toolType}-content-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Content downloaded");
  };

  const applyExampleInput = (example: string) => {
    setPrompt(example);
  };

  const toneOptions = [
    "professional", "friendly", "casual", "formal", 
    "inspirational", "educational", "conversational"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8">
            <div className={`w-12 h-12 rounded-lg ${currentTool.color} flex items-center justify-center mr-4`}>
              <span className="text-2xl">{currentTool.icon}</span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{currentTool.name}</h1>
              <p className="text-muted-foreground">
                Generate Halal content that aligns with Islamic principles
              </p>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    What would you like to create?
                  </label>
                  <Textarea
                    placeholder={currentTool.placeholderPrompt}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium">Advanced Options</label>
                    <button 
                      onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${isAdvancedOptionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  
                  {isAdvancedOptionsOpen && (
                    <div className="space-y-4 pt-2 border-t mt-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          What should be avoided? (Negative prompt)
                        </label>
                        <Textarea
                          placeholder="Specify what you don't want in the generated content..."
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3">
                          Word Count: {wordCount[0]}
                        </label>
                        <Slider
                          defaultValue={[1500]}
                          min={300}
                          max={3000}
                          step={100}
                          value={wordCount}
                          onValueChange={setWordCount}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>300</span>
                          <span>1500</span>
                          <span>3000</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tone
                        </label>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {toneOptions.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  isLoading={isGenerating}
                >
                  {isGenerating ? (
                    "Generating..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">Try these examples:</h2>
            <div className="flex flex-wrap gap-2">
              {currentTool.exampleInputs.map((example, index) => (
                <button
                  key={index}
                  onClick={() => applyExampleInput(example)}
                  className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolInterface;
