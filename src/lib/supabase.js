import { createClient } from '@supabase/supabase-js'
const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_ANON_KEY
export const configured=Boolean(url&&key)
const fail={data:null,error:{message:'Supabase is not configured'}}
const chain=()=>{const p=new Proxy(function(){}, {get:(_,k)=>k==='then'?r=>r(fail):()=>p, apply:()=>p});return p}
const stub={from:chain,rpc:chain,functions:{invoke:async()=>fail},
  auth:{getSession:async()=>({data:{session:null}}),signInWithPassword:async()=>({error:fail.error})}}
// Without env vars the app still renders; data calls fail gracefully instead of crashing the page.
export const supabase=configured?createClient(url,key):stub
