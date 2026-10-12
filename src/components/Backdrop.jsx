import { useLocation } from 'react-router-dom'
import { useBreakpoint } from '../hooks/useScreen.js'
const MAP={'/':[['rose','r'],['peony','l']],'/welcome':[['rose','l'],['peony','r']],'/create-gift':[['peony','r']],'/our-creations':[['rose','l'],['box','r']],'/about':[['box','r']],'/faqs':[['peony','l']],'/contact':[['rose','r']],'/request-success':[['rose','r'],['peony','l']]}
// Low-opacity bouquets that fade into the page behind every public screen.
export default function Backdrop(){
  const {pathname}=useLocation(),{isMobile}=useBreakpoint()
  if(pathname.startsWith('/admin'))return null
  return <div className="backdrop" aria-hidden="true" key={pathname}>{(MAP[pathname]||[['rose','r']]).slice(0,isMobile?1:2).map(([n,s],i)=><img key={n+s} className={`bd ${s} i${i}`} src={`/art/${n}.jpg`} alt=""/>)}</div>
}
