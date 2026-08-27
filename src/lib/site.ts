export const SITE_URL = "https://www.iuyup.com";
export const RSS_URL = `${SITE_URL}/feed.xml`;
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

export function toAbsoluteSiteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).toString();
}
