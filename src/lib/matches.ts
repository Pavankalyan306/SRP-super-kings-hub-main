import { supabase } from './supabase';
import { Match } from '@/types/cricket';

export interface FetchMatchesResponse {
  data: Match[] | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Fetch all matches from Supabase
 */
export async function fetchMatches(): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*');

    if (error) {
      console.error('Error fetching matches:', error);
      return {
        data: null,
        error: error.message || 'Failed to fetch matches',
        isLoading: false,
      };
    }

    return {
      data: data as Match[] | null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error fetching matches:', errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Fetch a single match by ID
 */
export async function fetchMatchById(matchId: string): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) {
      console.error(`Error fetching match ${matchId}:`, error);
      return {
        data: null,
        error: error.message || `Failed to fetch match ${matchId}`,
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Match] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching match ${matchId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Fetch matches by status
 */
export async function fetchMatchesByStatus(
  status: 'upcoming' | 'live' | 'completed'
): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', status);

    if (error) {
      console.error(`Error fetching ${status} matches:`, error);
      return {
        data: null,
        error: error.message || `Failed to fetch ${status} matches`,
        isLoading: false,
      };
    }

    return {
      data: data as Match[] | null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error fetching ${status} matches:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Create a new match
 */
export async function createMatch(matchData: Omit<Match, 'id'>): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return {
        data: null,
        error: error.message || 'Failed to create match',
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Match] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error creating match:', errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Update a match
 */
export async function updateMatch(
  matchId: string,
  updates: Partial<Match>
): Promise<FetchMatchesResponse> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating match ${matchId}:`, error);
      return {
        data: null,
        error: error.message || `Failed to update match ${matchId}`,
        isLoading: false,
      };
    }

    return {
      data: data ? [data as Match] : null,
      error: null,
      isLoading: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error updating match ${matchId}:`, errorMessage);
    return {
      data: null,
      error: errorMessage,
      isLoading: false,
    };
  }
}

/**
 * Delete a match
 */
export async function deleteMatch(matchId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) {
      console.error(`Error deleting match ${matchId}:`, error);
      return {
        error: error.message || `Failed to delete match ${matchId}`,
      };
    }

    return { error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error(`Error deleting match ${matchId}:`, errorMessage);
    return { error: errorMessage };
  }
}

/**
 * Insert a new match (requires authentication)
 * Fields: team1_id, team2_id, status, match_date
 */
export interface InsertMatchData {
  team1_id: string;
  team2_id: string;
  status: 'upcoming' | 'live' | 'completed';
  match_date: string;
  venue?: string;
  [key: string]: any; // Allow additional fields
}

export interface InsertMatchResponse {
  success: boolean;
  message: string;
  data?: Match;
  error?: string;
}

export async function insertMatch(matchData: InsertMatchData): Promise<InsertMatchResponse> {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('User not authenticated');
      return {
        success: false,
        message: 'Authentication required to insert a match',
        error: 'User is not authenticated. Please log in to create a match.',
      };
    }

    // Validate required fields
    if (!matchData.team1_id || !matchData.team2_id) {
      return {
        success: false,
        message: 'Missing required fields',
        error: 'team1_id and team2_id are required',
      };
    }

    if (!matchData.status || !['upcoming', 'live', 'completed'].includes(matchData.status)) {
      return {
        success: false,
        message: 'Invalid status',
        error: "Status must be 'upcoming', 'live', or 'completed'",
      };
    }

    if (!matchData.match_date) {
      return {
        success: false,
        message: 'Missing required field',
        error: 'match_date is required',
      };
    }

    // Insert the match
    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          team1_id: matchData.team1_id,
          team2_id: matchData.team2_id,
          status: matchData.status,
          match_date: matchData.match_date,
          venue: matchData.venue || null,
          created_by: user.id,
          created_at: new Date().toISOString(),
          ...matchData,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting match:', error);
      return {
        success: false,
        message: 'Failed to insert match',
        error: error.message || 'Database error occurred while inserting the match',
      };
    }

    return {
      success: true,
      message: 'Match created successfully',
      data: data as Match,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error inserting match:', errorMessage);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: errorMessage,
    };
  }
}
