# PDT App — Deployment Guide
**Stack: Next.js → Supabase (free) → Vercel (free)**

---

## Step 1 — Create your Supabase project

1. Go to **https://supabase.com** → Sign up (free)
2. Click **New Project**
   - Name: `pdt-app`
   - Database password: choose a strong password and save it
   - Region: choose nearest to you
3. Wait ~2 minutes for the project to provision

---

## Step 2 — Run the database schema

1. In Supabase dashboard → **SQL Editor** → **New Query**
2. Open the file `supabase/schema.sql` from this project
3. Paste the entire contents → click **Run**
4. You should see: *Success. No rows returned.*

---

## Step 3 — Get your API keys

In Supabase dashboard → **Project Settings** → **API**:

- Copy **Project URL** → e.g. `https://abcdef.supabase.co`
- Copy **anon / public** key → long JWT string

---

## Step 4 — Set up the project locally

```bash
# In the pdt-app folder:
npm install

# Copy the example env file
cp .env.local.example .env.local
```

Edit `.env.local` and paste your keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Run locally to test:
```bash
npm run dev
# Open http://localhost:3000
```

---

## Step 5 — Push to GitHub

1. Create a new **private** repository on GitHub (https://github.com/new)
2. In the `pdt-app` folder:

```bash
git init
git add .
git commit -m "Initial PDT app"
git remote add origin https://github.com/YOUR_USERNAME/pdt-app.git
git push -u origin main
```

---

## Step 6 — Deploy to Vercel (free)

1. Go to **https://vercel.com** → Sign up with your GitHub account
2. Click **Add New Project** → Import your `pdt-app` repository
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**

Vercel will build and deploy. In ~60 seconds you'll get a live URL like:
`https://pdt-app-yourname.vercel.app`

Every time you push to GitHub, Vercel auto-redeploys. Free forever for this scale.

---

## Step 7 — First login

1. Open your Vercel URL
2. Click **Sign Up** → enter your email, password, name, and role
3. You'll be taken to the Dashboard
4. Click **+ New Project** to create your first project
5. The 9 development stages will be created automatically
6. Click into any stage to see the checklist

---

## User roles to test

Create multiple accounts with different roles to test the full workflow:

| Role | What they can do |
|------|-----------------|
| `developer` | Tick Dev checklist items, sign Step 1 |
| `team_head` | Sign Step 2 (unlocks PDT review) |
| `pdt_head` | Tick PDT checklist items, approve/reject stage |

Sign in with each role to test the stage gating and sign-off flow.

---

## Free tier limits

| Service | Free limit |
|---------|-----------|
| Supabase | 500 MB database, 1 GB storage, 50K MAU |
| Vercel | 100 GB bandwidth/month, unlimited deployments |

More than enough for your team size. No credit card required on either.
