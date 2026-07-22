# Sanity 内容后台

站点将 Sanity 作为文章与“随心”的首要数据源，路径仍保持为 `/posts/[slug]` 和 `/notes/[slug]`。现有 `content/posts`、`content/notes` 会在迁移期间保留为回退数据：Sanity 无内容、或服务暂时不可访问时，访客仍能看到 Markdown 版本。

## 本地打开后台

1. 把 `.env.example` 复制为本机的 `.env.local`，并保留其中的项目 ID 与数据集名。
2. 在 Sanity 项目的 **API → CORS origins** 中添加 `http://localhost:3000`；部署后再添加 `https://iuyup.com`。两个来源都启用 credentials。
3. 运行 `npm run dev`，访问 `http://localhost:3000/studio`，用 Sanity 账号登录。

`/studio` 不需要单独部署。它随 Next.js 站点一起发布，且已经被标记为 `noindex`，不会被搜索引擎收录。

## 导入现有 Markdown

导入脚本默认只预演，不会写远程数据。

1. 在 Sanity 的 **API → Tokens** 创建一个仅自己本机使用的写入令牌（Editor 权限）。不要把令牌发到聊天、提交到 Git，或放进公开环境变量。
2. 在 `.env.local` 设置 `SANITY_API_WRITE_TOKEN`。
3. 先运行 `npm run sanity:migrate`。它会列出要导入的文章数与随心数。
4. 数量正确后运行 `npm run sanity:migrate -- --commit`。

导入会用稳定的文档 ID 执行 upsert，所以重复运行会更新同一篇内容，而不会重复创建。文件重命名会被视为新的 slug；确认新地址生效后，再手动处理旧文档。

## 发布后刷新站点

前台对 Sanity 查询使用可缓存请求，并带有 `sanity-content`、`sanity-posts`、`sanity-notes` 标签。缓存默认保留一小时；Sanity 发布时通过 webhook 立即标记为待刷新，同时刷新首页、文章/随心目录、RSS 与 sitemap。

在 Sanity **API → Webhooks** 新建 webhook：

- URL：`https://iuyup.com/api/revalidate/sanity`
- 触发：Create、Update、Delete
- Filter：`_type == "post" || _type == "note"`
- HTTP Header：`Authorization: Bearer <SANITY_REVALIDATE_SECRET>`
- Payload：保留 `_type` 与 `slug`；即使删除事件没有 slug，基础内容缓存仍会刷新。

在部署平台与 `.env.local` 中设置相同的 `SANITY_REVALIDATE_SECRET`。不设置该值时，刷新接口会拒绝所有请求。

## 当前内容模型

文章与随心都有：标题、slug、发布日期、可选更新日期、摘要、标签、封面地址、正文格式和正文。正文继续以 Markdown 或 MDX 保存，因此前台的代码高亮、表格和原有排版无需改写。封面先允许站内路径或完整 URL；Sanity 媒体库上传可在下一阶段再接入。
