
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MainNav from '@/components/layout/MainNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileType } from '@/types/file';
import { Button } from '@/components/ui/Button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

const SharedFile = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharedBy, setSharedBy] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSharedFile = async () => {
      setLoading(true);
      try {
        // Get the share information
        const { data: shareData, error: shareError } = await supabase
          .from('shared_files')
          .select('file_id, shared_by')
          .eq('share_token', token)
          .maybeSingle();
          
        if (shareError || !shareData) {
          toast.error('Invalid or expired share link');
          navigate('/');
          return;
        }
        
        // Get the file data
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('*')
          .eq('id', shareData.file_id)
          .single();
          
        if (fileError) {
          toast.error('File not found');
          navigate('/');
          return;
        }
        
        setFile(fileData as unknown as FileType);
        
        // Get the username of the person who shared
        const { data: userData } = await supabase
          .from('users')
          .select('display_name, email')
          .eq('id', shareData.shared_by)
          .single();
          
        setSharedBy(userData?.display_name || userData?.email || 'Someone');
      } catch (error) {
        console.error('Error fetching shared file:', error);
        toast.error('An error occurred while loading the shared file');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchSharedFile();
    }
  }, [token, navigate]);
  
  const handleDownload = () => {
    if (!file) return;
    
    const element = document.createElement('a');
    const fileBlob = new Blob([file.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('File downloaded successfully');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MainNav />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <p>Loading shared file...</p>
        </main>
      </div>
    );
  }
  
  if (!file) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MainNav />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <p>Shared file not found or has been removed.</p>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {file.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Shared by {sharedBy}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            <div className="p-4 border rounded-md whitespace-pre-line">
              {file.content}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SharedFile;
