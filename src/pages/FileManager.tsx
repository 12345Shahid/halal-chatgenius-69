
import { useState, useEffect } from "react";
import MainNav from "@/components/layout/MainNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Search, 
  Folder, 
  FolderPlus, 
  Star,
  ArrowLeft,
  Download
} from "lucide-react";
import { FileType, FolderType } from "@/types/file";
import FileCard from "@/components/file/FileCard";
import FolderCard from "@/components/file/FolderCard";
import { Textarea } from "@/components/ui/textarea";

const FileManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all"); // "all", "files", "folders"
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [newFileType, setNewFileType] = useState("general");
  
  // Load folders and files
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch folders
        const { data: folderData, error: folderError } = await supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id)
          .order("name");
          
        if (folderError) {
          console.error("Error loading folders:", folderError);
          toast.error("Failed to load folders");
        } else {
          setFolders(folderData || []);
        }
        
        // Fetch files (with no folder)
        let fileQuery = supabase
          .from("files")
          .select("*")
          .eq("user_id", user.id)
          .is("folder_id", null)
          .order("created_at", { ascending: false });
          
        const { data: fileData, error: fileError } = await fileQuery;
        
        if (fileError) {
          console.error("Error loading files:", fileError);
          toast.error("Failed to load files");
        } else {
          // Get favorites for these files
          const { data: favoritesData } = await supabase
            .from("favorites")
            .select("file_id")
            .eq("user_id", user.id);
            
          const favoriteIds = new Set(favoritesData?.map(fav => fav.file_id) || []);
          
          // Mark favorite files
          const filesWithFavorites = fileData?.map(file => ({
            ...file,
            is_favorite: favoriteIds.has(file.id)
          })) || [];
          
          setFiles(filesWithFavorites);
        }
      } catch (error) {
        console.error("Error in loadData:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, navigate]);
  
  // Load files for a specific folder
  const loadFolderFiles = async (folderId: string) => {
    setIsLoading(true);
    try {
      // Get folder details
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("*")
        .eq("id", folderId)
        .single();
        
      if (folderError) {
        console.error("Error loading folder:", folderError);
        toast.error("Failed to load folder");
        return;
      }
      
      setCurrentFolder(folderData);
      
      // Get files in folder
      const { data: fileData, error: fileError } = await supabase
        .from("files")
        .select("*")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });
        
      if (fileError) {
        console.error("Error loading folder files:", fileError);
        toast.error("Failed to load files");
        return;
      }
      
      // Get favorites for these files
      const { data: favoritesData } = await supabase
        .from("favorites")
        .select("file_id")
        .eq("user_id", user?.id);
        
      const favoriteIds = new Set(favoritesData?.map(fav => fav.file_id) || []);
      
      // Mark favorite files
      const filesWithFavorites = fileData?.map(file => ({
        ...file,
        is_favorite: favoriteIds.has(file.id)
      })) || [];
      
      setFiles(filesWithFavorites);
    } catch (error) {
      console.error("Error in loadFolderFiles:", error);
      toast.error("Failed to load folder content");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new folder
  const createFolder = async () => {
    if (!newFolderName.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          name: newFolderName.trim(),
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating folder:", error);
        toast.error("Failed to create folder");
        return;
      }
      
      setFolders([...folders, data]);
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Error in createFolder:", error);
      toast.error("Failed to create folder");
    }
  };
  
  // Create a new file
  const createFile = async () => {
    if (!newFileName.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from("files")
        .insert({
          name: newFileName.trim(),
          content: newFileContent.trim() || "Empty file",
          type: newFileType,
          folder_id: currentFolder?.id || null,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating file:", error);
        toast.error("Failed to create file");
        return;
      }
      
      setFiles([data, ...files]);
      setNewFileName("");
      setNewFileContent("");
      setIsCreateFileOpen(false);
      toast.success("File created successfully");
    } catch (error) {
      console.error("Error in createFile:", error);
      toast.error("Failed to create file");
    }
  };
  
  // Delete a folder
  const deleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder and all its contents?")) return;
    
    try {
      // Delete files in folder first
      const { error: filesError } = await supabase
        .from("files")
        .delete()
        .eq("folder_id", folderId);
        
      if (filesError) {
        console.error("Error deleting files in folder:", filesError);
        toast.error("Failed to delete folder contents");
        return;
      }
      
      // Then delete the folder
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);
        
      if (error) {
        console.error("Error deleting folder:", error);
        toast.error("Failed to delete folder");
        return;
      }
      
      setFolders(folders.filter(folder => folder.id !== folderId));
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Error in deleteFolder:", error);
      toast.error("Failed to delete folder");
    }
  };
  
  // Delete a file
  const deleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      // Delete any shares first
      await supabase
        .from("shared_files")
        .delete()
        .eq("file_id", fileId);
        
      // Delete favorites
      await supabase
        .from("favorites")
        .delete()
        .eq("file_id", fileId);
        
      // Delete the file
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
      console.error("Error in deleteFile:", error);
      toast.error("Failed to delete file");
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async (fileId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user?.id,
            file_id: fileId
          });
          
        if (error) {
          console.error("Error adding to favorites:", error);
          toast.error("Failed to add to favorites");
          return;
        }
      } else {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user?.id)
          .eq("file_id", fileId);
          
        if (error) {
          console.error("Error removing from favorites:", error);
          toast.error("Failed to remove from favorites");
          return;
        }
      }
      
      // Update local state
      setFiles(files.map(file => 
        file.id === fileId ? { ...file, is_favorite: isFavorite } : file
      ));
      
      toast.success(isFavorite 
        ? "Added to favorites" 
        : "Removed from favorites"
      );
    } catch (error) {
      console.error("Error in toggleFavorite:", error);
      toast.error("Failed to update favorites");
    }
  };
  
  // Share a file
  const shareFile = async (fileId: string) => {
    try {
      // Generate a random token
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      // Create share record
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
      
      // Copy share link to clipboard
      const shareLink = `${window.location.origin}/shared/${shareToken}`;
      navigator.clipboard.writeText(shareLink);
      
      toast.success("Share link copied to clipboard");
    } catch (error) {
      console.error("Error in shareFile:", error);
      toast.error("Failed to share file");
    }
  };
  
  // Filter files and folders based on search query and filter
  const filteredContent = () => {
    let filteredFiles = files;
    let filteredFolders = folders;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(query) || 
        file.content.toLowerCase().includes(query)
      );
      
      filteredFolders = folders.filter(folder => 
        folder.name.toLowerCase().includes(query)
      );
    }
    
    if (searchFilter === "files") {
      filteredFolders = [];
    } else if (searchFilter === "folders") {
      filteredFiles = [];
    }
    
    return { filteredFiles, filteredFolders };
  };
  
  // Export all files as CSV
  const exportAsCSV = () => {
    try {
      // Create CSV content
      let csvContent = "Name,Type,Content,Created At\n";
      
      files.forEach(file => {
        const sanitizedContent = file.content.replace(/"/g, '""');
        csvContent += `"${file.name}","${file.type}","${sanitizedContent}","${new Date(file.created_at).toLocaleString()}"\n`;
      });
      
      // Create and download file
      const element = document.createElement("a");
      const csvBlob = new Blob([csvContent], { type: "text/csv" });
      element.href = URL.createObjectURL(csvBlob);
      element.download = "my_files.csv";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success("Files exported successfully");
    } catch (error) {
      console.error("Error exporting files:", error);
      toast.error("Failed to export files");
    }
  };
  
  // Navigate back to root from folder
  const goBack = () => {
    setCurrentFolder(null);
    setFiles([]);
    
    // Reload root files
    const loadRootFiles = async () => {
      setIsLoading(true);
      try {
        const { data: fileData, error: fileError } = await supabase
          .from("files")
          .select("*")
          .eq("user_id", user?.id)
          .is("folder_id", null)
          .order("created_at", { ascending: false });
          
        if (fileError) {
          console.error("Error loading root files:", fileError);
          toast.error("Failed to load files");
          return;
        }
        
        // Get favorites for these files
        const { data: favoritesData } = await supabase
          .from("favorites")
          .select("file_id")
          .eq("user_id", user?.id);
          
        const favoriteIds = new Set(favoritesData?.map(fav => fav.file_id) || []);
        
        // Mark favorite files
        const filesWithFavorites = fileData?.map(file => ({
          ...file,
          is_favorite: favoriteIds.has(file.id)
        })) || [];
        
        setFiles(filesWithFavorites);
      } catch (error) {
        console.error("Error loading root files:", error);
        toast.error("Failed to load files");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRootFiles();
  };
  
  // Load favorite files
  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select(`
          file_id,
          files:file_id(*)
        `)
        .eq("user_id", user?.id);
        
      if (favoritesError) {
        console.error("Error loading favorites:", favoritesError);
        toast.error("Failed to load favorites");
        return;
      }
      
      // Extract files and mark as favorites
      const favoriteFiles = favoritesData
        ?.map(item => {
          const file = item.files as unknown as FileType;
          return file ? { ...file, is_favorite: true } : null;
        })
        .filter(Boolean) as FileType[];
        
      setFiles(favoriteFiles || []);
      setCurrentFolder(null);
    } catch (error) {
      console.error("Error in loadFavorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rename a folder
  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ name: newName })
        .eq("id", folderId);
        
      if (error) {
        console.error("Error renaming folder:", error);
        toast.error("Failed to rename folder");
        return;
      }
      
      // Update local state
      setFolders(folders.map(folder => 
        folder.id === folderId ? { ...folder, name: newName } : folder
      ));
      
      // If current folder is being renamed, update that too
      if (currentFolder?.id === folderId) {
        setCurrentFolder({ ...currentFolder, name: newName });
      }
      
      toast.success("Folder renamed successfully");
    } catch (error) {
      console.error("Error in renameFolder:", error);
      toast.error("Failed to rename folder");
    }
  };
  
  const { filteredFiles, filteredFolders } = filteredContent();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-semibold">
              {currentFolder 
                ? (
                  <Button
                    variant="ghost"
                    className="mr-2"
                    onClick={goBack}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                ) 
                : null
              }
              {currentFolder ? currentFolder.name : "File Manager"}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportAsCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="filename" className="text-right">
                      File Name
                    </Label>
                    <Input
                      id="filename"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="My New File"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="filetype" className="text-right">
                      File Type
                    </Label>
                    <RadioGroup 
                      value={newFileType}
                      onValueChange={setNewFileType}
                      className="col-span-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general">General</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="blog" id="blog" />
                        <Label htmlFor="blog">Blog</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="research" id="research" />
                        <Label htmlFor="research">Research</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="content" className="text-right pt-2">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      placeholder="File content goes here..."
                      className="col-span-3 min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createFile}>Create File</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="foldername" className="text-right">
                      Folder Name
                    </Label>
                    <Input
                      id="foldername"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="My New Folder"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createFolder}>Create Folder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:w-52">
                <RadioGroup 
                  value={searchFilter}
                  onValueChange={setSearchFilter}
                  className="flex flex-row"
                >
                  <div className="flex items-center mr-4">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="ml-2">All</Label>
                  </div>
                  <div className="flex items-center mr-4">
                    <RadioGroupItem value="files" id="files" />
                    <Label htmlFor="files" className="ml-2">Files</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="folders" id="folders" />
                    <Label htmlFor="folders" className="ml-2">Folders</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="mr-2 h-4 w-4" />
              Favorites
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Loading...</p>
              </div>
            ) : (
              <>
                {!currentFolder && filteredFolders.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-medium mb-4 flex items-center">
                      <Folder className="mr-2 h-5 w-5" />
                      Folders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredFolders.map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          onClick={(folderId) => loadFolderFiles(folderId)}
                          onDelete={deleteFolder}
                          onRename={renameFolder}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-xl font-medium mb-4 flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Files {currentFolder ? `in ${currentFolder.name}` : ""}
                  </h2>
                  
                  {filteredFiles.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No files found{searchQuery ? " matching your search" : ""}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredFiles.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          onDelete={deleteFile}
                          onToggleFavorite={toggleFavorite}
                          onShare={shareFile}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="favorites">
            <Button 
              variant="ghost" 
              onClick={loadFavorites}
              className="mb-4"
            >
              <Star className="mr-2 h-4 w-4 text-yellow-400" />
              Load Favorites
            </Button>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Loading...</p>
              </div>
            ) : (
              <>
                {files.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No favorites found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        onDelete={deleteFile}
                        onToggleFavorite={toggleFavorite}
                        onShare={shareFile}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FileManager;
