
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Download, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";

const SharedFile = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedFile = async () => {
      setIsLoading(true);
      try {
        // Fetch the shared file data
        const { data: sharedData, error: sharedError } = await supabase
          .from("shared_files")
          .select("file_id, shared_by")
          .eq("share_token", shareToken)
          .single();

        if (sharedError) {
          setError("This shared file link is invalid or has expired");
          setIsLoading(false);
          return;
        }

        // Fetch the actual file data
        const { data: fileData, error: fileError } = await supabase
          .from("files")
          .select("*")
          .eq("id", sharedData.file_id)
          .single();

        if (fileError) {
          setError("Unable to load the shared file");
          setIsLoading(false);
          return;
        }

        // Fetch sharer's details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("display_name, email")
          .eq("id", sharedData.shared_by)
          .single();

        if (!userError && userData) {
          fileData.shared_by_name = userData.display_name || userData.email;
        }

        setFile(fileData);
      } catch (error) {
        console.error("Error fetching shared file:", error);
        setError("An error occurred while loading the shared file");
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedFile();
    } else {
      setError("Invalid share link");
      setIsLoading(false);
    }
  }, [shareToken]);

  const downloadFile = () => {
    if (!file) return;
    
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyContent = () => {
    if (!file) return;
    
    navigator.clipboard.writeText(file.content);
    toast.success("Content copied to clipboard");
  };

  // Simple markdown rendering (very basic)
  const renderMarkdown = (content: string) => {
    if (!content) return "";
    
    // This is a very basic implementation - in a real app you'd use a proper markdown library
    const html = content
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
    
    return html;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="bg-background border-b py-4">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 w-1/4 mb-8" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="bg-background border-b py-4">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-semibold mb-4">Error</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-background border-b py-4">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">{file.name}</h1>
              {file.shared_by_name && (
                <p className="text-sm text-muted-foreground">
                  Shared by {file.shared_by_name}
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyContent}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button onClick={downloadFile}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(file.content) }} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SharedFile;
