// ============================================================================
// CUAN AI Backend - Express.js Server
// Updated: May 27, 2026
// ============================================================================
// CHANGELOG:
// [NEW] Added JWT Authentication (register & login endpoints)
// [NEW] Added Multi-Key Claude API Rotation System
// [NEW] Added Admin Dashboard API endpoints for key management
// [NEW] Added Encryption helpers for API keys (AES-256)
// [NEW] Added bcryptjs for password hashing
// [NEW] Added jsonwebtoken for JWT generation
// [UPDATE] /api/analyze now supports multi-key rotation
// [UPDATE] Added authentication middleware for protected routes
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ─── CONFIGURATION ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here!!!'; // Must be 32 chars

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── MIDDLEWARE ──────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// ─── ENCRYPTION HELPERS ──────────────────────────────────────────
// Encrypt API keys before saving to database
function encryptKey(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt API keys from database
function decryptKey(encrypted) {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── JWT MIDDLEWARE ──────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ─── AUTHENTICATION ENDPOINTS ────────────────────────────────────

// POST /api/register - Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, full_name, phone, plan = 'basic' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password_hash: passwordHash,
          full_name: full_name || username,
          phone: phone || '',
          plan: plan || 'basic',
          status: 'pending' // Require admin approval
        }
      ])
      .select();

    if (error) {
      // Check if username/email already exists
      if (error.message.includes('duplicate')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin verification.',
      user: {
        id: data[0].id,
        username: data[0].username,
        email: data[0].email,
        plan: data[0].plan,
        status: data[0].status
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// POST /api/login - Login user
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password required' });
    }

    // Query user by username or email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${identifier},email.eq.${identifier}`)
      .limit(1);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account not active',
        details: `Your account status is: ${user.status}. Please contact admin.`
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        plan: user.plan,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// ─── ADMIN ENDPOINTS FOR CLAUDE KEY MANAGEMENT ───────────────────

// GET /api/admin/claude-keys - Get all Claude API keys (masked)
app.get('/api/admin/claude-keys', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check
    // if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('setting_key', 'claude_api_keys')
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json({ keys: [], message: 'No keys configured yet' });
    }

    let keys = [];
    try {
      const parsed = JSON.parse(data[0].setting_value);
      keys = parsed.map(k => ({
        ...k,
        key: k.key.substring(0, 10) + '...' + k.key.slice(-5) // Mask key for security
      }));
    } catch (e) {
      // Return empty if parse failed
    }

    res.json({ keys });

  } catch (error) {
    console.error('Get keys error:', error);
    res.status(500).json({ error: 'Failed to get keys', details: error.message });
  }
});

// POST /api/admin/claude-keys - Add new Claude API key
app.post('/api/admin/claude-keys', authenticateToken, async (req, res) => {
  try {
    const { key, email } = req.body;

    if (!key || !email) {
      return res.status(400).json({ error: 'API key and email required' });
    }

    // Validate key format
    if (!key.startsWith('sk-ant-')) {
      return res.status(400).json({ error: 'Invalid Claude API key format' });
    }

    // Get existing keys
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('setting_key', 'claude_api_keys')
      .limit(1);

    let keysArray = [];
    if (existing && existing.length > 0) {
      try {
        keysArray = JSON.parse(existing[0].setting_value);
      } catch (e) {
        keysArray = [];
      }
    }

    // Add new key
    const newKey = {
      id: crypto.randomUUID(),
      key: encryptKey(key),
      email,
      status: 'active',
      created_at: new Date().toISOString(),
      last_used: null,
      error_count: 0
    };

    keysArray.push(newKey);

    // Save to database
    const settingValue = JSON.stringify(keysArray);

    if (existing && existing.length > 0) {
      // Update existing
      const { error: updateError } = await supabase
        .from('settings')
        .update({ setting_value: settingValue, updated_at: new Date().toISOString() })
        .eq('setting_key', 'claude_api_keys');

      if (updateError) throw updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('settings')
        .insert([{
          setting_key: 'claude_api_keys',
          setting_value: settingValue
        }]);

      if (insertError) throw insertError;
    }

    res.status(201).json({
      success: true,
      message: 'API key added successfully',
      keyId: newKey.id,
      email: email
    });

  } catch (error) {
    console.error('Add key error:', error);
    res.status(500).json({ error: 'Failed to add key', details: error.message });
  }
});

// DELETE /api/admin/claude-keys/:id - Delete Claude API key
app.delete('/api/admin/claude-keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing keys
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('setting_key', 'claude_api_keys')
      .limit(1);

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'No keys found' });
    }

    let keysArray = JSON.parse(existing[0].setting_value);
    keysArray = keysArray.filter(k => k.id !== id);

    // Update database
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        setting_value: JSON.stringify(keysArray),
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', 'claude_api_keys');

    if (updateError) throw updateError;

    res.json({ success: true, message: 'Key deleted successfully' });

  } catch (error) {
    console.error('Delete key error:', error);
    res.status(500).json({ error: 'Failed to delete key', details: error.message });
  }
});

// ─── MULTI-KEY ROTATION HELPER ───────────────────────────────────

// Get next available Claude API key (with rotation logic)
async function getNextClaudeKey() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('setting_key', 'claude_api_keys')
      .limit(1);

    if (error || !data || data.length === 0) {
      return { key: null, error: 'No Claude API keys configured' };
    }

    let keysArray = JSON.parse(data[0].setting_value);
    const activeKeys = keysArray.filter(k => k.status === 'active');

    if (activeKeys.length === 0) {
      return { key: null, error: 'No active Claude API keys' };
    }

    // Get key with least recent usage
    const nextKey = activeKeys.reduce((prev, current) => {
      const prevTime = prev.last_used ? new Date(prev.last_used).getTime() : 0;
      const currentTime = current.last_used ? new Date(current.last_used).getTime() : 0;
      return prevTime > currentTime ? current : prev;
    });

    return { key: decryptKey(nextKey.key), keyId: nextKey.id };

  } catch (error) {
    console.error('Error getting Claude key:', error);
    return { key: null, error: error.message };
  }
}

// Update key usage in database
async function updateKeyUsage(keyId, hasError = false) {
  try {
    const { data: existing } = await supabase
      .from('settings')
      .select('*')
      .eq('setting_key', 'claude_api_keys')
      .limit(1);

    if (!existing || existing.length === 0) return;

    let keysArray = JSON.parse(existing[0].setting_value);
    const keyIndex = keysArray.findIndex(k => k.id === keyId);

    if (keyIndex >= 0) {
      keysArray[keyIndex].last_used = new Date().toISOString();
      if (hasError) {
        keysArray[keyIndex].error_count = (keysArray[keyIndex].error_count || 0) + 1;
        // Mark as quota exceeded after 3 errors
        if (keysArray[keyIndex].error_count >= 3) {
          keysArray[keyIndex].status = 'quota_exceeded';
        }
      }

      await supabase
        .from('settings')
        .update({ setting_value: JSON.stringify(keysArray), updated_at: new Date().toISOString() })
        .eq('setting_key', 'claude_api_keys');
    }
  } catch (error) {
    console.error('Error updating key usage:', error);
  }
}

// ─── UPDATED /api/analyze WITH MULTI-KEY ROTATION ────────────────

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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;

  } catch (error) {
    throw error;
  }
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { productInput, commission, cost, userId, watchCategories } = req.body;

    if (!productInput || !commission) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build prompt
    const prompt = `
Analyze this product for profitability:

Product: ${productInput}
Commission Rate: ${commission}%
Initial Cost: ${cost || 0}
User ID: ${userId}
Watch Categories: ${watchCategories || 'all'}

Provide:
1. Profit potential assessment
2. Market demand analysis
3. Competition level
4. Recommended selling price
5. Estimated ROI
6. Risk factors
7. Next steps

Format as structured JSON.
    `;

    // Get next available API key
    const { key: apiKey, keyId } = await getNextClaudeKey();

    if (!apiKey) {
      return res.status(503).json({ error: 'Claude API keys not available. Please contact admin.' });
    }

    // Try to analyze with current key
    let analysis;
    try {
      analysis = await analyzeWithClaude(prompt, apiKey);
      // Update successful usage
      await updateKeyUsage(keyId, false);
    } catch (error) {
      // Mark error and try next key
      await updateKeyUsage(keyId, true);

      // Try next key
      const { key: fallbackKey, keyId: fallbackKeyId } = await getNextClaudeKey();
      if (!fallbackKey) {
        return res.status(503).json({ error: 'All Claude API keys exhausted. Try again tomorrow.' });
      }

      analysis = await analyzeWithClaude(prompt, fallbackKey);
      await updateKeyUsage(fallbackKeyId, false);
    }

    // Parse analysis
    let analysisData;
    try {
      // Try to extract JSON from response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis };
    } catch (e) {
      analysisData = { analysis };
    }

    // Save to database
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          user_id: userId,
          product_name: productInput,
          estimated_price: cost,
          commission_rate: commission,
          analysis_result: analysisData,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    res.json({
      success: true,
      analysis: analysisData,
      productId: data[0].id
    });

  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

// ─── EXISTING ENDPOINTS (TETAP SAMA) ─────────────────────────────

app.get('/', (req, res) => {
  res.json({ message: 'CUAN AI Backend is running', version: '2.0' });
});

app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('count');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: error ? 'disconnected' : 'connected',
      server: 'running'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', details: error.message });
  }
});

app.get('/api/products/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ products: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ notifications: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('trending_score', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ trending: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subscribe-push', async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert([{ user_id: userId, subscription_data: subscription }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total_products: data.length,
      avg_commission: data.length > 0 ? (data.reduce((sum, p) => sum + (p.commission_rate || 0), 0) / data.length).toFixed(2) : 0,
      highest_potential: data.length > 0 ? Math.max(...data.map(p => p.estimated_price || 0)) : 0
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── WEBSOCKET SUPPORT ───────────────────────────────────────────

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send(JSON.stringify({ echo: message }));
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// ─── SERVER START ────────────────────────────────────────────────

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`\n✅ CUAN AI Backend is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 JWT Secret configured: ${JWT_SECRET ? 'YES' : 'NO'}`);
    console.log(`🔑 Encryption Key configured: ${ENCRYPTION_KEY ? 'YES' : 'NO'}`);
    console.log(`📦 Supabase connected: ${SUPABASE_URL ? 'YES' : 'NO'}\n`);
  });
};

startServer();

module.exports = app;
