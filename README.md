# selfweb

个人主页与博客项目，线上站点：[iuyup.com](https://iuyup.com)。

首页采用卡片式布局，集中展示个人介绍、项目、音乐、博客和随记；文章内容主要保存在 Markdown 文件中。

## 技术栈

- Next.js 16、React 19、TypeScript
- Tailwind CSS
- Markdown / MDX 与 Sanity CMS
- 可选的 Go API：聊天和留言板等有状态功能

## 本地运行

需要 Node.js `>= 20.9.0`。

```powershell
npm install
npm run dev
```

然后打开 `http://localhost:3000`。

如需配置 Sanity 或其他服务，在 `.env.example` 的基础上创建 `.env.local`，并填入自己的密钥；不要提交 `.env.local`。

## 常用命令

```powershell
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run start     # 启动生产服务
npm run lint      # 代码检查
```

## 内容与服务

- 博客文章：`content/posts/`
- 随记与后台内容：Sanity Studio（`/studio`）
- Go API：`services/api-go/`，使用方式见该目录的 [README](services/api-go/README.md)
