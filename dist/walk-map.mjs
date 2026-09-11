import {readingForLocation} from './location-reading.mjs';
import {npcsAtLocation} from './npcs.mjs';
// Relative positions transcribed from the user's station-map photograph; not a surveyed map.
export const width=29,height=21,start={x:11,y:9};
export const locations=[
 {id:'kiku',name:'菊家',kind:'松矢料亭',x:4,y:3,w:5,h:4,door:{x:6,y:7},npc:'料亭店员'},
 {id:'ubukeya',name:'产毛屋',kind:'刀具老店',x:14,y:3,w:5,h:4,door:{x:16,y:7},npc:'刀具店员'},
 {id:'tamahide',name:'玉秀',kind:'鸡肉料理',x:1,y:12,w:4,h:4,door:{x:3,y:11},npc:'料理店员'},
 {id:'kaiseiken',name:'快生轩',kind:'复古咖啡店',x:6,y:12,w:4,h:4,door:{x:7,y:11},npc:'咖啡店员'},
 {id:'sokaya',name:'草加屋',kind:'仙贝店 ·「咸甜味」',x:14,y:12,w:4,h:3,door:{x:15,y:11},npc:'仙贝店员'},
 {id:'craft',name:'日本桥茄子',kind:'工艺品店 ·「童梦屋」',x:19,y:12,w:4,h:3,door:{x:20,y:11},npc:'工艺品店员'},
 {id:'benkei',name:'弁庆像',kind:'街边地标',x:25,y:12,w:3,h:3,door:{x:26,y:11}},
 {id:'shigemori',name:'重盛人形烧',kind:'人形烧店',x:14,y:16,w:5,h:2,door:{x:13,y:16},npc:'点心店员'},
 {id:'suitengu',name:'水天宫',kind:'保佑生育的神社',x:14,y:19,w:5,h:2,door:{x:13,y:19}}
];
// Only existing, source-backed shop associations receive a map binding.
for(const location of locations){location.npcIds=npcsAtLocation(location.id);location.reading=readingForLocation(location.id);}
export const inside=(x,y)=>x>=0&&y>=0&&x<width&&y<height;
export function walkable(x,y){return inside(x,y)&&((x>=10&&x<=12)||(y>=8&&y<=10)||locations.some(l=>l.door.x===x&&l.door.y===y))}
export function step(p,dx,dy){if(Math.abs(dx)+Math.abs(dy)!==1||!walkable(p.x+dx,p.y+dy))return p;return{x:p.x+dx,y:p.y+dy}}
export const nearby=p=>locations.find(l=>Math.abs(p.x-l.door.x)+Math.abs(p.y-l.door.y)<=1);
