import { groq } from "next-sanity";

const journalEntryFields = groq`{
  "slug": slug.current,
  title,
  publishedAt,
  "updatedAt": coalesce(updatedAt, _updatedAt),
  summary,
  tags,
  coverImage,
  body,
  contentFormat
}`;

export const ALL_POSTS_QUERY = groq`*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) ${journalEntryFields}`;
export const ALL_NOTES_QUERY = groq`*[_type == "note" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) ${journalEntryFields}`;
export const POST_BY_SLUG_QUERY = groq`*[_type == "post" && slug.current == $slug][0] ${journalEntryFields}`;
export const NOTE_BY_SLUG_QUERY = groq`*[_type == "note" && slug.current == $slug][0] ${journalEntryFields}`;
