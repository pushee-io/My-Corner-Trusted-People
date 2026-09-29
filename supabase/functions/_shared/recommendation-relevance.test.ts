import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPlan, searchNeighborhood, sourceRegistry } from './neighborhood-search.ts';
import { answerQuestion } from './neighborhood-service.ts';
import type { Kind, Source } from './neighborhood-assistant.ts';
const id='c4000000-0000-4000-8000-000000000001';
const paths={provider:'/hire/provider/',post:'/community?postId=',group:'/groups/',event:'/events/',agency:'/agency-broadcasts?broadcastId=',marketplace:'/marketplace/listing/'};
const source=(kind:Kind,text:string):Source=>({id,kind,text,title:'Fixture',authority:kind,href:paths[kind]+id,publishedAt:'2026-09-28T00:00:00Z'});
const questions=[['What is the best place for coffee?','coffee'],['Where can I get good sushi?','sushi'],['Can anybody recommend a great tailor?','tailor'],['Suggest a place for yoga','yoga'],['Does anyone know a good bookshop?','bookshop']];
test('recommendation wording never becomes an independent retrieval topic',()=>{
 for(const [q,topic] of questions)assert.equal(canonicalPlan(q).terms,topic,q);
});
test('every authorized family remains searchable with topical evidence in content or comments',async()=>{
 for(const kind of Object.keys(sourceRegistry) as Kind[])for(const [q,topic]of questions){
  const calls:Record<string,unknown>[]=[];
  const rpc=async(name:string,args?:Record<string,unknown>)=>{if(name.endsWith('_retrieve')){calls.push(args!);return {error:null,data:args?.source_kind===kind?[source(kind,'Best place. Great item. It is best to avoid traffic.'),source(kind,'Neighbor comment: Try '+topic+' at the local shop.')]:[]};}return {error:null,data:{id,name:'Fixture'}};};
  const result=await searchNeighborhood(q,rpc);
  assert.equal(result.sources.length,1,q+' '+kind);assert.match(result.sources[0].text,new RegExp(topic));
  assert.deepEqual(new Set(calls.map(c=>c.source_kind)),new Set(Object.keys(sourceRegistry)));
  assert.ok(calls.every(c=>c.terms===topic),'Topic reaches SQL before per-family cap');
 }
});
test('coffee query returns no matches for traffic, banku and generic praise even when model is unavailable',async()=>{
 let modelCalls=0;
 const rpc=async(name:string,args?:Record<string,unknown>)=>({error:null,data:name.endsWith('_retrieve')?[source(args?.source_kind as Kind,'It is best to avoid traffic. Make the best banku. She is the very best.')]:{id,name:'Fixture'}});
 const answer=await answerQuestion({question:questions[0][0]},{rpc,model:'fixture',respond:async()=>{modelCalls++;throw Error('Unavailable');}});
 assert.deepEqual(answer.sources,[]);assert.match(answer.notice,/no matching information/i);assert.equal(modelCalls,0);
});
test('topicless recommendation asks for a topic and never retrieves arbitrary cards',async()=>{
 const result=await searchNeighborhood('What is the best place?',async()=>{throw Error('Must not retrieve');});assert.deepEqual(result.sources,[]);
 assert.ok(canonicalPlan('Can you recommend somewhere?').details?.clarification);
});
test('literal multiword topics cannot match only an incidental word',async()=>{
 const { deterministicMatches }=await import('./neighborhood-search.ts');
 const candidates=[source('post','Coffee near the park'),source('post','Best iced tea here'),source('post','Try iced coffee here')];
 assert.deepEqual(deterministicMatches(canonicalPlan('Where can I get good iced coffee?'),candidates).map(s=>s.text),['Try iced coffee here']);
 assert.equal(deterministicMatches(canonicalPlan('coffee or tea'),candidates).length,3);
});
