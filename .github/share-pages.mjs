// תצוגה מקדימה בוואטסאפ לכל דף עסק: אתר/p/<slug>.html (עותק של index.html עם תגיות og קבועות) + אתר/p/<slug>.jpg (1200×630).
// וואטסאפ לא מריץ JS, לכן השם והתמונה חייבים להיות כתובים בקובץ. רץ אוטומטית כל שעה (.github/workflows/share-pages.yml).
// ידני: שרת מקומי על 8765 בתיקיית האתר, ואז node .github/share-pages.mjs ו-git push.
import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
// בשרת של GitHub: playwright מ-npm. במחשב: מהתיקייה של פרויקט הפעמונים
const { chromium } = await import(process.env.PLAYWRIGHT || 'file:///C:/Users/tty25/Desktop/codex%20projects/%D7%94%D7%96%D7%A0%D7%AA%20%D7%A0%D7%AA%D7%95%D7%A0%D7%99%D7%9D%20%D7%9C%D7%A4%D7%A2%D7%9E%D7%95%D7%A0%D7%99%D7%9D/node_modules/playwright/index.mjs');
const root = fileURLToPath(new URL('..', import.meta.url)).split('\\').join('/'), BASE = 'https://goldydavid.github.io/tiny-sites/';
const cfg = fs.readFileSync(root + 'config.js', 'utf8'), url = cfg.match(/SUPABASE_URL = '([^']+)'/)[1], key = cfg.match(/SUPABASE_KEY = '([^']+)'/)[1];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const rows = await (await fetch(`${url}/rest/v1/sites?select=slug,updated_at,content,businesses(settings)`, { headers: { apikey: key, 'Accept-Profile': 'tiny' } })).json();
const index = fs.readFileSync(root + 'index.html', 'utf8');
fs.mkdirSync(root + 'p', { recursive: true });
const b = await chromium.launch(), phone = await b.newPage({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2 }), card = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const r of rows) {
  const s = { ...(r.businesses || {}).settings, ...r.content }, accent = s.accent || '#c8741a', v = Date.parse(r.updated_at) / 1000 | 0;
  const title = s.tagline ? `${s.name} — ${s.tagline}` : s.name, desc = s.cta || 'הזמנה ופרטים בוואטסאפ';
  await phone.goto(`http://localhost:8765/?s=${r.slug}`, { waitUntil: 'networkidle' });
  const shot = (await phone.screenshot({ type: 'jpeg', quality: 85 })).toString('base64');
  await card.setContent(`<html dir="rtl"><body style="margin:0;width:1200px;height:630px;display:flex;align-items:center;gap:56px;padding:0 70px;box-sizing:border-box;background:linear-gradient(135deg,#fff,color-mix(in srgb,${accent} 22%,#fff));font-family:'Segoe UI',Arial,sans-serif;color:#222">
    <div style="flex:1">${s.logo_img ? `<img src="${esc(s.logo_img)}" style="width:120px;height:120px;object-fit:contain;background:#fff;border-radius:24px;padding:10px">` : `<div style="font-size:96px;line-height:1">${esc(s.logo)}</div>`}<div style="font-size:64px;font-weight:800;line-height:1.15;margin-top:18px">${esc(s.name)}</div>
    <div style="font-size:34px;margin:18px 0 32px;line-height:1.4;color:#444">${esc(s.tagline)}</div>
    <div style="display:inline-block;background:${accent};color:#fff;font-size:34px;font-weight:800;padding:12px 30px;border-radius:40px">${esc(s.cta || 'הזמנה בוואטסאפ')}</div></div>
    <img src="data:image/jpeg;base64,${shot}" style="width:290px;height:565px;object-fit:cover;object-position:top;border:10px solid #222;border-radius:38px;box-shadow:0 20px 50px #0004"></body></html>`);
  await card.screenshot({ path: `${root}p/${r.slug}.jpg`, type: 'jpeg', quality: 82 });
  const og = `<base href="../"><script>window.PAGE_SLUG = ${JSON.stringify(r.slug)}</script>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:locale" content="he_IL">
<meta property="og:url" content="${BASE}p/${r.slug}.html"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${BASE}p/${r.slug}.jpg?v=${v}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">`;
  fs.writeFileSync(`${root}p/${r.slug}.html`, index.replace('<title>טוען…</title>', `<title>${esc(title)}</title>\n${og}`));
  console.log('✓', r.slug, '—', title);
}
const live = new Set(rows.map(r => r.slug));  // דף שנמחק ← מוחקים גם את הקבצים שלו
for (const f of fs.readdirSync(root + 'p')) if (!live.has(f.replace(/\.(html|jpg)$/, ''))) { fs.unlinkSync(root + 'p/' + f); console.log('נמחק', f); }
await b.close();
