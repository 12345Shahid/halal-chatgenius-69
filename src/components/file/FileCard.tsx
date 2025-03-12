import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { MoreVertical, FileText, Trash2, Star, StarOff } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/Button";

interface FileCardProps {
  file: {
    id: string;
    name: string;
    content: string;
    type: string;
    folder?: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
    is_favorite: boolean;
  };
  onDelete: (fileId: string) => void;
  toggleFavorite: (fileId: string, isFavorite: boolean) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete, toggleFavorite }) => {
  const formattedDate = format(new Date(file.created_at), 'PPP');

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{file.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton aria-label="Open menu">
              <MoreVertical className="h-4 w-4" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => toggleFavorite(file.id, !file.is_favorite)}>
              {file.is_favorite ? (
                <>
                  <StarOff className="mr-2 h-4 w-4" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Add to Favorites
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(file.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs text-muted-foreground">
          {file.content.substring(0, 50)}...
        </CardDescription>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground py-2">
        Created on {formattedDate}
      </CardFooter>
    </Card>
  );
};

export default FileCard;
