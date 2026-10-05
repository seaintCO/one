export async function translateText(text: string, targetLanguage: string) {
  if (!text.trim()) return { translatedText: '', provider: 'none' };

  if (process.env.DEEPL_API_KEY) {
    const body = new URLSearchParams({ text, target_lang: targetLanguage.toUpperCase().startsWith('ES') ? 'ES' : 'EN' });
    const endpoint = process.env.DEEPL_API_KEY.endsWith(':fx') ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';
    const res = await fetch(endpoint, { method: 'POST', headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!res.ok) throw new Error(`DeepL translation failed: ${await res.text()}`);
    const json = await res.json();
    return { translatedText: json.translations?.[0]?.text || text, provider: 'deepl' };
  }

  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target: targetLanguage.toLowerCase().startsWith('es') ? 'es' : 'en', format: 'text' }),
    });
    if (!res.ok) throw new Error(`Google translation failed: ${await res.text()}`);
    const json = await res.json();
    return { translatedText: json.data?.translations?.[0]?.translatedText || text, provider: 'google' };
  }

  const demoMap: Record<string, string> = {
    'Can you come tomorrow?': '¿Puedes venir mañana?',
    'Yes, we can be there around 10 AM.': 'Sí, podemos estar allí alrededor de las 10 AM.',
  };
  return { translatedText: demoMap[text] || text, provider: 'demo' };
}
