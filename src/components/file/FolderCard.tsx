import { Folder } from 'lucide-react';
import { FolderType } from '@/types/file';
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FolderCardProps {
  folder: FolderType;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
}

const FolderCard = ({ folder, onClick, onDelete, onRename }: FolderCardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(folder.id);
    }
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRename) {
      const newName = prompt('Enter new folder name:', folder.name);
      if (newName && newName.trim() !== '' && newName !== folder.name) {
        onRename(folder.id, newName.trim());
      }
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Folder className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium truncate max-w-[150px]">{folder.name}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(folder.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {(onDelete || onRename) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRename && (
                <DropdownMenuItem onClick={handleRename}>
                  Rename
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardContent>
    </Card>
  );
};

export default FolderCard;
