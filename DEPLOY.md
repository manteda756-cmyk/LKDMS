# Deployment Guide — Vercel + Supabase

## Step 1: Set up Supabase

1. Go to https://supabase.com and create a free account
2. Click **New Project**, give it a name (e.g. `ethiopia-file-index`), set a database password
3. Wait for the project to be ready (~1 minute)

### Run the SQL schema

4. In your Supabase dashboard go to **SQL Editor → New Query**
5. Copy the entire contents of `client/supabase_schema.sql` and paste it in, then click **Run**
6. This creates all tables, views, seeds departments + files + the admin user

### Create Storage bucket

7. Go to **Storage** in the sidebar → **New Bucket**
8. Name it exactly: `file-attachments`
9. Keep it **Private** (not public)
10. Click **Create bucket**

### Get your API keys

11. Go to **Settings → API**
12. Copy:
    - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
    - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Push the `client/` folder to a GitHub repo  
   *(or the whole DMS folder — Vercel will detect the Next.js app)*
3. In Vercel click **Add New Project → Import Git Repository**
4. Set **Root Directory** to `client`
5. Under **Environment Variables** add all four:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role key) |
| `JWT_SECRET` | any long random string |

6. Click **Deploy** — done in ~60 seconds

---

## Step 3: Verify

Visit your Vercel URL:
- `/` — public dashboard with files and departments
- `/admin/login` — log in with `admin` / `Admin@1234`
- `/api/health` — should return `{"status":"ok"}`

**Change the admin password immediately after first login** via Admin → Users.

---

## Architecture

```
Browser
  │
  ├── Next.js pages (Vercel CDN)
  │     Dashboard, Files, Departments, Admin
  │
  └── Next.js API routes (Vercel Serverless)
        /api/files        → Supabase PostgreSQL
        /api/departments  → Supabase PostgreSQL
        /api/users        → Supabase PostgreSQL
        /api/auth         → JWT authentication
        /api/files/[id]/download → Supabase Storage signed URL
```

## Local development (after setup)

Add your Supabase keys to `client/.env.local`, then:

```
cd client
npm run dev
```

Visit http://localhost:3000
