// חיבור לשרת. כל עוד SUPABASE_URL ריק — מצב מקומי: התוכן נשמר בדפדפן בלבד (לבדיקה)
window.SUPABASE_URL = 'https://feshcsgtkfftmehbslyh.supabase.co';  // פרויקט הסנדוויצים, סכמה נפרדת tiny (sites, businesses, leads)
window.SUPABASE_KEY = 'sb_publishable_2AoPK8NRTUGnEiKLX82Rcg__3OSZPJa';   // מפתח ציבורי (publishable) בלבד
window.SITE_SLUG = 'demo';
window.SALES_PHONE = '972584433453';  // וואטסאפ שלנו — בעל עסק שהגיע למכסת הדפים פונה לכאן לשדרוג חבילה
if (new URLSearchParams(location.search).has('local')) window.SUPABASE_URL = '';  // ?local — בדיקה בלי שרת

// דף = הגדרות העסק (שם, טלפון, צבע...) + תוכן הדף. בקשה אחת לשרת.
window.loadSite = async slug => {
  if (!window.SUPABASE_URL) { const l = localStorage.getItem('draft:' + slug); return l ? { ...JSON.parse(localStorage.getItem('biz') || '{}'), ...JSON.parse(l) } : null; }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}&select=content,businesses(settings)`, { headers: { apikey: SUPABASE_KEY, 'Accept-Profile': 'tiny' } });
  const [row] = await r.json(); return row && row.content.sections ? { ...(row.businesses || {}).settings, ...row.content } : null;
};

// פנייה/הזמנה מהדף הציבורי ← רשימת הפניות בניהול. keepalive: נשלח גם כשהגולש עובר לוואטסאפ.
window.sendLead = (slug, kind, data) => {
  if (!window.SUPABASE_URL) { const l = JSON.parse(localStorage.getItem('leads') || '[]'); l.unshift({ id: Date.now(), slug, kind, data, status: 'new', created_at: new Date().toISOString() }); return Promise.resolve(localStorage.setItem('leads', JSON.stringify(l))); }
  return fetch(`${SUPABASE_URL}/rest/v1/leads`, { method: 'POST', keepalive: true, headers: { apikey: SUPABASE_KEY, 'Content-Profile': 'tiny', 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ slug, kind, data }) })
    .then(r => { if (!r.ok) throw new Error(r.status); });
};
