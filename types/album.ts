export interface AlbumConfig {
  title: string;
  subtitle: string;
  cloudinaryFolder: string;
  password: string;
  adminPassword: string;
}

export interface AlbumSession {
  authenticated: boolean;
  isAdmin: boolean;
  expiresAt: Date;
  albumSlug: string;
  [key: string]: any;
}

export interface AlbumConfigs {
  [albumSlug: string]: AlbumConfig;
}