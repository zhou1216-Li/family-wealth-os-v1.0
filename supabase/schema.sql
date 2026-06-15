-- =====================================================
-- Family Wealth OS - Supabase Database Schema
-- Run this SQL in Supabase SQL Editor to create tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Storage Bucket for Avatars ──────────────────────────
-- 创建头像存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage 策略：允许所有用户上传头像
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Storage 策略：允许所有用户查看头像
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Storage 策略：允许用户更新自己的头像
CREATE POLICY "Allow public update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

-- Storage 策略：允许用户删除自己的头像
CREATE POLICY "Allow public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');

-- ─── Accounts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'credit', 'cash')),
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CNY',
  icon TEXT DEFAULT '🏦',
  color TEXT DEFAULT '#3b82f6',
  institution TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);

-- ─── Assets (先创建，因为 transactions 引用它) ──────────
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  value NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CNY',
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '#666666',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- ─── Family Members (先创建，因为 transactions 引用它) ────
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar TEXT DEFAULT '',
  email TEXT DEFAULT '',
  join_date DATE NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Transactions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  account_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  user_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  note TEXT DEFAULT '',
  note_encrypted BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- ─── Liabilities ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS liabilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  interest_rate NUMERIC(5, 2) DEFAULT 0,
  monthly_payment NUMERIC(15, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_liabilities_type ON liabilities(type);

-- ─── Budgets ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  monthly_limit NUMERIC(15, 2) NOT NULL DEFAULT 0,
  spent NUMERIC(15, 2) NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '#666666',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Goals ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  monthly_contribution NUMERIC(15, 2) DEFAULT 0,
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '#666666',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '#666666',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_type ON categories(name, type);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- ─── User Settings ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  monthly_report BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  goal_alerts BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  avatar_url TEXT DEFAULT '',
  encrypted_data TEXT DEFAULT '',
  encryption_key_hash TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ─── Login History ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  login_time TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_time ON login_history(login_time);

-- ─── Audit Logs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'LOGIN', 'LOGOUT',
    'CREATE_TRANSACTION', 'UPDATE_TRANSACTION', 'DELETE_TRANSACTION',
    'CREATE_ASSET', 'UPDATE_ASSET', 'DELETE_ASSET',
    'UPDATE_SETTINGS', 'CHANGE_PASSWORD',
    'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
    'CREATE_BUDGET', 'UPDATE_BUDGET', 'DELETE_BUDGET',
    'CREATE_GOAL', 'UPDATE_GOAL', 'DELETE_GOAL',
    'CREATE_LIABILITY', 'UPDATE_LIABILITY', 'DELETE_LIABILITY',
    'ENABLE_TWO_FACTOR', 'DISABLE_TWO_FACTOR'
  )),
  action_description TEXT DEFAULT '',
  target_type TEXT DEFAULT '',
  target_id TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ─── Row Level Security (RLS) ──────────────────────────
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Public read access (adjust as needed for your auth strategy)
CREATE POLICY "Allow public read" ON accounts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON assets FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON liabilities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON budgets FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON goals FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON family_members FOR SELECT USING (true);

-- Public insert/update/delete for accounts
CREATE POLICY "Allow public insert" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON accounts FOR DELETE USING (true);

-- Public insert/update/delete (adjust as needed)
CREATE POLICY "Allow public insert" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON assets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON assets FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON liabilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON liabilities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON liabilities FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON budgets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON budgets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON budgets FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON goals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON goals FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON family_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON family_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON family_members FOR DELETE USING (true);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON audit_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON audit_logs FOR DELETE USING (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON user_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON user_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON user_settings FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON login_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON login_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON login_history FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON login_history FOR DELETE USING (true);

-- =====================================================
-- Seed Data (Optional - run after table creation)
-- =====================================================

-- Insert sample accounts
INSERT INTO accounts (name, type, balance, currency, icon, color, institution) VALUES
  ('招商银行储蓄卡', 'checking', 85000, 'CNY', '🏦', '#e74c3c', '招商银行'),
  ('工商银行储蓄卡', 'checking', 42000, 'CNY', '🏦', '#3498db', '工商银行'),
  ('微信零钱', 'cash', 5200, 'CNY', '💬', '#2ecc71', '微信支付'),
  ('支付宝余额宝', 'savings', 38000, 'CNY', '💰', '#3498db', '蚂蚁金服'),
  ('证券账户', 'investment', 145000, 'CNY', '📈', '#e67e22', '华泰证券'),
  ('基金账户', 'investment', 60000, 'CNY', '📊', '#9b59b6', '天天基金'),
  ('招行信用卡', 'credit', -8500, 'CNY', '💳', '#e74c3c', '招商银行');

-- Insert sample assets
INSERT INTO assets (type, name, value, currency, icon, color) VALUES
  ('银行卡', '招商银行储蓄卡', 120000, 'CNY', '🏦', '#e74c3c'),
  ('银行卡', '工商银行', 38000, 'CNY', '🏦', '#c0392b'),
  ('微信', '微信零钱', 3200, 'CNY', '💬', '#2ecc71'),
  ('支付宝', '支付宝余额宝', 28000, 'CNY', '💰', '#3498db'),
  ('股票', 'A股股票账户', 85000, 'CNY', '📈', '#e67e22'),
  ('基金', '公募基金', 60000, 'CNY', '📊', '#9b59b6'),
  ('黄金', '黄金投资', 15000, 'CNY', '🥇', '#f39c12'),
  ('房产', '上海住宅', 2800000, 'CNY', '🏠', '#1abc9c'),
  ('车辆', 'Tesla Model 3', 220000, 'CNY', '🚗', '#34495e'),
  ('现金', '现金', 5000, 'CNY', '💵', '#27ae60');

-- Insert sample family members
INSERT INTO family_members (name, role, avatar, email, join_date) VALUES
  ('张伟', 'admin', '张', 'zhangwei@gmail.com', '2023-01-01'),
  ('李娜', 'editor', '李', 'lina@gmail.com', '2023-01-01'),
  ('张小明', 'viewer', '明', '', '2024-03-15');

-- Insert sample budgets
INSERT INTO budgets (category, monthly_limit, spent, icon, color) VALUES
  ('餐饮', 3000, 2090, '🍽️', '#e74c3c'),
  ('购物', 2000, 4960, '🛍️', '#3498db'),
  ('交通', 1000, 836, '🚗', '#2ecc71'),
  ('娱乐', 800, 498, '🎮', '#9b59b6'),
  ('教育', 3000, 4800, '📚', '#f39c12'),
  ('医疗', 1000, 680, '🏥', '#1abc9c'),
  ('通讯', 400, 298, '📱', '#e67e22'),
  ('水电', 600, 486, '💡', '#16a085');

-- Insert sample goals
INSERT INTO goals (name, target_amount, current_amount, target_date, monthly_contribution, icon, color) VALUES
  ('孩子大学教育基金', 500000, 88000, '2033-09-01', 3500, '🎓', '#3498db'),
  ('出国旅游基金', 80000, 32000, '2025-07-01', 5000, '✈️', '#2ecc71'),
  ('应急储备金', 200000, 163000, '2025-06-01', 8000, '🛡️', '#e67e22'),
  ('提前退休目标', 8000000, 1432700, '2040-01-01', 15000, '🏖️', '#9b59b6');

-- Insert sample liabilities
INSERT INTO liabilities (type, name, total_amount, amount, interest_rate, monthly_payment, start_date, end_date, notes) VALUES
  ('房贷', '上海住宅房贷', 2100000, 1850000, 4.1, 9200, '2020-06-01', '2050-06-01', '等额还款，每月15日自动扣款'),
  ('车贷', 'Tesla 车贷', 150000, 45000, 5.5, 2100, '2023-03-01', '2025-03-01', '即将还清'),
  ('信用卡', '招行信用卡', 50000, 8500, 18.0, 8500, '2024-12-01', '2025-01-10', '账单日10号，还款日次月10号');

-- Insert sample categories
INSERT INTO categories (name, type, icon, color) VALUES
  ('工资', 'income', '💼', '#2ecc71'),
  ('奖金', 'income', '🎁', '#f39c12'),
  ('投资收益', 'income', '📈', '#3498db'),
  ('副业', 'income', '💡', '#9b59b6'),
  ('其他收入', 'income', '💰', '#1abc9c'),
  ('餐饮', 'expense', '🍽️', '#e74c3c'),
  ('购物', 'expense', '🛍️', '#3498db'),
  ('交通', 'expense', '🚗', '#2ecc71'),
  ('娱乐', 'expense', '🎮', '#9b59b6'),
  ('教育', 'expense', '📚', '#f39c12'),
  ('医疗', 'expense', '🏥', '#1abc9c'),
  ('通讯', 'expense', '📱', '#e67e22'),
  ('水电', 'expense', '💡', '#16a085'),
  ('房租', 'expense', '🏠', '#c0392b'),
  ('房贷', 'expense', '🏢', '#e74c3c'),
  ('车贷', 'expense', '🚘', '#34495e'),
  ('信用卡还款', 'expense', '💳', '#9b59b6'),
  ('礼物', 'expense', '🎁', '#f1c40f'),
  ('旅游', 'expense', '✈️', '#3498db'),
  ('其他支出', 'expense', '📦', '#7f8c8d');
