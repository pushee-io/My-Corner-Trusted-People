import type { Plan, Source } from './neighborhood-assistant.ts';
import { answerNotice } from './neighborhood-assistant.ts';
export function groundedNotice(plan:Plan,sources:Source[]):string {
 if(plan.details?.clarification)return plan.details.clarification.question;
 const providers=sources.filter(s=>s.kind==='provider');
 if(plan.details?.closest)return 'Exact distance is not available. These are matching sources for your neighborhood; I cannot identify the closest provider.';
 if(plan.details?.availability)return providers.length
  ? 'These availability notes are provider-stated, not a live booking calendar. I cannot confirm availability today or now; open the provider profile to request help.'
  : 'I found no matching provider with recorded coverage for your neighborhood. I cannot confirm availability.';
 if(plan.details?.metric){
  const metric=plan.details.metric;
  const first=sources.find(s=>s.comparison?.metric===metric);
  if(!first?.comparison)return 'I do not have eligible structured evidence for that comparison in your neighborhood. No ranking can be established.';
  const c=first.comparison;
  const label=({verified_reviews:'verified reviews',rating:'average rating from verified-job reviews',completed_jobs:'confirmed completed My Corner jobs',rsvps:'recorded going RSVPs',newest:'creation time'})[metric];
  const scope=`Among ${c.eligibleCount} matching eligible ${first.kind==='provider'?'providers with recorded neighborhood coverage':first.kind==='event'?'events in this time window':'listings'}`;
  if(metric==='newest')return `${scope}, ${first.title} ${c.tiedCount>1?'shares the newest creation time':'is newest'}. ${c.tiedCount>1?`${c.tiedCount} listings are tied. `:''}Open the dated listing for details.`;
  if(c.value===0)return `${scope}, all have zero ${label}. There is no distinct leader.`;
  return `${scope}, ${first.title} ${c.tiedCount>1?'shares the lead':'leads'} with ${c.value}${metric==='rating'?' / 5':''} ${label}. ${c.tiedCount>1?`${c.tiedCount} are tied; the displayed order does not break the tie. `:''}This is the recorded metric, not a safety guarantee.`;
 }
 if(plan.intent==='providers')return providers.length?`I found ${providers.length}${providers.length===8?' displayed':''} matching providers with recorded coverage for your neighborhood. Compare their verified-job reviews and open a profile to request help. Availability is provider-stated.`:'I found no matching provider with recorded coverage for your neighborhood. Related authorized discussions, if any, are shown separately.';
 return answerNotice(plan.intent,sources);
}
export function providerReference(value:unknown):string|undefined {
 return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)?value:undefined;
}
