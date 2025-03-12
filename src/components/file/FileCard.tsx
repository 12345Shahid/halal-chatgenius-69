
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { FileType } from "@/types/file";
import { 
  Star, 
  StarOff, 
  Share2, 
  Trash2, 
  Download, 
  FileText, 
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FileCardProps {
  file: FileType;
  onDelete: (fileId: string) => void;
  onToggleFavorite: (fileId: string, isFavorite: boolean) => void;
  onShare: (fileId: string) => void;
}

const FileCard = ({ file, onDelete, onToggleFavorite, onShare }: FileCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleDownload = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([file.content], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("File downloaded successfully");
  };

  const handleEdit = () => {
    navigate(`/editor/${file.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="truncate">{file.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onToggleFavorite(file.id, !file.is_favorite)}
          >
            {file.is_favorite ? (
              <Star className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{file.content}</p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleEdit} 
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDownload} 
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onShare(file.id)} 
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="destructive" 
          size="icon" 
          onClick={() => onDelete(file.id)} 
          disabled={isLoading}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileCard;
