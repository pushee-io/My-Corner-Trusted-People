import test from 'node:test';
import assert from 'node:assert/strict';
import { understand,sourcePriority } from './neighborhood-concepts.ts';
import { fallbackPlan,timeRange } from './neighborhood-assistant.ts';
test('domain corpus maps natural language to concepts and appropriate primary sources',()=>{
 const corpus:Record<string,string[]>={
 plumbing:['plumber','plumbers','plumbing','who can fix my leaking pipe','my sink leaking','someone to fix my pipes','plumer'],
 electrical:['electrician','electricians','electrical','electrical help','wiring','light repair','socket repair','lights repair','electritian'],
 fencing:['fence','fencing','repair fence','gate broken','gate repair'],
 outage:['lights off','power off','power outage','electricity outage','blackout','no power','power cut','Are there any power outages?','electricity is out','Whats happening with the power'],
 festival:['festival','festivals','festval','what festivals are happening this weekend'],music:['music','musical','music festival'],
 table:['dining table','table for sale','used table'],food_drive:['who is organizing the food drive'],road_closure:['road closed','road closure','traffic issue']};
 for(const [concept,queries] of Object.entries(corpus))for(const q of queries){const u=understand(q);assert.ok(u?.details.concepts.includes(concept),q);assert.ok(u.plan.terms,q);}
 for(const q of corpus.electrical)assert.equal(sourcePriority[fallbackPlan(q).intent][0],'provider');
 for(const q of corpus.outage)assert.deepEqual(sourcePriority[fallbackPlan(q).intent],['agency','post','group']);
});
test('comparison metrics and bounded follow-up inherit category without opaque scoring',()=>{
 assert.equal(understand('what electrician has the most reviews')?.details.metric,'verified_reviews');
 assert.equal(understand('which plumber has the best rating')?.details.metric,'rating');
 assert.equal(understand('which provider has completed the most My Corner jobs')?.details.metric,'completed_jobs');
 assert.equal(understand('which event has the most RSVPs')?.details.metric,'rsvps');
 assert.equal(understand('which Marketplace listing is newest')?.details.metric,'newest');
 assert.deepEqual(understand('which one has the most reviews',['show electricians'])?.details.categories,['electrical']);
 assert.deepEqual(understand('is he available today',['show electricians','which one has the most reviews'])?.details.categories,['electrical']);
 assert.deepEqual(understand('plumber',['show electricians'])?.details.categories,['plumbing']);
});
test('ambiguous power clarifies and unrelated nonsense is not fuzzily expanded',()=>{
 assert.equal(understand('power')?.details.clarification?.choices.length,2);
 assert.equal(understand('qzxvbnm'),null);
 assert.equal(understand('flower power'),null);
});
test('calendar weeks are distinct and future events default upcoming',()=>{
 assert.equal(fallbackPlan('festival').window,'upcoming');
 assert.deepEqual(timeRange('next_week',new Date('2026-09-27T12:00:00Z')),{since_at:'2026-09-28T00:00:00.000Z',until_at:'2026-10-05T00:00:00.000Z'});
 assert.deepEqual(timeRange('last_week',new Date('2026-09-27T12:00:00Z')),{since_at:'2026-09-14T00:00:00.000Z',until_at:'2026-09-21T00:00:00.000Z'});
});
test('extra topical qualifiers survive concept expansion',()=>{
 assert.match(fallbackPlan('pig racing festival').terms,/pig/);
 assert.match(fallbackPlan('jazz music this weekend').terms,/jazz/);
});
