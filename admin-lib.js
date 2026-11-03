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
let sb = null, UID = null, EMAIL = '';

// מחזיר true כשמחוברים; אחרת מציג מסך כניסה ב-#app ומחזיר false
// admin=true (ניהול ראשי): כניסה בלבד — בלי הרשמה ובלי טקסט לבעלי עסקים
async function connect(admin = false) {
  if (!window.SUPABASE_URL) return true;
  await new Promise(r => { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'; sc.onload = r; document.head.append(sc); });
  // storageKey נפרד: באותו דומיין רצה גם אפליקציית הסנדוויצים (אותו שרת) — בלי זה החיבור שלה נכנס גם לכאן
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'tiny' }, auth: { storageKey: 'tiny-auth' } });
  const { data: { session } } = await sb.auth.getSession();
  if (session) { UID = session.user.id; EMAIL = session.user.email; return true; }
  $('app').innerHTML = `<h1>${admin ? 'כניסה לניהול הראשי' : 'כניסה או הרשמה'}</h1><div class="card">${admin ? '' : '<p class="muted" style="margin-top:0">בונים דף לעסק בחינם, ומשלמים רק כשרוצים לפרסם אותו.</p>'}<label>המייל שלך</label><input id="em" type="email" inputmode="email">
    <div class="tools"><button class="primary" id="send">שליחת קוד למייל</button></div><div id="step2" hidden>
    <label>הקוד מהמייל</label><input id="code" dir="ltr" inputmode="numeric" autocomplete="one-time-code" style="font-size:22px;letter-spacing:4px;text-align:center">
    <div class="tools"><button class="primary" id="ok">כניסה</button></div></div><div id="msg"></div></div>`;
  // קוד מלא (8 ספרות — לפי ההגדרה ב-Supabase) ← כניסה אוטומטית
  $('code').addEventListener('input', () => { if (/^\d{8}$/.test($('code').value.trim())) $('ok').click(); });
  $('send').onclick = async () => { if (!isMail($('em').value.trim())) return bad('em', $('em').value.trim() ? 'המייל לא תקין — בדקו שיש @ ונקודה' : 'צריך למלא את המייל');
    const { error } = await sb.auth.signInWithOtp({ email: $('em').value.trim(), options: { shouldCreateUser: !admin, emailRedirectTo: location.href } });
    const sec = (error?.message.match(/after (\d+) seconds/) || [])[1];  // בין שני קודים לאותו מייל צריך לחכות דקה
    if (sec) $('step2').hidden = false;  // הקוד הקודם עדיין בדרך — משאירים את שדה הקוד
    // גיבוי: אם המייל לא נשלח או לא מגיע, בעל העסק לא נתקע — פונה אלינו בוואטסאפ
    if (!admin && !sec && window.SALES_PHONE && !$('mailhelp')) $('send').insertAdjacentHTML('afterend', `<p id="mailhelp" class="muted">${error ? 'משהו השתבש בשליחת הקוד.' : 'הקוד לא הגיע תוך דקה?'} <a target="_blank" href="https://wa.me/${SALES_PHONE}?text=${encodeURIComponent('שלום, אני מנסה להירשם לבניית דף עם המייל ' + $('em').value.trim() + ' והקוד לא מגיע')}">כתבו לנו בוואטסאפ</a> ונעזור לכם מיד.</p>`);
    error ? msg('❌ ' + (sec ? `כבר נשלח קוד — אפשר לבקש קוד חדש בעוד ${sec} שניות. בדקו את המייל (גם בספאם)` : /rate/i.test(error.message) ? 'יש עומס בשליחת קודים — נסו שוב בעוד כמה דקות, או כתבו לנו בוואטסאפ' : /signup/i.test(error.message) ? 'המייל הזה לא מוגדר כמנהל' : /fetch|network/i.test(error.message) ? 'אין חיבור לאינטרנט — נסו שוב' : 'שגיאה: ' + error.message))
          : ($('step2').hidden = false, $('code').focus(), msg('✓ נשלח קוד למייל — בדקו גם בספאם')); };
  // כניסה עם הקוד מהמייל (נשאר גם קישור מודבק, למי שהדביק קישור)
  $('ok').onclick = async () => { const v = $('code').value.trim(); if (!v) return bad('code', 'צריך להקליד את הקוד מהמייל');
    const th = (v.match(/[?&]token=([^&\s]+)/) || [])[1];
    const { error } = th ? await sb.auth.verifyOtp({ token_hash: th, type: 'magiclink' }) : await sb.auth.verifyOtp({ email: $('em').value.trim(), token: v.replace(/\s/g, ''), type: 'email' });
    error ? bad('code', /fetch|network/i.test(error.message) ? 'אין חיבור לאינטרנט — נסו שוב' : 'הקוד לא נכון או שפג תוקפו — בדקו שוב או שלחו קוד חדש') : location.reload(); };
  return false;
}

const DB = {
  // הגדרות העסק + חבילה. נרשם חדש ← נפתח לו עסק כטיוטה (בלי תאריך חידוש — לא מפורסם עד שהמנהל מסמן תשלום)
  async biz() {
    if (!sb) return { settings: LS.get('biz', {}), page_limit: LS.get('limit', 1), renews_at: LS.get('renews', null), request: LS.get('request', {}) };
    const { data, error } = await sb.from('businesses').select('settings,page_limit,renews_at,request').eq('owner', UID).maybeSingle(); if (error) throw error;
    if (data) return data;
    const ins = await sb.from('businesses').insert({ owner: UID, settings: {} }); if (ins.error) throw ins.error;
    return { settings: {}, page_limit: 1, renews_at: null, request: {} };
  },
  async saveRequest(request) {
    if (!sb) return LS.set('request', request);
    const { error } = await sb.from('businesses').update({ request }).eq('owner', UID); if (error) throw error;
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
  // לוגו של העסק: בתיקייה של בעל העסק (עוד לפני שיש לו דף)
  async uploadLogo(blob) {
    if (!sb) return new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
    const path = `${UID}/logo-${Date.now()}.webp`;
    const { error } = await sb.storage.from('tiny-sites-images').upload(path, blob, { contentType: 'image/webp' });
    if (error) throw error; return sb.storage.from('tiny-sites-images').getPublicUrl(path).data.publicUrl;
  },
  async upload(slug, blob) {
    if (!sb) return new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
    const path = `${slug}/${Date.now()}.webp`;
    const { error } = await sb.storage.from('tiny-sites-images').upload(path, blob, { contentType: 'image/webp' });
    if (error) throw error; return sb.storage.from('tiny-sites-images').getPublicUrl(path).data.publicUrl;
  },
};
// הקטנת תמונה בדפדפן לפני העלאה — דף מהיר גם עם תמונות מהטלפון
// SVG (לוגו) מצויר לתמונה רגילה — לא שומרים קבצי SVG בשרת
async function shrink(file, max = 1200) {
  const svg = /svg/.test(file.type); let img;
  if (svg) { img = new Image(); img.src = URL.createObjectURL(file); await img.decode(); } else img = await createImageBitmap(file);
  const w = img.naturalWidth || img.width || max, h = img.naturalHeight || img.height || max, r = svg ? max / Math.max(w, h) : Math.min(1, max / Math.max(w, h));
  const c = Object.assign(document.createElement('canvas'), { width: Math.round(w * r), height: Math.round(h * r) });
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/webp', 0.8));
}
// חבילות מילוי (חד־פעמי): אנחנו מנסחים ומסדרים. החומרים עצמם — רק מבעל העסק
const FILLS = {
  basic: { label: 'בסיס', price: 99, does: 'ניסוח כותרת ותיאור, בחירת עיצוב וצבעים, סידור פרטי הקשר והשעות' },
  plus: { label: 'מורחב', price: 199, does: 'כל מה שבבסיס + סידור מחירון או שירותים (עד 15), גלריה (עד 8 תמונות) וכתיבת 3 שאלות נפוצות' },
  full: { label: 'מלא', price: 349, does: 'כל מה שבמורחב + עד 40 פריטים, גלריה עד 20 תמונות, עד 8 שאלות נפוצות, ניסוח שיווקי מלא ו־2 סבבי תיקונים' },
};
const FILL_NEEDS = 'לוגו, תמונות, מחירים, שעות פתיחה, כתובת והמלצות אמיתיות של לקוחות';
const fillLabel = f => f === true ? 'מילוי מלא' : FILLS[f] ? `מילוי ${FILLS[f].label} (${FILLS[f].price} ₪)` : '';
// קישור בתוך הניהול שומר על מצב הבדיקה המקומי
const href = (page, q = '') => page + '?' + q + (window.SUPABASE_URL ? '' : (q ? '&' : '') + 'local');
// מסכי הניהול (<html data-themed>): בהיר כברירת מחדל, גם כשהטלפון במצב כהה. כפתור 🌙/☀️ למעבר — נשמר במכשיר
if (document.documentElement.hasAttribute('data-themed')) {
  const set = t => { document.documentElement.dataset.theme = t; try { localStorage.setItem('tiny-theme', t); } catch {} btn.textContent = t === 'dark' ? '☀️' : '🌙'; btn.setAttribute('aria-label', t === 'dark' ? 'מעבר לתצוגה בהירה' : 'מעבר לתצוגה כהה'); };
  const btn = Object.assign(document.createElement('button'), { type: 'button', onclick: () => set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark') });
  btn.style.cssText = 'position:absolute;top:10px;left:10px;z-index:50;width:40px;height:40px;border-radius:50%;padding:0;font-size:18px;line-height:1;border:1px solid var(--line);background:var(--card);box-shadow:0 2px 8px #0002;cursor:pointer';
  let t = 'light'; try { t = localStorage.getItem('tiny-theme') || 'light'; } catch {} set(t); if (document.documentElement.dataset.themed !== 'nobtn') document.body.append(btn);  // בעורך: בלי כפתור (הסרגל העליון), אבל אותה בחירה
}

// התראות בטלפון על פנייה/הזמנה חדשה (Web Push). באייפון: רק אחרי "הוספה למסך הבית" ופתיחה משם
const pushState = () => !('serviceWorker' in navigator) || !('PushManager' in window) ? (/iPhone|iPad/.test(navigator.userAgent) && !navigator.standalone ? 'ios-home' : 'no')
  : Notification.permission === 'denied' ? 'denied' : 'ok';
async function pushOn() {
  const reg = await navigator.serviceWorker.register('sw.js');
  if (await Notification.requestPermission() !== 'granted') throw new Error('denied');
  const key = Uint8Array.from(atob(VAPID_PUBLIC.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  if (!sb) return LS.set('push', sub.toJSON());
  const { error } = await sb.from('push_subs').upsert({ endpoint: sub.endpoint, owner: UID, sub: sub.toJSON() }); if (error) throw error;
}
async function pushIsOn() { if (pushState() !== 'ok' || Notification.permission !== 'granted') return false; const reg = await navigator.serviceWorker.getRegistration('sw.js'); return !!(reg && await reg.pushManager.getSubscription()); }
async function pushOff() { const reg = await navigator.serviceWorker.getRegistration('sw.js'), sub = reg && await reg.pushManager.getSubscription(); if (!sub) return;
  if (sb) await sb.from('push_subs').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe(); }
