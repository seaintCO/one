import nacl from 'tweetnacl';

export function normalizePhone(input: string) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (raw.startsWith('+')) return '+' + raw.slice(1).replace(/\D/g, '');
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits ? `+${digits}` : '';
}

function decodeKey(value: string) {
  const trimmed = value.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return Buffer.from(trimmed, 'hex');
  return Buffer.from(trimmed, 'base64');
}

export function verifyTelnyxWebhook(rawBody: string, signature: string | null, timestamp: string | null) {
  const publicKey = process.env.TELNYX_PUBLIC_KEY;
  if (!publicKey || !signature || !timestamp) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;
  try {
    const message = Buffer.from(`${timestamp}|${rawBody}`);
    const sig = Buffer.from(signature, 'base64');
    const key = decodeKey(publicKey);
    if (sig.length !== nacl.sign.signatureLength || key.length !== nacl.sign.publicKeyLength) return false;
    return nacl.sign.detached.verify(new Uint8Array(message), new Uint8Array(sig), new Uint8Array(key));
  } catch {
    return false;
  }
}

export function productionMode() {
  return process.env.DEMO_MODE !== 'true';
}
