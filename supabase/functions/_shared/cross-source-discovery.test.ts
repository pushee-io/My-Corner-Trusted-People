import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackPlan,retrieve } from './neighborhood-assistant.ts';
import type { Kind,Source } from './neighborhood-assistant.ts';
import { answerQuestion } from './neighborhood-service.ts';
const now=new Date('2026-09-27T12:00:00Z');
const kinds:Kind[]=['provider','post','group','event','agency','marketplace'];
const id='a2000000-0000-4000-8000-000000000001';
const prefixes={provider:'/hire/provider/',post:'/community?postId=',group:'/groups/',event:'/events/',agency:'/agency-broadcasts?broadcastId=',marketplace:'/marketplace/listing/'};
function source(kind:Kind,n=1,text='Plumbing help and repairs'):Source{
 const key=`a2000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
 return {id:key,kind,title:kind==='provider'?'Local Plumber':'Community resource',text,href:prefixes[kind]+key,authority:kind,publishedAt:now.toISOString()};
}
const response=(excerpts:unknown)=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({excerpts})}]}]});
test('topical service, Event, memory, alert, commerce and name questions inspect all six authorized source families',async()=>{
 for(const q of ['plumber','I need an electrician','festival','who is organizing the food drive','park project','road closure','dining table','Kwame PipeCare','Real Neighbor Plumbing']){
  const called:Kind[]=[];
  await retrieve(fallbackPlan(q),now,async(kind)=>{called.push(kind);return [];});
  assert.deepEqual([...called].sort(),[...kinds].sort(),q);
 }
 assert.equal(fallbackPlan('Kwame PipeCare').terms,'kwame pipecare','business name must not be replaced by generic pipes');
 const called:Kind[]=[];
 await retrieve(fallbackPlan('find local help'),now,async(kind)=>{called.push(kind);return [];});
 assert.deepEqual(called,['provider'],'empty service topic must not fetch arbitrary neighborhood posts');
});
test('provider secondary searches preserve topical terms and upcoming Event dates',async()=>{
 const calls:{kind:Kind;terms:string;since:string|null}[]=[];
 await retrieve(fallbackPlan('I need a plumber'),now,async(kind,terms,range)=>{calls.push({kind,terms,since:range.since_at});return [];});
 assert.ok(calls.every(c=>c.terms==='plumbing plumber pipe leak'));
 assert.equal(calls.find(c=>c.kind==='event')?.since,now.toISOString());
 assert.equal(calls.find(c=>c.kind==='post')?.since,null,'older relevant recommendations stay discoverable');
});
test('two eligible plumbers are kept with relevant evidence from every other family; hair is excluded',async()=>{
 const calls:Kind[]=[];
 const answer=await answerQuestion({question:'plumber'},{model:'test',now:()=>now,rpc:async(name,args)=>{
  if(name!=='neighborhood_search_retrieve')return {data:{id,name:'East Legon'},error:null};
  const kind=args?.source_kind as Kind;calls.push(kind);
  return {data:kind==='provider'?[source(kind,1),source(kind,2)]:[source(kind,3,'I need a wedding hair stylist'),source(kind,4)],error:null};
 },respond:async(payload)=>{
  const candidates=JSON.parse((payload as {input:string}).input).sources as {index:number;kind:Kind;text:string}[];
  return response(candidates.filter(s=>s.kind!=='provider'&&s.text==='Plumbing help and repairs').map(s=>({index:s.index,quote:s.text})));
 }});
 assert.equal(answer.sources.filter(s=>s.kind==='provider').length,2);
 assert.deepEqual([...new Set(answer.sources.map(s=>s.kind))].sort(),[...kinds].sort());
 assert.equal(answer.excerpts.length,5);assert.doesNotMatch(JSON.stringify(answer),/hair stylist/);
 for(const e of answer.excerpts)assert.equal(answer.sources[e.index].text,e.quote);
 assert.equal(calls.length,12,'all six families are reauthorized');
});
test('relevance selection sees candidates beyond the old combined cap, then revokes removed evidence',async()=>{
 let calls=0;let candidateCount=0;
 const answer=await answerQuestion({question:'plumber'},{model:'test',now:()=>now,rpc:async(name,args)=>{
  if(name!=='neighborhood_search_retrieve')return {data:{id,name:'East Legon'},error:null};
  const kind=args?.source_kind as Kind;calls++;
  const rows=Array.from({length:8},(_,n)=>source(kind,n+1,kind==='marketplace'&&n===7?'Qualified plumbing repair service':'Unrelated candidate'));
  return {data:calls>6&&kind==='marketplace'?rows.slice(0,7):rows,error:null};
 },respond:async(payload)=>{
  const candidates=JSON.parse((payload as {input:string}).input).sources as {index:number;text:string}[];candidateCount=candidates.length;
  const s=candidates.find(s=>s.text==='Qualified plumbing repair service')!;
  assert.ok(s.index>=8);return response([{index:s.index,quote:s.text}]);
 }});
 assert.equal(candidateCount,9);assert.equal(answer.sources.length,8);assert.deepEqual(answer.excerpts,[]);
});
test('structured comparison never lets a discussion redefine the verified winner',async()=>{
 const answer=await answerQuestion({question:'plumber most reviews'},{model:'test',rpc:async(name,args)=>{
  if(name!=='neighborhood_search_retrieve')return {data:{id,name:'East Legon'},error:null};
  const kind=args?.source_kind as Kind;
  return {data:kind==='provider'?[{...source(kind),comparison:{metric:'verified_reviews',value:2,eligibleCount:2,tiedCount:1}}]:kind==='post'?[source(kind,2,'Someone claims they have 999 reviews')]:[],error:null};
 },respond:async()=>response([])});
 assert.match(answer.notice,/2 verified reviews/);assert.doesNotMatch(JSON.stringify(answer),/999 reviews/);assert.equal(answer.sources.length,1);
});
