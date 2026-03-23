# rspress-plugin-blog-list

Rspress v2 插件，用于在网站中展示博客文章列表。

## 特性

- **全局组件**: 自动注册 `<BlogList />` 组件，你可以在任何 MDX 文件中直接使用
- **元数据提取**: 自动提取 Markdown 文件中的 frontmatter（包括日期、摘要、标签、封面等）
- **Rss 支持**: 内置 RSS 订阅按钮和样式

## 安装

```bash
npm install rspress-plugin-blog-list --save
# 或者
pnpm add rspress-plugin-blog-list
```

## 配置

在 `rspress.config.ts` 中添加插件配置：

```typescript
import { defineConfig } from 'rspress/config';
import { pluginBlogList } from 'rspress-plugin-blog-list';

export default defineConfig({
  plugins: [
    pluginBlogList()
  ]
});
```

## 使用

1. **创建博客索引页面**

在 `docs/blog/index.mdx` 文件中添加以下内容：

```mdx
---
pageType: doc-wide
sidebar: false
---

# 博客

<BlogList />
```

2. **在其他页面使用**

如果你想在其他页面手动插入博客列表，可以直接在任何 `.mdx` 文件中使用：

```mdx
<BlogList />
```

### 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `rssLink` | boolean | true | 是否显示 RSS 订阅链接 |
| `blogPath` | string | '/blog/' | 博客文章路径 |
| `rssPath` | string | '/blog/rss.xml' | RSS 订阅路径 |

#### 示例：关闭 RSS 链接

```mdx
<BlogList rssLink={false} blogPath="/blog/" rssPath="/blog/rss.xml" />
```

### 编写博客文章
在 `docs/blog/` 目录下创建你的 Markdown 文章。
文章的 frontmatter 格式要求如下：

```mdx
---
title: 文章标题
date: 2024-03-21
description: 文章的一段简短摘要。如果不填，将自动从正文中提取。
tags: 
  - 前端
  - React
cover: https://example.com/cover.png
---

文章的正文内容...
```

- **date** (必填): 用于对博客文章进行降序排序。
- **title** (可选): 如果不填，将默认提取文章中的第一个 H1 (`#`)。
- **description** (可选): 摘要信息。
- **tags** (可选): 标签数组，例如 `['React', 'Rspress']`。
- **cover** (可选): 封面图片链接。
