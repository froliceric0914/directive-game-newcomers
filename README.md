![Development progress](docs/development-progress.svg)

<!-- 每日更新：修改 docs/development-progress.svg 中标注的百分比和目标宽度。 -->

# 新参者 · 人形町散步

以《新参者》为蓝本的交互阅读原型：操纵加贺漫游街区，访问仙贝店、记录见闻，并按地点分页阅读原著。当前不启用推理判定或章节解锁。

## 目录

```text
.openai/                   现有站点配置与 build.mjs 同步工具
 src/                      静态界面与运行逻辑源文件
 dist/                     仅构建产物，不直接编辑
 tests/                    行为与数据检查
 AGENTS.md                 协作流程规则
 README.md
 docs/
   GAME_FLOW.md            已实现流程、快捷键和范围
   NARRATIVE.md            叙事原则、来源与暂缓方向
   ART_DIRECTION.md        视觉规范和素材状态
 data/
   characters.json         人物与头像
   relationships.json      已确定的人物关系（部分）
   clues.json              当前场景的见闻
   locations.json          地点、地图坐标、人物和全文关联
   phases.json             当前阶段与暂缓章节
 public/                   原著 JSON、chapters/ 及 assets/
   assets/
     characters/             kaga/casual.png、kaga/formal.png、mineko.png 等
     locations/            已有街景；公寓和办公室素材待提供
     items/                物品素材预留
```

## 编辑与运行

数据以 `data/*.json` 为准，图片以 `public/assets/` 为准。调整后运行：

```sh
node .openai/build.mjs
python3 -m http.server 4173 --directory dist
```

打开 http://127.0.0.1:4173/ 。构建工具无第三方依赖；从 `src/`、`public/` 和 `data/*.json` 重新生成整个 `dist/`。运行与测试建议使用 Node.js 24。

界面与运行逻辑位于 `src/`，保持原来的纯 JavaScript/CSS 结构。构建生成 `dist/game-data.mjs` 供现有数据适配模块读取。原著 JSON 的来源位于 `public/`。不要直接编辑 `dist/`。

## 验证

先运行构建，再运行现有测试（测试仍检查构建产物）。

```sh
node tests/walk.mjs
node tests/camera.mjs
node tests/movement.mjs
node tests/shortcuts.mjs
node tests/location-reading.mjs
node tests/game.mjs
```

流程说明见 [GAME_FLOW](docs/GAME_FLOW.md)，叙事与来源见 [NARRATIVE](docs/NARRATIVE.md)，美术与缺失素材见 [ART_DIRECTION](docs/ART_DIRECTION.md)。早期七日推理版本代码保留，但不在当前页面加载。
