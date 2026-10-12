import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
const SAMPLE=[{id:1,img:'/art/gift1.jpg',title:'The cozy evening box',category:'Appreciation',description:'Spiced tea, a candle, soft socks and a ribboned treat.'},{id:2,img:'/art/gift2.jpg',title:'The pink celebration basket',category:'Celebration',description:'A woven basket in their favourite colour, finished with a satin bow.'},{id:3,img:'/art/box.jpg',title:'Bouquet with a handwritten note',category:'Anniversary',description:'Seasonal blooms wrapped in blush paper.'}]
const SAMPLE_FAQ=[{id:1,question:'How long does a request take?',answer:'We aim to reply within two working days.'},{id:2,question:'Do I need an account?',answer:'No. Send a request with your email and we follow up there.'},{id:3,question:'How is pricing decided?',answer:'We propose a gift and quote within your budget before anything is made.'}]
const Page=({t,children})=><section className="sec wrap"><h1 style={{fontSize:'clamp(2rem,5vw,3.2rem)'}}>{t}</h1>{children}</section>

export function Success(){
  const {state}=useLocation()
  if(!state?.reference)return <Page t="No request to show"><Link to="/create-gift">Create a gift</Link></Page>
  return <Page t="Your request is saved"><p>Keep this reference for any follow-up:</p><div className="ref">{state.reference}</div>
    <p>We'll review your answers and email you with next steps. A confirmation is on its way if email is configured.</p></Page>
}
export function Creations(){
  const [items,setItems]=useState(null)
  useEffect(()=>{supabase.from('portfolio_items').select('id,title,description,category,portfolio_images(path,alt_text)').eq('published',true).order('sort_order').then(({data})=>setItems(data||[]))},[])
  return <Page t="Our creations">{items===null?<p>Loading…</p>:<div className="grid">{(items.length?items:SAMPLE).map(x=><article className="card photo" key={x.id}>{x.img&&<img src={x.img} alt={x.title}/>}<h3>{x.title}</h3><span className="pill">{x.category}</span><p>{x.description}</p></article>)}</div>}</Page>
}
export const About=()=><Page t="About"><p>We turn what you know about someone into a gift made for them. You describe the person, we curate and create, and we stay in touch until it arrives.</p></Page>
export function FAQs(){
  const [q,setQ]=useState([])
  useEffect(()=>{supabase.from('faq_items').select('*').eq('published',true).order('sort_order').then(({data})=>setQ(data||[]))},[])
  return <Page t="FAQs">{(q.length?q:SAMPLE_FAQ).map(x=><details key={x.id} className="card" style={{marginBottom:'.75rem'}}><summary>{x.question}</summary><p>{x.answer}</p></details>)}</Page>
}
export function Contact(){
  const [s,setS]=useState({}),[st,setSt]=useState('idle')
  async function send(e){e.preventDefault();setSt('busy')
    const {error}=await supabase.from('contact_messages').insert({name:s.name,email:s.email,phone:s.phone||null,subject:s.subject,message:s.message})
    setSt(error?'error':'done')}
  const f=(k,l,T='input',x={})=>{const C=T;return <div><label htmlFor={k}>{l}</label><C id={k} required={!x.opt} maxLength={T==='textarea'?2000:200} type={x.type} value={s[k]||''} onChange={e=>setS({...s,[k]:e.target.value})}/></div>}
  return <Page t="Contact">{st==='done'?<p>Message sent. We'll reply by email.</p>:<form onSubmit={send} style={{maxWidth:520}}>
    {f('name','Name')}{f('email','Email','input',{type:'email'})}{f('phone','Phone (optional)','input',{type:'tel',opt:1})}{f('subject','Subject')}{f('message','Message','textarea')}
    {st==='error'&&<p className="err" role="alert">Your message was not sent. Please try again.</p>}
    <div className="row"><span/><button className="btn" disabled={st==='busy'}>{st==='busy'?'Sending…':'Send message'}</button></div></form>}</Page>
}
export const Privacy=()=><Page t="Privacy policy"><p>Placeholder: describe what you collect, why, retention period and your privacy contact. Finalize with legal advice before launch.</p></Page>
export const Terms=()=><Page t="Terms"><p>Placeholder: describe service terms, quotes, payment, changes and cancellations.</p></Page>
