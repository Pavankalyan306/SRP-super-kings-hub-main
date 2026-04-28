-- WARNING: DESTRUCTIVE OPERATION
-- Resets players and team-player links using the current schema.
-- Run this in Supabase SQL Editor.

BEGIN;

-- Step 1: Remove existing links, then players.
DELETE FROM team_players;
DELETE FROM players;

-- Step 2: Ensure default team exists.
INSERT INTO teams (name)
VALUES ('SRP Super Kings')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Insert 22 squad players.
INSERT INTO players (name, role, created_at, updated_at)
VALUES
  ('Murali', 'Batsman', NOW(), NOW()),
  ('Sanju', 'Batsman', NOW(), NOW()),
  ('Sravan', 'All-rounder', NOW(), NOW()),
  ('Sampat', 'Batsman', NOW(), NOW()),
  ('Birla', 'Bowler', NOW(), NOW()),
  ('Shiva', 'All-rounder', NOW(), NOW()),
  ('Laddu', 'Batsman', NOW(), NOW()),
  ('Surya', 'Bowler', NOW(), NOW()),
  ('Vamsi', 'Batsman', NOW(), NOW()),
  ('Praveen', 'All-rounder', NOW(), NOW()),
  ('C K', 'Bowler', NOW(), NOW()),
  ('Abhail', 'Batsman', NOW(), NOW()),
  ('Govindha', 'Bowler', NOW(), NOW()),
  ('Manigada', 'All-rounder', NOW(), NOW()),
  ('Vinu', 'Batsman', NOW(), NOW()),
  ('Mahesh', 'Bowler', NOW(), NOW()),
  ('Madhu', 'Wicket Keeper', NOW(), NOW()),
  ('Charan', 'All-rounder', NOW(), NOW()),
  ('Pavan Kalyan', 'Batsman', NOW(), NOW()),
  ('C Charan', 'All-rounder', NOW(), NOW()),
  ('Chinnu', 'Batsman', NOW(), NOW()),
  ('Babulu', 'All-rounder', NOW(), NOW());

-- Step 4: Link all players to SRP Super Kings.
WITH team_info AS (
  SELECT id FROM teams WHERE name = 'SRP Super Kings' LIMIT 1
)
INSERT INTO team_players (team_id, player_id, created_at)
SELECT team_info.id, p.id, NOW()
FROM players p
CROSS JOIN team_info
ON CONFLICT (team_id, player_id) DO NOTHING;

COMMIT;

-- Step 5: Verify insertion.
SELECT COUNT(*) AS total_players FROM players;
SELECT COUNT(*) AS total_team_links FROM team_players;
SELECT p.name, p.role
FROM players p
ORDER BY p.name;
