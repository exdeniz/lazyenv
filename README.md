# lazyenv

> 🚀 A blazing-fast TUI for switching between `.env` files and running npm scripts

[![npm version](https://img.shields.io/npm/v/@exdeniz/lazyenv.svg)](https://www.npmjs.com/package/@exdeniz/lazyenv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🇷🇺 Русская версия](./README_RU.md)

## ✨ Features

- 🔍 **Auto-discover** all `.env.*` files in your project
- 🎨 **Interactive TUI** built with React + Ink
- 📋 **Dual-panel interface** with live file preview
- 🎯 **Command modal** for selecting npm scripts
- 🚀 **One-click workflow**: select env → copy to `.env` → run command
- ⌨️ **Intuitive keyboard navigation**
- 🖥️ **Clean terminal experience** with alternate screen buffer

## 📸 Preview

![lazyenv preview](./screenshot.png)

## 📦 Installation

```bash
npm install -g @exdeniz/lazyenv
```

Or use directly with npx (no installation):

```bash
npx @exdeniz/lazyenv
```

## 🚀 Usage

Run in your project root:

```bash
lazyenv
```

### ⌨️ Keyboard Controls

| Key     | Action                               |
| ------- | ------------------------------------ |
| `↑↓`    | Navigate files / Scroll preview      |
| `Tab`   | Switch between panels                |
| `Enter` | Select env file & open command modal |
| `Esc`   | Close modal                          |
| `q`     | Quit                                 |

## 🔄 How It Works

1. Scans current directory for `.env.*` files
2. Displays interactive list with syntax-highlighted preview
3. On selection, copies chosen file to `.env`
4. Reads scripts from your `package.json`
5. Shows modal to select which command to run
6. Executes command with new environment variables

## 📁 File Pattern

Works with any `.env.*` files:

```
.env.local
.env.development
.env.staging
.env.production
```

## 🛠️ Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev

# Build
bun run build

# Lint
bun run lint
```

## 📋 Requirements

- Node.js >= 18

## 📄 License

MIT

---

<p align="center">Made with ❤️ by <a href="https://github.com/exdeniz">@exdeniz</a></p>
