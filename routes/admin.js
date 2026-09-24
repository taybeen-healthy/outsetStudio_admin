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
    totalProjectsHighlight: 'Active Valuation',
    totalProjectsValue: '₹4.8 Cr',
    newEnquiries: 4,
    newEnquiriesLabel: 'Awaiting review & initial consultation',
    newEnquiriesHighlight: 'Response Target',
    newEnquiriesValue: '< 24 Hours',
    pendingReviews: 3,
    pendingReviewsLabel: 'Submitted by clients',
    pendingReviewsHighlight: 'Average Rating',
    pendingReviewsValue: '4.9 / 5.0',
    vendorRegistrations: 5,
    vendorRegistrationsLabel: 'New material applications',
    vendorRegistrationsHighlight: 'Category Focus',
    vendorRegistrationsValue: 'Joinery & Stone'
  };

  const chart = {
    maxY: 12,
    totalYtd: 75,
    avgMonthly: '7.5 / Month',
    onTimeRate: '94.8%',
    months: [
      { label: 'JAN', value: 3, type: 'delivered' },
      { label: 'FEB', value: 3.5, type: 'delivered' },
      { label: 'MAR', value: 5.5, type: 'delivered' },
      { label: 'APR', value: 5, type: 'delivered' },
      { label: 'MAY', value: 6.5, type: 'delivered' },
      { label: 'JUN', value: 7, type: 'delivered' },
      { label: 'JUL', value: 5.5, type: 'delivered' },
      { label: 'AUG', value: 8, type: 'delivered' },
      { label: 'SEP', value: 6.5, type: 'delivered' },
      { label: 'OCT', value: 9, type: 'delivered', active: true, badge: '11 Complete' },
      { label: 'NOV*', value: 4.5, type: 'pipeline', estimate: 6 },
      { label: 'DEC*', value: 5.5, type: 'pipeline', estimate: 7 }
    ]
  };

  res.render('admin/dashboard', { user: req.session.adminUser, stats, chart, activePage: 'dashboard' });
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
