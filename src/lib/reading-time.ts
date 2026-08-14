const CHINESE_CHARACTERS_PER_MINUTE = 300;
const LATIN_WORDS_PER_MINUTE = 200;

function readableText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/<[^>]*>/g, "");
}

export function estimateReadingTimeMinutes(markdown: string): number {
  const text = readableText(markdown);
  const chineseCharacters = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const latinWords = (text.replace(/[\u3400-\u9fff\uf900-\ufaff]/g, "").match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;

  return Math.max(1, Math.ceil(chineseCharacters / CHINESE_CHARACTERS_PER_MINUTE + latinWords / LATIN_WORDS_PER_MINUTE));
}
