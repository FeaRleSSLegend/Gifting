import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../hooks/useScreen.js'
import { supabase } from '../lib/supabase.js'

const F=(k,l,t='text',x={})=>({k,l,t,...x})
const STEPS=[
 {t:'Occasion and timing',f:[F('occasion','Occasion','select',{req:1,o:['Birthday','Anniversary','Graduation','Wedding','Appreciation','Apology','Celebration','Other']}),F('occasion_date','Occasion date','date'),F('delivery_date','Preferred delivery date','date'),F('date_flexible','My dates are flexible','check')]},
 {t:'Who is it for?',f:[F('relationship','Your relationship to them','text',{req:1,ph:'Partner, sister, colleague'}),F('recipient_name','Their name or nickname (optional)'),F('age_range','Age range (optional)','select',{o:['Under 18','18–29','30–44','45–59','60+']})]},
 {t:'Their personality',f:[F('interests','Hobbies and interests','area',{req:1,ph:'Hiking, vinyl records, baking sourdough'}),F('personality','Personality','area',{ph:'Quietly funny, always early, loves surprises'}),F('likes','Favourite things','area'),F('dislikes','Dislikes or things to avoid','area')]},
 {t:'What should the gift say?',f:[F('feeling','The gift should communicate','select',{req:1,o:['Love','Appreciation','Encouragement','Celebration','Apology','Surprise','Something else']}),F('styles','Preferred gift styles','area',{ph:'Handmade, keepsake, experience'}),F('personalization','Personalization ideas','area',{ph:'Engraved date, handwritten letter'}),F('packaging','Packaging preferences','area')]},
 {t:'Budget and delivery',f:[F('currency','Currency','select',{req:1,o:['NGN','USD','GBP','EUR']}),F('budget','Budget range','text',{req:1,ph:'e.g. 50,000–80,000'}),F('delivery_location','Delivery city or area','text',{req:1}),F('delivery_notes','Delivery instructions','area',{hint:'We only use this to assess and deliver your gift.'})]},
 {t:'How can we reach you?',f:[F('customer_name','Your name','text',{req:1}),F('customer_email','Email','email',{req:1}),F('customer_phone','Phone or WhatsApp (optional)','tel'),F('contact_channel','Preferred contact channel','select',{req:1,o:['Email','WhatsApp']}),F('whatsapp_consent','You may send me WhatsApp updates','check')]},
]
const REVIEW=STEPS.length
const emailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function CreateGift(){
  const nav=useNavigate(),{isMobile}=useBreakpoint()
  const [i,setI]=useState(0),[back,setBack]=useState(false)
  const [v,setV]=useState({currency:'NGN',contact_channel:'Email'})
  const [errs,setErrs]=useState({}),[busy,setBusy]=useState(false),[fail,setFail]=useState('')
  const key=useRef(crypto.randomUUID()) // idempotency key blocks duplicate submissions
  const set=(k,x)=>{setV(s=>({...s,[k]:x}));setErrs(e=>({...e,[k]:undefined}))}

  function check(step){
    const e={}
    STEPS[step].f.forEach(f=>{const x=(v[f.k]||'').toString().trim()
      if(f.req&&!x)e[f.k]='This field is required.'
      if(x.length>1000)e[f.k]='Keep this under 1,000 characters.'})
    if(v.customer_email&&!emailOk(v.customer_email))e.customer_email='Enter an email like name@example.com.'
    if(step===5&&v.contact_channel==='WhatsApp'&&!v.customer_phone)e.customer_phone='Add a WhatsApp number or choose email.'
    if(step===0&&v.occasion_date&&v.delivery_date&&v.delivery_date>v.occasion_date&&!v.date_flexible)e.delivery_date='Delivery should be on or before the occasion date.'
    setErrs(e);return !Object.keys(e).length
  }
  const next=()=>{if(check(i)){setBack(false);setI(i+1);window.scrollTo({top:0})}}
  const prev=()=>{setBack(true);setI(i-1)}

  async function submit(){
    if(!v.terms){setErrs({terms:'Accept the terms and privacy notice to continue.'});return}
    setBusy(true);setFail('')
    const {data,error}=await supabase.functions.invoke('submit-request',{body:{...v,idempotency_key:key.current}})
    setBusy(false)
    // Success is only shown once the backend returns a saved reference.
    if(error||!data?.reference){setFail('We could not save your request. Your answers are still here, so please try again.');return}
    nav('/request-success',{state:{reference:data.reference}})
  }

  const field=f=>{
    const p={id:f.k,'aria-invalid':!!errs[f.k],'aria-describedby':errs[f.k]?f.k+'-e':undefined,value:v[f.k]||'',onChange:e=>set(f.k,e.target.value),placeholder:f.ph}
    if(f.t==='check')return <label key={f.k} className="check"><input type="checkbox" checked={!!v[f.k]} onChange={e=>set(f.k,e.target.checked)}/>{f.l}</label>
    return <div key={f.k}><label htmlFor={f.k}>{f.l}</label>
      {f.t==='select'?<select {...p}><option value="">Choose…</option>{f.o.map(o=><option key={o}>{o}</option>)}</select>
       :f.t==='area'?<textarea {...p}/>:<input type={f.t} {...p}/>}
      {f.hint&&<p className="hint">{f.hint}</p>}{errs[f.k]&&<p className="err" id={f.k+'-e'} role="alert">{errs[f.k]}</p>}</div>
  }

  return <section className="sec wrap" style={{maxWidth:640}}>
    <h1 style={{fontSize:'clamp(2rem,5vw,3rem)'}}>Create a gift</h1>
    <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={REVIEW+1} aria-valuenow={i+1}><i style={{width:`${(i+1)/(REVIEW+1)*100}%`}}/></div>
    <p className="hint">Step {i+1} of {REVIEW+1}</p>
    <div className={back?'back':''}><div className="step" key={i}>
      {i<REVIEW?<><h2>{STEPS[i].t}</h2>{STEPS[i].f.map(field)}</>:<>
        <h2>Review your request</h2>
        <div className="card">{STEPS.flatMap(s=>s.f).filter(f=>v[f.k]&&f.t!=='check'||f.t==='check'&&v[f.k]).map(f=>
          <p key={f.k} style={{margin:'.3rem 0'}}><strong style={{color:'var(--plum)'}}>{f.l}:</strong> {f.t==='check'?'Yes':v[f.k]}</p>)}</div>
        <label className="check"><input type="checkbox" checked={!!v.terms} onChange={e=>set('terms',e.target.checked)}/>I accept the terms and the privacy notice.</label>
        {errs.terms&&<p className="err" role="alert">{errs.terms}</p>}
        <label className="check"><input type="checkbox" checked={!!v.marketing} onChange={e=>set('marketing',e.target.checked)}/>Send me occasional ideas and offers (optional).</label>
        {fail&&<p className="err" role="alert">{fail}</p>}</>}
    </div></div>
    <div className={`row ${isMobile?'sticky':''}`}>
      {i>0?<button className="btn ghost" onClick={prev} disabled={busy}>Back</button>:<span/>}
      {i<REVIEW?<button className="btn" onClick={next}>Continue</button>:<button className="btn" onClick={submit} disabled={busy}>{busy?'Sending…':'Send request'}</button>}
    </div>
  </section>
}
