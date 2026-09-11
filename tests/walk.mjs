import assert from 'node:assert/strict';
import {start,width,height,locations,walkable,step,nearby} from '../dist/walk-map.mjs';
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
const queue=[start],seen=new Set([`${start.x},${start.y}`]);
for(let i=0;i<queue.length;i++)for(const [dx,dy]of directions){const p=step(queue[i],dx,dy),key=`${p.x},${p.y}`;if(!seen.has(key)){seen.add(key);queue.push(p)}}
for(const l of locations){assert.ok(seen.has(`${l.door.x},${l.door.y}`),`${l.name} must be reachable`);assert.equal(nearby(l.door)?.id,l.id);for(let y=l.y;y<l.y+l.h;y++)for(let x=l.x;x<l.x+l.w;x++){assert.ok(x<width&&y<height);assert.equal(walkable(x,y),false,`${l.name} must block walking`)}}
assert.equal(step(start,1,1),start);
assert.deepEqual(step(start,1,0),{x:12,y:9});
assert.deepEqual(step({x:11,y:0},0,-1),{x:11,y:0});
assert.equal(locations.length,9);
console.log(`PASS: ${seen.size} connected road tiles; all 9 entrances reachable; buildings and bounds block movement.`);
