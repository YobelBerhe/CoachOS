-- ============================================
-- STRIPE CONNECT ACCOUNTS (Creator Onboarding)
-- ============================================

CREATE TABLE stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  stripe_account_id TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'express' CHECK (account_type IN ('standard', 'express', 'custom')),
  
  onboarding_complete BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  
  email TEXT,
  country TEXT DEFAULT 'US',
  currency TEXT DEFAULT 'usd',
  
  bank_account_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_stripe UNIQUE(user_id)
);

CREATE INDEX idx_stripe_accounts_user ON stripe_connect_accounts(user_id);
CREATE INDEX idx_stripe_accounts_stripe_id ON stripe_connect_accounts(stripe_account_id);

-- ============================================
-- PAYMENT TRANSACTIONS
-- ============================================

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT,
  
  amount_total INTEGER NOT NULL,
  amount_platform_fee INTEGER NOT NULL,
  amount_creator_payout INTEGER NOT NULL,
  
  currency TEXT DEFAULT 'usd',
  
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed')
  ),
  
  payout_status TEXT DEFAULT 'pending' CHECK (
    payout_status IN ('pending', 'scheduled', 'paid', 'failed')
  ),
  payout_date TIMESTAMPTZ,
  
  payment_method TEXT,
  customer_email TEXT,
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_buyer ON payment_transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON payment_transactions(seller_id);
CREATE INDEX idx_transactions_recipe ON payment_transactions(recipe_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_payout_status ON payment_transactions(payout_status);
CREATE INDEX idx_transactions_created ON payment_transactions(created_at DESC);

-- ============================================
-- CREATOR EARNINGS (Aggregated)
-- ============================================

CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  total_earnings_cents INTEGER DEFAULT 0,
  pending_payout_cents INTEGER DEFAULT 0,
  paid_out_cents INTEGER DEFAULT 0,
  
  total_sales INTEGER DEFAULT 0,
  total_unlocks INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_earnings UNIQUE(user_id)
);

CREATE INDEX idx_creator_earnings_user ON creator_earnings(user_id);

-- ============================================
-- PAYOUT BATCHES (Weekly/Monthly Payouts)
-- ============================================

CREATE TABLE payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_creators INTEGER DEFAULT 0,
  total_amount_cents INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payout_batches_period ON payout_batches(period_start, period_end);
CREATE INDEX idx_payout_batches_status ON payout_batches(status);

-- ============================================
-- INDIVIDUAL PAYOUTS
-- ============================================

CREATE TABLE individual_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES payout_batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')
  ),
  
  transaction_count INTEGER DEFAULT 0,
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_individual_payouts_batch ON individual_payouts(batch_id);
CREATE INDEX idx_individual_payouts_user ON individual_payouts(user_id);
CREATE INDEX idx_individual_payouts_status ON individual_payouts(status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_creator_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO creator_earnings (user_id, total_earnings_cents, total_sales, total_unlocks)
  VALUES (NEW.seller_id, NEW.amount_creator_payout, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_earnings_cents = creator_earnings.total_earnings_cents + NEW.amount_creator_payout,
    total_sales = creator_earnings.total_sales + 1,
    total_unlocks = creator_earnings.total_unlocks + 1,
    pending_payout_cents = creator_earnings.pending_payout_cents + NEW.amount_creator_payout,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_earnings_on_payment
AFTER INSERT ON payment_transactions
FOR EACH ROW
WHEN (NEW.status = 'succeeded')
EXECUTE FUNCTION update_creator_earnings();

-- Add revenue tracking columns to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS total_unlocks INTEGER DEFAULT 0;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE stripe_connect_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe account" ON stripe_connect_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stripe account" ON stripe_connect_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view transactions they're part of" ON payment_transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can view own earnings" ON creator_earnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payouts" ON individual_payouts
  FOR SELECT USING (auth.uid() = user_id);