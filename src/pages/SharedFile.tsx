
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileType } from '@/types/file';
import type { SharedFile as SharedFileType } from '@/types/file';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { Copy, Download } from 'lucide-react';

const SharedFile = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [file, setFile] = useState<FileType | null>(null);
  const [sharedFileDetails, setSharedFileDetails] = useState<SharedFileType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedFile = async () => {
      if (!shareToken) {
        toast.error('Invalid share link.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: sharedFileData, error: sharedFileError } = await supabase
          .from('shared_content')
          .select('*')
          .eq('share_id', shareToken)
          .single();

        if (sharedFileError) {
          console.error('Error fetching shared file:', sharedFileError);
          toast.error('Error fetching shared file.');
          setLoading(false);
          return;
        }

        if (!sharedFileData) {
          toast.error('Shared file not found.');
          setLoading(false);
          return;
        }

        // Create a proper SharedFileType object
        const sharedDetails: SharedFileType = {
          id: sharedFileData.id,
          file_id: sharedFileData.content_id,
          shared_by: sharedFileData.user_id,
          share_token: sharedFileData.share_id,
          created_at: sharedFileData.created_at
        };
        
        setSharedFileDetails(sharedDetails);

        const { data: fileData, error: fileError } = await supabase
          .from('content')
          .select('*')
          .eq('id', sharedDetails.file_id)
          .single();

        if (fileError) {
          console.error('Error fetching file content:', fileError);
          toast.error('Error fetching file content.');
          setLoading(false);
          return;
        }

        // Convert to our FileType
        const fileContent: FileType = {
          id: fileData.id,
          name: fileData.title,
          content: fileData.content,
          type: fileData.type,
          folder: fileData.folder,
          user_id: fileData.user_id,
          created_at: fileData.created_at,
          updated_at: fileData.updated_at,
          is_favorite: false
        };
        
        setFile(fileContent);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [shareToken, navigate]);

  const copyContent = () => {
    if (file?.content) {
      navigator.clipboard.writeText(file.content);
      toast.success('Content copied to clipboard!');
    } else {
      toast.error('No content to copy.');
    }
  };

  const downloadContent = () => {
    if (file?.content) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name || 'shared_file'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('File downloaded successfully!');
    } else {
      toast.error('No content to download.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading shared file...</div>;
  }

  if (!file) {
    return <div className="flex justify-center items-center h-screen">Shared file not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{file.name}</CardTitle>
          <CardDescription>
            Shared on: {new Date(sharedFileDetails?.created_at || '').toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>{file.content}</p>
        </CardContent>
        <div className="flex justify-end space-x-2 p-4">
          <Button variant="outline" onClick={copyContent}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Content
          </Button>
          <Button onClick={downloadContent}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SharedFile;
