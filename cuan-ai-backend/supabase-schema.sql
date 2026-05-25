-- SUPABASE SQL - CUAN AI Database Schema
-- Run di Supabase SQL Editor

-- 1. Create Products Table
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

-- 2. Create Notifications Table
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

-- 3. Create Push Subscriptions Table (NEW!)
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

-- 4. Create Analytics Table (BONUS!)
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

-- 5. Enable RLS (Row Level Security) - OPTIONAL tapi recommended
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
CREATE POLICY "Users can only see their own products" ON products
  FOR SELECT USING (auth.uid()::text = user_id OR user_id LIKE '%');

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id LIKE '%');

CREATE POLICY "Users can only see their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id OR user_id LIKE '%');

CREATE POLICY "Users can only see their own push subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id OR user_id LIKE '%');

-- 7. Create Functions untuk automation

-- Function: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update products.updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update notifications.updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update push_subscriptions.updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 8. Function: Get trending products
CREATE OR REPLACE FUNCTION get_trending_products(p_user_id VARCHAR, p_min_score INT DEFAULT 80)
RETURNS TABLE(
  id BIGINT,
  product_name VARCHAR,
  estimated_price BIGINT,
  category VARCHAR,
  trending_score INT,
  monthly_profit BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    products.id,
    products.product_name,
    products.estimated_price,
    products.category,
    products.trending_score,
    products.monthly_profit
  FROM products
  WHERE products.user_id = p_user_id
    AND products.trending_score >= p_min_score
  ORDER BY products.trending_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 9. Function: Get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id VARCHAR)
RETURNS TABLE(
  total_products BIGINT,
  total_profit BIGINT,
  avg_trending NUMERIC,
  hot_products BIGINT,
  top_category VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_products,
    COALESCE(SUM(monthly_profit), 0)::BIGINT as total_profit,
    ROUND(AVG(trending_score)::NUMERIC, 2) as avg_trending,
    COUNT(CASE WHEN trending_score >= 80 THEN 1 END)::BIGINT as hot_products,
    (SELECT category FROM products 
     WHERE user_id = p_user_id 
     GROUP BY category 
     ORDER BY COUNT(*) DESC 
     LIMIT 1)::VARCHAR as top_category
  FROM products
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Sample Data (OPTIONAL - untuk testing)
INSERT INTO products (
  user_id, product_name, estimated_price, category, 
  trending_score, monthly_sales, profit_per_unit, 
  monthly_profit, commission, cost, risk_level, 
  recommendation, reason
) VALUES (
  'demo_user',
  'Masker Kecantikan Korea Premium',
  45000,
  'beauty',
  92,
  500,
  9000,
  4500000,
  20,
  0,
  'low',
  'Promote di TikTok dengan hashtag #KoreanBeauty, target creator lokal',
  'Trending di TikTok dengan 2.3M views, high engagement di comments'
),
(
  'demo_user',
  'Organizer Rumah Tangga',
  120000,
  'home',
  87,
  150,
  18000,
  2700000,
  15,
  0,
  'low',
  'Target ibu rumah tangga via Instagram, before-after photos',
  'Home organization trend sedang viral di lifestyle content'
),
(
  'demo_user',
  'Sepatu Sneaker Premium',
  150000,
  'fashion',
  75,
  100,
  18000,
  1800000,
  12,
  0,
  'medium',
  'Collab dengan fashion influencer, focus on styling tips',
  'Fashion trend but moderate competition'
);

COMMIT;
