const empty=()=>({dayCompleted:false,unlockedMemories:[],completedOptionalVisits:[],nightJudgment:null,nightCompleted:false});
export function readInvestigationProgress(id){try{const saved=JSON.parse(localStorage.getItem(`investigation:ch${id}`)||'null');return {...empty(),...saved}}catch{return empty()}}
export function writeInvestigationProgress(id,patch){const progress={...readInvestigationProgress(id),...patch};try{localStorage.setItem(`investigation:ch${id}`,JSON.stringify(progress))}catch{}return progress}
