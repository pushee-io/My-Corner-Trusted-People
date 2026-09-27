// Auditable neighborhood vocabulary. No records, identities, SQL or model facts.
import type { Intent, Kind, Plan, Window } from './neighborhood-assistant.ts';
type Concept = {id:string; family:string; intent:Intent; aliases:string[]; terms:string; category?:string};
export const concepts: Concept[] = [
 {id:'outage',family:'utilities',intent:'alerts',aliases:['power off','lights off','electricity off','power outage','electricity outage','blackout','no power','power cut','electricity is out','power is out','happening with the power'],terms:'power outage electricity blackout lights off'},
 {id:'plumbing',family:'home_services',intent:'providers',category:'plumbing',aliases:['plumber','plumbers','plumbing','pipe repair','pipes','leak','leaking','leaky pipe','water leak'],terms:'plumbing plumber pipe leak'},
 {id:'electrical',family:'home_services',intent:'providers',category:'electrical',aliases:['electrician','electricians','electrical','electric','wiring','socket','light repair','light fixture','power repair'],terms:'electrical electrician wiring socket'},
 {id:'fencing',family:'home_services',intent:'providers',aliases:['fence','fences','fencing','gate repair','gate broken','broken gate'],terms:'fence fencing gate'},
 {id:'carpentry',family:'home_services',intent:'providers',category:'carpentry',aliases:['carpenter','carpentry','woodwork'],terms:'carpentry carpenter woodwork'},
 {id:'painting',family:'home_services',intent:'providers',category:'painting',aliases:['painter','painting'],terms:'painting painter'},
 {id:'cleaning',family:'home_services',intent:'providers',category:'cleaning',aliases:['cleaner','cleaning'],terms:'cleaning cleaner'},
 {id:'appliance',family:'home_services',intent:'providers',category:'appliance-repair',aliases:['appliance repair','fridge repair','washing machine repair'],terms:'appliance repair fridge'},
 {id:'moving',family:'home_services',intent:'providers',category:'moving-delivery',aliases:['mover','moving','delivery help'],terms:'moving delivery'},
 {id:'landscaping',family:'home_services',intent:'providers',aliases:['landscaping','gardener','gardening'],terms:'landscaping gardening gardener'},
 {id:'festival',family:'community',intent:'events',aliases:['festival','festivals'],terms:'festival'},
 {id:'music',family:'community',intent:'events',aliases:['music','musical','concert'],terms:'music concert'},
 {id:'activity',family:'community',intent:'events',aliases:['anything fun','activities','event','events'],terms:''},
 {id:'food_drive',family:'community',intent:'organizer',aliases:['food drive','food donation'],terms:'food drive donation'},
 {id:'cleanup',family:'community',intent:'memory',aliases:['cleanup','clean up'],terms:'cleanup clean'},
 {id:'road_closure',family:'safety',intent:'alerts',aliases:['road closed','road closure','traffic issue','traffic','roadblock'],terms:'road closure closed traffic'},
 {id:'water_supply',family:'utilities',intent:'alerts',aliases:['water outage','no water','water off'],terms:'water supply outage'},
 {id:'internet',family:'utilities',intent:'alerts',aliases:['internet down','internet outage','no internet'],terms:'internet outage'},
 {id:'table',family:'commerce',intent:'marketplace',aliases:['dining table','used table','table for sale'],terms:'table dining'},
];
export type Metric = 'verified_reviews'|'rating'|'completed_jobs'|'rsvps'|'newest';
export type QueryDetails = {concepts:string[]; categories:string[]; metric?:Metric; availability?:boolean; closest?:boolean;
 correction?:{from:string;to:string}[]; clarification?:{question:string;choices:string[]}; providerId?:string};
export const sourcePriority: Record<Intent,Kind[]> = {
 providers:['provider','post','group'],alerts:['agency','post','group'],events:['event','post','group','agency'],
 organizer:['event','group','post'],memory:['post','group','agency'],marketplace:['marketplace','post','group'],
 digest:['agency','event','post','group','marketplace','provider'],unsupported:[],
};
const normalize=(s:string)=>s.toLowerCase().normalize('NFKC').replace(/[’']/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const includes=(q:string,phrase:string)=>` ${q} `.includes(` ${phrase} `);
// One insertion, deletion, substitution or transposition; only unique known domain words.
function oneEdit(a:string,b:string):boolean {
 if(Math.abs(a.length-b.length)>1||a===b)return false;
 if(a.length===b.length){const positions=[...a].map((c,i)=>c!==b[i]?i:-1).filter(i=>i>=0);return positions.length===1||(positions.length===2&&positions[1]===positions[0]+1&&a[positions[0]]===b[positions[1]]&&a[positions[1]]===b[positions[0]]);}
 const [short,long]=a.length<b.length?[a,b]:[b,a];let i=0,j=0,skipped=false;
 while(i<short.length&&j<long.length){if(short[i]===long[j]){i++;j++;}else{if(skipped)return false;skipped=true;j++;}}return true;
}
export function understand(question:string,previous:string[]=[]): {plan:Plan;details:QueryDetails}|null {
 let q=normalize(question);const correction:{from:string;to:string}[]=[];
 const vocabulary=[...new Set(concepts.flatMap(c=>c.aliases).filter(a=>!a.includes(' ')&&a.length>=5))];
 q=q.split(' ').map(word=>{if(word.length<5||vocabulary.includes(word))return word;const matches=vocabulary.filter(v=>oneEdit(word,v));if(matches.length!==1)return word;correction.push({from:word,to:matches[0]});return matches[0];}).join(' ');
 const own=concepts.filter(c=>c.aliases.some(a=>includes(q,a)));
 const followup=/\b(which one|which has|who has|most reviews|highest rated|is he|is she|are they|is it|those|them)\b/.test(q);
 if(!own.length&&followup&&previous.length){const recent=[...previous].reverse().find(p=>concepts.some(c=>c.aliases.some(a=>includes(normalize(p),a))));if(recent)q=`${normalize(recent)} ${q}`;}
 let found=concepts.filter(c=>c.aliases.some(a=>includes(q,a)));
 // Utility outage intent wins over incidental electricity vocabulary; never invent a provider need.
 if(found.some(c=>c.id==='outage'))found=found.filter(c=>c.intent==='alerts');
 let metric:Metric|undefined;
 if(/most (verified )?reviews/.test(q))metric='verified_reviews';
 else if(/highest rated|best rated|highest rating/.test(q))metric='rating';
 else if(/most (completed )?(my corner )?jobs/.test(q))metric='completed_jobs';
 else if(/most rsvps|most attendees/.test(q))metric='rsvps';
 else if(/newest|most recent listing/.test(q))metric='newest';
 const availability=/\bavailable|availability\b/.test(q),closest=/\bclosest\b/.test(q);
 let window:Window=/next week/.test(q)?'next_week':/last week/.test(q)?'last_week':/saturday/.test(q)?'saturday':/sunday/.test(q)?'sunday':/tomorrow/.test(q)?'tomorrow':/weekend/.test(q)?'weekend':/today|tonight|right now/.test(q)?'today':/last month/.test(q)?'month':/this week|recent|latest/.test(q)?'week':'all';
 const details:QueryDetails={concepts:found.map(c=>c.id),categories:found.flatMap(c=>c.category?[c.category]:[]),...(metric?{metric}:{}),...(availability?{availability}:{}),...(closest?{closest}:{}),...(correction.length?{correction}: {})};
 if(q==='power')return {plan:{intent:'alerts',terms:'',window:'week'},details:{...details,clarification:{question:'Do you mean a power outage nearby, or are you looking for an electrician?',choices:['Power outage','Find electrician']}}};
 if(!found.length&&!metric&&!availability&&!closest)return null;
 const intent:Intent=metric==='rsvps'?'events':metric==='newest'?'marketplace':metric||availability?'providers':found[0]?.intent??'providers';
 if(intent==='events'||intent==='organizer'){if(window==='all')window='upcoming';}
 if(intent==='alerts'&&window==='all')window='week';
 const residual=keywordTerms(q).split(' ').filter(w=>w&&!found.some(c=>c.aliases.some(a=>a.split(' ').includes(w)))&&!/^(has|have|help|fix|someone|most|highest|best|rated|rating|reviews|verified|available|availability|now|closest|one|he|she|they|it|completed|jobs|provider|providers|rsvps|attendees|newest|listing|listings|marketplace|next|last|off|with|organizing|organizer|organise|organize)$/.test(w));
 const terms=[...new Set([...found.filter(c=>c.intent===intent||intent==='organizer').flatMap(c=>c.terms.split(' ')),...residual].filter(Boolean))].join(' ').slice(0,160);
 return {plan:{intent,terms,window,details},details};
}

export function keywordTerms(question: string): string {
 const stop=new Set('what whats which who is are was were do does did can could would should the a an in on at of for to me my our your this that these those there here near nearby neighborhood neighbourhood happening happen events event find show tell about any some please today tonight tomorrow weekend saturday sunday week month upcoming all and or'.split(' '));
 return [...new Set(question.toLowerCase().replace(/[’']/g,'').match(/[\p{L}\p{N}]+/gu)??[])]
  .filter(word=>!stop.has(word)).slice(0,12).join(' ').slice(0,160);
}
