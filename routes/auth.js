const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('login', { layout: 'login-layout', error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.adminUser = {
      name: 'Mohammed Arif',
      email: email,
      role: 'Studio Admin',
      location: 'Delhi HQ',
      initials: 'MA'
    };
    return res.redirect('/admin/dashboard');
  }
  res.render('login', { layout: 'login-layout', error: 'Invalid email or password' });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
