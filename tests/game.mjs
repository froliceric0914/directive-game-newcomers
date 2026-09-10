import assert from 'node:assert/strict';
import {fresh,act,connect,verdict,nextDay} from '../dist/engine.mjs';
import {places,clues,deductions} from '../dist/data.mjs';
const all=places.flatMap(p=>p.actions),byId=id=>all.find(a=>a.id===id);
assert.equal(new Set(all.map(a=>a.id)).size,all.length);
for(const a of all)for(const id of [...a.need||[],...a.give||[]])assert.ok(clues[id],id);
for(const r of deductions)for(const id of [r.statement,r.evidence,r.unlock])assert.ok(clues[id]);
let s=fresh();assert.ok(act(s,byId('m3')));assert.equal(s.energy,6);
assert.equal(act(s,byId('s1')),null);assert.equal(act(s,byId('s2')),null);
assert.ok(act(s,byId('s2')));assert.equal(s.energy,4);
assert.equal(connect(s,deductions[0],'insurance','top'),false);
assert.equal(connect(s,deductions[0],'insurance','stamp'),true);
assert.ok(s.clues.includes('family'));assert.equal(s.energy,4);
assert.equal(verdict(s,'岸田要作','掩盖侵吞财产',['replacement','fingerprints','ledger']),false);
// Exercise 200 different walk orders, resolving available contradictions between visits.
for(let trial=1;trial<=200;trial++){
 let seed=trial;let rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};s=fresh();
 for(let day=1;day<=7;day++){
  let loops=0;
  while(s.energy&&loops++<50){
   for(const r of deductions)connect(s,r,r.statement,r.evidence);
   let available=all.filter(a=>!s.done.includes(a.id)&&(a.day||1)<=s.day&&(a.need||[]).every(id=>s.clues.includes(id)));
   if(!available.length)break;
   assert.equal(act(s,available[Math.floor(rand()*available.length)]),null);
  }
  for(const r of deductions)connect(s,r,r.statement,r.evidence);
  if(day<7)nextDay(s,'明天继续核实。',s.clues.slice(0,3));
 }
 assert.equal(s.done.length,all.length,`walk ${trial}`);
 assert.equal(verdict(s,'岸田要作','掩盖侵吞财产',['replacement','fingerprints','ledger']),true);
 assert.equal(verdict(s,'田仓慎一','掩盖侵吞财产',['replacement','fingerprints','ledger']),false);
}
s=fresh();s.energy=0;assert.ok(act(s,byId('s1')));assert.equal(s.done.length,0);
for(let i=1;i<=7;i++)nextDay(s,'还没有结论。',[]);
assert.equal(s.day,7);assert.equal(s.ending,'timeout');assert.equal(s.journals.length,7);
assert.ok(act(s,byId('s1')));assert.equal(connect(s,deductions[0],'insurance','stamp'),false);
console.log('PASS: 200 investigation orders, complete clue reachability, seven-day deadline, energy, prerequisites, replay, deductions and verdict evidence checks.');
