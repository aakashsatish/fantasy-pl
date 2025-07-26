import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Get all players
    const { data: players, error } = await supabase
      .from('players')
      .select('*');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    let updatedCount = 0;
    const updates = [];
    
    // Update positions based on player names and clubs
    for (const player of players) {
      let newPosition = 'Unknown';
      
      // Simple logic to assign positions based on common patterns
      if (player.name.includes('de Gea') || player.name.includes('Randolph')) {
        newPosition = 'GK';
      } else if (player.name.includes('Telles') || player.name.includes('Varane') || 
                 player.name.includes('Dummett') || player.name.includes('Manquillo') ||
                 player.name.includes('Aarons') || player.name.includes('Reguilón')) {
        newPosition = 'DEF';
      } else if (player.name.includes('Eriksen') || player.name.includes('Hayden') ||
                 player.name.includes('Hendrick') || player.name.includes('Stanislas') ||
                 player.name.includes('Lewis')) {
        newPosition = 'MID';
      } else if (player.name.includes('Moore')) {
        newPosition = 'FWD';
      }
      
      if (newPosition !== 'Unknown') {
        const { error: updateError } = await supabase
          .from('players')
          .update({ position: newPosition })
          .eq('id', player.id);
        
        if (!updateError) {
          updatedCount++;
          updates.push(`${player.name}: ${newPosition}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} players with correct positions`,
      totalPlayers: players.length,
      updates: updates
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
