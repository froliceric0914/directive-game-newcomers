export const fresh=()=>({version:1,day:1,energy:6,district:0,place:'senbei',clues:['case'],done:[],solved:[],journals:[],ending:null});
export function collect(s,id){if(!s.clues.includes(id))s.clues.push(id)}
export function act(s,a){if(s.ending)return '调查已经结束';if(s.done.includes(a.id))return '这条记录已经在手帐里';if(s.day<(a.day||1))return `第 ${a.day} 天起可以调查`;if((a.need||[]).some(x=>!s.clues.includes(x)))return '先沿着已有线索继续调查';if(s.energy<1)return '今天的精力用完了，回去整理手帐吧';s.energy--;s.done.push(a.id);(a.give||[]).forEach(x=>collect(s,x));return null}
export function connect(s,r,statement,evidence){if(s.ending)return false;if(statement!==r.statement||evidence!==r.evidence||!s.clues.includes(statement)||!s.clues.includes(evidence))return false;if(!s.solved.includes(r.id)){s.solved.push(r.id);collect(s,r.unlock)}return true}
export function verdict(s,person,motive,proof){return person==='岸田要作'&&motive==='掩盖侵吞财产'&&['replacement','fingerprints','ledger'].every(x=>proof.includes(x)&&s.clues.includes(x))}
export function nextDay(s,note,pins){if(s.ending)return;s.journals.push({day:s.day,note,pins:[...pins]});if(s.day===7){s.ending='timeout';return}s.day++;s.energy=6}
