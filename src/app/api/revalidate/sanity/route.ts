import { revalidatePath, revalidateTag } from "next/cache";

const collectionByType = {
  post: "posts",
  note: "notes",
} as const;

function isAuthorized(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const collection = payload && typeof payload === "object" && "_type" in payload
    ? collectionByType[payload._type as keyof typeof collectionByType]
    : undefined;

  revalidateTag("sanity-content", "max");
  if (collection) {
    revalidateTag(`sanity-${collection}`, "max");
  }
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/notes");
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");

  const slug = collection && "slug" in payload && payload.slug && typeof payload.slug.current === "string"
    ? payload.slug.current
    : undefined;
  if (collection && slug) {
    revalidateTag(`sanity-${collection}-${slug}`, "max");
    revalidatePath(`/${collection}/${encodeURIComponent(slug)}`);
  }

  return Response.json({ revalidated: true, collection, slug: slug ?? null });
}
