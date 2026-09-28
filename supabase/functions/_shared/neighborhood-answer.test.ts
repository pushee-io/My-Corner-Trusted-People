import test from 'node:test';
import assert from 'node:assert/strict';
import { groundedNotice } from './neighborhood-answer.ts';
import { answerQuestion, askFailure, AskAllowanceError } from './neighborhood-service.ts';
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
 assert.equal(calls.filter(c=>c.name==='neighborhood_search_retrieve').length,12);
 const options=calls.find(c=>c.args?.source_kind==='provider').args.options;
 assert.equal(options.metric,'verified_reviews');assert.deepEqual(options.categories,['electrical']);
 assert.doesNotMatch(JSON.stringify(result.diagnostics),/Fixture Electrician|what electrician|a1000000/);
});
test('power clarification executes no source retrieval or model call',async()=>{
 const result=await answerQuestion({question:'power'},{model:'test',rpc:async(name)=>{assert.notEqual(name,'neighborhood_search_retrieve');return {data:{id,name:'Fixture'},error:null};},respond:async()=>{throw new Error('No model needed');}});
 assert.deepEqual(result.clarification,['Power outage','Find electrician']);assert.deepEqual(result.sources,[]);
});
test('availability pronoun is ambiguous without selected source and reauthorized when selected',async()=>{
 const calls:any[]=[];
 const deps={model:'test',rpc:async(name:string,args?:Record<string,unknown>)=>{calls.push({name,args});return {data:name==='neighborhood_search_retrieve'?(args?.source_kind==='provider'?[provider]:[]):{id,name:'Fixture'},error:null};},respond:async()=>{throw new Error('No inferred availability');}};
 const ambiguous=await answerQuestion({question:'is he available today',history:['show electricians']},deps);assert.ok(ambiguous.clarification);
 const selected=await answerQuestion({question:'is he available today',history:['show electricians'],providerId:id},deps);assert.match(selected.notice,/cannot confirm/);
 assert.equal(calls.find(c=>c.args?.source_kind==='provider').args.options.providerId,id);
});

test('quota rejects before retrieval/model and returns a safe 429 instead of an outage',async()=>{
 const calls:string[]=[];
 await assert.rejects(answerQuestion({question:'I need someone to fix my fence'},{model:'test',rpc:async(name)=>{calls.push(name);return name==='neighborhood_ai_context'?{data:{id,name:'Fixture'},error:null}:{data:null,error:{code:'54000',message:'Ask My Corner allowance reached.'}};},respond:async()=>{throw new Error('Must not call model');}}),AskAllowanceError);
 assert.deepEqual(calls,['neighborhood_ai_context','neighborhood_ai_meter']);
 const limited=askFailure(new AskAllowanceError());assert.equal(limited.status,429);assert.equal(limited.body.code,'ASK_ALLOWANCE_REACHED');
 const unknown=askFailure(new Error('private server details'));assert.equal(unknown.status,503);assert.doesNotMatch(JSON.stringify(unknown),/private server/);
});
test('provider discussion queries use the service topic and discard unselected hair candidates',async()=>{
 const hair:Source={...provider,id:'a1000000-0000-4000-8000-000000000002',kind:'post',title:'Neighborhood post',text:'I need someone to style my hair',href:'/community?postId=a1000000-0000-4000-8000-000000000002'};
 const relevant:Source={...hair,id:'a1000000-0000-4000-8000-000000000003',text:'My friend is a good electrician',href:'/community?postId=a1000000-0000-4000-8000-000000000003'};
 const terms:string[]=[];
 const result=await answerQuestion({question:'I need an electrician'},{model:'test',rpc:async(name,args)=>{
  if(name!=='neighborhood_search_retrieve')return {data:{id,name:'Fixture'},error:null};
  if(args?.source_kind!=='provider')terms.push(String(args?.terms));
  return {data:args?.source_kind==='provider'?[provider]:args?.source_kind==='post'?[hair,relevant]:[],error:null};
 },respond:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({excerpts:[{index:1,quote:relevant.text}]})}]}]})});
 assert.ok(terms.every(t=>t==='electrical electrician wiring socket'));
 assert.deepEqual(result.sources.map(s=>s.id),[provider.id,relevant.id]);
 assert.deepEqual(result.excerpts,[{index:1,quote:relevant.text}]);
});
