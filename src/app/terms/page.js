import LegalPage from '../components/LegalPage';

const UPDATED = 'November 8, 2026';

export const metadata = {
  title: 'Terms of Use | adnanzeros (Adnan Sami)',
  description:
    'Terms of use for adnanzeros.vercel.app, the portfolio website of Adnan Sami (adnanzeros).',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

const mail = <a href="mailto:asadnanzeros@gmail.com">asadnanzeros@gmail.com</a>;

const sections = [
  {
    title: '1. Acceptance of these terms',
    body: (
      <p>
        By visiting or using adnanzeros.vercel.app (the &ldquo;Site&rdquo;), you
        agree to these Terms of Use and to the{' '}
        <a href="/privacy">Privacy Policy</a>. If you do not agree, please do
        not use the Site.
      </p>
    ),
  },
  {
    title: '2. About the Site',
    body: (
      <p>
        The Site is the personal portfolio of <strong>Adnan Sami</strong>{' '}
        (adnanzeros), a web designer and frontend developer from Bangladesh. It
        shows my work, skills, CV and a way to contact me. It is not an online
        store and does not sell products or services directly.
      </p>
    ),
  },
  {
    title: '3. Intellectual property',
    body: (
      <>
        <p>
          Unless stated otherwise, the design, text, graphics, logo, code and
          other content on the Site are created by me and are protected by
          copyright. You may view the Site and share links to it. You may not
          copy, republish or sell my content or designs without written
          permission.
        </p>
        <p>
          Names and logos of third-party technologies, tools and companies shown
          on the Site (for example React, Next.js, GitHub, Vercel and others)
          belong to their respective owners and are used only to describe the
          tools I work with. Open-source code on my GitHub profile is governed
          by the license in each repository.
        </p>
      </>
    ),
  },
  {
    title: '4. Acceptable use',
    body: (
      <>
        <p>When using the Site and its contact form, you agree not to:</p>
        <ul>
          <li>send spam, advertising, scams, malware or illegal content;</li>
          <li>harass, threaten or abuse me or anyone else;</li>
          <li>
            submit someone else&apos;s personal data without their permission;
          </li>
          <li>
            try to break, overload, scrape at harmful volume or gain
            unauthorized access to the Site or its servers;
          </li>
          <li>use the Site in any way that breaks the law.</li>
        </ul>
        <p>
          I may ignore or block messages and visitors that break these rules.
        </p>
      </>
    ),
  },
  {
    title: '5. Contacting me and project work',
    body: (
      <p>
        Sending a message through the contact form does not create a contract,
        employment or client relationship. Any paid work, scope, price and
        timeline will only be agreed separately in writing (for example by
        email) before work begins. I may not be able to reply to every message.
      </p>
    ),
  },
  {
    title: '6. Information on the Site',
    body: (
      <p>
        I try to keep the information about my projects, skills and CV accurate,
        but it may be incomplete or out of date. Statistics such as GitHub
        activity are shown for general information and may be delayed.
      </p>
    ),
  },
  {
    title: '7. Third-party links and services',
    body: (
      <p>
        The Site links to other websites and uses third-party services. I do not
        control them and am not responsible for their content, availability or
        policies. Using them is at your own risk and under their own terms.
      </p>
    ),
  },
  {
    title: '8. Disclaimer of warranties',
    body: (
      <p>
        The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
        without warranties of any kind. I do not promise that the Site will
        always be available, error-free or free of harmful components.
      </p>
    ),
  },
  {
    title: '9. Limitation of liability',
    body: (
      <p>
        To the fullest extent allowed by law, I am not liable for any indirect,
        incidental or consequential loss arising from your use of, or inability
        to use, the Site or from relying on its content. Nothing in these terms
        limits any liability that cannot be limited by law.
      </p>
    ),
  },
  {
    title: '10. Changes to the Site or these terms',
    body: (
      <p>
        I may change, suspend or remove parts of the Site, and may update these
        terms at any time. The updated version applies from the date shown at
        the top of this page. Continuing to use the Site means you accept the
        updated terms.
      </p>
    ),
  },
  {
    title: '11. Governing law',
    body: (
      <p>
        These terms are governed by the laws of Bangladesh. Any dispute will be
        handled in the courts of Bangladesh, unless the law of your country
        requires otherwise.
      </p>
    ),
  },
  {
    title: '12. Contact',
    body: (
      <p>
        Questions about these terms: Adnan Sami (adnanzeros), Bangladesh, {mail}
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of Use"
      updated={UPDATED}
      intro="These terms explain the simple rules for using this portfolio website. Please read them before using the Site or sending a message."
      sections={sections}
    />
  );
}
