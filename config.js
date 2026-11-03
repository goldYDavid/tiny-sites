// חיבור לשרת. כל עוד SUPABASE_URL ריק — מצב מקומי: התוכן נשמר בדפדפן בלבד (לבדיקה)
window.SUPABASE_URL = 'https://feshcsgtkfftmehbslyh.supabase.co';  // פרויקט הסנדוויצים, סכמה נפרדת tiny (sites, businesses, leads)
window.SUPABASE_KEY = 'sb_publishable_2AoPK8NRTUGnEiKLX82Rcg__3OSZPJa';   // מפתח ציבורי (publishable) בלבד
window.SITE_SLUG = 'demo';
window.VAPID_PUBLIC = 'BB8pSlE8nOYBqwQhKCoRA1gVqozMJPAe2y10lkwDSz-d-oFlJgs9OHBmoHtDKTgsslqswWiv52880X82XXLEFM4';  // התראות בטלפון — מפתח ציבורי (הפרטי בכספת של השרת)
window.SALES_PHONE = '972584433453';  // וואטסאפ שלנו — בעל עסק שהגיע למכסת הדפים פונה לכאן לשדרוג חבילה
// איך הלקוח משלם לבעל העסק (settings.pay.method) — הכסף הולך ישר לבעל העסק, לא דרכנו
window.PAY_WAYS = { none: 'בלי סליקה — רק הודעה מוכנה', bit: 'ביט', paybox: 'פייבוקס', link: 'קישור תשלום אחר' };
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
