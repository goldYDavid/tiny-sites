// בדיקה יומית: האתר והשרת עונים + תזכורות חידוש. נכשל (← GitHub שולח מייל) רק כשיש תקלה או חידוש קרוב.
const BASE = 'https://goldydavid.github.io/tiny-sites/';
const cfg = await (await fetch(BASE + 'config.js')).text(), url = cfg.match(/SUPABASE_URL = '([^']+)'/)[1], key = cfg.match(/SUPABASE_KEY = '([^']+)'/)[1];
const out = [];
for (const f of ['index.html', 'admin.html', 'legal.html', 'render.js', 'p/test.html']) { const r = await fetch(BASE + f).catch(() => ({ status: 0 })); if (r.status !== 200) out.push(`❌ האתר: ${f} החזיר ${r.status}`); }
const rows = await (await fetch(`${url}/rest/v1/businesses?select=renews_at,settings,sites(slug)`, { headers: { apikey: key, 'Accept-Profile': 'tiny' } })).json().catch(() => null);
if (!Array.isArray(rows)) out.push('❌ השרת (Supabase) לא החזיר את רשימת העסקים');
else for (const b of rows) {
  if (!b.renews_at || !b.sites?.length) continue;
  const days = Math.round((Date.parse(b.renews_at) - Date.now()) / 864e5), who = `${b.settings?.name || '?'} (${b.sites.map(s => s.slug).join(', ')}, ${b.settings?.phone || 'אין טלפון'})`;
  if (days === 30 || days === 7) out.push(`🔔 חידוש בעוד ${days} ימים: ${who}`);
  if (days === 0) out.push(`🔔 היום תאריך החידוש: ${who}`);
  if (days === -14) out.push(`⏸️ הדף עבר להשהיה היום (לא חודש): ${who}`);
}
console.log(out.length ? out.join('\n') : '✓ הכול תקין, אין חידושים היום');
if (out.length) { console.log(`::error::${out.join(' | ')}`); process.exit(1); }
