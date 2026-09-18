---
title: 给 VitePress 博客添加评论
date: 2026-07-12
tags: [博客, Vue]
category: 前端
description: 对比 Giscus、Waline、Artalk 三种方案，并给出在 VitePress 中接入 Giscus 的完整步骤。
---

静态站点没有后端，评论系统需要借助第三方服务。本文对比主流方案并给出接入示例。

## 方案对比

| 方案 | 数据存储 | 优点 | 缺点 |
| --- | --- | --- | --- |
| Giscus | GitHub Discussions | 无需自建、开发者友好 | 依赖 GitHub 登录 |
| Waline | 自建 / LeanCloud | 功能丰富、支持匿名 | 需要部署服务端 |
| Artalk | 自建 | 自托管、轻量 | 需要维护服务器 |

## 接入 Giscus

1. 在 GitHub 仓库开启 Discussions
2. 安装 [giscus app](https://giscus.app) 并授权仓库
3. 在 giscus 官网生成配置参数
4. 在 VitePress 主题中创建评论组件

```vue
<script setup>
import Giscus from '@giscus/vue'
</script>

<template>
  <Giscus
    repo="your-name/your-repo"
    repoId="xxx"
    category="Announcements"
    categoryId="xxx"
    mapping="pathname"
  />
</template>
```

## 小结

个人博客推荐 Giscus——零维护成本，读者用 GitHub 账号即可评论；如果希望访客无需登录，可以选 Waline。
