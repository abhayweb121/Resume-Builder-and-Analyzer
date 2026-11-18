const LISTS = {
  experience: { label: 'Experience', fields: [['role', 'Role'], ['company', 'Company'], ['period', 'Period'], ['details', 'What you did', true]] },
  education: { label: 'Education', fields: [['degree', 'Degree'], ['school', 'School'], ['period', 'Period']] },
  projects: { label: 'Projects', fields: [['name', 'Project name'], ['details', 'Details', true]] },
};

function Field({ label, value, onChange, area, type = 'text' }) {
  return (
    <label>
      {label}
      {area ? <textarea rows="3" value={value || ''} onChange={onChange} /> : <input type={type} value={value || ''} onChange={onChange} />}
    </label>
  );
}

function Preview({ r }) {
  const contact = [r.email, r.phone, r.location, r.links].filter(Boolean).join('  |  ');
  const skills = (r.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const exp = r.experience.filter((e) => e.role || e.company || e.details);
  const edu = r.education.filter((e) => e.degree || e.school);
  const pr = r.projects.filter((p) => p.name || p.details);
  return (
    <article className="sheet">
      <h2>{r.name || 'Your name'}</h2>
      <p className="contact">{contact || 'email | phone | city'}</p>
      {r.summary && (<><h3>Summary</h3><p>{r.summary}</p></>)}
      {exp.length > 0 && (<><h3>Experience</h3>{exp.map((e, i) => (
        <div key={i} className="entry"><p><strong>{e.role}</strong>{e.company && `, ${e.company}`}<span>{e.period}</span></p><p className="pre">{e.details}</p></div>
      ))}</>)}
      {pr.length > 0 && (<><h3>Projects</h3>{pr.map((p, i) => (
        <div key={i} className="entry"><p><strong>{p.name}</strong></p><p className="pre">{p.details}</p></div>
      ))}</>)}
      {edu.length > 0 && (<><h3>Education</h3>{edu.map((e, i) => (
        <div key={i} className="entry"><p><strong>{e.degree}</strong>{e.school && `, ${e.school}`}<span>{e.period}</span></p></div>
      ))}</>)}
      {skills.length > 0 && (<><h3>Skills</h3><p>{skills.join(', ')}</p></>)}
    </article>
  );
}

export default function Builder({ resume, setResume, saved, onSave, onLoad, onDelete, onNew }) {
  const set = (k) => (e) => setResume({ ...resume, [k]: e.target.value });
  const setItem = (list, i, k) => (e) => {
    const items = resume[list].map((it, idx) => (idx === i ? { ...it, [k]: e.target.value } : it));
    setResume({ ...resume, [list]: items });
  };
  const addItem = (list) => setResume({ ...resume, [list]: [...resume[list], Object.fromEntries(LISTS[list].fields.map(([k]) => [k, '']))] });
  const removeItem = (list, i) => setResume({ ...resume, [list]: resume[list].filter((_, idx) => idx !== i) });

  return (
    <div className="split">
      <section className="editor">
        <div className="bar">
          <Field label="Resume title" value={resume.title} onChange={set('title')} />
          <button onClick={onSave}>Save resume</button>
          <button className="ghost" onClick={() => window.print()}>Download PDF</button>
        </div>

        <h2>Personal details</h2>
        <div className="grid">
          <Field label="Full name" value={resume.name} onChange={set('name')} />
          <Field label="Email" type="email" value={resume.email} onChange={set('email')} />
          <Field label="Phone" value={resume.phone} onChange={set('phone')} />
          <Field label="Location" value={resume.location} onChange={set('location')} />
        </div>
        <Field label="Links (LinkedIn, GitHub)" value={resume.links} onChange={set('links')} />
        <Field label="Summary" area value={resume.summary} onChange={set('summary')} />
        <Field label="Skills (comma separated)" value={resume.skills} onChange={set('skills')} />

        {Object.entries(LISTS).map(([list, cfg]) => (
          <div key={list}>
            <h2>{cfg.label}</h2>
            {resume[list].map((item, i) => (
              <div className="item" key={i}>
                <div className="grid">
                  {cfg.fields.map(([k, label, area]) => (
                    <Field key={k} label={label} area={area} value={item[k]} onChange={setItem(list, i, k)} />
                  ))}
                </div>
                <button className="ghost small" onClick={() => removeItem(list, i)}>Remove</button>
              </div>
            ))}
            <button className="ghost" onClick={() => addItem(list)}>Add {cfg.label.toLowerCase()} entry</button>
          </div>
        ))}

        <h2>Saved resumes</h2>
        <button className="ghost" onClick={onNew}>Start a new resume</button>
        {saved.length === 0 && <p className="note">Nothing saved yet. Fill in your details and select Save resume.</p>}
        <ul className="saved">
          {saved.map((r) => (
            <li key={r._id}>
              <span>{r.title || 'Untitled'} <small>{r.name}</small></span>
              <span>
                <button className="ghost small" onClick={() => onLoad(r)}>Open</button>{' '}
                <button className="ghost small danger" onClick={() => onDelete(r._id)}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="preview"><Preview r={resume} /></section>
    </div>
  );
}
