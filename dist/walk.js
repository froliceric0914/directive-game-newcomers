import { portraitFor } from "./npcs.mjs";
import { chapters } from "./location-reading.mjs";
import { createMovement } from "./movement.mjs";
import { createVisit } from "./visit.mjs";
import { zoomCameraFrame } from "./camera.mjs";
import {
  start,
  locations,
  ningyochoLocations,
  step,
  nearby,
} from "./walk-map.mjs";
import {
  clues,
  locations as storyLocations,
  suspectReview,
  minekoApartmentEvidence,
  ch1Day,
  ch1Night,
} from "./game-data.mjs";
import {
  currentChapterNumber,
  storyProgress,
  visibleEvidence,
} from "./location-state.mjs";
import { isDevMode } from "./runtime-config.mjs";
import {
  dialogueStateForMapState,
  mapLocationIdForStory,
  mapLocationIdsForChapter,
  trackerLocationForOrder,
} from "./story-locations.mjs";
import { readCh1Progress, writeCh1Progress } from "./ch1-progress.mjs";
let player = { ...start },
  steps = 0,
  lastLocation = "";
const $ = (s) => document.querySelector(s),
  escape = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const esc = escape;
const kodemmachoLocations = locations.filter(
  (location) => location.mapArea === "kodemmacho",
);
const devAccessKey = "devAccessMode";
const devProgressKey = "devPreviewChapter";
let devAccessMode = isDevMode
    ? (localStorage.getItem(devAccessKey) ?? "all")
    : "progress",
  devFullAccess = devAccessMode === "all",
  devPreviewChapter = Math.min(
    suspectReview.chapters.length,
    Math.max(1, Number(localStorage.getItem(devProgressKey)) || 1),
  );
$("#app").innerHTML =
  `<header class="header"><div class="brand-mark">新</div><div><h1>人形町散步</h1><p>在街道与书页之间</p></div><div class="header-end"><span class="edition">新参者 · 阅读漫游</span><button class="text-button" id="open-reading" aria-keyshortcuts="r">打开书页 <kbd>R</kbd></button></div></header><main><section class="map-panel"><div class="map-heading"><div><span class="eyebrow">NIHONBASHI · NINGYOCHO</span><h2>日本桥，人形町。</h2></div><div class="map-tools"><span class="map-tag">街区导览图</span><div class="zoom-controls" role="group" aria-label="地图缩放"><button id="zoom-out" aria-label="缩小地图" aria-keyshortcuts="-">−</button><output id="zoom-level" aria-live="polite">100%</output><button id="zoom-in" aria-label="放大地图" aria-keyshortcuts="+ =">+</button></div></div></div><div class="map-scroll" tabindex="0" role="region" aria-label="人形町地图，长按方向键连续移动加贺警官"><div id="map"><div class="road vertical"></div><div class="road horizontal"></div><div class="street-label">甘 酒 横 丁</div><div class="north-label">↑ 小传马町方向</div><div class="east-label">滨町公园 →</div><div class="station">人形町站<span>出发点</span></div>${ningyochoLocations.map((l) => `<div class="shop ${l.npc ? "" : "landmark"}" data-shop="${l.id}" style="--x:${l.x};--y:${l.y};--w:${l.w};--h:${l.h}"><span class="shop-number">${l.trackerOrder == null ? "" : String(l.trackerOrder).padStart(2, "0")}</span><strong>${l.name}</strong><small>${l.kind}</small></div><div class="entrance" style="--x:${l.door.x};--y:${l.door.y}" aria-label="${l.name}入口">${l.npc ? '<span class="npc" title="' + l.npc + '">店</span>' : "◇"}</div>`).join("")}<div id="player" aria-label="加贺警官"><img src="${portraitFor("kaga", "map")}" alt="" draggable="false"></div></div></div><div class="map-caption"><span><i class="legend player-key"></i>加贺 <i class="legend npc-key"></i>店家 <i class="legend road-key"></i>街道</span><span>依参考图绘制 · 非等比例</span></div><div class="walking-bar"><div><span class="eyebrow">正在漫游</span><p id="walking-place">人形町站</p><small id="walk-hint" role="status" aria-live="polite">沿街走近一家店。</small></div><div class="move-controls"><span class="keyboard-hint">长按方向键连续移动</span><div class="dpad">${[
    [0, -1, "↑", "上"],
    [-1, 0, "←", "左"],
    [0, 1, "↓", "下"],
    [1, 0, "→", "右"],
  ]
    .map(
      ([x, y, s, n]) =>
        `<button data-dx="${x}" data-dy="${y}" aria-keyshortcuts="${x === 1 ? "ArrowRight" : x === -1 ? "ArrowLeft" : y === 1 ? "ArrowDown" : "ArrowUp"}" aria-label="向${n}移动一格">${s}</button>`,
    )
    .join(
      "",
    )}</div><button class="visit-button" id="visit" aria-keyshortcuts="e" disabled>访问店家 <kbd>E</kbd></button><button class="reset" id="reset" aria-keyshortcuts="h">回到车站 <kbd>H</kbd></button></div></div></section><details class="notebook" id="notebook" open><summary aria-keyshortcuts="j"><span>随身手帐</span><span class="notebook-toggle">展开 / 收起 <kbd>J</kbd></span></summary><div class="notebook-body"><div class="notebook-title"><span class="eyebrow">KAGA'S NOTEBOOK</span><span class="page-no">01</span></div><div class="place-index" id="place-index">出发地</div><h2 id="location">人形町站</h2><p class="place-description" id="place-description">从十字路口开始，慢慢认识这条街。</p><div class="location-note"><span class="eyebrow">此刻所见</span><p id="place-note">走近店门，手帐会翻到这家店。</p></div><div class="reading-card"><span class="eyebrow">翻开原著</span><h3 id="place-reading-title">仙贝店的女孩</h3><p id="place-reading-description">从一段祖孙的家常话开始。</p><button class="primary" id="read-sample" aria-keyshortcuts="r">阅读开篇 <kbd>R</kbd></button><small id="place-reading-note">第一章开篇试读。</small></div><div class="notebook-foot"><span>加贺恭一郎</span><span id="steps">0 步</span></div></div></details></main><footer><div class="shortcut-guide"><span><kbd>↑ ↓ ← →</kbd> 移动</span><span><kbd>E</kbd> 访问店家</span><span><kbd>J</kbd> 开关手帐</span><span><kbd>R</kbd> 阅读</span><span><kbd>+ / −</kbd> 地图缩放</span><span><kbd>H</kbd> 回到车站</span><span><kbd>Esc</kbd> 关闭</span></div><span>地图与阅读体验预览</span></footer>`;
const detailScreen = $("main");
detailScreen.id = "ningyocho-screen";
detailScreen.hidden = true;
detailScreen
  .querySelector(".map-panel")
  .insertAdjacentHTML(
    "afterbegin",
    '<button class="map-back" data-screen="kodemmacho">← 返回小传马町</button><section class="story-progress compact" id="map-story-progress" aria-label="故事进度"></section>',
  );
detailScreen
  .querySelector(".map-panel")
  .insertAdjacentHTML(
    "beforeend",
    '<div class="area-switcher map-area-switcher"><button data-screen="ningyocho" class="active">人形町</button><button data-screen="kodemmacho">小传马町</button><button data-screen="police">警局</button></div>',
  );
$(".header").outerHTML =
  `<header class="case-header"><div class="case-brand"><div class="brand-mark">新</div><div><h1>新参者 <span>人形町纪事</span></h1><p>NIHONBASHI · A NEIGHBORHOOD MYSTERY</p></div></div><div class="case-status"><div>六月 · 调查第 <strong>01</strong> 天 / 07</div><div class="stamina" aria-label="六点精力"><i></i><i></i><i></i><i></i><i></i><i></i><span>6 / 6 精力</span></div><button class="text-button" id="guide">玩法与说明 ⓘ</button></div></header>${isDevMode ? `<aside class="dev-tools" aria-label="开发访问模式"><span class="dev-mode-switch" role="group"><b>DEV</b><button data-dev-access="progress" aria-pressed="${devAccessMode === "progress"}">正常进度</button><button data-dev-access="select" aria-pressed="${devAccessMode === "select"}">自由选择</button><button data-dev-access="all" aria-pressed="${devAccessMode === "all"}">解锁全部</button></span><label class="dev-progress-select" ${devAccessMode === "select" ? "" : "hidden"}>当前章节 <select id="dev-progress-select">${suspectReview.chapters.map((chapter, index) => `<option value="${index + 1}" ${devPreviewChapter === index + 1 ? "selected" : ""}>${String(index + 1).padStart(2, "0")} · ${escape(chapter.title)}</option>`).join("")}</select></label></aside>` : ""}`;
detailScreen.insertAdjacentHTML(
  "beforebegin",
  `<nav class="case-tabs" aria-label="调查功能"><button data-top="roam" class="active">街区漫游</button><button data-top="notes">调查手帐 <b>1</b></button><button data-top="deduction">线索推理</button></nav><main class="hub-screen" id="hub-screen"><section class="hub-scene"><div class="hub-copy"><span>日本桥 / INVESTIGATION HUB</span><h2>人形町纪事</h2><p>七日循迹，在人形町的街巷中，寻找散落其中的线索，逐步揭开真相。</p></div><div class="area-switcher"><button data-screen="ningyocho">人形町</button><button data-screen="kodemmacho">小传马町</button><button data-screen="police">警局</button></div></section></main><main class="area-screen" id="kodemmacho-screen" hidden><section class="area-scene reading-home"><div class="area-copy"><span>小传马町 / STORY PROGRESS</span><h2>沿着峰子的足迹阅读。</h2><p>章节是故事进度；街区地图帮助你找到下一段故事发生的地方。</p></div><div class="reading-dashboard"><section class="story-progress hero" id="hub-story-progress" aria-label="故事进度"></section><div class="apartment-return"><div><small id="apartment-state">调查据点</small><strong>峰子公寓</strong><span id="apartment-copy">随时返回查看已经发现的线索。</span></div><button data-screen="apartment">进入公寓</button></div></div><section class="kodemmacho-location-map" aria-label="小传马町调查地图"><header><small>KODEMMACHO · INVESTIGATION MAP</small><strong>后续调查地点</strong></header><div class="kodemmacho-map-grid">${kodemmachoLocations.map((location) => `<button data-kodemmacho-location="${location.id}"><span class="kodemmacho-map-marker">${location.trackerOrder == null ? "•" : String(location.trackerOrder).padStart(2, "0")}</span><strong>${escape(location.name)}</strong><small>${escape(location.kind)}</small><em class="location-status"></em></button>`).join("")}</div></section><div class="area-switcher"><button data-screen="ningyocho">人形町</button><button data-screen="kodemmacho" class="active">小传马町</button><button data-screen="police">警局</button></div><p class="area-status" role="status">阅读与调查进度会保存在当前浏览器。</p></section></main><main class="police-screen" id="police-screen" hidden><button class="back-hub" data-screen="hub">← 返回调查 Hub</button><div class="area-copy"><span>日本桥署 / POLICE STATION</span><h2>把事实放在一起。</h2><p>这里将用于整理线索与人物关系。正式推理机制将在后续加入。</p></div><div class="police-grid"><article><small>CLUES</small><h3>收集的线索</h3><p>查看从街区与调查地点带回的事实。</p></article><article><small>RELATIONSHIPS</small><h3>人物与关系</h3><p>确认人与地点之间已经查明的联系。</p></article><article><small>SUMMARY</small><h3>调查总结</h3><p>记录当前问题，并决定下一步调查方向。</p></article></div><div class="area-switcher"><button data-screen="ningyocho">人形町</button><button data-screen="kodemmacho">小传马町</button><button data-screen="police" class="active">警局</button></div></main>`,
);
$("#kodemmacho-screen .back-hub")?.remove();
$("#police-screen").innerHTML =
  `<button class="back-hub" data-screen="hub">← 返回调查 Hub</button><div class="area-copy"><span>日本桥署 / POLICE STATION</span><h2>嫌疑复核与警局档案</h2><p>根据已经取得的事实作出调查判断。</p></div><section class="suspect-review" id="suspect-review"></section><section class="police-archive"><div class="archive-head"><div><small>POLICE ARCHIVE</small><h3>警局档案</h3></div><div class="archive-tabs"><button data-archive="all" class="active">全部</button><button data-archive="doubt">疑点</button><button data-archive="conclusion">结论</button></div></div><div id="archive-list"></div></section><div class="area-switcher"><button data-screen="ningyocho">人形町</button><button data-screen="kodemmacho">小传马町</button><button data-screen="police" class="active">警局</button></div>`;
$("#police-screen .back-hub").dataset.screen = "kodemmacho";
$("#police-screen").insertAdjacentHTML(
  "afterend",
  `<main class="evidence-screen" id="apartment-screen" hidden><button class="back-hub" data-screen="kodemmacho">← 返回小传马町</button><div class="apartment-layout"><section class="apartment-scene"><header class="evidence-heading"><small>CRIME SCENE · MINEKO APARTMENT</small><h2>峰子公寓</h2><p>45岁的峰子独居在这里。房间整洁明亮，仍留着她生活的气息。</p></header><div class="apartment-image" role="img" aria-label="峰子公寓室内调查场景"><div id="evidence-hotspots"></div></div><div class="scene-guidance"><span>ⓘ 点击场景中的放大镜，查看当前发现的证物。随着故事推进，可以再次返回调查。</span></div></section><section class="evidence-panel"><header><small>INVESTIGATION NOTES</small><h2>收集到的线索</h2><p>${escape(minekoApartmentEvidence.ui.description)}</p></header><nav class="evidence-tabs"><button data-evidence-tab="current" class="active">当前线索</button><button data-evidence-tab="resolved">已厘清</button></nav><section id="apartment-evidence"></section></section></div></main>`,
);
$(".apartment-image").setAttribute("role", "group");
const viewport = $(".map-scroll");
const stage = document.createElement("div");
stage.className = "camera-stage";
$("#map").before(stage);
stage.append($("#map"));
let visual = { ...player },
  camera = null,
  zoom = 1;
function followPlayer() {
  const frame = zoomCameraFrame(
    visual,
    nearby(player),
    viewport.clientWidth,
    zoom,
  );
  stage.style.width = 928 * frame.zoom + "px";
  stage.style.height = 672 * frame.zoom + "px";
  $("#map").style.transform = `scale(${frame.zoom})`;
  $("#map").style.left = frame.padding + "px";
  $("#map").style.top = frame.padding + "px";
  stage.style.padding = frame.padding + "px";
  $("#zoom-level").textContent = Math.round(frame.zoom * 100) + "%";
  $("#zoom-level").title =
    frame.zoom < zoom
      ? "为完整显示店铺，暂时调整缩放；离开后恢复 " +
        Math.round(zoom * 100) +
        "%"
      : "地图缩放";
  camera ??= { left: frame.left, top: frame.top };
  camera.left += (frame.left - camera.left) * 0.24;
  camera.top += (frame.top - camera.top) * 0.24;
  viewport.scrollLeft = camera.left;
  viewport.scrollTop = camera.top;
}
new ResizeObserver(() => {
  camera = null;
  followPlayer();
}).observe(viewport);
const reader = $("#modal");
function stop() {
  movement.clear();
}
let savedReviews = {};
try {
  savedReviews = JSON.parse(localStorage.getItem("suspectReviews") || "{}");
} catch {}
let discoveredApartmentEvidence = new Set(),
  storyReadyReviews = new Set();
try {
  discoveredApartmentEvidence = new Set(
    JSON.parse(localStorage.getItem("discoveredApartmentEvidence") || "[]"),
  );
} catch {}
if (
  localStorage.getItem("storyProgress:minekoApartment") === "complete" &&
  !discoveredApartmentEvidence.has("insurance_material")
) {
  discoveredApartmentEvidence.add("insurance_material");
  localStorage.setItem(
    "discoveredApartmentEvidence",
    JSON.stringify([...discoveredApartmentEvidence]),
  );
  localStorage.removeItem("storyProgress:minekoApartment");
}
try {
  storyReadyReviews = new Set(
    JSON.parse(localStorage.getItem("storyReadyReviews") || "[]"),
  );
} catch {}
const collectedClues = new Set(),
  reviewById = Object.fromEntries(
    suspectReview.chapters.map((chapter) => [chapter.chapterId, chapter]),
  );
let selectedReview = null,
  reviewChapterScroll = 0,
  archiveFilter = "all",
  evidenceTab = "current";
let ch1NightStage = readCh1Progress().nightCompleted ? 6 : 0,
  ch1NoteCount = 1;
let dismissedArchiveDoubts = new Set();
try {
  dismissedArchiveDoubts = new Set(
    JSON.parse(localStorage.getItem("dismissedArchiveDoubts") || "[]"),
  );
} catch {}
const chapterLabelExceptions = { ch06: "樱花筷子", ch09: "日本桥警署" };
const storyNodes = suspectReview.chapters.map((chapter, index) => {
  const trackerLocation = trackerLocationForOrder(index + 1);
  return {
    id: chapter.chapterId,
    label:
      trackerLocation?.name ??
      chapterLabelExceptions[chapter.chapterId] ??
      chapter.title.replace(
        /的(?:女孩|小伙计|媳妇|狗|店员|社长|顾客|刑警)$/,
        "",
      ),
    chapterId: index + 1,
    locationId: mapLocationIdForStory(trackerLocation?.id),
    linkedLocationIds: mapLocationIdsForChapter(index + 1),
    screen: trackerLocation ? null : (chapter.screen ?? null),
  };
});
function storyStarted() {
  return (
    discoveredApartmentEvidence.has("insurance_material") ||
    Object.keys(savedReviews).length > 0 ||
    storyReadyReviews.size > 0
  );
}
function readingReviews() {
  return {
    ...savedReviews,
    ...Object.fromEntries([...storyReadyReviews].map((id) => [id, "read"])),
  };
}
function storySnapshot() {
  if (devAccessMode === "select")
    return {
      started: true,
      complete: false,
      currentIndex: devPreviewChapter - 1,
      total: suspectReview.chapters.length,
    };
  return storyProgress(
    readingReviews(),
    storyStarted(),
    suspectReview.chapters.length,
  );
}
function currentStoryNode() {
  const snapshot = storySnapshot();
  return snapshot.complete ? null : storyNodes[snapshot.currentIndex];
}
function storyNodeState(node, index) {
  if (devAccessMode === "select")
    return index < devPreviewChapter - 1
      ? "completed"
      : index === devPreviewChapter - 1
        ? "current"
        : "future";
  if (readingReviews()[node.id]) return "completed";
  return index === storySnapshot().currentIndex ? "current" : "future";
}
function storyNodeReveal(index, snapshot) {
  if (devFullAccess) return "";
  if (index < snapshot.currentIndex || index === snapshot.currentIndex)
    return "";
  const distance = index - (snapshot.currentIndex ?? -1);
  return distance === 1
    ? "preview-one"
    : distance === 2
      ? "preview-two"
      : "mystery";
}
function storyProgressMarkup(compact = false) {
  const snapshot = storySnapshot(),
    current = currentStoryNode();
  const track = storyNodes
    .map((node, index) => {
      const state = storyNodeState(node, index),
        reveal = storyNodeReveal(index, snapshot),
        mystery = reveal === "mystery",
        number = String(index + 1).padStart(2, "0"),
        connector =
          index < storyNodes.length - 1
            ? `<i class="${snapshot.started && index < snapshot.currentIndex ? "completed" : ""}" aria-hidden="true"></i>`
            : "";
      return `<button class="story-node ${state} ${reveal}" data-story-node="${node.id}" ${state === "future" && !devFullAccess ? "disabled" : ""} ${state === "current" ? 'aria-current="step"' : ""} ${mystery ? `aria-label="${number} 后续章节，待探索"` : ""}>${state === "current" && !compact ? `<span class="story-avatar"><img src="${portraitFor("kaga", "map")}" alt="加贺当前所在章节"></span>` : ""}<span class="story-dot" aria-hidden="true"></span><span class="story-label"><small>${number}</small><strong>${mystery && compact ? "待探索" : mystery ? "&nbsp;" : esc(node.label)}</strong></span></button>${connector}`;
    })
    .join("");
  if (compact) return `<div class="story-track">${track}</div>`;
  const heading = `<header><div><small>STORY PROGRESS</small></div><b>${snapshot.started ? (snapshot.complete ? snapshot.total : snapshot.currentIndex + 1) : 0} / ${snapshot.total}</b></header>`;
  const place =
    current && locations.find((item) => item.id === current.locationId);
  const actions = current
    ? compact
      ? place
        ? `<button class="story-map-action" data-story-map>定位 ${esc(place.name)}</button>`
        : `<button class="primary" data-story-read>继续阅读</button>`
      : `<div class="story-actions"><button class="primary" data-story-read>继续阅读</button>${place ? '<button class="story-map-action" data-story-map>前往地图探索</button>' : ""}</div>`
    : "";
  const currentCard = current
    ? `<div class="current-story"><div class="current-story-label"><span>当前章节</span><strong> · ${esc(current.label)}</strong></div>${actions}</div>`
    : snapshot.complete
      ? '<div class="current-story complete"><span>故事进度</span><strong>已完成全部章节</strong></div>'
      : '<div class="current-story story-start"><span>故事起点</span><strong>先在峰子公寓查看田仓的名片</strong><button class="primary" data-story-apartment>前往峰子公寓</button></div>';
  return heading + `<div class="story-track">${track}</div>` + currentCard;
}
function renderStoryProgress() {
  for (const [id, compact] of [
    ["#hub-story-progress", false],
    ["#map-story-progress", true],
  ]) {
    const container = $(id);
    if (!container) continue;
    container.innerHTML = storyProgressMarkup(compact);
    requestAnimationFrame(() => {
      const track = container.querySelector(".story-track"),
        current = track?.querySelector(".story-node.current");
      if (track && current)
        track.scrollLeft = Math.max(
          0,
          current.offsetLeft - (track.clientWidth - current.clientWidth) / 2,
        );
    });
  }
  const snapshot = storySnapshot(),
    state = $("#apartment-state"),
    copy = $("#apartment-copy");
  if (state && copy) {
    state.textContent = snapshot.started ? "调查据点" : "调查从这里开始";
    copy.textContent = snapshot.started
      ? "随时返回查看已经发现的线索。"
      : "查看峰子留下的物品与线索。";
  }
}
function stateForPlace(place) {
  if (devFullAccess) return "active";
  if (devAccessMode === "select") {
    const relevantIndexes = storyNodes
      .map((node, index) =>
        node.linkedLocationIds.includes(place.id) ? index : -1,
      )
      .filter((index) => index >= 0);
    if (relevantIndexes.includes(devPreviewChapter - 1)) return "active";
    if (relevantIndexes.some((index) => index < devPreviewChapter - 1))
      return "visited_cleared";
    return "ambient";
  }
  if (currentStoryNode()?.linkedLocationIds.includes(place.id)) return "active";
  const completed = storyNodes
    .filter(
      (node) =>
        node.linkedLocationIds.includes(place.id) && savedReviews[node.id],
    )
    .at(-1);
  if (!completed) return "ambient";
  return savedReviews[completed.id] === "clear"
    ? "visited_cleared"
    : "visited_suspect";
}
function chapterForPlace(place) {
  if (!place) return null;
  if (devFullAccess)
    return storyNodes.find((node) => node.linkedLocationIds.includes(place.id))
      ?.chapterId;
  if (devAccessMode === "select")
    return storyNodes
      .filter(
        (node, index) =>
          index <= devPreviewChapter - 1 &&
          node.linkedLocationIds.includes(place.id),
      )
      .at(-1)?.chapterId;
  const current = currentStoryNode();
  if (current?.linkedLocationIds.includes(place.id)) return current.chapterId;
  return storyNodes
    .filter(
      (node) =>
        node.linkedLocationIds.includes(place.id) && savedReviews[node.id],
    )
    .at(-1)?.chapterId;
}
function renderMapStates() {
  const labels = {
    locked: "尚未调查",
    active: "当前调查",
    visited_suspect: "已访问 · 仍有疑点",
    visited_cleared: "已访问 · 嫌疑已排除",
    ambient: "街区地点",
  };
  for (const place of locations) {
    const element =
        document.querySelector(`[data-shop="${place.id}"]`) ??
        document.querySelector(`[data-kodemmacho-location="${place.id}"]`),
      state = stateForPlace(place);
    if (!element) continue;
    element.classList.remove(
      "locked",
      "active",
      "visited_suspect",
      "visited_cleared",
      "ambient",
    );
    element.classList.add(state);
    element.dataset.locationState = state;
    let status = element.querySelector(".location-status");
    if (!status) {
      status = document.createElement("em");
      status.className = "location-status";
      element.append(status);
    }
    status.textContent = labels[state];
    element.classList.toggle(
      "story-current",
      currentStoryNode()?.locationId === place.id,
    );
  }
}
function evidenceState(item) {
  const id = "ch" + String(item.unlockChapter).padStart(2, "0"),
    choice = savedReviews[id],
    chapter = reviewById[id];
  return choice && chapter?.resolution[choice]?.archiveAs === "conclusion"
    ? "resolved"
    : "question";
}
const evidenceHotspots = {
  insurance_material: [63, 36],
  ningyoyaki: [52, 69],
  new_scissors: [88, 54],
  "6300_email": [61, 45],
  dog_square_email: [68, 44],
  childcare_magazines: [19, 48],
  lawyer_correspondence: [62, 40],
  public_phone_call: [79, 29],
};
function renderApartment() {
  const current = currentChapterNumber(savedReviews);
  const visible = visibleEvidence(minekoApartmentEvidence.evidence, current),
    evidence = visible.filter(
      (item) =>
        (evidenceTab === "resolved" ? "resolved" : "question") ===
        evidenceState(item),
    );
  $("#evidence-hotspots").innerHTML = visible
    .map((item, index) => {
      const [x, y] = evidenceHotspots[item.id] ?? [50 + index * 4, 50];
      return `<button class="evidence-hotspot ${evidenceState(item)}" data-evidence-id="${item.id}" style="--hx:${x}%;--hy:${y}%" aria-label="查看${escape(item.title)}"><span>⌕</span><small>${escape(item.title)}</small></button>`;
    })
    .join("");
  const icons = { document: "文", object: "物", digital: "邮", phone: "话" };
  $("#apartment-evidence").innerHTML = evidence.length
    ? `<div class="evidence-grid">${evidence
        .map((item) => {
          const id = "ch" + String(item.unlockChapter).padStart(2, "0"),
            choice = savedReviews[id],
            investigated = !!choice,
            state = evidenceState(item),
            place = locations.find(
              (entry) => entry.id === item.investigation.locationId,
            );
          return `<details class="evidence-card ${state}" data-evidence-card="${item.id}"><summary><i>${icons[item.type] ?? "证"}</i><div><small>第 ${item.unlockChapter} 章</small><h3>${escape(item.title)}</h3><p>${escape(item.before.summary)}</p></div><span>${state === "resolved" ? "已厘清" : "有疑点"}</span></summary><div class="evidence-detail"><strong>发现时的问题</strong><ul>${item.before.questions.map((question) => `<li>${escape(question)}</li>`).join("")}</ul>${investigated ? `<div class="investigation-notes"><strong>调查备注</strong><ul>${item.after.details.map((detail) => `<li>${escape(detail)}</li>`).join("")}</ul><strong>加贺的判断</strong><p>${escape(item.after.result)}</p></div>` : ""}<p class="related-location">相关地点：${escape(item.investigation.label)}</p><div class="evidence-actions"><button data-evidence-read="${item.unlockChapter}">阅读全文</button>${place ? `<button class="primary" data-evidence-location="${item.unlockChapter}">前往相关地点</button>` : ""}</div></div></details>`;
        })
        .join("")}</div>`
    : '<div class="evidence-empty">这一栏目前没有证物记录。</div>';
  document
    .querySelectorAll("[data-evidence-tab]")
    .forEach((button) =>
      button.classList.toggle(
        "active",
        button.dataset.evidenceTab === evidenceTab,
      ),
    );
}
function readyReviewIds() {
  if (devFullAccess)
    return suspectReview.chapters.map((chapter) => chapter.chapterId);
  if (devAccessMode === "select")
    return suspectReview.chapters
      .slice(0, devPreviewChapter)
      .map((chapter) => chapter.chapterId);
  const ids = new Set([...Object.keys(savedReviews), ...storyReadyReviews]);
  if (readCh1Progress().dayCompleted) ids.add("ch01");
  for (const clueId of collectedClues) {
    const clue = clues.entries.find((item) => item.id === clueId),
      reading = storyLocations.readings[clue?.locationId];
    for (const chapterId of reading?.chapterIds ?? [])
      ids.add("ch" + String(chapterId).padStart(2, "0"));
  }
  return suspectReview.chapters
    .map((chapter) => chapter.chapterId)
    .filter((id) => ids.has(id));
}
function ch1NightMarkup(progress) {
  const data = ch1Night.policeStation,
    memories = data.memoryCards
      .filter(
        (card) =>
          !card.requiresUnlocked ||
          progress.unlockedMemories.includes(card.memoryId),
      )
      .map((card) => ch1Day.memories[card.memoryId])
      .filter(Boolean),
    choice = data.judgment.choices.find(
      (item) => item.id === progress.nightJudgment,
    );
  if (ch1NightStage === 0)
    return `<article class="ch1-night"><small>${esc(data.intro.eyebrow)}</small><h3>${esc(data.intro.title)}</h3><p>${esc(data.intro.text)}</p><button class="primary" data-ch1-stage="1">回看今天</button></article>`;
  if (ch1NightStage === 1)
    return `<article class="ch1-night"><small>${esc(data.sectionLabels.memories)}</small><h3>${esc(data.person.name)}</h3><p>${esc(data.person.summary)}</p><div class="ch1-memory-grid">${memories.length ? memories.map(memory=>`<div><strong>${esc(memory.title)}</strong><p>${esc(memory.text)}</p></div>`).join('') : '<p>今天还没有留下可回看的记忆。</p>'}</div><button class="primary" data-ch1-stage="2">翻看加贺的记录</button></article>`;
  if (ch1NightStage === 2)
    return `<article class="ch1-night"><small>${esc(data.sectionLabels.notes)}</small><h3>加贺的记录</h3><ol class="ch1-notes">${data.kagaNotes.slice(0,ch1NoteCount).map(note=>`<li>${esc(note.text)}</li>`).join('')}</ol><button class="primary" data-ch1-note>${ch1NoteCount<data.kagaNotes.length?'下一条记录':'形成今晚的判断'}</button></article>`;
  if (ch1NightStage === 3)
    return `<article class="ch1-night"><small>${esc(data.sectionLabels.judgment)}</small><h3>${esc(data.judgment.prompt)}</h3><div class="ch1-judgments">${data.judgment.choices.map(item=>`<button data-ch1-judgment="${item.id}">${esc(item.label)}</button>`).join('')}</div></article>`;
  if (ch1NightStage === 4)
    return `<article class="ch1-night"><small>${esc(data.sectionLabels.judgment)}</small><h3>${esc(choice?.label??'今晚的判断')}</h3><p>${esc(choice?.response??'')}</p><button class="primary" data-ch1-stage="5">${esc(data.judgment.continueLabel)}</button></article>`;
  if (ch1NightStage === 5)
    return `<article class="ch1-night ch1-resolution"><small>${esc(data.sectionLabels.resolution)}</small><h3>${esc(data.resolution.label)}</h3>${data.resolution.paragraphs.map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}<p class="ch1-final-line">${esc(data.resolution.finalLine)}</p><button class="primary" data-ch1-stage="6">继续</button></article>`;
  return `<article class="ch1-night ch1-completion"><small>${esc(data.completion.eyebrow)}</small><h3>${esc(data.completion.title)}</h3><p>${esc(data.completion.subtitle)}</p><button class="primary" data-ch1-finish>${esc(data.completion.actionLabel)}</button></article>`;
}
function archiveEntries() {
  const entries = [],
    resolved = new Set();
  for (const chapter of suspectReview.chapters) {
    const choice = savedReviews[chapter.chapterId];
    if (!choice) continue;
    const result = chapter.resolution[choice],
      decision =
        chapter.choices.find((item) => item.id === choice)?.label ?? choice;
    entries.push({
      id: chapter.chapterId,
      type: result.archiveAs,
      chapter: chapter.title,
      character: chapter.initialSuspect.name,
      decision,
      text: result.text,
    });
    if (chapter.newDoubt)
      entries.push({
        id: chapter.newDoubt.id,
        type: "doubt",
        chapter: chapter.title,
        character: "未解问题",
        decision: "新增疑点",
        text: chapter.newDoubt.text,
      });
    if (chapter.majorConclusion)
      entries.push({
        id: chapter.chapterId + "-major",
        type: "conclusion",
        chapter: chapter.title,
        character: chapter.initialSuspect.name,
        decision: "章节结论",
        text: chapter.majorConclusion,
      });
    if (chapter.resolveDoubt) resolved.add(chapter.resolveDoubt);
  }
  return entries.map((entry) => ({
    ...entry,
    resolved: resolved.has(entry.id) || dismissedArchiveDoubts.has(entry.id),
  }));
}
function renderPolice() {
  const previousTabs = $("#suspect-review .review-chapters");
  if (previousTabs) reviewChapterScroll = previousTabs.scrollLeft;
  const ready = readyReviewIds();
  if (!selectedReview || !ready.includes(selectedReview))
    selectedReview =
      ready.find((id) => !savedReviews[id]) ?? ready.at(-1) ?? null;
  const chapter = reviewById[selectedReview],
    choice = chapter && savedReviews[selectedReview],
    result = choice && chapter.resolution[choice],
    ch1Progress = readCh1Progress(),
    showCh1Night = selectedReview === "ch01" && ch1Progress.dayCompleted;
  $("#suspect-review").innerHTML = showCh1Night
    ? `<div class="review-chapters">${ready.map((id) => `<button data-review="${id}" class="${id === selectedReview ? "active" : ""}">${esc(reviewById[id].title)}</button>`).join("")}</div>${ch1NightMarkup(ch1Progress)}`
    : chapter
    ? `<div class="review-chapters">${ready.map((id) => `<button data-review="${id}" class="${id === selectedReview ? "active" : ""}">${esc(reviewById[id].title)}</button>`).join("")}</div><article class="review-card"><small>${esc(chapter.chapterId.toUpperCase())} · ${esc(chapter.title)}</small><h3>${esc(chapter.initialSuspect.name)}</h3><p class="suspicion-reason">${esc(chapter.initialSuspect.reason)}</p>${choice ? `<div class="review-resolution"><strong>${esc(chapter.choices.find((item) => item.id === choice)?.label ?? choice)}</strong><p>${esc(result.text)}</p>${chapter.nextSuspect ? `<p class="next-suspect">新调查对象：${esc(chapter.nextSuspect.name)}<br>${esc(chapter.nextSuspect.reason)}</p>` : ""}${chapter.finalState === "confirmed" && choice === "confirm" ? '<span class="confirmed">核心嫌疑人已确认</span>' : ""}</div>` : `<p class="review-question">${esc(chapter.reviewQuestion)}</p><div class="review-choices">${chapter.choices.map((item) => `<button data-choice="${item.id}">${esc(item.label)}</button>`).join("")}</div>`}</article>`
    : '<div class="review-empty"><h3>尚无可复核人物</h3><p>完成地点对话并取得相关事实后，章节嫌疑复核会出现在这里。</p></div>';
  if (choice && !showCh1Night) {
    const button = document.createElement("button");
    button.className = "reconsider";
    button.dataset.reconsider = selectedReview;
    button.textContent = "重新判断";
    $("#suspect-review .review-resolution").append(button);
  }
  const renderedTabs = $("#suspect-review .review-chapters");
  if (renderedTabs) renderedTabs.scrollLeft = reviewChapterScroll;
  const entries = archiveEntries().filter(
    (entry) =>
      archiveFilter === "all" ||
      (entry.type === archiveFilter &&
        (archiveFilter !== "doubt" || !entry.resolved)),
  );
  $("#archive-list").innerHTML = entries.length
    ? entries
        .map(
          (entry) =>
            `<details class="archive-item ${entry.resolved ? "resolved" : ""}"><summary><span><small>${esc(entry.chapter)}</small><strong>${esc(entry.character)}</strong></span><b>${entry.type === "conclusion" ? "结论" : "疑点"}${entry.resolved ? " · 已解决" : ""}</b></summary><div><strong>${esc(entry.decision)}</strong><p>${esc(entry.text)}</p>${archiveFilter === "doubt" && !entry.resolved ? `<button class="dismiss-doubt" data-dismiss-doubt="${esc(entry.id)}">排除疑点</button>` : ""}</div></details>`,
        )
        .join("")
    : '<p class="archive-empty">档案尚为空。</p>';
  document
    .querySelectorAll("[data-archive]")
    .forEach((button) =>
      button.classList.toggle(
        "active",
        button.dataset.archive === archiveFilter,
      ),
    );
  renderMapStates();
  renderStoryProgress();
}
function collectClue(id) {
  collectedClues.add(id);
  renderPolice();
}
function nextChapterStep(id) {
  const node = storyNodes.find((item) => item.chapterId === id + 1);
  if (!node) return null;
  return { id: node.chapterId, available: true, hasMap: !!node.locationId };
}
const scene = createVisit(reader, {
  stop,
  onClue: collectClue,
  onCh1Progress: () => {
    renderStoryProgress();
    renderMapStates();
    renderPolice();
  },
  chapterForLocation: (id) =>
    chapterForPlace(locations.find((place) => place.id === id)),
  onClose: () => {
    stop();
    if (activeScreen === "ningyocho") viewport.focus({ preventScroll: true });
  },
  canCompleteChapter: (id) => currentStoryNode()?.chapterId === id,
  nextChapterStep,
  onChapterComplete: (id, route = "police") => {
    const chapterId = "ch" + String(id).padStart(2, "0");
    if (!savedReviews[chapterId]) {
      storyReadyReviews.add(chapterId);
      localStorage.setItem(
        "storyReadyReviews",
        JSON.stringify([...storyReadyReviews]),
      );
      selectedReview = chapterId;
    }
    renderStoryProgress();
    if (route === "continue") return;
    if (route === "map") {
      const next = storyNodes.find((item) => item.chapterId === id + 1);
      openStoryNode(next, true);
    } else showScreen(route === "directory" ? "kodemmacho" : route);
  },
});
let activeScreen = "hub";
const screens = {
  hub: $("#hub-screen"),
  ningyocho: detailScreen,
  kodemmacho: $("#kodemmacho-screen"),
  police: $("#police-screen"),
  apartment: $("#apartment-screen"),
};
function showScreen(name) {
  activeScreen = name;
  stop();
  Object.entries(screens).forEach(
    ([id, element]) => (element.hidden = id !== name),
  );
  document
    .querySelectorAll(".case-tabs button")
    .forEach((button) =>
      button.classList.toggle(
        "active",
        button.dataset.top === (name === "police" ? "deduction" : "roam"),
      ),
    );
  document
    .querySelectorAll(".area-switcher button")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.screen === name),
    );
  document.querySelector("footer").hidden = name !== "ningyocho";
  renderStoryProgress();
  if (name === "ningyocho") {
    const destination = ningyochoLocations.find(
      (place) => place.id === currentStoryNode()?.locationId,
    );
    if (destination) {
      player = { ...destination.door };
      visual = { ...player };
      lastLocation = "";
    }
    renderMapStates();
    camera = null;
    update(
      destination
        ? "当前故事地点：" + destination.name
        : "当前章节可从上方故事进度继续阅读。",
    );
    viewport.focus({ preventScroll: true });
  }
  if (name === "kodemmacho") renderMapStates();
  if (name === "police") renderPolice();
  if (name === "apartment") renderApartment();
}
function scrollToDestinationMap(mapArea = "ningyocho") {
  requestAnimationFrame(() => {
    const map =
      mapArea === "kodemmacho"
        ? document.querySelector("#kodemmacho-screen .kodemmacho-location-map")
        : detailScreen.querySelector(".map-panel");
    map?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
function openStoryNode(node, preferMap = false) {
  if (!node) return;
  if (node.screen === "apartment") {
    showScreen("apartment");
    return;
  }
  if (node.screen === "police") {
    showScreen("police");
    return;
  }
  const place = locations.find((item) => item.id === node.locationId);
  if (preferMap && place) {
    if (place.mapArea === "kodemmacho") {
      showScreen("kodemmacho");
      requestAnimationFrame(() =>
        document
          .querySelector(`[data-kodemmacho-location="${place.id}"]`)
          ?.focus(),
      );
      return;
    }
    showScreen("ningyocho");
    player = { ...place.door };
    visual = { ...player };
    lastLocation = "";
    camera = null;
    update(
      (storyNodeState(node, storyNodes.indexOf(node)) === "current"
        ? "当前故事地点："
        : "回顾故事地点：") + place.name,
    );
    return;
  }
  scene.openChapter(node.chapterId);
}
function update(message) {
  const l = nearby(player);
  const related = l?.reading;
  $("#place-reading-title").textContent = related
    ? related.chapterIds
        .map((id) => chapters[id].label + " · " + chapters[id].title)
        .join(" / ")
    : "仙贝店的女孩";
  $("#place-reading-description").textContent = related
    ? related.note
    : "从一段祖孙的家常话开始。";
  $("#place-reading-note").textContent = related
    ? "可直接阅读篇章全文，无需完成对话。"
    : "第一章开篇试读。";
  $("#read-sample").innerHTML =
    (related
      ? related.kind === "related"
        ? "阅读关联章节全文"
        : "阅读本地篇章全文"
      : "阅读开篇") + " <kbd>R</kbd>";
  const state = l && stateForPlace(l),
    visitLabels = {
      active: "访问店家",
      visited_suspect: "再次询问",
      visited_cleared: "查看结论",
      ambient: "查看地点",
      locked: "尚未调查",
    };
  $("#visit").disabled = !l || state === "locked";
  $("#visit").innerHTML =
    (l ? visitLabels[state] : "访问店家") + " <kbd>E</kbd>";
  $("#visit").title = l
    ? state === "locked"
      ? "当前章节尚未开放这里"
      : "访问" + l.name
    : "先走近店门或地标";
  const atStation = player.x === start.x && player.y === start.y;
  const name =
    l?.name ||
    (atStation
      ? "人形町站"
      : player.x >= 10 && player.x <= 12
        ? "人形町站前道路"
        : "甘酒横丁");
  $("#walking-place").textContent = name;
  $("#steps").textContent = steps + " 步";
  $("#walk-hint").textContent =
    message ||
    (l
      ? state === "locked"
        ? "这里尚未进入调查范围。"
        : state === "visited_cleared"
          ? "调查已完成，可查看保存的结论。"
          : state === "visited_suspect"
            ? "这里仍有疑点，可以再次询问。"
            : state === "ambient"
              ? "这是街区地点，可查看简短介绍。"
              : "已到店门附近，按 E 开始调查。"
      : "方向键移动，走近店门查看地点。");
  document
    .querySelectorAll(".shop")
    .forEach((el) => el.classList.toggle("near", el.dataset.shop === l?.id));
  if (lastLocation !== name) {
    lastLocation = name;
    $("#location").textContent = name;
    $("#place-index").textContent = l
      ? "故事地点 " + String(l.trackerOrder ?? "").padStart(2, "0")
      : "漫游途中";
    $("#place-description").textContent = l
      ? l.kind
      : "沿着车站旁的十字路口，慢慢认识这条街。";
    $("#place-note").textContent = l
      ? state === "ambient"
        ? "街区中的一处日常地点。"
        : state === "visited_cleared"
          ? "这处调查已经形成结论。"
          : state === "visited_suspect"
            ? "此前的判断仍留有疑点。"
            : state === "locked"
              ? "尚未取得进入这里的调查方向。"
              : "当前章节的调查地点。"
      : "走近店门，手帐会翻到这家店。";
  }
  followPlayer();
}
const movement = createMovement(start, step, (position) => {
  player = position;
  steps++;
  update();
  const place = locations.find(
    (l) => player.x === l.door.x && player.y === l.door.y,
  );
  if (place) enterPlace(place);
});
function tick(now) {
  visual = movement.tick(now);
  $("#player").style.setProperty("--x", visual.x);
  $("#player").style.setProperty("--y", visual.y);
  if (activeScreen === "ningyocho") followPlayer();
  requestAnimationFrame(tick);
}
function enterPlace(place) {
  const state = stateForPlace(place);
  if (state === "locked") {
    update("这里尚未进入调查范围。");
    return;
  }
  scene.open(false, place, dialogueStateForMapState(state));
}
function visitPlace() {
  if (reader.open || movement.moving) return;
  const place = nearby(player);
  if (place) enterPlace(place);
}
function openReading() {
  if (!movement.moving) scene.open(true, nearby(player));
}
const directions = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};
document.addEventListener("keydown", (e) => {
  if (
    e.isComposing ||
    e.altKey ||
    e.ctrlKey ||
    e.metaKey ||
    e.target?.closest?.('input,textarea,select,[contenteditable="true"]')
  )
    return;
  const key = e.key.toLowerCase();
  if (reader.open) {
    if (scene.key(e.key, e.repeat)) e.preventDefault();
    return;
  }
  if (activeScreen !== "ningyocho") {
    if (e.key === "Escape" && activeScreen !== "kodemmacho") {
      e.preventDefault();
      showScreen("kodemmacho");
    }
    return;
  }
  if (["+", "=", "-", "_"].includes(e.key)) {
    e.preventDefault();
    if (!e.repeat) changeZoom(["+", "="].includes(e.key) ? 1 : -1);
    return;
  }
  if (e.key === "Escape") {
    e.preventDefault();
    showScreen("kodemmacho");
    return;
  }
  if (!directions[e.key] && !["e", "j", "r", "h"].includes(key)) return;
  e.preventDefault();
  if (e.repeat) return;
  if (directions[e.key]) {
    movement.press(e.key, directions[e.key], performance.now());
  } else if (key === "h") $("#reset").click();
  else if (key === "e") visitPlace();
  else if (key === "j") $("#notebook").open = !$("#notebook").open;
  else openReading();
});
document.addEventListener("keyup", (e) => movement.release(e.key));
window.addEventListener("blur", stop);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
function changeZoom(direction) {
  zoom = Math.max(
    0.5,
    Math.min(2, Math.round((zoom + direction * 0.25) * 100) / 100),
  );
  camera = null;
  $("#zoom-level").textContent = Math.round(zoom * 100) + "%";
  $("#zoom-out").disabled = zoom === 0.5;
  $("#zoom-in").disabled = zoom === 2;
  followPlayer();
}
$("#zoom-out").onclick = () => changeZoom(-1);
$("#zoom-in").onclick = () => changeZoom(1);
$("#visit").onclick = visitPlace;
document.querySelectorAll("[data-dx]").forEach((b) => {
  const id = "pointer-" + b.dataset.dx + ":" + b.dataset.dy,
    dir = [Number(b.dataset.dx), Number(b.dataset.dy)];
  b.onpointerdown = (e) => {
    if (reader.open) return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    movement.press(id, dir, performance.now());
  };
  b.onpointerup =
    b.onpointercancel =
    b.onlostpointercapture =
      () => movement.release(id);
  b.onclick = (e) => {
    if (e.detail === 0) {
      movement.press(id, dir, performance.now());
      movement.release(id);
    }
  };
});
$("#reset").onclick = () => {
  if (reader.open) return;
  movement.reset();
  player = { ...start };
  visual = { ...player };
  camera = null;
  steps = 0;
  update("已回到车站，重新出发。");
};
$("#read-sample").onclick = openReading;
document
  .querySelectorAll("[data-screen]")
  .forEach(
    (button) => (button.onclick = () => showScreen(button.dataset.screen)),
  );
function refreshDevView() {
  if (activeScreen === "police") renderPolice();
  else {
    renderStoryProgress();
    renderMapStates();
    if (activeScreen === "apartment") renderApartment();
  }
  if (activeScreen === "ningyocho") update();
}
document.querySelectorAll("[data-dev-access]").forEach(
  (button) =>
    (button.onclick = () => {
      devAccessMode = button.dataset.devAccess;
      devFullAccess = devAccessMode === "all";
      localStorage.setItem(devAccessKey, devAccessMode);
      document.querySelectorAll("[data-dev-access]").forEach((option) =>
        option.setAttribute(
          "aria-pressed",
          String(option.dataset.devAccess === devAccessMode),
        ),
      );
      $(".dev-progress-select").hidden = devAccessMode !== "select";
      refreshDevView();
    }),
);
$("#dev-progress-select")?.addEventListener("change", (event) => {
  devPreviewChapter = Number(event.target.value);
  localStorage.setItem(devProgressKey, String(devPreviewChapter));
  refreshDevView();
});
document
  .querySelectorAll("[data-kodemmacho-location]")
  .forEach(
    (button) =>
      (button.onclick = () =>
        enterPlace(
          locations.find(
            (place) => place.id === button.dataset.kodemmachoLocation,
          ),
        )),
  );
document.addEventListener("click", (event) => {
  const trigger = event.target.closest(
    "[data-story-node],[data-story-read],[data-story-map],[data-story-apartment]",
  );
  if (!trigger) return;
  if (trigger.hasAttribute("data-story-apartment")) {
    showScreen("apartment");
    return;
  }
  const node = trigger.dataset.storyNode
      ? storyNodes.find((item) => item.id === trigger.dataset.storyNode)
      : currentStoryNode(),
    fromMap = !!trigger.closest("#map-story-progress");
  openStoryNode(
    node,
    trigger.hasAttribute("data-story-map") ||
      (fromMap && trigger.hasAttribute("data-story-node")),
  );
});
document.querySelector('[data-top="roam"]').onclick = () =>
  showScreen("kodemmacho");
document.querySelector('[data-top="notes"]').onclick = () => {
  showScreen("ningyocho");
  $("#notebook").open = true;
};
document.querySelector('[data-top="deduction"]').onclick = () =>
  showScreen("police");
$("#apartment-screen").addEventListener("click", (event) => {
  const evidenceElement = event.target.closest(
    "[data-evidence-id],[data-evidence-card]",
  );
  if (evidenceElement) {
    const evidenceId =
      evidenceElement.dataset.evidenceId ??
      evidenceElement.dataset.evidenceCard;
    discoveredApartmentEvidence.add(evidenceId);
    localStorage.setItem(
      "discoveredApartmentEvidence",
      JSON.stringify([...discoveredApartmentEvidence]),
    );
    renderStoryProgress();
    renderMapStates();
  }
  const hotspot = event.target.closest("[data-evidence-id]");
  if (hotspot) {
    const item = minekoApartmentEvidence.evidence.find(
      (entry) => entry.id === hotspot.dataset.evidenceId,
    );
    evidenceTab = evidenceState(item) === "resolved" ? "resolved" : "current";
    renderApartment();
    const card = document.querySelector(`[data-evidence-card="${item.id}"]`);
    card.open = true;
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const tab = event.target.closest("[data-evidence-tab]");
  if (tab) {
    evidenceTab = tab.dataset.evidenceTab;
    renderApartment();
    return;
  }
  const read = event.target.closest("[data-evidence-read]");
  if (read) {
    scene.openChapter(Number(read.dataset.evidenceRead));
    return;
  }
  const investigate = event.target.closest("[data-evidence-location]");
  if (!investigate) return;
  const chapter = Number(investigate.dataset.evidenceLocation),
    evidence = minekoApartmentEvidence.evidence.find(
      (item) => item.unlockChapter === chapter,
    ),
    place = locations.find(
      (item) => item.id === evidence?.investigation.locationId,
    );
  if (!place) return;
  if (place.mapArea === "kodemmacho") {
    showScreen("kodemmacho");
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-kodemmacho-location="${place.id}"]`)
        ?.focus({ preventScroll: true });
      scrollToDestinationMap("kodemmacho");
    });
    return;
  }
  showScreen("ningyocho");
  player = { ...place.door };
  visual = { ...player };
  lastLocation = "";
  camera = null;
  update("当前线索指向：" + place.name);
  scrollToDestinationMap();
});
$("#police-screen").addEventListener("click", (event) => {
  const ch1Stage = event.target.closest("[data-ch1-stage]");
  if (ch1Stage) {
    ch1NightStage = Number(ch1Stage.dataset.ch1Stage);
    renderPolice();
    return;
  }
  if (event.target.closest("[data-ch1-note]")) {
    if (ch1NoteCount < ch1Night.policeStation.kagaNotes.length)
      ch1NoteCount++;
    else ch1NightStage = 3;
    renderPolice();
    return;
  }
  const ch1Judgment = event.target.closest("[data-ch1-judgment]");
  if (ch1Judgment) {
    writeCh1Progress({ nightJudgment: ch1Judgment.dataset.ch1Judgment });
    ch1NightStage = 4;
    renderPolice();
    return;
  }
  if (event.target.closest("[data-ch1-finish]")) {
    writeCh1Progress({ nightCompleted: true });
    savedReviews.ch01 = "clear";
    storyReadyReviews.delete("ch01");
    localStorage.setItem("suspectReviews", JSON.stringify(savedReviews));
    localStorage.setItem(
      "storyReadyReviews",
      JSON.stringify([...storyReadyReviews]),
    );
    renderStoryProgress();
    renderMapStates();
    showScreen("kodemmacho");
    return;
  }
  const review = event.target.closest("[data-review]");
  if (review) {
    selectedReview = review.dataset.review;
    renderPolice();
    return;
  }
  const choice = event.target.closest("[data-choice]");
  if (choice && selectedReview) {
    savedReviews[selectedReview] = choice.dataset.choice;
    storyReadyReviews.delete(selectedReview);
    localStorage.setItem("suspectReviews", JSON.stringify(savedReviews));
    localStorage.setItem(
      "storyReadyReviews",
      JSON.stringify([...storyReadyReviews]),
    );
    renderPolice();
    return;
  }
  const reconsider = event.target.closest("[data-reconsider]");
  if (reconsider) {
    delete savedReviews[reconsider.dataset.reconsider];
    storyReadyReviews.add(reconsider.dataset.reconsider);
    localStorage.setItem("suspectReviews", JSON.stringify(savedReviews));
    localStorage.setItem(
      "storyReadyReviews",
      JSON.stringify([...storyReadyReviews]),
    );
    selectedReview = reconsider.dataset.reconsider;
    renderPolice();
    return;
  }
  const dismissDoubt = event.target.closest("[data-dismiss-doubt]");
  if (dismissDoubt) {
    dismissedArchiveDoubts.add(dismissDoubt.dataset.dismissDoubt);
    localStorage.setItem(
      "dismissedArchiveDoubts",
      JSON.stringify([...dismissedArchiveDoubts]),
    );
    renderPolice();
    return;
  }
  const filter = event.target.closest("[data-archive]");
  if (filter) {
    archiveFilter = filter.dataset.archive;
    renderPolice();
  }
});
$("#guide").onclick = () => {
  showScreen("kodemmacho");
  $(".area-status").textContent =
    "从人形町收集事实，回警局整理关系，再逐步打开新的调查地点。";
};
if (matchMedia("(max-width: 850px)").matches) $("#notebook").open = false;
update();
showScreen("kodemmacho");
requestAnimationFrame(tick);
