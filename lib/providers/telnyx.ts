const API = 'https://api.telnyx.com/v2';

function headers() {
  const key = process.env.TELNYX_API_KEY;
  if (!key) throw new Error('TELNYX_API_KEY is not configured');
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

export async function searchNumbers(areaCode: string) {
  const params = new URLSearchParams({
    'filter[country_code]': 'US',
    'filter[national_destination_code]': areaCode,
    'filter[limit]': '12',
    'filter[best_effort]': 'true',
  });
  const res = await fetch(`${API}/available_phone_numbers?${params.toString()}`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) throw new Error(`Telnyx number search failed: ${await res.text()}`);
  const json = await res.json();
  return (json.data || []).map((n: any) => ({
    phoneNumber: n.phone_number,
    locality: n.region_information?.find((x: any) => x.region_type === 'city')?.region_name || '',
  }));
}

export async function provisionNumber(phoneNumber: string) {
  const body: Record<string, any> = { phone_numbers: [{ phone_number: phoneNumber }] };
  if (process.env.TELNYX_MESSAGING_PROFILE_ID) body.messaging_profile_id = process.env.TELNYX_MESSAGING_PROFILE_ID;
  if (process.env.TELNYX_CONNECTION_ID) body.connection_id = process.env.TELNYX_CONNECTION_ID;
  const res = await fetch(`${API}/number_orders`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Telnyx provisioning failed: ${await res.text()}`);
  return res.json();
}

export async function sendSms(from: string, to: string, text: string) {
  const payload: Record<string, any> = { from, to, text, type: 'SMS' };
  if (process.env.TELNYX_MESSAGING_PROFILE_ID) payload.messaging_profile_id = process.env.TELNYX_MESSAGING_PROFILE_ID;
  const res = await fetch(`${API}/messages`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Telnyx SMS failed: ${await res.text()}`);
  return res.json();
}
