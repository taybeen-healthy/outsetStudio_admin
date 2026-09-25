require('dotenv').config();
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

// CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Admin EJS routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Outset Studio Admin running on http://localhost:${PORT}`);
});
