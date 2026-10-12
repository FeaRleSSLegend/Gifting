import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
// Subscribes to a CSS media query; re-renders only when the match flips.
export function useMediaQuery(q){
  const sub=useCallback(cb=>{const m=matchMedia(q);m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb)},[q])
  return useSyncExternalStore(sub,()=>matchMedia(q).matches,()=>false)
}
// Named breakpoints: mobile ≤640, tablet 641–1024, desktop >1024, wide ≥1280.
export function useBreakpoint(){
  const isMobile=useMediaQuery('(max-width:640px)'),isTablet=useMediaQuery('(min-width:641px) and (max-width:1024px)'),isWide=useMediaQuery('(min-width:1280px)')
  const isTouch=useMediaQuery('(pointer:coarse)'),isPortrait=useMediaQuery('(orientation:portrait)'),reducedMotion=useMediaQuery('(prefers-reduced-motion:reduce)')
  return {isMobile,isTablet,isDesktop:!isMobile&&!isTablet,isWide,isTouch,isPortrait,reducedMotion,bp:isMobile?'mobile':isTablet?'tablet':isWide?'wide':'desktop'}
}
// Live width/height (uses visualViewport so mobile browser bars and keyboards are accounted for), throttled to one update per frame.
export function useViewport(){
  const read=()=>({width:visualViewport?.width??innerWidth,height:visualViewport?.height??innerHeight})
  const [v,setV]=useState(read)
  useEffect(()=>{let f=0;const on=()=>{cancelAnimationFrame(f);f=requestAnimationFrame(()=>setV(read()))}
    const t=visualViewport||window;t.addEventListener('resize',on);return()=>{t.removeEventListener('resize',on);cancelAnimationFrame(f)}},[])
  return v
}
