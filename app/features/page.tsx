'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Languages, MessageSquareText, Phone, ShieldCheck, Sparkles, Users, WalletCards, Zap } from 'lucide-react';
import PublicNav from '@/components/PublicNav';

const items=[
  {icon:Phone,title:'Your own business number',desc:'Choose a local number during onboarding. Texts stay tied to your business identity.'},
  {icon:MessageSquareText,title:'Customer inbox',desc:'Use an iMessage-style inbox for real customer conversations from your ONE number.'},
  {icon:Sparkles,title:'AI Writing Assist',desc:'Generate reply drafts, fix grammar, make messages professional, or shorten them. You always press Send.'},
  {icon:Languages,title:'Automatic translation',desc:'English and Spanish conversations can translate automatically while keeping the original message visible.'},
  {icon:Users,title:'CRM without the CRM feeling',desc:'Messages create a customer history automatically, so you spend less time entering data.'},
  {icon:WalletCards,title:'Invoices + payment links',desc:'Connect Stripe, create an invoice, and text the customer a secure payment link.'},
  {icon:Zap,title:'Invoice reminders',desc:'Unpaid invoices can schedule a reminder and stop automatically after confirmed payment.'},
  {icon:ShieldCheck,title:'Built for production',desc:'Tenant isolation, verified webhooks, opt-outs, rate limits, and provider-backed infrastructure are part of the core.'},
];

export default function Features(){return <div className="one-public"><PublicNav/><main className="one-subpage"><section className="one-subhero"><span className="one-kicker">FEATURES</span><h1>The customer communication essentials.</h1><p>ONE combines a business number, customer inbox, AI writing help, CRM, translation, and invoices without making your team learn five different products.</p><div className="one-hero-actions"><Link href="/signup" className="one-btn one-btn-primary">Start free <ArrowRight size={16}/></Link><Link href="/how-it-works" className="one-btn one-btn-ghost">How it works</Link></div></section><section className="one-feature-page-grid">{items.map(({icon:Icon,title,desc},i)=><motion.article key={title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.45,delay:(i%3)*.04}} className="one-feature-page-card"><div className="one-icon"><Icon size={19}/></div><h2>{title}</h2><p>{desc}</p></motion.article>)}</section><section className="one-page-cta"><h2>Start with the business number.<br/>Handle the customer from one place.</h2><p>The launch version focuses on business numbers, messaging, AI writing help, customers, translation, invoices, and payments.</p><Link href="/signup" className="one-btn one-btn-primary">Get your number <ArrowRight size={16}/></Link></section></main></div>}
