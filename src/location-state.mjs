export function currentChapterNumber(reviews,total=9){
 for(let chapter=1;chapter<=total;chapter++)if(!reviews['ch'+String(chapter).padStart(2,'0')])return chapter;
 return total;
}

export function storyProgress(reviews,started,total=9){
 const completedChapters=Array.from({length:total},(_,index)=>index+1).filter(chapter=>reviews['ch'+String(chapter).padStart(2,'0')]);
 const currentChapter=started?Array.from({length:total},(_,index)=>index+1).find(chapter=>!reviews['ch'+String(chapter).padStart(2,'0')])??null:null;
 return {completedCount:completedChapters.length,currentChapter,currentIndex:started?(currentChapter?currentChapter-1:total):null,total,complete:started&&currentChapter===null,started};
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
