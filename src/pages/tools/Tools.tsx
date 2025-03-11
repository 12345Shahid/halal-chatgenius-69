
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "@/components/layout/MainNav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { BookText, Youtube, Search, Code, FileText } from "lucide-react";

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const Tools = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const toolCategories: ToolCategory[] = [
    {
      id: "blogging",
      name: "Blogging Tool",
      description: "Generate engaging blog posts and articles that follow Islamic principles",
      icon: <BookText className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "youtube",
      name: "YouTube Tool",
      description: "Create scripts and content ideas for your Halal YouTube channel",
      icon: <Youtube className="h-8 w-8" />,
      color: "bg-red-100 text-red-600",
    },
    {
      id: "research",
      name: "Research Tool",
      description: "Gather insights and information for academic and educational purposes",
      icon: <Search className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "developer",
      name: "Developer Tool",
      description: "Generate code snippets and programming solutions that align with Islamic values",
      icon: <Code className="h-8 w-8" />,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "general",
      name: "General Tool",
      description: "Create various types of Halal content for different purposes",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const handleSelectTool = (toolId: string) => {
    navigate(`/tools/${toolId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold mb-4">Content Creation Tools</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a tool to start generating Halal content that aligns with Islamic principles and values
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((tool) => (
              <Card 
                key={tool.id} 
                className="hover:shadow-md transition-all duration-200 border border-border group"
              >
                <CardHeader className="pb-2">
                  <div className={`w-16 h-16 rounded-lg ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    {tool.icon}
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    onClick={() => handleSelectTool(tool.id)} 
                    className="w-full"
                  >
                    Select Tool
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tools;
