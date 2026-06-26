# Sun Zhongkai Blog

个人博客，用来记录学习笔记、论文分享和有趣发现。站点使用 VitePress，部署目标是 GitHub Pages 用户站：

```text
https://sunzhongkai588.github.io
```

## 本地开发

```bash
npm install
npm run dev
```

本地预览默认地址：

```text
http://127.0.0.1:5173
```

## 新建文章

```bash
npm run new -- flashattention-note "FlashAttention 论文精读" papers
```

文章会生成到 `src/posts/flashattention-note.md`。可用分类：

- `learning`: 学习笔记
- `papers`: 论文分享
- `interesting`: 有趣发现

`npm run new` 会按分类生成不同正文骨架：学习笔记会包含概念和踩坑，论文分享会包含论文信息、方法和实验，有趣发现会包含发现、用途和后续问题。

## 本地检查

```bash
npm run check
```

这个命令会先检查格式，再构建站点，并检查关键产物是否生成，包括首页、栏目页、示例文章、RSS、sitemap、robots、小红书分享卡片和文章页里的分享链接。

## 格式化

```bash
npm run fmt
npm run fmt:check
```

项目使用 Prettier 统一格式。PR 会自动运行 `npm run check`；如果 PR 分支来自当前仓库，`Format Fix` workflow 会自动执行 `npm run fmt` 并把格式化结果推回该 PR 分支。来自 fork 的 PR 只做检查，不自动推送修改。

## 发布到 GitHub Pages

当前本地仓库已经初始化并完成首个提交，远端也已经配置为：

```text
https://github.com/sunzhongkai588/sunzhongkai588.github.io.git
```

首次发布只需要：

1. 在 GitHub 创建公开空仓库 `sunzhongkai588.github.io`，不要勾选初始化 README。
2. 本地执行：

```bash
git push -u origin main
```

3. 进入仓库 `Settings -> Pages`，`Build and deployment -> Source` 选择 `GitHub Actions`。
4. 等 Actions 完成后，访问 `https://sunzhongkai588.github.io`。

之后每次发文：

```bash
npm run build
git add .
git commit -m "add new post"
git push
```

## 小红书分享流

每篇文章可以在 frontmatter 里写 `xhs` 字段，并在正文里放 `<XhsShare />`。本地预览时可以打开自动生成的 4:5 分享卡片，按钮可以复制小红书文案和具体文章链接。

建议工作流：

1. 先写完整博客，保留背景、过程、结论和参考链接。
2. 在 `xhs.title` 里写适合小红书的标题。
3. 在 `xhs.summary` 里写一句话结论。
4. 在 `xhs.bullets` 里保留三到五个要点。
5. 本地打开文章页，截取分享卡片，复制文案后发布到小红书。

站点会自动为每个页面生成 canonical、Open Graph 和 Twitter Card 元信息；微信、小红书或其他平台展示链接时，会优先使用对应文章标题和摘要。

构建时还会自动生成：

- `/rss.xml`: RSS 订阅
- `/sitemap.xml`: 搜索引擎站点地图
- `/robots.txt`: 搜索引擎抓取声明
- `/xhs-cards/<slug>.svg`: 每篇文章的小红书分享卡片

模板在 `content-templates/`：

- `learning-note.md`: 学习笔记模板
- `paper-note.md`: 论文分享模板
- `interesting-find.md`: 有趣发现模板
- `xhs-caption.md`: 小红书纯文案模板
