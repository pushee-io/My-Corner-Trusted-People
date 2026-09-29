// Canonical, model-free retrieval used by Basic Search and Ask. No secrets or SDK.
import { fallbackPlan, privacyRefusal, retrieve, SourceUnavailableError } from './neighborhood-assistant.ts';
import type { Kind, Plan, Source } from './neighborhood-assistant.ts';
import { concepts, keywordTerms } from './neighborhood-concepts.ts';
export const sourceRegistry: Record<Kind,{label:string; policy:string}> = {
 provider:{label:'Providers',policy:'Active, unblocked, recorded neighborhood coverage; verified public reviews'},
 post:{label:'Neighborhood Feed',policy:'Verified neighborhood; public posts and allowed comments'},
 group:{label:'Groups',policy:'Accepted membership; visible discussions and comments'},
 event:{label:'Events',policy:'Approved, visible, applicable dates; no invite-only Events'},
 marketplace:{label:'Marketplace',policy:'Visible public listing fields; no pickup location'},
 agency:{label:'Agency broadcasts',policy:'Approved, current, authorized scope'},
};
export type SearchRpc = (name:string,args?:Record<string,unknown>)=>Promise<{data:unknown;error:unknown}>;
export function canonicalPlan(question:string,history:string[]=[]):Plan {
 const plan=fallbackPlan(question,history);
 // Recommendation scaffolding is not evidence. A topicless request needs clarification, not a feed dump.
 if(!keywordTerms(question)&&!plan.terms&&!plan.details?.categories.length&&!plan.details?.metric&&!plan.details?.providerId&&/\b(best|good|recommend\w*|suggest\w*|where)\b/i.test(question))return {intent:'digest',terms:'',window:'all',details:{concepts:[],categories:[],clarification:{question:'What are you looking for? Name a service, item or topic so I can search your neighborhood.',choices:[]}}};
 // Keep specific query words separate from broad concept expansion for cross-source ranking.
 const expanded=new Set(concepts.filter(c=>plan.details?.concepts.includes(c.id)).flatMap(c=>[...c.terms.split(' '),...c.aliases.flatMap(a=>a.split(' '))]));
 plan.rankingTerms=keywordTerms(question).split(' ').filter(w=>!expanded.has(w)&&!['address','contact','location','reference','hidden'].includes(w)).join(' ');
 const resolved:Plan=plan.intent==='unsupported'?{intent:'digest',terms:keywordTerms(question),window:'all',rankingTerms:plan.rankingTerms}:plan;
 // Literal multiword topics require all their words; concept expansions remain alternatives.
 resolved.matchAllTerms=!plan.details?.concepts.length&&!plan.details?.metric&&!/\bor\b/i.test(question);
 return resolved;
}
const words=(s:string)=>s.toLowerCase().match(/[\p{L}\p{N}]+/gu)??[];
// Defense in depth: structured provider/category matches are authoritative;
// unstructured cards still need topic evidence before model-free fallback.
export function deterministicMatches(plan:Plan,sources:Source[]):Source[]{
 const terms=words(plan.details?.serviceTerms??plan.terms);
 const matches=sources.filter(s=>{
  if(s.kind==='provider'&&(plan.details?.categories.length||plan.details?.providerId))return true;
  const content=[s.title,s.text,...(s.reputation?.reviews??[]).flatMap(r=>[r.title,r.body])].join(' ');
  if(plan.details?.evidencePhrases?.length){
   const normalized=' '+words(content).join(' ')+' ';
   if(!plan.details.evidencePhrases.some(p=>normalized.includes(' '+words(p).join(' ')+' ')))return false;
  }
  if(!terms.length)return true;
  const tokens=words(content);
  const matchesTerm=(t:string)=>tokens.some(w=>w===t||(t.length>=3&&w.startsWith(t))||(w.length>=4&&t.startsWith(w)));
  return plan.matchAllTerms?terms.every(matchesTerm):terms.some(matchesTerm);
 });
 // SQL owns metric comparisons; never override its population/order with lexical scores.
 if(plan.details?.metric||plan.details?.providerId)return matches;
 const specific=words(plan.rankingTerms??'');
 const score=(s:Source)=>{const tokens=words(s.title+' '+s.text);return specific.filter(t=>tokens.some(w=>w.startsWith(t)||t.startsWith(w)&&w.length>=4)).length;};
 return matches.sort((a,b)=>{
  if(plan.intent==='providers'&&a.kind!==b.kind&&(a.kind==='provider'||b.kind==='provider'))return a.kind==='provider'?-1:1;
  return score(b)-score(a)||(plan.intent==='alerts'?(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0):0);
 });
}
export async function retrieveCanonical(plan:Plan,now:Date,rpc:SearchRpc,hood:string,onUnavailable?:(kind:Kind)=>void){
 let succeeded=0,failed=0;
 const sources=await retrieve(plan,now,async(kind,terms,range)=>{
  const options=kind==='provider'?{categories:plan.details?.categories??[],metric:plan.details?.metric,providerId:plan.details?.providerId}:{metric:plan.details?.metric,phrases:plan.details?.evidencePhrases};
  const result=await rpc('neighborhood_search_retrieve',{source_kind:kind,terms,selected_neighborhood:hood,...range,options});
  if(result.error){
   const code=(result.error as {code?:string}).code;
   // Only explicitly transient database/transport failures allow partial results.
   if(['57014','53300','08000','08006','PGRST000','PGRST001','PGRST002'].includes(code??'')){failed++;throw new SourceUnavailableError();}
   throw new Error('Authorized retrieval unavailable');
  }
  if(!Array.isArray(result.data))throw new Error('Invalid source response');
  succeeded++;return result.data as Source[];
 },onUnavailable);
 if(failed&&!succeeded)throw new Error('Search is temporarily unavailable.');
 return sources;
}
export async function searchNeighborhood(question:string,rpc:SearchRpc,now=new Date()){
 if(question.trim().length<2)return {sources:[],unavailable:[] as Kind[]};
 if(question.length>600||privacyRefusal(question))return {sources:[],unavailable:[] as Kind[]};
 const plan=canonicalPlan(question);
 if(plan.details?.clarification)return {sources:[],unavailable:[] as Kind[]};
 const context=await rpc('neighborhood_search_context');
 const hood=context.data as {id?:string}|null;
 if(context.error||!hood?.id)throw new Error('Verify your neighborhood to search.');
 const unavailable:Kind[]=[];
 const sources=deterministicMatches(plan,await retrieveCanonical(plan,now,rpc,hood.id,k=>unavailable.push(k)));
 const final=await rpc('neighborhood_search_context',{selected_neighborhood:hood.id});
 if(final.error||!(final.data as {id?:string}|null)?.id)throw new Error('Neighborhood access changed.');
 if(unavailable.length===Object.keys(sourceRegistry).length)throw new Error('Search is temporarily unavailable.');
 return {sources,unavailable};
}
