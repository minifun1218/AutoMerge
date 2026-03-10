# AutoMerge - AI-Powered Intelligent File Organization

<p align="center">
   <img src="./public/icon.png" alt="Auto Merge" style="width: 100px;" />
</p>

<p align="center">
  <strong>Cross-platform Desktop Application · AI-Driven File Categorization & Organization</strong>
</p>


## Description
**AutoMerge** is an AI-powered cross-platform desktop application designed to automatically scan, classify, and organize files. By recursively scanning directories and gathering file metadata, it combines rule-based classification with AI intelligent analysis to automatically organize files into structured folders, helping users quickly clean up cluttered directories.

Built with **Tauri + React + TypeScript + Rust**, AutoMerge balances performance, security, and a modern UI. It supports local AI (Ollama) as well as cloud-based AI (OpenAI-compatible APIs), enabling batch intelligent analysis of files while providing classification results, confidence scores, summaries, and suggested folder names.

Available for **Windows, macOS, and Linux**, AutoMerge features a visual dashboard, one-click organization, AI classification, and a multi-language (English/Chinese) interface, making it a lightweight yet powerful AI file management tool.

---

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri" alt="Tauri 2.0" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Rust-1.70+-orange?logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

<p align="center">
  English | <a href="./README.md">简体中文</a>
</p>

---

## Features

### File Management
- **Recursive Directory Scan** - Automatically traverses specified directories, extracting file metadata: name, size, type, and modification time.
- **11 Categories** - Supports Documents, Spreadsheets, Images, Videos, Audio, Code, Archives, Executables, Fonts, Data, and more.
- **Visual Statistics** - Dashboard displays category distribution, file counts, and storage usage.

### AI Intelligent Classification
- **Local AI (Ollama)** - Support for Llama3, Qwen, Mistral, and other local large models.
- **Cloud API (OpenAI)** - Compatible with GPT-4o-mini and other OpenAI-standard models.
- **Custom API** - Supports any OpenAI-format API, such as DeepSeek, Claude, etc.
- **Batch Classification** - One-click batch analysis of selected files, returning classification, confidence, summary, and suggested folder names.

### Auto Organization
- **One-Click Organize** - Automatically moves all files into corresponding subdirectories based on their categories.
- **Category Refined Archive** - Confirm and archive specific categories individually.
- **AI-Suggested Organization** - Quick organization based on AI-generated folder name suggestions.
- **Auto-Refresh** - File lists and statistics update automatically after organization.

### User Interface
- **Dark / Light Modes** - Easy-to-switch themes, including a Glassmorphism dark style and a clean light style.
- **Multi-language Support** - Full support for both English and Chinese.
- **Modern Design** - Gradients, micro-animations, and responsive layout.

---

## Technical Stack

| Layer | Technology | Description |
|------|------|------|
| **Desktop Framework** | Tauri 2.0 | Cross-platform (Windows / Linux / macOS) |
| **Front-end** | React 18 + TypeScript + Vite | Modern Web stack |
| **Back-end** | Rust | High-performance file operations and AI communication |
| **State Management** | Zustand | Lightweight global state management |
| **Internationalization** | i18next + react-i18next | Multi-language support |
| **Icon Library** | Lucide React | Unified SVG icons |
| **AI Communication** | Reqwest (Rust) | REST API integration with Ollama / OpenAI |

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.70
- [Tauri 2 CLI](https://v2.tauri.app/start/prerequisites/)

### Installation & Run
```bash
# Clone the repository
git clone <repo-url>
cd AutoMerge

# Install front-end dependencies
npm install

# Run in development mode
npm run tauri dev

# Build production bundle
npm run tauri build
```

---

## User Guide

### 1. Scan Files
Click **"Select Directory"** on the dashboard, choose the target folder, and the application will automatically scan the directory recursively and display the classification statistics.

### 2. Configure AI (Optional)
Go to the **"AI Settings"** page:
- **Ollama**: Install then run `ollama pull llama3`, default address `localhost:11434`.
- **OpenAI**: Fill in your API Key, default model `gpt-4o-mini`.
- **Custom**: Fill in the Base URL + API Key + Model name.
Click **"Test Connection"** to verify the service.

### 3. AI Classification
Check the desired files in **"File Explorer"**, switch to the **"AI Classification"** panel, and click **"Start AI Classification"**.

### 4. Organize Files
- **Organization by Category**: Click **"One-Click Organize"** on the dashboard stats card to move all files into their respective category folders (`BaseDir/CategoryName/`).
- **Category Specific**: Click **"Confirm & Organize"** under a specific category to only move files of that type.
- **AI Suggested**: After AI classification is complete, click **"One-Click Organize"** to archive files according to AI-suggested folder names.

---

## Project Structure
```
AutoMerge/
├── src/                          # React Front-end
│   ├── components/
│   │   ├── Sidebar.tsx           # Sidebar (Nav + Theme/Language)
│   │   ├── Dashboard.tsx         # Dashboard (Stats + Organize)
│   │   ├── FileExplorer.tsx      # File Explorer
│   │   ├── ClassifyPanel.tsx     # AI Classification Panel
│   │   ├── AIConfigPanel.tsx     # AI Configuration
│   │   └── SettingsPage.tsx      # System Settings
│   ├── store/useAppStore.ts      # Zustand Store
│   ├── services/tauriCommands.ts # Tauri IPC Layer
│   ├── types/index.ts            # TypeScript Definitions
│   ├── i18n.ts                   # i18n Config
│   ├── App.tsx                   # Main Layout
│   └── index.css                 # Global Styles
├── src-tauri/                    # Rust Back-end
│   ├── src/
│   │   ├── models/mod.rs         # Data Models
│   │   ├── services/
│   │   │   ├── file_scanner.rs   # File Scanning
│   │   │   ├── file_classifier.rs# Classification Stats
│   │   │   ├── file_organizer.rs # File Operation Service
│   │   │   └── ai/
│   │   │       ├── mod.rs        # AI Dispatcher
│   │   │       ├── ollama.rs     # Ollama Adapter
│   │   │       └── openai.rs     # OpenAI Adapter
│   │   ├── commands/
│   │   │   ├── file_ops.rs       # File IPC Commands
│   │   │   └── ai_ops.rs        # AI IPC Commands
│   │   └── lib.rs                # Tauri Entry Point
│   ├── Cargo.toml                # Rust Dependencies
│   └── tauri.conf.json           # Tauri Configuration
└── package.json
```

---

## Development Info

### Front-end Development
```bash
# Only start the front-end dev server
npm run dev
```

### Back-end Check
```bash
cd src-tauri
cargo check
```

### Adding New Categories
Edit `FileCategory` enum and extension mapping in `src-tauri/src/models/mod.rs`.

---

## License
MIT License - see [LICENSE](./LICENSE) for details.
