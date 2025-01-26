import { google } from 'googleapis';
import type {
  GoogleDriveConfig,
  GoogleDriveFile,
  GoogleDriveFolder,
  GoogleDrivePermission,
  GoogleDriveTokens,
} from './types';

export class GoogleDriveService {
  private drive;
  private config: GoogleDriveConfig;

  constructor(config: GoogleDriveConfig) {
    this.config = config;
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  async setCredentials(tokens: GoogleDriveTokens) {
    const oauth2Client = this.drive.context._options.auth;
    oauth2Client.setCredentials(tokens);
  }

  async listFiles(folderId?: string): Promise<GoogleDriveFile[]> {
    const query = folderId ? `'${folderId}' in parents` : undefined;
    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size, thumbnailLink)',
    });
    return response.data.files as GoogleDriveFile[];
  }

  async createFolder(name: string, parentId?: string): Promise<GoogleDriveFolder> {
    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, mimeType, webViewLink, createdTime, modifiedTime',
    });

    return response.data as GoogleDriveFolder;
  }

  async uploadFile(
    name: string,
    content: any,
    mimeType: string,
    folderId?: string
  ): Promise<GoogleDriveFile> {
    const fileMetadata = {
      name,
      parents: folderId ? [folderId] : undefined,
    };

    const media = {
      mimeType,
      body: content,
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size',
    });

    return response.data as GoogleDriveFile;
  }

  async shareFile(
    fileId: string,
    emailAddress: string,
    role: GoogleDrivePermission['role']
  ): Promise<GoogleDrivePermission> {
    const response = await this.drive.permissions.create({
      fileId,
      requestBody: {
        type: 'user',
        role,
        emailAddress,
      },
    });

    return response.data as GoogleDrivePermission;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.drive.files.delete({
      fileId,
    });
  }
} 