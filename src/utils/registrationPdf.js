import { NIPUN_BHARAT, SCHOOL_LOGO, UP_GOVT } from '../assets/pdfLogos';

export const HINDI_MONTHS = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
const HN = ['शून्य','एक','दो','तीन','चार','पाँच','छह','सात','आठ','नौ','दस','ग्यारह','बारह','तेरह','चौदह','पन्द्रह','सोलह','सत्रह','अठारह','उन्नीस','बीस','इक्कीस','बाईस','तेईस','चौबीस','पच्चीस','छब्बीस','सत्ताईस','अट्ठाईस','उनतीस','तीस','इकतीस'];

// DOB stored as DD-MM-YYYY.
export function dobWords(dob) {
  if (!dob) return '';
  const p = String(dob).split('-').map(Number);
  if (p.length !== 3 || p.some(isNaN)) return '';
  const [d, m, y] = p;
  return `${HN[d] || d} ${HINDI_MONTHS[m - 1] || m} ${y}`;
}

export const nowStamp = () => new Date().toLocaleString('hi-IN', { dateStyle: 'long', timeStyle: 'short' });

// Treat both real booleans (new records) and 'हाँ'/'नहीं' strings (older records) consistently.
export const truthy = (x) => x === true || x === 'हाँ' || x === 'हाँ ✓';

const esc = (x) => String(x == null ? '' : x).replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CONSENT = 'मैं स्वेच्छा से अपने बच्चे की जनसांख्यिकीय जानकारी और आधार नंबर, शिक्षा मंत्रालय के साथ साझा करने की अनुमति देता/देती हूँ। मैं यह समझता/समझती हूँ कि इस जानकारी का उपयोग केवल अपार आईडी (APAAR ID) बनाने, डिजिलॉकर खाता खोलने और शैक्षणिक गतिविधियों (जैसे छात्रवृत्ति, परिणाम रिकॉर्ड आदि) के लिए ही किया जाएगा।';
export { CONSENT };

function photoCell(src, label, ph) {
  return `<div class="pcell"><div class="pbox">${src ? `<img src="${src}">` : `<span class="pph">${ph || 'फोटो'}</span>`}</div><div class="plabel">${label}</div></div>`;
}

export function buildPdfHtml(f, regId, submittedAt) {
  const v = (key) => esc(f[key]);
  const chk = (key) => truthy(f[key]) ? 'हाँ ✓' : 'नहीं';
  const sibRows = (f.siblings || []).map((r, i) =>
    `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${esc(r.dob)}</td><td>${esc(r.school)}</td></tr>`
  ).join('');
  const upLogo = UP_GOVT
    ? `<img class="corner" src="${UP_GOVT}">`
    : `<div class="corner-ph">उत्तर प्रदेश<br>शासन</div>`;

  return `<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8">
<style>
@page{size:A4;margin:0}
html,body{margin:0;padding:0}
body{font-family:sans-serif;font-size:10px;color:#000;padding:12px 20px 4px;line-height:1.4;width:794px;box-sizing:border-box}
.tricolor{height:4px;display:flex;margin-bottom:5px}
.t1{flex:1;background:#FF9933}.t2{flex:1;background:#fff}.t3{flex:1;background:#138808}
.topbar{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #9A3412;padding-bottom:5px;margin-bottom:4px}
.corner{width:108px;height:108px;object-fit:contain}
.corner-ph{width:100px;height:100px;border:1.5px dashed #9A3412;border-radius:8px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px;font-weight:700;color:#9A3412;line-height:1.3}
.center{text-align:center;flex:1;padding:0 8px}
.center img{width:82px;height:82px;object-fit:contain;border-radius:8px}
.school-name{font-size:22px;font-weight:800;color:#9A3412;margin-top:3px}
.title-bar{text-align:center;font-size:14px;font-weight:800;color:#9A3412;border:1.5px solid #9A3412;padding:6px;margin:5px 0;background:#FFFBEB}
.blank{display:inline-block;min-width:46px;border-bottom:1px solid #000;margin:0 2px}
.hzone{display:flex;gap:12px;align-items:flex-start;margin:3px 0}
.hleft{flex:1;min-width:0}
.photos{display:flex;gap:8px}
.pcell{text-align:center}
.pbox{width:70px;height:84px;border:1.5px solid #9A3412;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff}
.pbox img{width:100%;height:100%;object-fit:cover}
.pph{color:#999;font-size:9px}
.plabel{font-size:9px;font-weight:700;color:#1E3A8A;margin-top:1px}
.line{margin:2px 0;font-size:10.5px}
.val{display:inline-block;min-width:56px;border-bottom:1px dotted #000;padding:0 3px;font-weight:600}
.val-lg{min-width:110px}.val-xl{min-width:150px}
.sec{font-weight:700;color:#15803D;font-size:11px;margin:3px 0 2px;border-bottom:1px solid #ccc}
.docs-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px 10px;font-size:10.5px}
table.sib{width:100%;border-collapse:collapse;font-size:10px;margin-top:2px}
table.sib th,table.sib td{border:1px solid #1E3A8A;padding:4px 4px;text-align:center}
table.sib th{background:#EFF6FF;color:#1E3A8A;font-weight:700}
table.sib td{height:18px}
.declaration{border:1.5px solid #9A3412;padding:7px;background:#FFFBEB;font-size:9.5px;margin:5px 0;line-height:1.45}
.sigs{display:flex;justify-content:space-between;margin-top:6px;font-size:10.5px;font-weight:700;color:#1E3A8A}
.sigs .col{text-align:center;width:46%}
.sigline{border-top:1px solid #000;margin-bottom:3px}
.submitline{text-align:center;font-size:9.5px;color:#333;border-top:1px solid #ccc;margin-top:4px;padding-top:3px;font-weight:600}
</style></head><body>
<div class="tricolor"><div class="t1"></div><div class="t2"></div><div class="t3"></div></div>
<div class="topbar">
  <img class="corner" src="${NIPUN_BHARAT}">
  <div class="center">
    <img src="${SCHOOL_LOGO}">
    <div class="school-name">प्राथमिक विद्यालय गोविंदपुर</div>
  </div>
  ${upLogo}
</div>
<div class="title-bar">विद्यालय में प्रवेश हेतु आवेदन पत्र — शैक्षिक सत्र: 20<span class="blank"></span> – 20<span class="blank"></span></div>
<div class="hzone">
  <div class="hleft">
    <div class="line">विद्यालय का नाम:- <span class="val val-xl">${v('school_name')}</span> &nbsp; UDISE: <span class="val val-lg">${v('udise')}</span></div>
    <div class="line">विकास क्षेत्र:- <span class="val val-lg">${v('block')}</span> &nbsp; जनपद:- <span class="val">${v('district')}</span> &nbsp; प्रदेश:- <span class="val">${v('state')}</span></div>
    <div class="line">आवेदन संख्या:- <span class="val">${v('app_no')}</span> &nbsp; आवेदन दिनांक:- <span class="val">${v('app_date')}</span> &nbsp; नामांकन संख्या:- <span class="val">${v('enrollment_no')}</span></div>
    <div class="sec">★ छात्र/छात्रा का विवरण</div>
    <div class="line">नाम (हिन्दी):- <span class="val val-xl">${v('student_name_hi')}</span></div>
    <div class="line">नाम (English):- <span class="val val-xl">${v('student_name_en')}</span></div>
  </div>
  <div class="photos">
    ${photoCell(f._photo || f.photo_url, 'छात्र/छात्रा')}
    ${photoCell(null, 'पिता', 'फोटो<br>चिपकाएँ')}
    ${photoCell(null, 'माता', 'फोटो<br>चिपकाएँ')}
  </div>
</div>
<div class="line">आवेदित कक्षा:- <span class="val">${v('applied_class')}</span> &nbsp; PEN: <span class="val">${v('pen')}</span> &nbsp; APAAR: <span class="val">${v('apaar')}</span> &nbsp; UNIQUE ID: <span class="val">${v('unique_id')}</span></div>
<div class="line">आधार संख्या:- <span class="val">${v('aadhaar')}</span> &nbsp; आधार पंजीकरण संख्या:- <span class="val val-lg">${v('aadhaar_enrol')}</span></div>
<div class="sec">★ पूर्व विद्यालय विवरण</div>
<div class="line">पूर्व विद्यालय:- <span class="val val-xl">${v('prev_school')}</span> &nbsp; UDISE: <span class="val">${v('prev_udise')}</span> &nbsp; पूर्व कक्षा: <span class="val">${v('prev_class')}</span> &nbsp; नामांकन: <span class="val">${v('prev_enrol')}</span></div>
<div class="sec">★ व्यक्तिगत विवरण</div>
<div class="line">जन्मतिथि:- <span class="val">${v('dob')}</span> &nbsp; (शब्दों में): <span class="val val-lg">${v('dob_words')}</span> &nbsp; लिंग:- <span class="val">${v('gender')}</span></div>
<div class="line">ऊँचाई: <span class="val">${v('height')}</span> cm &nbsp; वज़न: <span class="val">${v('weight')}</span> kg &nbsp; रक्त वर्ग: <span class="val">${v('blood')}</span> &nbsp; निवास: <span class="val">${v('residence_area')}</span> &nbsp; दिव्यांग: <span class="val">${v('divyang')}</span> ${f.divyang_type ? '('+v('divyang_type')+')' : ''}</div>
<div class="line">धर्म: <span class="val">${v('religion')}</span> &nbsp; उपजाति: <span class="val">${v('caste')}</span> &nbsp; वर्ग: <span class="val">${v('sub_caste')}</span> &nbsp; मातृभाषा: <span class="val">${v('mother_tongue')}</span> &nbsp; EWS: <span class="val">${v('ews')}</span> &nbsp; राशन: <span class="val">${v('ration')}</span></div>
<div class="sec">★ पिता का विवरण</div>
<div class="line">नाम (हिन्दी):- <span class="val val-xl">${v('father_name_hi')}</span> &nbsp; नाम (English):- <span class="val val-xl">${v('father_name_en')}</span></div>
<div class="line">व्यवसाय: <span class="val">${v('father_occ')}</span> &nbsp; शिक्षा: <span class="val">${v('father_edu')}</span> &nbsp; आधार: <span class="val val-lg">${v('father_aadhaar')}</span> &nbsp; मोबाइल: <span class="val">${v('father_mobile')}</span></div>
<div class="line">बैंक नाम: <span class="val val-xl">${v('father_bank_name')}</span> &nbsp; खाता: <span class="val val-lg">${v('father_acc')}</span> &nbsp; IFSC: <span class="val">${v('father_ifsc')}</span> &nbsp; बैंक: <span class="val">${v('father_bank')}</span></div>
<div class="sec">★ माता का विवरण</div>
<div class="line">नाम (हिन्दी):- <span class="val val-xl">${v('mother_name_hi')}</span> &nbsp; नाम (English):- <span class="val val-xl">${v('mother_name_en')}</span></div>
<div class="line">व्यवसाय: <span class="val">${v('mother_occ')}</span> &nbsp; शिक्षा: <span class="val">${v('mother_edu')}</span> &nbsp; आधार: <span class="val val-lg">${v('mother_aadhaar')}</span> &nbsp; मोबाइल: <span class="val">${v('mother_mobile')}</span></div>
<div class="line">बैंक नाम: <span class="val val-xl">${v('mother_bank_name')}</span> &nbsp; खाता: <span class="val val-lg">${v('mother_acc')}</span> &nbsp; IFSC: <span class="val">${v('mother_ifsc')}</span> &nbsp; बैंक: <span class="val">${v('mother_bank')}</span></div>
<div class="sec">★ स्थायी पता</div>
<div class="line">मकान नं.: <span class="val">${v('perm_mohalla')}</span> &nbsp; ग्राम/बस्ती: <span class="val">${v('perm_village')}</span> &nbsp; डाकखाना: <span class="val">${v('perm_post')}</span> &nbsp; जनपद: <span class="val">${v('perm_district')}</span> &nbsp; प्रदेश: <span class="val">${v('perm_state')}</span> &nbsp; PIN: <span class="val">${v('perm_pin')}</span></div>
<div class="sec">★ वर्तमान पता</div>
<div class="line">मकान नं.: <span class="val">${v('curr_mohalla')}</span> &nbsp; ग्राम/बस्ती: <span class="val">${v('curr_village')}</span> &nbsp; डाकखाना: <span class="val">${v('curr_post')}</span> &nbsp; जनपद: <span class="val">${v('curr_district')}</span> &nbsp; प्रदेश: <span class="val">${v('curr_state')}</span> &nbsp; PIN: <span class="val">${v('curr_pin')}</span></div>
<div class="sec">★ अभिभावक विवरण</div>
<div class="line">नाम: <span class="val val-xl">${v('guardian_name')}</span> &nbsp; सम्बन्ध: <span class="val">${v('guardian_rel')}</span> &nbsp; मोबाइल: <span class="val">${v('guardian_mobile')}</span></div>
<div class="sec">★ संलग्न दस्तावेज</div>
<div class="docs-grid">
  <div>• जन्म प्रमाण-पत्र: <strong>${chk('doc_birth')}</strong></div>
  <div>• छात्र का आधार: <strong>${chk('doc_student_aadhaar')}</strong></div>
  <div>• छात्र की पासबुक: <strong>${chk('doc_student_passbook')}</strong></div>
  <div>• पिता का आधार: <strong>${chk('doc_father_aadhaar')}</strong></div>
  <div>• पिता की पासबुक: <strong>${chk('doc_father_passbook')}</strong></div>
  <div>• माता का आधार: <strong>${chk('doc_mother_aadhaar')}</strong></div>
  <div>• माता की पासबुक: <strong>${chk('doc_mother_passbook')}</strong></div>
</div>
<div class="sec">★ बालक / बालिका के भाई / बहन का विवरण</div>
<table class="sib">
  <tr><th style="width:12%">क्रम संख्या</th><th style="width:30%">नाम</th><th style="width:20%">जन्मतिथि</th><th style="width:38%">नामांकित विद्यालय का नाम</th></tr>
  ${sibRows}
</table>
<div class="declaration"><strong>अभिभावक की घोषणा:-</strong><br>मेरे द्वारा दी गयी सभी सूचनाएँ सत्य हैं। कोई भी तथ्य छिपाया नहीं गया है। ${CONSENT}</div>
<div class="sigs">
  <div class="col"><br><br><div class="sigline"></div>हस्ताक्षर कक्षा अध्यापक</div>
  <div class="col"><br><br><div class="sigline"></div>हस्ताक्षर प्रधानाध्यापक (मोहर सहित)</div>
</div>
<div class="submitline">पंजीकरण क्रमांक: ${esc(regId)} &nbsp;·&nbsp; फॉर्म जमा करने की तिथि व समय: ${esc(submittedAt)}</div>
</body></html>`;
}