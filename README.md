# Shinzanmono · A Walk Through Ningyocho

> An interactive reading prototype inspired by *Shinzanmono*.

[Play the current development version](https://shinzanmono-seven-days-wei.froliceric.chatgpt.site) · [中文说明](#新参者--人形町散步)

Follow Kaga as he investigates Mineko's apartment, walks through Ningyocho, visits local shops, reads the original novel, and reviews clues, suspects, and conclusions at the police station.

This project is also the first reference implementation of a reusable **Book → Interactive Reading Experience** workflow. See [SKILL.md](SKILL.md) for the generalized methodology and [AGENTS.md](AGENTS.md) for repository-specific collaboration rules.

## Contents

- [Current experience](#current-experience)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Development approach](#development-approach)
- [Book-adaptation workflow](#book-adaptation-workflow)
- [Existing checks](#existing-checks)
- [中文说明](#新参者--人形町散步)

## Current Experience

The current navigation hierarchy is:

```text
Kodenmacho Hub → Ningyocho Map → Investigation Location
```

The prototype includes:

- chapter-level suspect review;
- police-station conclusions and unresolved-clue records;
- four investigation states on the map, including revisit behavior;
- evidence in Mineko's apartment revealed progressively by chapter;
- clue-driven routes from the apartment to existing locations; and
- parallel access to location dialogue, the notebook, and full chapter reading.

The fullscreen reader preserves reading progress and bookmarks. The earlier seven-day deduction prototype remains in the repository but is not loaded by the current experience.

_Last development-log update: 2026-09-13._

## Project Structure

```text
.
├── .openai/                 Site configuration and build tooling
├── data/                    Structured game data
│   ├── characters.json     Characters and avatars
│   ├── relationships.json  Confirmed relationships (partial)
│   ├── clues.json          Current scene observations and clues
│   ├── locations.json      Locations, coordinates, characters, and reading links
│   └── phases.json         Current phases and deferred chapters
├── docs/
│   ├── GAME_FLOW.md        Implemented flow, shortcuts, and current scope
│   ├── NARRATIVE.md        Narrative principles, sources, and deferred directions
│   └── ART_DIRECTION.md    Visual guidelines and asset status
├── public/                  Novel JSON, chapters, and assets
│   └── assets/
│       ├── characters/     Character artwork
│       ├── locations/      Street and location artwork
│       └── items/          Reserved item assets
├── src/                     Static UI and runtime logic
├── tests/                   Existing behavior and data checks
├── dist/                    Generated output; do not edit directly
├── AGENTS.md                Repository collaboration rules
└── SKILL.md                 Reusable book-adaptation workflow
```

`data/*.json` is the source of truth for structured game data. `public/assets/` is the source of truth for images.

## Run Locally

Node.js 24 is recommended.

```bash
# Development server with all existing content
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview
```

The build regenerates `dist/` from `src/`, `public/`, and `data/*.json`, including `dist/game-data.mjs` for the current data-adapter layer. Original novel JSON sources live under `public/`.

> [!IMPORTANT]
> Do not edit `dist/` directly.

## Development Approach

The project is in rapid MVP iteration. Its priority is a complete reading and investigation experience implemented as simply as practical.

- Keep reading primary and uninterrupted.
- Reuse existing components, data, assets, routes, and state.
- Prefer simple V1 solutions over speculative architecture.
- Avoid unrelated refactoring during feature iteration.
- Use manual testing as the primary validation method for rapid UI/UX work.
- Keep deeper deduction mechanics in the police station rather than interrupting the reader.
- Use the map for revisiting locations, NPCs, and potentially overlooked details.

## Book-Adaptation Workflow

The reusable methodology is documented in [SKILL.md](SKILL.md):

```text
Book → Ingest → Narrative Model → Interaction Analysis → Adaptation Plan
     → Human Review → Structured Data → Asset Planning → Implementation → Validation
```

The workflow separates understanding the book, designing the adaptation, and implementing the application. For a new book, the goal is to replace the source, narrative data, adaptation configuration, and assets—not redesign the entire app.

## Existing Checks

Existing behavior and data checks are available under `tests/`. They are optional during MVP development unless a change specifically requires them.

```bash
node tests/walk.mjs
node tests/camera.mjs
node tests/movement.mjs
node tests/shortcuts.mjs
node tests/location-reading.mjs
node tests/game.mjs
```

Additional project documentation:

- [Game flow](docs/GAME_FLOW.md)
- [Narrative principles and sources](docs/NARRATIVE.md)
- [Art direction and asset status](docs/ART_DIRECTION.md)
- [Reusable adaptation methodology](SKILL.md)

---

# 新参者 · 人形町散步

> 以《新参者》为蓝本的交互阅读原型。

[试玩当前开发版本](https://shinzanmono-seven-days-wei.froliceric.chatgpt.site) · [English](#shinzanmono--a-walk-through-ningyocho)

跟随加贺调查峰子公寓、漫游人形町、访问店家、阅读原著，并在警局复核嫌疑与归档判断。

本项目也是「**书籍 → 交互阅读体验**」可复用开发流程的首个参考实现。通用方法见 [SKILL.md](SKILL.md)，仓库内的 Agent 协作规则见 [AGENTS.md](AGENTS.md)。

## 当前体验

当前导航层级为：

```text
小传马町 Hub → 人形町地图 → 调查地点
```

原型目前包括：

- 按章节复核嫌疑人；
- 在警局归档结论与未解疑点；
- 地图上的四种调查状态及重访行为；
- 峰子公寓随当前章节逐步展示证物；
- 根据发现的线索，从公寓进入已有地点；
- 并列进入店内对话、手帐和第 N 章全文。

全文使用全屏阅读器，并保留阅读进度和书签。早期七日推理版本仍保存在仓库中，但当前体验不会加载。

_最近一次开发日志更新：2026-09-13。_

## 目录结构

```text
.
├── .openai/                 站点配置与构建工具
├── data/                    结构化游戏数据
├── docs/                    流程、叙事与视觉文档
├── public/                  原著 JSON、章节与素材
│   └── assets/              人物、地点与物品素材
├── src/                     静态界面与运行逻辑
├── tests/                   现有行为与数据检查
├── dist/                    构建产物；不要直接编辑
├── AGENTS.md                仓库内的 Agent 协作规则
└── SKILL.md                 可复用的书籍改编流程
```

结构化游戏数据以 `data/*.json` 为准，图片以 `public/assets/` 为准。

## 本地运行

建议使用 Node.js 24。

```bash
# 启动开发环境并访问全部现有内容
npm run dev

# 生成生产构建
npm run build

# 本地预览生产构建
npm run preview
```

构建工具会根据 `src/`、`public/` 和 `data/*.json` 重新生成 `dist/`，其中包括供当前数据适配层使用的 `dist/game-data.mjs`。原著 JSON 位于 `public/`。

> [!IMPORTANT]
> 不要直接编辑 `dist/`。

## 开发原则

项目目前处于快速 MVP 迭代阶段，优先用最简单可行的方式完成阅读与调查体验。

- 保持阅读体验优先且不中断。
- 尽量复用现有组件、数据、素材、路由和状态。
- 优先简单的 V1 方案，避免过早设计扩展架构。
- 功能迭代时避免无关重构。
- 快速 UI/UX 开发以人工验证为主。
- 深层推理机制主要放在警局，避免打断阅读器。
- 地图主要用于重访地点、NPC 和阅读时可能遗漏的细节。

## 可复用的书籍改编流程

完整方法见 [SKILL.md](SKILL.md)：

```text
原著 → 解析 → 叙事模型 → 交互机会分析 → 改编方案
     → 人工确认 → 结构化数据 → 素材规划 → 实现 → 验证
```

这套流程将理解原著、设计改编和实现应用分开。制作下一本书时，原则上主要替换原始内容、叙事数据、改编配置和素材，而不是重新设计整个应用。

## 现有检查

现有行为和数据检查位于 `tests/`。MVP 开发期间，除非某项修改明确需要，否则不强制运行。

```bash
node tests/walk.mjs
node tests/camera.mjs
node tests/movement.mjs
node tests/shortcuts.mjs
node tests/location-reading.mjs
node tests/game.mjs
```

更多项目文档：

- [已实现流程、快捷键和范围](docs/GAME_FLOW.md)
- [叙事原则与来源](docs/NARRATIVE.md)
- [视觉规范与素材状态](docs/ART_DIRECTION.md)
- [可复用的书籍改编方法](SKILL.md)
