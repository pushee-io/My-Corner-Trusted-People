import { createClient } from '@supabase/supabase-js';
import { callResponses } from '../_shared/openai-responses.ts';
import { answerQuestion, askFailure, UNAVAILABLE } from '../_shared/neighborhood-service.ts';
const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, x-client-info, content-type','Cache-Control':'no-store'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const authorization=req.headers.get('Authorization')??'';
 if(!authorization.startsWith('Bearer '))return reply({error:'Sign in to Ask My Corner.'},401);
 const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{
  global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(authorization.slice(7));
 if(error||!data.user)return reply({error:'Sign in to Ask My Corner.'},401);
 const key=Deno.env.get('OPENAI_API_KEY');
 const model=Deno.env.get('OPENAI_NEIGHBORHOOD_MODEL')??Deno.env.get('OPENAI_REQUEST_STRUCTURER_MODEL');
 try{
  const raw=await req.text();if(raw.length>4000)return reply({error:'Question is too long.'},413);
  const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Invalid question'},400);
  const rpc=async(name:string,args?:Record<string,unknown>)=>{const r=await client.rpc(name,args);return {data:r.data,error:r.error};};
  if(body.checkAvailability===true){const r=await rpc('neighborhood_ai_context',{selected_neighborhood:body.neighborhoodId??null});return r.error?reply({error:UNAVAILABLE},503):reply({available:true,neighborhood:r.data});}
  const answer=await answerQuestion(body,{rpc,model:model??'unconfigured',trace:metadata=>console.info(JSON.stringify({event:'ask_retrieval',...metadata})),debug:Deno.env.get('SUPABASE_URL')==='https://opeojxwkwwnnncnsuaag.supabase.co'&&Deno.env.get('ASK_PREVIEW_DEBUG')==='true',respond:payload=>{if(!key||!model)throw new Error('Explanation unavailable');return callResponses(key,payload,fetch,8000);}});
  return reply({enabled:true,answer});
 }catch(error){
  // Never log question/source text, tokens, authorization headers or provider errors.
  const failure=askFailure(error);return reply(failure.body,failure.status);
 }
});
