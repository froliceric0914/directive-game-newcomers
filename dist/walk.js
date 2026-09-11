import {chapters} from './location-reading.mjs';
import {createMovement} from './movement.mjs';
import {createVisit} from './visit.mjs';
import {zoomCameraFrame} from './camera.mjs';
import {start,locations,step,nearby} from './walk-map.mjs';
let player={...start},steps=0,lastLocation='';
const $=s=>document.querySelector(s),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#app').innerHTML=`<header class="header"><div class="brand-mark">新</div><div><h1>人形町散步</h1><p>在街道与书页之间</p></div><div class="header-end"><span class="edition">新参者 · 阅读漫游</span><button class="text-button" id="open-reading" aria-keyshortcuts="r">打开书页 <kbd>R</kbd></button></div></header><main><section class="map-panel"><div class="map-heading"><div><span class="eyebrow">NIHONBASHI · NINGYOCHO</span><h2>日本桥，人形町。</h2></div><div class="map-tools"><span class="map-tag">街区导览图</span><div class="zoom-controls" role="group" aria-label="地图缩放"><button id="zoom-out" aria-label="缩小地图" aria-keyshortcuts="-">−</button><output id="zoom-level" aria-live="polite">100%</output><button id="zoom-in" aria-label="放大地图" aria-keyshortcuts="+ =">+</button></div></div></div><div class="map-scroll" tabindex="0" role="region" aria-label="人形町地图，长按方向键连续移动加贺警官"><div id="map"><div class="road vertical"></div><div class="road horizontal"></div><div class="street-label">甘 酒 横 丁</div><div class="north-label">↑ 小传马町方向</div><div class="east-label">滨町公园 →</div><div class="station">人形町站<span>出发点</span></div>${locations.map((l,i)=>`<div class="shop ${l.npc?'':'landmark'}" data-shop="${l.id}" style="--x:${l.x};--y:${l.y};--w:${l.w};--h:${l.h}"><span class="shop-number">${String(i+1).padStart(2,'0')}</span><strong>${l.name}</strong><small>${l.kind}</small></div><div class="entrance" style="--x:${l.door.x};--y:${l.door.y}" aria-label="${l.name}入口">${l.npc?'<span class="npc" title="'+l.npc+'">店</span>':'◇'}</div>`).join('')}<div id="player" aria-label="加贺警官"><span>加</span></div></div></div><div class="map-caption"><span><i class="legend player-key"></i>加贺 <i class="legend npc-key"></i>店家 <i class="legend road-key"></i>街道</span><span>依参考图绘制 · 非等比例</span></div><div class="walking-bar"><div><span class="eyebrow">正在漫游</span><p id="walking-place">人形町站</p><small id="walk-hint" role="status" aria-live="polite">沿街走近一家店。</small></div><div class="move-controls"><span class="keyboard-hint">长按方向键连续移动</span><div class="dpad">${[[0,-1,'↑','上'],[-1,0,'←','左'],[0,1,'↓','下'],[1,0,'→','右']].map(([x,y,s,n])=>`<button data-dx="${x}" data-dy="${y}" aria-keyshortcuts="${x===1?'ArrowRight':x===-1?'ArrowLeft':y===1?'ArrowDown':'ArrowUp'}" aria-label="向${n}移动一格">${s}</button>`).join('')}</div><button class="visit-button" id="visit" aria-keyshortcuts="e" disabled>访问店家 <kbd>E</kbd></button><button class="reset" id="reset" aria-keyshortcuts="h">回到车站 <kbd>H</kbd></button></div></div></section><details class="notebook" id="notebook" open><summary aria-keyshortcuts="j"><span>随身手帐</span><span class="notebook-toggle">展开 / 收起 <kbd>J</kbd></span></summary><div class="notebook-body"><div class="notebook-title"><span class="eyebrow">KAGA'S NOTEBOOK</span><span class="page-no">01</span></div><div class="place-index" id="place-index">出发地</div><h2 id="location">人形町站</h2><p class="place-description" id="place-description">从十字路口开始，慢慢认识这条街。</p><div class="location-note"><span class="eyebrow">此刻所见</span><p id="place-note">走近店门，手帐会翻到这家店。</p></div><div class="reading-card"><span class="eyebrow">翻开原著</span><h3 id="place-reading-title">仙贝店的女孩</h3><p id="place-reading-description">从一段祖孙的家常话开始。</p><button class="primary" id="read-sample" aria-keyshortcuts="r">阅读开篇 <kbd>R</kbd></button><small id="place-reading-note">第一章开篇试读。</small></div><div class="notebook-foot"><span>加贺恭一郎</span><span id="steps">0 步</span></div></div></details></main><footer><div class="shortcut-guide"><span><kbd>↑ ↓ ← →</kbd> 移动</span><span><kbd>E</kbd> 访问店家</span><span><kbd>J</kbd> 开关手帐</span><span><kbd>R</kbd> 阅读</span><span><kbd>+ / −</kbd> 地图缩放</span><span><kbd>H</kbd> 回到车站</span><span><kbd>Esc</kbd> 关闭</span></div><span>地图与阅读体验预览</span></footer>`;
const viewport=$('.map-scroll');
const stage=document.createElement('div');stage.className='camera-stage';
$('#map').before(stage);stage.append($('#map'));
let visual={...player},camera=null,zoom=1;
function followPlayer(){
 const frame=zoomCameraFrame(visual,nearby(player),viewport.clientWidth,zoom);
 stage.style.width=928*frame.zoom+'px';stage.style.height=672*frame.zoom+'px';
 $('#map').style.transform=`scale(${frame.zoom})`;
 $('#map').style.left=frame.padding+'px';$('#map').style.top=frame.padding+'px';
 stage.style.padding=frame.padding+'px';
 $('#zoom-level').textContent=Math.round(frame.zoom*100)+'%';
 $('#zoom-level').title=frame.zoom<zoom?'为完整显示店铺，暂时调整缩放；离开后恢复 '+Math.round(zoom*100)+'%':'地图缩放';
 camera??={left:frame.left,top:frame.top};
 camera.left+=(frame.left-camera.left)*.24;camera.top+=(frame.top-camera.top)*.24;
 viewport.scrollLeft=camera.left;viewport.scrollTop=camera.top;
}
new ResizeObserver(()=>{camera=null;followPlayer()}).observe(viewport);
const reader=$('#modal');
function stop(){movement.clear();}
const scene=createVisit(reader,{stop,onClose:()=>{stop();viewport.focus({preventScroll:true})}});
function update(message){const l=nearby(player);
 const related=l?.reading;
 $('#place-reading-title').textContent=related?related.chapterIds.map(id=>chapters[id].label+' · '+chapters[id].title).join(' / '):'仙贝店的女孩';
 $('#place-reading-description').textContent=related?related.note:'从一段祖孙的家常话开始。';
 $('#place-reading-note').textContent=related?'可直接阅读篇章全文，无需完成对话。':'第一章开篇试读。';
 $('#read-sample').innerHTML=(related?(related.kind==='related'?'阅读关联章节全文':'阅读本地篇章全文'):'阅读开篇')+' <kbd>R</kbd>';
$('#visit').disabled=!l;$('#visit').title=l?'访问'+l.name:'先走近店门或地标';const atStation=player.x===start.x&&player.y===start.y;const name=l?.name||(atStation?'人形町站':player.x>=10&&player.x<=12?'人形町站前道路':'甘酒横丁');$('#walking-place').textContent=name;$('#steps').textContent=steps+' 步';$('#walk-hint').textContent=message||(l?'已到店门附近，按 E 访问，或按 J 打开手帐。':'方向键移动，走近店门查看地点。');document.querySelectorAll('.shop').forEach(el=>el.classList.toggle('near',el.dataset.shop===l?.id));if(lastLocation!==name){lastLocation=name;$('#location').textContent=name;$('#place-index').textContent=l?'地点 '+String(locations.indexOf(l)+1).padStart(2,'0'):'漫游途中';$('#place-description').textContent=l?l.kind:'沿着车站旁的十字路口，慢慢认识这条街。';$('#place-note').textContent=l?(l.npc?(l.id==='sokaya'?'踏入店门，听听菜穗的回忆。':'店家就在门口。对话将在后续的故事里展开。'):'你已经走近这处地标。'):'走近店门，手帐会翻到这家店。'}followPlayer();}
const movement=createMovement(start,step,position=>{
 player=position;steps++;update();
 const door=locations.find(l=>l.id==='sokaya').door;
 if(player.x===door.x&&player.y===door.y)scene.open();
});
function tick(now){
 visual=movement.tick(now);
 $('#player').style.setProperty('--x',visual.x);$('#player').style.setProperty('--y',visual.y);followPlayer();requestAnimationFrame(tick);
}
function visitPlace(){if(reader.open||movement.moving)return;const place=nearby(player);if(!place)return;if(place.id==='sokaya'){scene.open();return}$('#notebook').open=true;update('正在查看'+place.name+'。');}
function openReading(){if(!movement.moving)scene.open(true,nearby(player))}
const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
document.addEventListener('keydown',e=>{
 if(e.isComposing||e.altKey||e.ctrlKey||e.metaKey||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 const key=e.key.toLowerCase();
 if(reader.open){if(scene.key(e.key,e.repeat))e.preventDefault();return;}
 if(['+','=','-','_'].includes(e.key)){e.preventDefault();if(!e.repeat)changeZoom(['+','='].includes(e.key)?1:-1);return;}
 if(e.key==='Escape'){$('#notebook').open=false;return}
 if(!directions[e.key]&&!['e','j','r','h'].includes(key))return;e.preventDefault();if(e.repeat)return;
 if(directions[e.key]){movement.press(e.key,directions[e.key],performance.now())}
 else if(key==='h')$('#reset').click();else if(key==='e')visitPlace();else if(key==='j')$('#notebook').open=!$('#notebook').open;else openReading();
});
document.addEventListener('keyup',e=>movement.release(e.key));
window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
function changeZoom(direction){zoom=Math.max(.5,Math.min(2,Math.round((zoom+direction*.25)*100)/100));camera=null;$('#zoom-level').textContent=Math.round(zoom*100)+'%';$('#zoom-out').disabled=zoom===.5;$('#zoom-in').disabled=zoom===2;followPlayer();}
$('#zoom-out').onclick=()=>changeZoom(-1);$('#zoom-in').onclick=()=>changeZoom(1);
$('#visit').onclick=visitPlace;
document.querySelectorAll('[data-dx]').forEach(b=>{
 const id='pointer-'+b.dataset.dx+':'+b.dataset.dy,dir=[Number(b.dataset.dx),Number(b.dataset.dy)];
 b.onpointerdown=e=>{if(reader.open)return;e.preventDefault();b.setPointerCapture(e.pointerId);movement.press(id,dir,performance.now())};
 b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>movement.release(id);
 b.onclick=e=>{if(e.detail===0){movement.press(id,dir,performance.now());movement.release(id)}};
});
$('#reset').onclick=()=>{if(reader.open)return;movement.reset();player={...start};visual={...player};camera=null;steps=0;update('已回到车站，重新出发。')};
$('#open-reading').onclick=$('#read-sample').onclick=openReading;
if(matchMedia('(max-width: 850px)').matches)$('#notebook').open=false;
update();requestAnimationFrame(tick);
