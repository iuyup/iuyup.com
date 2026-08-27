import { load } from "js-yaml";

const FRONTMATTER_PATTERN = /^---[\t ]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[\t ]*(?:\r?\n|$)/;

export function parseFrontmatter(source) {
  const bomOffset = source.charCodeAt(0) === 0xfeff ? 1 : 0;
  const match = FRONTMATTER_PATTERN.exec(source.slice(bomOffset));

  if (!match) {
    return { data: {}, content: source.slice(bomOffset) };
  }

  const parsed = load(match[1]);
  if (parsed !== null && (typeof parsed !== "object" || Array.isArray(parsed))) {
    throw new TypeError("Frontmatter must be a YAML mapping.");
  }

  return {
    data: parsed ?? {},
    content: source.slice(bomOffset + match[0].length),
  };
}
