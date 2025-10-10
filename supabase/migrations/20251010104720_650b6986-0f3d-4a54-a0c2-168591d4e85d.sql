-- Fix RLS policies for payout_batches table
-- Only service role can manage payout batches
CREATE POLICY "Service role only for payout batches" ON payout_batches
  FOR ALL USING (false);