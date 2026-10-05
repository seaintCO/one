'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Languages, MessageCircle, ReceiptText, Sparkles, Users, WalletCards } from 'lucide-react';

type Bootstrap = {
  business: { name: string; preferred_language?: string } | null;
  phoneNumber: string | null;
  contacts: any[];
  messages: any[];
  invoices?: any[];
  capabilities?: { aiWriting?: boolean };
};

function prettyPhone(value?: string | null) {
  const digits = String(value || '').replace(/\D/g, '');
  const d = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return d.length === 10 ? `+1 ${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6)}` : value || 'Number setup required';
}

export default function Dashboard() {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/crm/bootstrap', { cache: 'no-store' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not load workspace'); return j; })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const latestContacts = useMemo(() => (data?.contacts || []).slice(0, 3), [data]);
  const outstanding = useMemo(() => (data?.invoices || []).filter((i:any) => !['paid','void','failed'].includes(i.status)).reduce((sum:number, i:any) => sum + Number(i.amount_cents || 0), 0) / 100, [data]);
  const inbound = useMemo(() => (data?.messages || []).filter((m:any) => m.direction === 'inbound').length, [data]);

  if (error) return <div className="mobile-product-shell"><div className="notice">{error}</div></div>;

  return <div className="mobile-product-shell">
    <div className="mobile-product-head"><div><small>WELCOME BACK</small><strong>{data?.business?.name || 'Your business'}</strong></div><div className="mobile-product-avatar">{(data?.business?.name || 'ONE').split(' ').map((x:string)=>x[0]).join('').slice(0,2).toUpperCase()}</div></div>

    <section className="mobile-line-card">
      <div className="mobile-line-kicker"><span/> BUSINESS LINE · {data?.phoneNumber ? 'ACTIVE' : 'SETUP'}</div>
      <h2>{prettyPhone(data?.phoneNumber)}</h2>
      <div className="mobile-line-wave">{[1,2,3,4,5,6,7,8].map(n=><span key={n}/>)}</div>
      <p>{data?.business?.preferred_language ? `${data.business.preferred_language} workspace` : 'Translation ready'} · {data?.contacts?.length || 0} customers</p>
    </section>

    <div className="mobile-section-label">DO BUSINESS</div>
    <div className="mobile-quick-actions launch-actions">
      <Link href="/app/inbox"><MessageCircle size={20}/><span>Messages</span></Link>
      <Link href="/app/customers"><Users size={20}/><span>Customer</span></Link>
      <Link href="/app/money?new=invoice"><ReceiptText size={20}/><span>Invoice</span></Link>
      <Link href="/app/inbox"><Sparkles size={20}/><span>AI Assist</span></Link>
    </div>

    <div className="mobile-section-row"><div className="mobile-section-label">RECENT CUSTOMERS</div><Link href="/app/inbox">Open inbox <ArrowRight size={13}/></Link></div>

    {latestContacts.length ? latestContacts.map((contact:any, index:number) => {
      const latest = [...(data?.messages || [])].reverse().find((m:any) => m.from_number === contact.phone || m.to_number === contact.phone);
      return <Link href="/app/inbox" className={`mobile-customer-card ${index === 0 ? 'active' : ''}`} key={contact.id}>
        <div className="mobile-customer-avatar">{String(contact.name || '?').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()}</div>
        <div className="mobile-customer-copy"><strong>{contact.name || contact.phone}</strong><p>{latest?.body || contact.lead_status || 'Customer'}</p>{latest?.translated_body && <small>{latest.translated_body}</small>}</div>
      </Link>;
    }) : <div className="mobile-smart-card"><div className="mobile-smart-icon"><Sparkles size={17}/></div><div><strong>Your CRM is ready.</strong><p>Add a customer or receive your first text to begin.</p></div><Link href="/app/customers"><ArrowRight size={16}/></Link></div>}

    <div className="mobile-translation-strip"><Languages size={16}/><span>AI helps write. Translation happens before SMS delivery. You always press Send.</span></div>

    <div className="mobile-section-label mobile-overview-label">TODAY</div>
    <div className="mobile-overview-grid launch-overview-grid">
      <Link href="/app/inbox" className="mobile-overview-card"><MessageCircle size={17}/><strong>{inbound}</strong><span>Inbound</span></Link>
      <Link href="/app/customers" className="mobile-overview-card"><Users size={17}/><strong>{data?.contacts?.length||0}</strong><span>Customers</span></Link>
      <Link href="/app/money" className="mobile-overview-card"><WalletCards size={17}/><strong>${outstanding.toLocaleString()}</strong><span>Outstanding</span></Link>
      <Link href="/app/inbox" className="mobile-overview-card"><Sparkles size={17}/><strong>{data?.capabilities?.aiWriting?'On':'Setup'}</strong><span>AI Assist</span></Link>
    </div>
  </div>;
}
