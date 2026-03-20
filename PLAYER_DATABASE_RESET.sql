-- ⚠️ DESTRUCTIVE OPERATION: Resets players and player_stats
-- SQL schema adjusted to match actual Supabase structure
-- Run this in Supabase SQL Editor

-- Step 1: Delete existing players and player_stats (cascade will handle it)
DELETE FROM player_stats WHERE player_id IN (SELECT id FROM players);
DELETE FROM players;

-- Step 2: Ensure a default team exists
INSERT INTO teams (name, logo) VALUES ('SRP Super Kings', NULL)
ON CONFLICT DO NOTHING;

-- Step 3: Get the team ID
WITH team_info AS (
  SELECT id FROM teams WHERE name = 'SRP Super Kings' LIMIT 1
)

-- Step 4: Insert all 22 squad players
INSERT INTO players (name, role, team_id, created_at)
SELECT 
  player_data.name,
  player_data.role,
  team_info.id,
  NOW()
FROM (
  VALUES 
    ('Murali', 'Batsman'),
    ('Sanju', 'Batsman'),
    ('Sravan', 'All-rounder'),
    ('Sampat', 'Batsman'),
    ('Birla', 'Bowler'),
    ('Shiva', 'All-rounder'),
    ('Laddu', 'Batsman'),
    ('Surya', 'Bowler'),
    ('Vamsi', 'Batsman'),
    ('Praveen', 'All-rounder'),
    ('C K', 'Bowler'),
    ('Abhail', 'Batsman'),
    ('Govindha', 'Bowler'),
    ('Manigada', 'All-rounder'),
    ('Vinu', 'Batsman'),
    ('Mahesh', 'Bowler'),
    ('Madhu', 'Wicket Keeper'),
    ('Charan', 'All-rounder'),
    ('Pavan Kalyan', 'Batsman'),
    ('C Charan', 'All-rounder'),
    ('Chinnu', 'Batsman'),
    ('Babulu', 'All-rounder')
) AS player_data(name, role),
team_info;

-- Step 5: Create player_stats for each player (stats initialized to 0)
INSERT INTO player_stats (player_id, matches, runs, wickets, strike_rate, economy)
SELECT id, 0, 0, 0, 0.0, 0.0
FROM players
WHERE NOT EXISTS (
  SELECT 1 FROM player_stats WHERE player_stats.player_id = players.id
);

-- Step 6: Verify insertion
SELECT COUNT(*) as total_players FROM players;
SELECT name, role FROM players ORDER BY name;
