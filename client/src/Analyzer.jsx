import { useState } from 'react';
import { api, json } from './resume.js';

export default function Analyzer({ resume }) {
  const [text, setText] = useState('');
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = text.trim() ? { text, jobDescription: jd } : { resume, jobDescription: jd };
      setResult(await api('/api/analyze', json('POST', body)));
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const tone = (n) => (n >= 75 ? 'good' : n >= 50 ? 'mid' : 'low');

  return (
    <div className="split">
      <form className="editor" onSubmit={run}>
        <h2>Resume to check</h2>
        <p className="note">Paste your resume text below. Leave it empty to check the resume you built in the Build tab.</p>
        <label>Resume text
          <textarea rows="10" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your resume here" />
        </label>
        <h2>Job description</h2>
        <label>Optional. Add it to see how well your resume matches the role.
          <textarea rows="8" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here" />
        </label>
        <button type="submit" disabled={busy}>{busy ? 'Analyzing…' : 'Analyze resume'}</button>
        {error && <p className="note error" role="alert">{error}</p>}
      </form>

      <section className="result">
        {!result && <p className="note">Your score and suggestions appear here.</p>}
        {result && (
          <>
            <div className={`score ${tone(result.score)}`}>
              <strong>{result.score}</strong><span>out of 100</span>
            </div>
            <p className="note">{result.wordCount} words{result.hasJobDescription ? '' : '. Add a job description for a keyword match score.'}</p>
            <h2>Score breakdown</h2>
            {result.breakdown.map((b) => (
              <div key={b.label} className="meter">
                <span>{b.label}<em>{b.score}/{b.max}</em></span>
                <div><i style={{ width: `${(b.score / b.max) * 100}%` }} /></div>
              </div>
            ))}
            <h2>What to improve</h2>
            {result.suggestions.length === 0 ? <p className="note">No major issues found.</p> : (
              <ul className="tips">{result.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
            )}
            {result.hasJobDescription && (
              <>
                <h2>Keywords</h2>
                <p className="label">Found in your resume</p>
                <div className="chips">{result.matched.map((k) => <span key={k} className="chip ok">{k}</span>)}</div>
                <p className="label">Missing</p>
                <div className="chips">{result.missing.map((k) => <span key={k} className="chip miss">{k}</span>)}</div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
