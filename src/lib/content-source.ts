/** Published CMS data is authoritative, including empty lists and missing slugs.
 * A network error must propagate so Next can keep its last successful page cache;
 * silently substituting local copies can republish content the author removed.
 */
export async function readFromContentSource<T>(
  source: string | undefined,
  published: () => Promise<T>,
  local: () => T,
): Promise<T> {
  if (source === "local") return local();
  if (source && source !== "sanity") throw new Error("CONTENT_SOURCE must be sanity or local");
  return published();
}

export function mergeLocalPublications<T extends { slug: string }>(published: T[], local: T[], localSlugs: string[]): T[] {
  const remoteSlugs = new Set(published.map(entry => entry.slug));
  return [...published, ...local.filter(entry => localSlugs.includes(entry.slug) && !remoteSlugs.has(entry.slug))];
}
