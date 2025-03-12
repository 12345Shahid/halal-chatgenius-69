import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileType, FolderType } from "@/types/file";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Folder, File, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import FolderCard from "@/components/file/FolderCard";
import FileCard from "@/components/file/FileCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const FileManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
	const [newFileType, setNewFileType] = useState("blog");
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteFilter, setIsFavoriteFilter] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [user, navigate, selectedFolder, isFavoriteFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch folders
      let { data: foldersData, error: foldersError } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id);

      if (foldersError) {
        console.error("Error fetching folders:", foldersError);
        toast.error("Failed to load folders");
      } else {
        setFolders(foldersData || []);
      }

      // Fetch files based on selected folder
      let filesQuery = supabase
        .from("files")
        .select("*")
        .eq("user_id", user.id)

      if (selectedFolder) {
        filesQuery = filesQuery.eq("folder_id", selectedFolder);
      } else {
        filesQuery = filesQuery.is("folder_id", null);
      }

      if (isFavoriteFilter) {
        const { data: favorites, error: favoritesError } = await supabase
          .from('favorites')
          .select('file_id')
          .eq('user_id', user.id);

        if (favoritesError) {
          console.error("Error fetching favorites:", favoritesError);
          toast.error("Failed to load favorite files");
        } else {
          const favoriteFileIds = favorites.map(fav => fav.file_id);
          filesQuery = filesQuery.in('id', favoriteFileIds);
        }
      }

      let { data: filesData, error: filesError } = await filesQuery;

      if (filesError) {
        console.error("Error fetching files:", filesError);
        toast.error("Failed to load files");
      } else {
        setFiles(filesData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  const handleBackToRoot = () => {
    setSelectedFolder(null);
  };

  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("folders")
        .insert([{ user_id: user.id, name: newFolderName }]);

      if (error) {
        console.error("Error creating folder:", error);
        toast.error("Failed to create folder");
      } else {
        toast.success("Folder created successfully!");
        setNewFolderName("");
        setIsFolderDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const createNewFile = async () => {
    if (!newFileName.trim() || !newFileContent.trim()) {
      toast.error("File name and content cannot be empty");
      return;
    }

    try {
      const { error } = await supabase.from("files").insert([
        {
          user_id: user.id,
          folder_id: selectedFolder,
          name: newFileName,
          content: newFileContent,
					type: newFileType
        },
      ]);

      if (error) {
        console.error("Error creating file:", error);
        toast.error("Failed to create file");
      } else {
        toast.success("File created successfully!");
        setNewFileName("");
        setNewFileContent("");
        setIsFileDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating file:", error);
      toast.error("Failed to create file");
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting folder:", error);
        toast.error("Failed to delete folder");
      } else {
        toast.success("Folder deleted successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from("files")
        .delete()
        .eq("id", fileId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
      } else {
        toast.success("File deleted successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ name: newName })
        .eq("id", folderId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error renaming folder:", error);
        toast.error("Failed to rename folder");
      } else {
        toast.success("Folder renamed successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  };

  const renameFile = async (fileId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ name: newName })
        .eq("id", fileId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error renaming file:", error);
        toast.error("Failed to rename file");
      } else {
        toast.success("File renamed successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file");
    }
  };

  const toggleFavorite = async (fileId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('file_id', fileId);

        if (error) {
          console.error("Error removing from favorites:", error);
          toast.error("Failed to remove from favorites");
          return;
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, file_id: fileId }]);

        if (error) {
          console.error("Error adding to favorites:", error);
          toast.error("Failed to add to favorites");
          return;
        }
      }

      toast.success(`File ${isFavorite ? 'removed from' : 'added to'} favorites!`);
      fetchData(); // Refresh the file list
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to toggle favorite");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">File Management</h1>

        <div className="flex items-center justify-between mb-4">
          <div>
            {selectedFolder ? (
              <Button variant="ghost" onClick={handleBackToRoot}>
                <Folder className="mr-2 h-4 w-4" />
                Back to Root
              </Button>
            ) : (
              <h2 className="text-lg font-semibold">Root Folder</h2>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorite-filter"
              checked={isFavoriteFilter}
              onCheckedChange={(checked) => setIsFavoriteFilter(checked || false)}
            />
            <Label htmlFor="favorite-filter">Favorites Only</Label>
          </div>

          <div className="space-x-2">
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Folder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <CardDescription>Enter the name for the new folder.</CardDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={createNewFolder}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <File className="mr-2 h-4 w-4" />
                  Create File
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                  <CardDescription>Enter the details for the new file.</CardDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="type" className="text-right">
											Type
										</Label>
										<Select onValueChange={setNewFileType} defaultValue={newFileType}>
											<SelectTrigger className="col-span-3">
												<SelectValue placeholder="Select a type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="blog">Blog</SelectItem>
												<SelectItem value="youtube">YouTube</SelectItem>
												<SelectItem value="research">Research</SelectItem>
												<SelectItem value="developer">Developer</SelectItem>
											</SelectContent>
										</Select>
									</div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="content" className="text-right">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      className="col-span-3 min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={createNewFile}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Render Folders */}
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={handleFolderClick}
                onDelete={deleteFolder}
                onRename={renameFolder}
              />
            ))}

            {/* Render Files */}
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={deleteFile}
                onRename={renameFile}
                toggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
