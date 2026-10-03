const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Admin = require('../models/Admin');

const REMEMBER_COOKIE = 'ost_remember';
const EMAIL_COOKIE = 'remember_email';
const REMEMBER_DAYS = 30;
const rememberSecret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'outset-admin-remember';

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function signRemember(email) {
  const payload = Buffer.from(`${email}|${Date.now() + REMEMBER_DAYS * 864e5}`).toString('base64url');
  const sig = crypto.createHmac('sha256', rememberSecret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyRemember(token) {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expect = crypto.createHmac('sha256', rememberSecret).update(payload).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  } catch (e) {
    return null;
  }
  const parts = Buffer.from(payload, 'base64url').toString().split('|');
  if (!parts[0] || !parts[1] || Date.now() > Number(parts[1])) return null;
  return parts[0];
}

function startSession(req, admin, email) {
  req.session.isAdmin = true;
  if (admin) req.session.adminId = admin._id.toString();
  req.session.adminUser = admin
    ? {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        initials: admin.initials,
        role: admin.role,
        title: admin.title,
        phone: admin.phone,
        location: admin.location,
        avatarColor: admin.avatarColor,
      }
    : {
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
}

function applyRemember(res, remember, email) {
  if (remember) {
    res.cookie(REMEMBER_COOKIE, signRemember(email), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: REMEMBER_DAYS * 864e5,
    });
    res.cookie(EMAIL_COOKIE, email, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: REMEMBER_DAYS * 864e5,
    });
  } else {
    res.clearCookie(REMEMBER_COOKIE, { path: '/' });
    res.clearCookie(EMAIL_COOKIE, { path: '/' });
  }
}

async function loginWithRemember(req, email) {
  const admin = await Admin.findOne({ email });
  if (admin) {
    startSession(req, admin, email);
    return true;
  }
  if (email === (process.env.ADMIN_EMAIL || '').toLowerCase()) {
    startSession(req, null, email);
    return true;
  }
  return false;
}

// Login page (auto-login via remember token when valid)
router.get('/login', async (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  const cookies = parseCookies(req);
  const remembered = verifyRemember(cookies[REMEMBER_COOKIE]);
  if (remembered) {
    try {
      if (await loginWithRemember(req, remembered)) {
        req.session.cookie.maxAge = REMEMBER_DAYS * 864e5;
        return res.redirect('/admin/dashboard');
      }
    } catch (err) {
      console.error('Remember login error:', err.message);
    }
  }
  res.render('login', {
    error: null,
    layout: 'login-layout',
    prefillEmail: cookies[EMAIL_COOKIE] || '',
  });
});

// Login POST - DB auth with env fallback
router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const remember = req.body.remember === 'on' || req.body.remember === 'true';

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.comparePassword(password))) {
      startSession(req, admin, email);
      if (remember) req.session.cookie.maxAge = REMEMBER_DAYS * 864e5;
      applyRemember(res, remember, email);
      return res.redirect('/admin/dashboard');
    }

    // Fallback: env credentials (works before seed / DB unavailable)
    if (!admin && email === (process.env.ADMIN_EMAIL || '').toLowerCase() && password === process.env.ADMIN_PASSWORD) {
      startSession(req, null, email);
      if (remember) req.session.cookie.maxAge = REMEMBER_DAYS * 864e5;
      applyRemember(res, remember, email);
      return res.redirect('/admin/dashboard');
    }
  } catch (err) {
    console.error('Login error:', err.message);
  }

  res.render('login', { error: 'Invalid email or password', layout: 'login-layout', prefillEmail: email });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie(REMEMBER_COOKIE, { path: '/' });
  res.redirect('/login');
});

module.exports = router;
