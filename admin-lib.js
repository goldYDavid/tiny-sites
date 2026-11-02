// משותף לניהול (admin.html) ולעורך הדף (edit.html): כניסה במייל + גישה לנתונים.
// במצב מקומי (?local) הכול נשמר בדפדפן — לבדיקה בלי שרת.
const $ = id => document.getElementById(id);
// הודעה צפה בתחתית המסך — נראית גם כשגוללים למטה בטלפון. שגיאה (❌/⚠️) נשארת יותר זמן
const msg = t => { let m = $('toast');
  if (!m) { m = Object.assign(document.createElement('div'), { id: 'toast', role: 'status' }); m.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;max-width:480px;margin:auto;z-index:99;background:#222;color:#fff;font:700 15px/1.4 system-ui,Arial,sans-serif;text-align:center;padding:12px 14px;border-radius:12px;box-shadow:0 6px 20px #0005;transition:opacity .2s'; document.body.append(m); }
  m.textContent = t; m.style.opacity = 1; m.style.background = /^(❌|⚠️)/.test(t) ? '#b42318' : '#222';
  clearTimeout(m.t); m.t = setTimeout(() => m.style.opacity = 0, /^(❌|⚠️)/.test(t) ? 6000 : 3000); };
// שדה שלא מולא נכון: מסגרת אדומה, מעבר לשדה והסבר מה לתקן
const bad = (id, t) => { const el = $(id); if (el) { el.style.borderColor = '#b42318'; el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.addEventListener('input', () => el.style.borderColor = '', { once: true }); } msg('⚠️ ' + t); return false; };
const isMail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => localStorage.setItem(k, JSON.stringify(v)) };
let sb = null, UID = null;

// מחזיר true כשמחוברים; אחרת מציג מסך כניסה ב-#app ומחזיר false
async function connect() {
  if (!window.SUPABASE_URL) return true;
  await new Promise(r => { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'; sc.onload = r; document.head.append(sc); });
  // storageKey נפרד: באותו דומיין רצה גם אפליקציית הסנדוויצים (אותו שרת) — בלי זה החיבור שלה נכנס גם לכאן
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'tiny' }, auth: { storageKey: 'tiny-auth' } });
  const { data: { session } } = await sb.auth.getSession();
  if (session) { UID = session.user.id; return true; }
  $('app').innerHTML = `<h1>כניסה לניהול</h1><div class="card"><label>המייל שלך</label><input id="em" type="email" inputmode="email">
    <div class="tools"><button class="primary" id="send">שליחת מייל כניסה</button></div><div id="step2" hidden>
    <p class="muted">במייל יש קישור "Sign in". לחיצה ארוכה עליו ← העתקת קישור ← הדבקה כאן.</p>
    <label>הקישור (או הקוד) מהמייל</label><input id="code" dir="ltr">
    <div class="tools"><button class="primary" id="ok">כניסה</button></div></div><div id="msg"></div></div>`;
  $('send').onclick = async () => { if (!isMail($('em').value.trim())) return bad('em', $('em').value.trim() ? 'המייל לא תקין — בדקו שיש @ ונקודה' : 'צריך למלא את המייל');
    const { error } = await sb.auth.signInWithOtp({ email: $('em').value.trim(), options: { shouldCreateUser: false, emailRedirectTo: location.href } });
    error ? msg('❌ ' + (/rate|seconds/i.test(error.message) ? 'נשלחו יותר מדי מיילים — נסו שוב בעוד כמה דקות' : /signup|not found/i.test(error.message) ? 'המייל הזה לא רשום כבעל אתר' : /fetch|network/i.test(error.message) ? 'אין חיבור לאינטרנט — נסו שוב' : 'שגיאה: ' + error.message))
          : ($('step2').hidden = false, msg('✓ נשלח מייל — בדקו גם בספאם')); };
  // המייל מכיל קישור עם token — מאמתים אותו כאן במקום לעבור בכתובת החזרה
  $('ok').onclick = async () => { if (!$('code').value.trim()) return bad('code', 'צריך להדביק את הקישור מהמייל');
    const v = $('code').value.trim(), th = (v.match(/[?&]token=([^&\s]+)/) || [])[1];
    const { error } = th ? await sb.auth.verifyOtp({ token_hash: th, type: 'magiclink' }) : await sb.auth.verifyOtp({ email: $('em').value.trim(), token: v, type: 'email' });
    error ? bad('code', 'הקישור לא תקין או שפג תוקפו — שלחו מייל חדש') : location.reload(); };
  return false;
}

const DB = {
  // הגדרות העסק + מכסת הדפים. העסק נפתח רק על ידינו (אחרי תשלום) — אין עסק ← null
  async biz() {
    if (!sb) return { settings: LS.get('biz', {}), page_limit: LS.get('limit', 1), renews_at: LS.get('renews', null) };
    const { data, error } = await sb.from('businesses').select('settings,page_limit,renews_at').eq('owner', UID).maybeSingle(); if (error) throw error;
    return data;
  },
  async saveBiz(settings) {
    if (!sb) return LS.set('biz', settings);
    const { error } = await sb.from('businesses').update({ settings }).eq('owner', UID); if (error) throw error;
  },
  async pages() {
    if (!sb) return LS.get('pages', []).map(slug => ({ slug, content: LS.get('draft:' + slug, {}) }));
    const { data, error } = await sb.from('sites').select('slug,content').eq('owner', UID).order('slug'); if (error) throw error; return data;
  },
  // דף + הגדרות העסק שלו (גם כשמנהל עורך דף של לקוח). שמירה מותרת רק לבעל הדף או למנהל — לפי ההרשאות בשרת
  async page(slug) {
    if (!sb) { const c = LS.get('draft:' + slug, null); return c && { content: c, biz: await DB.biz() }; }
    const { data } = await sb.from('sites').select('content,owner,businesses(settings)').eq('slug', slug).maybeSingle();
    if (!data || (data.owner !== UID && !(await DB.isAdmin()))) return null;
    return { content: data.content, biz: data.businesses || { settings: {} } };
  },
  async isAdmin() { if (!sb) return false; const { data } = await sb.rpc('is_admin'); return !!data; },
  async addPage(slug, content) {
    if (!sb) { const p = LS.get('pages', []); if (p.includes(slug)) throw new Error('duplicate'); if (p.length >= LS.get('limit', 1)) throw new Error('limit'); LS.set('pages', [...p, slug]); return LS.set('draft:' + slug, content); }
    const { error } = await sb.from('sites').insert({ slug, owner: UID, content }); if (error) throw error;
  },
  async savePage(slug, content) {
    if (!sb) return LS.set('draft:' + slug, content);
    const { data, error } = await sb.from('sites').update({ content, updated_at: new Date().toISOString() }).eq('slug', slug).select('slug'); if (error) throw error;
    if (!data.length) throw new Error('אין הרשאה לשמור את הדף הזה');
  },
  async delPage(slug) {
    if (!sb) { LS.set('pages', LS.get('pages', []).filter(s => s !== slug)); return localStorage.removeItem('draft:' + slug); }
    const { error } = await sb.from('sites').delete().eq('slug', slug); if (error) throw error;
  },
  // פניות והזמנות מכל הדפים של העסק (ההרשאות בשרת מחזירות רק את של בעל העסק)
  async leads() {
    if (!sb) return LS.get('leads', []);
    const { data, error } = await sb.from('leads').select('id,slug,kind,data,status,created_at').order('created_at', { ascending: false }).limit(300); if (error) throw error; return data;
  },
  async setLead(id, status) {
    if (!sb) return LS.set('leads', LS.get('leads', []).map(l => l.id === id ? { ...l, status } : l));
    const { error } = await sb.from('leads').update({ status }).eq('id', id); if (error) throw error;
  },
  async delLead(id) {
    if (!sb) return LS.set('leads', LS.get('leads', []).filter(l => l.id !== id));
    const { error } = await sb.from('leads').delete().eq('id', id); if (error) throw error;
  },
  async upload(slug, blob) {
    if (!sb) return new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
    const path = `${slug}/${Date.now()}.webp`;
    const { error } = await sb.storage.from('tiny-sites-images').upload(path, blob, { contentType: 'image/webp' });
    if (error) throw error; return sb.storage.from('tiny-sites-images').getPublicUrl(path).data.publicUrl;
  },
};
// הקטנת תמונה בדפדפן לפני העלאה — דף מהיר גם עם תמונות מהטלפון
async function shrink(file, max = 1200) {
  const img = await createImageBitmap(file), r = Math.min(1, max / Math.max(img.width, img.height));
  const c = Object.assign(document.createElement('canvas'), { width: Math.round(img.width * r), height: Math.round(img.height * r) });
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/webp', 0.8));
}
// קישור בתוך הניהול שומר על מצב הבדיקה המקומי
const href = (page, q = '') => page + '?' + q + (window.SUPABASE_URL ? '' : (q ? '&' : '') + 'local');
