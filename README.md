# selfweb

个人主页与博客项目，线上站点：[www.iuyup.com](https://www.iuyup.com)。

首页采用卡片式布局，集中展示个人介绍、项目、音乐、博客和随记。中文已发布内容主要来自 Sanity；尚未迁移的文章通过 `content/local-publications.json` 明确登记，英文内容保存在本地 Markdown 中。

## 技术栈

- Next.js 16、React 19、TypeScript
- Tailwind CSS
- Markdown / MDX 与 Sanity CMS
- 可选的 Go API：聊天和留言板等有状态功能

## 内容与服务

- 博客文章：`content/posts/`
- 随记与后台内容：Sanity Studio（`/studio`）
- Go API：`services/api-go/`，使用方式见该目录的 [README](services/api-go/README.md)

## 验证

- `npm test`：聊天请求、流中断、发布规则和浏览量回归测试。
- `npm run lint` 与 `npm run build`：前端检查和生产构建。构建需要访问 Google Fonts 与 Sanity。
- 在 `services/api-go` 执行 `go test ./...` 和 `go vet ./...`。
- 浏览器检查：安装 Playwright 后，先运行 `npm start -- --port 3018`，再运行 `node scripts/verify-browser.cjs`。默认使用本机 Edge；可通过 `PLAYWRIGHT_MODULE` 指定已有 Playwright 安装。测试会模拟所有交互 API，不调用付费模型或写入站点数据。

本次内容发布规则及 Go 检索更新需要将前端、Go 服务与 `content/local-publications.json` 一起部署。参见 [Sanity 发布说明](docs/sanity-migration.md)。中英文使用独立根布局，切换语言时会重新加载页面，现有网址保持不变。
