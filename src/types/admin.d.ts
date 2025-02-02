import { Types } from 'mongoose';

// Common error type for API routes
export interface ApiError extends Error {
  code?: number;
  status?: number;
  details?: Record<string, unknown>;
}

// Query types for different admin routes
export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'user' | 'admin';
  status?: 'all' | 'active' | 'inactive';
  team?: string;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface AdminTeamQuery {
  page?: number;
  limit?: number;
  search?: string;
  leader?: string;
  status?: 'active' | 'inactive';
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface AdminDocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'all' | 'text' | 'code' | 'markdown';
  visibility?: 'all' | 'private' | 'team' | 'public';
  team?: string;
  owner?: string;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Admin action types
export interface AdminBulkAction {
  userIds: string[];
  action: 'delete' | 'activate' | 'deactivate';
}

export interface AdminTeamUpdate {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  leader?: Types.ObjectId;
}

export interface AdminDocumentUpdate {
  title?: string;
  description?: string;
  type?: 'text' | 'code' | 'markdown';
  visibility?: 'private' | 'team' | 'public';
  team?: Types.ObjectId;
  content?: string;
} 