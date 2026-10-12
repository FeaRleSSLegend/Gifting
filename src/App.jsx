import { useEffect, useState } from 'react'
import { useBreakpoint } from './hooks/useScreen.js'
import { Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom'
import Backdrop from './components/Backdrop.jsx'
import Welcome, { seen } from './pages/Welcome.jsx'
import Home from './pages/Home.jsx'
import CreateGift from './pages/CreateGift.jsx'
import { Success, Creations, About, FAQs, Contact, Privacy, Terms } from './pages/Public.jsx'
import { Login, Requests, RequestDetail, Guard } from './pages/admin/Admin.jsx'
const links=[['/create-gift','Create a gift'],['/our-creations','Our creations'],['/about','About'],['/faqs','FAQs'],['/contact','Contact']]
export default function App(){
  const {pathname}=useLocation()
  const {isMobile,bp}=useBreakpoint(),[open,setOpen]=useState(false)
  useEffect(()=>{document.documentElement.dataset.bp=bp},[bp])
  useEffect(()=>setOpen(false),[pathname,isMobile])
  useEffect(()=>{const k=e=>e.key==='Escape'&&setOpen(false);addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[])
  return <>
    <Backdrop/>
    <header className="nav"><div className="bar">
      <Link to="/" className="brand">Gift Studio</Link>
      {isMobile&&<button className="menu" aria-expanded={open} aria-controls="mainnav" aria-label="Menu" onClick={()=>setOpen(o=>!o)}><i/><i/></button>}
      <nav id="mainnav" aria-label="Main" className={isMobile?`sheet ${open?'open':''}`:''}>{links.map(([to,t])=><NavLink key={to} to={to} className={({isActive})=>isActive?'active':''}>{t}</NavLink>)}</nav>
    </div></header>
    <main key={pathname} className="page">
      <Routes>
        <Route path="/" element={seen()?<Home/>:<Navigate to="/welcome" replace/>}/><Route path="/welcome" element={<Welcome/>}/><Route path="/create-gift" element={<CreateGift/>}/>
        <Route path="/request-success" element={<Success/>}/><Route path="/our-creations" element={<Creations/>}/>
        <Route path="/about" element={<About/>}/><Route path="/faqs" element={<FAQs/>}/><Route path="/contact" element={<Contact/>}/>
        <Route path="/privacy" element={<Privacy/>}/><Route path="/terms" element={<Terms/>}/>
        <Route path="/admin/login" element={<Login/>}/>
        <Route path="/admin" element={<Navigate to="/admin/requests" replace/>}/>
        <Route path="/admin/requests" element={<Guard><Requests/></Guard>}/>
        <Route path="/admin/requests/:id" element={<Guard><RequestDetail/></Guard>}/>
        <Route path="*" element={<section className="sec wrap"><h1>Page not found</h1><Link to="/">Go to the home page</Link></section>}/>
      </Routes>
    </main>
    <footer><div className="wrap"><Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link></div></footer>
  </>
}
