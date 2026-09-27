import test from 'node:test';
import assert from 'node:assert/strict';
import { groundedNotice } from './neighborhood-answer.ts';
import { answerQuestion } from './neighborhood-service.ts';
import { fallbackPlan,safeSource } from './neighborhood-assistant.ts';
import type { Source } from './neighborhood-assistant.ts';
const id='a1000000-0000-4000-8000-000000000001';
const provider:Source={id,kind:'provider',title:'Fixture Electrician',text:'Electrical services',href:'/hire/provider/'+id,authority:'Provider profile',publishedAt:'2026-09-27T00:00:00Z',comparison:{metric:'verified_reviews',value:7,eligibleCount:14,tiedCount:2}};
test('comparison uses SQL population and ties; no rating or availability invention',()=>{
 const notice=groundedNotice(fallbackPlan('electrician most reviews'),[provider]);
 assert.match(notice,/14 matching eligible providers/);assert.match(notice,/7 verified reviews/);assert.match(notice,/2 are tied/);
 assert.match(groundedNotice(fallbackPlan('electrician available today'),[provider]),/cannot confirm availability/);
 assert.match(groundedNotice(fallbackPlan('highest rated plumber'),[]),/No ranking can be established/);
 assert.throws(()=>safeSource({...provider,comparison:{...provider.comparison!,tiedCount:15}}));
});
test('comparison executes structured RPC and reauthorization without asking model to compute',async()=>{
 const calls:any[]=[];
 const result=await answerQuestion({question:'what electrician has the most reviews'}, {model:'test',debug:true,rpc:async(name,args)=>{calls.push({name,args});if(name==='neighborhood_ai_context')return {data:{id,name:'Fixture neighborhood'},error:null};if(name==='neighborhood_ai_meter')return {data:{id},error:null};return {data:args?.source_kind==='provider'?[provider]:[],error:null};},respond:async()=>{throw new Error('Model must not compute');}});
 assert.match(result.notice,/7 verified reviews/);
 assert.equal(calls.filter(c=>c.name==='neighborhood_ai_retrieve').length,6);
 const options=calls.find(c=>c.args?.source_kind==='provider').args.options;
 assert.equal(options.metric,'verified_reviews');assert.deepEqual(options.categories,['electrical']);
 assert.doesNotMatch(JSON.stringify(result.diagnostics),/Fixture Electrician|what electrician|a1000000/);
});
test('power clarification executes no source retrieval or model call',async()=>{
 const result=await answerQuestion({question:'power'},{model:'test',rpc:async(name)=>{assert.notEqual(name,'neighborhood_ai_retrieve');return {data:{id,name:'Fixture'},error:null};},respond:async()=>{throw new Error('No model needed');}});
 assert.deepEqual(result.clarification,['Power outage','Find electrician']);assert.deepEqual(result.sources,[]);
});
test('availability pronoun is ambiguous without selected source and reauthorized when selected',async()=>{
 const calls:any[]=[];
 const deps={model:'test',rpc:async(name:string,args?:Record<string,unknown>)=>{calls.push({name,args});return {data:name==='neighborhood_ai_retrieve'?(args?.source_kind==='provider'?[provider]:[]):{id,name:'Fixture'},error:null};},respond:async()=>{throw new Error('No inferred availability');}};
 const ambiguous=await answerQuestion({question:'is he available today',history:['show electricians']},deps);assert.ok(ambiguous.clarification);
 const selected=await answerQuestion({question:'is he available today',history:['show electricians'],providerId:id},deps);assert.match(selected.notice,/cannot confirm/);
 assert.equal(calls.find(c=>c.args?.source_kind==='provider').args.options.providerId,id);
});
