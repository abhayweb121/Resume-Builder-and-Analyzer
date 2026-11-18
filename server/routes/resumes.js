import express from 'express';
import mongoose from 'mongoose';
import Resume from '../models/Resume.js';

const router = express.Router();

// Client se aaye extra fields (_id, timestamps, __v) hata do
const clean = (body) => {
  const { _id, createdAt, updatedAt, __v, ...rest } = body || {};
  return rest;
};

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ error: 'Galat resume id.' });

router.get('/', async (req, res) => {
  try {
    res.json(await Resume.find().sort({ updatedAt: -1 }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await Resume.create(clean(req.body)));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', validId, async (req, res) => {
  try {
    const doc = await Resume.findByIdAndUpdate(req.params.id, clean(req.body), {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ error: 'Resume nahi mila.' });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', validId, async (req, res) => {
  try {
    const doc = await Resume.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Resume nahi mila.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
