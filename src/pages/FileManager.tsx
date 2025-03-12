
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileType, FolderType } from '@/types/file';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, FolderPlus, FilePlus, FileText } from 'lucide-react';
import FileCard from '@/components/file/FileCard';
import FolderCard from '@/components/file/FolderCard';

const FileManager = () => {
  // State management for files and folders
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [activeFolder, setActiveFolder] = useState<FolderType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFilesAndFolders();
    }
  }, [user]);

  const loadFilesAndFolders = async () => {
    setIsLoading(true);
    
    try {
      // Here we'll just use the content table for now
      // In a real implementation, you would query actual folders and files tables
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user?.id);

      if (contentError) {
        throw contentError;
      }

      // Create fake folders from the content data
      const uniqueFolders: { [key: string]: FolderType } = {};
      
      contentData?.forEach(item => {
        if (item.folder && !uniqueFolders[item.folder]) {
          uniqueFolders[item.folder] = {
            id: item.folder,
            name: item.folder,
            user_id: user?.id || '',
            created_at: item.created_at
          };
        }
      });
      
      setFolders(Object.values(uniqueFolders));

      // Create file objects from content data
      const fileData: FileType[] = contentData?.map(item => ({
        id: item.id,
        name: item.title,
        content: item.content,
        type: item.type,
        folder: item.folder,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_favorite: false
      })) || [];
      
      setFiles(fileData);
    } catch (error) {
      console.error('Error loading files and folders:', error);
      toast.error('Failed to load your files and folders');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilesInFolder = () => {
    if (!activeFolder) {
      return files.filter(file => !file.folder);
    }
    return files.filter(file => file.folder === activeFolder.id);
  };

  const getFavoriteFiles = () => {
    return files.filter(file => file.is_favorite);
  };

  const getFilteredFiles = () => {
    const filesInCurrentView = showFavorites ? getFavoriteFiles() : getFilesInFolder();
    
    if (!searchQuery) {
      return filesInCurrentView;
    }
    
    const query = searchQuery.toLowerCase();
    return filesInCurrentView.filter(file => 
      file.name.toLowerCase().includes(query) || 
      file.content.toLowerCase().includes(query)
    );
  };

  const getFilteredFolders = () => {
    if (showFavorites || activeFolder) {
      return [];
    }
    
    if (!searchQuery) {
      return folders;
    }
    
    const query = searchQuery.toLowerCase();
    return folders.filter(folder => folder.name.toLowerCase().includes(query));
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      // Generate a unique ID for the folder
      const folderId = crypto.randomUUID();
      
      // Create a new folder object
      const newFolder: FolderType = {
        id: folderId,
        name: newFolderName.trim(),
        user_id: user?.id || '',
        created_at: new Date().toISOString()
      };
      
      // Add to state first for immediate UI update
      setFolders([...folders, newFolder]);
      
      // Close dialog
      setNewFolderDialogOpen(false);
      setNewFolderName('');
      
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const createFile = async () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    try {
      // Create content entry in database
      const { data, error } = await supabase
        .from('content')
        .insert({
          title: newFileName.trim(),
          content: newFileContent.trim(),
          type: 'general',
          folder: activeFolder ? activeFolder.id : null,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create file object for our state
      const newFile: FileType = {
        id: data.id,
        name: data.title,
        content: data.content,
        type: data.type,
        folder: data.folder,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_favorite: false
      };
      
      // Add to state
      setFiles([...files, newFile]);
      
      // Close dialog
      setNewFileDialogOpen(false);
      setNewFileName('');
      setNewFileContent('');
      
      toast.success('File created successfully');
    } catch (error) {
      console.error('Error creating file:', error);
      toast.error('Failed to create file');
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', fileId);
      
      if (error) throw error;
      
      // Update state
      setFiles(files.filter(file => file.id !== fileId));
      
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const toggleFavorite = async (fileId: string, isFavorite: boolean) => {
    // For now, just update the local state since we don't have a favorites table
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, is_favorite: isFavorite } : file
    ));
    
    toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleFolderClick = (folder: FolderType) => {
    setActiveFolder(folder);
    setShowFavorites(false);
  };

  const navigateBack = () => {
    setActiveFolder(null);
  };

  const toggleFavoritesView = (checked: boolean) => {
    setShowFavorites(checked);
    if (checked) {
      setActiveFolder(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {showFavorites ? 'Favorites' : activeFolder ? activeFolder.name : 'My Files'}
        </h1>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => setNewFileDialogOpen(true)}
            variant="outline" 
            className="flex items-center"
          >
            <FilePlus className="mr-2 h-5 w-5" />
            New File
          </Button>
          
          {!activeFolder && !showFavorites && (
            <Button 
              onClick={() => setNewFolderDialogOpen(true)}
              variant="outline" 
              className="flex items-center"
            >
              <FolderPlus className="mr-2 h-5 w-5" />
              New Folder
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-2/3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/3 flex items-center space-x-2">
          <Checkbox 
            id="favorites" 
            checked={showFavorites}
            onCheckedChange={toggleFavoritesView}
          />
          <Label htmlFor="favorites">Show favorites only</Label>
          
          {activeFolder && (
            <Button variant="ghost" onClick={navigateBack} className="ml-auto">
              Back to All Files
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-8">
          {getFilteredFolders().length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getFilteredFolders().map(folder => (
                  <FolderCard 
                    key={folder.id} 
                    folder={folder} 
                    onClick={() => handleFolderClick(folder)}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">Loading files...</div>
            ) : getFilteredFiles().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getFilteredFiles().map(file => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    onDelete={deleteFile}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No matching files found' : 'No files in this location'}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          {/* List view implementation similar to grid view */}
          <div className="text-center py-8 text-muted-foreground">
            List view implementation coming soon...
          </div>
        </TabsContent>
      </Tabs>
      
      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input 
                id="folderName" 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Folder"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New File Dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input 
                id="fileName" 
                value={newFileName} 
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="My File"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileContent">Content</Label>
              <textarea
                id="fileContent"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                placeholder="Enter your content here..."
                className="w-full min-h-[200px] p-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFile}>Create File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManager;
