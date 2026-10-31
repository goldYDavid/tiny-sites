// משותף לניהול (admin.html) ולעורך הדף (edit.html): כניסה במייל + גישה לנתונים.
// במצב מקומי (?local) הכול נשמר בדפדפן — לבדיקה בלי שרת.
const $ = id => document.getElementById(id);
const msg = t => { const m = $('msg'); if (m) { m.textContent = t; setTimeout(() => m.textContent === t && (m.textContent = ''), 3500); } };
const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => localStorage.setItem(k, JSON.stringify(v)) };
let sb = null, UID = null;

// מחזיר true כשמחוברים; אחרת מציג מסך כניסה ב-#app ומחזיר false
async function connect() {
  if (!window.SUPABASE_URL) return true;
  await new Promise(r => { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'; sc.onload = r; document.head.append(sc); });
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'tiny' } });
  const { data: { session } } = await sb.auth.getSession();
  if (session) { UID = session.user.id; return true; }
  $('app').innerHTML = `<h1>כניסה לניהול</h1><div class="card"><label>המייל שלך</label><input id="em" type="email" inputmode="email">
    <div class="tools"><button class="primary" id="send">שליחת מייל כניסה</button></div><div id="step2" hidden>
    <p class="muted">במייל יש קישור "Sign in". לחיצה ארוכה עליו ← העתקת קישור ← הדבקה כאן.</p>
    <label>הקישור (או הקוד) מהמייל</label><input id="code" dir="ltr">
    <div class="tools"><button class="primary" id="ok">כניסה</button></div></div><div id="msg"></div></div>`;
  $('send').onclick = async () => { const { error } = await sb.auth.signInWithOtp({ email: $('em').value.trim(), options: { shouldCreateUser: false, emailRedirectTo: location.href } });
    error ? msg(/rate|seconds/i.test(error.message) ? 'נשלחו יותר מדי מיילים — נסו שוב בעוד כמה דקות' : /signup|not found/i.test(error.message) ? 'המייל הזה לא רשום כבעל אתר' : error.message)
          : ($('step2').hidden = false, msg('נשלח מייל')); };
  // המייל מכיל קישור עם token — מאמתים אותו כאן במקום לעבור בכתובת החזרה
  $('ok').onclick = async () => { const v = $('code').value.trim(), th = (v.match(/[?&]token=([^&\s]+)/) || [])[1];
    const { error } = th ? await sb.auth.verifyOtp({ token_hash: th, type: 'magiclink' }) : await sb.auth.verifyOtp({ email: $('em').value.trim(), token: v, type: 'email' });
    error ? msg('הקישור לא תקין או שפג תוקפו — שלחו מייל חדש') : location.reload(); };
  return false;
}

const DB = {
  // הגדרות העסק + מכסת הדפים (נוצר בכניסה הראשונה)
  async biz() {
    if (!sb) return { settings: LS.get('biz', {}), page_limit: LS.get('limit', 1) };
    let { data } = await sb.from('businesses').select('settings,page_limit').eq('owner', UID).maybeSingle();
    if (!data) { await sb.from('businesses').insert({ owner: UID, settings: {} }); data = { settings: {}, page_limit: 1 }; }
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
  async page(slug) {
    if (!sb) return LS.get('draft:' + slug, null);
    const { data } = await sb.from('sites').select('content').eq('slug', slug).eq('owner', UID).maybeSingle(); return data && data.content;
  },
  async addPage(slug, content) {
    if (!sb) { const p = LS.get('pages', []); if (p.includes(slug)) throw new Error('duplicate'); if (p.length >= LS.get('limit', 1)) throw new Error('limit'); LS.set('pages', [...p, slug]); return LS.set('draft:' + slug, content); }
    const { error } = await sb.from('sites').insert({ slug, owner: UID, content }); if (error) throw error;
  },
  async savePage(slug, content) {
    if (!sb) return LS.set('draft:' + slug, content);
    const { error } = await sb.from('sites').update({ content, updated_at: new Date().toISOString() }).eq('slug', slug); if (error) throw error;
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
