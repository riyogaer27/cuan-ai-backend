# 📋 CUAN AI PRO - Quick Cheat Sheet

**All you need in one place!**

---

## 🔗 URLs to Remember

```
Supabase: https://supabase.com
GitHub: https://github.com
Vercel: https://vercel.com
Netlify: https://netlify.com
Claude API: https://console.anthropic.com
```

---

## 📝 Copy-Paste Commands

### 1️⃣ Initialize Backend

```bash
mkdir cuan-ai-backend
cd cuan-ai-backend
git init
git add .
git commit -m "Initial CUAN AI backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cuan-ai-backend.git
git push -u origin main
```

### 2️⃣ Initialize Frontend

```bash
npx create-react-app cuan-ai-frontend
cd cuan-ai-frontend
git init
git add .
git commit -m "Initial CUAN AI frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cuan-ai-frontend.git
git push -u origin main
```

### 3️⃣ Test Frontend Locally

```bash
cd cuan-ai-frontend
npm start
```

Then open: http://localhost:3000

---

## 🔐 Environment Variables

### Backend (.env) - Paste in Vercel

```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
```

### Frontend (.env) - Paste in Netlify

```
REACT_APP_API_URL=https://cuan-ai-backend.vercel.app
```

---

## 🗄️ SQL to Run in Supabase

**Copy-paste this ke SQL Editor di Supabase:**

```sql
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

---

## 🎯 Step-by-Step Checklist

### Day 1: Setup (1 hour)

- [ ] Create Supabase account
- [ ] Create Supabase project
- [ ] Run SQL schema in Supabase
- [ ] Copy Supabase URL & key
- [ ] Create GitHub account
- [ ] Clone/download backend code
- [ ] Create .env file (backend)
- [ ] Push backend to GitHub

### Day 2: Backend Deployment (30 min)

- [ ] Create Vercel account
- [ ] Import backend repo to Vercel
- [ ] Add Supabase env vars to Vercel
- [ ] Deploy backend
- [ ] Test: https://backend-url/api/health
- [ ] Copy backend URL

### Day 3: Frontend Setup (30 min)

- [ ] Create React app: `npx create-react-app cuan-ai-frontend`
- [ ] Copy App.jsx, App.css, public files
- [ ] Create .env file (frontend)
- [ ] Test locally: `npm start`
- [ ] Push to GitHub

### Day 4: Frontend Deployment (30 min)

- [ ] Create Netlify account
- [ ] Import frontend repo to Netlify
- [ ] Configure build settings
- [ ] Add env variables
- [ ] Deploy
- [ ] Test: https://frontend-url
- [ ] Enable push notifications
- [ ] Get Claude API key
- [ ] Test analyze product

### Day 5: Go Live! (ongoing)

- [ ] Start analyzing products
- [ ] Track stats in dashboard
- [ ] Optimize categories
- [ ] Make CUAN! 💰

---

## 🚨 Quick Fixes

### Problem: "Cannot connect to backend"

**Fix:**
```
1. Check REACT_APP_API_URL di .env
2. Check di Netlify (Settings → Build & deploy → Environment)
3. Test backend: curl https://backend-url/api/health
4. Check CORS in server.js (should have app.use(cors()))
```

### Problem: "Database error"

**Fix:**
```
1. Check Supabase project is running
2. Verify SUPABASE_URL & SUPABASE_KEY di .env
3. Check tables exist: Supabase → Tables
4. Check SQL ran successfully
```

### Problem: "Build failed on Netlify"

**Fix:**
```
1. Go to Deployments → View details
2. Check logs for errors
3. Usually: package.json or missing files
4. Make sure all dependencies installed locally first
5. Try: rm node_modules, npm install, npm run build
```

### Problem: "Push notifications not working"

**Fix:**
```
1. Check browser console (F12)
2. Check Service Worker: F12 → Application → Service Workers
3. Check permission: Settings → Notifications → Allow
4. Enable push in Category Lock tab
```

---

## 📊 Important Numbers to Know

```
Supabase free tier:
- 500MB storage ✓
- Unlimited rows ✓
- Perfect for MVP ✓

Vercel free tier:
- Unlimited API calls ✓
- Auto HTTPS ✓
- Great uptime ✓

Netlify free tier:
- Unlimited bandwidth ✓
- Auto builds ✓
- Free domain ✓

Claude API:
- Free $5 trial ✓
- ~$0.003 per analyze ✓
- Plenty for development ✓
```

---

## 🎯 File Locations

**Backend files go here:**
```
cuan-ai-backend/
├── server.js (from output)
├── package.json (from output)
├── vercel.json (from output)
├── .env (create this)
└── .gitignore (create this)
```

**Frontend files go here:**
```
cuan-ai-frontend/src/
├── App.jsx (paste from output)
├── App.css (paste from output)
├── index.js

cuan-ai-frontend/public/
├── index.html (paste from output)
├── manifest.json (paste from output)
├── service-worker.js (paste from output)
└── favicon.ico
```

---

## 🔑 API Keys You Need

```
1. Supabase:
   - Project URL: https://YOUR_PROJECT.supabase.co
   - Anon Key: eyJhbGc...

2. Anthropic (Claude):
   - API Key: sk-ant-...

3. GitHub (optional but recommended):
   - Username
   - Token (if needed)
```

---

## 📱 After Going Live

### Daily:
```
1. Open app
2. Analyze 2-3 products
3. Check push notifications
4. Monitor dashboard
```

### Weekly:
```
1. Review analytics
2. Update categories if needed
3. Scale up products
4. Check Claude API usage
```

### Monthly:
```
1. Analyze performance
2. Optimize strategy
3. Increase investments
4. Plan next month
```

---

## 🎓 Learning Resources

```
React: https://react.dev
Express: https://expressjs.com
Supabase: https://supabase.com/docs
Netlify: https://docs.netlify.com
Claude: https://docs.anthropic.com
```

---

## 💾 Backup Important Info

**Create a file called `IMPORTANT_INFO.txt` and save:**

```
PROJECT: CUAN AI PRO

Supabase:
- URL: https://...
- Key: eyJ...
- Password: [your_db_password]

Backend:
- Vercel URL: https://cuan-ai-backend.vercel.app
- GitHub: https://github.com/your-username/cuan-ai-backend

Frontend:
- Netlify URL: https://cuan-ai-frontend.netlify.app
- GitHub: https://github.com/your-username/cuan-ai-frontend

API Keys:
- Claude: sk-ant-...
- GitHub: [if using token]

Accounts:
- Supabase: [email]
- Vercel: [email]
- Netlify: [email]
- GitHub: [username]
- Anthropic: [email]
```

**KEEP THIS FILE SAFE!**

---

## 🎉 Success Indicators

### ✅ Supabase Setup Done
- [x] Project created
- [x] Tables created
- [x] Can see 4 tables in Supabase

### ✅ Backend Deployed
- [x] Vercel shows "Congratulations"
- [x] Can access /api/health endpoint
- [x] Env vars configured

### ✅ Frontend Deployed
- [x] Netlify shows "Site Published"
- [x] Can open Netlify URL
- [x] See login screen
- [x] Can click "Mulai Sekarang"

### ✅ Everything Working
- [x] Can analyze products
- [x] Get results from AI
- [x] Push notifications work
- [x] Data saved to database

---

## 🚀 Ready to Deploy?

**Checklist before starting:**

- [ ] All code files downloaded
- [ ] GitHub account ready
- [ ] Supabase account ready
- [ ] Vercel account ready
- [ ] Netlify account ready
- [ ] Claude API account ready
- [ ] 1-2 hours free time
- [ ] Coffee ☕ ready

**When all checked:**

👉 **Start with NETLIFY_SUPABASE_SETUP.md** 👈

**Or watch the VIDEO_STYLE_GUIDE.md instead!**

---

## 📞 Need Help?

```
Can't remember what to do?
→ Read: NETLIFY_SUPABASE_SETUP.md

Want video-style walkthrough?
→ Read: VIDEO_STYLE_GUIDE.md

Want feature overview?
→ Read: FEATURES_SUMMARY.md

Want to see UI first?
→ Open: MOBILE_UI_PREVIEW.html

Technical questions?
→ Read: PUSH_NOTIFICATIONS_GUIDE.md

Complete overview?
→ Read: FINAL_SUMMARY.md
```

---

## 🎊 FINAL SUMMARY

**You have:**
- ✅ All code ready
- ✅ All docs ready
- ✅ All guides ready

**Next:**
1. Pick guide (normal or video-style)
2. Follow step-by-step
3. Deploy!
4. Test!
5. Start making money! 💰

**Estimated time: 2-4 hours total**

**Result: LIVE production app with push notifications!**

---

**Good luck! You got this! 🚀💪**

**Remember: Done is better than perfect!**

**Start deploying now! 🔥**
