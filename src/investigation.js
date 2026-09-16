import {investigationChapters,locations} from './game-data.js';
import {mapLocationIdForStory} from './story-locations.js';
export const investigationLocationId=id=>mapLocationIdForStory(id)??locations.map.locations.find(place=>place.id===id)?.id??null;
export const loadChapter=id=>investigationChapters[Number(id)];
export const conversationNodes=flow=>Array.isArray(flow?.nodes)?Object.fromEntries(flow.nodes.map(node=>[node.id,node])):flow?.nodes??{};
export function chapterLocationIds(id){const day=loadChapter(id)?.day;return day?[day.locationId,day.secondaryLocationId,...(day.optionalVisits??[]).map(visit=>visit.locationId)].filter(Boolean).map(investigationLocationId).filter(Boolean):[]}
export function conversationForLocation(chapter,locationId,progress){
 const day=chapter?.day;if(!day)return null;
 const optional=(day.optionalVisits??[]).find(visit=>investigationLocationId(visit.locationId)===locationId);
 if(optional)return !progress.completedOptionalVisits.includes(optional.id)&&(!optional.availableAfterMemory||progress.unlockedMemories.includes(optional.availableAfterMemory))?{flow:optional.conversation,optional}:null;
 return !progress.dayCompleted&&[day.locationId,day.secondaryLocationId].map(investigationLocationId).includes(locationId)?{flow:day.activeConversation,optional:null}:null;
}
export function chapterMemories(chapter){
 const result={};
 const add=memories=>{for(const [key,value] of Object.entries(memories??{}))result[value.id??key]=value};
 add(chapter.day.memories);add(chapter.day.activeConversation?.memories);
 for(const visit of chapter.day.optionalVisits??[]){add(visit.memories);add(visit.conversation?.memories);for(const node of Object.values(conversationNodes(visit.conversation))){if(node.unlockMemory&&!result[node.unlockMemory]&&typeof node.feedback==='object')result[node.unlockMemory]={id:node.unlockMemory,...node.feedback}}}
 return result;
}
export function nightMemories(chapter,progress){const memories=chapterMemories(chapter);return (chapter.night.policeStation.memoryCards??[]).filter(card=>!card.requiresUnlocked||progress.unlockedMemories.includes(card.memoryId)).map(card=>memories[card.memoryId]).filter(memory=>memory&&memory.showAtNight!==false)}
