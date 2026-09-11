import {chapters,readingForLocation} from './location-reading.mjs';
import {sceneAction} from './shortcuts.mjs';
import {npcs,portraitFor} from './npcs.mjs';
const lines=[
 ['加贺恭一郎','关于田仓先生的着装，我想再确认一下。'],
 ['上川菜穗','他那天穿着灰色正装；上次来时，是褐色的。'],
 ['加贺恭一郎','颜色先放在一边。当时，他穿着西装上衣吗？'],
 ['上川菜穗','穿着。这有什么关系吗？'],
 ['加贺恭一郎','还不清楚。谢谢你。']
];
export function createVisit(dialog,{stop,onClose}){
 let mode='talk',line=0,page=0,pages=[],origin=false,notes=false,request=0,fullChapter=false,readingReady=false,readingPlace=null,chapterId=1;
 const q=s=>dialog.querySelector(s);
 const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function shell(){dialog.className='visit-scene';dialog.setAttribute('aria-labelledby','scene-title');dialog.innerHTML=`<header class="scene-head"><div><small>人形町 · 暖帘之内</small><h2 id="scene-title">${origin?(readingPlace?esc(readingPlace.name)+' · 原著':'书页之间'):'草加屋 · 仙贝店'}</h2></div><button id="leave" aria-keyshortcuts="Escape">返回街道 <kbd>Esc</kbd></button></header><nav class="scene-tabs" aria-label="店内查看"><button data-view="talk" aria-keyshortcuts="t">对话 <kbd>T</kbd></button><button data-view="notes" aria-keyshortcuts="j">随身手帐 <kbd>J</kbd></button><button data-view="read" aria-keyshortcuts="r">阅读原著 <kbd>R</kbd></button></nav><section class="scene-content"></section><footer class="scene-foot">一间小店，一件寻常事。<span>新参者 · ${chapters[chapterId].label}</span></footer>`;
 q('#leave').onclick=()=>dialog.close();dialog.querySelectorAll('[data-view]').forEach(b=>{b.hidden=origin&&b.dataset.view!=='read';b.onclick=()=>show(b.dataset.view)});
 }
 function show(view){mode=view;request++;dialog.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===mode));if(mode==='talk')talk();else if(mode==='notes')notebook();else read();}
 function talk(){q('.scene-content').innerHTML=`<div class="conversation"><div class="cast"><figure class="kaga ${line%2===0?'speaking':''}"><div class="portrait"><img src="${portraitFor('kaga')}" alt="便装的加贺恭一郎"></div><figcaption>加贺恭一郎 <small>日本桥署</small></figcaption></figure><div class="shop-curtain" aria-hidden="true">咸<br>甜<br>味</div><figure class="shopkeeper ${line%2===1?'speaking':''}"><div class="portrait"><img src="${portraitFor('naho')}" alt="${npcs.naho.name}" decoding="async"></div><figcaption>上川菜穗 <small>店家的孙女</small></figcaption></figure></div><div class="dialogue-box"><div class="dialogue-label"><strong>${lines[line][0]}</strong><small>原著情节改写 · ${line+1} / ${lines.length}</small></div><p aria-live="polite">${lines[line][1]}</p><div class="dialogue-actions"><button id="previous" aria-keyshortcuts="ArrowLeft" ${line===0?'disabled':''}>上一句 <kbd>←</kbd></button><button class="primary" id="next" aria-keyshortcuts="e ArrowRight">${line===lines.length-1?(notes?'查看手帐 →':'记入手帐 →'):'继续对话 →'} <kbd>E</kbd></button></div></div></div>`;q('#previous').onclick=()=>{line--;talk()};q('#next').onclick=()=>{if(line<lines.length-1){line++;talk()}else{notes=true;show('notes')}};}
 function notebook(){q('.scene-content').innerHTML=`<article class="scene-notes"><small class="eyebrow">KAGA'S NOTEBOOK · 01</small><h3>一件西装上衣</h3>${notes?'<span class="note-stamp">已记下</span><p>菜穗回忆：田仓那天穿着灰色正装，而且穿着上衣。</p><div class="note-question">加贺为什么更在意“穿着上衣”？</div><p class="muted">这是一份见闻，还不是案件的结论。</p>':'<p>先听完这段对话，再把留意到的细节记下来。</p>'}<button class="primary" id="note-action" aria-keyshortcuts="e">${notes?'展开这一段原著 →':'返回对话 →'} <kbd>E</kbd></button></article>`;q('#note-action').onclick=()=>show(notes?'read':'talk');}
 async function read(){readingReady=false;const token=request;q('.scene-content').innerHTML='<div class="book-view"><div class="book-heading"><small>东野圭吾 著 · 岳远坤 译</small><h3>正在翻开书页…</h3><div class="reading-scope" aria-label="阅读范围"><button id="read-excerpt" aria-keyshortcuts="1">相关片段 <kbd>1</kbd></button><button id="read-chapter" aria-keyshortcuts="2">第一章全文 <kbd>2</kbd></button></div></div><div class="book-page" tabindex="0"></div><div class="page-controls"><button id="prev-page" aria-keyshortcuts="ArrowLeft PageUp" disabled>上一页 <kbd>←</kbd></button><span id="page-number"></span><button id="next-page" aria-keyshortcuts="ArrowRight PageDown e" disabled>下一页 <kbd>→</kbd></button></div></div>';const linked=readingForLocation(readingPlace?.id);
 q('#read-excerpt').hidden=!!readingPlace&&readingPlace.id!=='sokaya';
 q('.scene-foot span').textContent='新参者 · '+chapters[chapterId].label;
 q('#read-chapter').innerHTML=chapters[chapterId].label+'全文 <kbd>2</kbd>';
 if(linked&&linked.chapterIds.length>1){
  const label=document.createElement('label');label.className='chapter-select';label.innerHTML='选择篇章 <kbd>C</kbd> <select aria-label="选择篇章" aria-keyshortcuts="c">'+linked.chapterIds.map(id=>`<option value="${id}" ${id===chapterId?'selected':''}>${chapters[id].label} · ${chapters[id].title}</option>`).join('')+'</select>';
  q('.book-heading').append(label);q('select').onchange=e=>{chapterId=Number(e.target.value);page=0;fullChapter=true;show('read')};
 }
 q('#read-excerpt').setAttribute('aria-pressed',!fullChapter);q('#read-chapter').setAttribute('aria-pressed',fullChapter);q('#read-excerpt').onclick=()=>{fullChapter=false;page=0;show('read')};q('#read-chapter').onclick=()=>{fullChapter=true;page=0;show('read')};try{const r=await fetch(fullChapter?chapters[chapterId].url:origin?'reading-sample.json':'senbei-reading.json');if(!r.ok)throw Error();const data=await r.json();if(token!==request||!dialog.open)return;q('.book-heading h3').textContent=fullChapter?chapters[chapterId].label+' · '+data.title:data.title;let remaining=data.paragraphs.join('\n\n');pages=[];const box=q('.book-page');while(remaining.length){let lo=1,hi=remaining.length,best=1;while(lo<=hi){const mid=Math.floor((lo+hi)/2);box.textContent=remaining.slice(0,mid);if(box.scrollHeight<=box.clientHeight){best=mid;lo=mid+1}else hi=mid-1}pages.push(remaining.slice(0,best));remaining=remaining.slice(best)}page=Math.min(page,pages.length-1);readingReady=true;renderPage();q('#prev-page').onclick=()=>turn(-1);q('#next-page').onclick=()=>turn(1);}catch{if(token===request)q('.book-heading h3').textContent='书页暂时无法打开，请重新选择阅读原著。';}}
 function renderPage(){q('.book-page').textContent=pages[page];q('#page-number').textContent=`${page+1} / ${pages.length}`;q('#prev-page').disabled=page===0;q('#next-page').disabled=page===pages.length-1;}
 function turn(d){if(!readingReady||mode!=='read')return;page=Math.max(0,Math.min(pages.length-1,page+d));renderPage()}
 dialog.addEventListener('close',()=>{request++;document.body.classList.remove('in-scene');onClose()});
 let size='';new ResizeObserver(entries=>{const r=entries[0].contentRect,key=Math.round(r.width)+':'+Math.round(r.height);if(key!==size){size=key;if(dialog.open&&mode==='read')show('read')}}).observe(dialog);
 return {open(readOnly=false,place=null){stop();origin=readOnly;readingPlace=place;chapterId=readingForLocation(place?.id)?.chapterIds[0]??1;fullChapter=!!place;page=0;shell();document.body.classList.add('in-scene');if(!dialog.open)dialog.showModal();show(readOnly?'read':'talk')},key(key,repeat=false){
 if(key.toLowerCase()==='c'&&mode==='read'&&q('select')){if(!repeat)q('select').focus();return true;}
 const action=sceneAction(key,mode,origin);if(!action)return false;if(repeat)return true;
 const click=selector=>{const button=q(selector);if(button&&!button.disabled&&!button.hidden)button.click()};
 if(action==='close')dialog.close();
 else if(action==='talk')show('talk');
 else if(action==='notes')show(mode==='notes'?'talk':'notes');
 else if(action==='read')show('read');
 else if(action==='excerpt')click('#read-excerpt');
 else if(action==='chapter')click('#read-chapter');
 else if(action==='previous-page')turn(-1);
 else if(action==='next-page')turn(1);
 else if(action==='previous-line')click('#previous');
 else if(action==='primary')click(mode==='talk'?'#next':'#note-action');
 return true;
 }};
}
