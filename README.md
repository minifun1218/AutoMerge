# AutoMerge - AI 智能文件整理

<p align="center">
   <img src="./public/icon.png" alt="Auto Merge" style="width: 100px;" />
</p>

<p align="center">
  <strong>跨平台桌面应用 · AI 驱动文件自动分类与整理</strong>
</p>


##  Description | 项目简介

**AutoMerge** 是一个 AI 驱动的跨平台桌面应用，用于自动扫描、分类和整理文件。应用通过递归扫描目录获取文件元数据，并结合规则分类与 AI 智能分析，将文件自动整理到结构化文件夹中，帮助用户快速清理杂乱的文件目录。

项目基于 **Tauri + React + TypeScript + Rust** 构建，兼顾性能、安全性和现代化 UI。AutoMerge 支持本地大模型（Ollama）以及云端 AI（OpenAI 兼容 API），能够对文件进行批量智能分析，并生成分类结果、置信度、摘要以及建议的文件夹名称。

AutoMerge 适用于 **Windows、macOS 和 Linux**，提供可视化统计仪表盘、一键整理、AI 分类以及中英双语界面，是一个轻量但强大的 AI 文件整理工具。

---

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri" alt="Tauri 2.0" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Rust-1.70+-orange?logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

<p align="center">
  <a href="./README_EN.md">English</a> | 中文
</p>
---

## 功能特性

### 文件管理
- **递归目录扫描** - 自动遍历指定目录，提取文件元数据（名称、大小、类型、修改时间）
- **11 种文件类型分类** - 文档、表格、图片、视频、音频、代码、压缩包、可执行文件、字体、数据文件等
- **可视化分类统计** - 仪表盘展示分类分布、文件数量和占用空间

### AI 智能分类
- **本地 AI (Ollama)** - 支持 Llama3、Qwen、Mistral 等本地大模型
- **云端 API (OpenAI)** - 支持 GPT-4o-mini 等 OpenAI 兼容模型
- **自定义 API** - 兼容任意 OpenAI 格式 API（如 DeepSeek、Claude 等）
- **批量分类** - 选择文件后一键 AI 批量分析，返回分类、置信度、摘要和建议文件夹

### 自动整理
- **一键整理** - 扫描完成后一键将所有文件按分类移动到对应子文件夹
- **分类确认整理** - 针对单个分类确认后自动归档
- **AI 建议整理** - AI 分类完成后按建议文件夹名一键整理
- **自动刷新** - 整理完成后自动更新文件列表和统计

### 用户界面
- **深色 / 浅色主题** - 一键切换，玻璃态（Glassmorphism）深色风格 + 清新浅色风格
- **中英双语** - 完整的中文 / English UI 支持
- **现代设计** - 渐变色、微动画、响应式布局

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **桌面框架** | Tauri 2.0 | 跨平台（Windows / Linux / macOS） |
| **前端** | React 18 + TypeScript + Vite | 现代 Web 开发栈 |
| **后端** | Rust | 高性能文件操作与 AI 通信 |
| **状态管理** | Zustand | 轻量级全局状态 |
| **国际化** | i18next + react-i18next | 中英双语 |
| **图标** | Lucide React | 统一 SVG 图标库 |
| **AI 通信** | Reqwest (HTTP) | Ollama / OpenAI REST API |

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- [Tauri 2 CLI](https://v2.tauri.app/start/prerequisites/)

### 安装与运行

```bash
# 克隆项目
git clone <repo-url>
cd AutoMerge

# 安装前端依赖
npm install

# 开发模式运行
npm run tauri dev

# 生产构建
npm run tauri build
```

---

## 使用指南

### 1. 扫描文件
在仪表盘点击 **「选择目录」**，选择需要整理的文件夹，应用会自动递归扫描并展示分类统计。

### 2. 配置 AI（可选）
进入 **「AI 设置」** 页面：

| 提供商 | 配置方式 |
|--------|----------|
| **Ollama** | 安装后运行 `ollama pull llama3`，默认地址 `localhost:11434` |
| **OpenAI** | 填入 API Key，默认模型 `gpt-4o-mini` |
| **自定义** | 填入 Base URL + API Key + 模型名 |

点击 **「测试连接」** 确认 AI 服务可用。

### 3. AI 分类
在 **「文件浏览」** 中勾选文件，切换到 **「AI 分类」** 页面，点击 **「开始 AI 分类」**。

### 4. 整理文件

**方式一：按类型一键整理**
- 仪表盘分类统计右上角点击 **「一键整理」**
- 所有文件自动移动到 `当前目录/分类名/` 子文件夹

**方式二：按分类确认整理**
- 点击某个分类下的 **「确认并整理」**
- 仅移动该分类的文件

**方式三：AI 建议整理**
- AI 分类完成后，点击 **「一键整理」**
- 按 AI 建议的文件夹名组织文件

---

## 项目结构

```
AutoMerge/
├── src/                          # React 前端
│   ├── components/
│   │   ├── Sidebar.tsx           # 侧边栏（导航 + 主题/语言切换）
│   │   ├── Dashboard.tsx         # 仪表盘（统计 + 一键整理）
│   │   ├── FileExplorer.tsx      # 文件浏览器
│   │   ├── ClassifyPanel.tsx     # AI 分类面板
│   │   ├── AIConfigPanel.tsx     # AI 提供商配置
│   │   └── SettingsPage.tsx      # 系统设置
│   ├── store/useAppStore.ts      # Zustand 全局状态
│   ├── services/tauriCommands.ts # Tauri IPC 调用层
│   ├── types/index.ts            # TypeScript 类型定义
│   ├── i18n.ts                   # 国际化配置
│   ├── App.tsx                   # 主应用布局
│   └── index.css                 # 全局样式（深色/浅色主题）
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── models/mod.rs         # 数据模型
│   │   ├── services/
│   │   │   ├── file_scanner.rs   # 文件扫描
│   │   │   ├── file_classifier.rs# 分类统计
│   │   │   ├── file_organizer.rs # 文件移动/复制
│   │   │   └── ai/
│   │   │       ├── mod.rs        # AI Prompt + 解析
│   │   │       ├── ollama.rs     # Ollama 适配器
│   │   │       └── openai.rs     # OpenAI 适配器
│   │   ├── commands/
│   │   │   ├── file_ops.rs       # 文件操作命令
│   │   │   └── ai_ops.rs        # AI 操作命令
│   │   └── lib.rs                # Tauri 入口
│   ├── Cargo.toml                # Rust 依赖
│   └── tauri.conf.json           # Tauri 配置
└── package.json
```

---

##  开发说明

### 前端开发
```bash
# 仅启动前端开发服务器
npm run dev
```

### 后端编译检查
```bash
cd src-tauri
cargo check
```

### 添加新的文件类型分类

编辑 `src-tauri/src/models/mod.rs` 中的 `FileCategory` 枚举和 `classify_by_extension()` 函数。

### 添加新的 AI 提供商

1. 在 `src-tauri/src/services/ai/` 下创建新模块
2. 实现 `classify_with_xxx()` 函数
3. 在 `commands/ai_ops.rs` 中注册新的 provider type

---

## License

MIT License - 详见 [LICENSE](./LICENSE)