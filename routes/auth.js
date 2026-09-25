const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');

// Login page
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    req.session.isAdmin = true;
    req.session.adminId = admin._id;
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.render('login', { error: 'Login failed. Try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
