/* ============================================================
   CONFIG.JS — Global Site Configuration & Dynamic Customization
   ============================================================ */

const SITE = {
  /* ── PERSONAL INFO ── */
  name:        'Qaswar Sarfraz',
  nameFirst:   'Qaswar',
  nameLast:    'Sarfraz',
  title:       'Mobile Application & AI Integration Engineer',
  email:       'qaswarsofttec@gmail.com',
  location:    'Islamabad, Pakistan',
  locationSub: 'Available Worldwide · Remote & Relocation',
  available:   'Active for Roles',

  /* ── SOCIAL & PROFESSIONAL LINKS ── */
  links: {
    linkedin: 'https://linkedin.com/in/qaswar-sarfraz-051111313',
    github:   'https://github.com/QaswarSarfrazcodes',
    fiverr:   'https://www.fiverr.com/s/gDerbGL',
    email:    'mailto:qaswarsofttec@gmail.com',
  },

  /* ── RESUME PATH ── */
  resumePdf: 'resume/Qaswar_Sarfraz_Resume.pdf',

  /* ── CONTACT FORM GATEWAY (Web3Forms API) ── */
  web3formsKey: '68781ac7-4208-4aee-8b70-bb20e4694812',

  /* ── DYNAMIC TYPEWRITER PHRASES ── */
  typewriter: {
    phrases: [
      'Flutter & Dart Engineer',
      'Mobile AI Systems Architect',
      'Supabase & Cloud Builder',
      'CSOFT Systems Mobile Developer'
    ],
    speed:       55,   /* ms per character type */
    deleteSpeed: 28,   /* ms per character delete */
    pauseAfter:  2200, /* ms pause after full phrase */
    pauseBefore: 300,  /* ms pause before typing next */
  },

  /* ── CORE METRICS ── */
  stats: [
    { value: 11,   label: 'Certifications', suffix: ' Verified' },
    { value: 1,    label: 'Flagship AI App', suffix: ' (Tripline)' },
    { value: 7,    label: 'Semester NUML',   suffix: 'th' },
    { value: 2026, label: 'Available',       suffix: ' Worldwide' },
  ],
};
