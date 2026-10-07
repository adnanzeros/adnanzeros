# adnanzeros portfolio

## Run locally
    npm run dev        ->  http://localhost:3000
Needs Node 18 or newer. No `npm install` required (zero dependencies).
Put your photo at `assets/adnan.png`.

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
2. vercel.com > Add New > Project > import the repo. Framework: Other. No build command.
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
