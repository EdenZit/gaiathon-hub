import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { redis } from '@/lib/services/redis';

interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

const config: GoogleDriveConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ]
};

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private oauth2Client: OAuth2Client;

  private constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async getAuthUrl(): Promise<string> {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.scopes,
      prompt: 'consent'
    });
  }

  async setCredentials(code: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Store refresh token in Redis for later use
      if (tokens.refresh_token) {
        await redis.set(
          `google_refresh_token:${tokens.refresh_token}`,
          JSON.stringify(tokens),
          'EX',
          30 * 24 * 60 * 60 // 30 days
        );
      }
    } catch (error) {
      console.error('Error setting Google Drive credentials:', error);
      throw new Error('Failed to set Google Drive credentials');
    }
  }

  async uploadFile(fileName: string, mimeType: string, content: string | Buffer): Promise<string> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      const fileMetadata = {
        name: fileName,
        mimeType
      };

      const media = {
        mimeType,
        body: content
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id,webViewLink'
      });

      return response.data.webViewLink || '';
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  async listFiles(folderId?: string): Promise<Array<{ id: string; name: string; webViewLink: string }>> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      const query = folderId ? `'${folderId}' in parents` : undefined;
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink)',
        spaces: 'drive'
      });

      return response.data.files?.map(file => ({
        id: file.id!,
        name: file.name!,
        webViewLink: file.webViewLink!
      })) || [];
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      throw new Error('Failed to list Google Drive files');
    }
  }

  async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
      });

      return response.data.id!;
    } catch (error) {
      console.error('Error creating Google Drive folder:', error);
      throw new Error('Failed to create Google Drive folder');
    }
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading file from Google Drive:', error);
      throw new Error('Failed to download file from Google Drive');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
      await drive.files.delete({ fileId });
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw new Error('Failed to delete file from Google Drive');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<void> {
    try {
      const tokens = await redis.get(`google_refresh_token:${refreshToken}`);
      if (!tokens) {
        throw new Error('Refresh token not found');
      }

      this.oauth2Client.setCredentials(JSON.parse(tokens));
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);

      // Update stored tokens
      await redis.set(
        `google_refresh_token:${refreshToken}`,
        JSON.stringify(credentials),
        'EX',
        30 * 24 * 60 * 60
      );
    } catch (error) {
      console.error('Error refreshing Google Drive access token:', error);
      throw new Error('Failed to refresh Google Drive access token');
    }
  }
} 