import { supabase } from './supabase';

export interface Team {
  id: string;
  name: string;
  shortCode?: string;
  logo?: string;
  color?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FetchTeamsResponse {
  data: Team[] | null;
  error: string | null;
  isLoading: boolean;
}

export interface TeamStats {
  id: string;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  runsFor: number;
  runsAgainst: number;
}

/**
 * Fetch all teams from Supabase
 */
export async function fetchTeams(): Promise<FetchTeamsResponse> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return {
        data: null,
        error: error.message || 'Failed to fetch teams',
        isLoading: false,
      };
    }

    return {
      data: data as Team[] | null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error fetching teams:', errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Fetch a single team by ID
 */
export async function fetchTeamById(teamId: string): Promise<FetchTeamsResponse> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) {
      console.error(`Error fetching team ${teamId}:`, error);
      return {
        data: null,
        error: error.message || `Failed to fetch team ${teamId}`,
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Team] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching team ${teamId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Create a new team (admin only)
 */
export async function createTeam(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<FetchTeamsResponse> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        data: null,
        error: 'Authentication required',
        isLoading: false,
      };
    }

    // Check if team already exists
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .ilike('name', teamData.name)
      .single();

    if (existing) {
      return {
        data: null,
        error: 'Team with this name already exists',
        isLoading: false,
      };
    }

    const { data, error } = await supabase
      .from('teams')
      .insert([{
        ...teamData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return {
        data: null,
        error: error.message || 'Failed to create team',
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Team] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error creating team:', errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Update a team (admin only)
 */
export async function updateTeam(
  teamId: string,
  updates: Partial<Team>
): Promise<FetchTeamsResponse> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        data: null,
        error: 'Authentication required',
        isLoading: false,
      };
    }

    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating team ${teamId}:`, error);
      return {
        data: null,
        error: error.message || 'Failed to update team',
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Team] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error updating team ${teamId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Delete a team (admin only)
 */
export async function deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      console.error(`Error deleting team ${teamId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to delete team',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error deleting team ${teamId}:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get team statistics with aggregated match data
 */
export async function getTeamStats(teamId: string): Promise<{
  data: TeamStats | null;
  error: string | null;
}> {
  try {
    // Fetch team info
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
      .single();

    if (teamError || !teamData) {
      return {
        data: null,
        error: teamError?.message || 'Team not found',
      };
    }

    // Fetch matches where team participated (as teamA or teamB)
    const { data: matches } = await supabase
      .from('matches')
      .select('id, team_a, team_b, status, result')
      .or(`team_a.eq.${teamId},team_b.eq.${teamId}`);

    const totalMatches = matches?.length || 0;
    let wins = 0;
    let runsFor = 0;
    let runsAgainst = 0;

    // Count wins and aggregate runs
    if (matches) {
      for (const match of matches) {
        const isTeamA = match.team_a === teamId;
        const isTeamB = match.team_b === teamId;

        // Count wins based on result
        if (match.status === 'completed' && match.result) {
          if ((isTeamA && match.result.includes('Team A')) || 
              (isTeamB && match.result.includes('Team B'))) {
            wins++;
          }
        }

        // Fetch balls for this match to calculate runs
        const { data: balls } = await supabase
          .from('balls')
          .select('runs, batter_id')
          .eq('match_id', match.id);

        if (balls) {
          for (const ball of balls) {
            const runs = parseInt(ball.runs) || 0;
            runsFor += runs;
            runsAgainst += (6 - runs); // Simplified: assumes max 6 per ball
          }
        }
      }
    }

    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    return {
      data: {
        id: teamId,
        name: teamData.name,
        matches: totalMatches,
        wins,
        losses,
        winRate: Math.round(winRate * 100) / 100,
        runsFor,
        runsAgainst,
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching stats for team ${teamId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
    };
  }
}

/**
 * Get team roster (all players in the team)
 */
export async function getTeamRoster(teamId: string): Promise<{
  data: any[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('team_players')
      .select(`
        *,
        player:players(id, name, role, jersey_number)
      `)
      .eq('team_id', teamId)
      .order('jersey_number', { ascending: true });

    if (error) {
      return {
        data: null,
        error: error.message || 'Failed to fetch team roster',
      };
    }

    return {
      data: data,
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      data: null,
      error: errorMessage,
    };
  }
}

/**
 * Add player to team roster
 */
export async function addPlayerToTeam(
  teamId: string,
  playerId: string,
  jerseyNumber?: number,
  role?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const { error } = await supabase
      .from('team_players')
      .insert([{
        team_id: teamId,
        player_id: playerId,
        jersey_number: jerseyNumber,
        role: role,
      }]);

    if (error) {
      console.error(`Error adding player to team:`, error);
      return {
        success: false,
        error: error.message || 'Failed to add player to team',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error adding player to team:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Remove player from team roster
 */
export async function removePlayerFromTeam(
  teamId: string,
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const { error } = await supabase
      .from('team_players')
      .delete()
      .eq('team_id', teamId)
      .eq('player_id', playerId);

    if (error) {
      console.error(`Error removing player from team:`, error);
      return {
        success: false,
        error: error.message || 'Failed to remove player from team',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error removing player from team:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
