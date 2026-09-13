import assert from 'node:assert/strict';
import {currentChapterNumber,locationState,storyProgress,visibleEvidence} from '../src/location-state.mjs';

const reviews={ch01:'clear',ch02:'clear',ch03:'keep'};
assert.equal(currentChapterNumber(reviews),4);
assert.equal(locationState({chapter:1,currentChapter:4,review:'clear'}),'visited_cleared');
assert.equal(locationState({chapter:2,currentChapter:4,review:'clear'}),'visited_cleared');
assert.equal(locationState({chapter:3,currentChapter:4,review:'keep'}),'visited_suspect');
assert.equal(locationState({chapter:4,currentChapter:4}),'active');
assert.equal(locationState({chapter:5,currentChapter:4}),'locked');
assert.equal(locationState({chapter:2,currentChapter:4,review:'clear',ambient:true}),'ambient');
assert.deepEqual(visibleEvidence([{id:'a',unlockChapter:1},{id:'b',unlockChapter:3},{id:'future',unlockChapter:5}],3).map(item=>item.id),['a','b']);
assert.deepEqual(storyProgress({},false),{completedCount:0,currentChapter:null,currentIndex:0,total:10,complete:false});
assert.deepEqual(storyProgress(reviews,true),{completedCount:4,currentChapter:4,currentIndex:4,total:10,complete:false});
assert.deepEqual(storyProgress(Object.fromEntries(Array.from({length:9},(_,index)=>['ch'+String(index+1).padStart(2,'0'),'clear'])),true),{completedCount:10,currentChapter:null,currentIndex:10,total:10,complete:true});
console.log('PASS: chapter 4 location states, cleared/suspected revisits, future locks, and ambient override.');
