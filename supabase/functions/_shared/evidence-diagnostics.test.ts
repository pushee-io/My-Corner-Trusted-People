import test from 'node:test';
import assert from 'node:assert/strict';
import {EvidenceValidationError,evidenceFailureReason,validatedExcerpts} from './neighborhood-assistant.ts';
import type {Source} from './neighborhood-assistant.ts';
const source:Source={id:'97000000-0000-4000-8000-000000000001',kind:'event',title:'Festival fixture',text:'All sizes of pigs.\nLarge and small are encouraged to participate.',authority:'Event',publishedAt:'2026-09-28T00:00:00Z',href:'/events/97000000-0000-4000-8000-000000000001'};
const reply=(text:string)=>({status:'completed',output:[{content:[{type:'output_text',text}]}]});
const quotes=(excerpts:unknown)=>reply(JSON.stringify({excerpts}));
test('every evidence rejection has a fixed non-sensitive reason',()=>{
 const cases:[unknown,string][]=[
  [{status:'incomplete'},'response_incomplete'],[{status:'failed'},'response_failed'],[{},'response_not_completed'],
  [{status:'completed',output:[{content:[{type:'refusal',refusal:'PRIVATE'}]}]},'model_refusal'],
  [{status:'completed'},'missing_output_text'],[reply('PRIVATE INVALID JSON'),'invalid_json'],[reply('null'),'invalid_schema'],
  [quotes([null]),'invalid_schema'],[quotes(Array(6).fill({index:0,quote:'pigs'})),'too_many_excerpts'],
  [quotes([{index:9,quote:'pigs'}]),'invalid_index'],
  [quotes([{index:0,quote:''}]),'invalid_quote'],[quotes([{index:0,quote:'PRIVATE invented fact'}]),'quote_not_in_source'],
 ];
 for(const [input,reason]of cases)assert.throws(()=>validatedExcerpts(input as Parameters<typeof validatedExcerpts>[0],[source]),(e:unknown)=>{
  assert.ok(e instanceof EvidenceValidationError);assert.equal(evidenceFailureReason(e),reason);assert.doesNotMatch(JSON.stringify(e),/PRIVATE|invented/);return true;
 });
 assert.equal(evidenceFailureReason(new Error('PRIVATE raw response')),'unclassified');
});
test('exact multiline source excerpts pass; changed whitespace and invented summaries still fail closed',()=>{
 assert.deepEqual(validatedExcerpts(quotes([{index:0,quote:source.text}]),[source]),[{index:0,quote:source.text}]);
 assert.throws(()=>validatedExcerpts(quotes([{index:0,quote:source.text.replace('\n',' ')}]),[source]),(e:unknown)=>evidenceFailureReason(e)==='quote_not_in_source');
 assert.deepEqual(validatedExcerpts(quotes([]),[source]),[]);
});
test('valid duplicate selections collapse only after every quote passes grounding',()=>{
 assert.deepEqual(validatedExcerpts(quotes([{index:0,quote:'pigs'},{index:0,quote:'Large and small'}]),[source]),[{index:0,quote:'pigs'}]);
 assert.throws(()=>validatedExcerpts(quotes([{index:0,quote:'pigs'},{index:0,quote:'Invented traffic fact'}]),[source]),(e:unknown)=>evidenceFailureReason(e)==='quote_not_in_source');
});
