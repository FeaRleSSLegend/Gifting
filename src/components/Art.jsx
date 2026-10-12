import { useEffect, useRef, useState } from 'react'
const RINGS=[[64,8,0,30,50],[46,6,22,26,40],[28,5,40,19,29],[11,4,12,11,17]]
function Bloom({id,a='#FBE6EC',b='#AD536F'}){
  return <svg viewBox="0 0 200 200" aria-hidden="true"><defs>
    <radialGradient id={id} cx="50%" cy="25%" r="80%"><stop offset="0" stopColor={a}/><stop offset=".6" stopColor="#D991A8"/><stop offset="1" stopColor={b}/></radialGradient>
    <filter id={id+'s'} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#49353B" floodOpacity=".28"/></filter></defs>
    <g filter={`url(#${id}s)`}>{RINGS.map(([r,n,off,rx,ry],k)=>Array.from({length:n},(_,j)=>
      <ellipse key={k+'-'+j} cx="100" cy={100-r} rx={rx} ry={ry} fill={`url(#${id})`} stroke="rgba(255,255,255,.45)" strokeWidth=".8" transform={`rotate(${j*360/n+off} 100 100)`}/>))}</g></svg>
}
function Sprig(){
  return <svg viewBox="0 0 120 220" aria-hidden="true"><defs><linearGradient id="lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B7C7AB"/><stop offset="1" stopColor="#6F8A68"/></linearGradient></defs>
    <path d="M60 215 C58 150 62 90 60 8" stroke="#7E9777" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {[[60,40,-1],[60,75,1],[60,110,-1],[60,145,1],[60,180,-1]].map(([x,y,s],i)=>
      <path key={i} d={`M${x} ${y} C${x+s*44} ${y-26} ${x+s*52} ${y+6} ${x} ${y+4}`} fill="url(#lf)" opacity=".92"/>)}</svg>
}
function Box(){
  return <svg viewBox="0 0 240 240" aria-hidden="true"><defs>
    <linearGradient id="bx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF"/><stop offset="1" stopColor="#F4DDE3"/></linearGradient>
    <linearGradient id="rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#AD536F"/><stop offset=".5" stopColor="#D991A8"/><stop offset="1" stopColor="#AD536F"/></linearGradient>
    <radialGradient id="bw" cx="40%" cy="30%" r="80%"><stop offset="0" stopColor="#E9A9BD"/><stop offset="1" stopColor="#AD536F"/></radialGradient>
    <filter id="bs" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#49353B" floodOpacity=".3"/></filter></defs>
    <g filter="url(#bs)"><rect x="40" y="108" width="160" height="104" rx="10" fill="url(#bx)" stroke="#E8D8CA"/>
    <rect x="32" y="84" width="176" height="36" rx="10" fill="url(#bx)" stroke="#E8D8CA"/>
    <rect x="109" y="84" width="22" height="128" fill="url(#rb)"/><rect x="32" y="96" width="176" height="0" fill="none"/>
    <path d="M120 84 C80 30 40 52 78 80 C96 92 112 86 120 84Z" fill="url(#bw)"/><path d="M120 84 C160 30 200 52 162 80 C144 92 128 86 120 84Z" fill="url(#bw)"/>
    <circle cx="120" cy="84" r="11" fill="#AD536F"/></g></svg>
}
const ART={rose:<Bloom id="r1"/>,peony:<Bloom id="r2" a="#FFF3F6" b="#C36A87"/>,box:<Box/>,sprig:<Sprig/>}
// Photos live at public/art/<name>.jpg (rose, box, peony); the SVGs are only a fallback.
export function Art({name,className='',delay=0,style}){
  const [png,setPng]=useState(true),[on,setOn]=useState(false),ref=useRef(null)
  useEffect(()=>{const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){setOn(true);io.disconnect()}},{threshold:.15});io.observe(ref.current);return()=>io.disconnect()},[])
  return <div ref={ref} className={`art ${on?'in':''} ${className}`} style={{transitionDelay:`${delay}ms`,...style}}>
    <div className="bob" style={{animationDelay:`${delay}ms`}}>{png?<img src={`/art/${name}.jpg`} alt="" onError={()=>setPng(false)}/>:ART[name]}</div></div>
}
export function Reveal({children,delay=0,as:T='div',...p}){
  const [on,setOn]=useState(false),ref=useRef(null)
  useEffect(()=>{const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){setOn(true);io.disconnect()}},{threshold:.2});io.observe(ref.current);return()=>io.disconnect()},[])
  return <T ref={ref} className={`reveal ${on?'in':''} ${p.className||''}`} style={{transitionDelay:`${delay}ms`}}>{children}</T>
}
