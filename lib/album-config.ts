import { AlbumConfig, AlbumConfigs } from '../types/album';

const GLOBAL_ADMIN_PASSWORD = process.env.GLOBAL_ADMIN_PASSWORD || 'admin2025';

const albumConfigs: AlbumConfigs = {
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
  },
  "manchat": {
    title: "ManChat",
    subtitle: "ManChat",
    cloudinaryFolder: "manchat",
    password: process.env.MANCHAT_ALBUM_PASSWORD || "1234",
    adminPassword: process.env.MANCHAT_ADMIN_PASSWORD || "manchat-admin"
  },
  "2025-lemon-ave-fall-carnival": {
    title: "2025 Lemon Ave Fall Carnival",
    subtitle: "2025 Lemon Ave Fall Carnival",
    cloudinaryFolder: "2025-lemon-ave-fall-carnival",
    password: process.env.LEMON_AVE_FALL_CARNIVAL_ALBUM_PASSWORD || "1234",
    adminPassword: process.env.LEMON_AVE_FALL_CARNIVAL_ADMIN_PASSWORD || "2025-lemon-ave-fall-carnival-admin"
  },
  "vinhs-40th": {
    title: "Vinh's 40th Birthday",
    subtitle: "Vinh's 40th Birthday",
    cloudinaryFolder: "vinhs-40th",
    password: process.env.VINHS_40TH_ALBUM_PASSWORD || "1234",
    adminPassword: process.env.VINHS_40TH_ADMIN_PASSWORD || "vinhs-40th-admin"
  }
};

function getAlbumConfigs(): AlbumConfigs {
  return albumConfigs;
}

export function getAlbumConfig(albumSlug: string): AlbumConfig | null {
  const configs = getAlbumConfigs();
  if (!configs[albumSlug]) {
    return {
      title: "Photo Album",
      subtitle: "2025",
      cloudinaryFolder: albumSlug,
      password: "pumphouse",
      adminPassword: "admin2025",
      commentsEnabled: false
    }
  }
  // Return the config with commentsEnabled defaulting to false if not specified
  const config = configs[albumSlug];
  return {
    ...config,
    commentsEnabled: config.commentsEnabled ?? false
  };
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