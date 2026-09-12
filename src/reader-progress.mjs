export const clampProgress=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(1,Number(value))):0;
export function readProgress(storage,key){try{const value=storage.getItem(key);return value===null?null:clampProgress(value)}catch{return null}}
export function writeProgress(storage,key,value){try{storage.setItem(key,String(clampProgress(value)));return true}catch{return false}}
export function scrollProgress(element){const range=element.scrollHeight-element.clientHeight;return range>0?clampProgress(element.scrollTop/range):0}
