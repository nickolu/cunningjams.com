import { AlbumConfig } from '../types/album';

const GLOBAL_ADMIN_PASSWORD = process.env.GLOBAL_ADMIN_PASSWORD || 'admin2025';

/**
 * Converts a kebab-case album slug to UPPER_SNAKE_CASE for env var lookup.
 * e.g., "2025-steves-40th" → "2025_STEVES_40TH"
 */
function slugToEnvKey(slug: string): string {
  return slug.replace(/-/g, '_').toUpperCase();
}

/**
 * Converts a kebab-case album slug to a human-readable title.
 * e.g., "2025-steves-40th" → "2025 Steves 40th"
 * Override with ALBUM_{SLUG}_TITLE env var for custom titles.
 */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Checks whether an album exists by looking for its password env var.
 * Convention: ALBUM_{SLUG_UPPER}_PASSWORD must be set.
 */
export function albumExists(albumSlug: string): boolean {
  if (!albumSlug) return false;
  const key = slugToEnvKey(albumSlug);
  return !!process.env[`ALBUM_${key}_PASSWORD`];
}

/**
 * Dynamically builds an AlbumConfig from env vars and slug conventions.
 * Returns null if the album doesn't exist (no password env var set).
 *
 * Env var conventions:
 * - ALBUM_{SLUG}_PASSWORD (required — defines album existence)
 * - ALBUM_{SLUG}_ADMIN_PASSWORD (optional — falls back to GLOBAL_ADMIN_PASSWORD)
 * - ALBUM_{SLUG}_TITLE (optional — falls back to slugToTitle())
 * - ALBUM_{SLUG}_SUBTITLE (optional — falls back to title)
 */
export function getAlbumConfig(albumSlug: string): AlbumConfig | null {
  if (!albumSlug) return null;

  const key = slugToEnvKey(albumSlug);
  const password = process.env[`ALBUM_${key}_PASSWORD`];

  if (!password) return null;

  const title = process.env[`ALBUM_${key}_TITLE`] || slugToTitle(albumSlug);
  const subtitle = process.env[`ALBUM_${key}_SUBTITLE`] || title;
  const adminPassword = process.env[`ALBUM_${key}_ADMIN_PASSWORD`] || GLOBAL_ADMIN_PASSWORD || '';

  return {
    title,
    subtitle,
    cloudinaryFolder: albumSlug,
    password,
    adminPassword,
    commentsEnabled: false,
  };
}

/**
 * Returns display-only album config derived from slug alone.
 * Safe for client components — no env var access needed.
 * Always returns a config (does not check album existence).
 */
export function getAlbumDisplayConfig(albumSlug: string): Pick<AlbumConfig, 'title' | 'subtitle' | 'cloudinaryFolder' | 'commentsEnabled'> {
  return {
    title: slugToTitle(albumSlug),
    subtitle: slugToTitle(albumSlug),
    cloudinaryFolder: albumSlug,
    commentsEnabled: false,
  };
}

/**
 * Validates a password against an album's configured passwords.
 * GLOBAL_ADMIN_PASSWORD grants admin access to any album.
 */
export function validateAlbumPassword(
  albumSlug: string,
  password: string
): { authenticated: boolean; isAdmin: boolean } {
  if (GLOBAL_ADMIN_PASSWORD && password === GLOBAL_ADMIN_PASSWORD) {
    return { authenticated: true, isAdmin: true };
  }

  const config = getAlbumConfig(albumSlug);
  if (!config) return { authenticated: false, isAdmin: false };

  if (config.adminPassword && password === config.adminPassword) {
    return { authenticated: true, isAdmin: true };
  }

  if (password === config.password) {
    return { authenticated: true, isAdmin: false };
  }

  return { authenticated: false, isAdmin: false };
}
