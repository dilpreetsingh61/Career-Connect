const express = require('express');
const { Notification } = require('../models');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// GET all notifications for the logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT mark all as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT mark single notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    
    notification.is_read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
