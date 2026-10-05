'use client';
import Link from 'next/link';
import { ArrowRight, CreditCard, Database, Languages, MessageCircle, Search, Sparkles } from 'lucide-react';
import PublicNav from '@/components/PublicNav';

const flow=[
  ['01','Create your account','Sign up and create your private business workspace.'],
  ['02','Choose your area code','Search live carrier inventory for your preferred local area code.'],
  ['03','Pick your number','ONE provisions the selected number and assigns it to your business.'],
  ['04','Open your inbox','Incoming and outgoing customer texts live inside ONE.'],
  ['05','Let AI help you write','ONE prepares reply drafts and can fix grammar, make a message professional, or shorten it. You review it and press Send.'],
  ['06','Invoice and get paid','Create an invoice, text the secure Stripe payment link, and let payment status update from the webhook.'],
];

export default function How(){return <div className="one-public"><PublicNav/><main className="one-subpage"><section className="one-subhero"><span className="one-kicker">HOW IT WORKS</span><h1>Complex infrastructure.<br/>A simple experience.</h1><p>Your customer sees your business number. ONE handles the software and provider connections behind the scenes.</p><div className="one-hero-actions"><Link href="/signup" className="one-btn one-btn-primary">Start onboarding <ArrowRight size={16}/></Link><Link href="/features" className="one-btn one-btn-ghost">Explore features</Link></div></section><section className="one-flow-grid">{flow.map(([n,t,d])=><article key={n}><span>{n}</span><h2>{t}</h2><p>{d}</p></article>)}</section><section className="one-stack-strip"><div><Search/><strong>Telnyx</strong><span>Number inventory + SMS</span></div><div><MessageCircle/><strong>Messaging</strong><span>Customer inbox</span></div><div><Sparkles/><strong>OpenAI</strong><span>Reply drafts + grammar</span></div><div><Languages/><strong>Translation</strong><span>English ↔ Spanish</span></div><div><Database/><strong>Supabase</strong><span>Auth + CRM data</span></div><div><CreditCard/><strong>Stripe</strong><span>Invoices + payments</span></div></section></main></div>}
