// חיבור לשרת. כל עוד SUPABASE_URL ריק — מצב מקומי: התוכן נשמר בדפדפן בלבד (לבדיקה)
window.SUPABASE_URL = 'https://feshcsgtkfftmehbslyh.supabase.co';  // פרויקט הסנדוויצים, טבלה נפרדת tiny_sites
window.SUPABASE_KEY = 'sb_publishable_2AoPK8NRTUGnEiKLX82Rcg__3OSZPJa';   // מפתח ציבורי (publishable) בלבד
window.SITE_SLUG = 'demo';

window.loadSite = async slug => {
  if (!window.SUPABASE_URL) { const l = localStorage.getItem('draft:' + slug); return l ? JSON.parse(l) : null; }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/tiny_sites?slug=eq.${encodeURIComponent(slug)}&select=content`, { headers: { apikey: SUPABASE_KEY } });
  const [row] = await r.json(); return row && row.content.sections ? row.content : null;
};
