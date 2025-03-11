
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "@/components/layout/MainNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Folder, File, Search, Plus, MoreVertical, Star, Download, Share2, Edit, Trash2, ChevronLeft, Heart } from "lucide-react";
import { toast } from "sonner";

interface FolderType {
  id: string;
  name: string;
  created_at: string;
}

interface FileType {
  id: string;
  name: string;
  type: string;
  content: string;
  folder_id: string | null;
  created_at: string;
  is_favorite?: boolean;
}

const FileManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch folders
        const { data: foldersData, error: foldersError } = await supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (foldersError) {
          console.error("Error fetching folders:", foldersError);
        } else {
          setFolders(foldersData || []);
        }

        // Fetch files
        const { data: filesData, error: filesError } = await supabase
          .from("files")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (filesError) {
          console.error("Error fetching files:", filesError);
        } else {
          setFiles(filesData || []);
        }

        // Fetch favorites
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select("file_id")
          .eq("user_id", user.id);

        if (favoritesError) {
          console.error("Error fetching favorites:", favoritesError);
        } else {
          const favoriteIds = favoritesData.map(fav => fav.file_id);
          setFavorites(favoriteIds);
          
          // Mark favorite files
          if (filesData) {
            const filesWithFavorites = filesData.map(file => ({
              ...file,
              is_favorite: favoriteIds.includes(file.id)
            }));
            setFiles(filesWithFavorites);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          user_id: user?.id,
          name: newFolderName.trim()
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create folder");
        console.error("Error creating folder:", error);
      } else {
        setFolders([...folders, data]);
        setNewFolderName("");
        setIsNewFolderDialogOpen(false);
        toast.success("Folder created successfully");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("An error occurred");
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (confirm("Are you sure you want to delete this folder? All files inside will be moved to root.")) {
      try {
        // First update files to remove folder_id
        const { error: updateError } = await supabase
          .from("files")
          .update({ folder_id: null })
          .eq("folder_id", folderId);

        if (updateError) {
          console.error("Error updating files:", updateError);
          toast.error("Failed to update files");
          return;
        }

        // Then delete the folder
        const { error: deleteError } = await supabase
          .from("folders")
          .delete()
          .eq("id", folderId);

        if (deleteError) {
          console.error("Error deleting folder:", deleteError);
          toast.error("Failed to delete folder");
          return;
        }

        setFolders(folders.filter(folder => folder.id !== folderId));
        if (currentFolder?.id === folderId) {
          setCurrentFolder(null);
        }
        toast.success("Folder deleted successfully");
      } catch (error) {
        console.error("Error deleting folder:", error);
        toast.error("An error occurred");
      }
    }
  };

  const deleteFile = async (fileId: string) => {
    if (confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from("files")
          .delete()
          .eq("id", fileId);

        if (error) {
          console.error("Error deleting file:", error);
          toast.error("Failed to delete file");
          return;
        }

        setFiles(files.filter(file => file.id !== fileId));
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("An error occurred");
      }
    }
  };

  const toggleFavorite = async (fileId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user?.id)
          .eq("file_id", fileId);

        if (error) {
          console.error("Error removing favorite:", error);
          toast.error("Failed to remove from favorites");
          return;
        }

        setFavorites(favorites.filter(id => id !== fileId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user?.id,
            file_id: fileId
          });

        if (error) {
          console.error("Error adding favorite:", error);
          toast.error("Failed to add to favorites");
          return;
        }

        setFavorites([...favorites, fileId]);
      }

      // Update the files array
      setFiles(files.map(file => 
        file.id === fileId 
          ? { ...file, is_favorite: !isFavorite } 
          : file
      ));

      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("An error occurred");
    }
  };

  const shareFile = async (fileId: string) => {
    try {
      // Generate a unique token
      const shareToken = Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase
        .from("shared_files")
        .insert({
          file_id: fileId,
          shared_by: user?.id,
          share_token: shareToken
        });

      if (error) {
        console.error("Error sharing file:", error);
        toast.error("Failed to share file");
        return;
      }

      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing file:", error);
      toast.error("An error occurred");
    }
  };

  const downloadFile = (file: FileType) => {
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

  const openFolder = (folder: FolderType | null) => {
    setCurrentFolder(folder);
  };

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredFiles = () => {
    let filtered = files;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab === "favorites") {
      filtered = filtered.filter(file => file.is_favorite);
    } else if (currentFolder) {
      filtered = filtered.filter(file => file.folder_id === currentFolder.id);
    } else if (activeTab === "unfiled") {
      filtered = filtered.filter(file => file.folder_id === null);
    }
    
    return filtered;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-semibold">File Manager</h1>
            {currentFolder && (
              <div className="flex items-center ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openFolder(null)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <span className="text-lg ml-2">
                  <Folder className="h-5 w-5 inline mr-1 text-primary" />
                  {currentFolder.name}
                </span>
              </div>
            )}
          </div>
          
          <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for your new folder
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder Name"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewFolder}>
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files and folders..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="unfiled">Unfiled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-6">
            {!currentFolder && searchQuery === "" && activeTab === "all" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFolders.map((folder) => (
                  <Card 
                    key={folder.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => openFolder(folder)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <Folder className="h-8 w-8 text-primary mr-3" />
                        <div>
                          <h3 className="font-medium">{folder.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(folder.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            deleteFolder(folder.id);
                          }}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div>
              <h2 className="text-lg font-medium mb-4">
                {activeTab === "favorites" ? "Favorite Files" : "Files"}
              </h2>
              
              {getFilteredFiles().length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {searchQuery ? 
                      "No files match your search" : 
                      activeTab === "favorites" ? 
                        "No favorite files yet" : 
                        "No files in this location"
                    }
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredFiles().map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <File className="h-4 w-4 mr-2 text-primary" />
                              {file.name}
                            </div>
                          </TableCell>
                          <TableCell>{file.type}</TableCell>
                          <TableCell>
                            {new Date(file.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => toggleFavorite(file.id, !!file.is_favorite)}
                              >
                                <Heart className={`h-4 w-4 ${file.is_favorite ? 'fill-primary text-primary' : ''}`} />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => downloadFile(file)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => shareFile(file.id)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => navigate(`/editor/${file.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => deleteFile(file.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FileManager;
