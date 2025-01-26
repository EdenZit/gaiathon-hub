export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  thumbnailLink?: string;
}

export interface GoogleDriveFolder extends GoogleDriveFile {
  mimeType: 'application/vnd.google-apps.folder';
}

export interface GoogleDrivePermission {
  id: string;
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
}

export interface GoogleDriveTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
} 