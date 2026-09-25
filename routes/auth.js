const express = require('express');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('login', { error: null });
});

// Login POST - hardcoded credentials
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.adminUser = { name: 'Admin', email, initials: 'AD' };
    return res.redirect('/admin/dashboard');
  }
  res.render('login', { error: 'Invalid email or password' });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
