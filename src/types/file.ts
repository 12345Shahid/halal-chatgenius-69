
export interface FileType {
  id: string;
  name: string;
  content: string;
  type: string;
  folder?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export interface FolderType {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface SharedFile {
  id: string;
  file_id: string;
  shared_by: string;
  share_token: string;
  created_at: string;
}
