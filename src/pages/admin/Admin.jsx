import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
export const STATUSES=['New Request','Under Review','Awaiting Customer Information','Proposal Prepared','Awaiting Customer Approval','Awaiting Payment','In Production','Ready for Dispatch','Dispatched','Completed','Cancelled']

export function Guard({children}){
  const [ok,setOk]=useState(null)
  useEffect(()=>{supabase.auth.getSession().then(({data})=>setOk(!!data.session))},[])
  if(ok===null)return <p className="wrap">Checking access…</p>
  return ok?<div className="wrap sec">{children}</div>:<Navigate to="/admin/login" replace/>
}
export function Login(){
  const nav=useNavigate();const [e,setE]=useState({}),[err,setErr]=useState('')
  async function go(ev){ev.preventDefault()
    const {error}=await supabase.auth.signInWithPassword({email:e.email,password:e.password})
    error?setErr('Email or password is incorrect.'):nav('/admin/requests')}
  return <section className="sec wrap" style={{maxWidth:420}}><h1 style={{fontSize:'2.4rem'}}>Staff sign in</h1>
    <form onSubmit={go}><label htmlFor="em">Email</label><input id="em" type="email" required onChange={x=>setE({...e,email:x.target.value})}/>
    <label htmlFor="pw">Password</label><input id="pw" type="password" required onChange={x=>setE({...e,password:x.target.value})}/>
    {err&&<p className="err" role="alert">{err}</p>}<div className="row"><span/><button className="btn">Sign in</button></div></form></section>
}
export function Requests(){
  const [rows,setRows]=useState(null),[q,setQ]=useState(''),[status,setStatus]=useState(''),[err,setErr]=useState('')
  useEffect(()=>{let r=supabase.from('gift_requests').select('id,reference,customer_name,customer_email,occasion,status,urgent,created_at').order('created_at',{ascending:false}).limit(100)
    if(status)r=r.eq('status',status)
    if(q.trim()){const s=q.trim().replace(/[%,()]/g,'');r=r.or(`reference.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%,customer_phone.ilike.%${s}%`)}
    r.then(({data,error})=>{error?setErr('Could not load requests.'):setRows(data)})},[q,status])
  return <><h1 style={{fontSize:'2.4rem'}}>Requests</h1>
    <div className="grid"><div><label htmlFor="s">Search</label><input id="s" placeholder="Reference, name, email or phone" value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div><label htmlFor="st">Status</label><select id="st" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div></div>
    {err&&<p className="err" role="alert">{err}</p>}
    {rows&&!rows.length?<p>No requests match.</p>:<div className="scroll"><table><thead><tr><th>Reference</th><th>Customer</th><th>Occasion</th><th>Status</th><th>Received</th></tr></thead>
    <tbody>{(rows||[]).map(r=><tr key={r.id}><td><Link to={`/admin/requests/${r.id}`}>{r.reference}</Link></td><td>{r.customer_name}</td><td>{r.occasion}</td><td><span className="pill">{r.status}</span></td><td>{new Date(r.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</>
}
export function RequestDetail(){
  const {id}=useParams();const [r,setR]=useState(null),[hist,setHist]=useState([]),[notes,setNotes]=useState([]),[note,setNote]=useState(''),[msg,setMsg]=useState('')
  const load=async()=>{
    const a=await supabase.from('gift_requests').select('*').eq('id',id).single();setR(a.data)
    setHist((await supabase.from('request_status_history').select('*').eq('request_id',id).order('created_at',{ascending:false})).data||[])
    setNotes((await supabase.from('request_notes').select('*').eq('request_id',id).order('created_at',{ascending:false})).data||[])}
  useEffect(()=>{load()},[id])
  async function changeStatus(to){setMsg('')
    const {error}=await supabase.rpc('change_request_status',{p_id:id,p_status:to,p_comment:null});setMsg(error?'Status was not changed.':'Status updated.');load()}
  async function addNote(){if(!note.trim())return
    const {error}=await supabase.from('request_notes').insert({request_id:id,body:note.trim()});if(!error){setNote('');load()}}
  if(!r)return <p>Loading…</p>
  const hide=['id','status','urgent','created_at','updated_at','idempotency_key']
  return <><Link to="/admin/requests">All requests</Link><h1 style={{fontSize:'2.4rem'}}>{r.reference}</h1>
    <label htmlFor="ns">Status</label><select id="ns" value={r.status} onChange={e=>changeStatus(e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
    {msg&&<p role="status">{msg}</p>}
    <div className="card" style={{margin:'1.5rem 0'}}>{Object.entries(r).filter(([k,x])=>!hide.includes(k)&&x!==null&&x!=='').map(([k,x])=><p key={k} style={{margin:'.3rem 0'}}><strong style={{color:'var(--plum)'}}>{k.replace(/_/g,' ')}:</strong> {String(x)}</p>)}</div>
    <h2>Internal notes</h2><textarea aria-label="New internal note" value={note} onChange={e=>setNote(e.target.value)}/><div className="row"><span/><button className="btn" onClick={addNote}>Add note</button></div>
    {notes.map(n=><p key={n.id}>{n.body}</p>)}
    <h2>Status history</h2>{hist.map(h=><p key={h.id}>{h.old_status||'—'} to {h.new_status} on {new Date(h.created_at).toLocaleString()}</p>)}</>
}
