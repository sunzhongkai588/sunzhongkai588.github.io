---
title: 小红书分享流
sidebar: false
---

# 小红书分享流

每篇文章的 frontmatter 都可以写 `xhs` 字段，并在正文里放一行 `<XhsShare />`。发布前在本地预览页面，截取竖版分享卡片，再点按钮复制文案。

推荐节奏：

1. 博客写完整推理、链接、实验和参考资料。
2. 小红书只保留一个明确问题、三到五个要点、一个可讨论的结论。
3. 结尾放博客地址 `sunzhongkai588.github.io`，把长文作为延伸阅读。

frontmatter 示例：

```yaml
---
title: 文章标题
date: 2026-06-26
category: papers
tags: [LLM, 论文精读]
description: 一句话摘要。
xhs:
  title: 适合小红书的标题
  summary: 这篇文章最值得带走的一句话。
  bullets:
    - 第一个要点
    - 第二个要点
    - 第三个要点
---
```
