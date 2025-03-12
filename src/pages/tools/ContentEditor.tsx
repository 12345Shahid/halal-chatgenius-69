
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainNav from "@/components/layout/MainNav";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Save, ChevronLeft, Copy, Download, Share2, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportAsTxt, exportAsPdf, exportAsCsv } from "@/utils/export-utils";
import { FileType } from "@/types/file";

interface ContentData {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

const ContentEditor = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<ContentData | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        // This would normally fetch content from Supabase
        // For now, using mock data
        const mockContent: ContentData = {
          id: contentId || "1",
          title: "The Benefits of Halal Food",
          content: `# The Benefits of Halal Food

## Introduction

Halal food refers to food items that are prepared according to Islamic dietary laws. These laws dictate which foods are permissible for Muslims to eat and how the food must be prepared. The word "Halal" itself means permissible in Arabic.

## Health Benefits

Halal food preparation emphasizes cleanliness and quality. Here are some health benefits:

1. **Hygienic Preparation**: Halal guidelines require that food be prepared in a clean environment, reducing the risk of contamination.

2. **Blood-Free Meat**: Halal slaughtering practices ensure that blood, which can harbor harmful bacteria, is drained from the meat.

3. **No Harmful Additives**: Halal certification requires that food does not contain harmful additives or ingredients.

## Ethical Benefits

Halal practices also emphasize ethical treatment:

- **Animal Welfare**: Islamic law requires animals to be well-treated during their lives and slaughtered in a way that minimizes pain.
- **Sustainable Practices**: Many Halal producers also emphasize sustainable and environmentally friendly practices.

## Spiritual Benefits

Following Halal dietary guidelines has spiritual significance for Muslims:

- **Obedience to God**: Consuming Halal food is an act of obedience to Allah's commands.
- **Mindful Eating**: The Halal concept encourages mindfulness about what we consume.

## Conclusion

Halal food offers a combination of health, ethical, and spiritual benefits. By following these dietary guidelines, Muslims can maintain their faith while also making positive choices for their physical well-being.

*May Allah guide us all to what is best and most pleasing to Him.*`,
          type: "blog",
          createdAt: new Date().toISOString(),
        };

        setContent(mockContent);
        setEditedContent(mockContent.content);
        setEditedTitle(mockContent.title);
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, user, navigate]);

  const handleSave = async () => {
    if (!content) return;
    
    setIsSaving(true);
    try {
      // This would normally save to Supabase
      setTimeout(() => {
        toast.success("Content saved successfully");
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!content) return;
    
    if (confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      try {
        // This would normally delete from Supabase
        toast.success("Content deleted successfully");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error deleting content:", error);
        toast.error("Failed to delete content");
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedContent);
    toast.success("Content copied to clipboard");
  };

  const exportContent = (format: 'txt' | 'pdf' | 'csv') => {
    if (!content) return;
    
    const fileData: FileType = {
      id: content.id,
      name: editedTitle,
      content: editedContent,
      type: content.type,
      user_id: user?.id || '',
      created_at: content.createdAt,
      updated_at: content.createdAt,
      is_favorite: false
    };
    
    switch (format) {
      case 'txt':
        exportAsTxt(fileData);
        break;
      case 'pdf':
        exportAsPdf(fileData);
        break;
      case 'csv':
        exportAsCsv(fileData);
        break;
    }
    
    toast.success(`Content exported as ${format.toUpperCase()}`);
  };

  const shareContent = () => {
    // This would normally open a share dialog
    toast.success("Share functionality coming soon");
  };

  const renderPreview = () => {
    // This is a very basic markdown renderer
    // In a real app, you'd use a proper markdown library
    const lines = editedContent.split('\n');
    return (
      <div className="prose max-w-none">
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            return <h1 key={index}>{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={index}>{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={index}>{line.substring(4)}</h3>;
          } else if (line.startsWith('- ')) {
            return <li key={index}>{line.substring(2)}</li>;
          } else if (line.startsWith('*')) {
            return <p key={index} className="italic">{line.substring(1)}</p>;
          } else if (line.trim() === '') {
            return <br key={index} />;
          } else {
            return <p key={index}>{line}</p>;
          }
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MainNav />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MainNav />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Content not found</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
              
              <div>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                  placeholder="Enter title..."
                />
                <p className="text-muted-foreground text-sm">
                  {new Date(content.createdAt).toLocaleString()} • {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {!isSaving && <Save className="h-4 w-4 mr-1" />}
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center border-b px-6 py-2">
                <TabsList>
                  <TabsTrigger value="edit" className="flex items-center">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportContent('txt')}>
                        Export as TXT
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportContent('pdf')}>
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportContent('csv')}>
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={shareContent}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              
              <TabsContent value="edit" className="p-0 m-0">
                <CardContent className="p-0">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-[70vh] p-6 font-mono text-sm border-none resize-none focus:outline-none focus:ring-0"
                    placeholder="Start writing..."
                  />
                </CardContent>
              </TabsContent>
              
              <TabsContent value="preview" className="p-0 m-0">
                <CardContent className="p-6 h-[70vh] overflow-auto">
                  {renderPreview()}
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Remember to save your changes before leaving this page
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentEditor;
