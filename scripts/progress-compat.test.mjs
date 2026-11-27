import assert from 'node:assert/strict';
import test from 'node:test';
import { legacyProgressView, progressWriteBody } from '../src/lib/progress-compat.ts';

const old = {slug:'grep-va-regex',completedAt:'2026-01-01T00:00:00Z',quizScore:3,quizTotal:5};

test('completed combined lesson carries completion to its split topics without copying old quiz scores',()=>{
 const view=legacyProgressView([old]);
 for(const slug of ['lenh-grep','bieu-thuc-chinh-quy']) {
  assert.equal(view.get(slug).completedAt,old.completedAt);
  assert.equal(view.get(slug).legacySource,old.slug);
  assert.equal(view.get(slug).quizScore,null);
  assert.equal(view.get(slug).quizTotal,null);
 }
 assert.equal(view.get(old.slug).quizScore,3);
 assert.equal(old.slug,'grep-va-regex');
});

test('an explicit new record wins, including a deliberate unmark',()=>{
 const current={slug:'lenh-grep',completedAt:null,quizScore:1,quizTotal:4};
 const view=legacyProgressView([old,current]);
 assert.equal(view.get('lenh-grep').completedAt,null);
 assert.equal(view.get('lenh-grep').quizScore,1);
 assert.equal(view.get('lenh-grep').legacySource,undefined);
 assert.equal(view.get('bieu-thuc-chinh-quy').completedAt,old.completedAt);
});

test('a legacy quiz alone does not complete replacement topics',()=>{
 const view=legacyProgressView([{...old,completedAt:null}]);
 assert.equal(view.has('lenh-grep'),false);
 assert.equal(view.get(old.slug).quizScore,3);
});

test('saving the first new quiz persists inherited completion but explicit unmark is respected',()=>{
 const view=legacyProgressView([old]);
 assert.deepEqual(progressWriteBody('lenh-grep',{quizScore:4,quizTotal:4},view),{quizScore:4,quizTotal:4,completed:true});
 assert.deepEqual(progressWriteBody('lenh-grep',{completed:false},view),{completed:false});
 assert.deepEqual(progressWriteBody('other',{quizScore:2,quizTotal:4},view),{quizScore:2,quizTotal:4});
});

test('all retired teaching slugs retain completion mappings; preparation stays historical only',()=>{
 const fixtures=[
  ['linux-la-gi',['cau-truc-he-dieu-hanh']],
  ['tim-kiem-file',['lenh-find','whereis-va-which']],
  ['tai-khoan-va-nhom',['quan-tri-nguoi-dung','quan-tri-nhom']],
 ];
 for(const [slug,targets] of fixtures) {
  const view=legacyProgressView([{...old,slug}]);
  for(const target of targets) assert.equal(view.get(target).completedAt,old.completedAt);
 }
 const prep={...old,slug:'moi-truong-thuc-hanh'};
 assert.deepEqual([...legacyProgressView([prep]).keys()],[prep.slug]);
});

test('completing a current lesson never auto-completes a different new topic',()=>{
 const current={...old,slug:'phan-quyen-file',quizScore:4,quizTotal:4};
 const view=legacyProgressView([current]);
 assert.equal(view.has('lenh-phan-quyen'),false);
 assert.equal(view.get(current.slug).quizScore,4);
});
