// Rule-based resume analyzer (koi paid AI API nahi chahiye)

const ACTION_VERBS = ['led','built','developed','designed','created','implemented','managed','improved','increased','reduced','launched','delivered','optimized','analyzed','automated','organized','coordinated','trained','researched','achieved','established','streamlined','deployed','collaborated','mentored','resolved','produced','presented'];
const WEAK = ['responsible for','worked on','helped with','helped','duties included','tried to','various tasks'];
const STOP = new Set(('the and for with you your our are will have has this that from they their who what when where which about into over under can able must should would could not but all any such per via etc more most other than then them these those its was were been being job role team work working years year experience candidate looking required requirements preferred ability strong good including include also use using used well new one two may like get make').split(' '));

// Structured resume -> plain text (headings ke saath, taaki section detection chale)
function resumeToText(r) {
  const out = [r.name, r.email, r.phone, r.location, r.links];
  if (r.summary) out.push('Summary', r.summary);
  const exp = (r.experience || []).filter((e) => e.role || e.company || e.details);
  if (exp.length) out.push('Experience', ...exp.map((e) => `${e.role} ${e.company} ${e.period}\n${e.details || ''}`));
  const edu = (r.education || []).filter((e) => e.degree || e.school);
  if (edu.length) out.push('Education', ...edu.map((e) => `${e.degree} ${e.school} ${e.period}`));
  if (r.skills) out.push('Skills', r.skills);
  const pr = (r.projects || []).filter((p) => p.name || p.details);
  if (pr.length) out.push('Projects', ...pr.map((p) => `${p.name}\n${p.details || ''}`));
  return out.filter(Boolean).join('\n');
}

const tokens = (s) => (s.toLowerCase().match(/[a-z0-9+#.]+/g) || []).map((t) => t.replace(/^\.+|\.+$/g, '')).filter(Boolean);

function jdKeywords(jd) {
  const freq = new Map();
  tokens(jd).forEach((t) => {
    if (t.length < 3 || STOP.has(t) || /^\d+$/.test(t)) return;
    freq.set(t, (freq.get(t) || 0) + 1);
  });
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([t]) => t);
}

function analyze(text, jobDescription = '') {
  const lower = text.toLowerCase();
  const words = tokens(text);
  const wc = words.length;
  const tips = [];
  const breakdown = [];

  // 1. Contact (20)
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
  const hasPhone = /(\+?\d[\d\s-]{8,}\d)/.test(text);
  const hasLink = /(linkedin\.com|github\.com|portfolio|https?:\/\/)/i.test(text);
  const contact = (hasEmail ? 8 : 0) + (hasPhone ? 6 : 0) + (hasLink ? 6 : 0);
  if (!hasEmail) tips.push('Email address add kijiye.');
  if (!hasPhone) tips.push('Phone number add kijiye.');
  if (!hasLink) tips.push('LinkedIn ya GitHub link add kijiye.');
  breakdown.push({ label: 'Contact details', score: contact, max: 20 });

  // 2. Sections (25)
  const has = {
    summary: /^\s*(professional\s+)?(summary|objective|profile)\b/im.test(text),
    experience: /^\s*(work\s+|professional\s+)?(experience|internships?)\b/im.test(text),
    education: /^\s*education\b/im.test(text),
    skills: /^\s*(technical\s+|key\s+)?skills\b/im.test(text),
    projects: /^\s*projects?\b/im.test(text),
  };
  const sections = (has.summary ? 5 : 0) + (has.experience ? 7 : 0) + (has.education ? 6 : 0) + (has.skills ? 7 : 0);
  if (!has.summary) tips.push('2-3 line ka Summary section add kijiye.');
  if (!has.experience) tips.push('Experience ya Internship section add kijiye (fresher ho to projects bhi chalenge).');
  if (!has.education) tips.push('Education section add kijiye.');
  if (!has.skills) tips.push('Skills section add kijiye.');
  if (!has.projects) tips.push('Projects section add karne se resume mazboot hota hai.');
  breakdown.push({ label: 'Key sections', score: sections, max: 25 });

  // 3. Content quality (25)
  let lenScore = 0;
  if (wc >= 300 && wc <= 800) lenScore = 8;
  else if ((wc >= 150 && wc < 300) || (wc > 800 && wc <= 1000)) lenScore = 4;
  if (wc < 300) tips.push(`Resume chhota hai (${wc} words). 300-800 words ideal hain.`);
  if (wc > 800) tips.push(`Resume lamba hai (${wc} words). Ise 1-2 page me rakhiye.`);
  const verbs = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`).test(lower));
  const verbScore = Math.round((Math.min(verbs.length, 8) / 8) * 9);
  if (verbs.length < 5) tips.push('Zyada action verbs use kijiye (built, led, improved, ...).');
  const metrics = (text.match(/\d+(\.\d+)?\s?(%|\+|k\b|x\b)|[$₹]\s?\d+/gi) || []).length;
  const metricScore = Math.round((Math.min(metrics, 5) / 5) * 8);
  if (metrics < 3) tips.push('Numbers add kijiye (jaise "load time 30% kam kiya", "500+ users").');
  const weakFound = WEAK.filter((w) => lower.includes(w));
  if (weakFound.length) tips.push(`Kamzor phrases badlein: ${weakFound.join(', ')}. Inki jagah strong action verb likhiye.`);
  const content = Math.max(0, lenScore + verbScore + metricScore - Math.min(weakFound.length, 3));
  breakdown.push({ label: 'Content quality', score: content, max: 25 });

  // 4. Keyword match with job description (30)
  let matched = [];
  let missing = [];
  let max = 70;
  let earned = contact + sections + content;
  if (jobDescription.trim()) {
    const kws = jdKeywords(jobDescription);
    const set = new Set(words);
    matched = kws.filter((k) => set.has(k));
    missing = kws.filter((k) => !set.has(k));
    const kwScore = kws.length ? Math.round((matched.length / kws.length) * 30) : 0;
    earned += kwScore;
    max = 100;
    breakdown.push({ label: 'Job description match', score: kwScore, max: 30 });
    if (missing.length) tips.push(`Job description ke ye keywords resume me nahi mile: ${missing.slice(0, 8).join(', ')}.`);
  }

  const score = Math.round((earned / max) * 100);
  return { score, wordCount: wc, breakdown, suggestions: tips, matched, missing, hasJobDescription: max === 100 };
}

export { analyze, resumeToText };
