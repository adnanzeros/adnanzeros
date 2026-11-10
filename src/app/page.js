// FILE: adnanzeros/adnanzeros/src/app/page.js  (home page, purono file replace koro)
import Link from 'next/link';
import ContactForm from './components/ContactForm';
import GitHubStats from './components/GitHubStats';
import Hero from './components/Hero';
import PortfolioEffects from './components/PortfolioEffects';
import PortfolioHeader from './components/PortfolioHeader';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import { getGithubLanguages, getGithubStats } from '../lib/github-stats';
import { getPublicProjects } from '../lib/projects-store';

/* Admin theke project change korle revalidatePath('/') diye sathe sathe update hoy; eita fallback */
export const revalidate = 60;

const profiles = [
  ['GitHub', 'https://github.com/adnanzeros'],
  ['LinkedIn', 'https://www.linkedin.com/in/adnanzeros/'],
  ['Facebook', 'https://www.facebook.com/adnansamidm'],
  ['Instagram', 'https://www.instagram.com/adnanzeros'],
  ['X', 'https://x.com/adnanzerosx'],
  ['TikTok', 'https://www.tiktok.com/@adnanzerosx'],
  ['Reddit', 'https://www.reddit.com/user/adnanzeros/'],
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      '@id': 'https://adnanzeros.vercel.app/#profilepage',
      url: 'https://adnanzeros.vercel.app/',
      name: 'adnanzeros (Adnan Sami) | Web Designer & Frontend Developer, Bangladesh',
      inLanguage: 'en',
      about: { '@id': 'https://adnanzeros.vercel.app/#person' },
      mainEntity: { '@id': 'https://adnanzeros.vercel.app/#person' },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://adnanzeros.vercel.app/#website',
      url: 'https://adnanzeros.vercel.app/',
      name: 'adnanzeros',
      alternateName: ['adnan zeros', 'Adnan Sami'],
      inLanguage: 'en',
      publisher: { '@id': 'https://adnanzeros.vercel.app/#person' },
    },
    {
      '@type': 'Person',
      '@id': 'https://adnanzeros.vercel.app/#person',
      name: 'Adnan Sami',
      alternateName: ['adnanzeros', 'adnan zeros', 'adnanzerosx', 'Adnan Sami'],
      givenName: 'Adnan',
      familyName: 'Sami',
      url: 'https://adnanzeros.vercel.app/',
      image: 'https://adnanzeros.vercel.app/adnan2.webp',
      jobTitle: 'Web Designer and Frontend Developer',
      description:
        'Adnan Sami, also known online as adnanzeros (adnan zeros), is a web designer and frontend developer from Dhaka, Bangladesh.',
      disambiguatingDescription:
        'adnanzeros, adnan zeros and Adnan Sami are the same person: a web designer from Bangladesh.',
      identifier: 'adnanzeros',
      nationality: { '@type': 'Country', name: 'Bangladesh' },
      homeLocation: { '@type': 'Place', name: 'Dhaka, Bangladesh' },
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Web Designer',
        occupationLocation: { '@type': 'Country', name: 'Bangladesh' },
      },
      knowsAbout: [
        'Web design',
        'Frontend development',
        'React',
        'JavaScript',
        'Chrome extensions',
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dhaka',
        addressCountry: 'BD',
      },
      sameAs: profiles.map(([, url]) => url),
    },
  ],
};

export default async function HomePage() {
  const [stats, languages, projectList] = await Promise.all([
    getGithubStats(),
    getGithubLanguages(),
    getPublicProjects(),
  ]);
  const projects = { frontend: [], backend: [], tools: [] };
  projectList.forEach(p => projects[p.category]?.push(p));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div id="bar" aria-hidden="true" />
      <PortfolioHeader />
      <main>
        <Hero />
        <section id="about" className="wrap">
          <h2>About</h2>
          <figure className="quote">
            <span className="qmark" aria-hidden="true">
              &ldquo;
            </span>
            <blockquote>
              <p>Doing something is better than doing nothing.</p>
            </blockquote>
            <figcaption>Adnan Zeros</figcaption>
          </figure>
          <p className="lead">
            I&apos;m Adnan Zeros, also known offline as Adnan Sami : a web
            designer and frontend developer from Dhaka, Bangladesh. I build
            responsive sites and React &amp; Next.js apps, design interfaces,
            and make Chrome extensions that solve small everyday problems. I
            learn by shipping real projects.
          </p>
        </section>
        <TechStack />
        <Projects projects={projects} />
        <GitHubStats stats={stats} languages={languages} />
        <ContactForm />
      </main>
      <footer className="foot">
        <div className="sf-glow" aria-hidden="true" />
        <div className="sf-inner">
          <div className="sf-top">
            <div className="sf-brand">
              <a href="#home" className="brand">
                <img src="/favicon.svg" alt="" width="34" height="34" />
                adnanzeros
              </a>
              <p>
                Web designer &amp; frontend developer from Dhaka, Bangladesh. I
                build simple, fast and slightly delightful things for the web.
              </p>
              <a href="#contact" className="btn solid">
                Let&apos;s work together <span className="arr">&rarr;</span>
              </a>
            </div>

            <nav className="sf-col" aria-label="Page sections">
              <h3>Explore</h3>
              <ul>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#stack">Stack</a>
                </li>
                <li>
                  <a href="#projects">Projects</a>
                </li>
                <li>
                  <a href="#github">GitHub</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
              </ul>
            </nav>

            <div className="sf-col">
              <h3>Find me</h3>
              <div className="sf-social">
                {profiles.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="me noopener">
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="sf-bottom">
            <small>
              &copy; {new Date().getFullYear()} adnanzeros &middot; Adnan Sami
            </small>
            <nav className="sf-legal" aria-label="Footer links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
            </nav>
            <a href="#home" className="sf-up" aria-label="Back to top">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
      <PortfolioEffects />
    </>
  );
}
