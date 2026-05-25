// Frontend React App - CUAN AI
// Deploy ke Netlify atau Vercel

import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function App() {
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('analyzer');
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Form States
  const [productInput, setProductInput] = useState('');
  const [commission, setCommission] = useState(15);
  const [cost, setCost] = useState(0);

  // Category Filter State
  const [watchCategories, setWatchCategories] = useState({
    beauty: true,    // Kecantikan
    home: true,      // Rumah Tangga
    fashion: false,
    electronics: false,
    sports: false,
    food: false,
    other: false
  });

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalProfit: 0,
    avgTrending: 0,
    hotProducts: 0
  });

  // Initialize & Register Service Worker
  useEffect(() => {
    const savedUser = localStorage.getItem('cuanUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadData(JSON.parse(savedUser).id);
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          checkPushSupport();
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Real-time Polling untuk Notifications
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Check Push Support
  const checkPushSupport = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPushEnabled(true);
      }
    }
  };

  // Login
  const handleLogin = () => {
    const newUser = {
      id: 'user_' + Date.now(),
      email: 'user@cuan.ai',
      name: 'CUAN Trader'
    };
    localStorage.setItem('cuanUser', JSON.stringify(newUser));
    setUser(newUser);
    loadData(newUser.id);
  };

  // Load Data
  const loadData = async (userId) => {
    try {
      const productsRes = await fetch(`${API_URL}/api/products/${userId}`);
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.products);
      }

      await fetchNotifications(userId);

      const statsRes = await fetch(`${API_URL}/api/stats/${userId}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Load Error:', error);
    }
  };

  const fetchNotifications = async (userId = user?.id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${userId}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Notification Error:', error);
    }
  };

  // Request Push Permission
  const handleEnablePush = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setPushEnabled(true);

        // Subscribe to push
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          
          // Subscribe ke push (dengan dummy VAPID key)
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              'BEl62iUY0yYKqyvawk2PHl7oGyHVBIehQYJ7A8shE_TjyDi4Z84xnWBjx_sZ0KyVbVPIVJ7P_-FIVubUZmXgkA='
            )
          }).catch(() => null);

          // Save subscription
          if (subscription) {
            await fetch(`${API_URL}/api/subscribe-push`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                subscription: subscription,
                watchCategories: Object.keys(watchCategories).filter(k => watchCategories[k])
              })
            });
          }
        }

        alert('✅ Push notifications enabled! Anda akan dapat notifikasi untuk produk di kategori pilihan.');
      }
    } catch (error) {
      console.error('Push error:', error);
      alert('❌ Gagal enable push notifications');
    }
  };

  // Helper function for VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Toggle Category Watch
  const handleCategoryToggle = (category) => {
    setWatchCategories({
      ...watchCategories,
      [category]: !watchCategories[category]
    });
  };

  // Analyze Product
  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!productInput || !commission || !apiKey) {
      alert('Mohon isi semua field!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInput,
          commission: parseFloat(commission),
          cost: parseFloat(cost) || 0,
          apiKey,
          userId: user.id,
          watchCategories: Object.keys(watchCategories).filter(k => watchCategories[k])
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Produk berhasil dianalisis!');
        setProducts([data.product, ...products]);
        setStats({
          ...stats,
          totalProducts: stats.totalProducts + 1,
          totalProfit: stats.totalProfit + data.product.monthly_profit
        });
        
        // Trigger push notification jika ada
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

        setProductInput('');
        setCommission(15);
        setCost(0);
        await fetchNotifications();
      } else {
        alert('⚠️ Produk tidak matching kategori pilihan atau profit < Rp500k\n\n' + data.reason);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDelete = async (productId) => {
    if (!confirm('Hapus produk ini?')) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
        loadData(user.id);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Mark Notification as Read
  const markNotificationRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'PATCH'
      });
      await fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🚀 CUAN AI PRO</h1>
          <p>AI-Powered Shopee Affiliate Analyzer</p>
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '20px' }}>
            dengan Web Push Notifications ke HP Anda
          </p>
          <button className="btn-primary" onClick={handleLogin}>
            🚀 Mulai Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🚀 CUAN AI PRO</h1>
          <div className="header-right">
            <div className="notifications-bell">
              🔔
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
              
              {notifications.filter(n => !n.is_read).length > 0 && (
                <div className="notifications-dropdown">
                  {notifications.filter(n => !n.is_read).map(notif => (
                    <div 
                      key={notif.id} 
                      className="notification-item"
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <p>{notif.message}</p>
                      <small>{new Date(notif.created_at).toLocaleString('id-ID')}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="push-status" onClick={handleEnablePush} style={{ cursor: 'pointer' }}>
              {pushEnabled ? '✅ Push On' : '🔕 Enable Push'}
            </span>
            <span className="user-info">👤 {user.name}</span>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <section className="stats-section">
        <div className="stat-box">
          <div className="stat-label">Total Produk</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Profit Potensi/Bulan</div>
          <div className="stat-value">Rp {(stats.totalProfit / 1000000).toFixed(1)}M</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Avg Trending</div>
          <div className="stat-value">{stats.avgTrending}%</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">🔥 Hot Products</div>
          <div className="stat-value">{stats.hotProducts}</div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          🤖 AI Analyzer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'filter' ? 'active' : ''}`}
          onClick={() => setActiveTab('filter')}
        >
          🎯 Category Lock
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📊 Produk ({products.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          🔥 Trending
        </button>
      </nav>

      {/* Content */}
      <main className="content">
        {/* Analyzer Tab */}
        {activeTab === 'analyzer' && (
          <section className="analyzer-section">
            <div className="card">
              <h2>🤖 Analisis Produk dengan AI</h2>
              
              <form onSubmit={handleAnalyze}>
                <div className="form-group">
                  <label>Anthropic API Key</label>
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                  <small>Dapatkan di: console.anthropic.com (Free Trial $5)</small>
                </div>

                <div className="form-group">
                  <label>Link Shopee atau Deskripsi Produk</label>
                  <textarea 
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    placeholder="https://shopee.co.id/... atau deskripsi produk"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Komisi (%)</label>
                    <input 
                      type="number"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Modal (Rp)</label>
                    <input 
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Analyzing...' : '🎯 Analisis dengan AI'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Category Filter Tab */}
        {activeTab === 'filter' && (
          <section className="filter-section">
            <div className="card">
              <h2>🎯 Lock Kategori untuk Notifikasi</h2>
              <p style={{ color: '#aaa', marginBottom: '20px' }}>
                Pilih kategori yang Anda ingin dapat notifikasi. Hanya produk dengan trending score ≥80 & profit ≥Rp500k yang akan kirim push notification ke HP Anda.
              </p>

              <div className="category-grid">
                {[
                  { key: 'beauty', label: '💄 Kecantikan', emoji: '💄' },
                  { key: 'home', label: '🏠 Rumah Tangga', emoji: '🏠' },
                  { key: 'fashion', label: '👗 Fashion', emoji: '👗' },
                  { key: 'electronics', label: '📱 Elektronik', emoji: '📱' },
                  { key: 'sports', label: '⚽ Olahraga', emoji: '⚽' },
                  { key: 'food', label: '🍔 Makanan', emoji: '🍔' },
                ].map(({ key, label, emoji }) => (
                  <div 
                    key={key}
                    className={`category-card ${watchCategories[key] ? 'active' : ''}`}
                    onClick={() => handleCategoryToggle(key)}
                  >
                    <div className="category-emoji">{emoji}</div>
                    <div className="category-name">{label}</div>
                    <div className="category-check">
                      {watchCategories[key] ? '✅ AKTIF' : '⭕ MATIKAN'}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(6,168,125,0.1)', borderRadius: '10px', border: '1px solid rgba(6,168,125,0.3)' }}>
                <p style={{ color: 'var(--success)', fontWeight: '700', marginBottom: '10px' }}>
                  ✅ Kategori Aktif:
                </p>
                <p style={{ color: '#aaa' }}>
                  {Object.keys(watchCategories).filter(k => watchCategories[k]).join(', ') || 'Tidak ada'}
                </p>
              </div>

              <button className="btn-primary" style={{ marginTop: '20px' }} onClick={handleEnablePush}>
                {pushEnabled ? '✅ Push Notifications Sudah Aktif' : '🔔 Enable Push Notifications'}
              </button>
            </div>
          </section>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <section className="products-section">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>Belum ada produk. Mulai analisis di tab AI Analyzer!</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-header">
                      <h3>{product.product_name}</h3>
                      <span className={`trending-badge ${product.trending_score >= 80 ? 'hot' : 'good'}`}>
                        🔥 {product.trending_score}%
                      </span>
                    </div>

                    <div className="product-price">
                      Rp {(product.estimated_price).toLocaleString('id-ID')}
                    </div>

                    <div className="product-info">
                      <div>
                        <small>Komisi/Unit</small>
                        <p>Rp {(product.profit_per_unit).toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <small>Monthly Potential</small>
                        <p>Rp {(product.monthly_profit / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>

                    <p className="product-reason">{product.reason}</p>
                    <p className="product-strategy"><strong>Strategy:</strong> {product.recommendation}</p>

                    <div className="product-meta">
                      <small>{new Date(product.created_at).toLocaleString('id-ID')}</small>
                    </div>

                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <section className="trending-section">
            <div className="trending-header">
              <h2>🔥 Trending Products (Saat Ini)</h2>
            </div>
            
            {products.filter(p => p.trending_score >= 80).length === 0 ? (
              <div className="empty-state">
                <p>Belum ada produk trending. Analisis lebih banyak produk!</p>
              </div>
            ) : (
              <div className="products-grid">
                {products
                  .filter(p => p.trending_score >= 80)
                  .sort((a, b) => b.trending_score - a.trending_score)
                  .map(product => (
                    <div key={product.id} className="trending-card">
                      <div className="trending-label">🔥 TRENDING</div>
                      <h3>{product.product_name}</h3>
                      <div className="trending-score">{product.trending_score}/100</div>
                      <p className="trending-reason">{product.reason}</p>
                      <div className="trending-profit">
                        Potensi: Rp {(product.monthly_profit / 1000000).toFixed(1)}M/bulan
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

  // Real-time Polling untuk Notifications
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Login
  const handleLogin = () => {
    const newUser = {
      id: 'user_' + Date.now(),
      email: 'user@cuan.ai',
      name: 'CUAN Trader'
    };
    localStorage.setItem('cuanUser', JSON.stringify(newUser));
    setUser(newUser);
    loadData(newUser.id);
  };

  // Load Data
  const loadData = async (userId) => {
    try {
      // Fetch Products
      const productsRes = await fetch(`${API_URL}/api/products/${userId}`);
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.products);
      }

      // Fetch Notifications
      await fetchNotifications(userId);

      // Fetch Stats
      const statsRes = await fetch(`${API_URL}/api/stats/${userId}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Load Error:', error);
    }
  };

  const fetchNotifications = async (userId = user?.id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${userId}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Notification Error:', error);
    }
  };

  // Analyze Product
  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!productInput || !commission || !apiKey) {
      alert('Mohon isi semua field!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInput,
          commission: parseFloat(commission),
          cost: parseFloat(cost) || 0,
          apiKey,
          userId: user.id
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Produk berhasil dianalisis!');
        setProducts([data.product, ...products]);
        setStats({
          ...stats,
          totalProducts: stats.totalProducts + 1,
          totalProfit: stats.totalProfit + data.product.monthly_profit
        });
        
        // Reset form
        setProductInput('');
        setCommission(15);
        setCost(0);

        // Check notifications
        await fetchNotifications();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDelete = async (productId) => {
    if (!confirm('Hapus produk ini?')) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
        loadData(user.id);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Mark Notification as Read
  const markNotificationRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'PATCH'
      });
      await fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🚀 CUAN AI PRO</h1>
          <p>AI-Powered Shopee Affiliate Analyzer</p>
          <button className="btn-primary" onClick={handleLogin}>
            🚀 Mulai Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🚀 CUAN AI PRO</h1>
          <div className="header-right">
            <div className="notifications-bell">
              🔔
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
              
              {notifications.filter(n => !n.is_read).length > 0 && (
                <div className="notifications-dropdown">
                  {notifications.filter(n => !n.is_read).map(notif => (
                    <div 
                      key={notif.id} 
                      className="notification-item"
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <p>{notif.message}</p>
                      <small>{new Date(notif.created_at).toLocaleString('id-ID')}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="user-info">👤 {user.name}</span>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <section className="stats-section">
        <div className="stat-box">
          <div className="stat-label">Total Produk</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Profit Potensi/Bulan</div>
          <div className="stat-value">Rp {(stats.totalProfit / 1000000).toFixed(1)}M</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Avg Trending</div>
          <div className="stat-value">{stats.avgTrending}%</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">🔥 Hot Products</div>
          <div className="stat-value">{stats.hotProducts}</div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          🤖 AI Analyzer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📊 Produk ({products.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          🔥 Trending
        </button>
      </nav>

      {/* Content */}
      <main className="content">
        {/* Analyzer Tab */}
        {activeTab === 'analyzer' && (
          <section className="analyzer-section">
            <div className="card">
              <h2>🤖 Analisis Produk dengan AI</h2>
              
              <form onSubmit={handleAnalyze}>
                <div className="form-group">
                  <label>Anthropic API Key</label>
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                  <small>Dapatkan di: console.anthropic.com (Free Trial $5)</small>
                </div>

                <div className="form-group">
                  <label>Link Shopee atau Deskripsi Produk</label>
                  <textarea 
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    placeholder="https://shopee.co.id/... atau deskripsi produk"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Komisi (%)</label>
                    <input 
                      type="number"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Modal (Rp)</label>
                    <input 
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Analyzing...' : '🎯 Analisis dengan AI'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <section className="products-section">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>Belum ada produk. Mulai analisis di tab AI Analyzer!</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-header">
                      <h3>{product.product_name}</h3>
                      <span className={`trending-badge ${product.trending_score >= 80 ? 'hot' : 'good'}`}>
                        🔥 {product.trending_score}%
                      </span>
                    </div>

                    <div className="product-price">
                      Rp {(product.estimated_price).toLocaleString('id-ID')}
                    </div>

                    <div className="product-info">
                      <div>
                        <small>Komisi/Unit</small>
                        <p>Rp {(product.profit_per_unit).toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <small>Monthly Potential</small>
                        <p>Rp {(product.monthly_profit / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>

                    <p className="product-reason">{product.reason}</p>
                    <p className="product-strategy"><strong>Strategy:</strong> {product.recommendation}</p>

                    <div className="product-meta">
                      <small>{new Date(product.created_at).toLocaleString('id-ID')}</small>
                    </div>

                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <section className="trending-section">
            <div className="trending-header">
              <h2>🔥 Trending Products (Saat Ini)</h2>
            </div>
            
            {products.filter(p => p.trending_score >= 80).length === 0 ? (
              <div className="empty-state">
                <p>Belum ada produk trending. Analisis lebih banyak produk!</p>
              </div>
            ) : (
              <div className="products-grid">
                {products
                  .filter(p => p.trending_score >= 80)
                  .sort((a, b) => b.trending_score - a.trending_score)
                  .map(product => (
                    <div key={product.id} className="trending-card">
                      <div className="trending-label">🔥 TRENDING</div>
                      <h3>{product.product_name}</h3>
                      <div className="trending-score">{product.trending_score}/100</div>
                      <p className="trending-reason">{product.reason}</p>
                      <div className="trending-profit">
                        Potensi: Rp {(product.monthly_profit / 1000000).toFixed(1)}M/bulan
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
