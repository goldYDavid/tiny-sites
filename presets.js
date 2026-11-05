// תבניות התחלה לכל סוג עסק. בעל העסק מתחיל מאחת מהן ועורך בעמוד העריכה.
// סוגי מקטעים: products (מחירון עם עגלה), services, schedule, hours, gallery, faq, testimonials, text, lead (טופס השארת פרטים)
window.PRESETS = {
  seasonal: { label: 'מוכר עונתי עם מחירון', accent: '#c8741a', logo: '🕎',
    name: 'שם העסק', tagline: 'מוצרי חנוכה איכותיים במחירים הוגנים', badge: 'הזמנות עד כ"ב כסליו', cta: 'הזמנה בוואטסאפ',
    sections: [
      { kind: 'products', title: 'שמן ופתילות', items: [
        { name: 'שמן זית כתית לחנוכיה', note: '1 ליטר', price: 35 },
        { name: 'פתילות צפות', note: '50 יחידות', price: 6 },
        { name: 'צינוריות שמן מוכנות', note: '44 יחידות', price: 45 }] },
      { kind: 'products', title: 'חנוכיות', items: [
        { name: 'חנוכיה מתכת לילדים', price: 25 },
        { name: 'חנוכיה כסופה לשמן', note: 'גובה 30 ס"מ', price: 120 }] },
      { kind: 'text', title: 'איסוף ומשלוחים', body: 'איסוף מהבית: רחוב לדוגמה 1\nמשלוח בשכונה: 10 ₪\nשעות איסוף: א׳–ה׳ 17:00–21:00' }] },

  food: { label: 'אוכל ביתי בהזמנה מראש', accent: '#b5462f', logo: '🥘',
    name: 'המטבח של ...', tagline: 'סלטים ותבשילים ביתיים לשבת', badge: 'הזמנות עד חמישי ב-10:00', cta: 'הזמנה לשבת',
    sections: [
      { kind: 'products', title: 'סלטים', items: [
        { name: 'חומוס ביתי', note: '500 גרם', price: 18 },
        { name: 'מטבוחה', note: '250 גרם', price: 15 },
        { name: 'חציל במיונז', note: '250 גרם', price: 16 }] },
      { kind: 'products', title: 'דגים ועיקריות', items: [
        { name: 'דג מרוקאי חריף', note: 'נתח', price: 28 },
        { name: 'עוף בתנור עם תפוחי אדמה', note: 'מגש ל-4', price: 90 }] },
      { kind: 'text', title: 'כשרות ומשלוחים', body: 'כשרות: בהשגחת הרב ...\nמשלוח בשכונה ביום שישי 9:00–12:00' },
      { kind: 'testimonials', title: 'מה אומרים', items: [{ text: 'הכי טעים שיש, כמו של אמא', who: 'משפחת כהן' }] }] },

  shop: { label: 'חנות שכונתית', accent: '#1f7a5a', logo: '🛒',
    name: 'שם החנות', tagline: 'כל מה שצריך לבית, קרוב לבית', badge: '', cta: 'שאלה בוואטסאפ', address: 'רחוב לדוגמה 1, נחלת הר חב"ד',
    sections: [
      { kind: 'hours', title: 'שעות פתיחה', items: [
        { day: 'א׳–ה׳', open: '08:00', close: '21:00' }, { day: 'ו׳', open: '07:30', close: '13:30' }, { day: 'מוצ"ש', open: '19:00', close: '23:00' }] },
      { kind: 'products', title: 'מבצעי השבוע', items: [
        { name: 'חלב 3% שקית', price: 5.9 }, { name: 'פילה אמנון לק"ג', price: 13.9 }] },
      { kind: 'text', title: 'משלוחים', body: 'משלוח עד הבית בהזמנה מעל 150 ₪' }] },

  judaica: { label: 'שירותי יהדות', accent: '#2c4a8a', logo: '📜',
    name: 'הרב ... — סופר סת"ם', tagline: 'כתיבה ובדיקת תפילין ומזוזות', badge: 'בדיקה תוך 48 שעות', cta: 'תיאום בוואטסאפ',
    sections: [
      { kind: 'services', title: 'שירותים ומחירים', items: [
        { name: 'בדיקת זוג תפילין', desc: 'כולל החלפת רצועות במידת הצורך', price: 'מ-80 ₪' },
        { name: 'בדיקת מזוזה', desc: 'בדיקה ממוחשבת ובעין', price: '25 ₪' },
        { name: 'מזוזה מהודרת', desc: 'כתב אר"י, הידור', price: 'מ-250 ₪' }] },
      { kind: 'text', title: 'הסמכות', body: 'מוסמך ע"י ...\nניסיון של X שנים' },
      { kind: 'faq', title: 'שאלות נפוצות', items: [
        { q: 'כל כמה זמן בודקים מזוזות?', a: 'פעמיים בשבע שנים.' },
        { q: 'אפשר להביא ולאסוף מהבית?', a: 'כן, בתיאום מראש.' }] },
      { kind: 'lead', title: 'השאירו פרטים', body: 'נחזור אליכם בהקדם', button: 'שליחה' }] },

  travel: { label: 'נסיעות וחבילות', accent: '#6b3fa0', logo: '✈️',
    name: 'נסיעות לרבי', tagline: 'חבילות טיסה ולינה לכינוס השלוחים', badge: 'מקומות אחרונים', cta: 'הרשמה בוואטסאפ',
    sections: [
      { kind: 'services', title: 'החבילות', items: [
        { name: 'טיסה ישירה בלבד', desc: 'הלוך-חזור, כבודה 23 ק"ג', price: '$899' },
        { name: 'טיסה + לינה שבוע', desc: 'דירה 2 דקות מ-770', price: '$1,390' }] },
      { kind: 'text', title: 'מה כלול', body: 'טיסה ישירה\nהסעה משדה התעופה\nכרטיס SIM מקומי' },
      { kind: 'faq', title: 'שאלות נפוצות', items: [{ q: 'אפשר לשלם בתשלומים?', a: 'כן, עד 6 תשלומים.' }] },
      { kind: 'lead', title: 'השאירו פרטים', body: 'נחזור אליכם בהקדם', button: 'שליחה' }] },

  classes: { label: 'שיעורים וחוגים', accent: '#0f7c8c', logo: '📚',
    name: 'שם החוג / המורה', tagline: 'שיעורים בקבוצות קטנות ובאווירה טובה', badge: 'שיעור ניסיון חינם', cta: 'הרשמה בוואטסאפ',
    sections: [
      { kind: 'schedule', title: 'מערכת שעות', items: [
        { day: 'ראשון', time: '16:00', what: 'גילאי 6–8' }, { day: 'שלישי', time: '17:30', what: 'גילאי 9–12' }] },
      { kind: 'services', title: 'מחירים', items: [{ name: 'מנוי חודשי', desc: 'שיעור בשבוע', price: '180 ₪' }] },
      { kind: 'text', title: 'על המורה', body: 'כמה שורות על הניסיון והגישה.' },
      { kind: 'testimonials', title: 'הורים מספרים', items: [{ text: 'הילדים מחכים לחוג כל שבוע', who: 'רבקה' }] },
      { kind: 'lead', title: 'השאירו פרטים', body: 'נחזור אליכם בהקדם', button: 'שליחה' }] },

  rental: { label: 'השכרת דירה', accent: '#8a5a2b', logo: '🏡',
    name: 'דירת אירוח בנחלה', tagline: 'דירה מרווחת לשבתות וחגים', badge: 'פנוי לשבת הקרובה', cta: 'בדיקת תאריכים',
    sections: [
      { kind: 'gallery', title: 'תמונות', items: [] },
      { kind: 'text', title: 'מה יש בדירה', body: '3 חדרים, 8 מיטות\nפלטה ומיחם לשבת\n2 דקות מבית הכנסת' },
      { kind: 'services', title: 'מחירים', items: [{ name: 'שבת', desc: 'שישי 12:00 עד מוצ"ש', price: '650 ₪' }] },
      { kind: 'lead', title: 'השאירו פרטים', body: 'נחזור אליכם בהקדם', button: 'שליחה' }] },
};

// דפים לדוגמה (dafbiz.com/?demo=<סוג>): פרטים ותמונות שנראים כמו עסק אמיתי, במקום "שם העסק" / "..." של התבנית.
// img: "מקטע.פריט" ← תמונה, text: מקטע ← טקסט. התמונות ב-demo/ (CC0 / נחלת הכלל — demo/CREDITS.txt)
window.DEMOS = {
  food: { name: 'המטבח של רחל', img: { '0.0': 'demo/hummus.webp', '0.1': 'demo/matbucha.webp', '1.0': 'demo/fish.webp', '1.1': 'demo/chicken.webp' },
    text: { 2: 'כשרות: בהשגחת רבנות השכונה\nמשלוח בשכונה ביום שישי 9:00–12:00' } },
  seasonal: { name: 'אור החנוכה', img: { '0.0': 'demo/oil.webp' }, text: { 2: 'איסוף מהבית: רחוב הגפן 4\nמשלוח בשכונה: 10 ₪\nשעות איסוף: א׳–ה׳ 17:00–21:00' } },
  shop: { name: 'המכולת של יוסי', address: 'רחוב הגפן 4', img: { '1.0': 'demo/milk.webp', '1.1': 'demo/fillet.webp' } },
  judaica: { name: 'הרב משה לוי — סופר סת"ם', text: { 1: 'סופר מוסמך, בעל תעודת הסמכה לכתיבה ולבדיקה\nניסיון של 15 שנה' } },
  classes: { name: 'חוג ציור עם שרה', text: { 2: 'מורה לאמנות עם ניסיון של 10 שנים. בכל שיעור הילדים יוצרים עבודה שלמה ולוקחים אותה הביתה.' } },
  rental: { gallery: ['demo/room.webp', 'demo/living.webp', 'demo/kitchen.webp'] },
};
