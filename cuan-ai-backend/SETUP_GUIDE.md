# 🚀 CUAN AI - Setup & Deploy Guide

## Persiapan

Butuh:
1. **Supabase Account** (free) - https://supabase.com
2. **Anthropic API Key** - https://console.anthropic.com
3. **Netlify Account** (free) - https://netlify.com
4. **GitHub Account** (free) - https://github.com

---

## STEP 1: Setup Supabase Database

### 1.1 Buat Supabase Project
- Go to supabase.com → Sign up/Login
- Create new project (choose region terdekat)
- Wait untuk selesai (3-5 menit)

### 1.2 Buat Tabel `products`
Di Supabase Dashboard → SQL Editor → Paste:

```sql
CREATE TABLE products (
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
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_id ON products(user_id);
```

### 1.3 Buat Tabel `notifications`

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  product_id BIGINT REFERENCES products(id),
  type VARCHAR,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
```

### 1.4 Copy API Keys
- Go ke Settings → API → Copy:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` (sebagai `SUPABASE_KEY`)

---

## STEP 2: Setup Backend (Express API)

### 2.1 Create Node.js Project
```bash
mkdir cuan-ai-backend
cd cuan-ai-backend
npm init -y
npm install express cors dotenv @supabase/supabase-js
```

### 2.2 Create `.env` file
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3000
```

### 2.3 Copy `server.js` (dari file yang sudah dibuat)

### 2.4 Test locally
```bash
npm start
```
Visit: http://localhost:3000/api/health → Should return `{"status":"ok"}`

### 2.5 Deploy ke Vercel
- Install Vercel CLI: `npm install -g vercel`
- Run: `vercel`
- Follow prompts
- Copy Vercel deployment URL (misal: `https://cuan-ai-backend.vercel.app`)

---

## STEP 3: Setup Frontend (React)

### 3.1 Create React App
```bash
npx create-react-app cuan-ai-frontend
cd cuan-ai-frontend
```

### 3.2 Create `.env` file
```
REACT_APP_API_URL=https://cuan-ai-backend.vercel.app
```

### 3.3 Copy Component Files
1. Copy `App.jsx` ke `src/App.jsx`
2. Create `src/App.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #FF6B35;
  --secondary: #004E89;
  --accent: #FFD60A;
  --success: #06A77D;
  --danger: #D62828;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
  color: #fff;
}

.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 36px;
  margin-bottom: 10px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.notifications-bell {
  position: relative;
  cursor: pointer;
  font-size: 24px;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px;
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 10px;
}

.notification-item {
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-item:hover {
  background: rgba(255, 107, 53, 0.2);
}

.notification-item p {
  margin-bottom: 5px;
  font-size: 14px;
}

.notification-item small {
  color: #aaa;
  font-size: 12px;
}

.user-info {
  font-size: 14px;
  color: #aaa;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tabs {
  display: flex;
  gap: 15px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
  margin-bottom: 30px;
  overflow-x: auto;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn.active {
  color: var(--primary);
  border-bottom: 3px solid var(--primary);
}

.content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.card h2 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group small {
  display: block;
  color: #888;
  margin-top: 5px;
  font-size: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary), #ff8c42);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  text-transform: uppercase;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card,
.trending-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}

.product-card:hover,
.trending-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 107, 53, 0.3);
  background: rgba(255, 107, 53, 0.05);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.product-header h3 {
  font-size: 16px;
  flex: 1;
}

.trending-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.trending-badge.hot {
  background: rgba(255, 107, 53, 0.3);
  color: var(--primary);
}

.trending-badge.good {
  background: rgba(6, 168, 125, 0.3);
  color: var(--success);
}

.product-price {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 10px 0;
}

.product-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin: 15px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.product-info small {
  color: #aaa;
  font-size: 12px;
}

.product-info p {
  font-weight: 700;
  color: var(--success);
  margin-top: 5px;
}

.product-reason {
  color: #aaa;
  font-size: 13px;
  margin: 10px 0;
  font-style: italic;
}

.product-strategy {
  font-size: 12px;
  color: #aaa;
  margin: 10px 0;
  padding: 10px;
  background: rgba(0, 78, 137, 0.1);
  border-left: 3px solid var(--secondary);
  border-radius: 4px;
}

.product-meta {
  color: #888;
  font-size: 12px;
  margin: 10px 0;
}

.btn-delete {
  width: 100%;
  padding: 10px;
  background: rgba(214, 40, 40, 0.2);
  color: var(--danger);
  border: 1px solid rgba(214, 40, 40, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 15px;
}

.btn-delete:hover {
  background: rgba(214, 40, 40, 0.3);
}

.trending-label {
  display: inline-block;
  background: rgba(255, 107, 53, 0.3);
  color: var(--primary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
}

.trending-score {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  margin: 10px 0;
}

.trending-reason {
  color: #aaa;
  font-size: 13px;
  margin: 10px 0;
}

.trending-profit {
  background: rgba(6, 168, 125, 0.1);
  color: var(--success);
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 50px;
  backdrop-filter: blur(10px);
  max-width: 400px;
}

.login-card h1 {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 48px;
  margin-bottom: 10px;
}

.login-card p {
  color: #aaa;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
  }
}
```

### 3.4 Update `src/index.js`
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3.5 Test Locally
```bash
npm start
```
Visit: http://localhost:3000

### 3.6 Deploy ke Netlify
```bash
npm run build
# Install Netlify CLI
npm install -g netlify-cli
# Deploy
netlify deploy --prod
```

---

## STEP 4: Connect Everything

### 4.1 Update Backend Environment
Di Vercel Dashboard → Project → Settings → Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_KEY`

### 4.2 Update Frontend Environment
Di Netlify Dashboard → Project → Build & Deploy → Environment:
- `REACT_APP_API_URL=https://your-vercel-backend.vercel.app`

---

## STEP 5: Testing

1. **Login ke aplikasi** → Will create demo user
2. **Isi Anthropic API Key** → Get free dari console.anthropic.com
3. **Test Analyze**:
   - Input: "Sepatu Nike sneaker putih unisex"
   - Komisi: 15%
   - Click "Analisis dengan AI"
4. **Check Notifications** → Jika trending score >= 80, akan dapat notif 🔥
5. **View History** → Semua produk tersimpan di Supabase

---

## Environment Variables Summary

### Backend (.env)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
PORT=3000
```

### Frontend (.env)
```
REACT_APP_API_URL=https://cuan-ai-backend.vercel.app
```

---

## Troubleshooting

**Q: "API Connection Error"**
- Check REACT_APP_API_URL di Netlify
- Check SUPABASE_URL & SUPABASE_KEY di Vercel
- Restart build

**Q: "Database Error"**
- Check Supabase tables exist
- Verify API key permissions
- Check network in browser console

**Q: "Claude API Error"**
- Verify API key format (sk-ant-...)
- Check API usage quota di console.anthropic.com

---

## Fitur Bonus: Real-time Notifications

Aplikasi auto-check setiap 5 detik untuk produk trending!
Jika trending score >= 80:
- 🔔 Bell notification muncul
- 🔥 Product masuk ke "Trending" tab

---

**Selamat! Aplikasi CUAN AI Anda sudah live! 🚀💰**

Untuk update/maintenance:
- Push code ke GitHub
- Netlify auto-deploy dari GitHub
- Vercel auto-deploy saat push

Enjoy making money! 🎉
