import assert from 'node:assert/strict';
import {sceneAction} from '../dist/shortcuts.mjs';
for(const mode of ['talk','notes','read']){
 assert.equal(sceneAction('Escape',mode),'close');
 assert.equal(sceneAction('J',mode),'notes');
 assert.equal(sceneAction('R',mode),'read');
 assert.equal(sceneAction('T',mode),'talk');
 assert.equal(sceneAction('Tab',mode),null,'native focus navigation remains available');
 assert.equal(sceneAction('Enter',mode),null,'native button activation remains available');
 assert.equal(sceneAction(' ',mode),null);
}
assert.equal(sceneAction('ArrowLeft','talk'),'previous-line');
assert.equal(sceneAction('ArrowRight','talk'),'primary');
assert.equal(sceneAction('e','notes'),'primary');
assert.equal(sceneAction('ArrowLeft','read'),'previous-page');
assert.equal(sceneAction('PageDown','read'),'next-page');
assert.equal(sceneAction('1','read'),'excerpt');
assert.equal(sceneAction('2','read'),'chapter');
assert.equal(sceneAction('1','talk'),null);
assert.equal(sceneAction('t','read',true),null,'standalone reader cannot open shop dialogue');
assert.equal(sceneAction('j','read',true),null);
console.log('PASS: contextual shortcuts, uppercase keys, standalone reading and native keyboard navigation.');
