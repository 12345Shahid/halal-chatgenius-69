
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderType } from "@/types/file";
import { Folder, Trash2, Edit } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FolderCardProps {
  folder: FolderType;
  onClick: (folderId: string) => void;
  onDelete: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
}

const FolderCard = ({ folder, onClick, onDelete, onRename }: FolderCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  
  const handleRename = () => {
    onRename(folder.id, newName);
    setIsOpen(false);
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors h-full flex flex-col"
      onClick={() => onClick(folder.id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Folder className="mr-2 h-5 w-5 text-primary" />
          <span className="truncate">{folder.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">Folder</p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleRename}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button 
          variant="destructive" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(folder.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FolderCard;
