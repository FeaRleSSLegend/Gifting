import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors={'Access-Control-Allow-Origin':Deno.env.get('SITE_ORIGIN')??'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
const json=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,'Content-Type':'application/json'}})
const text=(v:unknown,max=1000)=>typeof v==='string'&&v.trim()?v.trim().slice(0,max):null
const date=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)?v:null

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  const raw=await req.text(); if(raw.length>20000)return json({error:'Too large'},413)
  let b:any; try{b=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
  const email=text(b.customer_email,200), name=text(b.customer_name,200)
  if(!name||!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!text(b.occasion,100)||!b.terms)return json({error:'Missing or invalid fields'},400)
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const key=/^[0-9a-f-]{36}$/.test(b.idempotency_key??'')?b.idempotency_key:null
  if(key){const {data}=await db.from('gift_requests').select('reference').eq('idempotency_key',key).maybeSingle(); if(data)return json({reference:data.reference})}
  const row={idempotency_key:key,occasion:text(b.occasion,100),occasion_date:date(b.occasion_date),delivery_date:date(b.delivery_date),date_flexible:!!b.date_flexible,
    relationship:text(b.relationship,200),recipient_name:text(b.recipient_name,200),age_range:text(b.age_range,50),interests:text(b.interests),personality:text(b.personality),likes:text(b.likes),dislikes:text(b.dislikes),
    feeling:text(b.feeling,100),styles:text(b.styles),personalization:text(b.personalization),packaging:text(b.packaging),
    currency:text(b.currency,10),budget:text(b.budget,100),delivery_location:text(b.delivery_location,300),delivery_notes:text(b.delivery_notes),
    customer_name:name,customer_email:email,customer_phone:text(b.customer_phone,50),contact_channel:text(b.contact_channel,20),whatsapp_consent:!!b.whatsapp_consent,
    terms_accepted_at:new Date().toISOString(),marketing_consent:!!b.marketing}
  const {data,error}=await db.from('gift_requests').insert(row).select('id,reference').single()
  if(error)return json({error:'Could not save request'},500)   // frontend shows success only when a reference comes back
  await db.from('request_status_history').insert({request_id:data.id,old_status:null,new_status:'New Request'})

  // Notifications run after the save; failures are logged and never undo the request.
  const resend=Deno.env.get('RESEND_API_KEY'), from=Deno.env.get('EMAIL_FROM'), admin=Deno.env.get('ADMIN_EMAIL'), site=Deno.env.get('SITE_ORIGIN')
  const send=async(kind:string,to:string|undefined,subject:string,html:string)=>{
    if(!resend||!from||!to){await db.from('notification_logs').insert({request_id:data.id,channel:'email',recipient_kind:kind,outcome:'not_configured'});return}
    try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resend}`,'Content-Type':'application/json'},body:JSON.stringify({from,to,subject,html})})
      const j=await r.json().catch(()=>({}));await db.from('notification_logs').insert({request_id:data.id,channel:'email',recipient_kind:kind,outcome:r.ok?'sent':'failed',provider_ref:j.id??null,detail:r.ok?null:JSON.stringify(j).slice(0,500)})
    }catch(e){await db.from('notification_logs').insert({request_id:data.id,channel:'email',recipient_kind:kind,outcome:'failed',detail:String(e).slice(0,500)})}}
  await send('customer',email,`We received your request ${data.reference}`,`<p>Thank you, ${name}. Your reference is <b>${data.reference}</b>. We'll review it and reply by email.</p>`)
  await send('admin',admin,`New gift request ${data.reference}`,`<p>New request ${data.reference}. <a href="${site}/admin/requests/${data.id}">Open in dashboard</a></p>`)
  await db.from('notification_logs').insert({request_id:data.id,channel:'whatsapp',recipient_kind:'customer',outcome:'not_configured'})
  return json({reference:data.reference})
})
