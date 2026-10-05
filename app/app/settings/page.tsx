'use client';
import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, CreditCard, Languages, Phone, ShieldCheck } from 'lucide-react';

type Bootstrap={business:any;phoneNumber:string|null;capabilities?:{aiWriting?:boolean}};

export default function SettingsPage(){
  const [data,setData]=useState<Bootstrap|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/crm/bootstrap',{cache:'no-store'}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not load settings');return j}).then(setData).catch(e=>setError(e.message))},[]);
  if(error)return <div className="notice">{error}</div>;
  return <>
    <div className="app-topbar"><div><div className="eyebrow">SETTINGS</div><h1 className="page-title">Launch essentials</h1><p className="muted" style={{marginTop:6}}>Only the production features you need to run customer conversations and get paid.</p></div></div>
    <div className="settings-grid production-settings">
      <div className="settings-card"><div className="settings-card-icon"><Building2 size={17}/></div><h3>Business</h3><p>{data?.business?.name||'Business workspace'}</p><span className="setting-state"><CheckCircle2 size={13}/> Workspace active</span></div>
      <div className="settings-card"><div className="settings-card-icon"><Phone size={17}/></div><h3>Business number</h3><p>{data?.phoneNumber||'Choose a number during onboarding'}</p><span className={'setting-state '+(data?.phoneNumber?'':'warning')}><CheckCircle2 size={13}/>{data?.phoneNumber?'Active':'Setup required'}</span></div>
      <div className="settings-card"><div className="settings-card-icon"><Languages size={17}/></div><h3>Translation</h3><p>{data?.business?.preferred_language||'English'} workspace · customer language stored per contact</p><span className="setting-state"><ShieldCheck size={13}/> Server-side translation</span></div>
      <div className="settings-card"><div className="settings-card-icon"><CreditCard size={17}/></div><h3>Payments</h3><p>{data?.business?.stripe_connected_account_id?'Stripe Connect active':'Activate from Money'}</p><span className={'setting-state '+(data?.business?.stripe_connected_account_id?'':'warning')}><CreditCard size={13}/>{data?.business?.stripe_connected_account_id?'Connected':'Activation required'}</span></div>
      <div className="settings-card"><div className="settings-card-icon"><ShieldCheck size={17}/></div><h3>AI Writing Assist</h3><p>Suggested replies, grammar correction, professional rewrites and shorter messages.</p><span className={'setting-state '+(data?.capabilities?.aiWriting?'':'warning')}><ShieldCheck size={13}/>{data?.capabilities?.aiWriting?'Ready':'OPENAI_API_KEY required'}</span></div>
    </div>
    <div className="launch-scope-banner"><ShieldCheck size={18}/><div><strong>Focused production scope</strong><p>International transfers, Sites, POS, advanced campaigns and autonomous sending are intentionally outside this launch build. AI drafts messages; the business owner always presses Send.</p></div></div>
  </>;
}
