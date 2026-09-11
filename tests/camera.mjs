import assert from 'node:assert/strict';
import {cameraFrame} from '../dist/camera.mjs';
import {width,height,nearby,walkable} from '../dist/walk-map.mjs';
let checked=0;
for(const size of [264,280,341,356,396,540,714,820]){
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  if(!walkable(x,y))continue;
  const shop=nearby({x,y}),f=cameraFrame({x,y},shop,size),b=f.bounds;
  assert.ok(f.padding+b.left-f.left>=12);
  assert.ok(f.padding+b.right-f.left<=size-12);
  assert.ok(f.padding+b.top-f.top>=12);
  assert.ok(f.padding+b.bottom-f.top<=size-12);
  assert.ok(f.left>=0&&f.top>=0);
  assert.ok(f.left<=928+f.padding*2-size&&f.top<=672+f.padding*2-size);
  if(!shop){assert.equal(f.padding+(x+.5)*32-f.left,size/2);assert.equal(f.padding+(y+.5)*32-f.top,size/2)}
  checked++;
 }
}
console.log(`PASS: ${checked} camera frames; nearby shops and player fully visible, centered follow elsewhere, edges reachable.`);
