import mongoose from 'mongoose';

/** Stores each ATS analysis so the dashboard can show past scores. */
const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null }, // optional link
    fileName: String,
    jobTitle: String,
    jobDescription: { type: String, required: true },
    atsScore: { type: Number, min: 0, max: 100, required: true },
    missingKeywords: [String],
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Analysis', analysisSchema);
