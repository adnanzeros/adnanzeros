# adnanzeros portfolio

## Run locally
Install the existing dependencies, then run the Next.js App Router app:

    npm install
    npm run dev        ->  http://localhost:3000

Use Node.js 22.x, as declared in `package.json`. The original static site and
local API server are still present and can be run separately with
`node server.js` (stop the Next.js server first if both use port 3000).
The migrated app serves its preserved static assets from `public/`; the
original files remain in the repository root. The original page is available
as `/legacy.html` when running Next.js.

The original Resend and Puppeteer handlers are reused through the new
`/api/next/contact` and `/api/next/cv` routes. The original `/api/contact` and
`/api/cv` handlers are unchanged. The CV download route needs Chrome/Edge
locally (set `CHROME_PATH` in `.env.local` if it is not found). The existing
Vercel config is unchanged; `next.config.mjs` adds the supported
`outputFileTracingIncludes` rule for the new Next.js PDF route so Chromium's
binary files are traced into its deployment bundle.

GitHub language ring-chart values are read from the generated
`profile/top-langs.svg`; the existing stats cards remain. This project did not
have a shadcn/Tailwind setup, so the chart is a dependency-free SVG component
rather than the shadcn registry component.

## Contact form (Resend)
Keys live in `.env.local` (git-ignored):

    RESEND_API_KEY=re_xxx
    CONTACT_TO=asadnanzeros@gmail.com

The form collects name, email, WhatsApp number (country code dropdown, Bangladesh default, 194 countries) and message.
Mail is sent from `onboarding@resend.dev`. With that sender, Resend only delivers to the email you
registered your Resend account with. To send to any inbox, verify your own domain at resend.com/domains
and change `from` in `api/contact.js`.
If sending fails locally, the exact Resend error is shown under the form and in the terminal.

## Deploy (GitHub + Vercel)
1. `git init && git add . && git commit -m "portfolio"`; push to a GitHub repo.
2. Import the repo in Vercel and use the Next.js framework preset and the default
   Next.js build command (`npm run build`). Keep the existing `vercel.json`;
   its headers and original `/api/cv` function configuration are still needed.
3. Environment Variables: RESEND_API_KEY and CONTACT_TO. Then Deploy.
4. Changed env vars later? Deployments > Redeploy.

## One repo = website + GitHub profile
Repo name must be exactly `adnanzeros`. Push this whole folder to it.
- Root `README.md` = GitHub profile. Vercel deploys the same repo as the website.
- `.github/workflows/stats.yml` writes `profile/stats.svg` and `profile/top-langs.svg` daily.
  README and website both read those local files.
- Add `profile/gitprofile.png` and `profile/timematess.png` yourself (VS Code).
- First run: Actions > Update GitHub Profile Stats > Run workflow.
  Settings > Actions > General > Workflow permissions: Read and write.

## Contact form on Vercel: checklist
1. Vercel > Project > Settings > Environment Variables: `RESEND_API_KEY` (paste the key only, no spaces/quotes) and
   `CONTACT_TO`. Enable Production, Preview and Development. Then Deployments > Redeploy.
2. With the default sender `onboarding@resend.dev`, Resend delivers ONLY to the email your Resend account was
   created with. `CONTACT_TO` must be that email. To send anywhere, verify a domain at resend.com/domains and set
   `CONTACT_FROM` (example: `Portfolio <hello@yourdomain.com>`).
3. Failing in production? Vercel > Project > Logs, filter `/api/contact` to see the exact Resend error.
4. Never put the real key in `.env.example` (it is committed). Real key lives only in `.env.local` and Vercel.
