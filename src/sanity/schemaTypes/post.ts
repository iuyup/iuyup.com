import { defineJournalEntryType } from "./journalEntry";

export const postType = defineJournalEntryType({
  name: "post",
  title: "文章",
  titleDescription: "支持现有文章使用的 Markdown；只有确实需要 JSX 时才选择 MDX。",
});
