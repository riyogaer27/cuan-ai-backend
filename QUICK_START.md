# 🚀 CUAN AI PRO - QUICK START

## Architecture

```
Frontend (React) → Netlify
        ↓
    API (Express) → Vercel  
        ↓
   Database (Supabase PostgreSQL)
        ↓
  Claude AI API (Anthropic)
```

---

## 5-STEP DEPLOY GUIDE (30 menit)

### ✅ STEP 1: Supabase Setup (5 menit)

1. Go: https://supabase.com → Sign up
2. Create project → Copy API URL & Key
3. SQL Editor → Paste kode dari SETUP_GUIDE.md (bagian "Buat Tabel")
4. Save URL & Key untuk nanti

**Result:** Database ready ✓

---

### ✅ STEP 2: Deploy Backend ke Vercel (10 menit)

1. Create folder: `cuan-ai-backend`
2. Copy files:
   - `server.js`
   - `package.json`
   - `vercel.json`
   - `.env.example` → rename ke `.env`
3. Fill `.env` dengan Supabase URL & Key
4. Push ke GitHub (atau use Vercel CLI)
5. Connect Vercel → Auto deploy
6. Copy Vercel URL (misal: `https://cuan-ai-backend.vercel.app`)

**Result:** Backend live ✓

---

### ✅ STEP 3: Setup Frontend (React)

1. `npx create-react-app cuan-ai-frontend`
2. Replace `src/App.jsx` dengan file yang dibuat
3. Create `src/App.css` (dari SETUP_GUIDE.md)
4. Create `.env`:
   ```
   REACT_APP_API_URL=https://cuan-ai-backend.vercel.app
   ```
5. Test: `npm start` → http://localhost:3000

**Result:** Frontend works locally ✓

---

### ✅ STEP 4: Deploy Frontend ke Netlify (10 menit)

1. Build React: `npm run build`
2. Connect GitHub repo ke Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://cuan-ai-backend.vercel.app`
5. Deploy!

**Result:** Frontend live di Netlify ✓

---

### ✅ STEP 5: Test Application

1. Open Netlify URL
2. Click "🚀 Mulai Sekarang"
3. Get API Key: https://console.anthropic.com (free $5 trial)
4. Test analyze:
   - Input: "Sepatu Nike putih unisex"
   - Commission: 15%
   - Click "🎯 Analisis dengan AI"
5. Check notifications 🔔

**Result:** LIVE! 🎉✓

## ✨ NEW FEATURE: Web Push Notifications

### Bagaimana Push Notifications Bekerja?

```
1. User select kategori (Kecantikan, Rumah Tangga)
2. User click "Enable Push Notifications"
3. Browser request permission untuk notifications
4. App analyze produk
5. Jika trending (score >= 80) + kategori match + profit >= Rp500k
   → PUSH NOTIFICATION langsung ke HP! 🔥
```

### Setup Web Push (Di Frontend)

1. **User Enable Push**
   - Click "Enable Push" di header
   - Browser akan request permission
   - User klik "Allow"

2. **Select Kategori Watch**
   - Go ke tab "🎯 Category Lock"
   - Select kategori yang mau: Beauty, Home, dll
   - Hanya kategori ini yang akan kirim notif

3. **Automatic Push Alert**
   - Setiap analyze produk
   - If trending + kategori match → PUSH!
   - HP akan vibrate + sound
   - Click notif → Open app

### Tested On:
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge
- ✅ Firefox
- ⚠️ Safari (limited support)

---

## Database Tables untuk Push

Supabase tables yang digunakan:
- `products` - Semua produk
- `notifications` - History notifikasi
- `push_subscriptions` - User push preferences
- `analytics` - Bonus tracking

Lihat `supabase-schema.sql` untuk SQL lengkap.

---



| File | Purpose | Where |
|------|---------|-------|
| `server.js` | Express API | Backend (Vercel) |
| `App.jsx` | React Component | Frontend (Netlify) |
| `App.css` | Styling | Frontend |
| `package.json` | Dependencies | Backend |
| `vercel.json` | Vercel config | Backend |
| `.env.example` | Template | Backend |
| `SETUP_GUIDE.md` | Detailed guide | Reference |

---

## Environment Variables

### Backend (Vercel)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
```

### Frontend (Netlify)
```
REACT_APP_API_URL=https://cuan-ai-backend.vercel.app
```

---

## Features

✅ AI-powered product analysis (Claude API)
✅ Real-time trending notifications (🔥 score >= 80)
✅ History tersimpan di Supabase
✅ Multi-user support
✅ Profit calculator otomatis
✅ Marketing strategy recommendations
✅ Mobile responsive design

---

## Pricing (Semua GRATIS!)

- **Supabase:** Free tier (500MB)
- **Vercel:** Free tier (unlimited)
- **Netlify:** Free tier (unlimited)
- **Claude API:** Pay-per-use ($0.003 per analyze)
- **Domain:** Gratis (vercel.app / netlify.app)

---

## Troubleshooting

**Q: API Connection Error**
```
→ Check REACT_APP_API_URL di Netlify env
→ Check CORS di server.js (sudah set)
→ Check Vercel backend running (visit /api/health)
```

**Q: Database Error**
```
→ Verify tables exist di Supabase SQL editor
→ Check API key format
→ Check firewall/VPN
```

**Q: Claude API Error**
```
→ API key format: sk-ant-...
→ Check credit di console.anthropic.com
→ Check rate limits
```

---

## Next Steps (Scale Up)

1. **Add more AI models** (GPT-4, Gemini)
2. **Implement authentication** (Supabase Auth)
3. **Add email notifications**
4. **Create mobile app** (React Native)
5. **Integrate Shopee API** (official)
6. **Add analytics dashboard**
7. **Implement payment** (for premium features)

---

## Support Links

- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Claude: https://docs.anthropic.com
- React: https://react.dev

---

**Happy coding! Good luck making CUAN! 💰🚀**

Questions? Check SETUP_GUIDE.md untuk detail lengkap.
