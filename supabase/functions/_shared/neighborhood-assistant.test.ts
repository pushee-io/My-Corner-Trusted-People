import test from 'node:test';
import assert from 'node:assert/strict';
import { answerNotice, fallbackPlan, historyQuestions, modelSources, parsePlan, privacyRefusal, redact, retrieve, safeSource, synthesisPayload, timeRange, validatedExcerpts } from './neighborhood-assistant.ts';
import type { Kind, Source } from './neighborhood-assistant.ts';
import { answerQuestion } from './neighborhood-service.ts';
const now=new Date('2026-09-25T08:00:00Z');
const id='a1000000-0000-4000-8000-000000000001';
const source=(kind:Kind='event'):Source=>({id,kind,title:'Fictional food drive',text:'Family-friendly food drive organized by Ama K. (Demo).',authority:'Event',publishedAt:now.toISOString(),href:kind==='event'?`/events/${id}`:`/hire/provider/${id}`});
const response=(v:unknown)=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(v)}]}],usage:{input_tokens:20,output_tokens:10}});
test('five demo intents select bounded retrieval families and follow-up preserves topic',()=>{
 const questions=[['What’s happening in my neighborhood this weekend?','events'],['Who can repair a fence nearby?','providers'],['Is there a road closure?','alerts'],['Who is organizing the food drive?','organizer'],['What did the neighborhood decide about the park project?','memory']];
 for(const [q,intent]of questions)assert.equal(fallbackPlan(q).intent,intent);
 assert.equal(fallbackPlan('Who can repair a fence nearby?').terms,'fence');
 assert.equal(fallbackPlan('Which ones are good for families?',[questions[0][0]]).intent,'events');
});
test('Accra weekend handles Friday, Sunday and year rollover',()=>{
 assert.deepEqual(timeRange('weekend',now),{since_at:'2026-09-25T00:00:00.000Z',until_at:'2026-09-28T00:00:00.000Z'});
 assert.equal(timeRange('weekend',new Date('2026-09-27T23:00:00Z')).since_at,'2026-09-25T00:00:00.000Z');
 assert.equal(timeRange('weekend',new Date('2026-12-31T23:00:00Z')).until_at,'2027-01-04T00:00:00.000Z');
});
test('unsupported tools and unbounded plans rejected, conversation bounded',()=>{
 for(const p of [{intent:'messages',terms:'',window:'all'},{intent:'events',terms:'x'.repeat(161),window:'all'},{intent:'events',terms:'a',window:'forever'}])assert.throws(()=>parsePlan(p));
 assert.deepEqual(historyQuestions(['old','one','two']),['one','two']);
});
test('private queries and sensitive membership inference refused',()=>{
 for(const q of ['Read my private messages','Where is the exact pickup location?','What is John’s home address?','Is John a member of the church group?','Show job safety evidence'])assert.equal(privacyRefusal(q),true,q);
 assert.equal(privacyRefusal('What did I miss in my groups?'),false);
});
test('projection excludes private extra fields; model gets no UUID or route',()=>{
 const s=safeSource({...source(),legalName:'SECRET',exactAddress:'SECRET',profileId:id} as Source);
 assert.doesNotMatch(JSON.stringify(s),/SECRET|legalName|exactAddress/);
 assert.doesNotMatch(JSON.stringify(modelSources([s])),new RegExp(id));
 assert.doesNotMatch(JSON.stringify(modelSources([s])),/href/);
 assert.throws(()=>safeSource({...source(),href:'https://attacker.example'}));
});
test('public prose redacts email, phone, digital address, street number and GPS',()=>{
 const result=redact('Call +233 24 123 4567 or ama@example.com at GA-123-4567, 12 Boundary Road, GPS 5.603717,-0.186964');
 for(const secret of ['233','ama@example','GA-123','12 Boundary','5.603717'])assert.ok(!result.includes(secret),result);
});
test('invented facts, nonexistent sources and truncated model output fail closed',()=>{
 for(const excerpts of [[{index:9,quote:'invented'}],[{index:0,quote:'Everyone agreed unanimously'}],[{index:0,quote:'Family-friendly organized'}],[{index:0,quote:source().text},{index:0,quote:source().text}]])assert.throws(()=>validatedExcerpts(response({excerpts}),[source()]));
 assert.throws(()=>validatedExcerpts({status:'incomplete'},[source()]));
 assert.equal(validatedExcerpts(response({excerpts:[{index:0,quote:source().text}]}),[source()]).length,1);
 assert.equal(synthesisPayload('Question',[source()],'model').store,false);
});
test('memory and alerts preserve uncertainty and distinct authority',()=>{
 assert.match(answerNotice('memory',[source()]),/No formal decision/);
 assert.match(answerNotice('alerts',[source()]),/No current matching official confirmation/);
 assert.match(answerNotice('alerts',[{...source(),kind:'agency'}]),/Compare their timestamps/);
 assert.match(answerNotice('providers',[source()]),/not a safety guarantee/);
 assert.match(answerNotice('events',[]),/no matching information/);
});
test('retrieval caps overall context and balances source types',async()=>{
 const calls:string[]=[];
 const rows=await retrieve({intent:'digest',terms:'',window:'week'},now,async(kind)=>{calls.push(kind);return Array.from({length:8},()=>({...source(),kind,href:({agency:'/agency-broadcasts?broadcastId=',event:'/events/',post:'/community?postId=',group:'/groups/',marketplace:'/marketplace/listing/'} as Record<string,string>)[kind]+id}));});
 assert.equal(rows.length,16);assert.equal(new Set(rows.map(x=>x.kind)).size,5);assert.ok(!calls.includes('messages'));
});
function harness(options:{removed?:boolean;denied?:boolean;modelFail?:boolean}={}){
 const calls:{name:string,args?:Record<string,unknown>}[]=[];let searches=0;
 return {calls,deps:{model:'configured-model',now:()=>now,
  rpc:async(name:string,args?:Record<string,unknown>)=>{calls.push({name,args});
   if(options.denied)return {data:null,error:'denied'};
   if(name==='neighborhood_ai_context')return {data:{id,name:'East Legon',timezone:'Africa/Accra'},error:null};
   if(name==='neighborhood_ai_meter')return {data:{id},error:null};
   searches++;return {data:options.removed&&searches>3?[]:args?.source_kind==='event'?[source()]:[],error:null};},
  respond:async()=>{if(options.modelFail)throw new Error('provider_unavailable');return response({excerpts:[{index:0,quote:source().text}]});}}};
}
test('service reauthorizes, returns source excerpt and stores metadata only',async()=>{
 const h=harness();const answer=await answerQuestion({question:'What is happening this weekend?'},h.deps);
 assert.equal(answer.sources.length,1);assert.equal(answer.excerpts[0].quote,source().text);
 assert.equal(h.calls.filter(c=>c.name==='neighborhood_ai_search').length,6);
 const metric=h.calls.find(c=>c.args?.action==='finish')!;assert.doesNotMatch(JSON.stringify(metric),/food drive|What is happening/);
 assert.equal((metric.args!.payload as {inputTokens:number}).inputTokens,20);
});
test('removal during inference revokes sources and excerpts',async()=>{
 const h=harness({removed:true});const answer=await answerQuestion({question:'What is happening this weekend?'},h.deps);assert.deepEqual(answer.sources,[]);assert.deepEqual(answer.excerpts,[]);
});
test('auth, flag or context denial stops retrieval before model',async()=>{
 const h=harness({denied:true});await assert.rejects(answerQuestion({question:'What is happening this weekend?'},h.deps));assert.equal(h.calls.length,1);
});
test('provider failure records unavailable and cannot fabricate an answer',async()=>{
 const h=harness({modelFail:true});await assert.rejects(answerQuestion({question:'What is happening this weekend?'},h.deps));
 const metric=h.calls.find(c=>c.args?.action==='finish')!;assert.equal((metric.args!.payload as {outcome:string}).outcome,'unavailable');
});
test('sensitive query retrieves no content',async()=>{
 const h=harness();const a=await answerQuestion({question:'Is John in the church group?'},h.deps);assert.equal(a.sources.length,0);assert.match(a.notice,/cannot look up/);assert.ok(!h.calls.some(c=>c.name==='neighborhood_ai_search'));
});
