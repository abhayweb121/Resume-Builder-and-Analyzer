import express from 'express';
import { analyze, resumeToText } from '../utils/analyzer.js';

const router = express.Router();

// body: { resume?: {...}, text?: "...", jobDescription?: "..." }
router.post('/', (req, res) => {
  const { resume, text, jobDescription } = req.body || {};
  const content = (text && text.trim()) || (resume ? resumeToText(resume) : '');
  if (content.trim().split(/\s+/).length < 20) {
    return res.status(400).json({ error: 'Resume bahut chhota hai. Kam se kam 20 words chahiye.' });
  }
  res.json(analyze(content, jobDescription || ''));
});

export default router;
