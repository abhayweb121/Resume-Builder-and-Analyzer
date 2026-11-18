export const blank = () => ({
  title: 'My resume',
  name: '', email: '', phone: '', location: '', links: '',
  summary: '', skills: '',
  experience: [{ role: '', company: '', period: '', details: '' }],
  education: [{ degree: '', school: '', period: '' }],
  projects: [{ name: '', details: '' }],
});

export async function api(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Server se connect nahi ho pa raha. Backend chal raha hai?');
  }
  // Response JSON na ho tab bhi crash na ho
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Backend 'error' ya 'message' dono me se kuch bhi bheje, dikhao
    throw new Error(data.error || data.message || `Request fail hui (${res.status} ${res.statusText})`);
  }
  return data;
}

export const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
