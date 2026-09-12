# 美术方向

保留当前日式和风：米色纸张、低饱和鼠尾草绿、棕红印章点缀、宋体标题。地图简洁，文字和触控目标优先于装饰。避免依靠向下滚动完成店内交互。

## 人物

- 原始可编辑素材：`public/assets/characters/`。
- 加贺：`kaga/casual.png`、`kaga/formal.png`；原先的双人着装参考保存在 `kaga/reference.jpg`。
- 其他人物按稳定 ID 命名，如 `mineko.png`、`miyuki.png`、`naho.png`。
- 使用用户提供的全部 24 张头像；现有对话只显示加贺便装与菜穗。
- 卡片左右插入人物，完整适配图片；说话人提高视觉强调。减少动态效果偏好下停用进场动画。

## 地点与物品

- `public/assets/locations/street.png` 是早期版本已有的艺术化街景，不是实景。
- `mineko-apartment.png`、`police-office.png`、`kishida-office.png` 等尚无已提供素材，暂不创建空白或伪造 PNG。
- `public/assets/items/` 为后续物品图片预留，当前为空。
- 新增图片前核对原著情节和人物归属，不因文件名预留而添加游戏事件。

## 发布副本

`public/assets/` 是素材来源；运行 `.openai/build.mjs` 将其同步到 `dist/assets/`。只在源目录修改素材。运行时引用 `assets/...`，保持 `dist/` 可独立作为静态站点提供服务。
