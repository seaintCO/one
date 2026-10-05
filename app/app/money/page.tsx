'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, CreditCard, Link2, MessageCircle, Plus, ReceiptText, X } from 'lucide-react';

type Contact={id:string;name:string;phone:string;email?:string};
type Invoice={id:string;contact_id?:string|null;amount_cents:number;description?:string;status:string;stripe_payment_link?:string|null;created_at:string};

export default function Money(){
  const [modal,setModal]=useState<'invoice'|'stripe'|null>(null);
  const [notice,setNotice]=useState('');
  const [contacts,setContacts]=useState<Contact[]>([]);
  const [invoices,setInvoices]=useState<Invoice[]>([]);
  const [business,setBusiness]=useState<any>(null);
  const [phoneNumber,setPhoneNumber]=useState<string|null>(null);
  const [customerId,setCustomerId]=useState('');
  const [amount,setAmount]=useState('');
  const [description,setDescription]=useState('');
  const [dueDate,setDueDate]=useState('');
  const [sendBySms,setSendBySms]=useState(true);
  const [loading,setLoading]=useState(false);
  const [queryHandled,setQueryHandled]=useState(false);

  async function load(){
    const res=await fetch('/api/crm/bootstrap',{cache:'no-store'}); const j=await res.json();
    if(!res.ok){setNotice(j.error||'Could not load money workspace');return}
    setContacts(j.contacts||[]); setInvoices(j.invoices||[]); setBusiness(j.business||null); setPhoneNumber(j.phoneNumber||null);
    if(!customerId&&j.contacts?.[0]?.id)setCustomerId(j.contacts[0].id);
  }
  useEffect(()=>{load()},[]);

  useEffect(()=>{
    if(queryHandled || typeof window==='undefined' || !contacts.length)return;
    const params=new URLSearchParams(window.location.search);
    if(params.get('new')==='invoice'){
      const requested=params.get('customer');
      if(requested && contacts.some(c=>c.id===requested))setCustomerId(requested);
      setModal('invoice');
    }
    setQueryHandled(true);
  },[contacts,queryHandled]);

  const collected=useMemo(()=>invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.amount_cents||0),0)/100,[invoices]);
  const outstanding=useMemo(()=>invoices.filter(i=>!['paid','void','failed'].includes(i.status)).reduce((s,i)=>s+Number(i.amount_cents||0),0)/100,[invoices]);
  const customer=contacts.find(c=>c.id===customerId)||null;

  async function createInvoice(){
    if(!amount||!customerId)return; setLoading(true); setNotice('');
    try{
      const res=await fetch('/api/stripe/invoice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount,description,customerId,dueDate:dueDate||null})});
      const j=await res.json();
      if(!res.ok)throw new Error(j.error||'Could not create invoice');

      let smsSent=false;
      if(sendBySms && j.url && customer?.phone && phoneNumber){
        const sms=await fetch('/api/telnyx/send-sms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          from:phoneNumber,
          to:customer.phone,
          text:`Invoice from ${business?.name||'your business'}: ${description||'Service'} — $${Number(amount).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}. Pay securely: ${j.url}`,
        })});
        const sj=await sms.json();
        if(!sms.ok)throw new Error(`Invoice created, but SMS failed: ${sj.error||'Could not send payment link'}`);
        smsSent=true;
      }

      await load(); setModal(null); setAmount(''); setDescription(''); setDueDate('');
      setNotice(smsSent?'Invoice created and payment link sent by SMS.':'Invoice created. Copy or open the payment link below.');
      if(typeof window!=='undefined')window.history.replaceState({},'',window.location.pathname);
    }catch(e:any){setNotice(e.message)}finally{setLoading(false)}
  }

  async function connectStripe(){
    try{const res=await fetch('/api/stripe/connect',{method:'POST'});const j=await res.json();if(!res.ok)throw new Error(j.error||'Could not start Stripe');if(j.url)location.href=j.url}catch(e:any){setNotice(e.message)}
  }

  return <>
    <div className="app-topbar"><div><div className="eyebrow">MONEY</div><h1 className="page-title">Invoices & payments</h1><p className="muted" style={{marginTop:6}}>Create an invoice, text the payment link, and let Stripe confirm payment.</p></div><button className="btn btn-primary" onClick={()=>setModal('invoice')}><Plus size={15}/> New invoice</button></div>
    {notice&&<div className="notice" style={{marginBottom:12}}>{notice}</div>}

    <div className="cards">
      <div className="card"><span className="muted">Collected</span><strong>${collected.toLocaleString()}</strong><small>Paid invoices</small></div>
      <div className="card"><span className="muted">Outstanding</span><strong>${outstanding.toLocaleString()}</strong><small>Open invoices</small></div>
      <div className="card"><span className="muted">Invoices paid</span><strong>{invoices.filter(i=>i.status==='paid').length}</strong><small>All time</small></div>
      <div className="card"><span className="muted">Payments</span><strong>{business?.stripe_connected_account_id?'Active':'Setup'}</strong><small>Stripe Connect</small></div>
    </div>

    <div className="attention-grid">
      <section className="panel">
        <div className="panel-head"><div><div className="eyebrow">RECENT</div><h2>Invoices</h2></div><button className="btn btn-ghost" onClick={()=>setModal('invoice')}>New invoice</button></div>
        {invoices.length?invoices.slice(0,10).map(i=>{const c=contacts.find(x=>x.id===i.contact_id);return <div className="row" key={i.id}>
          <div className="avatar"><ReceiptText size={16}/></div>
          <div style={{flex:1,minWidth:0}}><strong>{c?.name||'Customer'}</strong><div className="muted" style={{fontSize:11,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{i.description||'Invoice'}</div></div>
          <strong>${(i.amount_cents/100).toLocaleString()}</strong>
          <span className={'status-pill '+(i.status==='paid'?'live':'')}>{i.status}</span>
          {i.stripe_payment_link&&<a className="icon-btn" href={i.stripe_payment_link} target="_blank" rel="noreferrer" title="Open payment link"><ArrowUpRight size={14}/></a>}
        </div>}):<div className="muted" style={{padding:20}}>No invoices yet.</div>}
      </section>

      <section className="panel">
        <div className="panel-head"><div><div className="eyebrow">PAYMENTS</div><h2>Get paid</h2></div></div>
        <button className="row" style={{width:'100%',background:'transparent',color:'inherit',border:'none',textAlign:'left'}} onClick={()=>setModal('stripe')}>
          <div className="avatar"><CreditCard size={16}/></div><div style={{flex:1}}><strong>Stripe Connect</strong><div className="muted" style={{fontSize:11}}>{business?.stripe_connected_account_id?'Connected to this business':'Activate customer payments'}</div></div>{business?.stripe_connected_account_id?<CheckCircle2 size={16}/>:<ArrowUpRight size={15}/>}</button>
        <div className="finance-launch-note"><MessageCircle size={16}/><div><strong>Invoice from the conversation.</strong><p>Create the invoice here or tap the invoice icon inside Messages. ONE can text the secure payment link from your business number.</p></div></div>
      </section>
    </div>

    {modal&&<div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>{modal==='invoice'?'Create invoice':'Activate payments'}</h3><button className="icon-btn" onClick={()=>setModal(null)}><X size={16}/></button></div>
      {modal==='invoice'&&<>
        <label className="field">Customer<select value={customerId} onChange={e=>setCustomerId(e.target.value)}>{contacts.map(c=><option value={c.id} key={c.id}>{c.name} · {c.phone}</option>)}</select></label>
        <label className="field">Amount<input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0.50" step="0.01" placeholder="850.00"/></label>
        <label className="field">Description<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Deposit / project / service"/></label>
        <label className="field">Due date<input value={dueDate} onChange={e=>setDueDate(e.target.value)} type="date"/></label>
        <label className="invoice-send-toggle"><input type="checkbox" checked={sendBySms} onChange={e=>setSendBySms(e.target.checked)} disabled={!phoneNumber}/><span><strong>Text the payment link</strong><small>{phoneNumber?'Send from your ONE business number after creating the invoice.':'Activate a business number first.'}</small></span></label>
        <div className="modal-actions"><button className="btn" onClick={()=>setModal(null)}>Cancel</button><button disabled={loading||!customerId||!amount} className="btn btn-primary" onClick={createInvoice}><Link2 size={15}/> {loading?'Creating…':'Create invoice'}</button></div>
      </>}
      {modal==='stripe'&&<><p className="muted">Stripe Connect lets this business accept its own customer payments. ONE does not hold the business’s customer funds.</p><div className="modal-actions"><button className="btn" onClick={()=>setModal(null)}>Not now</button><button className="btn btn-primary" onClick={connectStripe}>{business?.stripe_connected_account_id?'Continue Stripe setup':'Activate payments'}</button></div></>}
    </div></div>}
  </>;
}
