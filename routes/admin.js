const express = require('express');
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.isAdmin) return res.redirect('/login');
  next();
}

router.use(requireAuth);

router.get('/dashboard', (req, res) => {
  const stats = {
    totalProjects: 28,
    totalProjectsLabel: 'Across Delhi, Mumbai & Bengaluru',
    totalProjectsHighlight: 'Active',
    totalProjectsValue: '₹4.8 Cr',
    newEnquiries: 4,
    newEnquiriesLabel: 'Awaiting review & initial consultation',
    newEnquiriesHighlight: 'Response Target',
    newEnquiriesValue: '< 24 Hours',
    pendingReviews: 3,
    pendingReviewsLabel: 'Submitted by clients, pending approval',
    pendingReviewsHighlight: 'Average Rating',
    pendingReviewsValue: '4.9 / 5.0',
    vendorRegistrations: 5,
    vendorRegistrationsLabel: 'New material & contractor applications',
    vendorRegistrationsHighlight: 'Category Focus',
    vendorRegistrationsValue: 'Joinery & Stone'
  };
  res.render('admin/dashboard', { user: req.session.adminUser, stats, activePage: 'dashboard' });
});

router.get('/projects', (req, res) => {
  res.render('admin/projects', { user: req.session.adminUser, activePage: 'projects' });
});

router.get('/reviews', (req, res) => {
  res.render('admin/reviews', { user: req.session.adminUser, activePage: 'reviews' });
});

router.get('/enquiries', (req, res) => {
  res.render('admin/enquiries', { user: req.session.adminUser, activePage: 'enquiries' });
});

router.get('/vendors', (req, res) => {
  res.render('admin/vendors', { user: req.session.adminUser, activePage: 'vendors' });
});

router.get('/settings', (req, res) => {
  res.render('admin/settings', { user: req.session.adminUser, activePage: 'settings' });
});

module.exports = router;
