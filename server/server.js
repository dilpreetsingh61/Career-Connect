require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const { User, Notification } = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jobsRouter = require('./routes/jobs');
const applicationsRouter = require('./routes/applications');
const resumesRouter = require('./routes/resumes');
const notificationsRouter = require('./routes/notifications');
const profileRouter = require('./routes/profiles');
const resourcesRouter = require('./routes/resources');
const adminRouter = require('./routes/admin');

const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.log('[Server] Skipping uploads directory creation (Serverless environment detected).');
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Basic health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'success',
      message: 'Server is running',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Users endpoint for testing & Admin moderation
app.get('/api/users', async (req, res) => {
    try {
        const { Profile } = require('./models');
        const users = await User.findAll({ 
            attributes: ['id', 'name', 'email', 'role', 'status', 'is_active', 'created_at'],
            include: [{
                model: Profile,
                attributes: ['graduation_year', 'university', 'course']
            }]
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bulk update user status (Admin moderation)
app.put('/api/users/bulk/status', async (req, res) => {
  try {
    const { userIds, status } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    }
    if (status !== 'active' && status !== 'blocked') {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Fetch users for notification
    const users = await User.findAll({ where: { id: userIds } });
    
    // Update users
    await User.update(
      { status, is_active: status === 'active' },
      { where: { id: userIds } }
    );
    
    // Send notifications
    for (const user of users) {
      const isBlocked = status === 'blocked';
      const title = isBlocked ? 'Account Blocked' : 'Account Reactivated';
      const message = isBlocked 
        ? 'Your account has been temporarily suspended by an Administrator. Please contact support.'
        : 'Your account has been successfully reactivated! Welcome back to Career Connect.';
        
      await Notification.create({
        user_id: user.id,
        title,
        message,
        type: 'SYSTEM',
        read: false
      });
      
      const { sendEmail } = require('./utils/email');
      const html = `
        <div style="font-family: sans-serif; padding: 20px; background: #020617; color: #fff;">
          <h2 style="color: ${isBlocked ? '#ef4444' : '#10b981'};">${title}</h2>
          <p>${message}</p>
        </div>
      `;
      await sendEmail({ to: user.email, subject: `Career Connect: ${title}`, html });
    }
    
    res.json({ success: true, count: userIds.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status (Admin moderation)
app.put('/api/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = status;
    user.is_active = (status === 'active');
    await user.save();
    
    const isBlocked = status === 'blocked';
    const title = isBlocked ? 'Account Blocked' : 'Account Reactivated';
    const message = isBlocked 
      ? 'Your account has been temporarily suspended by an Administrator. Please contact support.'
      : 'Your account has been successfully reactivated! Welcome back to Career Connect.';
      
    await Notification.create({
      user_id: user.id,
      title,
      message,
      type: 'SYSTEM',
      read: false
    });
    
    const { sendEmail } = require('./utils/email');
    const html = `
      <div style="font-family: sans-serif; padding: 20px; background: #020617; color: #fff;">
        <h2 style="color: ${isBlocked ? '#ef4444' : '#10b981'};">${title}</h2>
        <p>${message}</p>
      </div>
    `;
    await sendEmail({ to: user.email, subject: `Career Connect: ${title}`, html });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    const userRole = role || 'STUDENT';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash: hashedPassword, role: userRole });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if the user is active/blocked
    if (user.is_active === false) {
      return res.status(403).json({ error: 'Your account has been blocked by the Administrator.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password (OTP)
const { sendEmail } = require('./utils/email');
const redisClient = require('./utils/redisClient');

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return 200 even if not found to prevent email enumeration
      return res.json({ message: 'If an account with that email exists, we have sent a password reset OTP.' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in Redis (expires in 300s = 5m)
    await redisClient.setEx(`otp:${email}`, 300, otp);
    
    // Send email
    const html = `
      <div style="font-family: sans-serif; padding: 20px; background: #020617; color: #fff; max-width: 600px; border-radius: 10px;">
        <h2 style="color: #0ea5e9;">Career Connect Password Reset</h2>
        <p>You requested a password reset. Here is your verification code:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 15px; background: #8b5cf6; color: white; display: inline-block; border-radius: 6px; letter-spacing: 2px;">
          ${otp}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">This code will expire in 5 minutes.</p>
        <p style="font-size: 12px; color: #94a3b8;">If you did not request this, please ignore this email.</p>
      </div>
    `;
    await sendEmail({ to: email, subject: 'Your Password Reset OTP', html });
    
    res.json({ message: 'If an account with that email exists, we have sent a password reset OTP.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }
    
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }
    
    const storedOtp = await redisClient.get(`otp:${email}`);
    
    if (!storedOtp) {
      return res.status(400).json({ error: 'OTP has expired or is invalid. Please request a new one.' });
    }
    
    if (storedOtp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP.' });
    }
    
    // OTP matches. Update password.
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password_hash: hashedPassword }, { where: { email } });
    
    // Delete OTP from redis
    await redisClient.del(`otp:${email}`);
    
    res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount API routes
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/admin', adminRouter);

sequelize.sync().then(() => {
  if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
});

module.exports = app;
