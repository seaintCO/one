const OPENAI_API = 'https://api.openai.com/v1/responses';

export type WritingAction = 'reply' | 'grammar' | 'professional' | 'friendly' | 'shorten';

type WritingInput = {
  action: WritingAction;
  businessName: string;
  businessLanguage: string;
  contactName: string;
  contactLanguage?: string | null;
  draft?: string;
  conversation?: Array<{ direction: string; body: string; translated_body?: string | null }>;
};

function extractOutputText(json: any) {
  if (typeof json?.output_text === 'string' && json.output_text.trim()) return json.output_text.trim();
  for (const item of json?.output || []) {
    for (const content of item?.content || []) {
      if ((content?.type === 'output_text' || content?.type === 'text') && typeof content?.text === 'string' && content.text.trim()) {
        return content.text.trim();
      }
    }
  }
  return '';
}

function buildPrompt(input: WritingInput) {
  const history = (input.conversation || [])
    .slice(-12)
    .map((m) => `${m.direction === 'outbound' ? 'Business' : 'Customer'}: ${m.translated_body || m.body}`)
    .join('\n');

  const language = input.businessLanguage || 'English';
  const common = `Business: ${input.businessName}\nCustomer: ${input.contactName}\nBusiness writing language: ${language}\nCustomer preferred language: ${input.contactLanguage || 'unknown'}`;

  if (input.action === 'reply') {
    return `${common}\n\nRecent conversation:\n${history || '(no history)'}\n\nDraft ONE concise, natural reply the business owner can review and manually send. Write in ${language}. Do not invent prices, availability, promises, appointments, policies, or facts not present in the conversation. If the customer asks for information that is missing, ask one short clarifying question. Return only the reply text.`;
  }

  const draft = String(input.draft || '').trim();
  if (input.action === 'grammar') {
    return `${common}\n\nText:\n${draft}\n\nCorrect grammar, spelling, punctuation, and clarity while preserving the exact meaning, facts, names, numbers, and language. Do not add new information. Return only the corrected text.`;
  }
  if (input.action === 'professional') {
    return `${common}\n\nText:\n${draft}\n\nRewrite this to sound polished, professional, warm, and concise. Preserve all facts and the original language. Do not add commitments or details. Return only the rewritten text.`;
  }
  if (input.action === 'friendly') {
    return `${common}\n\nText:\n${draft}\n\nRewrite this to sound friendly, natural, and helpful without becoming overly casual. Preserve all facts and the original language. Return only the rewritten text.`;
  }
  return `${common}\n\nText:\n${draft}\n\nShorten this message while preserving the important meaning, facts, names, dates, prices, and requested action. Keep the original language. Return only the shortened text.`;
}

export async function runWritingAssist(input: WritingInput) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured');

  const model = process.env.OPENAI_MODEL || 'gpt-6-luna';
  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions: 'You are ONE Writing Assist, an embedded writing helper for small-business customer conversations. The human business owner is always responsible for reviewing and pressing Send. Never claim that a message was sent.',
      input: buildPrompt(input),
      max_output_tokens: 220,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI writing assist failed (${res.status}): ${detail.slice(0, 400)}`);
  }

  const json = await res.json();
  const text = extractOutputText(json);
  if (!text) throw new Error('OpenAI returned an empty writing suggestion');
  return { text, model };
}
