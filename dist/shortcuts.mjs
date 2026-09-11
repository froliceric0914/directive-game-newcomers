// Contextual keys use unmodified keys shared by macOS and Windows.
export function sceneAction(key,mode,readOnly=false){
 const k=key.length===1?key.toLowerCase():key;
 if(k==='Escape')return 'close';
 if(k==='t'&&!readOnly)return 'talk';
 if(k==='j'&&!readOnly)return 'notes';
 if(k==='r')return 'read';
 if(mode==='read')return ({'1':'excerpt','2':'chapter',ArrowLeft:'previous-page',PageUp:'previous-page',ArrowRight:'next-page',PageDown:'next-page',e:'next-page'})[k]??null;
 if(mode==='talk')return ({ArrowLeft:'previous-line',ArrowRight:'primary',e:'primary'})[k]??null;
 return k==='e'?'primary':null;
}
