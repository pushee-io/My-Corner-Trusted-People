import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPlan, searchNeighborhood, sourceRegistry } from './neighborhood-search.ts';
import { answerQuestion } from './neighborhood-service.ts';
import type { Kind, Source } from './neighborhood-assistant.ts';
const id='c4000000-0000-4000-8000-000000000001';
const paths={provider:'/hire/provider/',post:'/community?postId=',group:'/groups/',event:'/events/',agency:'/agency-broadcasts?broadcastId=',marketplace:'/marketplace/listing/'};
const source=(kind:Kind,text:string):Source=>({id,kind,text,title:'Fixture',authority:kind,href:paths[kind]+id,publishedAt:'2026-09-28T00:00:00Z'});
test('canonical query matrix normalizes concepts, metrics, fuzzy terms and service follow-up',()=>{
 for(const q of ['plumber','plumbing','plumbers','plumer'])assert.deepEqual(canonicalPlan(q).details?.categories,['plumbing'],q);
 for(const q of ['electrician','electrical','electrican'])assert.deepEqual(canonicalPlan(q).details?.categories,['electrical'],q);
 for(const q of ['highest rated plumber near me','most rated plumber'])assert.equal(canonicalPlan(q).details?.metric,'rating');
 assert.equal(canonicalPlan('what plumber has the most reviews').details?.metric,'verified_reviews');
 for(const q of ['power off','lights off'])assert.equal(canonicalPlan(q).intent,'alerts');
 for(const q of ['festival','music','festval'])assert.equal(canonicalPlan(q).window,'upcoming');
 assert.equal(canonicalPlan('food drive').intent,'organizer');
 assert.deepEqual(canonicalPlan('is that provider available today',['plumber']).details?.categories,['plumbing']);
});
test('Search is model/quota independent and AI model failure retains every relevant family',async()=>{
 for(const kind of Object.keys(sourceRegistry) as Kind[]){
  const calls:string[]=[];
  const rpc=async(name:string,args?:Record<string,unknown>)=>{calls.push(name);return {error:null,data:name.endsWith('_retrieve')?(args?.source_kind===kind?[source(kind,'Community plumbing help')]:[]):{id,name:'Fixture'}};};
  const search=await searchNeighborhood('plumber',rpc);
  assert.equal(search.sources.length,1,kind);
  assert.ok(!calls.some(c=>c.includes('ai_')),'Search cannot depend on AI flag/meter');
  const answer=await answerQuestion({question:'plumber'},{rpc,model:'fixture',respond:async()=>{throw new Error('Timeout PRIVATE_DETAIL');}});
  assert.deepEqual(answer.sources,search.sources,kind);
  assert.deepEqual(answer.excerpts,[]);
  assert.doesNotMatch(JSON.stringify(answer),/PRIVATE_DETAIL/);
 }
});
test('partial transient source failures preserve matches; auth failures and all-source outages fail closed',async()=>{
 for(const code of ['57014','42501']){
  const rpc=async(name:string,args?:Record<string,unknown>)=> name.endsWith('_retrieve')?(args?.source_kind==='post'?{data:null,error:{code}}:{data:args?.source_kind==='provider'?[source('provider','Plumbing')]:[],error:null}):{data:{id},error:null};
  if(code==='42501')await assert.rejects(searchNeighborhood('plumber',rpc));
  else {const result=await searchNeighborhood('plumber',rpc);assert.equal(result.sources.length,1);assert.deepEqual(result.unavailable,['post']);}
 }
 await assert.rejects(searchNeighborhood('plumber',async(name)=>name.endsWith('_retrieve')?{data:null,error:{code:'57014'}}:{data:{id},error:null}));
});
test('outage fallback excludes lighting Events and hair posts and refuses private queries without retrieval',async()=>{
 const rpc=async(name:string,args?:Record<string,unknown>)=>({data:name.endsWith('_retrieve')?(args?.source_kind==='event'?[source('event','Park lighting festival')]:args?.source_kind==='post'?[source('post','Power outage this morning')]:[]):{id},error:null});
 const result=await searchNeighborhood('lights off',rpc);
 assert.deepEqual(result.sources.map(s=>s.kind),['post']);
 for(const q of ['private messages','exact pickup location','job safety evidence','legal name']){
  const result=await searchNeighborhood(q,async()=>{throw new Error('Must not retrieve');});assert.deepEqual(result.sources,[]);
 }
});
test('source revocation and null final context still erase results after optional model work',async()=>{
 let checked=0;
 await assert.rejects(answerQuestion({question:'plumber'},{model:'fixture',rpc:async(name,args)=>{
  if(name==='neighborhood_ai_context')return {data:++checked===1?{id}:null,error:null};
  return {data:name.endsWith('_retrieve')?(args?.source_kind==='provider'?[source('provider','Plumbing')]:[]):{id},error:null};
 },respond:async()=>{throw new Error('No model');}}));
});
