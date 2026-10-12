# Personalized Gifting Website (PRD v1.0)

React + Vite + React Router, Supabase (Postgres, Auth, Edge Functions). No customer accounts.
Design follows the PRD palette plus the apple-design skill (emilkowalski/skills): instant press feedback, spring-style easing,
translucent nav, direction-consistent step transitions, size-specific tracking, reduced-motion/transparency/contrast support.

## Setup
1. `npm install`, copy `.env.example` to `.env`, fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only).
2. Run `supabase/migrations/001_schema.sql` in your Supabase project.
3. Create a staff user in Supabase Auth, then: `insert into admin_profiles(user_id,full_name,role) values ('<auth user id>','Name','admin');`
4. Deploy the function: `supabase functions deploy submit-request`, then set secrets:
   `supabase secrets set SITE_ORIGIN=https://your-domain RESEND_API_KEY=... EMAIL_FROM=... ADMIN_EMAIL=...`
   (the service-role key is injected by Supabase and never reaches the browser).
5. `npm run dev`.

## Not built yet
Admin dashboard counts, portfolio/FAQ/messages/settings managers, image upload, WhatsApp automation (logged as not_configured),
rate limiting/spam protection, retries, analytics, tests, real brand name and legal copy. RLS must be tested with anon and staff users before launch.

## Push and host on Vercel
1. `git init && git add . && git commit -m "Initial commit"`, create an empty GitHub repo, then `git remote add origin <repo-url> && git branch -M main && git push -u origin main`.
2. In Vercel: Add New → Project → import the repo. Vite is detected; `vercel.json` handles the build and the single-page-app routing.
3. Add environment variables (Project → Settings → Environment Variables), then redeploy:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only, never the service-role key).
4. In Supabase → Authentication → URL Configuration, set the Site URL to your Vercel domain and add it to Redirect URLs.
5. Set the Edge Function secret `SITE_ORIGIN` to the same domain so the function only accepts requests from your site.
