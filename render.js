// ציור הדף — משותף לדף הציבורי (index.html) ולעורך (edit.html).
// ed=true: כל טקסט ניתן לעריכה במקום (data-p = הנתיב בתוכן), תמונות נבחרות בלחיצה, וכפתורי הוספה/הזזה/מחיקה.
window.TEMPLATES = { classic: 'קלאסי', bold: 'בולט', minimal: 'נקי' };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const nl = s => esc(s).split('\n').map(l => `<p>${l}</p>`).join('');
const T = (ed, p, v, ph, cls) => ed ? `<span contenteditable="plaintext-only" data-p="${p}" data-ph="${ph}"${cls ? ` class="${cls}"` : ''}>${esc(v)}</span>` : esc(v);
const IMG = (ed, p, v, cls, ph) => ed
  ? `<label class="ed-img"><input type="file" accept="image/*" data-img="${p}">${v ? `<img class="${cls}" src="${esc(v)}" alt="">` : `<span class="ed-ph">📷 ${ph}</span>`}</label>`
  : v ? `<img class="${cls}" src="${esc(v)}" alt="" loading="lazy">` : '';
const TOOLS = (ed, si, ii) => ed ? `<div class="ed-tools">${[['up', '↑', 'למעלה'], ['down', '↓', 'למטה'], ['del', '✕', 'מחיקה']].map(([a, t, l]) => `<button data-act="${a}" data-s="${si}" data-i="${ii}" aria-label="${l}">${t}</button>`).join('')}</div>` : '';
// סגנונות תצוגה למחירון מוצרים (נבחר לכל מקטע בעורך)
window.VIEWS = { list: 'רשימה עם תמונה קטנה', grid: 'רשת — 2 בשורה', big: 'תמונה גדולה', text: 'בלי תמונות' };
// בחירת סגנון בעורך: כל אפשרות עם שרטוט קטן של איך היא נראית
const SKETCH = { list: '<i class="r"><b></b><u></u></i>'.repeat(3), grid: '<i class="g"><b></b></i>'.repeat(4), big: '<i class="w"><b></b><u></u></i>', text: '<i class="t"><u></u><s></s></i>'.repeat(3) };
const VIEWPICK = (s, si) => `<div class="viewpick" role="radiogroup" aria-label="תצוגת המוצרים">${Object.entries(VIEWS).map(([k, l]) => `<button data-view="${si}" data-v="${k}" role="radio" aria-checked="${(s.view || 'list') === k}"><span class="sk sk-${k}" aria-hidden="true">${SKETCH[k]}</span>${l}</button>`).join('')}</div>`;
const RENDER = {
  products: (s, si, ed, cart) => `<div class="items v-${VIEWS[s.view] ? s.view : 'list'}">` + s.items.map((it, ii, _, p = `sections.${si}.items.${ii}.`) => `<div class="card item">${IMG(ed, p + 'image', it.image, '', 'תמונה')}
    <div class="t"><b>${T(ed, p + 'name', it.name, 'שם המוצר')}</b>${it.note || ed ? `<small>${T(ed, p + 'note', it.note, 'פירוט (משקל/כמות)')}</small>` : ''}</div>
    <div class="price">${T(ed, p + 'price', it.price, 'מחיר', 'num')} ₪</div>
    ${ed ? TOOLS(ed, si, ii) : s.noCart ? '' : `<div class="qty"><button data-k="${si}-${ii}" data-d="1" aria-label="הוספה">+</button><span id="q${si}-${ii}">${cart[si + '-' + ii] || 0}</span><button data-k="${si}-${ii}" data-d="-1" aria-label="הפחתה">−</button></div>`}</div>`).join('') + '</div>',
  services: (s, si, ed) => s.items.map((it, ii, _, p = `sections.${si}.items.${ii}.`) => `<div class="card item"><div class="t"><b>${T(ed, p + 'name', it.name, 'שם השירות')}</b>${it.desc || ed ? `<small>${T(ed, p + 'desc', it.desc, 'תיאור')}</small>` : ''}</div><div class="price">${T(ed, p + 'price', it.price, 'מחיר')}</div>${TOOLS(ed, si, ii)}</div>`).join(''),
  schedule: (s, si, ed) => `<div class="card">${s.items.map((it, ii, _, p = `sections.${si}.items.${ii}.`) => `<div class="row"><b>${T(ed, p + 'day', it.day, 'יום')} ${T(ed, p + 'time', it.time, 'שעה')}</b><span>${T(ed, p + 'what', it.what, 'מה (גיל/רמה)')}</span>${TOOLS(ed, si, ii)}</div>`).join('')}</div>`,
  hours: (s, si, ed) => `<div class="card">${s.items.map((it, ii, _, p = `sections.${si}.items.${ii}.`) => `<div class="row"><b>${T(ed, p + 'day', it.day, 'ימים')}</b><span dir="ltr">${T(ed, p + 'open', it.open, '08:00')}–${T(ed, p + 'close', it.close, '20:00')}</span>${TOOLS(ed, si, ii)}</div>`).join('')}</div>`,
  gallery: (s, si, ed) => s.items.length || ed ? `<div class="gallery">${s.items.map((it, ii, _, p = `sections.${si}.items.${ii}.`) => ed
    ? `<div>${IMG(ed, p + 'image', it.image, '', 'בחירת תמונה')}${TOOLS(ed, si, ii)}</div>` : `<img src="${esc(it.image)}" alt="${esc(it.name)}" loading="lazy">`).join('')}</div>` : '<p class="muted">עוד לא הועלו תמונות</p>',
  faq: (s, si, ed) => s.items.map((it, ii, _, p = `sections.${si}.items.${ii}.`) => ed
    ? `<div class="card"><b>${T(ed, p + 'q', it.q, 'שאלה')}</b><p>${T(ed, p + 'a', it.a, 'תשובה')}</p>${TOOLS(ed, si, ii)}</div>`
    : `<details class="card"><summary>${esc(it.q)}</summary><p>${esc(it.a)}</p></details>`).join(''),
  testimonials: (s, si, ed) => s.items.map((it, ii, _, p = `sections.${si}.items.${ii}.`) => `<blockquote class="card"><p>“${T(ed, p + 'text', it.text, 'מה אמרו')}”</p><small class="muted">— ${T(ed, p + 'who', it.who, 'מי')}</small>${TOOLS(ed, si, ii)}</blockquote>`).join(''),
  lead: (s, si, ed) => `<form class="card lead" data-lead="${si}">${s.body || ed ? `<p>${T(ed, `sections.${si}.body`, s.body, 'משפט פתיחה (לא חובה)')}</p>` : ''}
    <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <input name="name" placeholder="שם" aria-label="שם" autocomplete="name" required oninvalid="this.setCustomValidity('צריך למלא שם')" oninput="this.setCustomValidity('')" ${ed ? 'disabled' : ''}><input name="phone" type="tel" inputmode="tel" placeholder="טלפון" aria-label="טלפון" autocomplete="tel" required pattern="[0-9 +\\-]{9,15}" title="מספר טלפון, למשל 0501234567" oninvalid="this.setCustomValidity(this.validity.valueMissing ? 'צריך למלא טלפון' : 'מספר הטלפון לא תקין')" oninput="this.setCustomValidity('')" ${ed ? 'disabled' : ''}>
    <textarea name="message" placeholder="הודעה (לא חובה)" aria-label="הודעה (לא חובה)" ${ed ? 'disabled' : ''}></textarea>
    ${ed ? `<span class="lead-btn">${T(ed, `sections.${si}.button`, s.button, 'טקסט הכפתור')}</span>` : `<button class="lead-btn">${esc(s.button || 'שליחה')}</button>`}
    <small class="muted">הפרטים נשלחים לבעל העסק כדי שיחזור אליכם. <a href="legal.html#privacy" target="_blank">פרטיות</a></small></form>`,
  text: (s, si, ed) => `<div class="card text">${ed ? T(ed, `sections.${si}.body`, s.body, 'כתבו כאן (כל שורה בנפרד)', 'ed-body') : nl(s.body)}</div>`,
};
// "פתוח עכשיו" לפי שורות השעות (א׳–ה׳, ו׳, מוצ"ש)
function openNow(rows) {
  const d = new Date().getDay(), m = new Date().getHours() * 60 + new Date().getMinutes();
  const days = { 'א': 0, 'ב': 1, 'ג': 2, 'ד': 3, 'ה': 4, 'ו': 5, 'ש': 6 };
  for (const r of rows) {
    const k = String(r.day || '').replace(/[׳'"]/g, ''); let set = [];
    if (k.includes('מוצ')) set = [6]; else { const p = k.split(/[–-]/).map(x => days[x.trim()[0]]); set = p.length > 1 ? Array.from({ length: p[1] - p[0] + 1 }, (_, i) => p[0] + i) : [p[0]]; }
    const [oh, om] = String(r.open || '').split(':').map(Number), [ch, cm] = String(r.close || '').split(':').map(Number);
    if (set.includes(d) && m >= oh * 60 + om && m < ch * 60 + cm) return true;
  }
  return false;
}
window.renderSite = (site, ed = false, cart = {}) => {
  const hours = site.sections.find(s => s.kind === 'hours' && !s.hidden), isOpen = hours && openNow(hours.items);
  const sec = (s, si) => ed
    ? `<section class="${s.hidden ? 'ed-hidden' : ''}"><div class="ed-sec"><h2>${T(ed, `sections.${si}.title`, s.title, 'כותרת')}</h2><div class="ed-tools">
        <button data-act="sup" data-s="${si}" aria-label="הזזת המקטע למעלה">↑</button><button data-act="sdown" data-s="${si}" aria-label="הזזת המקטע למטה">↓</button>
        <button data-act="shide" data-s="${si}">${s.hidden ? 'הצגה' : 'הסתרה'}</button><button data-act="sdel" data-s="${si}">מחיקה</button></div></div>
        ${s.kind === 'products' ? VIEWPICK(s, si) : ''}${RENDER[s.kind](s, si, ed, cart)}${s.kind === 'text' || s.kind === 'lead' ? '' : `<button class="ed-add" data-act="add" data-s="${si}">+ הוספה</button>`}</section>`
    : s.hidden ? '' : `<section><h2>${esc(s.title)}</h2>${RENDER[s.kind](s, si, ed, cart)}</section>`;
  return `<header>
    ${ed ? IMG(ed, 'image', site.image, 'hero-img', 'תמונה ראשית (לא חובה)') : ''}${!ed && site.image ? `<img class="hero-img" src="${esc(site.image)}" alt="">` : ''}
    ${ed || !site.image ? (site.logo_img ? `<img class="logo logo-img" src="${esc(site.logo_img)}" alt="${esc(site.name)}">` : `<div class="logo" aria-hidden="true">${esc(site.logo)}</div>`) : ''}
    <h1>${esc(site.name)}</h1>${ed ? '<div class="ed-note">שם העסק, הלוגו, הטלפון והצבע משתנים בהגדרות העסק</div>' : ''}
    <p class="sub">${T(ed, 'tagline', site.tagline, 'משפט קצר מתחת לשם')}</p>
    ${site.badge || ed ? `<span class="badge">${T(ed, 'badge', site.badge, 'תגית בולטת (לא חובה)')}</span>` : ''}
    ${hours ? `<span class="open ${isOpen ? 'y' : 'n'}">${isOpen ? '● פתוח עכשיו' : '● סגור כעת'}</span>` : ''}</header>
    ${site.sections.map(sec).join('')}
    <section class="contact"><h2>יצירת קשר</h2><div class="card">
      ${site.phone ? `<p>טלפון: <a href="tel:+${esc(site.phone)}">0${esc(String(site.phone).replace(/^972/, ''))}</a></p>` : ''}
      ${site.address ? `<p>כתובת: <a href="https://maps.google.com/?q=${encodeURIComponent(site.address)}" target="_blank" rel="noopener">${esc(site.address)}</a></p>` : ''}
    </div></section>
    ${ed ? `<section><h2>הכפתור הירוק למטה</h2><div class="card">${T(ed, 'cta', site.cta, 'טקסט הכפתור (למשל "הזמנה בוואטסאפ")')}</div></section>` : `<footer>© ${esc(site.name)} · <a href="legal.html#access">הצהרת נגישות</a> · <a href="legal.html#privacy">פרטיות</a> · <a href="legal.html#terms">תנאי שימוש</a></footer>`}`;
};
