import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const localEnvFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(localEnvFile)) {
  process.loadEnvFile(localEnvFile);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "rnbye9v9";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-22";
const writeToken = process.env.SANITY_API_WRITE_TOKEN;
const shouldCommit = process.argv.includes("--commit");

const collections = [
  { directory: "posts", type: "post" },
  { directory: "notes", type: "note" },
];

function documentId(type, slug) {
  const hash = createHash("sha256").update(`${type}:${slug}`).digest("hex").slice(0, 24);
  return `${type}-${hash}`;
}

function asString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asDateTime(value, field, fileName) {
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fileName} 的 ${field} 不是有效日期`);
  }
  return parsed.toISOString();
}

function toDocument({ type, fileName, raw }) {
  const slug = fileName.replace(/\.mdx?$/, "");
  if (!slug || /[\\/\0]/.test(slug)) {
    throw new Error(`${fileName} 的 slug 无效`);
  }

  const { data, content } = parseFrontmatter(raw);
  const title = asString(data.title);
  const publishedAt = data.date ? asDateTime(data.date, "date", fileName) : undefined;
  const body = content.trim();

  if (!title || !publishedAt || body.length < 10) {
    throw new Error(`${fileName} 缺少 title、date 或有效正文`);
  }

  const tags = Array.isArray(data.tags)
    ? data.tags.filter((tag) => typeof tag === "string" && tag.trim()).map((tag) => tag.trim())
    : [];
  const summary = asString(data.summary);
  const coverImage = asString(data.image);
  const updatedAt = data.updated ? asDateTime(data.updated, "updated", fileName) : undefined;

  return {
    _id: documentId(type, slug),
    _type: type,
    title,
    slug: { _type: "slug", current: slug },
    publishedAt,
    ...(updatedAt ? { updatedAt } : {}),
    ...(summary ? { summary } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(coverImage ? { coverImage } : {}),
    contentFormat: fileName.endsWith(".mdx") ? "mdx" : "markdown",
    body,
  };
}

function collectDocuments() {
  const contentRoot = path.join(process.cwd(), "content");
  const documents = [];

  for (const collection of collections) {
    const directory = path.join(contentRoot, collection.directory);
    if (!fs.existsSync(directory)) {
      continue;
    }

    const files = fs
      .readdirSync(directory)
      .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
      .sort();

    for (const fileName of files) {
      const raw = fs.readFileSync(path.join(directory, fileName), "utf8");
      documents.push(toDocument({ type: collection.type, fileName, raw }));
    }
  }

  return documents;
}

const documents = collectDocuments();
const counts = documents.reduce(
  (result, document) => ({ ...result, [document._type]: (result[document._type] || 0) + 1 }),
  {}
);

console.log(`已读取 ${documents.length} 篇本地内容：${JSON.stringify(counts)}`);

if (!shouldCommit) {
  console.log("这是预演，没有写入 Sanity。确认无误后运行：npm run sanity:migrate -- --commit");
  process.exit(0);
}

if (!writeToken) {
  throw new Error("缺少 SANITY_API_WRITE_TOKEN；请只在本机 .env.local 中设置它。\n");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken,
  useCdn: false,
});

await client.transaction(documents.map((document) => ({ createOrReplace: document }))).commit();
console.log(`已将 ${documents.length} 篇内容写入 ${projectId}/${dataset}。`);
