/* ============================================================
   CONFIG.JS — ✏️  ALL CUSTOMIZATION HERE
   Change text, links, EmailJS keys, typewriter phrases, colors
   ============================================================ */

const SITE = {
  /* ── PERSONAL INFO ── */
  name:        'Qaswar Sarfraz',
  nameFirst:   'Qaswar',
  nameLast:    'Sarfraz',
  title:       'Flutter Developer & AI Engineer',
  email:       'qaswarsofttec@gmail.com',
  location:    'Islamabad, Pakistan',
  locationSub: 'Remote worldwide',
  available:   'July 2026',

  /* ── SOCIAL LINKS ── */
  links: {
    linkedin: 'https://linkedin.com/in/qaswar-sarfraz-051111313',
    github:   'https://github.com/QaswarSarfrazcodes',
    fiverr:   'https://www.fiverr.com/s/gDerbGL',
    email:    'mailto:qaswarsofttec@gmail.com',
  },

  /* ── RESUME ── ✏️ Replace with your actual resume PDF path */
  resumePdf: 'resume/Qaswar_Sarfraz_Resume.pdf',

  /* ── EMAIL & FORM SERVICES ── */
  web3formsKey: '68781ac7-4208-4aee-8b70-bb20e4694812',
  emailjs: {
    publicKey:  'YOUR_EMAILJS_PUBLIC_KEY',
    serviceId:  'YOUR_EMAILJS_SERVICE_ID',
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  },

  /* ── TYPEWRITER PHRASES ── */
  typewriter: {
    phrases: [
      'Flutter Developer',
      'AI App Builder',
      'Mobile Engineer',
    ],
    speed:       80,   /* ms per character type */
    deleteSpeed: 40,   /* ms per character delete */
    pauseAfter:  2200, /* ms pause after full phrase */
    pauseBefore: 300,  /* ms pause before typing next */
  },

  /* ── STATS (about section) ── */
  stats: [
    { value: 3,    label: 'Projects',       suffix: '' },
    { value: 11,   label: 'Certifications', suffix: '' },
    { value: 7,    label: 'Semester',       suffix: 'th' },
    { value: 2026, label: 'Available',       suffix: '' },
  ],
};
