import {characters,locations,storyLocations} from './game-data.js';

const entries=storyLocations.locations;
const seenByLocation=new Map();
const lastByLocation=new Map();
const characterAliases={kishida:'yasaku'};
const genericSpeakerLabels={shopkeeper:'店主',customer:'顾客',customer_a:'顾客',customer_b:'顾客',staff:'店员',visitor:'来访者',bartender:'酒保',office_staff:'事务所职员',office_staff_a:'事务所职员',office_staff_b:'事务所职员',actor:'演员',actor_a:'演员',actor_b:'演员',uesugi:'上杉'};

export function storyIdForMapLocation(location){return location?.storyLocationId??location?.id}
export function storyLocationForMap(location){return entries[storyIdForMapLocation(location)]??null}
export function mapLocationIdForStory(storyId){return locations.map.locations.find(location=>storyIdForMapLocation(location)===storyId)?.id??null}
export function mapLocationIdsForChapter(chapterId){return Object.values(entries).filter(location=>location.mapRequired&&location.chapterIds.includes(chapterId)).map(location=>mapLocationIdForStory(location.id)).filter(Boolean)}
export function trackerLocationForOrder(order){return Object.values(entries).find(location=>location.trackerOrder===order)??null}
export function trackerOrderForMap(location){return storyLocationForMap(location)?.trackerOrder??null}
export function dialogueStateForMapState(state){return state==='active'?'activeInvestigation':state==='visited_suspect'?'visitedSuspicious':state==='visited_cleared'?'visitedCleared':'ambient'}
export function resolveCharacterId(id){const resolved=characterAliases[id]??id;return characters[resolved]?resolved:null}
export function speakerLabel(id){const resolved=resolveCharacterId(id);return resolved?characters[resolved].name:(genericSpeakerLabels[id]??id)}

export function selectStoryDialogue(location,state){
 const story=storyLocationForMap(location);
 if(!story)return null;
 const order=[state,...storyLocations.selectionRules.fallbackOrder.filter(item=>item!==state)];
 const pool=order.map(key=>story.dialogues?.[key]??[]).find(items=>items.length)??[];
 if(!pool.length)return null;
 const seen=seenByLocation.get(story.id)??new Set(),last=lastByLocation.get(story.id);
 let group=pool.find(item=>!seen.has(item.id)&&item.id!==last)??pool.find(item=>item.id!==last)??pool[0];
 seen.add(group.id);seenByLocation.set(story.id,seen);lastByLocation.set(story.id,group.id);
 return {...group,story,state,participantIds:group.participants.map(resolveCharacterId).filter(Boolean),lines:group.lines.map(line=>[resolveCharacterId(line.speaker)??line.speaker,line.text,speakerLabel(line.speaker)])};
}
