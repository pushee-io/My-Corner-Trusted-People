import test from 'node:test';
import assert from 'node:assert/strict';
import { answerQuestion,askFailure,AskAllowanceError } from './neighborhood-service.ts';
import type { Kind,Source } from './neighborhood-assistant.ts';
const id='b3000000-0000-4000-8000-000000000001';
const now=new Date('2026-09-27T20:52:00Z');
const source=(kind:Kind,n:number):Source=>({id:`b3000000-0000-4000-8000-${String(n).padStart(12,'0')}`,kind,title:`Matching ${kind} ${n}`,text:'Recorded plumbing and electrical services',href:`${kind==='provider'?'/hire/provider/':'/community?postId='}b3000000-0000-4000-8000-${String(n).padStart(12,'0')}`,authority:kind,publishedAt:now.toISOString()});
const invalid=()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({excerpts:[{index:0,quote:'PRIVATE MODEL FABRICATION'}]})}]}]});
function harness(options:{secondary?:boolean;providers?:boolean;removed?:boolean;denied?:boolean;modelThrows?:boolean;quota?:boolean}={}){
 const calls:{name:string;args?:Record<string,unknown>}[]=[];const traces:Record<string,unknown>[]=[];let modelCalls=0,searches=0,contexts=0;
 return {calls,traces,get modelCalls(){return modelCalls;},deps:{model:'test',now:()=>now,trace:(data:Record<string,unknown>)=>traces.push(data),
 rpc:async(name:string,args?:Record<string,unknown>)=>{
  calls.push({name,args});
  if(name==='neighborhood_ai_context'){contexts++;return {data:{id,name:'East Legon'},error:options.denied&&contexts>1?{message:'PRIVATE CONTEXT ERROR'}:null};}
  if(name==='neighborhood_ai_meter')return {data:{id},error:options.quota&&args?.action==='start'?{code:'54000'}:null};
  searches++;const kind=args?.source_kind as Kind;
  return {data:options.removed&&searches>6?[]:kind==='provider'&&options.providers!==false?[source(kind,1),source(kind,2)]:kind==='post'&&options.secondary?[source(kind,3)]:[],error:null};
 },respond:async()=>{modelCalls++;if(options.modelThrows)throw Error('PRIVATE UPSTREAM ERROR');return invalid();}}};
}
test('direct provider questions keep both SQL matches without a model dependency while searching every source family',async()=>{
 for(const question of ['I need a plumber today','plumbing','I need an electrician','electrician most reviews']){
  const h=harness();const answer=await answerQuestion({question},h.deps);
  assert.equal(answer.sources.length,2,question);assert.equal(h.modelCalls,0);
  assert.deepEqual(answer.excerpts,[]);assert.equal(h.calls.filter(x=>x.name==='neighborhood_search_retrieve').length,12);
  assert.equal((h.calls.find(x=>x.args?.action==='finish')!.args!.payload as {outcome:string}).outcome,'answered');
 }
});
test('invalid quotes and upstream failure retain deterministic provider and Feed matches with no model fabrication',async()=>{
 for(const modelThrows of [false,true]){
  const h=harness({secondary:true,modelThrows});const answer=await answerQuestion({question:'plumber'},h.deps);
  assert.equal(h.modelCalls,1);assert.equal(answer.sources.length,3);assert.equal(answer.sources.filter(s=>s.kind==='provider').length,2);
  assert.deepEqual(answer.excerpts,[]);assert.match(answer.notice,/AI explanation is temporarily unavailable/);
  assert.doesNotMatch(JSON.stringify([answer,h.traces]),/PRIVATE|UPSTREAM|FABRICATION/);
  assert.deepEqual(h.traces,[{event:'ask_evidence_fallback',stage:modelThrows?'evidence_model':'evidence_validation',intent:'providers',providerCount:2}]);
 }
});
test('fallback cannot retain a provider removed during evidence selection or bypass final authorization',async()=>{
 const h=harness({secondary:true,removed:true});const answer=await answerQuestion({question:'plumber'},h.deps);
 assert.deepEqual(answer.sources,[]);assert.deepEqual(answer.excerpts,[]);
 const denied=harness({secondary:true,denied:true});await assert.rejects(answerQuestion({question:'plumber'},denied.deps));
 assert.equal(denied.traces.at(-1)?.stage,'final_context');
});
test('Feed-only matches survive evidence failure without fabricating a provider',async()=>{
 const h=harness({secondary:true,providers:false});const answer=await answerQuestion({question:'plumber'},h.deps);
 assert.equal(answer.sources.length,1);assert.equal(answer.sources[0].kind,'post');assert.deepEqual(answer.excerpts,[]);
 assert.equal((h.calls.find(x=>x.args?.action==='finish')!.args!.payload as {outcome:string}).outcome,'answered');
});
test('daily allowance is still enforced before retrieval and stays distinct from evidence failures',async()=>{
 const h=harness({quota:true});await assert.rejects(answerQuestion({question:'plumber'},h.deps),AskAllowanceError);
 assert.equal(h.modelCalls,0);assert.ok(!h.calls.some(x=>x.name==='neighborhood_search_retrieve'));
 assert.equal(askFailure(new AskAllowanceError()).status,429);
 assert.equal(askFailure(new Error('PRIVATE')).status,503);
 assert.doesNotMatch(JSON.stringify(askFailure(new Error('PRIVATE'))),/PRIVATE/);
});
test('diagnostic sink failure cannot erase recovered provider cards',async()=>{
 const h=harness({secondary:true});const answer=await answerQuestion({question:'plumber'},{...h.deps,debug:true,trace:()=>{throw Error('logger unavailable');}});
 assert.equal(answer.sources.length,3);
});
