const express = require('express');
const { Profile, User } = require('../models');
const { verifyToken, isStudent } = require('../middleware/auth');
const router = express.Router();

// GET current student's profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let profile = await Profile.findOne({
      where: { user_id: userId },
      include: [{ model: User, attributes: ['name', 'email', 'role'] }]
    });

    if (!profile) {
      // Auto-create profile if missing
      profile = await Profile.create({
        user_id: userId,
        skills: [],
        bio: '',
        university: '',
        course: '',
        graduation_year: new Date().getFullYear(),
        academic_marks: '',
        projects: [],
        experience: []
      });
      // Re-fetch to get user associations
      profile = await Profile.findOne({
        where: { user_id: userId },
        include: [{ model: User, attributes: ['name', 'email', 'role'] }]
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT / UPDATE student's profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, university, course, graduation_year, skills, academic_marks, name, projects, experience } = req.body;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      profile = await Profile.create({
        user_id: userId,
        bio,
        university,
        course,
        graduation_year,
        skills: skills || [],
        academic_marks,
        projects: projects || [],
        experience: experience || []
      });
    } else {
      profile.bio = bio !== undefined ? bio : profile.bio;
      profile.university = university !== undefined ? university : profile.university;
      profile.course = course !== undefined ? course : profile.course;
      profile.graduation_year = graduation_year !== undefined ? graduation_year : profile.graduation_year;
      profile.skills = skills !== undefined ? skills : profile.skills;
      profile.academic_marks = academic_marks !== undefined ? academic_marks : profile.academic_marks;
      profile.projects = projects !== undefined ? projects : profile.projects;
      profile.experience = experience !== undefined ? experience : profile.experience;
      await profile.save();
    }

    // Also update User name if provided
    if (name) {
      const user = await User.findByPk(userId);
      if (user) {
        user.name = name;
        await user.save();
      }
    }

    const updatedProfile = await Profile.findOne({
      where: { user_id: userId },
      include: [{ model: User, attributes: ['name', 'email', 'role'] }]
    });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
