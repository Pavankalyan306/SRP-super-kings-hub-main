# Database Schema Issues & Fixes

## Problem Identified

The app's TypeScript model expects player stats directly on the `Player` object:
```typescript
interface Player {
  id: string;
  name: string;
  role: string;
  matches: number;    // ❌ Not in DB
  runs: number;       // ❌ Not in DB
  wickets: number;    // ❌ Not in DB
  strikeRate: number; // ❌ Not in DB
}
```

But the Supabase schema has stats in a separate `player_stats` table:
```sql
CREATE TABLE public.players (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  team_id uuid REFERENCES teams(id),
  role text,
  created_at timestamp
);

CREATE TABLE public.player_stats (
  id uuid PRIMARY KEY,
  player_id uuid REFERENCES players(id),
  matches integer DEFAULT 0,
  runs integer DEFAULT 0,
  wickets integer DEFAULT 0,
  strike_rate numeric,
  economy numeric
);
```

---

## Solution

### Option 1: Use Updated SQL Script (Recommended)
Run the fixed SQL in `PLAYER_DATABASE_RESET.sql` which:
- ✅ Inserts players with correct schema
- ✅ Creates player_stats records automatically
- ✅ Links players to a default team

### Option 2: Modify App to Join Tables
Update `src/lib/players.ts` to join `players` + `player_stats`:

```typescript
export async function fetchPlayers(): Promise<FetchPlayersResponse> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*, player_stats(*)')  // Join player_stats
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform to flatten player_stats
    const transformed = data?.map(p => ({
      ...p,
      matches: p.player_stats?.[0]?.matches || 0,
      runs: p.player_stats?.[0]?.runs || 0,
      wickets: p.player_stats?.[0]?.wickets || 0,
      strikeRate: p.player_stats?.[0]?.strike_rate || 0,
    }));

    return { data: transformed, error: null, isLoading: false };
  } catch (err) {
    return { data: null, error: err.message, isLoading: false };
  }
}
```

---

## Execution Steps

1. **Open Supabase SQL Editor**
2. **Run the fixed SQL from `PLAYER_DATABASE_RESET.sql`**
3. **Verify execution**: Should see `22` total_players
4. **Refresh app**: Players page should load with database data

---

## Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `column "matches" does not exist` | Schema mismatch | Use corrected SQL script |
| `relation "teams" does not exist` | Teams table missing | SQL creates it if needed |
| `Foreign key violation` | team_id not found | SQL handles this with INSERT...SELECT |

---

## Verification Queries

Run these to verify data integrity:

```sql
-- Check all players
SELECT COUNT(*) as player_count FROM players;

-- Check all player stats
SELECT COUNT(*) as stats_count FROM player_stats;

-- Check players without stats
SELECT p.id, p.name FROM players p
LEFT JOIN player_stats ps ON p.id = ps.player_id
WHERE ps.id IS NULL;

-- View complete data
SELECT p.id, p.name, p.role, ps.matches, ps.runs, ps.wickets, ps.strike_rate
FROM players p
LEFT JOIN player_stats ps ON p.id = ps.player_id
ORDER BY p.name;
```
