import { AlbumConfig, AlbumConfigs } from '../types/album';

const GLOBAL_ADMIN_PASSWORD = process.env.GLOBAL_ADMIN_PASSWORD || 'admin2025';

function parseAlbumConfigs(): AlbumConfigs {
  const albumConfigsEnv = process.env.ALBUM_CONFIGS;

  if (!albumConfigsEnv) {
    console.warn('ALBUM_CONFIGS environment variable not set, using default config for migration');
    // Fallback to current hardcoded album for migration purposes
    return {
      'steves-40th-birthday': {
        title: "Steve's 40th Birthday",
        subtitle: "Colorado Trip 2025",
        cloudinaryFolder: "2025-steves-40th",
        password: process.env.STEVES_40TH_ALBUM_PASSWORD || "pumphouse",
        adminPassword: process.env.STEVES_40TH_ADMIN_PASSWORD || "admin2025"
      },
      '2025-steves-40th': {
        title: "Steve's 40th Birthday",
        subtitle: "Colorado Trip 2025",
        cloudinaryFolder: "2025-steves-40th",
        password: process.env.STEVES_40TH_ALBUM_PASSWORD || "pumphouse",
        adminPassword: process.env.STEVES_40TH_ADMIN_PASSWORD || "admin2025"
      },
      'avatar-maker': {
        title: "Avatar Maker",
        subtitle: "Avatar Maker 2025",
        cloudinaryFolder: "avatar-maker",
        password: process.env.DEFAULT_ALBUM_PASSWORD || "1234",
        adminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "avatar-maker-admin"
      },
      'whowouldwininator-battle-scenes': {
        title: "Who Would Wininator Battle Scenes",
        subtitle: "Who Would Wininator Battle Scenes",
        cloudinaryFolder: "whowouldwininator-battle-scenes",
        password: process.env.DEFAULT_ALBUM_PASSWORD || "1234",
        adminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "whowouldwininator-battle-scenes-admin"
      },
      "whowouldwininator-portraits": {
        title: "Who Would Wininator Portraits",
        subtitle: "Who Would Wininator Portraits",
        cloudinaryFolder: "whowouldwininator-portraits",
        password: process.env.DEFAULT_ALBUM_PASSWORD || "1234",
        adminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "whowouldwininator-portraits-admin"
      },
      "whowouldwininator-story-sections": {
        title: "Who Would Wininator Story Sections",
        subtitle: "Who Would Wininator Story Sections",
        cloudinaryFolder: "whowouldwininator-story-sections",
        password: process.env.DEFAULT_ALBUM_PASSWORD || "1234",
        adminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "whowouldwininator-story-sections-admin"
      },
      "2025-vinhs-cabin": {
        title: "2025 September Vinh's Cabin",
        subtitle: "2025 September Vinh's Cabin",
        cloudinaryFolder: "2025-vinhs-cabin",
        password: process.env.VINHS_CABIN_ALBUM_PASSWORD || "1234",
        adminPassword: process.env.VINHS_CABIN_ADMIN_PASSWORD || "2025-vinhs-cabin-admin"
      }
    };
  }

  try {
    return JSON.parse(albumConfigsEnv) as AlbumConfigs;
  } catch (error) {
    console.error('Failed to parse ALBUM_CONFIGS environment variable:', error);
    throw new Error('Invalid ALBUM_CONFIGS configuration');
  }
}

let albumConfigs: AlbumConfigs | null = null;

function getAlbumConfigs(): AlbumConfigs {
  if (!albumConfigs) {
    albumConfigs = parseAlbumConfigs();
  }
  return albumConfigs;
}

export function getAlbumConfig(albumSlug: string): AlbumConfig | null {
  const configs = getAlbumConfigs();
  return configs[albumSlug] || null;
}

export function validateAlbumPassword(albumSlug: string, password: string): { authenticated: boolean; isAdmin: boolean } {
  // Check global admin password first
  if (password === GLOBAL_ADMIN_PASSWORD) {
    return { authenticated: true, isAdmin: true };
  }

  const config = getAlbumConfig(albumSlug);
  if (!config) {
    return { authenticated: false, isAdmin: false };
  }

  // Check album-specific admin password
  if (password === config.adminPassword) {
    return { authenticated: true, isAdmin: true };
  }

  // Check album-specific regular password
  if (password === config.password) {
    return { authenticated: true, isAdmin: false };
  }

  return { authenticated: false, isAdmin: false };
}

export function getAllAlbumSlugs(): string[] {
  const configs = getAlbumConfigs();
  return Object.keys(configs);
}

export function albumExists(albumSlug: string): boolean {
  return getAlbumConfig(albumSlug) !== null;
}