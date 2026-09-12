export function currentChapterNumber(reviews,total=9){
 for(let chapter=1;chapter<=total;chapter++)if(!reviews['ch'+String(chapter).padStart(2,'0')])return chapter;
 return total;
}

export function locationState({chapter,currentChapter,review,ambient=false}){
 if(ambient)return 'ambient';
 if(chapter>currentChapter)return 'locked';
 if(chapter===currentChapter)return 'active';
 if(review==='clear')return 'visited_cleared';
 if(review==='keep'||review==='confirm')return 'visited_suspect';
 return 'locked';
}

export function visibleEvidence(evidence,currentChapter){
 return evidence.filter(item=>item.unlockChapter<=currentChapter);
}
