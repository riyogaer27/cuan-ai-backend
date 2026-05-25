## 🚀 CUAN AI PRO - Deployment Guide (Netlify + Supabase)

**Estimated Time: 45 minutes**

---

# PART 1: SETUP SUPABASE (15 minutes)

## Step 1.1: Create Supabase Account

```
1. Go to: https://supabase.com
2. Click "Sign Up" (kanan atas)
3. Choose: "Continue with GitHub" atau email
4. Verify email
```

**Screenshots:**
```
Homepage → Sign Up → Fill email/GitHub → Verify → Done!
```

---

## Step 1.2: Create New Project

Setelah login, akan melihat dashboard:

```
Dashboard Supabase
├── Your Projects
└── [+ New Project] ← CLICK INI
```

**Step-by-step:**

```
1. Click "+ New Project"
2. Fill form:
   - Organization: Create new (atau pilih existing)
   - Project name: "cuan-ai" atau nama lain
   - Database password: INGAT! Atau buat strong password
   - Region: Select region terdekat
     (For Indonesia: Singapore)
3. Click "Create new project"
4. WAIT 2-3 MINUTES (Creating database...)
5. Akan redirect ke project dashboard
```

**Password Tips:**
- Gunakan password yang kuat: `MyPassword123!@#`
- SAVE DI NOTES! Nanti perlu

---

## Step 1.3: Copy API Keys

Di project dashboard, cari menu:

```
Settings → API
```

Atau direct link: Di sidebar kiri → Settings → API

**Copy dua keys ini:**

```
┌─────────────────────────────────────────┐
│ Project URL                             │
│ https://YOUR_PROJECT.supabase.co        │ ← COPY INI (SUPABASE_URL)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ anon public                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.. │ ← COPY INI (SUPABASE_KEY)
└─────────────────────────────────────────┘
```

**SAVE di text file:**
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 1.4: Create Database Tables

Di Supabase dashboard, cari:

```
SQL Editor (di sidebar kiri)
```

Atau klik: New Query

**Copy-paste SQL ini:**

```sql
-- CREATE TABLES

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  product_name VARCHAR NOT NULL,
  estimated_price BIGINT,
  category VARCHAR,
  trending_score INT,
  monthly_sales INT,
  profit_per_unit BIGINT,
  monthly_profit BIGINT,
  commission FLOAT,
  cost BIGINT,
  risk_level VARCHAR,
  recommendation TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(trending_score DESC);

-- NOTIFICATIONS TABLE

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- PUSH SUBSCRIPTIONS TABLE

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  watch_categories TEXT[] DEFAULT ARRAY['beauty', 'home'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

-- ANALYTICS TABLE

CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  action VARCHAR,
  product_id BIGINT REFERENCES products(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_action ON analytics(action);

COMMIT;
```

**Cara run:**

```
1. Paste SQL di SQL Editor
2. Click "RUN" button (atau Ctrl+Enter)
3. WAIT sampai "Success"
4. Akan lihat: "Created successfully"
5. Done! Tables created ✓
```

**Verify:**

Pergi ke: **Tables** (sidebar kiri)
Akan lihat:
- ✅ products
- ✅ notifications
- ✅ push_subscriptions
- ✅ analytics

---

## Step 1.5: Enable RLS (Optional but Recommended)

Di Tables tab:

```
1. Klik table "products"
2. Klik "RLS" button (kanan atas)
3. Enable RLS
4. Repeat untuk semua tables
```

**Result:** Database security enabled ✓

---

# PART 2: SETUP BACKEND (Vercel) - 20 minutes

## Step 2.1: Prepare Backend Files

**Create folder di komputer:**

```bash
mkdir cuan-ai-backend
cd cuan-ai-backend
```

**Copy files dari output:**
- `server.js`
- `package.json`
- `vercel.json`

**Paste ke folder `cuan-ai-backend`**

---

## Step 2.2: Create .env File

Di folder `cuan-ai-backend`, buat file baru: `.env`

**Content:**
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
```

**Replace:**
- `https://YOUR_PROJECT.supabase.co` dengan URL Anda
- `eyJhbGc...` dengan API KEY Anda

**SAVE!**

---

## Step 2.3: Push to GitHub

**If you don't have GitHub:**
1. Go: https://github.com/signup
2. Create account
3. Verify email

**Push code:**

```bash
# Init git
git init

# Add files
git add .

# Commit
git commit -m "Initial CUAN AI backend"

# Create branch
git branch -M main

# Add remote (CREATE REPO DI GITHUB DULU!)
git remote add origin https://github.com/YOUR_USERNAME/cuan-ai-backend.git

# Push
git push -u origin main
```

**How to create GitHub repo:**
1. Go: https://github.com/new
2. Name: `cuan-ai-backend`
3. Click "Create repository"
4. COPY URL yang muncul
5. Ganti di command di atas

---

## Step 2.4: Deploy to Vercel

**Go to:** https://vercel.com

**Login/Sign up:**
```
Sign up → GitHub → Authorize
```

**Deploy:**

```
1. Click "New Project"
2. Select "Import Git Repository"
3. Paste GitHub URL: https://github.com/YOUR_USERNAME/cuan-ai-backend.git
4. Click "Import"
5. Wait for Vercel to detect project
6. Click "Environment Variables"
7. Add two variables:
   Name: SUPABASE_URL
   Value: https://YOUR_PROJECT.supabase.co
   
   Name: SUPABASE_KEY
   Value: eyJhbGc...
8. Click "Deploy"
9. WAIT ~2 MINUTES
10. See "Congratulations! Your project is live"
11. COPY URL (something like: https://cuan-ai-backend.vercel.app)
```

**Result:**
```
Backend URL: https://cuan-ai-backend.vercel.app ✓
```

**Test backend alive:**
```
Go to: https://cuan-ai-backend.vercel.app/api/health

Should see:
{"status":"ok","timestamp":"2025-05-25T...","version":"1.0.0"}
```

---

# PART 3: SETUP FRONTEND (React + Netlify) - 15 minutes

## Step 3.1: Create React App

**Terminal/Command prompt:**

```bash
npx create-react-app cuan-ai-frontend
cd cuan-ai-frontend
```

**Wait ~3-5 minutes (installing dependencies...)**

---

## Step 3.2: Copy Frontend Files

**From output files, copy:**
- `App.jsx` → paste ke: `src/App.jsx`
- `App.css` → paste ke: `src/App.css`
- `public/index.html` → paste ke: `public/index.html`
- `public/manifest.json` → paste ke: `public/manifest.json`
- `public/service-worker.js` → paste ke: `public/service-worker.js`

**After copying, folder structure:**
```
cuan-ai-frontend/
├── src/
│   ├── App.jsx ✓
│   ├── App.css ✓
│   ├── index.js
│   └── ...
├── public/
│   ├── index.html ✓
│   ├── manifest.json ✓
│   ├── service-worker.js ✓
│   └── ...
├── package.json
└── ...
```

---

## Step 3.3: Create .env File

Di folder `cuan-ai-frontend`, buat: `.env`

**Content:**
```
REACT_APP_API_URL=https://cuan-ai-backend.vercel.app
```

**Replace URL dengan backend URL Anda (dari Step 2.4)**

---

## Step 3.4: Test Locally

```bash
npm start
```

**Should:**
1. Open browser automatically
2. Show loading spinner
3. After ~5s, show login screen
4. Can click "🚀 Mulai Sekarang"

**If error:**
- Close terminal
- Run: `npm install`
- Run: `npm start` again

---

## Step 3.5: Push to GitHub

```bash
git init
git add .
git commit -m "Initial CUAN AI frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cuan-ai-frontend.git
git push -u origin main
```

**Create GitHub repo:**
1. Go: https://github.com/new
2. Name: `cuan-ai-frontend`
3. Create
4. Copy URL

---

## Step 3.6: Deploy to Netlify

**Go to:** https://netlify.com

**Login/Sign up:**
```
Sign up → GitHub → Authorize
```

**Deploy:**

```
1. Click "Add new site"
2. Select "Import an existing project"
3. Select "GitHub"
4. Find & select: cuan-ai-frontend
5. Click "Deploy site"
6. Netlify will auto-detect:
   - Build command: npm run build
   - Publish directory: build
7. Click "Next"
8. WAIT deployment (2-3 min)
9. See "Site is live" ✓
10. Copy site URL (something like: https://cuan-ai-frontend.netlify.app)
```

**But wait! Add environment variables first:**

```
1. Go to: Site settings → Build & deploy
2. Find: "Environment"
3. Click "Edit variables"
4. Add:
   Variable: REACT_APP_API_URL
   Value: https://cuan-ai-backend.vercel.app
5. Save
6. Trigger redeploy:
   - Go to: Deployments
   - Click three dots on latest deploy
   - Select "Trigger deploy"
7. Wait ~2 min
8. Done! ✓
```

**Result:**
```
Frontend URL: https://cuan-ai-frontend.netlify.app ✓
```

---

# PART 4: TEST EVERYTHING! (5 minutes)

## Step 4.1: Open App

**Go to:** https://cuan-ai-frontend.netlify.app

**Should see:**
- Loading spinner
- After ~3s: Login screen
- Message: "CUAN AI PRO - Shopee Affiliate Analyzer"

---

## Step 4.2: Login

```
Click: "🚀 Mulai Sekarang"

Result:
- Dashboard appears
- Stats show: 0 produk, 0 profit
- Tabs: Dashboard, Analisis, Filter, Trending
```

---

## Step 4.3: Test Analyzer

**Tab: "🤖 Analisis"**

```
1. Get API Key:
   - Go: https://console.anthropic.com
   - Sign up (free)
   - Create API key (free $5 trial!)
   - Copy key: sk-ant-...

2. Fill form:
   - API Key: sk-ant-...
   - Link/Deskripsi: "Sepatu Nike putih size 39-45"
   - Commission: 15
   - Modal: 0

3. Click: "🎯 Analisis dengan AI"

4. Wait ~5 seconds...

5. Should show:
   - Product name
   - Price
   - Komisi/unit
   - Monthly profit
   - Trending score
```

---

## Step 4.4: Test Category Lock

**Tab: "🎯 Category Lock"**

```
1. Should see categories:
   - 💄 Beauty (✅ AKTIF)
   - 🏠 Home (✅ AKTIF)
   - 👗 Fashion
   - etc

2. Click categories to toggle

3. Click: "🔔 Enable Push Notifications"
   - Browser popup muncul
   - Click "Allow"
   - Should show: "✅ Push Sudah Aktif"
```

---

## Step 4.5: Test Push Notification

**Analyze another product:**

```
Tab: Analisis

1. Input: "Masker Kecantikan Korea"
2. Commission: 20
3. Click: "🎯 Analisis"
4. If beauty category (watch list) + score ≥ 80 + profit ≥ Rp500k:
   → PUSH NOTIFICATION muncul! 🔥
```

**Notification akan:**
- Pop up di bawah taskbar
- Show title & body
- Play sound
- Vibrate (di mobile)
- Bisa click "Lihat Detail"

---

# FINAL CHECKLIST ✓

```
Frontend:
☑ Deployed to Netlify
☑ Can open at netlify.app URL
☑ Can login
☑ Dashboard shows 0 products

Backend:
☑ Deployed to Vercel
☑ Can access /api/health
☑ Environment variables set

Database:
☑ Supabase project created
☑ All tables created
☑ Can see tables in Supabase

API Integration:
☑ Frontend can connect to backend
☑ Backend can connect to Supabase
☑ Claude API works

Features:
☑ Can analyze products
☑ Can enable push notifications
☑ Can select categories
☑ Push notification works
```

---

# TROUBLESHOOTING

## Q: "Cannot find module" error

**A:**
```bash
cd cuan-ai-frontend
npm install
npm start
```

---

## Q: "API Connection Error"

**A:**
1. Check REACT_APP_API_URL di Netlify (Settings → Build & deploy)
2. Check backend URL di Vercel (Should be https://cuan-ai-backend.vercel.app)
3. Check CORS in server.js (Already enabled)
4. Test: https://cuan-ai-backend.vercel.app/api/health

---

## Q: "Database Error"

**A:**
1. Check SUPABASE_URL di Vercel env var
2. Check SUPABASE_KEY di Vercel env var
3. Check tables exist di Supabase SQL Editor
4. Check RLS is correct

---

## Q: "Build failed"

**A:**
- Netlify: Check build logs (Deployments → View details)
- Vercel: Check logs (Deployments → View)
- Usually: Missing file atau package.json error

---

## Q: "Push notification not working"

**A:**
1. Browser console (F12) show errors?
2. Service Worker registered? (F12 → Application → Service Workers)
3. Notification permission = "granted"? (Settings → Notifications)
4. Did you enable in category lock?

---

# 🎉 DONE! YOU'RE LIVE!

**URLs to bookmark:**

```
Frontend: https://cuan-ai-frontend.netlify.app
Backend: https://cuan-ai-backend.vercel.app/api/health
Supabase: https://app.supabase.com/projects
Netlify: https://app.netlify.com
Vercel: https://vercel.com
```

**Next steps:**
1. Start analyzing products daily
2. Get Claude API credits (if needed)
3. Monitor stats in dashboard
4. Enjoy push notifications! 🔥

---

**Happy CUAN-ing! 💰🚀**
