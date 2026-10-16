import ContactForm from "./components/ContactForm";
import GitHubStats from "./components/GitHubStats";
import Hero from "./components/Hero";
import PortfolioEffects from "./components/PortfolioEffects";
import PortfolioHeader from "./components/PortfolioHeader";
import Projects from "./components/Projects";
import TechStack from "./components/TechStack";
import { getGithubLanguages, getGithubStats } from "../lib/github-stats";

const profiles = [
  ["GitHub", "https://github.com/adnanzeros"],
  ["LinkedIn", "https://www.linkedin.com/in/adnanzeros/"],
  ["Facebook", "https://www.facebook.com/adnansamidm"],
  ["Instagram", "https://www.instagram.com/adnanzeros"],
  ["X", "https://x.com/adnanzerosx"],
  ["TikTok", "https://www.tiktok.com/@adnanzerosx"],
  ["Reddit", "https://www.reddit.com/user/adnanzeros/"],
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": "https://adnanzeros.vercel.app/#profilepage",
      url: "https://adnanzeros.vercel.app/",
      name: "adnanzeros (Adnan Sami) | Web Designer & Frontend Developer, Bangladesh",
      inLanguage: "en",
      about: { "@id": "https://adnanzeros.vercel.app/#person" },
      mainEntity: { "@id": "https://adnanzeros.vercel.app/#person" },
    },
    {
      "@type": "WebSite",
      "@id": "https://adnanzeros.vercel.app/#website",
      url: "https://adnanzeros.vercel.app/",
      name: "adnanzeros",
      alternateName: ["adnan zeros", "Adnan Sami"],
      inLanguage: "en",
      publisher: { "@id": "https://adnanzeros.vercel.app/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://adnanzeros.vercel.app/#person",
      name: "Adnan Sami",
      alternateName: ["adnanzeros", "adnan zeros", "adnanzerosx", "Adnan Sami"],
      givenName: "Adnan",
      familyName: "Sami",
      url: "https://adnanzeros.vercel.app/",
      image: "https://adnanzeros.vercel.app/adnan2.webp",
      jobTitle: "Web Designer and Frontend Developer",
      description:
        "Adnan Sami, also known online as adnanzeros (adnan zeros), is a web designer and frontend developer from Dhaka, Bangladesh.",
      disambiguatingDescription:
        "adnanzeros, adnan zeros and Adnan Sami are the same person: a web designer from Bangladesh.",
      identifier: "adnanzeros",
      nationality: { "@type": "Country", name: "Bangladesh" },
      homeLocation: { "@type": "Place", name: "Dhaka, Bangladesh" },
      hasOccupation: {
        "@type": "Occupation",
        name: "Web Designer",
        occupationLocation: { "@type": "Country", name: "Bangladesh" },
      },
      knowsAbout: [
        "Web design",
        "Frontend development",
        "React",
        "JavaScript",
        "Chrome extensions",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressCountry: "BD",
      },
      sameAs: profiles.map(([, url]) => url),
    },
  ],
};

export default async function HomePage() {
  const [stats, languages] = await Promise.all([
    getGithubStats(),
    getGithubLanguages(),
  ]);

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
        <Projects />
        <GitHubStats stats={stats} languages={languages} />
        <ContactForm />
      </main>
      <footer className="foot">
        <a href="#home" className="brand">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          adnanzeros
        </a>
        <p>Adnan Sami · Dhaka, Bangladesh</p>
        <div className="social">
          {profiles.map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="me noopener">
              {name}
            </a>
          ))}
        </div>
        <small>© {new Date().getFullYear()} adnanzeros</small>
      </footer>
      <PortfolioEffects />
    </>
  );
}
