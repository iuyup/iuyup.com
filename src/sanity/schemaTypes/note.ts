import { defineJournalEntryType } from "./journalEntry";

export const noteType = defineJournalEntryType({
  name: "note",
  title: "随心",
  titleDescription: "支持 Markdown 与 MDX，前台会沿用文章详情页的排版。",
});
