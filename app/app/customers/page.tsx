'use client';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, X, MessageCircle, Phone, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Contact = { id:string; name:string; phone:string; preferred_language?:string; lead_status?:string; email?:string };

export default function Customers(){
  const r=useRouter();
  const [contacts,setContacts]=useState<Contact[]>([]);
  const [query,setQuery]=useState('');
  const [modal,setModal]=useState(false);
  const [detail,setDetail]=useState<Contact|null>(null);
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [language,setLanguage]=useState('English');
  const [error,setError]=useState('');

  async function load(){
    try { const res=await fetch('/api/crm/contacts',{cache:'no-store'}); const j=await res.json(); if(!res.ok)throw new Error(j.error||'Could not load customers'); setContacts(j.contacts||[]); }
    catch(e:any){setError(e.message)}
  }
  useEffect(()=>{load()},[]);
  const filtered=useMemo(()=>contacts.filter(c=>`${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())),[contacts,query]);

  async function add(){
    if(!name||!phone)return;
    setError('');
    const res=await fetch('/api/crm/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,phone,language})});
    const j=await res.json();
    if(!res.ok){setError(j.error||'Could not add customer');return}
    setContacts(v=>[j.contact,...v]); setName(''); setPhone(''); setModal(false);
  }

  return <>
    <div className="app-topbar"><div><div className="eyebrow">CRM</div><h1 className="page-title">Customers</h1></div><button onClick={()=>setModal(true)} className="btn btn-primary"><Plus size={15}/> Add customer</button></div>
    {error&&<div className="notice" style={{marginBottom:12}}>{error}</div>}
    <div className="panel" style={{marginBottom:12}}><div style={{padding:14,position:'relative'}}><Search size={15} style={{position:'absolute',left:28,top:27,color:'#666'}}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or phone" style={{width:'100%',padding:'12px 14px 12px 38px',borderRadius:13,border:'1px solid #25252a',background:'#151517',color:'#fff'}}/></div></div>
    <div className="table-wrap"><table className="table"><thead><tr><th>Customer</th><th>Status</th><th>Language</th><th>Phone</th></tr></thead><tbody>{filtered.map(c=><tr key={c.id} onClick={()=>setDetail(c)}><td><strong>{c.name}</strong></td><td><span className="status-pill">{c.lead_status||'New lead'}</span></td><td>{c.preferred_language||'English'}</td><td>{c.phone}</td></tr>)}</tbody></table></div>
    {modal&&<div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>Add customer</h3><button className="icon-btn" onClick={()=>setModal(false)}><X size={16}/></button></div><label className="field">Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Maria Rodriguez"/></label><label className="field">Phone<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 615 555 0123"/></label><label className="field">Preferred language<select value={language} onChange={e=>setLanguage(e.target.value)}><option>English</option><option>Spanish</option></select></label><div className="modal-actions"><button className="btn" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={add}>Add customer</button></div></div></div>}
    {detail&&<div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h3>{detail.name}</h3><div className="muted" style={{fontSize:11,marginTop:4}}>{detail.phone} · {detail.preferred_language||'English'}</div></div><button className="icon-btn" onClick={()=>setDetail(null)}><X size={16}/></button></div><div style={{display:'flex',gap:8,margin:'16px 0'}}><button className="btn" onClick={()=>r.push(`/app/inbox?contact=${detail.id}`)}><MessageCircle size={15}/> Text</button><button className="btn" onClick={()=>r.push('/app/calls')}><Phone size={15}/> Call</button><button className="btn" onClick={()=>r.push(`/app/money?customer=${detail.id}`)}><ReceiptText size={15}/> Invoice</button></div><div className="settings-card"><div className="eyebrow">CUSTOMER</div><div className="row" style={{paddingLeft:0,paddingRight:0}}><div><strong>Lead stage</strong><div className="muted" style={{fontSize:11,marginTop:4}}>{detail.lead_status||'New lead'}</div></div></div></div></div></div>}
  </>;
}
