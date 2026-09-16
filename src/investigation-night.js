import {nightMemories} from './investigation.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function renderNight(chapter,progress,view){
 const data=chapter.night.policeStation,labels=data.sectionLabels??{},choice=data.judgment.choices.find(item=>item.id===progress.nightJudgment);
 const small=value=>value?`<small>${esc(value)}</small>`:'';
 const next=(stage,label)=>`<button class="primary" data-night-stage="${stage}">${esc(label)}</button>`;
 let body='';
 if(view.stage===0)body=`${small(data.intro?.eyebrow)}<h3>${esc(data.intro?.title)}</h3>${data.intro?.text?`<p>${esc(data.intro.text)}</p>`:''}${next(1,'回看今天')}`;
 else if(view.stage===1)body=`${small(labels.memories)}${data.person?`<h3>${esc(data.person.name)}</h3><p>${esc(data.person.summary)}</p>`:''}<div class="narrative-memory-grid">${nightMemories(chapter,progress).map(memory=>`<div><strong>${esc(memory.title)}</strong><p>${esc(memory.text)}</p></div>`).join('')||'<p>今天还没有留下可回看的记忆。</p>'}</div>${next(2,'翻看加贺的记录')}`;
 else if(view.stage===2)body=`${small(labels.notes)}<h3>加贺的记录</h3><ol class="narrative-notes">${(data.kagaNotes??[]).slice(0,view.noteCount).map(note=>`<li>${esc(note.text)}</li>`).join('')}</ol><button class="primary" data-night-note>${view.noteCount<(data.kagaNotes??[]).length?'下一条记录':'形成今晚的判断'}</button>`;
 else if(view.stage===3)body=`${small(labels.judgment)}<h3>${esc(data.judgment.prompt)}</h3><div class="narrative-judgments">${data.judgment.choices.map(item=>`<button data-night-judgment="${item.id}">${esc(item.label)}</button>`).join('')}</div>`;
 else if(view.stage===4)body=`${small(labels.judgment)}<h3>${esc(choice?.label)}</h3><p>${esc(choice?.response)}</p>${next(5,data.judgment.continueLabel)}`;
 else if(view.stage===5)body=`${small(labels.resolution)}<h3>${esc(data.resolution.label)}</h3>${data.resolution.paragraphs.map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}<p class="narrative-final-line">${esc(data.resolution.finalLine)}</p>${next(6,'继续')}`;
 else body=`${small(data.completion.eyebrow)}<h3>${esc(data.completion.title)}</h3><p>${esc(data.completion.subtitle)}</p><button class="primary" data-night-finish>${esc(data.completion.actionLabel)}</button>${progress.nightCompleted?next(0,'重读本章回顾'):''}`;
 return `<article class="narrative-night ${view.stage===5?'narrative-resolution':view.stage===6?'narrative-completion':''}" data-resolution-status="${esc(data.resolution.status)}">${body}</article>`;
}
