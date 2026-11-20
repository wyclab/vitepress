---
title: AI Agent介绍
description: 2026 主流 AI Agent 概览与选型指南：系统梳理编程 Agent（Claude Code、Cursor、Antigravity、Codex、Trae）、职场与桌面办公 Agent（腾讯 WorkBuddy、扣子空间、阿里悟空、智谱 AutoGLM、Claude Cowork）、个人 Agent（Dots、Muse、Grok Bot、Spell）、开源龙虾与云端通用 Agent（OpenClaw、QClaw、Kimi Claw、Manus）及工作流平台。
date: 2026-11-20
category: AI世界
tags: [AI技术]
order: 3
---

# AI Agent 介绍

> 在 [AI核心概念](/articles/ai/ai-tech/ai-concepts) 中我们提到：**`Agent = Model + Harness`**。如果说大模型（详见 [模型介绍](/articles/ai/ai-tech/model-intro)）提供了“大脑”，那么各类 **AI Agent 产品** 就是真正替人类接管终端、桌面、浏览器与办公软件的“数字员工”。本文按五大赛道概览当前（2026 年底）海内外最主流的 AI Agent。

---

## 五大赛道总览

| 赛道 | 核心定位 | 代表产品（海外 / 国产） | 适用人群 |
| --- | --- | --- | --- |
| **编程与研发 Agent** | 读仓库、改代码、跑测试、提 PR，商业化最成熟 | Claude Code、Cursor、Antigravity、Codex / Trae、Qoder、Kimi Code | 开发者、技术团队 |
| **职场与桌面办公 Agent** | 接管桌面文件、办公软件与跨网页操作，交付文档/PPT/数据 | Claude Cowork / **腾讯 WorkBuddy**、**扣子空间**、**阿里悟空**、**智谱 AutoGLM** | 职场白领、企业团队 |
| **个人 Agent（Personal Agent）** | 长记忆、跨应用、主动跟进日常事务的新一代 C 端入口 | OpenAI Dots、Meta Muse、xAI Grok Bot / 字节 Spell | 个人效率用户 |
| **开源“龙虾”与云端通用 Agent** | 开源本地自托管遥控电脑，或云端沙箱全自动干杂活 | OpenClaw（龙虾）、Manus / **腾讯 QClaw**、**Kimi Claw** | 极客开发者 & 通用效率用户 |
| **编排与工作流平台** | 可视化拖拽节点，搭建可控、可复用的业务流水线 | n8n / Dify、Coze（扣子） | 企业团队、自动化爱好者 |

---

## 编程与研发 Agent（Coding Agents）

软件工程是 AI Agent 落地最深的领域。2026 年的编程工具早已超越“代码补全”，演进为能自主规划、执行命令并闭环修 Bug 的专业 Harness：

| 产品名称 | 出品方 | 产品形态 | 核心特点与常用模型 |
| --- | --- | --- | --- |
| **Claude Code** | Anthropic | 终端原生 CLI | 命令行极客标杆：深度理解大型代码库、自动跑测试与管 Git、支持 Hooks 与 Skills 扩展；原生驱动 Claude Opus / Sonnet 5.5（见 [模型介绍](/articles/ai/ai-tech/model-intro)）。 |
| **Cursor** | Cursor | AI 原生 IDE（VS Code 分支） | 视觉化协同体验天花板：行内 Diff、Tab 预测与多文件 Composer 无缝衔接；支持自由切换各大模型（与 xAI Grok 4.7 等亦有深度工程协同）。 |
| **Google Antigravity** | Google | Agentic IDE + CLI 平台 | 谷歌新一代多智能体开发环境：支持百万上下文工程操作、内置浏览器交互与 `/swarm` 多代理并行协同；深度发挥 Gemini 4（Neon / Carbon / Hydrogen）的思考分级与成本优势。 |
| **OpenAI Codex** | OpenAI | CLI + 云端异步沙箱 | 深度绑定 ChatGPT/OpenAI 订阅体系，调用 GPT-6 Sol / Astra；强项是把明确需求丢给云端沙箱后台异步干活，跑完直接交 PR。 |
| **Trae（含 TRAE Work）** | 字节跳动 | AI 原生 IDE / 桌面工作流 | 国产代表性 AI 编程工具，从聚焦写代码（TRAE Solo/IDE）延伸出支持更广泛桌面任务的 TRAE Work，贴合国内开发与技术办公生态。 |
| **其他特色编程线** | Cognition / 阿里 / 月之暗面 / Meta | 云端工程师 / 终端代理 | **Devin** 主打全自主云端接单；阿里 **Qoder**（Qwen Coder / Qwen4-Max）、**Kimi Code**（Kimi K3.1）、Meta **Muse Code**（Muse Spark）深度贴合各自模型生态。 |

> **选型速记**：习惯图形界面选 **Cursor / Trae**；热爱终端掌控感选 **Claude Code**；重度多 Agent 协同与长上下文选 **Antigravity**；想异步派单给云端选 **Codex / Devin**。

---

## 职场与桌面办公 Agent（Desktop & Office Agents）

这是 2026 年**中国大厂卷得最激烈、也最贴近普通职场人**的赛道。产品形态全面告别“纯对话框”，标配本地文件夹读写、电脑/手机屏幕操控（Computer & Phone Use）以及直接交付 Word / Excel / PPT / 网页成品的能力：

| 产品名称 | 出品方 | 核心定位与亮点 | 生态与底层模型（可对照 [模型介绍](/articles/ai/ai-tech/model-intro)） |
| --- | --- | --- | --- |
| **WorkBuddy** | 腾讯 | 国内最具代表性的**全场景职场 AI 桌面工作台**（腾讯云 CodeBuddy 团队出品）。支持 `Craft`（实干直接操作本地文件）、`Plan`（先出方案确认后执行）、`Ask`（问答）三模式，具备 Computer Use 桌面操控、多 Agent 并行与团队 Skills 沉淀能力。 | 深度打通企业微信、腾讯文档、QQ 邮箱等生态；依托腾讯混元并兼容多模型。 |
| **扣子空间（Coze Space）** | 字节跳动 | 通用型 AI Agent 与云端智能办公空间。一句话需求自动拆解执行，内置大量专家 Agent 并全面接入 **MCP** 协议，一键交付研究报告、网页、PPT 与小程序。 | 衔接飞书与字节豆包 Seed 2 生态，云端协作零门槛。 |
| **悟空（WuKong / 千问办公）** | 阿里巴巴 | 面向企业级高效办公的 AI 原生工作平台，强调企业知识图谱、数据安全边界、跨应用连接器与团队多 Agent 协同工作流。 | 依托阿里 Qwen4-Max 与钉钉/阿里系商业办公生态。 |
| **AutoGLM（含 AutoClaw 澳龙）** | 智谱 AI | 强于**跨应用 GUI 视觉自动化（Computer & Phone Use）**与“沉思”深度推理——不依赖软件开放 API，能像人一样看懂屏幕去操作小红书、京东、知网及各类网页后台，覆盖电脑与手机双端。 | 依托智谱 GLM-5 系列，提供桌面客户端 AutoClaw 与开源手机端权重。 |
| **Claude Cowork** | Anthropic | 海外面向通用知识工作与日常办公的桌面 Agent（已逐步与 Claude.ai 融合），在企业非研发部门普及极快（另见 [Anthropic 招股书精读](/articles/ai/ai-invest/anthropic-ipo)）。 | 原生驱动 Claude 5 系列。 |

> **选型速记**：国内桌面深度办公+企微生态首选 **WorkBuddy**；云端出报告/PPT 与 MCP 工具拼接选 **扣子空间**；需要跨网页/手机 App 模拟人工点按操作选 **AutoGLM / AutoClaw**；阿里系企业办公看 **悟空**。

---

## 个人 Agent（Personal Agents）

2026 年科技巨头集中押注 **Personal Agent（全天候个人智能体）**——让 AI 拥有长期记忆，打通日历、邮件、社交与穿戴硬件，像私人管家一样主动跟进日常事务：

| 产品名称 | 出品方 | 核心定位与亮点 | 底层大脑 |
| --- | --- | --- | --- |
| **Dots** | OpenAI | ChatGPT 生态的新一代个人 Agent 入口，聚焦长周期个人记忆、跨应用任务编排与工作流托管。 | GPT-6 系列（Astra / Sol） |
| **Muse（Muse Agent）** | Meta | Meta“个人超级智能”核心载体，深度打通 WhatsApp、独立 App 与 Ray-Ban 智能眼镜，主打原生多模态与实时环境交互。 | Muse Spark / Wonder |
| **Grok Bot** | xAI | 面向复杂执行与协作的 Agent 体系，支持管理多角色专项工作 Bot，在共享云端环境自主跑任务，并衔接 X 生态。 | Grok 4.7 系列 |
| **Spell** | 字节跳动 | 豆包团队跟进 Personal Agent 赛道的重点项目，依托豆包庞大用户盘发力本土化个人助理与跨场景自动化。 | 豆包 Seed 2 系列 |

---

## 开源“养龙虾”与云端通用 Agent

这类 Agent 突破单一办公或编程场景，主打“把电脑或云主机直接交给它”：

### 1. “龙虾”生态：OpenClaw、腾讯 QClaw 与 Kimi Claw

- **OpenClaw（开源“龙虾”）**：2026 年现象级开源、**本地优先（Local-First）** 自主 Agent 框架（红龙虾图标，因此社区戏称部署它为**“养龙虾”**）。跑在闲置 Mac / Linux / 私有服务器上，可直接操作本地文件、Shell 与浏览器，接入**飞书、Telegram、WhatsApp、Discord** 等聊天软件远程指挥；最大优势是**数据在本地、Skills 插件丰富且不锁死模型**——可自由挂载 [模型介绍](/articles/ai/ai-tech/model-intro) 里的任意大模型大脑。
- **腾讯 QClaw**：腾讯电脑管家团队基于 OpenClaw 生态打造的轻量本地“小龙虾”，核心杀手锏是**微信直连遥控**——人在外地发条微信，家里或公司的电脑就自动整理文件、跑报表；目前已与 **WorkBuddy** 纳入同一协同体系，形成“桌面重度办公 + 微信轻量遥控”组合。
- **Kimi Claw**：月之暗面推出的官方**一键云端托管版**“龙虾”，免服务器运维与配置折腾，原生融合 Kimi K3 / K3.1 与 Claw 社区技能库。

### 2. Manus（云端通用行动引擎）

- 闭源、**云端托管**的通用自主执行标杆。打开网页下达复杂目标（竞品深研、数据抓取清洗、产出完整报告或可访问网站），全程在官方云沙箱自主完成，零本地部署门槛。

### 开源本地“龙虾” vs. 云端托管 Manus

| 对比维度 | OpenClaw / 本地龙虾 | Manus（云端沙箱） |
| --- | --- | --- |
| **部署方式** | 开源自托管（本地电脑 / 私有服务器） | 官方云端 SaaS，打开网页即用 |
| **使用门槛** | 较高（QClaw / Kimi Claw 大幅降低了门槛） | 极低（零配置，开箱即用） |
| **隐私与安全** | 数据留在本地，但需管好本机权限 | 云端沙箱隔离，不怕误操作本机文件 |
| **自由度与模型** | 极高，可任意换底层模型、魔改源码与 Skills | 平台主导，生态封闭但体验一致 |
| **形象比喻** | 极客自己攒的 **Android / DIY 主机** | 拎包入住的 **iOS / 精装公寓** |

---

## 编排与工作流平台（Agent Builders）

当团队需要把固定高频流程**稳定复现、权限可控地沉淀下来**时，常借助低代码编排平台将确定性工作流与 Agent 节点结合：

- **Dify**：最受欢迎的开源 LLM 应用与 Agent 编排平台，内置知识库（RAG）、工作流画布与多模型统一接入，适合企业私有化落地。
- **n8n**：老牌自动化神器，拥有数百个 SaaS/系统连接器，叠加 AI Agent 节点后非常适合串联邮件、表格、飞书、数据库等跨系统业务。
- **Coze（扣子）**：字节旗下低代码 Bot / Agent 搭建平台，插件生态丰富、发布渠道广（微信/飞书/豆包等），适合非技术背景快速把想法做成可用助手。

---

## 一句话选型建议

- **写代码 / 研发提效**：IDE 派选 **Cursor / Trae**，终端派选 **Claude Code**，多智能体与长上下文选 **Antigravity**，云端异步派单选 **Codex**。
- **国内日常职场办公**：本地深度交付与企微生态选 **腾讯 WorkBuddy**；云端做调研/PPT 选 **扣子空间** 或 **Manus**；跨软件/手机点按自动化选 **智谱 AutoGLM**。
- **24 小时私有数字员工 & 远程遥控电脑**：极客自折腾选 **OpenClaw**（自由搭配 [模型介绍](/articles/ai/ai-tech/model-intro) 里的任意模型），想用微信直连选 **腾讯 QClaw**，免运维云托管选 **Kimi Claw**。
- **团队标准化业务流**：选 **Dify**、**n8n** 或 **Coze**。
