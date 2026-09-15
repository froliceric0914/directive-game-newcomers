const key='investigation:ch1';
const initial={dayCompleted:false,unlockedMemories:[],nightJudgment:null,nightCompleted:false};
export function readCh1Progress(storage=localStorage){try{return {...initial,...JSON.parse(storage.getItem(key)||'{}')}}catch{return {...initial}}}
export function writeCh1Progress(patch,storage=localStorage){const next={...readCh1Progress(storage),...patch};storage.setItem(key,JSON.stringify(next));return next}
