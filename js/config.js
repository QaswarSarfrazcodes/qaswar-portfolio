/* ═══════════════════════════════════════════════════════════════════
   CONFIG — single source of truth for identity, links and copy that
   appears in more than one place. Loaded before main.js.
   ═══════════════════════════════════════════════════════════════════ */

window.SITE = {
  /* ── IDENTITY ── */
  name:      'Qaswar Sarfraz',
  firstName: 'Qaswar',
  lastName:  'Sarfraz',
  title:     'Mobile Application & AI Integration Engineer',
  email:     'qaswarsofttec@gmail.com',
  location:  'Islamabad, Pakistan',
  employer:  'CSOFT Systems',
  university: 'NUML Islamabad',

  /* ── LINKS ── */
  links: {
    linkedin: 'https://linkedin.com/in/qaswar-sarfraz-051111313',
    github:   'https://github.com/QaswarSarfrazcodes',
    fiverr:   'https://www.fiverr.com/s/gDerbGL',
    email:    'mailto:qaswarsofttec@gmail.com',
    resume:   'resume/Qaswar_Sarfraz_Resume.pdf'
  },

  /* ── CONTACT GATEWAY ──
     Public by design: Web3Forms access keys are safe to expose,
     they only permit posting to this form's own endpoint. */
  web3formsKey: '68781ac7-4208-4aee-8b70-bb20e4694812',

  /* ── HERO ROLE CYCLE ── */
  typewriter: {
    phrases: [
      'Flutter & Dart Engineer',
      'AI Integration Specialist',
      'Supabase & Postgres Builder',
      'Mobile Developer @ CSOFT Systems'
    ],
    speed: 62,
    deleteSpeed: 26,
    pauseAfter: 2100,
    pauseBefore: 380
  }
};
