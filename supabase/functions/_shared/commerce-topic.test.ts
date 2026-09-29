import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPlan, searchNeighborhood, sourceRegistry } from './neighborhood-search.ts';
import { answerQuestion } from './neighborhood-service.ts';
import type { Source } from './neighborhood-assistant.ts';
const id='c4000000-0000-4000-8000-000000000001';
const listing=(title:string,n:number):Source=>({id:id.slice(0,-1)+n,kind:'marketplace',title,text:'Item for sale',authority:'Marketplace listing',href:'/marketplace/listing/'+id.slice(0,-1)+n,publishedAt:'2026-09-28T00:00:00Z'});
test('commerce requests preserve arbitrary item keywords instead of browsing every listing',()=>{
 for(const [question,terms] of [['I want to buy banku','banku'],['buying rice','rice'],['sell a bicycle','bicycle'],['purchase tablecloth','tablecloth'],['Marketplace banku','banku'],['buy banku machine','banku machine']]){
  const plan=canonicalPlan(question);assert.equal(plan.intent,'marketplace');assert.equal(plan.terms,terms);
 }
 assert.equal(canonicalPlan('marketplace').terms,'');
 assert.doesNotMatch(canonicalPlan('I want to buy a dining table').terms,/\bbuy\b/);
});
test('Search and Ask exclude unrelated commerce cards and search every authorized source family',async()=>{
 const calls:Record<string,unknown>[]=[];
 const banku=listing('Family banku machine',3);
 const rpc=async(name:string,args?:Record<string,unknown>)=>{
  if(name.endsWith('_retrieve')){calls.push(args!);return {error:null,data:args?.source_kind==='marketplace'?[listing('Used fufu pounder',1),listing('Dining table',2),banku,listing('Wooden chair',4)]:[]};}
  return {error:null,data:{id,name:'Fixture'}};
 };
 const search=await searchNeighborhood('I want to buy banku',rpc);
 assert.deepEqual(search.sources.map(s=>s.title),['Family banku machine']);
 assert.deepEqual(new Set(calls.map(c=>c.source_kind)),new Set(Object.keys(sourceRegistry)));
 assert.ok(calls.every(c=>c.terms==='banku'),'keyword must reach SQL before ranking and its per-family cap');
 const answer=await answerQuestion({question:'I want to buy banku'},{rpc,model:'fixture',respond:async()=>{throw Error('upstream unavailable');}});
 assert.deepEqual(answer.sources,search.sources);
 assert.equal(answer.sources[0].title,'Family banku machine','never relabel equipment as prepared food');
 assert.deepEqual(answer.excerpts,[]);
});
