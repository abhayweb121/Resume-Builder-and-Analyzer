import { useEffect, useState } from 'react';
import Builder from './Builder.jsx';
import Analyzer from './Analyzer.jsx';
import { api, blank, json } from './resume.js';

export default function App() {
  const [tab, setTab] = useState('build');
  const [resume, setResume] = useState(blank());
  const [saved, setSaved] = useState([]);
  const [status, setStatus] = useState(null);

  const refresh = () => api('/api/resumes').then(setSaved).catch((e) => setStatus({ error: e.message }));
  useEffect(() => { refresh(); }, []);

  async function save() {
    try {
      const doc = resume._id
        ? await api(`/api/resumes/${resume._id}`, json('PUT', resume))
        : await api('/api/resumes', json('POST', resume));
      setResume(doc);
      setStatus({ ok: 'Resume saved' });
      refresh();
    } catch (e) {
      setStatus({ error: e.message });
    }
  }

  async function remove(id) {
    try {
      await api(`/api/resumes/${id}`, { method: 'DELETE' });
      if (resume._id === id) setResume(blank());
      refresh();
    } catch (e) {
      setStatus({ error: e.message });
    }
  }

  return (
    <div className="app">
      <header className="top">
        <h1>Resume builder and analyzer</h1>
        <nav>
          <button className={tab === 'build' ? 'tab on' : 'tab'} onClick={() => setTab('build')}>Build</button>
          <button className={tab === 'analyze' ? 'tab on' : 'tab'} onClick={() => setTab('analyze')}>Analyze</button>
        </nav>
      </header>
      {status?.error && <p className="note error" role="alert">{status.error}</p>}
      {status?.ok && <p className="note ok" role="status">{status.ok}</p>}
      {tab === 'build' ? (
        <Builder
          resume={resume}
          setResume={setResume}
          saved={saved}
          onSave={save}
          onLoad={(r) => { setResume(r); setStatus(null); }}
          onDelete={remove}
          onNew={() => { setResume(blank()); setStatus(null); }}
        />
      ) : (
        <Analyzer resume={resume} />
      )}
    </div>
  );
}
