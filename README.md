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

## 新建文章

```bash
npm run new -- flashattention-note "FlashAttention 论文精读" papers
```

文章会生成到 `src/posts/flashattention-note.md`。可用分类：

- `learning`: 学习笔记
- `papers`: 论文分享
- `interesting`: 有趣发现

## 发布到 GitHub Pages

1. 在 GitHub 创建公开仓库 `sunzhongkai588.github.io`。
2. 本地执行：

```bash
git init
git branch -M main
git add .
git commit -m "init personal blog"
git remote add origin https://github.com/sunzhongkai588/sunzhongkai588.github.io.git
git push -u origin main
```

3. 进入仓库 `Settings -> Pages`，`Build and deployment -> Source` 选择 `GitHub Actions`。
4. 等 Actions 完成后，访问 `https://sunzhongkai588.github.io`。

## 小红书分享流

每篇文章可以在 frontmatter 里写 `xhs` 字段，并在正文里放 `<XhsShare />`。本地预览时截取竖版卡片，按钮可以复制小红书文案。
