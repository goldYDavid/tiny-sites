// חיבור לשרת. כל עוד SUPABASE_URL ריק — מצב מקומי: התוכן נשמר בדפדפן בלבד (לבדיקה)
window.SUPABASE_URL = 'https://feshcsgtkfftmehbslyh.supabase.co';  // פרויקט הסנדוויצים, סכמה נפרדת tiny (sites, businesses, leads)
window.SUPABASE_KEY = 'sb_publishable_2AoPK8NRTUGnEiKLX82Rcg__3OSZPJa';   // מפתח ציבורי (publishable) בלבד
window.SITE_SLUG = 'demo';
window.VAPID_PUBLIC = 'BB8pSlE8nOYBqwQhKCoRA1gVqozMJPAe2y10lkwDSz-d-oFlJgs9OHBmoHtDKTgsslqswWiv52880X82XXLEFM4';  // התראות בטלפון — מפתח ציבורי (הפרטי בכספת של השרת)
window.SALES_PHONE = '972584433453';  // וואטסאפ שלנו — בעל עסק שהגיע למכסת הדפים פונה לכאן לשדרוג חבילה
// איך הלקוח משלם לבעל העסק (settings.pay.method) — הכסף הולך ישר לבעל העסק, לא דרכנו
// בעל העסק יכול לסמן כמה אפשרויות יחד: settings.pay.ways = { bit: {phone, link?}, paybox: {link}, link: {link}, bank: {details}, cash: {} }
window.PAY_WAYS = { bit: 'ביט', paybox: 'פייבוקס', link: 'כרטיס אשראי (קישור תשלום)', bank: 'העברה בנקאית', cash: 'מזומן' };
// הגדרה ישנה (method אחד) ← ways
window.payWays = p => { p = p || {}; if (p.ways) return p.ways; if (!p.method || p.method === 'none') return {};
  return { [p.method]: { ...(p.link && { link: p.link }), ...(p.phone && { phone: p.phone }) } }; };
if (new URLSearchParams(location.search).has('local')) window.SUPABASE_URL = '';  // ?local — בדיקה בלי שרת

// דף = הגדרות העסק (שם, טלפון, צבע...) + תוכן הדף. בקשה אחת לשרת.
// לא חודש: 14 יום אחרי תאריך החידוש הדף מוצג כ"בהשהיה" ({ paused: true })
const GRACE_DAYS = 14;
window.loadSite = async slug => {
  if (!window.SUPABASE_URL) { const l = localStorage.getItem('draft:' + slug); return l ? { ...JSON.parse(localStorage.getItem('biz') || '{}'), ...JSON.parse(l) } : null; }
  // בעל העסק מחובר ← רואה גם את הטיוטה שלו (השרת מחזיר לגולשים רק דפים מפורסמים)
  let tok = null; try { tok = JSON.parse(localStorage.getItem('tiny-auth')).access_token; } catch {}
  const get = t => fetch(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}&select=content,businesses(settings,renews_at)`, { headers: { apikey: SUPABASE_KEY, 'Accept-Profile': 'tiny', ...(t && { Authorization: 'Bearer ' + t }) } });
  let r = await get(tok); if (r.status === 401 && tok) r = await get(null);
  const [row] = await r.json(); if (!row || !row.content.sections) return null;
  const b = row.businesses || {};
  if (!b.renews_at) return { ...b.settings, ...row.content, draft: true };
  if (b.renews_at && new Date(b.renews_at).getTime() + GRACE_DAYS * 864e5 < Date.now()) return { paused: true, name: (b.settings || {}).name };
  return { ...b.settings, ...row.content };
};

// פנייה/הזמנה מהדף הציבורי ← רשימת הפניות בניהול. keepalive: נשלח גם כשהגולש עובר לוואטסאפ.
window.sendLead = (slug, kind, data) => {
  if (!window.SUPABASE_URL) { const l = JSON.parse(localStorage.getItem('leads') || '[]'); l.unshift({ id: Date.now(), slug, kind, data, status: 'new', created_at: new Date().toISOString() }); return Promise.resolve(localStorage.setItem('leads', JSON.stringify(l))); }
  const r = fetch(`${SUPABASE_URL}/rest/v1/leads`, { method: 'POST', keepalive: true, headers: { apikey: SUPABASE_KEY, 'Content-Profile': 'tiny', 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ slug, kind, data }) })
    .then(r => { if (!r.ok) throw new Error(r.status);
      // התראה לבעל העסק (טלפון + מייל) — אחרי שהפנייה נשמרה, ברקע (keepalive: ממשיך גם כשהגולש עבר לוואטסאפ)
      fetch(`${SUPABASE_URL}/functions/v1/tiny-notify`, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) }).catch(() => {}); });
  return r;
};

// ===== צבעים: בעל העסק בוחר צבע ראשי; הצבע המשני נגזר אוטומטית לפי כללי הרמוניה מגלגל הצבעים =====
// settings.accent = הצבע הראשי, settings.harmony = הכלל (ברירת מחדל: analog)
window.HARMONIES = { analog: ['הרמוני', 'צבע שכן בגלגל הצבעים — רגוע ונעים', -30], split: ['משלים מפוצל', 'קרוב לצבע הנגדי (150°) — בולט אבל מאוזן', 150],
  comp: ['משלים', 'הצבע הנגדי בגלגל (180°) — הכי בולט', 180], triad: ['משולש', 'שליש סיבוב בגלגל (120°) — צבעוני ושמח', 120], mono: ['גוון אחד', 'אותו צבע, כהה יותר — שקט ומקצועי', 0] };
// ערכות מוכנות: צבע ראשי + כלל
window.PALETTES = [['טרקוטה', '#c8741a', 'analog'], ['אדום יין', '#9b2c3a', 'split'], ['ירוק יער', '#1f7a5a', 'analog'], ['כחול ים', '#1d5fa8', 'split'],
  ['סגול', '#6b3fa0', 'triad'], ['טורקיז', '#0f7c8c', 'comp'], ['חום עץ', '#8a5a2b', 'mono'], ['פחם', '#2f3640', 'split']];
(() => {
  const hex2hsl = h => { const n = parseInt(String(h || '#c8741a').replace('#', '').padEnd(6, '0').slice(0, 6), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let hh = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; }
    return [hh, s, l]; };
  const hsl2hex = (h, s, l) => { const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); };
    return '#' + f(0) + f(8) + f(4); };
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0); };
  const contrast = hex => 1.05 / (lum(hex) + .05);  // מול טקסט לבן
  // מכהה עד שטקסט לבן קריא (WCAG לטקסט מודגש: 3:1)
  const readable = (h, s, l) => { let x = hsl2hex(h, s, l); while (contrast(x) < 3 && l > .05) { l -= .02; x = hsl2hex(h, s, l); } return x; };
  window.palette = (accent, harmony) => { const [h, s, l] = hex2hsl(accent), H = HARMONIES[harmony] ? harmony : 'analog', rot = HARMONIES[H][2];
    const main = readable(h, s, l), [mh, ms, ml] = hex2hsl(main);
    const second = H === 'mono' ? readable(h, Math.min(1, s * .9), Math.max(.12, ml - .14)) : readable((h + rot + 360) % 360, Math.max(.35, Math.min(.85, s)), Math.min(.5, Math.max(.32, ml)));
    return { accent: main, accent2: second, adjusted: main.toLowerCase() !== String(accent || '').toLowerCase() }; };
  window.applyColors = site => { const p = palette(site.accent || '#c8741a', site.harmony), r = document.documentElement.style;
    r.setProperty('--accent', p.accent); r.setProperty('--accent2', p.accent2); return p; };
})();
