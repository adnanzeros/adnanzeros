# Next.js setup

## Run locally

Requirements: Node.js 22.x and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. For a production build, run `npm run build`, then
`npm run start`.

## Environment variables

Set these in `.env.local` for local development and in the deployment platform
for hosted deployments:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key used to send contact form messages. |
| `CONTACT_TO` | Inbox that receives contact messages. |
| `CONTACT_FROM` | Optional sender address; verify its domain in Resend. |
| `SITE_URL` | Optional public origin used by the CV PDF renderer. |
| `CHROME_PATH` | Optional local Chrome/Edge executable path for CV PDF generation. |

`CONTACT_FROM` defaults to Resend's `Portfolio <onboarding@resend.dev>` sender.
With that default, Resend only delivers to the address registered to your
Resend account. To send to another inbox, verify a domain and set
`CONTACT_FROM`. `SITE_URL` defaults to the local Next.js origin or the Vercel
deployment URL when available. On Windows, `CHROME_PATH` can be set to a path
such as `C:\Program Files\Google\Chrome\Application\chrome.exe`.

Never put a real key in `.env.example` or commit `.env.local`.

## Deploy

Import the repository into Vercel using the Next.js framework preset. Use
`npm run build` as the build command and configure the environment variables
above in the Vercel project settings before deploying.

## GitHub profile statistics

The daily workflow writes `public/profile/stats.svg` and
`public/profile/top-langs.svg`. Those files power the website's GitHub cards
and language chart. To run it manually, open **Actions → Update GitHub Profile
Stats → Run workflow**. Repository Actions permissions must allow workflow
write access.
