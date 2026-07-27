import { createClient } from "next-sanity";

export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "rnbye9v9";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-22";

export const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  perspective: "published",
  // Next.js owns the page cache and Sanity webhooks invalidate it on publish.
  // Reading directly from Content Lake avoids serving an older CDN response
  // immediately after an editor publishes content.
  useCdn: false,
  stega: {
    enabled: false,
  },
});
