// CUAN AI Backend - Express + Supabase
// Deploy ke Vercel atau Heroku

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Helper: Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount).replace(/^Rp\s?/, '').replace(/,/g, '.');
}

// Helper: Call Claude API
async function analyzeWithClaude(prompt, apiKey) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON dari response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

// ========== ROOT HANDLER ==========
app.get('/', (req, res) => {
  res.json({ 
    message: 'CUAN AI Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/analyze',
      products: 'GET /api/products/:userId',
      notifications: 'GET /api/notifications/:userId',
      trending: 'GET /api/trending/:userId'
    }
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'CUAN AI Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: {
      supabase_url: process.env.SUPABASE_URL ? 'SET' : 'NOT_SET',
      supabase_key: process.env.SUPABASE_KEY ? 'SET' : 'NOT_SET'
    }
  });
});

// ========== ROUTES ==========

// 1. Analyze Product dengan Category Filter & Push Notification
app.post('/api/analyze', async (req, res) => {
  try {
    const { productInput, commission, cost, apiKey, userId, watchCategories } = req.body;

    if (!productInput || !commission || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // AI Analysis
    const prompt = `
Anda adalah expert Shopee affiliate marketer. Analyze produk ini dan ekstrak informasi penting.

Input: ${productInput}

Tugas:
1. Ekstrak/estimasi HARGA produk (dalam Rp)
2. Estimasi KATEGORI produk (pilih dari: beauty, home, fashion, electronics, sports, food, other)
3. Prediksi TRENDING SCORE (0-100) berdasarkan popularity di TikTok/social
4. Estimasi MONTHLY SALES POTENTIAL (jumlah unit/bulan)
5. PROFIT ANALYSIS dengan komisi ${commission}%
6. Rekomendasi STRATEGY untuk maximize sales

Jawab HANYA JSON VALID tanpa markdown:
{
  "productName": "nama produk",
  "estimatedPrice": 150000,
  "category": "beauty",
  "trendingScore": 85,
  "monthlySalesPotential": 200,
  "priceRange": "150-170k",
  "reason": "alasan trending",
  "profitPerUnit": 22500,
  "monthlyProfitPotential": 4500000,
  "riskLevel": "low",
  "recommendation": "strategi marketing"
}`;

    const analysis = await analyzeWithClaude(prompt, apiKey);

    // Save ke Supabase
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          user_id: userId,
          product_name: analysis.productName,
          estimated_price: analysis.estimatedPrice,
          category: analysis.category,
          trending_score: analysis.trendingScore,
          monthly_sales: analysis.monthlySalesPotential,
          profit_per_unit: analysis.profitPerUnit,
          monthly_profit: analysis.monthlyProfitPotential,
          commission: commission,
          cost: cost || 0,
          risk_level: analysis.riskLevel,
          recommendation: analysis.recommendation,
          reason: analysis.reason,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    // Check if should send notification
    const shouldNotify = 
      analysis.trendingScore >= 80 && 
      watchCategories && 
      watchCategories.includes(analysis.category) &&
      analysis.monthlyProfitPotential >= 500000; // Minimum profit

    if (shouldNotify) {
      // Save notification to DB
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            product_id: data[0].id,
            type: 'trending_alert',
            message: `🔥 ${analysis.productName} - ${analysis.category.toUpperCase()}! Rp${formatCurrency(analysis.monthlyProfitPotential)}/bulan`,
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]);

      res.json({
        success: true,
        product: data[0],
        analysis: analysis,
        shouldPush: true,
        pushData: {
          title: `🔥 PRODUK EMAS: ${analysis.productName}`,
          body: `${analysis.category} | Rp${formatCurrency(analysis.monthlyProfitPotential)}/bulan`,
          icon: '🔥',
          badge: '/badge.png',
          tag: `product-${data[0].id}`,
          requireInteraction: true
        }
      });
    } else {
      res.json({
        success: true,
        product: data[0],
        analysis: analysis,
        shouldPush: false,
        reason: !watchCategories?.includes(analysis.category) 
          ? 'Category not in watch list' 
          : analysis.trendingScore < 80 
          ? 'Trending score < 80' 
          : 'Profit < Rp500k'
      });
    }

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Subscribe untuk Web Push Notifications
app.post('/api/subscribe-push', async (req, res) => {
  try {
    const { userId, subscription, watchCategories } = req.body;

    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert([
        {
          user_id: userId,
          subscription: subscription,
          watch_categories: watchCategories,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Push notifications enabled!'
    });

  } catch (error) {
    console.error('Subscribe Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Unsubscribe Web Push
app.post('/api/unsubscribe-push', async (req, res) => {
  try {
    const { userId } = req.body;

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });

  } catch (error) {
    console.error('Unsubscribe Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Get User Products
app.get('/api/products/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      products: data
    });

  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Get Notifications
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      notifications: data
    });

  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Mark Notification as Read
app.patch('/api/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      notification: data[0]
    });

  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Delete Product
app.delete('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    res.json({ success: true });

  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 8. Get Dashboard Stats
app.get('/api/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const totalProducts = data.length;
    const totalProfit = data.reduce((sum, p) => sum + p.monthly_profit, 0);
    const avgTrending = data.length > 0 
      ? Math.round(data.reduce((sum, p) => sum + p.trending_score, 0) / data.length)
      : 0;
    const hotProducts = data.filter(p => p.trending_score >= 80).length;

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalProfit,
        avgTrending,
        hotProducts
      }
    });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 9. Real-time Trending Products
app.get('/api/trending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gte('trending_score', 80)
      .order('trending_score', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({
      success: true,
      trending: data
    });

  } catch (error) {
    console.error('Trending Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10. Get trending products by user
app.get('/api/trending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .gte('trending_score', 80)
      .order('trending_score', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({
      success: true,
      trending: data,
      count: data.length
    });

  } catch (error) {
    console.error('Trending Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 11. Get push preferences
app.get('/api/push-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      success: true,
      preferences: data || {
        watch_categories: ['beauty', 'home'],
        is_active: false
      }
    });

  } catch (error) {
    console.error('Preferences Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 12. Update push preferences
app.patch('/api/push-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { watchCategories, isActive } = req.body;

    const { data, error } = await supabase
      .from('push_subscriptions')
      .update({
        watch_categories: watchCategories,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      preferences: data[0]
    });

  } catch (error) {
    console.error('Update Preferences Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 13. Log analytics
app.post('/api/analytics', async (req, res) => {
  try {
    const { userId, action, productId, metadata } = req.body;

    const { data, error } = await supabase
      .from('analytics')
      .insert([
        {
          user_id: userId,
          action,
          product_id: productId || null,
          metadata: metadata || null,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    res.json({ success: true, analytics: data[0] });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 14. Test endpoint untuk push
app.post('/api/test-push', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type: 'test',
          message: '🧪 Test notification - Push working!',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ]);

    res.json({ 
      success: true,
      message: 'Test notification sent!'
    });

  } catch (error) {
    console.error('Test Push Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 CUAN AI Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
