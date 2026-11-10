'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '../components/Toast';

const FILE_NAME = 'Adnan-Sami-CV';

const ICONS = {
  mail: 'M3 5h18v14H3z M3 5l9 8 9-8',
  phone:
    'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  github:
    'M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  linkedin:
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  globe:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z',
};

function Icon({ name }) {
  return (
    <svg
      className="cv-icon"
      viewBox="0 0 24 24"
      width="11"
      height="11"
      fill="none"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

const ROLE = 'Junior Frontend & Backend Developer (React.js, Next.js)';

// Row 1: personal contact | Row 2: professional profiles
const CONTACT_ROWS = [
  [
    {
      icon: 'mail',
      value: 'asadnanzeros@gmail.com',
      href: 'mailto:asadnanzeros@gmail.com',
    },
    { icon: 'phone', value: '+880 1580 327310', href: 'tel:+8801580327310' },
    { icon: 'pin', value: 'Faridpur, Bangladesh' },
  ],
  [
    {
      icon: 'github',
      value: 'github.com/adnanzeros',
      href: 'https://github.com/adnanzeros',
    },
    {
      icon: 'linkedin',
      value: 'linkedin.com/in/adnanzeros',
      href: 'https://www.linkedin.com/in/adnanzeros/',
    },
    {
      icon: 'globe',
      value: 'adnanzeros.vercel.app',
      href: 'https://adnanzeros.vercel.app/',
    },
  ],
];

const OBJECTIVE =
  'Junior frontend and backend developer who wants to build MVPs and problem-solving SaaS products that make people’s online lives easier. I focus on real user needs and clean, practical code. I am eager to grow with a team where I can create real impact.';

const SKILLS = [
  ['Programming', 'HTML5, CSS3, JavaScript, TypeScript'],
  [
    'Frontend',
    'React.js, Next.js, React Native, React Router, Vite, Tailwind CSS, GSAP',
  ],
  ['Backend & Services', 'Node.js, Express.js, MongoDB, Firebase, Resend'],
  ['Tools', 'Git, GitHub, npm, VS Code, Figma'],
  ['Soft Skills', 'Problem Solving, Communication, Teamwork, Time Management'],
];

const PROJECTS = [
  {
    title: 'StudioSpace',
    stack: 'Next.js, MongoDB, Authentication',
    overview:
      'A website where people can find creative studios, and studio owners can list their spaces and manage bookings.',
    live: 'https://studiospace-sooty.vercel.app/',
    repository: 'https://github.com/adnanzeros/studiospace',
    features: [
      'Search, filter, and sort studio listings',
      'Studio owners can add, edit, and manage their listings',
      'Users can request a booking, and hosts can confirm or decline it',
      'Stops double booking for the same studio',
    ],
  },
  {
    title: 'Adnan Zeros: Developer Portfolio',
    stack: 'Next.js, React, GSAP, Resend',
    overview:
      'My personal website where I show my projects, skills, and contact details.',
    live: 'https://adnanzeros.vercel.app/',
    repository: 'https://github.com/adnanzeros/adnanzeros',
    features: [
      'Responsive layout with a project filter',
      'Scroll animations and interactive 3D-style cards',
      'Contact form that sends messages to my email',
      'GitHub stats and project details',
    ],
  },
];

const EDUCATION = {
  title:
    'Higher Secondary Certificate (HSC), Government Yasin College, Faridpur',
  date: '2024',
};

const TRAINING = {
  title: 'Full Stack Web Engineering, Programming Hero (Batch 14)',
  date: 'Ongoing',
};

const LANGUAGES = 'Bengali (Native), English (Intermediate)';

const stripProtocol = url => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

// PDF text uses a standard font, so swap curly quotes for plain ones
const pdfText = text => text.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');

/**
 * Builds the CV as a real text PDF (selectable text, clickable links)
 * and downloads it directly. No print dialog, no server needed.
 */
async function buildAndDownloadPdf() {
  // Loaded only on click, so it never runs during server rendering
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const MARGIN = 44;
  const maxW = pageW - MARGIN * 2;
  const BLUE = [11, 58, 143];
  let y = MARGIN;

  const font = (style, size) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };
  const lineH = size => size * 1.38;
  const ensure = height => {
    if (y + height > pageH - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Wrapped paragraph
  const paragraph = (text, size = 9.5, style = 'normal', indent = 0) => {
    font(style, size);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(pdfText(text), maxW - indent);
    lines.forEach(line => {
      ensure(lineH(size));
      doc.text(line, MARGIN + indent, y + size);
      y += lineH(size);
    });
  };

  // "Label: value" where the label is bold
  const labelLine = (label, value, size = 9.5) => {
    font('bold', size);
    const labelW = doc.getTextWidth(`${label}: `);
    font('normal', size);
    const lines = doc.splitTextToSize(pdfText(value), maxW - labelW - 2);
    lines.forEach((line, i) => {
      ensure(lineH(size));
      if (i === 0) {
        font('bold', size);
        doc.text(`${label}:`, MARGIN, y + size);
        font('normal', size);
        doc.text(line, MARGIN + labelW, y + size);
      } else {
        font('normal', size);
        doc.text(line, MARGIN + labelW, y + size);
      }
      y += lineH(size);
    });
  };

  // Section heading with underline
  const heading = title => {
    ensure(30);
    y += 9;
    font('bold', 10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(title.toUpperCase(), MARGIN, y + 10.5);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.7);
    doc.line(MARGIN, y + 15, pageW - MARGIN, y + 15);
    y += 21;
  };

  // A row of clickable items: [{ label?, text, url? }]
  const linkRow = (items, size = 9) => {
    ensure(lineH(size));
    let x = MARGIN;
    items.forEach(item => {
      if (item.label) {
        font('bold', size);
        doc.setTextColor(0, 0, 0);
        doc.text(item.label, x, y + size);
        x += doc.getTextWidth(item.label) + 3;
      }
      font('normal', size);
      if (item.url) {
        doc.setTextColor(...BLUE);
        doc.textWithLink(item.text, x, y + size, { url: item.url });
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(0.4);
        const w = doc.getTextWidth(item.text);
        doc.line(x, y + size + 1.5, x + w, y + size + 1.5);
      } else {
        doc.setTextColor(0, 0, 0);
        doc.text(item.text, x, y + size);
      }
      x += doc.getTextWidth(item.text) + 18;
    });
    doc.setTextColor(0, 0, 0);
    y += lineH(size);
  };

  // Title on the left, date on the right
  const titleDateRow = (title, date) => {
    font('bold', 10);
    const lines = doc.splitTextToSize(pdfText(title), maxW - 70);
    lines.forEach((line, i) => {
      ensure(lineH(10));
      doc.setTextColor(0, 0, 0);
      font('bold', 10);
      doc.text(line, MARGIN, y + 10);
      if (i === 0) {
        font('normal', 9);
        doc.text(date, pageW - MARGIN, y + 10, { align: 'right' });
      }
      y += lineH(10);
    });
  };

  // ---------- Header ----------
  font('bold', 25);
  doc.setTextColor(0, 0, 0);
  doc.text('Adnan Sami', MARGIN, y + 25);
  y += 31;

  paragraph(ROLE, 11.5, 'bold');
  y += 4;

  CONTACT_ROWS.forEach(row => {
    linkRow(
      row.map(item => ({ text: item.value, url: item.href })),
      9.5,
    );
  });

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y + 3, pageW - MARGIN, y + 3);
  y += 4;

  // ---------- Career Objective ----------
  heading('Career Objective');
  paragraph(OBJECTIVE);

  // ---------- Skills ----------
  heading('Skills');
  SKILLS.forEach(([label, value]) => labelLine(label, value));

  // ---------- Projects ----------
  heading('Projects');
  PROJECTS.forEach(project => {
    ensure(70);
    paragraph(project.title, 10.5, 'bold');
    labelLine('Tech', project.stack, 9.5);
    paragraph(project.overview);
    project.features.forEach(feature => {
      font('normal', 9.5);
      const lines = doc.splitTextToSize(pdfText(feature), maxW - 16);
      lines.forEach((line, i) => {
        ensure(lineH(9.5));
        if (i === 0) doc.text('\u2022', MARGIN + 5, y + 9.5);
        doc.text(line, MARGIN + 16, y + 9.5);
        y += lineH(9.5);
      });
    });
    linkRow([
      { label: 'Live:', text: stripProtocol(project.live), url: project.live },
      {
        label: 'GitHub:',
        text: stripProtocol(project.repository),
        url: project.repository,
      },
    ]);
    y += 5;
  });

  // ---------- Education / Training / Languages ----------
  heading('Education');
  titleDateRow(EDUCATION.title, EDUCATION.date);

  heading('Additional Training');
  titleDateRow(TRAINING.title, TRAINING.date);

  heading('Languages');
  paragraph(LANGUAGES);

  doc.setProperties({
    title: 'Adnan Sami - CV',
    author: 'Adnan Sami',
  });

  // Direct download, no dialog
  doc.save(`${FILE_NAME}.pdf`);
}

const styles = `
  .cv-page { min-height: 100vh; padding: 28px 16px 56px; background: #f3f4f6; color: #000; }
  .cv-toolbar { max-width: 850px; margin: 0 auto 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .cv-toolbar a { color: #111; text-decoration: none; font-weight: 600; }
  .cv-actions { display: flex; gap: 8px; }
  .cv-button { border: 1px solid #222; background: #fff; color: #111; border-radius: 6px; padding: 9px 13px; font: inherit; font-size: 13px; cursor: pointer; }
  .cv-button.primary { background: #111; color: #fff; }
  .cv-button:disabled { opacity: .6; cursor: wait; }

  /* ---------- CV sheet (screen) ---------- */
  .cv-sheet { box-sizing: border-box; width: 100%; max-width: 850px; margin: 0 auto; padding: 34px 44px; background: #fff; border: 0 !important; box-shadow: 0 5px 28px rgba(0,0,0,.10); font-family: Arial, Helvetica, sans-serif !important; font-size: 10pt; line-height: 1.35; color: #000; }
  .cv-sheet * { font-family: Arial, Helvetica, sans-serif !important; box-sizing: border-box; }
  .cv-sheet *::before, .cv-sheet *::after { content: none !important; display: none !important; }

  .cv-sheet .cv-name { margin: 0; padding: 0; font-size: 24pt; line-height: 1.1; font-weight: 700; color: #000; background: none; letter-spacing: 0; text-transform: none; }
  .cv-sheet .cv-role { margin: 3px 0 8px; font-size: 11pt; font-weight: 600; color: #000; }

  .cv-contact { padding-bottom: 8px; border-bottom: 1px solid #000; font-size: 9pt; }
  .cv-contact-row { display: flex; flex-wrap: wrap; gap: 3px 16px; margin: 2px 0; }
  .cv-contact-item { display: inline-flex; align-items: center; gap: 5px; }
  .cv-icon { flex: none; }
  .cv-sheet a { color: #0b3a8f; text-decoration: underline; overflow-wrap: anywhere; }

  .cv-section { margin-top: 11px; }
  .cv-sheet .cv-section h2 { margin: 0 0 4px; padding: 0 0 2px; border: 0; border-bottom: 1px solid #000; background: none; color: #000; font-size: 10.5pt; line-height: 1.2; font-weight: 700; text-transform: uppercase; letter-spacing: .35px; }
  .cv-section p { margin: 2px 0; }
  .cv-skill { margin: 1px 0; }
  .cv-project { margin: 6px 0 9px; break-inside: avoid; }
  .cv-sheet .cv-project h3 { margin: 0; font-size: 10pt; font-weight: 700; color: #000; }
  .cv-stack { margin: 1px 0 2px; font-size: 9pt; }
  .cv-project ul { margin: 2px 0 3px 16px; padding: 0; list-style: disc; }
  .cv-project li { margin: 0; }
  .cv-links { display: flex; flex-wrap: wrap; gap: 2px 16px; font-size: 9pt; }
  .cv-edu-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 2px 0; }
  .cv-sheet .cv-edu-row h3 { margin: 0; font-size: 10pt; font-weight: 700; color: #000; }
  .cv-date { font-size: 9pt; white-space: nowrap; }

  @media (max-width: 600px) {
    .cv-page { padding: 14px 8px 32px; }
    .cv-toolbar { align-items: flex-start; flex-direction: column; }
    .cv-sheet { padding: 22px 18px; font-size: 9.5pt; }
    .cv-sheet .cv-name { font-size: 21pt; }
  }

  /* ---------- Print: full A4 page ---------- */
  @page { size: A4; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; height: auto !important; min-height: 0 !important; }
    .cv-page { padding: 0 !important; min-height: 0 !important; height: auto !important; background: #fff !important; }
    .cv-toolbar { display: none !important; }

    .cv-sheet {
      width: 210mm !important;
      max-width: none !important;
      height: 296mm !important;
      min-height: 296mm !important;
      margin: 0 !important;
      padding: 15mm 17mm !important;
      box-shadow: none !important;
      border: 0 !important;
      font-size: 10.8pt !important;
      line-height: 1.45 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    .cv-sheet header, .cv-sheet .cv-section { margin-top: 0 !important; }
    .cv-sheet .cv-name { font-size: 27pt !important; }
    .cv-sheet .cv-role { font-size: 12pt !important; margin: 4px 0 10px !important; }
    .cv-contact { font-size: 10pt !important; padding-bottom: 10px !important; }
    .cv-sheet .cv-section h2 { font-size: 11.5pt !important; margin-bottom: 6px !important; padding-bottom: 3px !important; }
    .cv-stack, .cv-links, .cv-date { font-size: 10pt !important; }
    .cv-project { margin: 7px 0 10px !important; }
    .cv-skill { margin: 2px 0 !important; }
    .cv-project li { margin: 1px 0 !important; }

    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

export default function CvPageClient() {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  async function downloadCv() {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading('Preparing your CV…', {
      description: 'Creating the PDF. This takes a moment.',
    });

    try {
      await buildAndDownloadPdf();

      toast.success('CV downloaded', {
        id: toastId,
        description: `${FILE_NAME}.pdf is saved to your downloads.`,
      });
    } catch (error) {
      console.error('CV PDF error:', error);
      toast.info('Download failed', {
        id: toastId,
        description: 'Could not create the PDF. Please try again.',
        duration: 7000,
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <main className="cv-page">
        <nav className="cv-toolbar" aria-label="CV actions">
          <Link href="/">← Back to portfolio</Link>
          <div className="cv-actions">
            <button
              className="cv-button primary"
              type="button"
              onClick={downloadCv}
              disabled={downloading}
            >
              {downloading ? 'Preparing PDF…' : 'Download CV (PDF)'}
            </button>
            <button
              className="cv-button"
              type="button"
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        </nav>

        <article
          className="cv-sheet"
          aria-label="Curriculum vitae of Adnan Sami"
        >
          <header>
            <h1 className="cv-name">Adnan Sami</h1>
            <p className="cv-role">{ROLE}</p>
            <div className="cv-contact">
              {CONTACT_ROWS.map((row, i) => (
                <div className="cv-contact-row" key={i}>
                  {row.map(item => (
                    <span className="cv-contact-item" key={item.value}>
                      <Icon name={item.icon} />
                      {item.href ? (
                        <a href={item.href}>{item.value}</a>
                      ) : (
                        <span>{item.value}</span>
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </header>

          <section className="cv-section">
            <h2>Career Objective</h2>
            <p>{OBJECTIVE}</p>
          </section>

          <section className="cv-section">
            <h2>Skills</h2>
            {SKILLS.map(([label, value]) => (
              <div className="cv-skill" key={label}>
                <strong>{label}:</strong> {value}
              </div>
            ))}
          </section>

          <section className="cv-section">
            <h2>Projects</h2>
            {PROJECTS.map(project => (
              <div className="cv-project" key={project.title}>
                <h3>{project.title}</h3>
                <p className="cv-stack">
                  <strong>Tech:</strong> {project.stack}
                </p>
                <p>{project.overview}</p>
                <ul>
                  {project.features.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <div className="cv-links">
                  <span>
                    <strong>Live:</strong>{' '}
                    <a href={project.live} target="_blank" rel="noreferrer">
                      {stripProtocol(project.live)}
                    </a>
                  </span>
                  <span>
                    <strong>GitHub:</strong>{' '}
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {stripProtocol(project.repository)}
                    </a>
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="cv-section">
            <h2>Education</h2>
            <div className="cv-edu-row">
              <h3>{EDUCATION.title}</h3>
              <span className="cv-date">{EDUCATION.date}</span>
            </div>
          </section>

          <section className="cv-section">
            <h2>Additional Training</h2>
            <div className="cv-edu-row">
              <h3>{TRAINING.title}</h3>
              <span className="cv-date">{TRAINING.date}</span>
            </div>
          </section>

          <section className="cv-section">
            <h2>Languages</h2>
            <p>{LANGUAGES}</p>
          </section>
        </article>
      </main>
    </>
  );
}
