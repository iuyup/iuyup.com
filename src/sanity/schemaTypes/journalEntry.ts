import { defineField, defineType } from "sanity";

interface JournalEntryTypeOptions {
  name: "post" | "note";
  title: string;
  titleDescription: string;
}

export function defineJournalEntryType({ name, title, titleDescription }: JournalEntryTypeOptions) {
  return defineType({
    name,
    title,
    type: "document",
    fields: [
      defineField({
        name: "title",
        title: "标题",
        type: "string",
        validation: (rule) => rule.required().max(120),
      }),
      defineField({
        name: "slug",
        title: "URL 标识",
        type: "slug",
        description: "发布后请不要随意修改，否则旧链接会失效。",
        options: { source: "title", maxLength: 96 },
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "publishedAt",
        title: "发布日期",
        type: "datetime",
        initialValue: () => new Date().toISOString(),
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "updatedAt",
        title: "内容更新日期",
        type: "datetime",
        description: "可选。留空时，前台会使用 Sanity 的最后保存时间。",
      }),
      defineField({
        name: "summary",
        title: "摘要",
        type: "text",
        rows: 3,
        description: "用于目录页、SEO 描述与 RSS。建议控制在 160 个字符以内。",
        validation: (rule) => rule.max(180),
      }),
      defineField({
        name: "tags",
        title: "标签",
        type: "array",
        of: [{ type: "string" }],
        options: { layout: "tags" },
      }),
      defineField({
        name: "coverImage",
        title: "封面地址",
        type: "string",
        description: "可填站内路径（如 /picture/cover.jpg）或完整图片 URL。",
      }),
      defineField({
        name: "contentFormat",
        title: "正文格式",
        type: "string",
        initialValue: "markdown",
        options: {
          layout: "radio",
          list: [
            { title: "Markdown", value: "markdown" },
            { title: "MDX", value: "mdx" },
          ],
        },
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "body",
        title: "正文",
        type: "text",
        rows: 32,
        description: titleDescription,
        validation: (rule) => rule.required().min(10),
      }),
    ],
    preview: {
      select: {
        title: "title",
        subtitle: "publishedAt",
      },
    },
  });
}
