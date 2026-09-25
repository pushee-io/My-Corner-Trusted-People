import { ANSWER_VERSION, answerNotice, fallbackPlan, historyQuestions, parsePlan, plannerPayload, privacyRefusal, retrieve, synthesisPayload, validateQuestion, validatedExcerpts } from './neighborhood-assistant.ts';
import type { Intent, Source } from './neighborhood-assistant.ts';
import { outputJson } from './openai-responses.ts';
type Rpc = (name: string, args?: Record<string,unknown>)=>Promise<{data: unknown;error: unknown}>;
type Dependencies = {rpc: Rpc; model: string; respond: (payload: unknown)=>Promise<Record<string,unknown>>; now?: ()=>Date};
export const UNAVAILABLE='Ask My Corner is temporarily unavailable. You can still search your neighborhood.';
export async function answerQuestion(body: {question?: unknown;history?: unknown;neighborhoodId?: unknown}, deps: Dependencies) {
 const started=Date.now();const now=deps.now?.()??new Date();
 const question=validateQuestion(body.question);const history=historyQuestions(body.history);
 if(body.neighborhoodId!==undefined&&body.neighborhoodId!==null&&(typeof body.neighborhoodId!=='string'||!/^[0-9a-f-]{36}$/i.test(body.neighborhoodId)))throw new Error('Invalid neighborhood');
 const context=await deps.rpc('neighborhood_ai_context',{selected_neighborhood:body.neighborhoodId??null});
 if(context.error||!context.data)throw new Error(UNAVAILABLE);
 const hood=context.data as {id:string;name:string;timezone:string};
 const allowance=await deps.rpc('neighborhood_ai_meter',{action:'start'});
 if(allowance.error||!allowance.data)throw new Error('Ask My Corner allowance reached or unavailable. You can still use Search.');
 const runId=(allowance.data as {id:string}).id;
 let intent: Intent='unsupported',outcome='unavailable',sources: Source[]=[],inputTokens=0,outputTokens=0,retrievalMs=0;
 const modelCall=async(payload: unknown)=>{
  const response=await deps.respond(payload);
  const usage=response.usage as {input_tokens?:number;output_tokens?:number}|undefined;
  inputTokens+=Math.max(0,Math.min(20000,Number(usage?.input_tokens)||0));outputTokens+=Math.max(0,Math.min(2400,Number(usage?.output_tokens)||0));
  return response;
 };
 try {
  if(privacyRefusal(String(body.question))||history.some(privacyRefusal)){
   outcome='refused';return {id:runId,version:ANSWER_VERSION,intent,neighborhood:hood.name,generatedAt:now.toISOString(),
    notice:'I cannot look up private messages, home locations, job safety details or sensitive group membership. Ask about authorized neighborhood information instead.',sources:[],excerpts:[]};
  }
  let plan=fallbackPlan(question,history);
  if(plan.intent==='unsupported')plan=parsePlan(outputJson(await modelCall(plannerPayload(question,history,deps.model,now.toISOString(),hood.name))));
  intent=plan.intent;
  const retrievalStarted=Date.now();
  sources=await retrieve(plan,now,async(kind,terms,range)=>{
   const r=await deps.rpc('neighborhood_ai_search',{source_kind:kind,terms,selected_neighborhood:hood.id,...range});
   if(r.error||!Array.isArray(r.data))throw new Error('Retrieval unavailable');return r.data as Source[];
  });
  retrievalMs=Date.now()-retrievalStarted;
  let excerpts: {index:number;quote:string}[]=[];
  if(sources.length)excerpts=validatedExcerpts(await modelCall(synthesisPayload(question,sources,deps.model)),sources);
  // Re-authorize immediately before returning. A block/removal/membership change during
  // model latency must revoke the source and its excerpt in this response, too.
  if(sources.length){
   const fresh=await retrieve(plan,now,async(kind,terms,range)=>{
    const r=await deps.rpc('neighborhood_ai_search',{source_kind:kind,terms,selected_neighborhood:hood.id,...range});
    if(r.error||!Array.isArray(r.data))throw new Error('Retrieval unavailable');return r.data as Source[];
   });
   const current=new Map(fresh.map(s=>[`${s.kind}:${s.id}`,JSON.stringify(s)]));
   const keep=sources.map(s=>current.get(`${s.kind}:${s.id}`)===JSON.stringify(s));
   const old=sources;sources=sources.filter((_,i)=>keep[i]);
   excerpts=excerpts.filter(e=>keep[e.index]).map(e=>({index:sources.indexOf(old[e.index]),quote:e.quote}));
  }
  const finalContext=await deps.rpc('neighborhood_ai_context',{selected_neighborhood:hood.id});
  if(finalContext.error)throw new Error(UNAVAILABLE);
  outcome=sources.length?'answered':'no_results';
  return {id:runId,version:ANSWER_VERSION,intent,neighborhood:hood.name,generatedAt:now.toISOString(),
   notice:answerNotice(intent,sources),sources,excerpts};
 }finally{
  // Metadata only. Telemetry failure must not erase an otherwise authorized answer.
  await deps.rpc('neighborhood_ai_meter',{action:'finish',run_id:runId,payload:{intent,outcome,
   sources:sources.map(s=>`${s.kind}:${s.id}`),retrievalMs,answerMs:Date.now()-started,inputTokens,outputTokens,model:deps.model}}).catch(()=>undefined);
 }
}
