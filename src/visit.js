import {
  readProgress,
  writeProgress,
  scrollProgress,
} from "./reader-progress.js";
import { clues, locations, chapterEndReviews } from "./game-data.js";
import { chapters, readingForLocation } from "./location-reading.js";
import { sceneAction } from "./shortcuts.js";
import { npcs, portraitFor } from "./npcs.js";
import {
  resolveCharacterId,
  selectStoryDialogue,
  storyLocationForMap,
} from "./story-locations.js";
import {
  readInvestigationProgress,
  writeInvestigationProgress,
} from "./investigation-progress.js";
import {
  loadChapter,
  conversationNodes,
  conversationForLocation,
  chapterMemories,
  investigationLocationId,
} from "./investigation.js";
import { speakerLabel } from "./story-locations.js";
export function createVisit(
  dialog,
  {
    stop,
    onClose,
    onClue = () => {},
    onNarrativeProgress = () => {},
    onVisitLocation = () => {},
    onChapterComplete = () => {},
    canCompleteChapter = () => false,
    nextChapterStep = () => null,
    chapterForLocation = () => null,
  },
) {
  let mode = "talk",
    returnMode = "talk",
    line = 0,
    origin = false,
    ambient = false,
    notes = false,
    request = 0,
    fullChapter = false,
    readingPlace = null,
    chapterId = 1,
    scene = null,
    clue = null,
    selectedDialogue = null,
    dialogueState = "ambient",
    narrative = null,
    conversation = null,
    nodeId = null,
    nodeLine = 0,
    nodeMemoryShown = false,
    dayScene = null,
    dayNpc = null;
  let cleanupReading = () => {};
  const storage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  };
  const chapterReview = (id) => chapterEndReviews.reviews[String(id)];
  const q = (s) => dialog.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(
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
  function shell() {
    const returnArea =
        readingPlace?.mapArea === "kodemmacho" || !readingPlace
          ? "小传马町"
          : "人形町",
      sceneArea =
        readingPlace?.mapArea === "kodemmacho"
          ? "小传马町 · 调查地点"
          : "人形町 · 暖帘之内";
    dialog.className = "visit-scene";
    dialog.setAttribute("aria-labelledby", "scene-title");
    dialog.innerHTML = `<header class="scene-head"><div><small>${sceneArea}</small><h2 id="scene-title">${origin ? (readingPlace ? esc(readingPlace.name) + " · 原著" : "书页之间") : esc(readingPlace.name + " · " + readingPlace.kind)}</h2></div><button id="leave" aria-keyshortcuts="Escape">← 返回${returnArea} <kbd>Esc</kbd></button></header><nav class="scene-tabs" aria-label="店内查看"><button data-view="talk" aria-keyshortcuts="t">对话 <kbd>T</kbd></button><button data-view="notes" aria-keyshortcuts="j">随身手帐 <kbd>J</kbd></button><button data-view="read" aria-keyshortcuts="r">${chapters[chapterId].label}全文 <kbd>R</kbd></button></nav><section class="scene-content"></section><footer class="scene-foot">一间小店，一件寻常事。<span>新参者 · ${chapters[chapterId].label}</span></footer>`;
    q("#leave").onclick = closeScene;
    dialog.querySelectorAll("[data-view]").forEach((b) => {
      b.hidden = origin && b.dataset.view !== "read";
      b.onclick = () => {
        if (b.dataset.view === "read") {
          returnMode = mode === "read" ? "talk" : mode;
          fullChapter = true;
        }
        show(b.dataset.view);
      };
    });
  }
  function show(view) {
    cleanupReading();
    cleanupReading = () => {};
    mode = view;
    request++;
    dialog.classList.toggle("focused-reader", mode === "read" && fullChapter);
    dialog.setAttribute(
      "aria-labelledby",
      mode === "read" && fullChapter ? "chapter-title" : "scene-title",
    );
    dialog
      .querySelectorAll("[data-view]")
      .forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === mode));
    if (mode === "talk") talk();
    else if (mode === "notes") notebook();
    else read();
  }
  function cast(
    speaker,
    npcId,
    showKaga = true,
    showNpc = true,
    protagonist = "kaga",
  ) {
    const npc = npcs[npcId],
      player = npcs[protagonist];
    return `<div class="cast" data-location="${readingPlace.id}" style="--scene-background:${scene.background ? `url('${scene.background}')` : "none"}"><figure class="kaga ${speaker === protagonist ? "speaking" : ""}" ${showKaga && player ? "" : "hidden"}><div class="portrait">${player ? `<img src="${portraitFor(protagonist, protagonist === "kaga" ? "conversation" : undefined)}" alt="${esc(player.name)}">` : ""}</div><figcaption>${esc(player?.name)} <small>${esc(player?.role)}</small></figcaption></figure><div class="shop-curtain" aria-hidden="true">${esc(scene.curtain)}</div><figure class="shopkeeper ${speaker === npcId ? "speaking" : ""}" ${showNpc && npc ? "" : "hidden"}><div class="portrait">${npc ? `<img src="${portraitFor(npcId)}" alt="${esc(npc.name)}" decoding="async">` : ""}</div><figcaption>${esc(npc?.name)} <small>${esc(npc?.role)}</small></figcaption></figure></div>`;
  }
  function saveMemories(ids) {
    const progress = readInvestigationProgress(narrative.chapterId),
      unlocked = [
        ...new Set([...progress.unlockedMemories, ...ids.filter(Boolean)]),
      ];
    if (unlocked.length !== progress.unlockedMemories.length) {
      writeInvestigationProgress(narrative.chapterId, {
        unlockedMemories: unlocked,
      });
      onNarrativeProgress();
    }
  }
  function setDayLocation(id, transition = false) {
    const place = locations.map.locations.find(
      (item) => item.id === investigationLocationId(id),
    );
    if (!place) return;
    readingPlace = place;
    if (transition)
      dayNpc =
        locations.scenes[place.id]?.npcId ??
        locations.venues[place.venueId ?? place.id]?.npcIds?.[0] ??
        dayNpc;
    scene = {
      ...dayScene,
      ...(locations.scenes[place.id] ?? {}),
      background: locations.scenes[place.id]?.background ?? null,
      curtain: place.name,
    };
    q("#scene-title").textContent = place.name;
  }
  function optionalActions() {
    const progress = readInvestigationProgress(narrative.chapterId);
    return (narrative.day.optionalVisits ?? [])
      .filter(
        (visit) =>
          !progress.completedOptionalVisits.includes(visit.id) &&
          (!visit.availableAfterMemory ||
            progress.unlockedMemories.includes(visit.availableAfterMemory)),
      )
      .map(
        (visit) =>
          `<button data-optional-location="${investigationLocationId(visit.locationId)}">${esc(visit.title)} →</button>`,
      )
      .join("");
  }
  function wireOptional() {
    dialog.querySelectorAll("[data-optional-location]").forEach(
      (button) =>
        (button.onclick = () => {
          closeScene();
          onVisitLocation(button.dataset.optionalLocation);
        }),
    );
  }
  function dayTalk() {
    const flow = conversation.flow,
      node = conversationNodes(flow)[nodeId];
    if (!node) return;
    const protagonist =
      resolveCharacterId(narrative.day.playerCharacter ?? "kaga") ?? "kaga";
    if (node.locationId) setDayLocation(node.locationId, true);
    const lines = node.lines ?? [],
      current = lines[nodeLine];
    const currentNpc = resolveCharacterId(current?.speaker),
      nodeNpc = lines
        .map((item) => resolveCharacterId(item.speaker))
        .find((id) => id && id !== protagonist);
    const npcId =
      (currentNpc !== protagonist ? currentNpc : null) ??
      (current?.speaker === "shopkeeper" ? dayScene.npcId : null) ??
      nodeNpc ??
      dayNpc ??
      (flow.characters ?? [])
        .map(resolveCharacterId)
        .find((id) => id && id !== protagonist) ??
      (conversation.optional ? null : dayScene.npcId);
    if (npcId && npcId !== protagonist) dayNpc = npcId;
    const foreground = () =>
      cast(
        resolveCharacterId(current?.speaker) ?? current?.speaker,
        npcId,
        true,
        !!npcs[npcId] && npcId !== protagonist,
        protagonist,
      );
    const advance = (next) => {
      nodeId = next;
      nodeLine = 0;
      nodeMemoryShown = false;
      dayTalk();
    };
    if (current) {
      q(".scene-content").innerHTML =
        `<div class="conversation">${foreground()}<div class="dialogue-box"><div class="dialogue-label"><strong>${esc(current.speaker === "system" ? "" : current.speaker === "shop-clerk" ? "店员" : speakerLabel(current.speaker))}</strong><small>${nodeLine + 1} / ${lines.length}</small></div><p aria-live="polite">${esc(current.text)}</p><div class="dialogue-actions"><button id="previous" ${nodeLine === 0 ? "disabled" : ""}>上一句 <kbd>←</kbd></button><button class="primary" id="next">继续 → <kbd>E</kbd></button></div></div></div>`;
      q("#previous").onclick = () => {
        nodeLine--;
        dayTalk();
      };
      q("#next").onclick = () => {
        nodeLine++;
        dayTalk();
      };
      return;
    }
    const memoryId = node.type === "memory" ? node.memoryId : node.unlockMemory;
    if (memoryId) saveMemories([memoryId, node.unlockMemory]);
    const memory = chapterMemories(narrative)[memoryId];
    if (node.type === "memory" && memory && !nodeMemoryShown) {
      q(".scene-content").innerHTML =
        `<div class="conversation">${foreground()}<article class="narrative-memory"><h3>${esc(memory.title)}</h3><p>${esc(memory.text)}</p><button class="primary" id="next">继续 →</button></article></div>`;
      q("#next").onclick = () => {
        nodeMemoryShown = true;
        dayTalk();
      };
      return;
    }
    if (node.choices?.length) {
      q(".scene-content").innerHTML =
        `<div class="conversation">${foreground()}<div class="dialogue-box narrative-choice">${node.prompt ? `<h3>${esc(node.prompt)}</h3>` : ""}<div class="narrative-choices">${node.choices.map((choice) => `<button data-node-next="${choice.next}">${esc(choice.label)}</button>`).join("")}</div></div></div>`;
      q(".narrative-choices").onclick = (event) => {
        const button = event.target.closest("[data-node-next]");
        if (button) advance(button.dataset.nodeNext);
      };
      return;
    }
    if (node.type === "complete") {
      const progress = readInvestigationProgress(narrative.chapterId),
        optional = conversation.optional;
      if (
        optional
          ? !progress.completedOptionalVisits.includes(optional.id)
          : !progress.dayCompleted
      ) {
        writeInvestigationProgress(
          narrative.chapterId,
          optional
            ? {
                completedOptionalVisits: [
                  ...progress.completedOptionalVisits,
                  optional.id,
                ],
              }
            : { dayCompleted: true },
        );
        onNarrativeProgress();
      }
      const feedback = node.feedback ?? flow.feedback;
      q(".scene-content").innerHTML =
        `<article class="narrative-day-complete"><h3>${esc(typeof feedback === "string" ? feedback : feedback?.title)}</h3>${feedback?.text ? `<p>${esc(feedback.text)}</p>` : ""}<div class="narrative-choices"><button class="primary" id="next">${esc(node.actionLabel ?? "返回街区")}</button>${optionalActions()}</div></article>`;
      q("#next").onclick = closeScene;
      wireOptional();
      return;
    }
    if (node.next) advance(node.next);
  }
  function talk() {
    if (conversation) {
      dayTalk();
      return;
    }
    const lines = selectedDialogue?.lines ??
        scene.dialogue ?? [
          ["kaga", "这里暂时没有更多可询问的内容。", "加贺恭一郎"],
        ],
      current = lines[line],
      speaker = current[0],
      npc = npcs[scene.npcId],
      showKaga = selectedDialogue
        ? selectedDialogue.participantIds.includes("kaga")
        : true,
      showNpc = selectedDialogue
        ? selectedDialogue.participantIds.includes(scene.npcId)
        : true,
      canGrant = dialogueState === "activeInvestigation" && !!clue;
    q(".scene-content").innerHTML =
      `<div class="conversation">${cast(speaker, scene.npcId, showKaga, showNpc)}<div class="dialogue-box"><div class="dialogue-label"><strong>${esc(current[2] ?? npcs[speaker]?.name ?? speaker)}</strong><small>${line + 1} / ${lines.length}</small></div><p aria-live="polite">${esc(current[1])}</p><div class="dialogue-actions"><button id="previous" aria-keyshortcuts="ArrowLeft" ${line === 0 ? "disabled" : ""}>上一句 <kbd>←</kbd></button><button class="primary" id="next" aria-keyshortcuts="e ArrowRight">${line === lines.length - 1 ? (canGrant ? (notes ? "查看手帐 →" : "记入手帐 →") : "返回街道 →") : "继续对话 →"} <kbd>E</kbd></button></div></div></div>`;
    q("#previous").onclick = () => {
      line--;
      talk();
    };
    q("#next").onclick = () => {
      if (line < lines.length - 1) {
        line++;
        talk();
      } else if (!canGrant) closeScene();
      else {
        notes = true;
        onClue(clue.id);
        show("notes");
      }
    };
  }
  function notebook() {
    if (narrative) {
      const progress = readInvestigationProgress(narrative.chapterId),
        memories = chapterMemories(narrative);
      q(".scene-content").innerHTML =
        `<article class="scene-notes"><h3>${esc(narrative.title)}</h3>${
          progress.unlockedMemories
            .map((id) => memories[id])
            .filter(Boolean)
            .map(
              (memory) =>
                `<section><strong>${esc(memory.title)}</strong><p>${esc(memory.text)}</p></section>`,
            )
            .join("") || "<p>听完对话，留意今天遇到的细节。</p>"
        }<div class="narrative-choices">${optionalActions()}<button id="note-action">返回对话 →</button></div></article>`;
      wireOptional();
      q("#note-action").onclick = () => show("talk");
      return;
    }
    q(".scene-content").innerHTML =
      `<article class="scene-notes"><h3>${esc(clue?.title ?? readingPlace.name)}</h3>${notes && clue ? `<span class="note-stamp">已记下</span><p>${esc(clue.text)}</p><div class="note-question">${esc(clue.question)}</div><p class="muted">${esc(clue.qualification)}</p>` : "<p>先听完这段对话，再把留意到的细节记下来。</p>"}<button class="primary" id="note-action">返回对话 →</button></article>`;
    q("#note-action").onclick = () => show("talk");
  }
  function closeScene() {
    cleanupReading();
    cleanupReading = () => {};
    dialog.close();
  }
  function exitReading() {
    if (fullChapter && mode === "read") {
      if (origin) closeScene();
      else {
        fullChapter = false;
        show(returnMode);
      }
    } else closeScene();
  }
  async function read() {
    const token = request,
      full = fullChapter,
      id = chapterId;
    const linked = readingForLocation(readingPlace?.id);
    q(".scene-content").innerHTML =
      `<div class="book-view ${full ? "full-book" : "excerpt-book"}">
 ${full ? `<div class="focus-toolbar"><div><button id="exit-reading" aria-keyshortcuts="Escape">退出阅读 <kbd>Esc</kbd></button>${canCompleteChapter(id) ? '<button class="complete-chapter" id="complete-chapter">完成本章阅读 →</button>' : ""}</div><span id="reader-progress">0%</span><div><button id="save-bookmark" aria-keyshortcuts="b" disabled>书签 <kbd>B</kbd></button><button id="goto-bookmark" aria-keyshortcuts="g" hidden>回到书签 <kbd>G</kbd></button></div></div>` : ""}
 <div class="reading-document" tabindex="0" role="region" aria-label="${full ? "章节全文" : "相关片段"}"><article class="reading-column"><div class="book-heading"><small>东野圭吾 著 · 岳远坤 译</small><h3 id="chapter-title">正在翻开书页…</h3><div class="reading-scope" aria-label="阅读范围"><button id="read-excerpt" aria-keyshortcuts="1">相关片段 <kbd>1</kbd></button><button id="read-chapter" aria-keyshortcuts="2">${chapters[id].label}全文 <kbd>2</kbd></button></div></div><div class="novel-text" data-no-i18n></div>${full ? '<button class="reopen-chapter-review" id="reopen-chapter-review" hidden>查看本章回顾</button>' : ""}</article></div>
 ${full ? '<section class="chapter-end" id="chapter-end" hidden aria-label="本章读完后的下一步"></section>' : ""}
 ${full ? '<span id="reader-notice" class="reader-notice" role="status" aria-live="polite"></span>' : ""}</div>`;
    q("#read-excerpt").hidden = !readingPlace || readingPlace.id !== "sokaya";
    q(".scene-foot span").textContent = "新参者 · " + chapters[id].label;
    if (full) q("#exit-reading").onclick = exitReading;
    if (linked && linked.chapterIds.length > 1) {
      const label = document.createElement("label");
      label.className = "chapter-select";
      label.innerHTML =
        '选择篇章 <kbd>C</kbd> <select aria-label="选择篇章" aria-keyshortcuts="c">' +
        linked.chapterIds
          .map(
            (n) =>
              `<option value="${n}" ${n === id ? "selected" : ""}>${chapters[n].label} · ${chapters[n].title}</option>`,
          )
          .join("") +
        "</select>";
      q(".book-heading").append(label);
      q("select").onchange = (e) => {
        chapterId = Number(e.target.value);
        fullChapter = true;
        show("read");
      };
    }
    q("#read-excerpt").setAttribute("aria-pressed", !full);
    q("#read-chapter").setAttribute("aria-pressed", full);
    q("#read-excerpt").onclick = () => {
      fullChapter = false;
      show("read");
    };
    q("#read-chapter").onclick = () => {
      fullChapter = true;
      show("read");
    };
    try {
      const r = await fetch(
        full
          ? chapters[id].url
          : origin
            ? "reading-sample.json"
            : "senbei-reading.json",
      );
      if (!r.ok) throw Error();
      const data = await r.json();
      if (token !== request || !dialog.open) return;
      q("#chapter-title").textContent = full
        ? chapters[id].label + " · " + data.title
        : data.title;
      const paragraphs = full
        ? data.paragraphs.filter(
            (paragraph, index) =>
              index > 1 ||
              !paragraph.replace(/\s/g, "").startsWith(chapters[id].label),
          )
        : data.paragraphs;
      q(".novel-text").innerHTML = paragraphs
        .map((paragraph) =>
          /^\d+$/.test(paragraph.trim())
            ? `<p class="section-break" aria-label="第 ${esc(paragraph)} 节"><span>${esc(paragraph)}</span></p>`
            : `<p>${esc(paragraph)}</p>`,
        )
        .join("");
      const scroller = q(".reading-document");
      const frame = requestAnimationFrame(() => {
        if (token !== request || !dialog.open) return;
        scroller.focus({ preventScroll: true });
        if (!full) {
          scroller.scrollTop = 0;
          return;
        }
        const key = "readerProgress:" + id,
          bookmarkKey = "readerBookmark:" + id,
          reviewKey = "readerReview:" + id;
        let timer,
          noticeTimer,
          endShown = false,
          bookmark = readProgress(storage, bookmarkKey),
          savedReview = storage.getItem(reviewKey),
          reviewSeen = (readProgress(storage, key) ?? 0) >= 0.995;
        const range = () =>
          Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        scroller.scrollTop = (readProgress(storage, key) ?? 0) * range();
        const update = () => {
          q("#reader-progress").textContent =
            Math.round(scrollProgress(scroller) * 100) + "%";
        };
        const save = () => {
          clearTimeout(timer);
          writeProgress(storage, key, scrollProgress(scroller));
        };
        const finish = (route) => {
          closeScene();
          onChapterComplete(id, route);
        };
        const hideChapterEnd = () => {
          q("#chapter-end").hidden = true;
          scroller.focus({ preventScroll: true });
        };
        const showChapterEnd = (manual = false) => {
          if (!manual && (endShown || savedReview || reviewSeen)) return;
          endShown = true;
          reviewSeen = true;
          writeProgress(storage, key, 1);
          q("#reopen-chapter-review").hidden = false;
          const next = nextChapterStep(id),
            review = chapterReview(id);
          q("#chapter-end").innerHTML =
            `<article class="chapter-review"><button class="chapter-review-close" data-review-close aria-label="关闭本章回顾">×</button><img class="chapter-review-avatar" src="${portraitFor("kaga", "map")}" alt="加贺"><small>加贺 · 回看这一章</small><h3>“先等等。有个地方，我有点在意。”</h3><ul class="chapter-observations">${review.observations.map((item) => `<li>${esc(item)}</li>`).join("")}</ul><strong class="chapter-question">${esc(review.question)}</strong><div class="chapter-review-choices">${review.choices.map((item) => `<button data-review-choice="${item.id}">${esc(item.label)}</button>`).join("")}</div><div class="chapter-review-result" hidden><p data-kaga-response></p><strong>这一章留下的线索</strong><p>${esc(review.takeaway)}</p></div><div class="chapter-end-actions" hidden>${next ? '<button class="primary" data-end="continue">继续下一章</button>' : `<strong class="reading-complete">${id === 9 ? "全书阅读完成" : "本章阅读已结束"}</strong>`}${next?.hasMap ? '<button data-end="map">前往地图探索</button>' : ""}<button data-end="police">前往警局整理线索</button><button class="tertiary" data-end="directory">返回故事目录</button></div></article>`;
          q("#chapter-end").hidden = false;
          const reveal = (choice) => {
            const item =
              review.choices.find((entry) => entry.id === choice) ??
              review.choices[0];
            q(".chapter-review-result").hidden = false;
            q("[data-kaga-response]").textContent = item.response;
            q(".chapter-end-actions").hidden = false;
            q(".chapter-review-choices")
              .querySelectorAll("button")
              .forEach((button) => {
                button.disabled = true;
                button.classList.toggle(
                  "selected",
                  button.dataset.reviewChoice === item.id,
                );
              });
            q(
              ".chapter-end-actions .primary, .chapter-end-actions button",
            )?.focus();
          };
          q("#chapter-end").onclick = (event) => {
            if (event.target.closest("[data-review-close]")) {
              hideChapterEnd();
              return;
            }
            const choice = event.target.closest("[data-review-choice]")?.dataset
              .reviewChoice;
            if (choice) {
              savedReview = choice;
              storage.setItem(reviewKey, choice);
              reveal(choice);
              return;
            }
            const action = event.target.closest("[data-end]")?.dataset.end;
            if (!action) return;
            if (action === "continue") {
              onChapterComplete(id, "continue");
              q("#chapter-end").hidden = true;
              openChapter(next.id);
              return;
            }
            finish(action);
          };
          if (savedReview) reveal(savedReview);
          else q("[data-review-choice]")?.focus();
        };
        const onScroll = () => {
          update();
          clearTimeout(timer);
          timer = setTimeout(save, 200);
          if (range() <= scroller.scrollTop + 4) showChapterEnd();
        };
        const notice = (message) => {
          clearTimeout(noticeTimer);
          q("#reader-notice").textContent = message;
          noticeTimer = setTimeout(() => {
            if (token === request) q("#reader-notice").textContent = "";
          }, 2200);
        };
        update();
        q("#save-bookmark").disabled = false;
        q("#goto-bookmark").hidden = bookmark === null;
        q("#reopen-chapter-review").hidden = !(savedReview || reviewSeen);
        q("#reopen-chapter-review").onclick = () => showChapterEnd(true);
        const complete = q("#complete-chapter");
        if (complete) complete.onclick = () => showChapterEnd(true);
        if (range() <= scroller.scrollTop + 4) showChapterEnd();
        q("#save-bookmark").onclick = () => {
          const value = scrollProgress(scroller);
          if (writeProgress(storage, bookmarkKey, value)) {
            bookmark = value;
            q("#goto-bookmark").hidden = false;
            notice("书签已保存");
          } else notice("无法保存书签，请检查浏览器存储设置");
        };
        q("#goto-bookmark").onclick = () => {
          if (bookmark !== null) {
            scroller.scrollTop = bookmark * range();
            update();
            save();
            scroller.focus({ preventScroll: true });
          }
        };
        scroller.addEventListener("scroll", onScroll, { passive: true });
        const hidden = () => {
          if (document.hidden) save();
        };
        window.addEventListener("pagehide", save);
        document.addEventListener("visibilitychange", hidden);
        cleanupReading = () => {
          save();
          clearTimeout(noticeTimer);
          scroller.removeEventListener("scroll", onScroll);
          window.removeEventListener("pagehide", save);
          document.removeEventListener("visibilitychange", hidden);
        };
      });
      cleanupReading = () => cancelAnimationFrame(frame);
    } catch {
      if (token === request && dialog.open)
        q("#chapter-title").textContent = "书页暂时无法打开，请退出后重试。";
    }
  }
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    const review = q("#chapter-end");
    if (review && !review.hidden) {
      review.hidden = true;
      q(".reading-document")?.focus({ preventScroll: true });
      return;
    }
    exitReading();
  });
  dialog.addEventListener("close", () => {
    cleanupReading();
    cleanupReading = () => {};
    request++;
    dialog.classList.remove("focused-reader");
    document.body.classList.remove("in-scene");
    onClose();
  });
  function open(readOnly = false, place = null, state = "activeInvestigation") {
    stop();
    origin = readOnly;
    dialogueState = state;
    ambient = state === "ambient";
    readingPlace =
      place ?? locations.map.locations.find((item) => item.id === "sokaya");
    const activeChapter = chapterForLocation(readingPlace.id),
      baseScene = locations.scenes[readingPlace.id] ?? {},
      variant = baseScene.chapterVariants?.[String(activeChapter)],
      story = storyLocationForMap(readingPlace);
    narrative = loadChapter(activeChapter);
    conversation =
      !readOnly && state === "activeInvestigation"
        ? conversationForLocation(
            narrative,
            readingPlace.id,
            readInvestigationProgress(activeChapter),
          )
        : null;
    const normalState =
      narrative && state === "activeInvestigation" && !conversation
        ? "ambient"
        : state;
    dialogueState = normalState;
    selectedDialogue =
      readOnly || conversation
        ? null
        : selectStoryDialogue(readingPlace, normalState);
    const storyNpc = (
      selectedDialogue?.participantIds ??
      story?.characters?.map(resolveCharacterId).filter(Boolean) ??
      []
    ).find((id) => id !== "kaga");
    scene = {
      npcId: storyNpc ?? baseScene.npcId,
      curtain: story?.name ?? readingPlace.name,
      background: conversation ? null : "assets/locations/street.png",
      ...baseScene,
      ...(variant ?? {}),
    };
    dayScene = scene;
    clue = clues.entries.find((item) => item.id === scene.clueId);
    line = 0;
    notes = false;
    chapterId =
      activeChapter ??
      story?.chapterIds?.[0] ??
      readingForLocation(readingPlace.id)?.chapterIds[0] ??
      1;
    fullChapter = !!readOnly && !!place;
    shell();
    if (conversation) {
      dayNpc = null;
      nodeId = conversation.flow.startNode;
      nodeLine = 0;
      nodeMemoryShown = false;
      setDayLocation(
        conversation.optional?.locationId ?? narrative.day.locationId,
      );
    }
    if (state !== "activeInvestigation") q('[data-view="notes"]').hidden = true;
    document.body.classList.add("in-scene");
    if (!dialog.open) dialog.showModal();
    show(readOnly ? "read" : "talk");
  }
  function openChapter(id, place = null) {
    stop();
    conversation = null;
    narrative = null;
    origin = true;
    ambient = false;
    readingPlace = place;
    scene = place ? locations.scenes[place.id] : null;
    clue = scene
      ? clues.entries.find((item) => item.id === scene.clueId)
      : null;
    line = 0;
    notes = false;
    chapterId = id;
    fullChapter = true;
    shell();
    document.body.classList.add("in-scene");
    if (!dialog.open) dialog.showModal();
    show("read");
  }
  function openAmbient(place) {
    open(false, place, "ambient");
  }
  function openSummary(place, summary) {
    stop();
    origin = false;
    ambient = false;
    readingPlace = place;
    chapterId = readingForLocation(place.id)?.chapterIds[0] ?? 1;
    shell();
    q(".scene-tabs").hidden = true;
    q(".scene-content").innerHTML =
      `<article class="location-summary"><small>调查完毕</small><h3>${esc(summary.suspectName)} · 嫌疑已排除</h3><p>${esc(summary.text)}</p><div class="summary-actions"><button id="summary-close">查看结论</button><button class="primary" id="summary-read">阅读全文</button></div></article>`;
    q("#summary-close").onclick = closeScene;
    q("#summary-read").onclick = () => open(true, place);
    document.body.classList.add("in-scene");
    if (!dialog.open) dialog.showModal();
  }
  return {
    open,
    openChapter,
    openAmbient,
    openSummary,
    key(key, repeat = false) {
      if (key.toLowerCase() === "c" && mode === "read" && q("select")) {
        if (!repeat) q("select").focus();
        return true;
      }
      const action = sceneAction(key, mode, origin);
      if (!action) return false;
      if (repeat) return true;
      const click = (selector) => {
        const button = q(selector);
        if (button && !button.disabled && !button.hidden) button.click();
      };
      if (action === "close") {
        const review = q("#chapter-end");
        if (review && !review.hidden) {
          review.hidden = true;
          q(".reading-document")?.focus({ preventScroll: true });
        } else exitReading();
      } else if (action === "talk") show("talk");
      else if (action === "notes") show(mode === "notes" ? "talk" : "notes");
      else if (action === "read") {
        returnMode = mode === "read" ? "talk" : mode;
        fullChapter = true;
        show("read");
      } else if (action === "excerpt") click("#read-excerpt");
      else if (action === "chapter") click("#read-chapter");
      else if (action === "bookmark") click("#save-bookmark");
      else if (action === "goto-bookmark") click("#goto-bookmark");
      else if (action === "previous-line") click("#previous");
      else if (action === "primary")
        click(mode === "talk" ? "#next" : "#note-action");
      return true;
    },
  };
}
