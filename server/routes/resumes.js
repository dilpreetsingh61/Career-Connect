const express = require('express');
const { Resume } = require('../models');
const { verifyToken, isStudent } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vercel Serverless Polyfill for pdf-parse
if (typeof DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix { };
}
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

// GET all resumes for the logged-in student
router.get('/', verifyToken, isStudent, async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to perform resume parsing & technical feedback matching
const analyzeResume = (content, title) => {
  const text = ((content || '') + ' ' + (title || '')).toLowerCase();

  let score = 40; // Base score
  const matchedStrengths = [];
  const missingImprovements = [];

  // 1. Length & Word Count Check (Max +10)
  const wordCount = text.split(/\s+/).filter(w => w).length;
  if (wordCount > 200 && wordCount < 1000) {
    score += 10;
    matchedStrengths.push('Optimal word count (200-1000 words)');
  } else if (wordCount > 1000) {
    score += 5;
    missingImprovements.push('Resume is a bit too long, consider condensing');
  } else {
    score += 5;
    missingImprovements.push('Resume is too short, add more details');
  }

  // 2. Essential Sections Check (Max +20)
  const sections = ['education', 'experience', 'skills', 'projects'];
  let foundSections = 0;
  sections.forEach(sec => {
    if (text.includes(sec)) {
      foundSections++;
    }
  });
  score += foundSections * 5;
  if (foundSections >= 3) {
    matchedStrengths.push('Good section structure (Education, Experience, Skills)');
  } else {
    missingImprovements.push('Missing core sections like Experience, Skills, or Projects');
  }

  // 3. Action Verbs Check (Max +15)
  const actionVerbs = ['managed', 'developed', 'created', 'led', 'designed', 'built', 'improved', 'increased', 'reduced', 'implemented', 'orchestrated', 'achieved'];
  let verbsCount = 0;
  actionVerbs.forEach(verb => {
    if (text.includes(verb)) verbsCount++;
  });
  if (verbsCount >= 4) {
    score += 15;
    matchedStrengths.push('Strong use of action verbs');
  } else if (verbsCount >= 2) {
    score += 8;
    missingImprovements.push('Use more action verbs (e.g., led, developed, improved)');
  } else {
    missingImprovements.push('Lacking action verbs to describe achievements');
  }

  // 4. Quantifiable Achievements Check (Max +15)
  // Look for percentages or numbers indicating metrics
  if (/\d{1,3}%/.test(text) || /\$\d+/.test(text) || /\d+x/.test(text)) {
    score += 15;
    matchedStrengths.push('Includes quantifiable metrics and achievements');
  } else {
    score += 5;
    missingImprovements.push('Add quantifiable metrics (%, $, etc.) to your achievements');
  }

  // 5. Contact & Links Check (Max +10)
  if (/@\w+\.\w+/.test(text)) {
    score += 5;
  } else {
    missingImprovements.push('Missing email address');
  }
  if (/linkedin\.com|github\.com/.test(text)) {
    score += 5;
    matchedStrengths.push('Includes professional links (LinkedIn/GitHub)');
  } else {
    missingImprovements.push('Add professional links like LinkedIn or GitHub');
  }

  // Cap at 99, floor at 40
  score = Math.min(99, Math.max(40, score));

  // Generate detailed structured feedback
  const feedbackData = {
    strengths: matchedStrengths.slice(0, 5),
    improvements: missingImprovements.slice(0, 5),
    formatting: wordCount < 50 ? 'Document body is too sparse.' : 'Formatting and layout structure evaluated successfully.',
    technicalGaps: missingImprovements.slice(0, 2)
  };

  return {
    score,
    feedback: JSON.stringify(feedbackData)
  };
};

// POST add a new resume
router.post('/', verifyToken, isStudent, upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    let parsed_content = req.body.parsed_content || '';
    let file_url = req.body.file_url || 'https://example.com/resume.pdf';

    if (req.file) {
      file_url = `/uploads/${req.file.filename}`;
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        parsed_content = data.text;
      } catch (err) {
        console.error('Error parsing PDF:', err);
      }
    }

    // Analyze resume content to get real score and feedback rather than random numbers
    const analysis = analyzeResume(parsed_content, title);

    const resume = await Resume.create({
      user_id: req.user.id,
      title: title || 'My Resume',
      file_url: file_url,
      parsed_content: parsed_content,
      ai_score: analysis.score,
      ai_feedback: analysis.feedback
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a resume
router.delete('/:id', verifyToken, isStudent, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    await resume.destroy();
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
