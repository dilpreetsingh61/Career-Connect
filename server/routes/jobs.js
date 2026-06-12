const express = require('express');
const { Job, User } = require('../models');
const { verifyToken, isInterviewer, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

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

// GET all active jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.findAll({ 
      where: { status: 'active' },
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'interviewer', attributes: ['name', 'company_name'] }]
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all jobs (Admin/Interviewer view)
router.get('/all', verifyToken, async (req, res) => {
  try {
    let whereClause = {};
    // If interviewer, only show their jobs
    if (req.user.role === 'INTERVIEWER') {
      whereClause.interviewer_id = req.user.id;
    }
    
    const jobs = await Job.findAll({ 
      where: whereClause,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'interviewer', attributes: ['name', 'company_name'] }]
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new job (Interviewer)
router.post('/', verifyToken, isInterviewer, upload.single('file'), async (req, res) => {
  try {
    const { title, company, location, type, salary, tags, description, jd_url, total_rounds, round_types } = req.body;
    let jd_file_url = null;
    
    if (req.file) {
      jd_file_url = `/uploads/${req.file.filename}`;
    }

    const parsedRoundTypes = round_types ? (Array.isArray(round_types) ? round_types : JSON.parse(round_types)) : [];

    const job = await Job.create({
      title,
      company, // Can also derive from req.user if company_name is stored there
      location,
      type,
      salary,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      interviewer_id: req.user.id,
      status: 'pending_approval', // Needs Admin approval
      description: description || '',
      jd_url: jd_url || '',
      jd_file_url: jd_file_url,
      total_rounds: parseInt(total_rounds, 10) || 1,
      round_types: parsedRoundTypes
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT change job status (Admin)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'closed', 'rejected'
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    job.status = status;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
