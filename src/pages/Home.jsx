import { Link } from 'react-router-dom'
import { Art, Reveal } from '../components/Art.jsx'
const steps=[['Tell us about them','Share who they are, what they love and what the moment means.'],['We curate your gift','We design something around their personality and your budget.'],['We coordinate the rest','We confirm details with you, then prepare and deliver.']]
const occasions=['Birthdays','Anniversaries','Graduations','Weddings','Appreciation','Apologies','Celebrations']
export default function Home(){
  return <>
    <section className="hero wrap"><div className="hero-grid">
      <div className="glass"><h1>Some people deserve more than an ordinary gift.</h1>
        <p>Tell us about someone special. We'll help you turn what makes them unique into a gift worth remembering.</p>
        <Link className="btn" to="/create-gift">Create a gift</Link>
        <div className="chips">{occasions.map(o=><span className="pill" key={o}>{o}</span>)}</div></div>
      <div className="duo"><Art name="gift2" className="framed d1" delay={200}/><Art name="gift1" className="framed d2" delay={420}/></div></div></section>
    <section className="sec wrap"><Reveal as="h2">How it works</Reveal>
      <div className="grid">{steps.map(([t,d],i)=><Reveal key={t} delay={i*90}><div className="card" style={{height:'100%'}}><div className="orb" aria-hidden="true"/><h3>{t}</h3><p>{d}</p></div></Reveal>)}</div></section>
    <section className="sec wrap"><Reveal as="h2">Made for one person</Reveal>
      <div className="grid">{[['gift1','The cozy evening box','Spiced tea, a candle and soft socks for someone who needs a slow night.'],['gift2','The pink celebration basket','Everything their favourite colour, tied up in a satin bow.']].map(([i,t,d],k)=>
        <Reveal key={t} delay={k*100}><Link to="/our-creations" className="card photo"><img src={`/art/${i}.jpg`} alt={t}/><h3>{t}</h3><p>{d}</p></Link></Reveal>)}</div></section>
    <section className="sec wrap"><Reveal><div className="glass" style={{textAlign:'center'}}>
      <h2>Ready when you are</h2><p style={{margin:'0 auto 1.5rem'}}>The questionnaire takes about five minutes. No account needed.</p>
      <Link className="btn" to="/create-gift">Create a gift</Link></div></Reveal></section>
  </>
}
