'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, Check, Languages, Loader2, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';

const steps=[
  {n:1,label:'Business'},
  {n:2,label:'Area code'},
  {n:3,label:'Number'},
];

export default function Onboarding(){
  const r=useRouter();
  const [step,setStep]=useState(1);
  const [business,setBusiness]=useState('');
  const [lang,setLang]=useState('Spanish');
  const [area,setArea]=useState('615');
  const [numbers,setNumbers]=useState<string[]>([]);
  const [chosen,setChosen]=useState('');
  const [loading,setLoading]=useState(false);
  const [accepted,setAccepted]=useState(true);
  const [error,setError]=useState('');

  const progress=useMemo(()=>((step-1)/2)*100,[step]);

  async function find(){
    setLoading(true); setError(''); setNumbers([]); setChosen('');
    try{
      const res=await fetch(`/api/telnyx/numbers?areaCode=${encodeURIComponent(area)}`);
      const j=await res.json();
      if(!res.ok) throw new Error(j.error||'Could not search live number inventory.');
      const live=(j.numbers||[]).map((n:any)=>n.phoneNumber).filter(Boolean);
      if(!live.length) throw new Error('No available numbers were returned for this area code.');
      setNumbers(live); setStep(3);
    }catch(e:any){ setError(e.message||'Number search failed.'); }
    finally{ setLoading(false); }
  }

  async function finish(){
    if(!chosen||!accepted)return;
    setLoading(true); setError('');
    try{
      const res=await fetch('/api/telnyx/provision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        phoneNumber:chosen,
        businessName:business,
        preferredLanguage:lang,
        useCases:['Customer conversations','Estimates & invoices'],
      })});
      const j=await res.json();
      if(!res.ok) throw new Error(j.error||'Could not activate this number.');
      r.push('/app');
    }catch(e:any){ setError(e.message||'Activation failed.'); }
    finally{ setLoading(false); }
  }

  return <main className="elite-onboard-shell">
    <div className="elite-onboard-bg" aria-hidden="true"><i/><i/><i/></div>
    <header className="elite-onboard-top"><button type="button" onClick={()=>step>1?setStep(step-1):r.push('/')}><ArrowLeft size={16}/> Back</button><div className="one-logo">ONE<span>.</span></div><div className="elite-secure"><ShieldCheck size={14}/> Secure setup</div></header>

    <section className="elite-onboard-card">
      <div className="elite-card-glow" aria-hidden="true"/>
      <div className="elite-onboard-intro"><span className="elite-chip"><Sparkles size={12}/> FAST SETUP</span><h1>Get your business number.</h1><p>Create your workspace, choose a local number, and open your inbox.</p></div>

      <div className="elite-steps-wrap"><div className="elite-step-track"><span style={{width:`${progress}%`}}/></div><div className="elite-steps">{steps.map(s=><button type="button" key={s.n} onClick={()=>s.n<step&&setStep(s.n)} className={s.n===step?'active':s.n<step?'done':''} aria-current={s.n===step?'step':undefined}><span>{s.n<step?<Check size={15}/>:String(s.n).padStart(2,'0')}</span><small>{s.label}</small></button>)}</div></div>

      {error&&<div className="notice" style={{marginBottom:14}}>{error}</div>}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{opacity:0,y:16,filter:'blur(4px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} exit={{opacity:0,y:-10}} transition={{duration:.32,ease:[.22,1,.36,1]}} className="elite-step-panel">
          {step===1&&<>
            <div className="elite-step-heading"><div className="elite-step-icon"><Building2 size={20}/></div><div><h2>Tell us about your business.</h2><p>This creates your private ONE workspace.</p></div></div>
            <div className="elite-form-grid"><label><span>Business name</span><input autoFocus value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Saint Masonry"/></label><label><span>Preferred language</span><div className="elite-select-wrap"><Languages size={16}/><select value={lang} onChange={e=>setLang(e.target.value)}><option>English</option><option>Spanish</option></select></div></label></div>
            <button type="button" disabled={!business.trim()} onClick={()=>setStep(2)} className="elite-next">Continue <ArrowRight size={16}/></button>
          </>}

          {step===2&&<>
            <div className="elite-step-heading"><div className="elite-step-icon"><MapPin size={20}/></div><div><h2>Choose your local area code.</h2><p>ONE searches live Telnyx number inventory.</p></div></div>
            <div className="elite-area-card"><div className="elite-area-input"><span>+1</span><input autoFocus inputMode="numeric" maxLength={3} value={area} onChange={e=>setArea(e.target.value.replace(/\D/g,''))}/></div><div><strong>{area.length===3?`${area} local numbers`:'Enter 3 digits'}</strong><small>Local presence for your business</small></div></div>
            <button type="button" disabled={area.length!==3||loading} onClick={find} className="elite-next">{loading?<><Loader2 className="spin" size={16}/> Searching numbers…</>:<>Find available numbers <ArrowRight size={16}/></>}</button>
          </>}

          {step===3&&<>
            <div className="elite-step-heading"><div className="elite-step-icon"><Phone size={20}/></div><div><h2>Pick your business number.</h2><p>This number becomes your identity for customer texts.</p></div></div>
            <div className="elite-number-grid">{numbers.map(n=><button type="button" key={n} onClick={()=>setChosen(n)} className={chosen===n?'selected':''}><div><small>LOCAL BUSINESS LINE</small><strong>{n}</strong></div><span>{chosen===n?<Check size={15}/>:<Phone size={14}/>}</span></button>)}</div>
            <label className="elite-consent"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>I agree to ONE’s Terms, Acceptable Use Policy and messaging rules.</span></label>
            <div className="elite-ready"><ShieldCheck size={16}/><div><strong>{chosen||'Choose a number above'}</strong><small>After activation, ONE opens your customer inbox.</small></div></div>
            <button type="button" onClick={finish} disabled={!chosen||!accepted||loading} className="elite-next elite-activate">{loading?<><Loader2 className="spin" size={16}/> Activating…</>:<>Activate & open ONE <ArrowRight size={16}/></>}</button>
          </>}
        </motion.div>
      </AnimatePresence>
    </section>
    <p className="elite-onboard-foot">Live telecom activation may require identity, business, or carrier verification depending on use.</p>
  </main>
}
