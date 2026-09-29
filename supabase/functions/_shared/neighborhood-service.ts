import { canonicalPlan, deterministicMatches, retrieveCanonical } from './neighborhood-search.ts';
import { groundedNotice, providerReference } from './neighborhood-answer.ts';
import { ANSWER_VERSION, evidenceFailureReason, historyQuestions, privacyRefusal, synthesisPayload, validateQuestion, validatedExcerpts } from './neighborhood-assistant.ts';
import type { Intent, Source } from './neighborhood-assistant.ts';

type Rpc = (name: string, args?: Record<string,unknown>)=>Promise<{data: unknown;error: unknown}>;
type Dependencies = {debug?: boolean; trace?: (metadata: Record<string,unknown>)=>void; rpc: Rpc; model: string; respond: (payload: unknown)=>Promise<Record<string,unknown>>; now?: ()=>Date};
export class AskAllowanceError extends Error {
 readonly code='ASK_ALLOWANCE_REACHED';
 readonly quota?:unknown;
 constructor(quota?:unknown){super('The Preview question limit has been reached. Use Search or try again at the reset time.');this.quota=quota;}
}
export function askFailure(error:unknown){
 return error instanceof AskAllowanceError?{status:429,body:{code:error.code,error:error.message,quota:error.quota}}:{status:503,body:{error:UNAVAILABLE}};
}
export const UNAVAILABLE='Ask My Corner is temporarily unavailable. You can still search your neighborhood.';
export async function answerQuestion(body: {question?: unknown;history?: unknown;neighborhoodId?: unknown; providerId?: unknown}, deps: Dependencies) {
 const started=Date.now();const now=deps.now?.()??new Date();
 const question=validateQuestion(body.question);const history=historyQuestions(body.history);
 if(body.neighborhoodId!==undefined&&body.neighborhoodId!==null&&(typeof body.neighborhoodId!=='string'||!/^[0-9a-f-]{36}$/i.test(body.neighborhoodId)))throw new Error('Invalid neighborhood');
 const context=await deps.rpc('neighborhood_ai_context',{selected_neighborhood:body.neighborhoodId??null});
 if(context.error||!context.data)throw new Error(UNAVAILABLE);
 const hood=context.data as {id:string;name:string;timezone:string};
 const allowance=await deps.rpc('neighborhood_ai_meter',{action:'start'});
 if(allowance.error||!allowance.data){
  if((allowance.error as {code?:string}|null)?.code==='54000'){let quota:unknown;try{quota=JSON.parse((allowance.error as {details?:string}).details??'null');}catch{}throw new AskAllowanceError(quota);}
  throw new Error(UNAVAILABLE);
 }
 const runId=(allowance.data as {id:string}).id;
 let intent: Intent='unsupported',outcome='unavailable',sources: Source[]=[],inputTokens=0,outputTokens=0,retrievalMs=0;
 let stage='planning',relatedEvidenceUnavailable=false;
 // Only fixed stage labels/counts reach logs, never source prose or raw errors.
 const trace=(metadata:Record<string,unknown>)=>{try{deps.trace?.(metadata);}catch{/* Logging must not replace an answer. */}};
 const traceFailure=(event:string)=>trace({event,stage,intent,providerCount:sources.filter(s=>s.kind==='provider').length});
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
  const plan=canonicalPlan(question,history);
  intent=plan.intent;
  const selected=providerReference(body.providerId);
  if(/\b(he|she|they|this provider|that provider)\b/i.test(question)&&plan.details?.availability){
   if(selected)plan.details={...plan.details,providerId:selected,metric:undefined};
   else plan.details={...plan.details,clarification:{question:'Which provider do you mean? Select a provider below or name the service you need.',choices:['Find electricians','Find plumbers']}};
  }
  if(plan.details?.clarification){outcome='answered';return {id:runId,version:ANSWER_VERSION,intent,neighborhood:hood.name,generatedAt:now.toISOString(),notice:plan.details.clarification.question,clarification:plan.details.clarification.choices,sources:[],excerpts:[]};}
  const counts:Record<string,number>={};
  const unavailable=new Set<string>();
  const fetchSources=async()=>{
   const result=await retrieveCanonical(plan,now,async(name,args)=>{
    const response=await deps.rpc(name,args);
    if(Array.isArray(response.data))counts[String(args?.source_kind)]=response.data.length;
    return response;
   },hood.id,kind=>unavailable.add(kind));
   return deterministicMatches(plan,result);
  };
  const retrievalStarted=Date.now();
  stage='retrieval';
  sources=await fetchSources();
  retrievalMs=Date.now()-retrievalStarted;
  let excerpts: {index:number;quote:string}[]=[];
  // Retrieval and comparison are deterministic. The model may select exact
  // supporting excerpts but cannot remove good cards or manufacture a source.
  if(sources.some(s=>s.kind!=='provider')){
   try{
    stage='evidence_model';
    const response=await modelCall(synthesisPayload(question,sources,deps.model));
    stage='evidence_validation';
    excerpts=validatedExcerpts(response,sources);
   }catch(error){
    relatedEvidenceUnavailable=true;
    // Fixed reason codes only: never response prose, source text or error messages.
    trace({event:'ask_evidence_fallback',stage,intent,providerCount:sources.filter(s=>s.kind==='provider').length,reason:stage==='evidence_validation'?evidenceFailureReason(error):'model_call_failed'});
   }
  }
  sources=sources.slice(0,16);
  excerpts=excerpts.filter(e=>e.index<sources.length);
  // Re-authorize immediately before returning. A block/removal/membership change during
  // model latency must revoke the source and its excerpt in this response, too.
  if(sources.length){
   stage='reauthorization';
   const fresh=await fetchSources();
   const current=new Map(fresh.map(s=>[`${s.kind}:${s.id}`,JSON.stringify(s)]));
   const keep=sources.map(s=>current.get(`${s.kind}:${s.id}`)===JSON.stringify(s));
   const old=sources;sources=sources.filter((_,i)=>keep[i]);
   excerpts=excerpts.filter(e=>keep[e.index]).map(e=>({index:sources.indexOf(old[e.index]),quote:e.quote}));
  }
  stage='final_context';
  const finalContext=await deps.rpc('neighborhood_ai_context',{selected_neighborhood:hood.id});
  if(finalContext.error||!(finalContext.data as {id?:string}|null)?.id)throw new Error(UNAVAILABLE);
  outcome=sources.length?'answered':'no_results';
  const diagnostics={stage,unavailableSources:[...unavailable],modelFallback:relatedEvidenceUnavailable,concepts:plan.details?.concepts??[],intent,tools:Object.keys(counts),counts,noResultReason:sources.length?null:'no_authorized_matching_evidence',fallbackLevel:plan.details?.correction?.length?'controlled_typo':plan.details?.concepts.length?'concept_expansion':'lexical',retrievalMs,inputTokens,outputTokens};
  if(deps.debug)trace(diagnostics);
  return {id:runId,version:ANSWER_VERSION,intent,neighborhood:hood.name,generatedAt:now.toISOString(),
   notice:groundedNotice(plan,sources)+(relatedEvidenceUnavailable?' Showing matching records; AI explanation is temporarily unavailable.':'')+(unavailable.size?' Some source categories are temporarily unavailable.':''),sources,excerpts,quota:(allowance.data as {quota?:unknown}).quota,
   ...(deps.debug?{diagnostics}:{})};
 }catch(error){
  traceFailure('ask_failure');
  throw error;
 }finally{
  // Metadata only. Telemetry failure must not erase an otherwise authorized answer.
  await deps.rpc('neighborhood_ai_meter',{action:'finish',run_id:runId,payload:{intent,outcome,
   sources:sources.map(s=>`${s.kind}:${s.id}`),retrievalMs,answerMs:Date.now()-started,inputTokens,outputTokens,model:deps.model}}).catch(()=>undefined);
 }
}
