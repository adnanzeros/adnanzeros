import LegalPage from '../components/LegalPage';

const UPDATED = 'November 8, 2026';

export const metadata = {
  title: 'Privacy Policy | adnanzeros (Adnan Sami)',
  description:
    'How adnanzeros.vercel.app, the portfolio of Adnan Sami (adnanzeros), handles contact form data, analytics and third-party services.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const mail = <a href="mailto:asadnanzeros@gmail.com">asadnanzeros@gmail.com</a>;

const sections = [
  {
    title: '1. Who runs this website',
    body: (
      <p>
        This website (adnanzeros.vercel.app) is the personal portfolio of{' '}
        <strong>Adnan Sami</strong>, also known online as{' '}
        <strong>adnanzeros</strong>, based in Bangladesh. In this policy,
        &ldquo;I&rdquo;, &ldquo;me&rdquo; and &ldquo;my&rdquo; mean Adnan Sami.
        You can contact me at {mail}.
      </p>
    ),
  },
  {
    title: '2. What information I collect',
    body: (
      <>
        <p>
          <strong>Contact form.</strong> If you use the contact form, I receive
          exactly what you type in it:
        </p>
        <ul>
          <li>your name</li>
          <li>your email address</li>
          <li>your WhatsApp number (country code and number)</li>
          <li>your message</li>
        </ul>
        <p>
          The form also has a hidden spam-trap field. It is empty for real
          visitors and is not used to identify anyone.
        </p>
        <p>
          <strong>Usage data.</strong> The site uses Vercel Analytics to see
          basic, aggregated information such as page views, referrers, device
          and browser type, and approximate country. According to Vercel, this
          is designed to work without tracking you across other websites.
        </p>
        <p>
          <strong>Server logs.</strong> My hosting provider (Vercel) may keep
          standard technical logs such as IP address, request time and user
          agent for security and reliability.
        </p>
        <p>
          I do not ask for sensitive information (such as passwords, payment
          details or government IDs) and I do not have user accounts or logins
          on this site. Please do not put that kind of information in your
          message.
        </p>
      </>
    ),
  },
  {
    title: '3. How I use it',
    body: (
      <ul>
        <li>To read and reply to your message (by email or WhatsApp).</li>
        <li>To discuss a project, job or collaboration you ask about.</li>
        <li>To prevent spam and abuse of the contact form.</li>
        <li>
          To understand which pages are visited so I can improve the site.
        </li>
      </ul>
    ),
  },
  {
    title: '4. Who else handles your data',
    body: (
      <>
        <p>
          I do not sell your personal information. I use these services to run
          the site:
        </p>
        <ul>
          <li>
            <strong>Vercel</strong> hosts the website and provides analytics.
          </li>
          <li>
            <strong>Resend</strong> delivers your contact form message to my
            email inbox.
          </li>
          <li>
            <strong>Google Fonts</strong> serves the fonts used on the site, so
            your browser connects to Google when the page loads.
          </li>
          <li>
            <strong>flagcdn.com</strong> serves country flag images in the phone
            country picker of the contact form.
          </li>
          <li>
            <strong>GitHub</strong> is the source of the public repository
            statistics shown on the site. No visitor data is sent for this.
          </li>
        </ul>
        <p>
          These providers have their own privacy policies, and they may process
          technical data such as your IP address when your browser connects to
          them.
        </p>
      </>
    ),
  },
  {
    title: '5. Cookies and local storage',
    body: (
      <p>
        I do not use advertising or tracking cookies. The site may keep a small
        value in your browser&apos;s session storage (for example, to remember
        that the intro animation has already played in this visit). This stays
        on your device and is cleared when you close the tab.
      </p>
    ),
  },
  {
    title: '6. How long I keep it',
    body: (
      <p>
        Messages sent through the form are kept in my email inbox only as long
        as needed to reply and to keep a record of the conversation, and then
        deleted when they are no longer useful. I do not store contact form
        submissions in a separate database on this website.
      </p>
    ),
  },
  {
    title: '7. Security',
    body: (
      <p>
        The site is served over HTTPS and the form checks and limits input
        before sending it. No method of transmission over the internet is
        perfectly secure, so I cannot guarantee absolute security.
      </p>
    ),
  },
  {
    title: '8. Your choices',
    body: (
      <>
        <p>You can email {mail} at any time to:</p>
        <ul>
          <li>ask what message or details of yours I have;</li>
          <li>ask me to correct or delete them;</li>
          <li>ask me to stop contacting you.</li>
        </ul>
        <p>
          I will respond as soon as I reasonably can. You can also block
          analytics and third-party requests using your browser settings or
          extensions; the site will still work.
        </p>
      </>
    ),
  },
  {
    title: '9. Children',
    body: (
      <p>
        This site is not directed at children under 13, and I do not knowingly
        collect their personal information. If you believe a child has sent me
        their details, email me and I will delete them.
      </p>
    ),
  },
  {
    title: '10. Links to other websites',
    body: (
      <p>
        The site links to my social profiles and project pages (for example
        GitHub, LinkedIn, Instagram, X and others). I am not responsible for the
        privacy practices of those websites.
      </p>
    ),
  },
  {
    title: '11. Changes to this policy',
    body: (
      <p>
        If I change how the site handles data, I will update this page and the
        &ldquo;Last updated&rdquo; date above. Continued use of the site after a
        change means you accept the updated policy.
      </p>
    ),
  },
  {
    title: '12. Contact',
    body: (
      <p>
        Questions about this policy: Adnan Sami (adnanzeros), Bangladesh, {mail}
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy Policy"
      updated={UPDATED}
      intro="This policy explains what information this portfolio website collects, why, and what choices you have. In short: I only collect what you choose to send me through the contact form, plus basic anonymous visit statistics."
      sections={sections}
    />
  );
}
