-- ⚠️ DESTRUCTIVE OPERATION: Clears and resets all players
-- Run this in Supabase SQL Editor to reset player database with fresh data

-- Step 1: Delete all existing player records
DELETE FROM players;

-- Step 2: Reset sequence counter (PostgreSQL)
ALTER SEQUENCE players_id_seq RESTART WITH 1;

-- Step 3: Insert all 22 squad players with their roles
INSERT INTO players (name, role, matches, runs, wickets, strike_rate, jersey_number, created_at) VALUES
('Murali', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Sanju', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Sravan', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW()),
('Sampat', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Birla', 'Bowler', 0, 0, 0, 0.0, NULL, NOW()),
('Shiva', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW()),
('Laddu', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Surya', 'Bowler', 0, 0, 0, 0.0, NULL, NOW()),
('Vamsi', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Praveen', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW()),
('C K', 'Bowler', 0, 0, 0, 0.0, NULL, NOW()),
('Abhail', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Govindha', 'Bowler', 0, 0, 0, 0.0, NULL, NOW()),
('Manigada', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW()),
('Vinu', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Mahesh', 'Bowler', 0, 0, 0, 0.0, NULL, NOW()),
('Madhu', 'Wicket Keeper', 0, 0, 0, 0.0, NULL, NOW()),
('Charan', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW()),
('Pavan Kalyan', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('C Charan', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW()),
('Chinnu', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
('Babulu', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW());

-- Step 4: Verify insertion
SELECT COUNT(*) as total_players FROM players;
SELECT name, role FROM players ORDER BY name;
