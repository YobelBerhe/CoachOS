-- Create family_groups table
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin' or 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create family_invites table
CREATE TABLE IF NOT EXISTS family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add family_group_id to shopping_lists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'shopping_lists' AND column_name = 'family_group_id') THEN
    ALTER TABLE shopping_lists ADD COLUMN family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'shopping_lists' AND column_name = 'is_shared') THEN
    ALTER TABLE shopping_lists ADD COLUMN is_shared BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_members_group_id ON family_members(group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_code ON family_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_family ON shopping_lists(family_group_id);

-- RLS Policies
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;

-- Family Groups Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_groups' AND policyname = 'Users can view groups they are in') THEN
    CREATE POLICY "Users can view groups they are in" ON family_groups
      FOR SELECT USING (
        id IN (SELECT group_id FROM family_members WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_groups' AND policyname = 'Users can create family groups') THEN
    CREATE POLICY "Users can create family groups" ON family_groups
      FOR INSERT WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

-- Family Members Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_members' AND policyname = 'Users can view members of their groups') THEN
    CREATE POLICY "Users can view members of their groups" ON family_members
      FOR SELECT USING (
        group_id IN (SELECT group_id FROM family_members WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_members' AND policyname = 'Admins can add members') THEN
    CREATE POLICY "Admins can add members" ON family_members
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM family_members fm
          WHERE fm.group_id = family_members.group_id 
          AND fm.user_id = auth.uid() 
          AND fm.role = 'admin'
        )
      );
  END IF;
END $$;

-- Family Invites Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_invites' AND policyname = 'Users can view invites for their groups') THEN
    CREATE POLICY "Users can view invites for their groups" ON family_invites
      FOR SELECT USING (
        group_id IN (SELECT group_id FROM family_members WHERE user_id = auth.uid())
        OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_invites' AND policyname = 'Users can create invites for their groups') THEN
    CREATE POLICY "Users can create invites for their groups" ON family_invites
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM family_members 
          WHERE group_id = family_invites.group_id 
          AND user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Update shopping_lists policies to allow family access
DROP POLICY IF EXISTS "Users can view own shopping lists" ON shopping_lists;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shopping_lists' AND policyname = 'Users can view own or family shopping lists') THEN
    CREATE POLICY "Users can view own or family shopping lists" ON shopping_lists
      FOR SELECT USING (
        auth.uid() = user_id 
        OR family_group_id IN (SELECT group_id FROM family_members WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shopping_lists' AND policyname = 'Users can update shared shopping lists') THEN
    CREATE POLICY "Users can update shared shopping lists" ON shopping_lists
      FOR UPDATE USING (
        auth.uid() = user_id 
        OR family_group_id IN (SELECT group_id FROM family_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;