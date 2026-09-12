import {locations as world} from './game-data.mjs';
import {readingForLocation} from './location-reading.mjs';
import {npcsAtLocation} from './npcs.mjs';
// Relative positions transcribed from the user's station-map photograph; not a surveyed map.
export const {width,height,start}=world.map;
export const locations=world.map.locations.map(location=>({...location}));
// Only existing, source-backed shop associations receive a map binding.
for(const location of locations){location.npcIds=npcsAtLocation(location.id);location.reading=readingForLocation(location.id);}
export const inside=(x,y)=>x>=0&&y>=0&&x<width&&y<height;
export function walkable(x,y){return inside(x,y)&&((x>=10&&x<=12)||(y>=8&&y<=10)||locations.some(l=>l.door.x===x&&l.door.y===y))}
export function step(p,dx,dy){if(Math.abs(dx)+Math.abs(dy)!==1||!walkable(p.x+dx,p.y+dy))return p;return{x:p.x+dx,y:p.y+dy}}
export const nearby=p=>locations.find(l=>Math.abs(p.x-l.door.x)+Math.abs(p.y-l.door.y)<=1);
