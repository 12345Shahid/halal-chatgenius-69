
export interface FileType {
  id: string;
  user_id: string;
  folder_id?: string | null;
  name: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
}

export interface FolderType {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SharedFile {
  id: string;
  file_id: string;
  shared_by: string;
  share_token: string;
  created_at: string;
  expires_at?: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  file_id: string;
  created_at: string;
}
