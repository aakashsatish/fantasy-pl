import { NextRequest } from 'next/server';
import { createServerSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { teamName, players, userId } = await request.json();

    if (!userId) {
      return Response.json({ 
        success: false, 
        error: 'User ID required' 
      }, { status: 400 });
    }

    if (!players || !Array.isArray(players) || players.length !== 15) {
      return Response.json({ 
        success: false, 
        error: 'Team must have exactly 15 players' 
      }, { status: 400 });
    }

    const supabase = createServerSupabaseAdmin();

    // Start a transaction
    const { data: existingTeam, error: fetchError } = await supabase
      .from('user_teams')
      .select('id')
      .eq('user_id', userId)
      .single();

    let teamId: string;

    if (existingTeam) {
      // Update existing team
      const { error: updateError } = await supabase
        .from('user_teams')
        .update({ 
          team_name: teamName || 'My Fantasy Team',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating team:', updateError);
        return Response.json({ 
          success: false, 
          error: 'Failed to update team',
          details: JSON.stringify(updateError)
        }, { status: 500 });
      }

      teamId = existingTeam.id;

      // Delete existing team players
      const { error: deleteError } = await supabase
        .from('user_team_players')
        .delete()
        .eq('user_team_id', teamId);

      if (deleteError) {
        console.error('Error deleting existing team players:', deleteError);
        return Response.json({ 
          success: false, 
          error: 'Failed to clear existing team',
          details: JSON.stringify(deleteError)
        }, { status: 500 });
      }
    } else {
      // Create new team
      const { data: newTeam, error: insertError } = await supabase
        .from('user_teams')
        .insert({
          user_id: userId,
          team_name: teamName || 'My Fantasy Team'
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating team:', insertError, JSON.stringify(insertError));
        return Response.json({ 
          success: false, 
          error: 'Failed to create team',
          details: JSON.stringify(insertError)
        }, { status: 500 });
      }

      teamId = newTeam.id;
    }

    // Insert team players
    const teamPlayers = players.map((player: { id: number }, index: number) => ({
      user_team_id: teamId,
      player_id: player.id,
      is_captain: index === 0, // First player is captain
      is_vice_captain: index === 1 // Second player is vice captain
    }));

    const { error: playersError } = await supabase
      .from('user_team_players')
      .insert(teamPlayers);

    if (playersError) {
      console.error('Error inserting team players:', playersError, JSON.stringify(playersError));
      return Response.json({ 
        success: false, 
        error: 'Failed to save team players',
        details: JSON.stringify(playersError)
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Team saved successfully',
      teamId 
    });

  } catch (error) {
    console.error('Error saving team:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 