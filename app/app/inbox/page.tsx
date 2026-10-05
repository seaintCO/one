'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCheck,
  CirclePlus,
  Info,
  Languages,
  Mic,
  Phone,
  ReceiptText,
  Search,
  Send,
  Sparkles,
  SquarePen,
  Wand2,
} from 'lucide-react';

type Contact = {
  id: string;
  name: string;
  phone: string;
  preferred_language?: string;
  lead_status?: string;
};

type Conversation = { id: string; contact_id: string };
type Message = {
  id: string;
  conversation_id?: string | null;
  direction: string;
  body: string;
  translated_body?: string | null;
  created_at?: string;
  status?: string;
};

type Bootstrap = {
  contacts: Contact[];
  conversations: Conversation[];
  messages: Message[];
  phoneNumber: string | null;
  business: any;
  demo?: boolean;
  capabilities?: { aiWriting?: boolean };
};

type AssistAction = 'reply' | 'grammar' | 'professional' | 'friendly' | 'shorten';

function initials(name: string) {
  return String(name || '?').split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function statusLabel(status?: string) {
  if (!status) return '';
  const normalized = status.replaceAll('_', ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function InboxPage() {
  const router = useRouter();
  const [data, setData] = useState<Bootstrap>({ contacts: [], conversations: [], messages: [], phoneNumber: null, business: null });
  const [selectedId, setSelectedId] = useState('');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [assistOpen, setAssistOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const suggestedForMessageRef = useRef('');

  async function load() {
    const res = await fetch('/api/crm/bootstrap', { cache: 'no-store' });
    const j = await res.json();
    if (!res.ok) {
      setNotice(j.error || 'Could not load inbox');
      return;
    }
    setData(j);
    if (!selectedId && j.contacts?.[0]?.id) setSelectedId(j.contacts[0].id);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    document.body.classList.toggle('message-thread-open', chatOpen);
    return () => document.body.classList.remove('message-thread-open');
  }, [chatOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [selectedId, data.messages]);

  const selected = useMemo(
    () => data.contacts.find((c) => c.id === selectedId) || data.contacts[0] || null,
    [data.contacts, selectedId],
  );

  const selectedConversation = useMemo(
    () => data.conversations.find((c) => c.contact_id === selected?.id) || null,
    [data.conversations, selected],
  );

  const messages = useMemo(
    () => (selectedConversation ? data.messages.filter((m) => m.conversation_id === selectedConversation.id) : []),
    [data.messages, selectedConversation],
  );

  const latestMessage = messages[messages.length - 1];
  const filtered = data.contacts.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase()));
  const segments = useMemo(() => Math.max(1, Math.ceil((text.length || 1) / 160)), [text]);

  async function requestAssist(action: AssistAction, automatic = false) {
    if (!selected || aiLoading) return;
    if (!data.capabilities?.aiWriting) {
      if (!automatic) setNotice('AI Writing Assist needs OPENAI_API_KEY in your environment.');
      return;
    }
    if (action !== 'reply' && !text.trim()) {
      setNotice('Write a message first, then use the writing tools.');
      return;
    }

    setAiLoading(true);
    if (!automatic) setAssistOpen(true);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, contactId: selected.id, draft: text }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'AI Writing Assist failed');
      if (action === 'reply') {
        setAiSuggestion(j.text || '');
        setAssistOpen(true);
      } else {
        setText(j.text || text);
        setAiSuggestion('');
        setNotice(action === 'grammar' ? 'Grammar and clarity updated. Review before sending.' : 'Message rewritten. Review before sending.');
      }
    } catch (e: any) {
      if (!automatic) setNotice(e.message || 'AI Writing Assist failed');
    } finally {
      setAiLoading(false);
    }
  }

  // When the customer sends the most recent message, prepare a reply draft automatically.
  // The draft is never sent until the human presses Send.
  useEffect(() => {
    if (!chatOpen || !selected || !data.capabilities?.aiWriting || !latestMessage || latestMessage.direction !== 'inbound') return;
    if (suggestedForMessageRef.current === latestMessage.id) return;
    suggestedForMessageRef.current = latestMessage.id;
    setAiSuggestion('');
    void requestAssist('reply', true);
    // selectedId/latestMessage.id are the meaningful trigger values here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, selectedId, latestMessage?.id, data.capabilities?.aiWriting]);

  async function send() {
    const body = text.trim();
    if (!body || !selected || !data.phoneNumber || sending) return;
    setSending(true);
    setNotice('');
    try {
      const res = await fetch('/api/telnyx/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: data.phoneNumber,
          to: selected.phone,
          text: body,
          conversationId: selectedConversation?.id || null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Message failed');
      setText('');
      setAiSuggestion('');
      setAssistOpen(false);
      await load();
      setNotice(j.translated ? 'Sent with automatic translation.' : 'Message sent.');
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setSending(false);
    }
  }

  function choose(contact: Contact) {
    setSelectedId(contact.id);
    setChatOpen(true);
    setNotice('');
    setInfoOpen(false);
    setAssistOpen(false);
    setAiSuggestion('');
  }

  function demoAction(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  return (
    <div className="message-page-shell">
      {notice && <div className="message-toast">{notice}</div>}

      <div className={`imessage-shell ${chatOpen ? 'chat-open' : ''}`}>
        <aside className="imessage-list">
          <div className="imessage-list-top">
            <div><small>COMMUNICATIONS</small><h1>Messages</h1></div>
            <button type="button" className="imessage-round-btn" onClick={() => router.push('/app/customers')} aria-label="New message"><SquarePen size={18} /></button>
          </div>

          <div className="imessage-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" /></div>
          <div className="imessage-section-title">Recent</div>

          <div className="imessage-conversation-list">
            {filtered.length ? filtered.map((contact) => {
              const convo = data.conversations.find((x) => x.contact_id === contact.id);
              const latest = [...data.messages].reverse().find((m) => m.conversation_id === convo?.id);
              const unread = latest?.direction === 'inbound';
              return (
                <button key={contact.id} type="button" className={`imessage-conversation ${selected?.id === contact.id ? 'active' : ''}`} onClick={() => choose(contact)}>
                  <div className="imessage-avatar">{initials(contact.name)}</div>
                  <div className="imessage-conversation-copy">
                    <div className="imessage-conversation-name"><strong>{contact.name}</strong><span>{formatTime(latest?.created_at)}</span></div>
                    <div className="imessage-conversation-preview"><span>{latest?.body || contact.lead_status || 'Customer'}</span>{unread && <i />}</div>
                  </div>
                </button>
              );
            }) : <div className="imessage-empty">No conversations yet.</div>}
          </div>
        </aside>

        <main className="imessage-thread">
          {selected ? <>
            <header className="imessage-thread-head">
              <div className="imessage-thread-contact">
                <button type="button" className="imessage-back" onClick={() => setChatOpen(false)} aria-label="Back"><ArrowLeft size={20} /></button>
                <div className="imessage-avatar small">{initials(selected.name)}</div>
                <div><strong>{selected.name}</strong><small>{selected.phone}</small></div>
              </div>
              <div className="imessage-head-actions">
                <button type="button" className="imessage-round-btn" onClick={() => router.push(`/app/money?new=invoice&customer=${encodeURIComponent(selected.id)}`)} aria-label="Create invoice"><ReceiptText size={18} /></button>
                <button type="button" className="imessage-round-btn" onClick={() => demoAction('Calling is not enabled in the production launch scope yet.')} aria-label="Call"><Phone size={18} /></button>
                <button type="button" className="imessage-round-btn" onClick={() => setInfoOpen((v) => !v)} aria-label="Contact info"><Info size={18} /></button>
              </div>
            </header>

            {infoOpen && <div className="imessage-info-strip"><div><Languages size={15} /><span>Automatic translation on</span></div><strong>{selected.preferred_language || 'English'}</strong></div>}

            <div className="imessage-thread-body" ref={bodyRef}>
              <div className="imessage-day">Today</div>
              {messages.length ? messages.map((message) => {
                const outgoing = message.direction === 'outbound';
                return (
                  <div key={message.id} className={`imessage-message-row ${outgoing ? 'outgoing' : 'incoming'}`}>
                    <div className={`imessage-bubble ${outgoing ? 'out' : 'in'}`}>
                      <div>{message.body}</div>
                      {message.translated_body && <small className="imessage-translation">{message.translated_body}</small>}
                    </div>
                    <div className="imessage-meta">
                      {formatTime(message.created_at)}
                      {outgoing && message.status && <span><CheckCheck size={12} /> {statusLabel(message.status)}</span>}
                    </div>
                  </div>
                );
              }) : <div className="imessage-empty-thread"><div className="imessage-avatar hero">{initials(selected.name)}</div><strong>{selected.name}</strong><span>{selected.phone}</span><p>Send the first message below.</p></div>}
            </div>

            <div className="imessage-composer-wrap">
              <div className="one-ai-toolbar">
                <button type="button" className={`one-ai-main ${assistOpen ? 'active' : ''}`} onClick={() => setAssistOpen((v) => !v)}><Sparkles size={14} /> AI Assist</button>
                <button type="button" onClick={() => requestAssist('grammar')} disabled={aiLoading || !text.trim()}>Fix grammar</button>
                <button type="button" onClick={() => requestAssist('professional')} disabled={aiLoading || !text.trim()}>Professional</button>
                <button type="button" onClick={() => requestAssist('shorten')} disabled={aiLoading || !text.trim()}>Shorten</button>
              </div>

              {assistOpen && <div className="one-ai-card">
                <div className="one-ai-card-head"><span><Wand2 size={14} /> ONE Writing Assist</span><small>AI drafts. You press Send.</small></div>
                {aiLoading ? <div className="one-ai-loading"><Sparkles size={14} /> Writing a suggestion…</div> : aiSuggestion ? <>
                  <p>{aiSuggestion}</p>
                  <div className="one-ai-actions">
                    <button type="button" onClick={() => { setText(aiSuggestion); setAiSuggestion(''); }}>Use reply</button>
                    <button type="button" onClick={() => requestAssist('reply')}>Try another</button>
                  </div>
                </> : <div className="one-ai-empty">
                  {data.capabilities?.aiWriting ? 'Choose Suggest reply or use the writing tools on your draft.' : 'Add OPENAI_API_KEY to enable AI reply suggestions and writing help.'}
                  {data.capabilities?.aiWriting && <button type="button" onClick={() => requestAssist('reply')}>Suggest reply</button>}
                </div>}
              </div>}

              <div className="imessage-translation-note"><Languages size={13} /> Messages translate automatically to {selected.preferred_language || 'the customer language'}</div>
              <div className="imessage-composer">
                <button type="button" className="imessage-composer-action" onClick={() => demoAction('MMS attachments are not enabled in the launch scope yet.')} aria-label="Attach"><CirclePlus size={21} /></button>
                <textarea
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Message"
                />
                {text.trim() ? <button type="button" disabled={sending || !data.phoneNumber} onClick={send} className="imessage-send-btn" aria-label="Send"><Send size={16} /></button> : <button type="button" className="imessage-composer-action" onClick={() => demoAction('Voice notes are not enabled in the launch scope yet.')} aria-label="Voice note"><Mic size={20} /></button>}
              </div>
              <div className="imessage-segment-meta">{text.length} characters · {segments} SMS segment{segments !== 1 ? 's' : ''}{segments > 2 ? ' · Consider shortening' : ''}</div>
            </div>
          </> : <div className="imessage-empty-thread centered"><MessageCircleIcon /><strong>Add a customer to start messaging.</strong></div>}
        </main>
      </div>
    </div>
  );
}

function MessageCircleIcon() {
  return <div className="imessage-empty-icon"><Search size={18} /></div>;
}
