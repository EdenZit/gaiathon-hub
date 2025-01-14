// Common interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  organization?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Component Props
export interface LayoutProps {
  children: React.ReactNode;
}

export interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Auth Types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
}

// Dashboard Types
export interface DashboardProps {
  user: User;
}

// API Types
export interface ApiRequest extends Request {
  user?: User;
} 