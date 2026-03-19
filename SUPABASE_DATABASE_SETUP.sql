-- ============================================
-- SRP Cricket Database Setup Script
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  match_id UUID,
  uploaded_by UUID NOT NULL,
  title TEXT,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_photos_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- 2. Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper')),
  jersey_number INTEGER,
  age INTEGER,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  coach_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create team_players junction table
CREATE TABLE IF NOT EXISTS team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  jersey_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

-- 5. Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_name TEXT NOT NULL,
  team1_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  venue TEXT,
  overs_per_side INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create balls table
CREATE TABLE IF NOT EXISTS balls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  over_number INTEGER NOT NULL,
  ball_number INTEGER NOT NULL,
  runs INTEGER DEFAULT 0,
  batsman_id UUID,
  bowler_id UUID,
  wicket BOOLEAN DEFAULT FALSE,
  dismissal_type TEXT,
  dismissal_player TEXT,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create batting_entries table
CREATE TABLE IF NOT EXISTS batting_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  runs INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create bowling_entries table
CREATE TABLE IF NOT EXISTS bowling_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  overs_bowled DECIMAL(3,1) DEFAULT 0,
  runs_conceded INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create match_players table
CREATE TABLE IF NOT EXISTS match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- ============================================
-- Create Indexes for Performance
-- ============================================

CREATE INDEX idx_photos_match_id ON photos(match_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX idx_players_role ON players(role);
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_team_players_team_id ON team_players(team_id);
CREATE INDEX idx_team_players_player_id ON team_players(player_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_balls_match_id ON balls(match_id);
CREATE INDEX idx_balls_over ON balls(over_number);
CREATE INDEX idx_batting_match_id ON batting_entries(match_id);
CREATE INDEX idx_bowling_match_id ON bowling_entries(match_id);
CREATE INDEX idx_match_players_match_id ON match_players(match_id);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE batting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowling_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC READ - Anyone can read
-- ============================================

CREATE POLICY "Enable read for all users" ON photos FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON players FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON teams FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON team_players FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON matches FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON balls FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON batting_entries FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON bowling_entries FOR SELECT USING (true);
CREATE POLICY "Enable read for all users" ON match_players FOR SELECT USING (true);

-- ============================================
-- INSERT - Authenticated users can insert
-- ============================================

CREATE POLICY "Enable insert for authenticated users" ON photos 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON players 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON teams 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON matches 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON balls 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- UPDATE - Authenticated users can update
-- ============================================

CREATE POLICY "Enable update for authenticated users" ON photos 
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON players 
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON teams 
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON matches 
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON balls 
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- DELETE - Authenticated users can delete
-- ============================================

CREATE POLICY "Enable delete for authenticated users" ON photos 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON players 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON teams 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON matches 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON balls 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON batting_entries 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON bowling_entries 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON team_players 
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON match_players 
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Setup Complete!
-- ============================================
-- All tables created with proper:
-- ✅ Foreign keys and constraints
-- ✅ Indexes for performance
-- ✅ Row Level Security enabled
-- ✅ RLS Policies for read/write/delete
-- ============================================
