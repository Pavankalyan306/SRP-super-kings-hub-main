-- SQL to clear player data and fresh start with database
-- Run this in Supabase SQL Editor

-- Delete all player records (fresh start)
DELETE FROM players;

-- Reset sequence counter (PostgreSQL)
ALTER SEQUENCE players_id_seq RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as remaining_players FROM players;

-- Optional: Insert fresh player template with just names (you can add more via admin panel)
-- INSERT INTO players (name, role, matches, runs, wickets, strike_rate, jersey_number, created_at) VALUES
-- ('Player 1', 'Batsman', 0, 0, 0, 0.0, NULL, NOW()),
-- ('Player 2', 'Bowler', 0, 0, 0, 0.0, NULL, NOW()),
-- ('Player 3', 'All-rounder', 0, 0, 0, 0.0, NULL, NOW());
