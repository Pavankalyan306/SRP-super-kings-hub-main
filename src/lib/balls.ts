import { supabase } from './supabase';
import { BallData as UiBallData } from '@/types/cricket';

export interface BallData {
  match_id: string;
  over_number: number;
  ball_number: number;
  runs: number;
  batsman_id: string;
  bowler_id: string;
  wicket?: boolean;
  dismissal_type?: string;
  dismissal_player?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface InsertBallResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

interface LiveBallRow {
  id: string;
  match_id: string;
  innings?: "A" | "B" | null;
  over_number: number;
  ball_number: number;
  result?: string | null;
  runs?: number | null;
  batter_id?: string | null;
  batsman_id?: string | null;
  bowler_player_id?: string | null;
  bowler_id?: string | null;
  wicket?: boolean | null;
  dismissal_type?: string | null;
  dismissal_player?: string | null;
  notes?: string | null;
}

const parseFielderId = (notes?: string | null) => {
  if (!notes?.startsWith('fielder:')) return undefined;
  return notes.replace('fielder:', '') || undefined;
};

const mapLiveBallRow = (row: LiveBallRow): UiBallData => ({
  id: row.id,
  matchId: row.match_id,
  innings: row.innings || 'A',
  over: row.over_number,
  ball: row.ball_number,
  result: row.result || String(row.runs ?? 0),
  batter: row.batter_id || row.batsman_id || undefined,
  bowler: row.bowler_player_id || row.bowler_id || undefined,
  wicket: Boolean(row.wicket),
  dismissalType: row.dismissal_type || undefined,
  dismissedPlayer: row.dismissal_player || undefined,
  fielderId: parseFielderId(row.notes),
});

export async function fetchLiveBallsByMatch(matchId: string): Promise<{ data: UiBallData[]; error: string | null }> {
  const { data, error } = await supabase
    .from('balls')
    .select('*')
    .eq('match_id', matchId)
    .order('innings', { ascending: true })
    .order('over_number', { ascending: true })
    .order('ball_number', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return { data: [], error: error.message || 'Failed to fetch balls' };
  }

  return { data: ((data as LiveBallRow[]) || []).map(mapLiveBallRow), error: null };
}

export async function addLiveBall(ball: Omit<UiBallData, 'id'>): Promise<{ data: UiBallData | null; error: string | null }> {
  const resultRuns = ['0', '1', '2', '3', '4', '5', '6'].includes(ball.result) ? Number(ball.result) : 0;
  const { data, error } = await supabase
    .from('balls')
    .insert([{
      match_id: ball.matchId,
      innings: ball.innings,
      over_number: ball.over,
      ball_number: ball.ball,
      result: ball.result,
      runs: resultRuns,
      batter_id: ball.batter || null,
      batsman_id: ball.batter || null,
      bowler_player_id: ball.bowler || null,
      bowler_id: ball.bowler || null,
      wicket: Boolean(ball.wicket || ball.result === 'W'),
      dismissal_type: ball.dismissalType || (ball.result === 'W' ? 'out' : null),
      dismissal_player: ball.dismissedPlayer || (ball.result === 'W' ? ball.batter : null),
      notes: ball.fielderId ? `fielder:${ball.fielderId}` : null,
      recorded_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || 'Failed to add ball' };
  }

  return { data: mapLiveBallRow(data), error: null };
}

export async function deleteLiveBall(ballId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('balls').delete().eq('id', ballId);
  return { error: error ? error.message || 'Failed to delete ball' : null };
}

/**
 * Insert ball-by-ball data into Supabase
 * Fields: match_id, over_number, ball_number, runs, batsman_id, bowler_id
 */
export async function insertBall(ballData: BallData): Promise<InsertBallResponse> {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('User not authenticated');
      return {
        success: false,
        message: 'Authentication required',
        error: 'User is not authenticated. Please log in to record ball data.',
      };
    }

    // Validate required fields
    const requiredFields = ['match_id', 'over_number', 'ball_number', 'runs', 'batsman_id', 'bowler_id'];
    const missingFields = requiredFields.filter((field) => !ballData[field] && ballData[field] !== 0);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: 'Missing required fields',
        error: `Required fields missing: ${missingFields.join(', ')}`,
      };
    }

    // Validate over and ball numbers
    if (ballData.over_number < 0) {
      return {
        success: false,
        message: 'Invalid over number',
        error: 'Over number must be 0 or greater',
      };
    }

    if (ballData.ball_number < 1 || ballData.ball_number > 6) {
      return {
        success: false,
        message: 'Invalid ball number',
        error: 'Ball number must be between 1 and 6',
      };
    }

    if (ballData.runs < 0 || ballData.runs > 6) {
      return {
        success: false,
        message: 'Invalid runs',
        error: 'Runs must be between 0 and 6',
      };
    }

    // If wicket, validate dismissal data
    if (ballData.wicket && (!ballData.dismissal_type || !ballData.dismissal_player)) {
      return {
        success: false,
        message: 'Invalid wicket data',
        error: 'Dismissal type and player required when recording a wicket',
      };
    }

    // Insert the ball data
    const { data, error } = await supabase
      .from('balls')
      .insert([
        {
          match_id: ballData.match_id,
          over_number: ballData.over_number,
          ball_number: ballData.ball_number,
          runs: ballData.runs,
          batsman_id: ballData.batsman_id,
          bowler_id: ballData.bowler_id,
          wicket: ballData.wicket || false,
          dismissal_type: ballData.dismissal_type || null,
          dismissal_player: ballData.dismissal_player || null,
          notes: ballData.notes || null,
          recorded_by: user.id,
          recorded_at: new Date().toISOString(),
          ...ballData,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting ball:', error);
      return {
        success: false,
        message: 'Failed to insert ball data',
        error: error.message || 'Database error occurred',
      };
    }

    return {
      success: true,
      message: 'Ball data recorded successfully',
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error inserting ball:', errorMessage);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: errorMessage,
    };
  }
}

/**
 * Insert multiple balls (for batch operations)
 */
export async function insertBalls(ballsData: BallData[]): Promise<InsertBallResponse> {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'User is not authenticated',
      };
    }

    if (ballsData.length === 0) {
      return {
        success: false,
        message: 'No balls to insert',
        error: 'Balls array is empty',
      };
    }

    // Prepare data with metadata
    const preparedBalls = ballsData.map((ball) => ({
      match_id: ball.match_id,
      over_number: ball.over_number,
      ball_number: ball.ball_number,
      runs: ball.runs,
      batsman_id: ball.batsman_id,
      bowler_id: ball.bowler_id,
      wicket: ball.wicket || false,
      dismissal_type: ball.dismissal_type || null,
      dismissal_player: ball.dismissal_player || null,
      notes: ball.notes || null,
      recorded_by: user.id,
      recorded_at: new Date().toISOString(),
      ...ball,
    }));

    const { data, error } = await supabase
      .from('balls')
      .insert(preparedBalls)
      .select();

    if (error) {
      console.error('Error inserting balls:', error);
      return {
        success: false,
        message: 'Failed to insert ball data',
        error: error.message || 'Database error occurred',
      };
    }

    return {
      success: true,
      message: `${ballsData.length} ball(s) recorded successfully`,
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error inserting balls:', errorMessage);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: errorMessage,
    };
  }
}

/**
 * Fetch balls for a specific over
 */
export async function fetchBallsByOver(
  matchId: string,
  overNumber: number
): Promise<InsertBallResponse> {
  try {
    const { data, error } = await supabase
      .from('balls')
      .select('*')
      .eq('match_id', matchId)
      .eq('over_number', overNumber)
      .order('ball_number', { ascending: true });

    if (error) {
      return {
        success: false,
        message: 'Failed to fetch balls',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Balls fetched successfully',
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: errorMessage,
    };
  }
}

/**
 * Fetch all balls for a match
 */
export async function fetchBallsByMatch(matchId: string): Promise<InsertBallResponse> {
  try {
    const { data, error } = await supabase
      .from('balls')
      .select('*')
      .eq('match_id', matchId)
      .order('over_number', { ascending: true })
      .order('ball_number', { ascending: true });

    if (error) {
      return {
        success: false,
        message: 'Failed to fetch balls',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Balls fetched successfully',
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: errorMessage,
    };
  }
}
