import mongoose from 'mongoose';

// Ye schema frontend (client/src/resume.js -> blank()) ke form se bilkul match karta hai.
const experienceSchema = new mongoose.Schema({
  role: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' },
  period: { type: String, trim: true, default: '' },
  details: { type: String, default: '' },
});

const educationSchema = new mongoose.Schema({
  degree: { type: String, trim: true, default: '' },
  school: { type: String, trim: true, default: '' },
  period: { type: String, trim: true, default: '' },
});

const projectSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  details: { type: String, default: '' },
});

const resumeSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: 'My resume' },
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    links: { type: String, trim: true, default: '' },
    summary: { type: String, default: '' },
    skills: { type: String, default: '' }, // comma separated string
    experience: [experienceSchema],
    education: [educationSchema],
    projects: [projectSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
