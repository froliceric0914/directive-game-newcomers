import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {locations} from '../dist/walk-map.mjs';
import {chapters,readingForLocation} from '../dist/location-reading.mjs';
for(const location of locations){
 const reading=readingForLocation(location.id);
 assert.ok(reading?.chapterIds.length,location.name);
 assert.equal(location.reading,reading);
 for(const id of reading.chapterIds){
  const chapter=chapters[id];assert.ok(chapter);
  const body=JSON.parse(readFileSync(new URL('../dist/'+chapter.url,import.meta.url)));
  assert.equal(body.title,chapter.title);assert.equal(body.chapter,chapter.label);
  assert.ok(body.paragraphs.length>100,'a full chapter, not a scene excerpt');
 }
}
assert.deepEqual(readingForLocation('sokaya').chapterIds,[1]);
assert.deepEqual(readingForLocation('kiku').chapterIds,[2]);
assert.deepEqual(readingForLocation('craft').chapterIds,[8]);
assert.deepEqual(readingForLocation('suitengu').chapterIds,[4,5]);
for(const id of ['ubukeya','tamahide','kaiseiken','shigemori'])assert.equal(readingForLocation(id).kind,'related');
assert.equal(readingForLocation('missing'),null);
console.log('PASS: all 9 map locations have valid, correctly labelled full-chapter associations.');
