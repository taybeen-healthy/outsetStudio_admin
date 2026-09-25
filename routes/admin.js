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
  const projects = [
    { name: 'Rae Hotel Delhi', code: '#OS-DEL-01', client: 'ABC Hospitality', location: 'Civil Lines, Delhi', scale: '6,500 sq.ft', status: 'In Progress', statusClass: 'inprogress', progress: 40, fees: '₹6,00,000', feeStatus: 'DUE SOON', feeClass: 'due' },
    { name: 'Nova Café Mumbai', code: '#OS-BOM-08', client: 'Mehta F&B Group', location: 'Bandra West, Mumbai', scale: '2,100 sq.ft', status: 'In Progress', statusClass: 'inprogress', progress: 70, fees: '₹4,50,000', feeStatus: 'PAID FULL', feeClass: 'paid' },
    { name: 'Urban Retail Gallery', code: '#OS-BLR-14', client: 'Urban Living Co.', location: 'Indiranagar, BLR', scale: '3,400 sq.ft', status: 'Confirmed', statusClass: 'confirmed', progress: 15, fees: '₹3,00,000', feeStatus: 'DUE RETAINER', feeClass: 'due' },
    { name: 'The Work Loft Gurgaon', code: '#OS-DEL-04', client: 'Apex Studio Spaces', location: 'CyberHub, Gurgaon', scale: '8,200 sq.ft', status: 'In Progress', statusClass: 'inprogress', progress: 85, fees: '₹5,00,000', feeStatus: 'DUE TRANCHE', feeClass: 'due' },
    { name: 'Artisanal Store Jaipur', code: '#OS-JAI-02', client: 'Kala Craft Collective', location: 'C-Scheme, Jaipur', scale: '1,800 sq.ft', status: 'In Progress', statusClass: 'inprogress', progress: 35, fees: '₹3,50,000', feeStatus: 'PAID RETAINER', feeClass: 'paid' },
    { name: 'Komorebi Villa Alibaug', code: '#OS-ALI-01', client: 'Nair Heritage Living', location: 'Alibaug Coastal, MH', scale: '5,200 sq.ft', status: 'Completed', statusClass: 'completed', progress: 100, fees: '₹14,00,000', feeStatus: 'SETTLED', feeClass: 'paid' },
    { name: 'Studio Atelier Chandigarh', code: '#OS-IXC-03', client: 'Tricity Media Lab', location: 'Sector 8, Chandigarh', scale: '3,100 sq.ft', status: 'In Progress', statusClass: 'inprogress', progress: 60, fees: '₹2,80,000', feeStatus: 'DUE IN 4 DAYS', feeClass: 'due' },
    { name: 'Saffron Terrace Bangalore', code: '#OS-BLR-21', client: 'Deccan Bistro Ltd', location: 'Lavelle Road, BLR', scale: '4,000 sq.ft', status: 'Confirmed', statusClass: 'confirmed', progress: 10, fees: '₹4,00,000', feeStatus: 'DUE RETAINER', feeClass: 'due' }
  ];
  res.render('admin/projects', { user: req.session.adminUser, projects, activePage: 'projects' });
});

const reviews = [
  {
    id: 1, initials: 'RM', avatar: 'sage',
    name: 'Rohan Malhotra', company: 'ABC Hospitality',
    project: 'Rae Hotel Delhi', typology: 'Boutique Hotel • Delhi',
    text: 'Outset Studio transformed our boutique hotel into a timeless brutalist sanctuary. The balance of raw concrete and warm teak wood exceeded our board\'s expectations.',
    date: '24 Sep 2026', status: 'pending'
  },
  {
    id: 2, initials: 'PN', avatar: 'blush',
    name: 'Priya Nair', company: 'Nair Heritage Living',
    project: 'Komorebi Villa', typology: 'Alibaug Coastal • Residential',
    text: 'Exceptional attention to natural light and local sandstone. The team respected our tight handover schedule while delivering uncompromised detailing.',
    date: '22 Sep 2026', status: 'pending'
  },
  {
    id: 3, initials: 'VS', avatar: 'stone',
    name: 'Vikram Singhania', company: 'Apex Studio Spaces',
    project: 'The Work Loft', typology: 'Gurgaon Workspace • Commercial',
    text: 'A masterclass in acoustic privacy and refined executive interiors. Our tenants constantly compliment the materiality.',
    date: '18 Sep 2026', status: 'pending'
  },
  {
    id: 4, initials: 'TS', avatar: 'blush',
    name: 'Tanya Sharma', company: 'Kala Craft Collective',
    project: 'Artisanal Store', typology: 'Jaipur Flagship • Retail Monograph',
    text: 'Quiet luxury at its finest. They understood our brand heritage deeply and translated it into retail architecture.',
    date: '12 Sep 2026', status: 'approved'
  },
  {
    id: 5, initials: 'KM', avatar: 'sage',
    name: 'Karan Mehta', company: 'Mehta F&B Group',
    project: 'Nova Café', typology: 'Mumbai Coastal • Hospitality',
    text: 'Flawless spatial flow and kitchen ergonomics. Highly recommended for commercial culinary spaces.',
    date: '05 Sep 2026', status: 'approved'
  }
];

router.get('/reviews', (req, res) => {
  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    declined: reviews.filter(r => r.status === 'declined').length
  };

  const toastMessages = {
    approved: 'Review approved. Eligible to appear on public website.',
    declined: 'Review declined. It will not appear on the public website.'
  };

  const toastKey = req.query.toast;
  const toast = {
    title: 'Status Updated',
    msg: toastMessages[toastKey] || toastMessages.approved
  };

  res.render('admin/reviews', { user: req.session.adminUser, reviews, counts, toast, activePage: 'reviews' });
});

router.post('/reviews/:id/status', (req, res) => {
  const status = req.body.status === 'declined' ? 'declined' : 'approved';
  const review = reviews.find(r => r.id === Number(req.params.id));
  if (review) review.status = status;
  res.redirect(`/admin/reviews?toast=${status}`);
});

router.get('/enquiries', (req, res) => {
  const tabs = [
    { key: 'all', label: 'ALL (28)' },
    { key: 'new', label: 'NEW [3]' },
    { key: 'discussion', label: 'IN DISCUSSION (12)' },
    { key: 'confirmed', label: 'CONFIRMED (8)' },
    { key: 'archived', label: 'ARCHIVED (5)' }
  ];

  const enquiries = [
    {
      id: '9042', ref: '#ENG-9042', status: 'NEW',
      name: 'Tanya Sharma', email: 'tanya.sharma@culturecraft.in',
      org: 'CultureCraft Heritage Foundation • Jaipur Chapter',
      service: 'Retail & Art Gallery', scope: 'Scope: 4,500 sq.ft turnkey',
      date: '22 Sep 2026', location: 'Jaipur, Rajasthan',
      typology: 'Retail & Art Gallery', footprint: '4,500 sq.ft', budget: '₹35,00,000',
      brief: 'Protected 19th-century lime-plaster haveli pavilion. Requires specialized conservation-grade MEP conduits and indigenous red sandstone flooring.',
      phone: '+91 98988 44855',
      address: 'C-Scheme, Ashok Nagar, Jaipur, RJ 302001',
      assignee: { initials: 'ER', name: 'Elena Rostova', role: 'Lead Spatial Curator' },
      logged: '22 SEP 2026, 11:42 IST', ip: '14.139.24.81'
    },
    {
      id: '9038', ref: '#ENG-9038', status: 'IN DISCUSSION',
      name: 'Karan Mehta', email: 'karan@mehtahospitality.com',
      org: 'Mehta Hospitality Group • Mumbai',
      service: 'Café Interior Architecture', scope: 'Scope: Adaptive reuse, heritage building',
      date: '19 Sep 2026', location: 'Bandra, Mumbai',
      typology: 'Café Interior Architecture', footprint: '2,100 sq.ft', budget: '₹18,50,000',
      brief: 'Colonial-era warehouse shell with original exposed rafters. Needs a full MEP refresh while retaining the weathered façade and teak trusses.',
      phone: '+91 98200 11245',
      address: 'Carter Road, Bandra West, Mumbai, MH 400050',
      assignee: { initials: 'AM', name: 'Aditi Mehra', role: 'Principal Architect' },
      logged: '19 SEP 2026, 09:15 IST', ip: '103.21.58.14'
    },
    {
      id: '9031', ref: '#ENG-9031', status: 'CONFIRMED',
      name: 'Ananya Sood', email: 'ananya.sood@indiatimes.com',
      org: 'Sood Residences • Bengaluru',
      service: 'Residential Penthouse', scope: 'Scope: Interior architecture + bespoke furniture',
      date: '15 Sep 2026', location: 'Indiranagar, Bengaluru',
      typology: 'Residential Penthouse', footprint: '3,800 sq.ft', budget: '₹28,00,000',
      brief: 'Double-height penthouse shell with a north-facing terrace. Client requests integrated bespoke joinery in walnut and lime-washed walls throughout.',
      phone: '+91 98450 77321',
      address: '100 Ft Road, Indiranagar, Bengaluru, KA 560038',
      assignee: { initials: 'DS', name: 'Devika Sharma', role: 'Interior Lead' },
      logged: '15 SEP 2026, 16:40 IST', ip: '49.36.180.77'
    },
    {
      id: '9027', ref: '#ENG-9027', status: 'CONFIRMED',
      name: 'Raghav Singhania', email: 'raghav@singhaniagroup.in',
      org: 'Singhania Group • Delhi',
      service: 'Boutique Hotel Wing', scope: 'Scope: 12 keys, facade & spatial planning',
      date: '11 Sep 2026', location: 'Civil Lines, Delhi',
      typology: 'Boutique Hotel Wing', footprint: '6,500 sq.ft', budget: '₹52,00,000',
      brief: '1930s bungalow conversion into a 12-key boutique wing. Conservation constraints apply to the lime-washed boundary walls and original jaali screens.',
      phone: '+91 98110 22456',
      address: 'Amsterdam House, Civil Lines, Delhi 110006',
      assignee: { initials: 'ER', name: 'Elena Rostova', role: 'Lead Spatial Curator' },
      logged: '11 SEP 2026, 12:05 IST', ip: '14.139.72.190'
    },
    {
      id: '9019', ref: '#ENG-9019', status: 'ARCHIVED',
      name: 'Priya Nair', email: 'priya@alibaugliving.in',
      org: 'Alibaug Living Pvt. Ltd.',
      service: 'Coastal Villa Retreat', scope: 'Scope: Architecture & landscape turnkey',
      date: '04 Sep 2026', location: 'Alibaug, Maharashtra',
      typology: 'Coastal Villa Retreat', footprint: '5,200 sq.ft', budget: '₹64,00,000',
      brief: 'Monsoon-exposed coastal plot with mature palm cover. Requires raised plinth detailing, laterite retaining walls and a salt-tolerant landscape strategy.',
      phone: '+91 98330 55678',
      address: 'Kihim Beach Road, Alibaug, MH 402201',
      assignee: { initials: 'NK', name: 'Nikhil Kulkarni', role: 'Landscape Director' },
      logged: '04 SEP 2026, 10:22 IST', ip: '117.198.44.63'
    },
    {
      id: '9008', ref: '#ENG-9008', status: 'NEW',
      name: 'Devendra Rathore', email: 'devendra@rajasthanheritage.in',
      org: 'Rajasthan Heritage Craft Trust',
      service: 'Heritage Haveli Pavilion', scope: 'Scope: Courtyard restoration + stone carving',
      date: '28 Aug 2026', location: 'Udaipur, Rajasthan',
      typology: 'Heritage Haveli Pavilion', footprint: '7,400 sq.ft', budget: '₹41,00,000',
      brief: 'Degraded courtyard pavilion with carved sandstone columns. Restoration must follow conservation-grade protocols and source matching Rajnagar stone.',
      phone: '+91 94140 33129',
      address: 'Gangaur Ghat Marg, Udaipur, RJ 313001',
      assignee: { initials: 'SV', name: 'Sanjana Verma', role: 'Conservation Architect' },
      logged: '28 AUG 2026, 15:48 IST', ip: '45.112.190.28'
    }
  ];

  const activeTab = req.query.status || 'new';
  const selected = enquiries.find(e => e.id === req.query.id) || enquiries[0];

  res.render('admin/enquiries', {
    user: req.session.adminUser,
    activePage: 'enquiries',
    tabs,
    enquiries,
    selected,
    activeTab
  });
});

router.get('/vendors', (req, res) => {
  const tabs = [
    { id: 'all', label: 'All', count: 42, active: true },
    { id: 'new', label: 'New', count: 6, badge: true },
    { id: 'verification', label: 'Under Verification', count: 8 },
    { id: 'approved', label: 'Approved', count: 24 },
    { id: 'archived', label: 'Archived', count: 4 }
  ];

  const vendors = [
    {
      id: 'VEN-4082',
      name: 'Jaipur Heritage Crafts',
      fullName: 'Jaipur Heritage Crafts & Stone',
      founder: 'Maheshwar Sharma',
      founderTitle: 'Master Artisan & Founder',
      registered: '24 Sep 2026',
      email: 'trade@jaipurstonecraft.in',
      phone: '+91 98290 11442',
      trade: 'LIME PLASTER & STONE',
      location: 'Jaipur, Rajasthan',
      action: 'REVIEW',
      highlight: true,
      status: 'UNDER SCRUTINY',
      submissionDate: '24 Sep 2026',
      submissionTime: '10:30 AM IST',
      workshop: ['RIICO Ind. Area, Mansaravar', 'Jaipur, Rajasthan 302020'],
      gstin: '08AAACJ4921IMZ5',
      gstinVerified: true,
      msme: 'UDYAM-RJ-17-004921Z2',
      msmeNote: 'Valid to 2028',
      capabilities: ['Traditional Slaked Lime (Chuna) Arish', 'Hand-carved Sandstone Jali', 'Heritage Structural Restoration', 'Basalt & Travertine Masonry'],
      capacityStats: ['35 Guild Artisans', '12,000 sq. ft Yard', '4 Kilns'],
      files: [
        { name: 'Stone_Craft_', size: '14.2 MB Dossier', icon: 'fa-file-lines' },
        { name: 'Material_Test_Repc', size: '3.8 MB Lab Certificate', icon: 'fa-flask' }
      ],
      checklist: [
        { title: 'Business & Tax Identity Authenticated', desc: 'Active GSTIN, PAN matching Ministry records.', checked: true },
        { title: 'Material Provenance & Quarry Source', desc: 'Bansi Pahar & Dholpur quarry certificates valid.', checked: false },
        { title: 'Quality Audit of Past Heritage Restorations', desc: 'Verified on-site work at Mandawa Haveli restoration.', checked: false },
        { title: 'Worksite Safety & Guild Fair-Wage Compliance', desc: 'Artisan insurance declaration awaiting sign-off.', checked: false }
      ],
      curator: { name: 'Elena Vance', role: 'Principal Director • Delhi HQ Admin', tier: 'TIER 1: PREFERRED' },
      remarks: 'Passed sample masonry inspections in Jaipur. Aarish plaster samples verified by Studio Materials Lab on 25 Sep 2026.'
    },
    {
      id: 'VEN-4079',
      name: 'Moradabad Brass & Guild',
      fullName: 'Moradabad Brass & Guild Works',
      founder: 'Anwar Qureshi',
      founderTitle: 'Master Founder & Guild Head',
      registered: '21 Sep 2026',
      email: 'anwar@mbadbrasswork.com',
      phone: '+91 94120 78219',
      trade: 'BRASS & METAL FABRICATION',
      location: 'Moradabad, UP',
      action: 'VERIFY',
      status: 'UNDER SCRUTINY',
      submissionDate: '21 Sep 2026',
      submissionTime: '02:15 PM IST',
      workshop: ['Rustam Nagar Industrial Belt', 'Moradabad, Uttar Pradesh 244001'],
      gstin: '09AABCM7845K1Z9',
      gstinVerified: true,
      msme: 'UDYAM-UP-23-0078412',
      msmeNote: 'Valid to 2028',
      capabilities: ['Lost-wax Brass Casting', 'Hand Beaten Metal Cladding', 'Decorative Iron & Brass Inlay', 'Antique Metal Restoration'],
      capacityStats: ['62 Guild Artisans', '18,000 sq. ft Yard', '6 Furnaces'],
      files: [
        { name: 'Brass_Guild_Dossier', size: '11.6 MB Dossier', icon: 'fa-file-lines' },
        { name: 'Metal_Test_Report', size: '2.9 MB Lab Certificate', icon: 'fa-flask' }
      ],
      checklist: [
        { title: 'Business & Tax Identity Authenticated', desc: 'Active GSTIN, PAN matching Ministry records.', checked: true },
        { title: 'Material Provenance & Alloy Source', desc: 'Certified brass ingot suppliers verified.', checked: false },
        { title: 'Quality Audit of Past Commissions', desc: 'Reference installations pending site audit.', checked: false },
        { title: 'Worksite Safety & Guild Fair-Wage Compliance', desc: 'Artisan insurance declaration awaiting sign-off.', checked: false }
      ],
      curator: { name: 'Elena Vance', role: 'Principal Director • Delhi HQ Admin', tier: 'TIER 2: VERIFIED' },
      remarks: 'Initial document pack received. Awaiting physical sample submission to Studio Materials Lab.'
    },
    {
      id: 'VEN-4075',
      name: 'Deodar Timber & Joinery',
      fullName: 'Deodar Timber & Joinery Works',
      founder: 'Tenzing Dorjee',
      founderTitle: 'Principal Joiner & Founder',
      registered: '19 Sep 2026',
      email: 'projects@deodarjoinery.in',
      phone: '+91 97361 44520',
      trade: 'ARCHITECTURAL MILLWORK',
      location: 'Dehradun / Delhi',
      action: 'VERIFY',
      status: 'UNDER SCRUTINY',
      submissionDate: '19 Sep 2026',
      submissionTime: '11:45 AM IST',
      workshop: ['Rajpur Road Millwork Cluster', 'Dehradun, Uttarakhand 248009'],
      gstin: '05AAKCD9217L1ZP',
      gstinVerified: true,
      msme: 'UDYAM-UK-04-0031876',
      msmeNote: 'Valid to 2027',
      capabilities: ['Architectural Door & Window Millwork', 'Precision Panel Joinery', 'Heritage Timber Repair', 'Custom Furniture Fabrication'],
      capacityStats: ['48 Artisans', '9,500 sq. ft Workshop', '3 Kilns'],
      files: [
        { name: 'Timber_Joinery_Dossier', size: '9.8 MB Dossier', icon: 'fa-file-lines' },
        { name: 'Moisture_Test_Report', size: '2.1 MB Lab Certificate', icon: 'fa-flask' }
      ],
      checklist: [
        { title: 'Business & Tax Identity Authenticated', desc: 'Active GSTIN, PAN matching Ministry records.', checked: true },
        { title: 'Timber Provenance & FSC Source', desc: 'Sourced teak & deodar chain-of-custody pending.', checked: false },
        { title: 'Quality Audit of Past Joinery Works', desc: 'Two reference sites queued for inspection.', checked: false },
        { title: 'Worksite Safety & Guild Fair-Wage Compliance', desc: 'Artisan insurance declaration awaiting sign-off.', checked: false }
      ],
      curator: { name: 'Elena Vance', role: 'Principal Director • Delhi HQ Admin', tier: 'TIER 2: VERIFIED' },
      remarks: 'Millwork drawings portfolio received. Physical joinery samples requested for lab verification.'
    },
    {
      id: 'VEN-4071',
      name: 'Terra Cotta Atelier Delhi',
      fullName: 'Terra Cotta Atelier Delhi',
      founder: 'Suhasini Sen',
      founderTitle: 'Ceramic Artist & Founder',
      registered: '18 Sep 2026',
      email: 'atelier@senpottery.co',
      phone: '+91 98110 33901',
      trade: 'HERITAGE TERRAZZO & TILE',
      location: 'Delhi NCR',
      action: 'VERIFY',
      status: 'UNDER SCRUTINY',
      submissionDate: '18 Sep 2026',
      submissionTime: '04:05 PM IST',
      workshop: ['Okhla Phase III Craft Cluster', 'New Delhi, Delhi 110020'],
      gstin: '07AASFS6634R1ZK',
      gstinVerified: true,
      msme: 'UDYAM-DL-02-0056119',
      msmeNote: 'Valid to 2028',
      capabilities: ['Handmade Heritage Terrazzo', 'Glazed Terracotta Tile', 'Mosaic Inlay Flooring', 'Custom Clay Facade Elements'],
      capacityStats: ['24 Artisans', '7,200 sq. ft Yard', '2 Kilns'],
      files: [
        { name: 'Terrazzo_Atelier_Dossier', size: '8.4 MB Dossier', icon: 'fa-file-lines' },
        { name: 'Tile_Flex_Test_Report', size: '1.9 MB Lab Certificate', icon: 'fa-flask' }
      ],
      checklist: [
        { title: 'Business & Tax Identity Authenticated', desc: 'Active GSTIN, PAN matching Ministry records.', checked: true },
        { title: 'Aggregate & Pigment Provenance', desc: 'Marble chip suppliers under review.', checked: false },
        { title: 'Quality Audit of Past Installations', desc: 'Three reference floors pending verification.', checked: false },
        { title: 'Worksite Safety & Guild Fair-Wage Compliance', desc: 'Artisan insurance declaration awaiting sign-off.', checked: false }
      ],
      curator: { name: 'Elena Vance', role: 'Principal Director • Delhi HQ Admin', tier: 'TIER 2: VERIFIED' },
      remarks: 'Tile sample kit received at Delhi HQ. Flexural strength test scheduled with Studio Materials Lab.'
    },
    {
      id: 'VEN-4066',
      name: 'Apex Façade & Glazing',
      fullName: 'Apex Façade & Glazing Pvt Ltd',
      founder: 'Vikramaditya Rao',
      founderTitle: 'Founder & Head of Engineering',
      registered: '15 Sep 2026',
      email: 'engg@apexglazing.com',
      phone: '+91 98201 55940',
      trade: 'ACOUSTIC & GLAZING',
      location: 'Mumbai, MH',
      action: 'REVIEW',
      highlight: false,
      status: 'UNDER SCRUTINY',
      submissionDate: '15 Sep 2026',
      submissionTime: '09:50 AM IST',
      workshop: ['Andheri East Industrial Estate', 'Mumbai, Maharashtra 400093'],
      gstin: '27AAHCA8821M1ZQ',
      gstinVerified: true,
      msme: 'UDYAM-MH-23-0112845',
      msmeNote: 'Valid to 2028',
      capabilities: ['Structural Glazing Systems', 'Acoustic Glass Partitioning', 'Unitized Façade Modules', 'Bird-safe & Solar Glass Retrofit'],
      capacityStats: ['85 Engineers', '22,000 sq. ft Plant', '5 CNC Lines'],
      files: [
        { name: 'Facade_Glazing_Dossier', size: '16.1 MB Dossier', icon: 'fa-file-lines' },
        { name: 'Acoustic_Test_Certificate', size: '4.2 MB Lab Certificate', icon: 'fa-flask' }
      ],
      checklist: [
        { title: 'Business & Tax Identity Authenticated', desc: 'Active GSTIN, PAN matching Ministry records.', checked: true },
        { title: 'Glass & Profile Provenance', desc: 'Float glass supplier audit in progress.', checked: false },
        { title: 'Quality Audit of Past Façades', desc: 'Two tower references scheduled for inspection.', checked: false },
        { title: 'Worksite Safety & Guild Fair-Wage Compliance', desc: 'Worker safety dossier awaiting sign-off.', checked: false }
      ],
      curator: { name: 'Elena Vance', role: 'Principal Director • Delhi HQ Admin', tier: 'TIER 1: PREFERRED' },
      remarks: 'Engineering dossier and acoustic test certificates received. On-site audit of Andheri plant proposed.'
    },
    {
      id: 'VEN-4060',
      name: 'Marwar Marbles & Granite',
      fullName: 'Marwar Marbles & Granite Co.',
      founder: 'Bhanwar Singh',
      founderTitle: 'Quarry Owner & Managing Partner',
      registered: '12 Sep 2026',
      email: 'quarry@marwarmarble.in',
      phone: '+91 94141 88302',
      trade: 'ARCHITECTURAL MASONRY',
      location: 'Jodhpur, Rajasthan',
      action: 'VERIFY',
      status: 'UNDER SCRUTINY',
      submissionDate: '12 Sep 2026',
      submissionTime: '01:20 PM IST',
      workshop: ['Madanganj Quarry Belt', 'Jodhpur, Rajasthan 342015'],
      gstin: '08AAFCM5512N1ZT',
      gstinVerified: true,
      msme: 'UDYAM-RJ-19-0067304',
      msmeNote: 'Valid to 2027',
      capabilities: ['Dholpur Sandstone Blocks', 'Marble Slab Processing', 'CNC Stone Cutting', 'Heritage Masonry Restoration'],
      capacityStats: ['54 Artisans', '40,000 sq. ft Yard', '2 Saw Lines'],
      files: [
        { name: 'Marwar_Masonry_Dossier', size: '12.7 MB Dossier', icon: 'fa-file-lines' },
        { name: 'Stone_Compression_Report', size: '3.1 MB Lab Certificate', icon: 'fa-flask' }
      ],
      checklist: [
        { title: 'Business & Tax Identity Authenticated', desc: 'Active GSTIN, PAN matching Ministry records.', checked: true },
        { title: 'Quarry Lease & Provenance Source', desc: 'Lease documents under legal review.', checked: false },
        { title: 'Quality Audit of Past Masonry Works', desc: 'Reference haveli project pending inspection.', checked: false },
        { title: 'Worksite Safety & Guild Fair-Wage Compliance', desc: 'Artisan insurance declaration awaiting sign-off.', checked: false }
      ],
      curator: { name: 'Elena Vance', role: 'Principal Director • Delhi HQ Admin', tier: 'TIER 2: VERIFIED' },
      remarks: 'Quarry documentation received. Compression test samples dispatched to Studio Materials Lab.'
    }
  ];

  res.render('admin/vendors', {
    user: req.session.adminUser,
    activePage: 'vendors',
    tabs,
    vendors,
    showingFrom: 1,
    showingTo: 6,
    totalRegistrations: 42,
    currentPage: 1,
    totalPages: 3
  });
});

router.get('/settings', (req, res) => {
  res.render('admin/settings', { user: req.session.adminUser, activePage: 'settings' });
});

router.post('/settings/profile', (req, res) => {
  const { name, title, phone, location } = req.body;
  if (req.session.adminUser) {
    if (name) req.session.adminUser.name = name;
    if (location) req.session.adminUser.location = location;
    if (title) req.session.adminUser.title = title;
    if (phone) req.session.adminUser.phone = phone;
    const parts = req.session.adminUser.name.trim().split(/\s+/);
    req.session.adminUser.initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'AD';
  }
  res.redirect('/admin/settings');
});

router.post('/settings/password', (req, res) => {
  res.redirect('/admin/settings');
});

module.exports = router;
