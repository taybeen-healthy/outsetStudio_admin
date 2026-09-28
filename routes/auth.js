const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Login page
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('login', { error: null, layout: 'login-layout' });
});

// Login POST - DB auth with env fallback
router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.comparePassword(password))) {
      req.session.isAdmin = true;
      req.session.adminId = admin._id.toString();
      req.session.adminUser = {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        initials: admin.initials,
        role: admin.role,
        title: admin.title,
        phone: admin.phone,
        location: admin.location,
        avatarColor: admin.avatarColor,
      };
      return res.redirect('/admin/dashboard');
    }

    // Fallback: env credentials (works before seed / DB unavailable)
    if (!admin && email === (process.env.ADMIN_EMAIL || '').toLowerCase() && password === process.env.ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      req.session.adminUser = {
        id: null,
        name: 'Admin',
        email,
        initials: 'AD',
        role: 'Administrator',
        title: 'Administrator',
        phone: '',
        location: 'Delhi HQ',
        avatarColor: 'sage',
      };
      return res.redirect('/admin/dashboard');
    }
  } catch (err) {
    console.error('Login error:', err.message);
  }

  res.render('login', { error: 'Invalid email or password', layout: 'login-layout' });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
