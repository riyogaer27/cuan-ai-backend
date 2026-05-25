# 📹 CUAN AI PRO - Video-Style Deployment Guide

**Watch this like a video tutorial but in text form!**

---

# 🟢 PART 1: SUPABASE SETUP (Watch this first)

## [SCENE 1] Go to Supabase

**What you'll see:**
```
┌─────────────────────────────────────────┐
│                                         │
│  https://supabase.com                   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ SUPABASE                        │    │
│  │ The Open Source Firebase        │    │
│  │                                 │    │
│  │ [Sign Up]  [Sign In]            │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Action:** Click [Sign Up]

---

## [SCENE 2] Sign Up Page

**What you'll see:**
```
┌─────────────────────────────────────────┐
│ Create Account                          │
│                                         │
│ [Sign up with GitHub]                   │
│ [Sign up with Google]                   │
│ [Email]                                 │
│                                         │
│ Email: _______________                  │
│ Password: _______________               │
│                                         │
│ [Sign Up]                               │
└─────────────────────────────────────────┘
```

**Action:** 
- Choose GitHub (easiest)
- Or fill email & password
- Click Sign Up
- Verify email

---

## [SCENE 3] Verify Email

**What you'll see:**
```
Check your email!
We sent you a verification link.
Click the link to confirm your email.
```

**Action:**
- Go to email inbox
- Click verification link
- Come back to Supabase

---

## [SCENE 4] Dashboard

**What you'll see after login:**
```
┌─────────────────────────────────────────┐
│ Dashboard          User: yourname ▼     │
│                                         │
│ Your Projects                           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [+ New Project]                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ (no projects yet)                       │
│                                         │
└─────────────────────────────────────────┘
```

**Action:** Click [+ New Project]

---

## [SCENE 5] Create Project Form

**What you'll see:**
```
┌──────────────────────────────────────────┐
│ Create a new project                     │
│                                          │
│ Organization*                            │
│ ○ Create new organization                │
│ [Organization Name]_________________     │
│                                          │
│ Project Name*                            │
│ [cuan-ai]_________________________       │
│                                          │
│ Database Password*                       │
│ [••••••••••••••••]_________________     │
│ ✓ Generate a password                    │
│                                          │
│ Region*                                  │
│ ▼ Singapore (Southeast Asia)              │
│                                          │
│ Pricing Plan                             │
│ ○ Free (perfect for learning)             │
│                                          │
│ [Create new project]                     │
└──────────────────────────────────────────┘
```

**Action:**
1. Organization: "My Company" (atau create new)
2. Project Name: "cuan-ai"
3. Password: Click "Generate" button
4. Region: Singapore (atau dekat Indonesia)
5. Pricing: Free (selected by default)
6. Click [Create new project]

**IMPORTANT:** SAVE password di notes! Nanti perlu!

---

## [SCENE 6] Creating Database (WAIT!)

**What you'll see:**
```
Creating your database...

⏳ Setting up infrastructure
⏳ Initializing database
⏳ Configuring security

This takes 2-3 minutes...
Please don't refresh the page.
```

**Action:** WAIT! Go get coffee ☕

**After ~3 minutes:**
```
✅ Project created successfully!
Redirecting to dashboard...
```

---

## [SCENE 7] Project Dashboard

**What you'll see:**
```
┌───────────────────────────────────────────┐
│ cuan-ai (Your project)                    │
│                                           │
│ Sidebar:                                  │
│ • Editor                                  │
│ • SQL Editor          ← Click this!       │
│ • Tables                                  │
│ • Functions                               │
│ • RLS Policies                            │
│ • Database Webhooks                       │
│ • Settings                                │
│                                           │
│ Main content:                             │
│ Tables view (empty for now)               │
│                                           │
└───────────────────────────────────────────┘
```

**Action:** Click "SQL Editor" di sidebar

---

## [SCENE 8] SQL Editor

**What you'll see:**
```
┌────────────────────────────────────────────┐
│ SQL Editor                                 │
│                                            │
│ ┌──────────────────────────────────────────┐│
│ │ [+ New Query]                            ││
│ └──────────────────────────────────────────┘│
│                                            │
│ ┌──────────────────────────────────────────┐│
│ │ SELECT * FROM ... (empty initially)      ││
│ │                                          ││
│ │                                          ││
│ │ [RUN] button (blue)                      ││
│ └──────────────────────────────────────────┘│
│                                            │
└────────────────────────────────────────────┘
```

**Action:**
1. Click in the query area
2. Clear everything (Ctrl+A, Delete)
3. Paste the SQL schema (from file: supabase-schema.sql)
4. Click [RUN] button

---

## [SCENE 9] Running SQL

**What you'll see:**
```
Running query...

Status: Executing
```

**After ~10 seconds:**
```
✅ Success

Output:
CREATE TABLE
CREATE INDEX
CREATE TABLE
...

Tables created: 4
```

**Action:** ✅ Done! Celebrate!

---

## [SCENE 10] Verify Tables Created

**Action:**
1. Click "Tables" di sidebar
2. Should see:
   - ✅ products
   - ✅ notifications  
   - ✅ push_subscriptions
   - ✅ analytics

```
Tables List:
├── ✅ analytics
├── ✅ notifications
├── ✅ products
└── ✅ push_subscriptions
```

---

## [SCENE 11] Get API Keys

**Action:** Click "Settings" di sidebar

```
Settings
├── Project Settings
├── API
├── Database
├── Auth
└── ...
```

**Click:** API

**What you'll see:**
```
┌──────────────────────────────────────────┐
│ PROJECT URL                              │
│ https://YOUR_PROJECT.supabase.co         │ ← COPY!
│                                          │
│ ANON PUBLIC KEY                          │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← COPY!
│                                          │
│ SERVICE_ROLE KEY (SECRET!)               │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ (don't share!)
└──────────────────────────────────────────┘
```

**Action:**
1. Copy PROJECT URL
2. Copy ANON PUBLIC KEY
3. Save di text file:

```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ SUPABASE SETUP DONE!**

---

---

# 🔵 PART 2: NETLIFY DEPLOYMENT

## [SCENE 1] Go to GitHub

**Action:** Go to https://github.com

```
GitHub Homepage

[Sign up] [Sign in]
```

**If no account:** Sign up (free)
**If have account:** Sign in

---

## [SCENE 2] Create New Repository

**Action:**
1. Click "+" icon (top right)
2. Select "New repository"

```
┌──────────────────────────────────────────┐
│ Create a new repository                  │
│                                          │
│ Repository name*                         │
│ [cuan-ai-frontend]                       │
│                                          │
│ Description (optional)                   │
│ [CUAN AI PRO - Frontend]                 │
│                                          │
│ ○ Public  ◉ Private                      │
│                                          │
│ Initialize with:                         │
│ ☐ README.md                              │
│ ☐ .gitignore                             │
│ ☐ Choose a license                       │
│                                          │
│ [Create repository]                      │
└──────────────────────────────────────────┘
```

**Action:**
1. Name: cuan-ai-frontend
2. Private atau Public (both ok)
3. Click [Create repository]

---

## [SCENE 3] Upload Frontend Code

**After creating repo, you see:**
```
┌──────────────────────────────────────────┐
│ Great! You've created a repository.      │
│                                          │
│ Now push an existing repository from     │
│ the command line                         │
│                                          │
│ git remote add origin https://github...  │
│ git branch -M main                       │
│ git push -u origin main                  │
└──────────────────────────────────────────┘
```

**Alternative (Easier):** Upload files manually

```
1. Click "Add file" → "Upload files"
2. Drag & drop your cuan-ai-frontend folder
3. Commit changes
```

---

## [SCENE 4] Go to Netlify

**Action:** Go to https://netlify.com

```
Netlify Homepage

[Sign up] [Sign in]
```

**Action:** Sign up dengan GitHub

```
1. Click "Sign up"
2. Choose "GitHub"
3. Authorize Netlify
4. Redirect ke dashboard
```

---

## [SCENE 5] Netlify Dashboard

**What you'll see:**
```
┌───────────────────────────────────────────┐
│ Netlify Dashboard                         │
│                                           │
│ [+ Add new site]                          │
│                                           │
│ Teams & accounts                          │
│ • Your Team (free)                        │
│                                           │
│ Sites (none yet)                          │
│                                           │
└───────────────────────────────────────────┘
```

**Action:** Click [+ Add new site]

---

## [SCENE 6] Deploy Site Options

**What you'll see:**
```
┌───────────────────────────────────────────┐
│ Add a new site                            │
│                                           │
│ [Import an existing project]              │
│ [Connect to Git]                          │
│ [Deploy manually]                         │
│                                           │
│ Deploy static site without Git?           │
│ [Drag and drop your site folder here]     │
│                                           │
└───────────────────────────────────────────┘
```

**Action:** Click "Import an existing project"

---

## [SCENE 7] Select Git Provider

**What you'll see:**
```
┌───────────────────────────────────────────┐
│ Create a new site                         │
│                                           │
│ Connect to Git                            │
│                                           │
│ [GitHub]  [GitLab]  [Bitbucket]          │
│                                           │
│ Click to authorize and select a repo      │
│                                           │
└───────────────────────────────────────────┘
```

**Action:** Click [GitHub]

---

## [SCENE 8] Select Repository

**What you'll see:**
```
┌────────────────────────────────────────────┐
│ Select GitHub repository                  │
│                                            │
│ Filter:                                    │
│ [Search your repositories]                 │
│                                            │
│ Your repositories:                         │
│ • cuan-ai-frontend  ← Click this!          │
│ • other-project                            │
│ • another-project                          │
│                                            │
└────────────────────────────────────────────┘
```

**Action:** Click "cuan-ai-frontend"

---

## [SCENE 9] Build Configuration

**What you'll see:**
```
┌────────────────────────────────────────────┐
│ Site settings, build & deploy               │
│                                            │
│ Branch to deploy: main                     │
│                                            │
│ Build command:                             │
│ [npm run build]                            │
│                                            │
│ Publish directory:                         │
│ [build]                                    │
│                                            │
│ Environment variables:                     │
│ REACT_APP_API_URL = [             ]       │
│                   (paste backend URL)      │
│                                            │
│ [Deploy site]                              │
│                                            │
└────────────────────────────────────────────┘
```

**Action:**
1. Build command: `npm run build` (auto-detected)
2. Publish: `build` (auto-detected)
3. Environment variables:
   - Name: REACT_APP_API_URL
   - Value: https://cuan-ai-backend.vercel.app
4. Click [Deploy site]

---

## [SCENE 10] Deploying...

**What you'll see:**
```
Deploying your site...

⏳ Install dependencies
⏳ Building site
⏳ Optimizing images
⏳ Deploy live

This takes 2-3 minutes...
```

**Action:** WAIT! 🎬

---

## [SCENE 11] Deploy Complete! 🎉

**What you'll see:**
```
┌─────────────────────────────────────────┐
│ ✅ Site Published                       │
│                                         │
│ Your site is live!                      │
│                                         │
│ URL:                                    │
│ https://cuan-ai-frontend.netlify.app    │
│                                         │
│ [Visit site]                            │
│                                         │
└─────────────────────────────────────────┘
```

**Action:** Click [Visit site]

---

## [SCENE 12] Test Your App!

**What you'll see:**
```
Loading...
🚀 CUAN AI PRO

[Splash screen]

After 3 seconds:
Click here to start!
[🚀 Mulai Sekarang]
```

**Action:** Click [🚀 Mulai Sekarang]

**Result:**
```
Dashboard appears!
0 Produk
0 Profit
87% Trending (placeholder)

✅ App works!
```

---

## [SCENE 13] Setup Complete Screen

**You now have:**
```
✅ Supabase running
✅ Database tables created
✅ Frontend deployed to Netlify
✅ Backend deployed to Vercel (dari sebelumnya)
✅ Environment variables configured
✅ App is LIVE!

🎉 Ready to use! 🔥
```

---

# 🎬 FINAL SCENES

## Scene: Dashboard

```
At: https://cuan-ai-frontend.netlify.app

You see:
┌─────────────────────────────────────────┐
│ 🚀 CUAN AI PRO          🔔 0 notifications│
│                                         │
│ [12 Produk] [Rp8.5M] [87% Trending]   │
│                                         │
│ [📊] [🤖] [🎯] [🔥]                     │
│                                         │
│ No products yet - Start analyzing!      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scene: Get API Key

```
Go to: https://console.anthropic.com

Sign up → Create API key

You get: sk-ant-...abc123...

Copy dan paste di app!
```

---

## Scene: Analyze Product

```
1. Go to 🤖 Analisis tab
2. Paste API key
3. Input: "Sepatu Nike putih"
4. Set commission: 15%
5. Click "🎯 Analisis dengan AI"
6. WAIT 5 seconds...
7. See result:
   - Product name
   - Price
   - Profit/month
   - Trending score
8. Product added to dashboard!

✅ Success! 🎉
```

---

## Scene: Push Notification

```
Go to: 🎯 Category Lock

1. Select: Beauty + Home
2. Click: "🔔 Enable Push"
3. Browser popup: [Allow notifications]
4. Click: Allow

Now when you analyze a product:
- If score ≥ 80 + category match + profit ≥ Rp500k
- 🔥 PUSH NOTIFICATION appears!
```

---

# 🏁 THE END!

**You've successfully deployed CUAN AI PRO!**

```
Frontend: https://cuan-ai-frontend.netlify.app ✅
Backend: https://cuan-ai-backend.vercel.app ✅
Database: Supabase (created) ✅
AI: Claude API (ready) ✅

Next: Start analyzing products & making CUAN! 💰
```

---

**Credits Roll:**
```
Starring: YOU! 🌟
Featuring: Claude AI 🤖
Powered by: Netlify, Vercel, Supabase ⚡
Music: Success sound effect 🎵

THE END 🎬
```

**Ready to start? Open the app and analyze your first product!**
