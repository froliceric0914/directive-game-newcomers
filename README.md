![Development progress — 100%](docs/development-progress.svg)

[Current development version](https://shinzanmono-seven-days-wei.froliceric.chatgpt.site)
[试玩已发布版本](https://shinzanmono-seven-days-wei.froliceric.chatgpt.site)

- AGENTS.md → how agents work inside this repository
- SKILL.md → reusable book → interactive reading experience methodology for future books

# Shinzanmono · A Walk Through Ningyocho

An interactive reading prototype inspired by Shinzanmono. Follow Kaga as he investigates Mineko’s apartment, walks through Ningyocho, visits local shops, reads the original novel, and reviews clues, suspects, and conclusions at the police station.

This project also serves as the first reference implementation for a reusable Book → Interactive Reading Experience development workflow.

See SKILL.md⁠￼ for the generalized methodology extracted from this project, including book ingestion, narrative modeling, interaction design, structured data generation, asset planning, implementation, and validation.

## Development Log

2026-09-13 — Established the navigation hierarchy of Kodenmacho Hub → Ningyocho Map → Investigation Location. Added chapter-level suspect review, police-station conclusions and unresolved-clue records, four investigation states on the map, and revisit behavior. Mineko’s apartment now reveals evidence progressively according to the current chapter and can lead the reader into existing locations through discovered clues. In-location dialogue, notebook access, and full Chapter N reading are now parallel entry points. Full-text reading continues to use the existing fullscreen reader with saved reading progress and bookmarks.

## Project Structure

.openai/ Existing site configuration and build.mjs tooling
src/ Static UI and runtime logic source
dist/ Build output only; do not edit directly
tests/ Existing behavior and data checks
AGENTS.md Collaboration and repository-specific agent rules
SKILL.md Reusable book → interactive reading workflow
README.md
docs/
GAME_FLOW.md Implemented flow, shortcuts, and current scope
NARRATIVE.md Narrative principles, sources, and deferred directions
ART_DIRECTION.md Visual guidelines and asset status
data/
characters.json Characters and avatars
relationships.json Confirmed character relationships (partial)
clues.json Current scene observations / clues
locations.json Locations, map coordinates, characters, and full-text links
phases.json Current phases and deferred chapters
public/ Novel JSON, chapters/, and assets/
assets/
characters/ kaga/casual.png, kaga/formal.png, mineko.png, etc.
locations/ Existing street and location artwork
items/ Reserved item assets

## Editing and Running

Treat data/\*.json as the source of truth for structured game data and public/assets/ as the source of truth for images.

Development with all existing content accessible:

`npm run dev`

Production build:

`npm run build`

Local production preview:

`npm run preview`

The build tooling regenerates the full dist/ output from src/, public/, and data/\*.json.

Node.js 24 is recommended for local development.

UI and runtime logic live in src/ and intentionally remain in the existing plain JavaScript/CSS structure. The build step generates dist/game-data.mjs for the current data-adapter layer. Original novel JSON sources live under public/.

Do not edit dist/ directly.

## Development Approach

The project is currently in rapid MVP iteration.

The priority is to build the complete reading and investigation experience with the smallest practical implementation before investing in deeper architecture or optimization.

### Current principles:

- Keep the reading experience primary and uninterrupted.
- Reuse existing components, data, assets, routes, and state wherever possible.
- Prefer simple V1 solutions over speculative or highly extensible architecture.
- Avoid unrelated refactoring during feature iteration.
- Use manual testing as the primary validation method during rapid UI/UX development.
- Existing unit tests are retained but are not expected to be updated or run for every MVP change.
- Deeper deduction mechanics belong primarily in the police station rather than interrupting the Reader.
- The map focuses on revisiting locations, NPCs, and details that may have been overlooked while reading.

### Reusable Book-Adaptation Workflow

The development experience from Shinzanmono has been abstracted into SKILL.md⁠ so that the same process can be reused when starting from a new book.

At a high level:

BOOK
↓
Ingest
↓
Narrative Model
↓
Interaction Analysis
↓
Adaptation Plan
↓
Human Review
↓
Structured Data
↓
Asset Planning
↓
Implementation
↓
Validation

The skill intentionally separates understanding the book, designing the adaptation, and implementing the application.

SKILL.md is the reusable methodology across books. AGENTS.md remains specific to collaboration and development rules inside this repository.

Existing Checks

The repository contains existing behavior and data checks under tests/.

They can be run when needed:

node tests/walk.mjs
node tests/camera.mjs
node tests/movement.mjs
node tests/shortcuts.mjs
node tests/location-reading.mjs
node tests/game.mjs

During current MVP development, these checks are optional unless a change specifically requires them.

See GAME_FLOW⁠￼ for the implemented user flow, NARRATIVE⁠￼ for narrative principles and source notes, ART_DIRECTION⁠￼ for visual direction and asset status, and SKILL.md⁠￼ for the reusable book-adaptation workflow.

The earlier seven-day deduction prototype is preserved in the repository but is not loaded by the current experience.

⸻

# 新参者 · 人形町散步

以《新参者》为蓝本的交互阅读原型：跟随加贺调查峰子公寓、漫游人形町、访问店家、阅读原著，并在警局复核嫌疑与归档判断。

本项目同时作为一套可复用的 「书籍 → 交互阅读体验」 开发流程的第一个参考实现。

完整方法已整理至 SKILL.md⁠￼，包括原著解析、叙事模型、交互设计、结构化数据、素材规划、实现与验证，可用于之后将新的书籍转换为交互阅读项目。

## 开发日志

2026-09-13 — 确立“小传马町 Hub → 人形町地图 → 调查地点”的导航层级；完成章节嫌疑复核、警局结论/疑点档案、地图四种调查状态与重访行为；峰子公寓开始按当前章节逐步展示证物，并可沿线索进入既有地点；店内对话、手帐和第 N 章全文改为并列入口，全文继续使用可续读、可书签的全屏阅读器。

## 目录

.openai/ 现有站点配置与 build.mjs 同步工具
src/ 静态界面与运行逻辑源文件
dist/ 仅构建产物，不直接编辑
tests/ 行为与数据检查
AGENTS.md 当前仓库的 Agent 协作规则
SKILL.md 可复用的书籍 → 交互阅读开发流程
README.md
docs/
GAME_FLOW.md 已实现流程、快捷键和范围
NARRATIVE.md 叙事原则、来源与暂缓方向
ART_DIRECTION.md 视觉规范和素材状态
data/
characters.json 人物与头像
relationships.json 已确定的人物关系（部分）
clues.json 当前场景的见闻
locations.json 地点、地图坐标、人物和全文关联
phases.json 当前阶段与暂缓章节
public/ 原著 JSON、chapters/ 及 assets/
assets/
characters/ kaga/casual.png、kaga/formal.png、mineko.png 等
locations/ 已有街景；公寓和办公室素材待提供
items/ 物品素材预留

## 编辑与运行

数据以 data/\*.json 为准，图片以 public/assets/ 为准。调整后运行：

node .openai/build.mjs
python3 -m http.server 4173 --directory dist

打开 http://127.0.0.1:4173/。

构建工具无第三方依赖；从 src/、public/ 和 data/\*.json 重新生成整个 dist/。运行与测试建议使用 Node.js 24。

界面与运行逻辑位于 src/，保持原来的纯 JavaScript/CSS 结构。构建生成 dist/game-data.mjs 供现有数据适配模块读取。原著 JSON 的来源位于 public/。

不要直接编辑 dist/。

### 可复用开发方法

《新参者》的开发过程已经进一步抽象到 SKILL.md⁠￼。

原著
↓
解析
↓
叙事模型
↓
交互机会分析
↓
改编方案
↓
人工确认
↓
结构化数据
↓
素材规划
↓
实现
↓
验证

其中：

- SKILL.md 负责跨书籍复用的方法论；
- AGENTS.md 负责当前仓库内的 Agent 协作与开发规则；
- docs/ 记录《新参者》这个具体项目的流程、叙事和视觉设计；
- data/ 保存当前作品的结构化游戏内容；
- src/ 负责运行这些内容。

这样下一本书原则上应主要替换：

source

- narrative data
- adaptation configuration
- assets

而不是重新设计整个应用。

## 验证

先运行构建，再运行现有测试（测试仍检查构建产物）。

node tests/walk.mjs
node tests/camera.mjs
node tests/movement.mjs
node tests/shortcuts.mjs
node tests/location-reading.mjs
node tests/game.mjs

流程说明见 GAME_FLOW⁠￼，叙事与来源见 NARRATIVE⁠￼，美术与缺失素材见 ART_DIRECTION⁠￼，跨书籍复用的开发方法见 SKILL.md⁠￼。

早期七日推理版本代码保留，但不在当前页面加载。
