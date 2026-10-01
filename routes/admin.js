const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Contact = require('../models/Contact');
const Vendor = require('../models/Vendor');
const Testimonial = require('../models/Testimonial');
const Project = require('../models/Project');

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const fmtLogged = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const date = `${String(dt.getDate()).padStart(2, '0')} ${dt.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${dt.getFullYear()}`;
  const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time} IST`;
};

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtINR = (n) => {
  n = Number(n) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} Lakh`;
  return inr(n);
};
const STATUS_CLASS = { 'In Progress': 'inprogress', 'Confirmed': 'confirmed', 'Completed': 'completed', 'Lead': 'lead' };

const fmtAxis = (n) => {
  n = Number(n) || 0;
  if (n >= 10000000) return `${+(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `${+(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
};
const niceCeil = (n) => {
  if (!(n > 0)) return 100000;
  const exp = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / exp;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * exp;
};

function requireAuth(req, res, next) {
  if (!req.session.isAdmin) return res.redirect('/login');
  next();
}

router.use(requireAuth);

let navCountCache = { at: 0, projects: 0, enquiries: 0 };
router.use(async (req, res, next) => {
  res.locals.navCounts = navCountCache;
  if (Date.now() - navCountCache.at < 15000) return next();
  try {
    const [projects, enquiries] = await Promise.all([
      Project.countDocuments(),
      Contact.countDocuments({ status: 'NEW' }),
    ]);
    navCountCache = { at: Date.now(), projects, enquiries };
    res.locals.navCounts = navCountCache;
  } catch (e) { /* keep last known counts */ }
  next();
});

router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const [
      totalProjects, newEnquiries, pendingReviews, approvedReviews, newVendors, totalVendors,
      feeAgg, ratingAgg, approvedVendors, revAgg,
    ] = await Promise.all([
      Project.countDocuments(),
      Contact.countDocuments({ status: 'NEW' }),
      Testimonial.countDocuments({ status: 'pending' }),
      Testimonial.countDocuments({ status: 'approved' }),
      Vendor.countDocuments({ status: 'NEW' }),
      Vendor.countDocuments(),
      Project.aggregate([{ $group: { _id: null, total: { $sum: '$fees' } } }]),
      Testimonial.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Vendor.countDocuments({ status: 'APPROVED' }),
      Project.aggregate([{ $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, total: { $sum: '$fees' } } }]),
    ]);

    const totalFees = feeAgg[0] ? feeAgg[0].total : 0;
    const avgRating = ratingAgg[0] ? ratingAgg[0].avg : 5;

    const revMap = {};
    revAgg.forEach((r) => { revMap[`${r._id.y}-${r._id.m}`] = r.total; });
    const months = [];
    for (let mth = 0; mth < 12; mth++) {
      const d = new Date(now.getFullYear(), mth, 1);
      const value = revMap[`${d.getFullYear()}-${mth + 1}`] || 0;
      const isFuture = d > now;
      months.push({
        label: d.toLocaleString('en-US', { month: 'short' }).toUpperCase() + (isFuture ? '*' : ''),
        value,
        type: value > 0 ? 'delivered' : 'pipeline',
        active: mth === now.getMonth(),
        display: value > 0 ? fmtINR(value) : 'No booking yet',
        badge: value > 0 ? fmtINR(value) : null,
      });
    }
    const windowTotal = months.reduce((s, m) => s + m.value, 0);
    const maxY = niceCeil(Math.max(...months.map((m) => m.value)));

    const stats = {
      totalProjects,
      totalProjectsLabel: 'Across Delhi, Mumbai & Bengaluru',
      totalProjectsHighlight: 'Active Valuation',
      totalProjectsValue: totalFees > 0 ? fmtINR(totalFees) : '₹0',
      newEnquiries,
      newEnquiriesLabel: 'Awaiting review & initial consultation',
      newEnquiriesHighlight: 'Response Target',
      newEnquiriesValue: '< 24 Hours',
      pendingReviews,
      pendingReviewsLabel: 'Submitted by clients',
      pendingReviewsHighlight: 'Average Rating',
      pendingReviewsValue: `${avgRating.toFixed(1)} / 5.0`,
      approvedReviews,
      vendorRegistrations: approvedVendors,
      vendorRegistrationsLabel: 'New material applications',
      vendorRegistrationsHighlight: 'Active Vendors',
      vendorRegistrationsValue: `${totalVendors} On Record`,
    };

    const chart = {
      maxY,
      yLabels: [maxY, maxY * 0.75, maxY * 0.5, maxY * 0.25, 0].map(fmtAxis),
      totalBooked: totalFees > 0 ? fmtINR(totalFees) : '₹0',
      avgMonthly: fmtINR(windowTotal / 12),
      projectCount: totalProjects,
      months,
    };

    res.render('admin/dashboard', { user: req.session.adminUser, stats, chart, activePage: 'dashboard' });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).render('admin/dashboard', {
      user: req.session.adminUser,
      activePage: 'dashboard',
      stats: {
        totalProjects: 0, totalProjectsLabel: '—', totalProjectsHighlight: '—', totalProjectsValue: '₹0',
        newEnquiries: 0, newEnquiriesLabel: '—', newEnquiriesHighlight: '—', newEnquiriesValue: '—',
        pendingReviews: 0, pendingReviewsLabel: '—', pendingReviewsHighlight: '—', pendingReviewsValue: '—', approvedReviews: 0,
        vendorRegistrations: 0, vendorRegistrationsLabel: '—', vendorRegistrationsHighlight: '—', vendorRegistrationsValue: '—',
      },
      chart: { maxY: 100000, yLabels: ['100k', '75k', '50k', '25k', '0'], totalBooked: '₹0', avgMonthly: '₹0', projectCount: 0, months: [] },
    });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const pageReq = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 10;

    const [pipeDocs, portDocs] = await Promise.all([
      Project.find({ type: { $ne: 'portfolio' } }).sort({ createdAt: -1 }),
      Project.find({ type: 'portfolio' }).sort({ order: 1 }),
    ]);
    const docs = [...portDocs, ...pipeDocs];
    const total = docs.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(pageReq, totalPages);
    const pageDocs = docs.slice((page - 1) * perPage, page * perPage);

    const projects = pageDocs.map((c) => {
      const o = c.toObject();
      if (o.type === 'portfolio') {
        const published = o.active !== false;
        return {
          ...o,
          id: o._id.toString(),
          name: o.title,
          code: o.slug || '—',
          client: o.subtitle || '—',
          location: o.location || '—',
          scale: (o.specs && o.specs.type) || '—',
          status: published ? 'PUBLISHED' : 'DRAFT',
          statusClass: published ? 'completed' : 'lead',
          progress: published ? 100 : 0,
          fees: '—',
          feeStatus: published ? 'LIVE ON WEBSITE' : 'HIDDEN FROM WEBSITE',
          feeClass: published ? 'paid' : 'due',
        };
      }
      const feeStatus = o.feeStatus || '—';
      return {
        ...o,
        id: o._id.toString(),
        name: o.title,
        code: o.code || '—',
        client: o.client || '—',
        location: o.location || '—',
        scale: o.scale || '—',
        status: o.status || 'Lead',
        statusClass: STATUS_CLASS[o.status] || 'lead',
        progress: Number(o.progress) || 0,
        fees: inr(o.fees),
        feeStatus,
        feeClass: /PAID|SETTLED/i.test(String(o.feeStatus || '')) ? 'paid' : 'due',
      };
    });
    res.render('admin/projects', {
      user: req.session.adminUser, projects, activePage: 'projects',
      page, totalPages, total,
      showingFrom: total === 0 ? 0 : (page - 1) * perPage + 1,
      showingTo: Math.min(total, page * perPage),
    });
  } catch (err) {
    console.error('Projects error:', err.message);
    res.status(500).render('admin/projects', {
      user: req.session.adminUser, projects: [], activePage: 'projects',
      page: 1, totalPages: 1, total: 0, showingFrom: 0, showingTo: 0,
    });
  }
});

const PROJECT_STATUSES = ['Lead', 'Confirmed', 'In Progress', 'Completed'];

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

router.post('/projects', async (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    if (!title) throw new Error('Title is required');
    const isPortfolio = req.body.type === 'portfolio';
    const location = (req.body.location || '').trim();
    const subtitle = (req.body.subtitle || '').trim();

    const doc = {
      title,
      titleRoman: title,
      titleItalic: '',
      subtitle,
      location,
      type: isPortfolio ? 'portfolio' : '',
    };

    if (isPortfolio) {
      let slug = slugify(title) || `project-${Date.now().toString(36)}`;
      if (await Project.findOne({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
      doc.slug = slug;
      doc.image = (req.body.image || '').trim() || '/image39.png';
      doc.order = 0;
      doc.specs = { projectName: title, type: '', location, scope: '' };
      doc.concept = { title: '', description: '' };
      doc.active = req.body.active === 'on' || req.body.active === 'true';
    } else {
      doc.code = (req.body.code || '').trim();
      doc.client = (req.body.client || '').trim();
      doc.scale = (req.body.scale || '').trim();
      doc.status = PROJECT_STATUSES.includes(req.body.status) ? req.body.status : 'Lead';
      doc.progress = Math.min(100, Math.max(0, Number(req.body.progress) || 0));
      doc.fees = Number(String(req.body.fees || '').replace(/[^0-9]/g, '')) || 0;
      doc.feeStatus = (req.body.feeStatus || '').trim();
      doc.active = true;
    }

    await Project.create(doc);
    req.session.flash = { title: 'Project Created', msg: `"${title}" has been added${isPortfolio ? ' to the website portfolio' : ' to the pipeline'}.` };
  } catch (err) {
    console.error('Project create error:', err.message);
    req.session.flash = { title: 'Create Failed', msg: 'Could not create project. A title is required.' };
  }
  res.redirect('/admin/projects');
});

router.get('/projects/:id/edit', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.redirect('/admin/projects');
    res.render('admin/project-form', {
      user: req.session.adminUser, activePage: 'projects',
      project, statuses: PROJECT_STATUSES,
    });
  } catch (err) {
    res.redirect('/admin/projects');
  }
});

router.post('/projects/:id', async (req, res) => {
  try {
    const { title, code, client, location, scale, status, progress, fees, feeStatus, subtitle, image } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) throw new Error('not found');
    if (title && title.trim()) project.title = title.trim();
    project.code = code || '';
    project.client = client || '';
    project.location = location || '';
    project.scale = scale || '';
    project.status = PROJECT_STATUSES.includes(status) ? status : project.status;
    project.progress = Math.min(100, Math.max(0, Number(progress) || 0));
    project.fees = Number(String(fees || '').replace(/[^0-9]/g, '')) || 0;
    project.feeStatus = feeStatus || '';
    project.subtitle = subtitle || '';
    if (image !== undefined) project.image = image;
    if (req.body.active !== undefined) project.active = req.body.active === 'on' || req.body.active === 'true';
    await project.save();
    req.session.flash = { title: 'Project Updated', msg: 'Project details saved.' };
  } catch (err) {
    console.error('Project update error:', err.message);
    req.session.flash = { title: 'Update Failed', msg: 'Could not update project.' };
  }
  res.redirect('/admin/projects');
});

router.post('/projects/:id/delete', async (req, res) => {
  try {
    await Project.deleteOne({ _id: req.params.id });
    req.session.flash = { title: 'Project Deleted', msg: 'Project removed from the pipeline.' };
  } catch (err) {
    req.session.flash = { title: 'Delete Failed', msg: 'Could not delete project.' };
  }
  res.redirect('/admin/projects');
});

router.get('/reviews', async (req, res) => {
  try {
    const pageReq = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 10;
    const statusKey = ['pending', 'approved', 'declined'].includes(req.query.status) ? req.query.status : 'all';

    const [allCount, pendingCount, approvedCount, declinedCount] = await Promise.all([
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ status: 'pending' }),
      Testimonial.countDocuments({ status: 'approved' }),
      Testimonial.countDocuments({ status: 'declined' }),
    ]);
    const counts = { all: allCount, pending: pendingCount, approved: approvedCount, declined: declinedCount };

    const filter = statusKey === 'all' ? {} : { status: statusKey };
    const total = statusKey === 'all' ? counts.all : counts[statusKey];
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(pageReq, totalPages);

    const docs = await Testimonial.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const avatars = ['sage', 'blush', 'stone'];
    const reviews = docs.map((c, i) => {
      const o = c.toObject();
      const parts = (o.name || '').trim().split(/\s+/);
      return {
        ...o,
        id: o._id.toString(),
        text: o.quote || '',
        date: fmtDate(c.createdAt),
        initials: o.initials || ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'CL',
        avatar: o.avatar || avatars[i % avatars.length],
        status: o.status || 'pending',
        project: o.project || '—',
        typology: o.typology || '—',
      };
    });

    const toastMessages = {
      approved: 'Review approved. Eligible to appear on public website.',
      declined: 'Review declined. It will not appear on the public website.'
    };

    const toastKey = req.query.toast;
    const toast = toastKey && toastMessages[toastKey] ? {
      title: 'Status Updated',
      msg: toastMessages[toastKey]
    } : null;

    res.render('admin/reviews', {
      user: req.session.adminUser, reviews, counts, toast, activePage: 'reviews',
      statusKey, page, totalPages, total,
      showingFrom: total === 0 ? 0 : (page - 1) * perPage + 1,
      showingTo: Math.min(total, page * perPage),
    });
  } catch (err) {
    console.error('Reviews error:', err.message);
    res.status(500).render('admin/reviews', {
      user: req.session.adminUser, reviews: [],
      counts: { all: 0, pending: 0, approved: 0, declined: 0 },
      toast: null, activePage: 'reviews',
      statusKey: 'all', page: 1, totalPages: 1, total: 0, showingFrom: 0, showingTo: 0,
    });
  }
});

router.post('/reviews/:id/status', async (req, res) => {
  const status = req.body.status === 'declined' ? 'declined' : 'approved';
  try {
    await Testimonial.updateOne({ _id: req.params.id }, { status, active: status === 'approved' });
  } catch (err) {
    console.error('Review status error:', err.message);
  }
  const backStatus = ['all', 'pending', 'approved', 'declined'].includes(req.body.backStatus) ? req.body.backStatus : 'all';
  const page = Math.max(1, parseInt(req.body.page, 10) || 1);
  res.redirect(`/admin/reviews?status=${backStatus}&page=${page}&toast=${status}`);
});

const ENQ_STATUS = { new: 'NEW', discussion: 'IN DISCUSSION', confirmed: 'CONFIRMED', archived: 'ARCHIVED' };

router.get('/enquiries', async (req, res) => {
  try {
    const activeTab = (req.query.status && (ENQ_STATUS[req.query.status] || req.query.status === 'all')) ? req.query.status : 'new';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 6;
    const q = (req.query.q || '').trim();

    const counts = {
      all: await Contact.countDocuments(),
      new: await Contact.countDocuments({ status: 'NEW' }),
      discussion: await Contact.countDocuments({ status: 'IN DISCUSSION' }),
      confirmed: await Contact.countDocuments({ status: 'CONFIRMED' }),
      archived: await Contact.countDocuments({ status: 'ARCHIVED' }),
    };

    const tabs = [
      { key: 'all', label: `ALL (${counts.all})` },
      { key: 'new', label: `NEW [${counts.new}]` },
      { key: 'discussion', label: `IN DISCUSSION (${counts.discussion})` },
      { key: 'confirmed', label: `CONFIRMED (${counts.confirmed})` },
      { key: 'archived', label: `ARCHIVED (${counts.archived})` },
    ];

    const filter = {};
    if (ENQ_STATUS[activeTab]) filter.status = ENQ_STATUS[activeTab];
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { location: rx }, { org: rx }];
    }

    const total = await Contact.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const docs = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const enquiries = docs.map((c) => {
      const o = c.toObject();
      return {
        ...o,
        id: o._id.toString(),
        date: fmtDate(c.createdAt),
        status: o.status || 'NEW',
      };
    });

    let selDoc = null;
    if (req.query.id && /^[a-f\d]{24}$/i.test(req.query.id)) {
      selDoc = await Contact.findById(req.query.id).catch(() => null);
    }
    if (!selDoc) selDoc = docs[0] || null;

    let selected = null;
    if (selDoc) {
      if (!selDoc.read) {
        selDoc.read = true;
        await selDoc.save().catch(() => {});
      }
      const o = selDoc.toObject();
      selected = {
        ...o,
        id: o._id.toString(),
        ref: o.ref || `#ENG-${String(o._id).slice(-4).toUpperCase()}`,
        status: o.status || 'NEW',
        org: o.org || o.name,
        typology: o.typology || o.service || '—',
        footprint: o.footprint || '—',
        budget: o.budget || '—',
        brief: o.brief || o.message || '—',
        email: o.email || '—',
        phone: o.phone || '—',
        address: o.address || o.location || '—',
        assignee: (o.assignee && o.assignee.name)
          ? o.assignee
          : { initials: '—', name: 'Unassigned', role: 'Click ASSIGN to take ownership' },
        date: fmtDate(o.createdAt),
        logged: fmtLogged(o.createdAt),
        ip: o.ip || '—',
      };
    }

    res.render('admin/enquiries', {
      user: req.session.adminUser,
      activePage: 'enquiries',
      tabs,
      enquiries,
      selected,
      activeTab,
      page,
      totalPages,
      total,
      q,
      showingFrom: total === 0 ? 0 : (page - 1) * perPage + 1,
      showingTo: Math.min(total, page * perPage),
    });
  } catch (err) {
    console.error('Enquiries error:', err.message);
    res.status(500).render('admin/enquiries', {
      user: req.session.adminUser,
      activePage: 'enquiries',
      tabs: [], enquiries: [], selected: null, activeTab: 'new',
      page: 1, totalPages: 1, total: 0, q: '', showingFrom: 0, showingTo: 0,
    });
  }
});

router.post('/enquiries/:id/status', async (req, res) => {
  const { status, tab } = req.body;
  const id = req.params.id;
  const messages = {
    'NEW': { title: 'Marked as New', msg: 'Enquiry moved back to new enquiries.' },
    'IN DISCUSSION': { title: 'Moved to Discussion', msg: 'Enquiry is now marked as in discussion.' },
    'CONFIRMED': { title: 'Enquiry Confirmed', msg: 'Enquiry marked as confirmed.' },
    'ARCHIVED': { title: 'Enquiry Archived', msg: 'Enquiry moved to archival log.' },
  };
  try {
    if (!messages[status]) throw new Error('invalid status');
    await Contact.updateOne({ _id: id }, { status, read: true });
    req.session.flash = messages[status];
  } catch (err) {
    req.session.flash = { title: 'Update Failed', msg: 'Could not update enquiry status.' };
  }
  res.redirect(`/admin/enquiries?status=${encodeURIComponent(tab || 'new')}&id=${id}`);
});

router.post('/enquiries/:id/assign', async (req, res) => {
  const id = req.params.id;
  const u = req.session.adminUser || {};
  try {
    await Contact.updateOne({ _id: id }, {
      assignee: { initials: u.initials || 'AD', name: u.name || 'Admin', role: u.title || u.role || 'Administrator' },
      read: true,
    });
    req.session.flash = { title: 'Enquiry Assigned', msg: `Enquiry assigned to ${u.name || 'Admin'}.` };
  } catch (err) {
    req.session.flash = { title: 'Assignment Failed', msg: 'Could not assign enquiry.' };
  }
  res.redirect(`/admin/enquiries?status=${encodeURIComponent(req.body.tab || 'new')}&id=${id}`);
});

const VEN_STATUS = { new: 'NEW', verification: 'UNDER SCRUTINY', approved: 'APPROVED', archived: 'ARCHIVED' };

const VENDOR_DEFAULT_CHECKLIST = [
  { title: 'Business & Tax Identity Authenticated', desc: 'Active GSTIN, PAN matching Ministry records.', checked: false },
  { title: 'Material Provenance & Source Verification', desc: 'Supplier / quarry source certificates under review.', checked: false },
  { title: 'Quality Audit of Past Works', desc: 'Reference sites pending inspection.', checked: false },
  { title: 'Worksite Safety & Fair-Wage Compliance', desc: 'Worker insurance declaration awaiting sign-off.', checked: false },
];

router.get('/vendors', async (req, res) => {
  try {
    const statusKey = req.query.status;
    const activeTab = (statusKey && (VEN_STATUS[statusKey] || statusKey === 'all')) ? statusKey : 'all';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = 6;
    const q = (req.query.q || '').trim();

    const counts = {
      all: await Vendor.countDocuments(),
      new: await Vendor.countDocuments({ status: 'NEW' }),
      verification: await Vendor.countDocuments({ status: 'UNDER SCRUTINY' }),
      approved: await Vendor.countDocuments({ status: 'APPROVED' }),
      archived: await Vendor.countDocuments({ status: 'ARCHIVED' }),
    };

    const tabs = [
      { id: 'all', label: 'All', count: counts.all, active: activeTab === 'all' },
      { id: 'new', label: 'New', count: counts.new, badge: true, active: activeTab === 'new' },
      { id: 'verification', label: 'Under Verification', count: counts.verification, active: activeTab === 'verification' },
      { id: 'approved', label: 'Approved', count: counts.approved, active: activeTab === 'approved' },
      { id: 'archived', label: 'Archived', count: counts.archived, active: activeTab === 'archived' },
    ];

    const filter = {};
    if (VEN_STATUS[activeTab]) filter.status = VEN_STATUS[activeTab];
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ vendorName: rx }, { location: rx }, { trade: rx }, { founder: rx }];
    }

    const total = await Vendor.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const docs = await Vendor.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const u = req.session.adminUser || {};
    const vendors = docs.map((c) => {
      const o = c.toObject();
      const status = o.status || 'NEW';
      return {
        ...o,
        id: `VEN-${String(o._id).slice(-4).toUpperCase()}`,
        docId: o._id.toString(),
        name: o.vendorName,
        fullName: o.fullName || o.vendorName,
        founder: o.founder || '—',
        founderTitle: o.founderTitle || 'Founder',
        registered: fmtDate(c.createdAt),
        email: o.email || '—',
        phone: o.phone || '—',
        trade: (o.trade || (o.services || []).join(' & ') || '—').toUpperCase(),
        location: o.location || '—',
        action: status === 'NEW' ? 'REVIEW' : 'VERIFY',
        highlight: status === 'NEW',
        status,
        submissionDate: fmtDate(c.createdAt),
        submissionTime: c.createdAt
          ? new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() + ' IST'
          : '—',
        workshop: (o.workshop && o.workshop.length) ? o.workshop : [o.location || '—'],
        gstin: o.gstin || o.gstNumber || '—',
        gstinVerified: !!o.gstinVerified,
        msme: o.msme || '—',
        msmeNote: o.msmeNote || 'On record',
        capabilities: (o.capabilities && o.capabilities.length) ? o.capabilities : (o.services && o.services.length ? o.services : ['—']),
        capacityStats: (o.capacityStats && o.capacityStats.length) ? o.capacityStats : ['—'],
        files: o.files || [],
        checklist: (o.checklist && o.checklist.length) ? o.checklist : VENDOR_DEFAULT_CHECKLIST,
        curator: (o.curator && o.curator.name) ? o.curator : { name: u.name || 'Admin', role: u.title || 'Administrator', tier: 'TIER 3: PENDING' },
        remarks: o.remarks || '',
      };
    });

    res.render('admin/vendors', {
      user: req.session.adminUser,
      activePage: 'vendors',
      tabs,
      vendors,
      activeTab,
      q,
      page,
      totalPages,
      totalRegistrations: total,
      currentPage: page,
      showingFrom: total === 0 ? 0 : (page - 1) * perPage + 1,
      showingTo: Math.min(total, page * perPage),
    });
  } catch (err) {
    console.error('Vendors error:', err.message);
    res.status(500).render('admin/vendors', {
      user: req.session.adminUser,
      activePage: 'vendors',
      tabs: [], vendors: [], activeTab: 'all', q: '',
      page: 1, totalPages: 1, totalRegistrations: 0, currentPage: 1, showingFrom: 0, showingTo: 0,
    });
  }
});

router.post('/vendors/:id/status', async (req, res) => {
  const { status, tab } = req.body;
  const messages = {
    'APPROVED': { title: 'Vendor Approved', msg: 'Vendor approved and onboarded to the vendor guild.' },
    'ARCHIVED': { title: 'Registration Declined', msg: 'Vendor registration declined and archived.' },
    'UNDER SCRUTINY': { title: 'Additional Review Requested', msg: 'Sample / audit request logged. Vendor remains under scrutiny.' },
    'NEW': { title: 'Moved to New', msg: 'Vendor moved back to new registrations.' },
  };
  try {
    if (!messages[status]) throw new Error('invalid');
    await Vendor.updateOne({ _id: req.params.id }, { status, read: true });
    req.session.flash = messages[status];
  } catch (err) {
    req.session.flash = { title: 'Update Failed', msg: 'Could not update vendor status.' };
  }
  res.redirect(`/admin/vendors?status=${encodeURIComponent(tab || 'all')}`);
});

router.post('/vendors/:id/checklist', async (req, res) => {
  const { index, checked, tab } = req.body;
  const isAjax = req.get('X-Requested-With') === 'XMLHttpRequest';
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      if (isAjax) return res.status(404).json({ ok: false });
    } else {
      const list = (vendor.checklist && vendor.checklist.length)
        ? vendor.checklist.map((item) => (typeof item.toObject === 'function' ? item.toObject() : { ...item }))
        : VENDOR_DEFAULT_CHECKLIST.map((item) => ({ ...item }));
      const idx = Number(index);
      if (list[idx]) {
        list[idx].checked = checked === 'true' || checked === 'on';
        await Vendor.updateOne({ _id: vendor._id }, { $set: { checklist: list } });
        if (isAjax) return res.json({ ok: true, checked: list[idx].checked });
        req.session.flash = { title: 'Checklist Updated', msg: 'Verification checklist step saved.' };
      } else if (isAjax) {
        return res.status(400).json({ ok: false });
      }
    }
  } catch (err) {
    console.error('Checklist save error:', err);
    if (isAjax) return res.status(500).json({ ok: false, error: err.message });
    req.session.flash = { title: 'Update Failed', msg: 'Could not save checklist.' };
  }
  res.redirect(`/admin/vendors?status=${encodeURIComponent(tab || 'all')}&q=${encodeURIComponent(req.body.q || '')}`);
});

router.post('/vendors/:id/remarks', async (req, res) => {
  const isAjax = req.get('X-Requested-With') === 'XMLHttpRequest';
  try {
    await Vendor.updateOne({ _id: req.params.id }, { remarks: req.body.remarks || '' });
    if (isAjax) return res.json({ ok: true });
    req.session.flash = { title: 'Remarks Saved', msg: 'Curator remarks have been saved.' };
  } catch (err) {
    if (isAjax) return res.status(500).json({ ok: false });
    req.session.flash = { title: 'Update Failed', msg: 'Could not save remarks.' };
  }
  res.redirect(`/admin/vendors?status=${encodeURIComponent(req.body.tab || 'all')}&q=${encodeURIComponent(req.body.q || '')}`);
});

router.get('/settings', (req, res) => {
  res.render('admin/settings', { user: req.session.adminUser, activePage: 'settings' });
});

router.post('/settings/profile', async (req, res) => {
  const { name, title, phone, location } = req.body;
  try {
    if (req.session.adminId) {
      const admin = await Admin.findById(req.session.adminId);
      if (admin) {
        if (name) admin.name = name;
        if (title) admin.title = title;
        if (phone !== undefined) admin.phone = phone;
        if (location) admin.location = location;
        const parts = (admin.name || '').trim().split(/\s+/);
        admin.initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'AD';
        await admin.save();
        req.session.adminUser = { ...req.session.adminUser, ...admin.toObject(), id: admin._id.toString(), password: undefined };
        delete req.session.adminUser.password;
      }
    } else if (req.session.adminUser) {
      if (name) req.session.adminUser.name = name;
      if (title) req.session.adminUser.title = title;
      if (phone) req.session.adminUser.phone = phone;
      if (location) req.session.adminUser.location = location;
      const parts = req.session.adminUser.name.trim().split(/\s+/);
      req.session.adminUser.initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'AD';
    }
    req.session.flash = { title: 'Profile Updated', msg: 'Your profile details have been saved.' };
  } catch (err) {
    console.error('Profile update error:', err.message);
    req.session.flash = { title: 'Update Failed', msg: 'Could not save profile. Please try again.' };
  }
  res.redirect('/admin/settings');
});

router.post('/settings/password', async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!req.session.adminId) {
      req.session.flash = { title: 'Change Failed', msg: 'Password change requires an active database account.' };
      return res.redirect('/admin/settings');
    }
    const admin = await Admin.findById(req.session.adminId);
    if (!admin || !(await admin.comparePassword(currentPassword || ''))) {
      req.session.flash = { title: 'Change Failed', msg: 'Current password is incorrect.' };
      return res.redirect('/admin/settings');
    }
    if (!newPassword || newPassword.length < 8) {
      req.session.flash = { title: 'Change Failed', msg: 'New password must be at least 8 characters.' };
      return res.redirect('/admin/settings');
    }
    if (newPassword !== confirmPassword) {
      req.session.flash = { title: 'Change Failed', msg: 'New passwords do not match.' };
      return res.redirect('/admin/settings');
    }
    admin.password = newPassword;
    await admin.save();
    req.session.flash = { title: 'Password Changed', msg: 'Your password has been updated successfully.' };
  } catch (err) {
    console.error('Password change error:', err.message);
    req.session.flash = { title: 'Change Failed', msg: 'Could not change password. Please try again.' };
  }
  res.redirect('/admin/settings');
});

module.exports = router;
