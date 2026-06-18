const express = require('express');
const { Application, Job, User, Resume, Notification, Interview } = require('../models');
const { verifyToken, isStudent, isInterviewer } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const router = express.Router();

// POST apply for a job (Student)
router.post('/', verifyToken, isStudent, async (req, res) => {
  try {
    const { job_id, resume_id } = req.body;
    
    // Check if job exists and is active
    const job = await Job.findByPk(job_id);
    if (!job || job.status !== 'active') {
      return res.status(404).json({ error: 'Job not found or not active' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: { student_id: req.user.id, job_id }
    });
    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    const application = await Application.create({
      student_id: req.user.id,
      job_id,
      resume_id,
      status: 'applied'
    });
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET my applications (Student)
router.get('/me', verifyToken, isStudent, async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { student_id: req.user.id },
      include: [
        { model: Job, attributes: ['title', 'company', 'location', 'round_types', 'total_rounds'] },
        { model: Resume, attributes: ['title'] }
      ]
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET applications for a specific job (Interviewer)
router.get('/job/:jobId', verifyToken, isInterviewer, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify interviewer owns this job
    const job = await Job.findOne({ where: { id: jobId, interviewer_id: req.user.id } });
    if (!job) {
      return res.status(403).json({ error: 'Not authorized or job not found' });
    }

    const applications = await Application.findAll({
      where: { job_id: jobId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Resume, attributes: ['title', 'file_url', 'parsed_content', 'ai_score'] }
      ]
    });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update application status (Interviewer)
router.put('/:id/status', verifyToken, isInterviewer, async (req, res) => {
  try {
    const { status, interview_date, meeting_link, current_round } = req.body; // 'shortlisted', 'rejected', 'selected', 'interview_scheduled'
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Job },
        { model: User, as: 'student', attributes: ['name', 'email'] }
      ]
    });
    
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    // Verify ownership
    if (application.Job.interviewer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = status;
    if (current_round !== undefined) {
      application.current_round = current_round;
    }
    await application.save();

    // Generate Meet link if scheduling an interview
    let generatedMeetLink = meeting_link;
    if (status === 'interview_scheduled') {
      if (!interview_date) {
        return res.status(400).json({ error: 'Interview date is required' });
      }
      if (!generatedMeetLink) {
        generatedMeetLink = `https://meet.google.com/cc-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      }

      // Upsert Interview record
      const [interview, created] = await Interview.findOrCreate({
        where: { application_id: application.id },
        defaults: {
          interview_date: new Date(interview_date),
          meeting_link: generatedMeetLink
        }
      });

      if (!created) {
        interview.interview_date = new Date(interview_date);
        interview.meeting_link = generatedMeetLink;
        await interview.save();
      }
    }

    // Calculate round type
    let roundInfo = '';
    const roundIdx = (application.current_round || 1) - 1;
    if (application.Job && application.Job.round_types && application.Job.round_types[roundIdx]) {
      roundInfo = ` for ${application.Job.round_types[roundIdx]} (Round ${application.current_round})`;
    } else if (application.current_round) {
      roundInfo = ` for Round ${application.current_round}`;
    }

    // Create Notification for the student
    let message = `Your application for ${application.Job.title} at ${application.Job.company} has been updated to: ${status}${roundInfo}.`;
    let emailSubject = `Application Update: ${application.Job.title} at ${application.Job.company}`;
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Hi ${application.student.name},</h2>
        <p>Your application status for <strong>${application.Job.title}</strong> at <strong>${application.Job.company}</strong> has been updated to <strong>${status}</strong>${roundInfo}.</p>
        <p>Best regards,<br/>Career Connect Team</p>
      </div>
    `;

    if (status === 'shortlisted') {
      message = `Congratulations! You have been shortlisted for ${application.Job.title} at ${application.Job.company}${roundInfo}.`;
      emailSubject = `Congratulations! Shortlisted for ${application.Job.title} at ${application.Job.company}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0fdf4; border-radius: 8px; color: #166534;">
          <h2 style="color: #15803d;">Great News, ${application.student.name}!</h2>
          <p>We are excited to inform you that you have been <strong>Shortlisted</strong> for the role of <strong>${application.Job.title}</strong> at <strong>${application.Job.company}</strong>${roundInfo}.</p>
          <p>The interviewer will schedule a discussion with you shortly. Keep an eye on your dashboard notifications!</p>
          <p style="margin-top: 20px; font-size: 12px; color: #86efac;">Sincerely,<br/>Career Connect Talent Team</p>
        </div>
      `;
    } else if (status === 'rejected') {
      message = `Unfortunately, your application for ${application.Job.title} at ${application.Job.company} was not successful.`;
      emailSubject = `Update regarding your application for ${application.Job.title}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fef2f2; border-radius: 8px; color: #991b1b;">
          <h2>Hello ${application.student.name},</h2>
          <p>Thank you for your interest in the <strong>${application.Job.title}</strong> position at <strong>${application.Job.company}</strong>.</p>
          <p>Unfortunately, after careful review of all profiles, we have decided not to move forward with your application at this time.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #fca5a5;">We wish you the best in your career search.<br/>Career Connect Team</p>
        </div>
      `;
    } else if (status === 'interview_scheduled') {
      message = `You have been invited to an interview for ${application.Job.title} at ${application.Job.company}${roundInfo} on ${new Date(interview_date).toLocaleString()}.`;
      emailSubject = `Interview Invitation: ${application.Job.title} at ${application.Job.company}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Congratulations ${application.student.name}!</h2>
          <p>You have been shortlisted and invited to an interview for <strong>${application.Job.title}</strong> at <strong>${application.Job.company}</strong>${roundInfo}.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #10b981;">
            <p><strong>Date & Time:</strong> ${new Date(interview_date).toLocaleString()}</p>
            <p><strong>Meeting Link:</strong> <a href="${generatedMeetLink}">${generatedMeetLink}</a></p>
          </div>
          <p>Please ensure you join 5 minutes early.</p>
          <p>Best regards,<br/>Career Connect Team</p>
        </div>
      `;
    } else if (status === 'selected') {
      message = `Congratulations! You have been selected for ${application.Job.title} at ${application.Job.company}!`;
      emailSubject = `Congratulations! Offer letter for ${application.Job.title} at ${application.Job.company}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ecfdf5; border-radius: 8px; color: #065f46;">
          <h1 style="color: #047857; margin-bottom: 5px;">Congratulations, ${application.student.name}!</h1>
          <p style="font-size: 16px;">We are thrilled to offer you the position of <strong>${application.Job.title}</strong> at <strong>${application.Job.company}</strong>!</p>
          <p>Your exceptional skills matched our criteria perfectly, and we are excited to have you join our company journey.</p>
          <p>An official onboarding representative will contact you shortly to explain next steps, payroll settings, and start dates.</p>
          <p style="margin-top: 20px; font-weight: bold; color: #10b981;">Welcome aboard!</p>
        </div>
      `;
    }

    await Notification.create({
      user_id: application.student_id,
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`,
      message: message
    });

    // Trigger Nodemailer mock email dispatch
    await sendEmail({
      to: application.student.email,
      subject: emailSubject,
      html: emailHtml
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST evaluate application using ATS engine
router.post('/:id/evaluate', verifyToken, isInterviewer, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Job },
        { model: Resume }
      ]
    });
    
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.Job.interviewer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    // Use advanced ATS Engine
    const { calculateATSScore } = require('../utils/atsEngine');
    
    const resumeText = application.Resume.parsed_content || '';
    const jdText = application.Job.description || '';
    const jobTags = application.Job.tags || [];

    const { score, matchedKeywords, missingKeywords } = calculateATSScore(resumeText, jdText, jobTags);

    // Save score and feedback to Resume
    application.Resume.ai_score = score;
    application.Resume.ai_feedback = JSON.stringify({
      strengths: matchedKeywords.slice(0, 5),
      improvements: missingKeywords.slice(0, 5),
      formatting: 'ATS engine completed advanced keyword matching against Job Description and Tags.',
      technicalGaps: missingKeywords.slice(0, 5)
    });
    await application.Resume.save();
    
    res.json({ score, feedback: application.Resume.ai_feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
