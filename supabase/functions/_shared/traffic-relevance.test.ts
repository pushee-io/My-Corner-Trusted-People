import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPlan, deterministicMatches } from './neighborhood-search.ts';
import { validateQuestion, type Source } from './neighborhood-assistant.ts';
const agency:Source={id:'a4000000-0000-4000-8000-000000000001',kind:'agency',title:'Road works notice',text:'Approved maintenance for roads this weekend.',authority:'Agency',href:'/agency-broadcasts?broadcastId=a4000000-0000-4000-8000-000000000001',publishedAt:'2026-07-28T17:28:00Z'};
const post:Source={...agency,id:'a4000000-0000-4000-8000-000000000002',kind:'post',title:'Neighborhood post',text:'Is the road going to the cedi [address hidden]?',href:'/community?postId=a4000000-0000-4000-8000-000000000002',publishedAt:'2026-09-28T19:50:00Z'};
test('specific landmark evidence outranks generic agency notice for Search and redacted Ask',()=>{
 for(const q of ['Is there any traffic near the cedi house?','is ther any traffic near the cedi house today']){
  for(const query of [q,validateQuestion(q)])assert.equal(deterministicMatches(canonicalPlan(query),[agency,post])[0].id,post.id);
 }
 const named={...post,text:'Traffic near the library',publishedAt:'2026-07-01T00:00:00Z'};
 assert.equal(deterministicMatches(canonicalPlan('traffic near the library'),[agency,named])[0].id,named.id);
});
test('equal alert relevance uses recency; explicit metric ordering stays authoritative',()=>{
 const recent={...post,text:'Road traffic update'};
 assert.equal(deterministicMatches(canonicalPlan('traffic'),[agency,recent])[0].id,recent.id);
 const plan=canonicalPlan('newest marketplace listing');
 assert.deepEqual(deterministicMatches({...plan,terms:'',rankingTerms:'cedi'},[agency,post]),[agency,post]);
});
test('traffic follow-up keeps grounded duplicate evidence without an explanation warning',async()=>{
 const { answerQuestion }=await import('./neighborhood-service.ts');
 const answer=await answerQuestion({question:'Is there any traffic near the cedi house?'},{model:'fixture',rpc:async(name,args)=>({error:null,data:name==='neighborhood_ai_context'?{id:agency.id,name:'Fixture',timezone:'Africa/Accra'}:name==='neighborhood_ai_meter'?{id:agency.id}:args?.source_kind==='agency'?[agency]:args?.source_kind==='post'?[post]:[]}),respond:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({excerpts:[{index:0,quote:'cedi'},{index:0,quote:'road'}]})}]}]})});
 assert.equal(answer.sources[0].id,post.id);
 assert.deepEqual(answer.excerpts,[{index:0,quote:'cedi'}]);
 assert.doesNotMatch(answer.notice,/temporarily unavailable/);
});
