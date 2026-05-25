# 🔔 Web Push Notifications - Implementation Guide

## Overview

Aplikasi CUAN AI menggunakan **Web Push Notifications API** untuk kirim alert ke HP user ketika ada produk trending sesuai kategori yang mereka pilih.

---

## 🎯 Features

✅ **Real-time Push Alerts** - Instant notifikasi saat ada produk trending  
✅ **Category Filter** - Hanya terima notif kategori pilihan  
✅ **Smart Trigger** - Hanya produk dengan score >= 80 & profit >= Rp500k  
✅ **Interactive** - Click notifikasi → buka app  
✅ **Offline Support** - Notifications work even jika tab closed  
✅ **PWA Compatible** - Installable sebagai app di HP  

---

## 🏗️ Architecture

```
User (Browser)
    ↓
Service Worker (Background)
    ↓
Push API
    ↓
Browser Database (IndexedDB)
    ↓
Phone Notifications
```

---

## 📋 Browser Support

| Browser | Desktop | Mobile | PWA |
|---------|---------|--------|-----|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ⚠️ |
| Safari | ❌ | ⚠️ | ⚠️ |
| Opera | ✅ | ✅ | ✅ |

---

## 🔧 Implementasi Detail

### 1. Service Worker Registration

**File: `public/service-worker.js`**

```javascript
// Service Worker menangani:
- Push notifications (dari backend)
- Background sync
- Cache management
- Offline support

// Event yang dihandle:
- push (terima notifikasi)
- notificationclick (user click notif)
- notificationclose (user dismiss notif)
```

### 2. Push Subscription

**User Flow:**

```javascript
1. User click "Enable Push"
   ↓
2. Notification.requestPermission()
   ↓
3. User click "Allow" di browser popup
   ↓
4. registration.pushManager.subscribe()
   ↓
5. Send subscription ke backend
   ↓
6. Save di Supabase push_subscriptions table
```

**Code:**

```javascript
// Di App.jsx
const handleEnablePush = async () => {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_KEY
    });
    
    // Save subscription ke backend
    await fetch('/api/subscribe-push', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        subscription: subscription,
        watchCategories: selectedCategories
      })
    });
  }
};
```

### 3. Backend Push Trigger

**File: `server.js` - POST /api/analyze**

```javascript
// Check if produk should trigger push:
const shouldNotify = 
  analysis.trendingScore >= 80 &&        // Trending
  watchCategories.includes(category) &&   // Kategori match
  monthlyProfit >= 500000;                // Profit minimum

if (shouldNotify) {
  // Save notification ke DB
  await supabase.from('notifications').insert({
    user_id: userId,
    product_id: productId,
    message: `🔥 ${productName} - ${category}! Rp${profit}/bulan`,
    type: 'trending_alert'
  });
  
  // Return push data ke frontend
  res.json({
    shouldPush: true,
    pushData: {
      title: `🔥 PRODUK EMAS: ${productName}`,
      body: `${category} | Rp${profit}/bulan`,
      tag: `product-${productId}`,
      requireInteraction: true
    }
  });
}
```

### 4. Frontend Trigger Push

**Di App.jsx:**

```javascript
// Setelah analyze product:
if (data.shouldPush && pushEnabled) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(data.pushData.title, {
        body: data.pushData.body,
        icon: '🔥',
        tag: data.pushData.tag,
        requireInteraction: true,
        actions: [
          { action: 'open', title: '👀 Lihat Detail' },
          { action: 'close', title: '✖️ Tutup' }
        ]
      });
    });
  }
}
```

---

## 📊 Database Schema

### push_subscriptions Table

```sql
id              BIGINT          PRIMARY KEY
user_id         VARCHAR UNIQUE  - User ID
subscription    JSONB           - Browser subscription object
watch_categories TEXT[]         - Array of categories ['beauty', 'home']
is_active       BOOLEAN         - Enable/disable push
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### notifications Table (untuk history)

```sql
id              BIGINT          PRIMARY KEY
user_id         VARCHAR         - User ID
product_id      BIGINT          - FK to products
type            VARCHAR         - 'trending_alert', etc
message         TEXT            - Notification message
is_read         BOOLEAN         - Read status
created_at      TIMESTAMP
```

---

## 🔐 Security

### VAPID Key

```javascript
// VAPID Key untuk verifikasi notifikasi
// Private key di backend, public key di frontend

// Generated dengan:
npx web-push generate-vapid-keys

// Public key untuk browser (di App.jsx):
const VAPID_PUBLIC = 'BEl62iUY0yYKqyvawk2PHl7oGyHVBIehQYJ7A8shE_TjyDi4Z84xnWBjx_sZ0KyVbVPIVJ7P_-FIVubUZmXgkA='

// Private key di backend .env:
VAPID_PRIVATE_KEY=xxxxx
```

### Permissions

- User must explicitly allow notifications
- Browser sandboxes push permissions
- Notifications only dari trusted sources
- User bisa disable anytime

---

## 🛠️ Troubleshooting

### Q: Push tidak muncul di HP

**A: Check:**
```
1. Service Worker registered? → Open DevTools → Application → Service Workers
2. Push permission granted? → Settings → Notifications
3. Backend alive? → Test /api/health
4. Category filter match? → Check selectedCategories
5. Trending score >= 80? → Check analysis.trendingScore
```

### Q: Permission popup tidak muncul

**A:**
```javascript
// Issue: User already denied permission
// Fix: User harus clear site data & refresh

// Atau manual di browser:
Settings → Privacy → Notifications → Remove site
```

### Q: Notifications show tapi tidak clickable

**A:**
```javascript
// Add requireInteraction: true
registration.showNotification(title, {
  requireInteraction: true  // Keep notif sampai user interact
});
```

### Q: Service Worker tidak update

**A:**
```javascript
// Force update
navigator.serviceWorker.ready.then(reg => {
  reg.update();
});

// Atau di DevTools:
Application → Service Workers → 'Update on reload'
```

---

## 🚀 Testing Web Push

### Manual Test

```javascript
// Di browser console:
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Test Notif', {
    body: 'Ini test dari console',
    icon: '🔥'
  });
});
```

### Test di DevTools

```
1. Open DevTools → Application → Service Workers
2. Find your service worker
3. Click "Push" button
4. Will trigger push event
```

### Test Category Filter

```javascript
// Di App.jsx - hardcode categories untuk testing
const [watchCategories, setWatchCategories] = useState({
  beauty: true,  // Enable
  home: true,    // Enable
  // rest disabled
});
```

---

## 📈 Analytics

Track push notification engagement:

```sql
-- Query: Notifikasi yang dikirim per kategori
SELECT 
  category,
  COUNT(*) as total_sent,
  SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as clicked
FROM notifications
JOIN products ON notifications.product_id = products.id
GROUP BY category
ORDER BY total_sent DESC;
```

---

## 🔄 Future Improvements

1. **Server-side push** - Backend kirim push langsung
2. **Scheduled notifications** - Daily summary
3. **Rich media** - Include product image di notif
4. **Actions** - Add to wishlist, share, dll
5. **Analytics** - Click tracking, conversion
6. **Telegram bot** - Notif juga via Telegram
7. **Email notifications** - For backup

---

## 📚 Resources

- [MDN - Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN - Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## 💡 Pro Tips

1. **Test dengan DevTools open** - Easier to debug
2. **Use requireInteraction** - Notif stay until user interact
3. **Tag notifications** - Prevent duplicate alerts
4. **Action buttons** - Make notif interactive
5. **Clear messaging** - User harus langsung tahu apa itu

---

**Happy pushing! 🚀🔔**
