import { createServerSupabaseAdmin } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ 
        success: false, 
        error: 'User ID required' 
      }, { status: 400 });
    }

    const supabase = createServerSupabaseAdmin();

    // Get user's team
    const { data: team, error: teamError } = await supabase
      .from('user_teams')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (teamError) {
      if (teamError.code === 'PGRST116') { // No rows returned
        return Response.json({ 
          success: true, 
          team: null,
          message: 'No team found' 
        });
      }
      console.error('Error fetching team:', teamError);
      return Response.json({ 
        success: false, 
        error: 'Failed to load team' 
      }, { status: 500 });
    }

    // Get team players with player details
    const { data: teamPlayers, error: playersError } = await supabase
      .from('user_team_players')
      .select(`
        *,
        players (
          id,
          name,
          club,
          position,
          price,
          nationality,
          jersey_number
        )
      `)
      .eq('user_team_id', team.id)
      .order('is_captain', { ascending: false })
      .order('is_vice_captain', { ascending: false });

    if (playersError) {
      console.error('Error fetching team players:', playersError);
      return Response.json({ 
        success: false, 
        error: 'Failed to load team players' 
      }, { status: 500 });
    }

    // Transform the data to match the expected format
    const players = teamPlayers?.map(tp => ({
      ...tp.players,
      is_captain: tp.is_captain,
      is_vice_captain: tp.is_vice_captain
    })) || [];

    return Response.json({ 
      success: true, 
      team: {
        ...team,
        players
      }
    });

  } catch (error) {
    console.error('Error loading team:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 