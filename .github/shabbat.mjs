// בזמן שבת/חג (קריית מלאכי, Hebcal) כותב shabbat=true לפלט של GitHub — שאר השלבים מדלגים. NOW=<תאריך> — לבדיקה
const r = await (await fetch('https://www.hebcal.com/shabbat?cfg=json&latitude=31.73&longitude=34.74&tzid=Asia/Jerusalem&M=on&b=20')).json();
const now = Date.parse(process.env.NOW || '') || Date.now();
let start = null, on = false;
for (const i of r.items) {
  if (i.category === 'candles') start = Date.parse(i.date);
  if (i.category === 'havdalah' && start !== null) { if (now >= start && now < Date.parse(i.date)) on = true; start = null; }
}
if (start !== null && now >= start) on = true;  // הדלקת נרות בלי הבדלה עדיין ברשימה
console.log(on ? 'שבת/חג — מדלגים' : 'לא שבת');
if (process.env.GITHUB_OUTPUT) (await import('node:fs')).appendFileSync(process.env.GITHUB_OUTPUT, `shabbat=${on}\n`);
