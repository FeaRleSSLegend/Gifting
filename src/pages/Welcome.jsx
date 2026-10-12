import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Art } from '../components/Art.jsx'
export const seen=()=>{try{return localStorage.getItem('welcomed')==='1'}catch{return false}}
const mark=()=>{try{localStorage.setItem('welcomed','1')}catch{}}
const SLIDES=[
 {art:'rose',t:'Tell us about them',d:'Share what they love, how you know them and what the moment means.'},
 {art:'gift1',t:'We curate your gift',d:'We design something around their personality, wrapped with care.'},
 {art:'gift2',t:'Sit back, we handle the rest',d:'We confirm every detail with you before anything is made or sent.'}]
export default function Welcome(){
  const nav=useNavigate(),[i,setI]=useState(0),[dx,setDx]=useState(0),[drag,setDrag]=useState(false),s=useRef({})
  const last=SLIDES.length-1, go=()=>{mark();nav('/create-gift')}, skip=()=>{mark();nav('/')}
  useEffect(()=>{const k=e=>{if(e.key==='ArrowRight')setI(x=>Math.min(last,x+1));if(e.key==='ArrowLeft')setI(x=>Math.max(0,x-1))};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[last])
  const down=e=>{e.currentTarget.setPointerCapture(e.pointerId);s.current={x:e.clientX,lx:e.clientX,lt:performance.now(),v:0};setDrag(true)}
  const move=e=>{if(!drag)return;const t=performance.now();s.current.v=(e.clientX-s.current.lx)/Math.max(1,t-s.current.lt);s.current.lx=e.clientX;s.current.lt=t
    let d=e.clientX-s.current.x;if((i===0&&d>0)||(i===last&&d<0))d*=.35 // rubber-band at the edges
    setDx(d)}
  const up=e=>{if(!drag)return;setDrag(false)
    const w=e.currentTarget.clientWidth,proj=dx+s.current.v*220 // momentum projection from release velocity
    if(proj<-w*.25&&i<last)setI(i+1);else if(proj>w*.25&&i>0)setI(i-1);setDx(0)}
  return <section className="onb wrap">
    <button className="btn ghost skip" onClick={skip}>Skip</button>
    <div className="viewport" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="track" style={{transform:`translateX(calc(${-i*100}% + ${dx}px))`,transition:drag?'none':'transform 520ms var(--spring)'}}>
        {SLIDES.map((x,k)=><div className="slide" key={k} aria-hidden={k!==i}>
          <div className={`art-stage ${k===i?'on':''}`}><Art name={x.art} className={`static ${x.art.startsWith("gift")?"framed":""}`}/></div>
          <div className="glass" style={{textAlign:'center'}}><h2>{x.t}</h2><p style={{margin:'0 auto'}}>{x.d}</p></div></div>)}
      </div></div>
    <div className="dots" role="tablist">{SLIDES.map((_,k)=><button key={k} aria-label={`Step ${k+1}`} aria-selected={k===i} className={k===i?'on':''} onClick={()=>setI(k)}/>)}</div>
    <div style={{textAlign:'center',marginTop:'1.5rem'}}>
      {i<last?<button className="btn" onClick={()=>setI(i+1)}>Continue</button>:<button className="btn" onClick={go}>Start your gift</button>}</div>
  </section>
}
