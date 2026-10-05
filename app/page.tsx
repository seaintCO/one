'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  CheckCheck,
  ChevronRight,
  CirclePlus,
  Home as HomeIcon,
  Info,
  Languages,
  MessageCircle,
  Phone,
  ReceiptText,
  Search,
  Send,
  Settings,
  Signal,
  Sparkles,
  SquarePen,
  Smartphone,
  Users,
  WalletCards,
  Wifi,
} from 'lucide-react';
import PublicNav from '@/components/PublicNav';

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const },
};

type DemoMode = 'home' | 'inbox' | 'customers' | 'money' | 'settings';

type WritingTool = 'reply' | 'grammar' | 'professional' | 'shorten';

export default function Home() {
  const [demoMode, setDemoMode] = useState<DemoMode>('home');
  const [threadOpen, setThreadOpen] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [demoDraft, setDemoDraft] = useState('yes we can be there at 10');

  function openMode(mode: DemoMode) {
    setDemoMode(mode);
    setThreadOpen(false);
    setReplySent(false);
  }

  function writingTool(tool: WritingTool) {
    if (tool === 'reply') setDemoDraft('Yes — we can be there around 10 AM. Does that work for you?');
    if (tool === 'grammar') setDemoDraft('Yes, we can be there at 10.');
    if (tool === 'professional') setDemoDraft('Absolutely — we can be there at 10 AM. Does that work for you?');
    if (tool === 'shorten') setDemoDraft('Yes — 10 AM works for us.');
  }

  function sendDemo() {
    if (!demoDraft.trim()) return;
    setReplySent(true);
    window.setTimeout(() => setDemoDraft(''), 220);
  }

  return (
    <div className="one-public informal-home">
      <PublicNav />
      <main>
        <section className="informal-hero">
          <div className="informal-hero-glow" aria-hidden="true" />

          <motion.div {...reveal} className="informal-copy">
            <div className="informal-eyebrow"><span /> ONE BUSINESS OS</div>
            <h1>Run your business from one number.</h1>
            <p>
              Text customers. Let AI help you write. Send invoices. Get paid.
              All from the same customer conversation.
            </p>
            <div className="informal-actions">
              <Link href="/signup" className="one-btn one-btn-primary">
                Get your number <ArrowRight size={16} />
              </Link>
              <Link href="/how-it-works" className="one-btn one-btn-ghost">See how it works</Link>
            </div>
            <div className="informal-proof">
              <span>Real business number</span><i />
              <span>AI writing assist</span><i />
              <span>Invoices + payments</span>
            </div>
          </motion.div>

          <motion.div
            className="sandbox-stage iphone-stage"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.72, delay: 0.08 }}
          >
            <motion.div
              className="sandbox-phone iphone-device"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="sandbox-frame" />
              <div className="iphone-metal-highlight" aria-hidden="true" />
              <div className="sandbox-side sandbox-side-left"><i /><i /></div>
              <div className="sandbox-side sandbox-side-right"><i /></div>
              <div className="sandbox-island"><span /><i /></div>

              <div className="sandbox-screen iphone-screen">
                <div className="sandbox-statusbar iphone-statusbar">
                  <span>9:41</span>
                  <div><Signal size={12} /><Wifi size={12} /><BatteryFull size={14} /></div>
                </div>

                <AnimatePresence mode="wait">
                  {demoMode === 'home' && (
                    <motion.div key="home" className="iphone-crm-scene" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}>
                      <div className="iphone-crm-header">
                        <div><small>WELCOME BACK</small><strong>Saint Masonry</strong></div>
                        <div className="sandbox-avatar">SM</div>
                      </div>

                      <button type="button" className="iphone-business-line" onClick={() => openMode('settings')}>
                        <div className="sandbox-line-kicker"><span /> BUSINESS LINE · ACTIVE</div>
                        <div className="iphone-line-row"><b>+1 615 555 0184</b><ChevronRight size={15}/></div>
                        <div className="sandbox-wave">{[1,2,3,4,5,6,7,8].map(n => <span key={n} />)}</div>
                        <p>English ↔ Spanish · 3 customers today</p>
                      </button>

                      <div className="iphone-section-row"><span>DO BUSINESS</span></div>
                      <div className="iphone-quick-grid">
                        <button type="button" onClick={() => openMode('inbox')}><MessageCircle size={18}/><span>Messages</span></button>
                        <button type="button" onClick={() => openMode('customers')}><Users size={18}/><span>Customer</span></button>
                        <button type="button" onClick={() => openMode('money')}><ReceiptText size={18}/><span>Invoice</span></button>
                        <button type="button" onClick={() => { openMode('inbox'); setThreadOpen(true); }}><Sparkles size={18}/><span>AI Assist</span></button>
                      </div>

                      <div className="iphone-section-row"><span>RECENT CUSTOMERS</span><button type="button" onClick={() => openMode('inbox')}>Open inbox</button></div>
                      <button type="button" className="iphone-recent-card active" onClick={() => { openMode('inbox'); setThreadOpen(true); }}>
                        <div className="sandbox-thread-avatar">MR</div>
                        <div><strong>Maria Rodriguez</strong><p>¿Pueden venir mañana?</p><small>Can you come tomorrow?</small></div>
                        <span>2m</span>
                      </button>
                      <button type="button" className="iphone-recent-card" onClick={() => openMode('inbox')}>
                        <div className="sandbox-thread-avatar">JG</div>
                        <div><strong>Jorge Garcia</strong><p>Estimate received — thank you.</p></div>
                        <span>18m</span>
                      </button>

                      <div className="iphone-ai-strip"><Sparkles size={14}/><span>AI helps write. You always press Send.</span></div>
                    </motion.div>
                  )}

                  {demoMode === 'inbox' && !threadOpen && (
                    <motion.div key="inbox-list" className="iphone-crm-scene" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}>
                      <div className="iphone-page-title"><div><small>COMMUNICATIONS</small><strong>Messages</strong></div><button type="button" aria-label="New message"><SquarePen size={17}/></button></div>
                      <div className="iphone-search"><Search size={13}/><span>Search conversations</span></div>
                      <div className="iphone-section-row compact"><span>RECENT</span></div>

                      <button type="button" className="iphone-conversation active" onClick={() => setThreadOpen(true)}>
                        <div className="sandbox-thread-avatar">MR</div>
                        <div className="iphone-conversation-copy"><div><strong>Maria Rodriguez</strong><time>2m</time></div><p>¿Pueden venir mañana?</p><small>Can you come tomorrow?</small></div>
                        <i />
                      </button>
                      <button type="button" className="iphone-conversation" onClick={() => setThreadOpen(true)}>
                        <div className="sandbox-thread-avatar">JG</div>
                        <div className="iphone-conversation-copy"><div><strong>Jorge Garcia</strong><time>18m</time></div><p>Estimate received — thank you.</p></div>
                      </button>
                      <button type="button" className="iphone-conversation" onClick={() => setThreadOpen(true)}>
                        <div className="sandbox-thread-avatar">AC</div>
                        <div className="iphone-conversation-copy"><div><strong>Anna Cole</strong><time>1h</time></div><p>Can I pay the deposit today?</p></div>
                      </button>
                    </motion.div>
                  )}

                  {demoMode === 'inbox' && threadOpen && (
                    <motion.div key="inbox-thread" className="iphone-crm-scene iphone-thread-scene" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.22 }}>
                      <div className="iphone-thread-head">
                        <button type="button" onClick={() => setThreadOpen(false)} aria-label="Back"><ArrowLeft size={18}/></button>
                        <div className="sandbox-thread-avatar">MR</div>
                        <div className="iphone-thread-name"><strong>Maria Rodriguez</strong><small>+1 615 555 0147</small></div>
                        <div className="iphone-thread-actions"><button type="button" onClick={() => openMode('money')} title="Invoice"><ReceiptText size={15}/></button><button type="button" title="Call"><Phone size={15}/></button><button type="button" title="Info"><Info size={15}/></button></div>
                      </div>

                      <div className="iphone-message-thread">
                        <div className="iphone-date-separator">Today 9:42 AM</div>
                        <div className="iphone-bubble incoming"><p>¿Pueden venir mañana?</p><small>Can you come tomorrow?</small></div>
                        <div className="iphone-bubble incoming"><p>Como a las 10 si pueden.</p><small>Around 10 if you can.</small></div>
                        {replySent && <div className="iphone-bubble outgoing"><p>Yes — 10 AM works for us.</p><small><CheckCheck size={11}/> Sent in Spanish</small></div>}
                      </div>

                      {!replySent && <div className="iphone-ai-draft">
                        <div className="iphone-ai-draft-head"><Sparkles size={13}/><strong>Suggested reply</strong></div>
                        <p>Yes — we can be there around 10 AM. Does that work for you?</p>
                        <div><button type="button" onClick={() => writingTool('reply')}>Use reply</button><span>AI drafts. You send.</span></div>
                      </div>}

                      <div className="iphone-writing-tools">
                        <button type="button" onClick={() => writingTool('grammar')}>Fix grammar</button>
                        <button type="button" onClick={() => writingTool('professional')}>Professional</button>
                        <button type="button" onClick={() => writingTool('shorten')}>Shorten</button>
                      </div>

                      <div className="iphone-composer">
                        <button type="button" className="iphone-plus" aria-label="Add"><CirclePlus size={20}/></button>
                        <div className="iphone-input">{demoDraft || 'Message Maria…'}</div>
                        <button type="button" className="iphone-send" onClick={sendDemo} aria-label="Send"><Send size={15}/></button>
                      </div>
                    </motion.div>
                  )}

                  {demoMode === 'customers' && (
                    <motion.div key="customers" className="iphone-crm-scene" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}>
                      <div className="iphone-page-title"><div><small>CRM</small><strong>Customers</strong></div><button type="button"><CirclePlus size={18}/></button></div>
                      <div className="iphone-search"><Search size={13}/><span>Search customers</span></div>
                      <div className="iphone-customer-summary"><div><strong>24</strong><span>Customers</span></div><div><strong>6</strong><span>New leads</span></div><div><strong>3</strong><span>Need reply</span></div></div>
                      {[
                        ['MR','Maria Rodriguez','New lead','Spanish'],
                        ['JG','Jorge Garcia','Estimate sent','English'],
                        ['AC','Anna Cole','Invoice open','English'],
                      ].map(([initials,name,status,lang]) => <button type="button" className="iphone-customer-row" key={name} onClick={() => { openMode('inbox'); setThreadOpen(true); }}><div className="sandbox-thread-avatar">{initials}</div><div><strong>{name}</strong><p>{status}</p><small>{lang}</small></div><ChevronRight size={14}/></button>)}
                    </motion.div>
                  )}

                  {demoMode === 'money' && (
                    <motion.div key="money" className="iphone-crm-scene" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}>
                      <div className="iphone-page-title"><div><small>FINANCE</small><strong>Money</strong></div><button type="button"><CirclePlus size={18}/></button></div>
                      <div className="iphone-money-stats"><div><span>Collected</span><strong>$8,420</strong></div><div><span>Outstanding</span><strong>$1,240</strong></div></div>
                      <button type="button" className="iphone-create-invoice"><ReceiptText size={17}/><div><strong>Create invoice</strong><span>Send a secure payment link by text</span></div><ChevronRight size={15}/></button>
                      <div className="iphone-section-row compact"><span>RECENT INVOICES</span></div>
                      <div className="iphone-invoice-row"><div><strong>Maria Rodriguez</strong><span>Driveway repair · #1048</span></div><div><b>$1,240</b><small>OPEN</small></div></div>
                      <div className="iphone-invoice-row"><div><strong>Jorge Garcia</strong><span>Block wall deposit · #1047</span></div><div><b>$850</b><small className="paid">PAID</small></div></div>
                      <div className="iphone-payment-note"><CheckCheck size={14}/><span>Stripe payment updates sync back to the customer automatically.</span></div>
                    </motion.div>
                  )}

                  {demoMode === 'settings' && (
                    <motion.div key="settings" className="iphone-crm-scene" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}>
                      <div className="iphone-page-title"><div><small>WORKSPACE</small><strong>Settings</strong></div></div>
                      <div className="iphone-settings-card"><span>BUSINESS</span><strong>Saint Masonry</strong><small>Construction · Central Time</small></div>
                      <div className="iphone-settings-row"><div><Phone size={15}/><span>Business number</span></div><strong>+1 615 555 0184</strong></div>
                      <div className="iphone-settings-row"><div><Languages size={15}/><span>Translation</span></div><strong>EN ↔ ES</strong></div>
                      <div className="iphone-settings-row"><div><Sparkles size={15}/><span>AI Writing Assist</span></div><span className="iphone-switch on"><i/></span></div>
                      <div className="iphone-settings-row"><div><WalletCards size={15}/><span>Payments</span></div><strong>Stripe connected</strong></div>
                      <p className="iphone-settings-foot">AI creates drafts and writing improvements. Messages are never sent until you press Send.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="sandbox-dock iphone-dock" aria-label="CRM preview navigation">
                  <button type="button" className={demoMode === 'home' ? 'active' : ''} onClick={() => openMode('home')}><HomeIcon size={15}/><span>Home</span></button>
                  <button type="button" className={demoMode === 'inbox' ? 'active' : ''} onClick={() => openMode('inbox')}><MessageCircle size={15}/><span>Inbox</span></button>
                  <button type="button" className={demoMode === 'customers' ? 'active' : ''} onClick={() => openMode('customers')}><Users size={15}/><span>Customers</span></button>
                  <button type="button" className={demoMode === 'money' ? 'active' : ''} onClick={() => openMode('money')}><WalletCards size={15}/><span>Money</span></button>
                  <button type="button" className={demoMode === 'settings' ? 'active' : ''} onClick={() => openMode('settings')}><Settings size={15}/><span>Settings</span></button>
                </div>
                <div className="sandbox-homebar" />
              </div>
            </motion.div>
            <div className="iphone-preview-label"><span /> INTERACTIVE PRODUCT PREVIEW</div>
          </motion.div>
        </section>

        <section className="informal-strip">
          <div><MessageCircle size={17}/><span>Text customers</span></div>
          <div><Sparkles size={17}/><span>AI reply drafts</span></div>
          <div><Languages size={17}/><span>Grammar + translation</span></div>
          <div><ReceiptText size={17}/><span>Send invoices</span></div>
        </section>

        <section className="flow-section">
          <motion.div {...reveal} className="flow-copy">
            <span className="one-kicker">HOW ONE WORKS</span>
            <h2>Everything connects behind the scenes.</h2>
            <p>Your number starts the relationship. ONE keeps the customer, conversation, AI writing help and payment connected.</p>
            <Link href="/features" className="flow-link">See everything ONE does <ArrowRight size={14}/></Link>
          </motion.div>

          <motion.div {...reveal} className="network-card">
            <div className="network-grid-bg" />
            <svg className="network-lines" viewBox="0 0 680 380" aria-hidden="true">
              <defs>
                <linearGradient id="oneLine" x1="0" x2="1">
                  <stop offset="0" stopColor="#4f7cff" stopOpacity=".45" />
                  <stop offset=".5" stopColor="#64c7ff" stopOpacity=".9" />
                  <stop offset="1" stopColor="#8b6cff" stopOpacity=".45" />
                </linearGradient>
              </defs>
              <path d="M120 95 H260 V190 H340" />
              <path d="M560 95 H420 V190 H340" />
              <path d="M120 285 H260 V190" />
              <path d="M560 285 H420 V190" />
            </svg>

            <div className="network-node network-center"><span>ONE</span><small>Customer OS</small></div>
            <div className="network-node network-number"><Phone size={17}/><b>Business number</b><small>Calls + texts</small></div>
            <div className="network-node network-customer"><Users size={17}/><b>Customer</b><small>CRM timeline</small></div>
            <div className="network-node network-money"><WalletCards size={17}/><b>Money</b><small>Invoice + pay link</small></div>
            <div className="network-node network-auto"><Sparkles size={17}/><b>AI Assist</b><small>Draft + grammar</small></div>
          </motion.div>
        </section>

        <section className="informal-links">
          <motion.div {...reveal} className="informal-links-head">
            <span className="one-kicker">KEEP IT SIMPLE</span>
            <h2>Open ONE. Handle business. Move on.</h2>
          </motion.div>

          <div className="informal-links-grid">
            <Link href="/features" className="informal-link-card">
              <MessageCircle size={20}/><h3>Talk to customers</h3><p>One number, one inbox, automatic translation.</p><span>Features <ArrowRight size={14}/></span>
            </Link>
            <Link href="/how-it-works" className="informal-link-card">
              <Users size={20}/><h3>Know what’s going on</h3><p>Leads, conversations and customer history stay together.</p><span>How it works <ArrowRight size={14}/></span>
            </Link>
            <Link href="/pricing" className="informal-link-card">
              <WalletCards size={20}/><h3>Get paid</h3><p>Create the invoice and text the secure payment link from the same workspace.</p><span>Pricing <ArrowRight size={14}/></span>
            </Link>
          </div>
        </section>

        <section className="one-final informal-final">
          <Smartphone size={24}/>
          <h2>Your number. Your customers. ONE.</h2>
          <p>Get set up and start talking to customers.</p>
          <Link href="/signup" className="one-btn one-btn-light">Start free <ArrowRight size={16}/></Link>
        </section>
      </main>

      <footer className="one-footer">
        <div className="one-logo">ONE<span>.</span></div>
        <p>One number. Every customer. Any language.</p>
        <small>© 2026 ONE. Telecom and financial services are provided by applicable third-party regulated providers.</small>
      </footer>
    </div>
  );
}
