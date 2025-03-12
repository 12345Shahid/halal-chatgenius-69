
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MainNav from '@/components/layout/MainNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const SharedFile = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [fileData, setFileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedFile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the shared file data
        const { data: sharedFileData, error: sharedFileError } = await supabase
          .from('shared_files')
          .select('file_id, shared_by')
          .eq('share_token', shareToken)
          .single();

        if (sharedFileError) {
          setError('This shared link is invalid or has expired.');
          setIsLoading(false);
          return;
        }

        // Get the actual file content
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('*')
          .eq('id', sharedFileData.file_id)
          .single();

        if (fileError) {
          setError('The shared file could not be found.');
          setIsLoading(false);
          return;
        }

        // Get sharer's name (optional)
        const { data: userData } = await supabase
          .from('users')
          .select('email, display_name')
          .eq('id', sharedFileData.shared_by)
          .single();

        setFileData({
          ...fileData,
          shared_by_name: userData?.display_name || userData?.email || 'Anonymous'
        });
      } catch (error) {
        console.error('Error fetching shared file:', error);
        setError('An error occurred while loading the shared file.');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedFile();
    }
  }, [shareToken]);

  const handleDownload = () => {
    if (!fileData) return;
    
    const element = document.createElement('a');
    const fileBlob = new Blob([fileData.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${fileData.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('File downloaded successfully');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Shared File</h1>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading shared file...</p>
          </div>
        ) : error ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : fileData ? (
          <div className="max-w-3xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    {fileData.name}
                  </CardTitle>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Shared by: {fileData.shared_by_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(fileData.created_at).toLocaleString()}</span>
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <div className="whitespace-pre-wrap">{fileData.content}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default SharedFile;
