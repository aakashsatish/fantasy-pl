import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const API_KEY = '211d5a748778f70d37532fb1ecb1e78c';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const debugInfo: string[] = [];
    debugInfo.push('Starting player seeding...');
    
    // Clear existing players first
    await supabase.from('players').delete().neq('id', 0);
    debugInfo.push('Cleared existing players');
    
    // Fetch Premier League teams (season 2023 - available in free plan)
    const teamsResponse = await fetch('https://v3.football.api-sports.io/teams?league=39&season=2023', {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    
    if (!teamsResponse.ok) {
      throw new Error(`Failed to fetch teams: ${teamsResponse.statusText}`);
    }
    
    const teamsData = await teamsResponse.json();
    debugInfo.push(`Teams response status: ${teamsResponse.status}`);
    debugInfo.push(`Teams found: ${teamsData.response?.length || 0}`);
    
    const teams = teamsData.response || [];
    
    let totalPlayers = 0;
    const errors: string[] = [];
    
    // Fetch players for each team
    for (const team of teams.slice(0, 3)) { // Limit to 3 teams for testing
      debugInfo.push(`Processing team: ${team.team.name} (ID: ${team.team.id})`);
      
      try {
        const playersResponse = await fetch(`https://v3.football.api-sports.io/players?team=${team.team.id}&season=2023`, {
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        });
        
        if (!playersResponse.ok) {
          errors.push(`Failed to fetch players for ${team.team.name}: ${playersResponse.statusText}`);
          continue;
        }
        
        const playersData = await playersResponse.json();
        debugInfo.push(`Players found for ${team.team.name}: ${playersData.response?.length || 0}`);
        
        const players = playersData.response || [];
        
        // Process and insert players
        for (const player of players.slice(0, 5)) { // Limit to 5 players per team for testing
          console.log('Raw player data:', player);
          console.log('Player statistics:', player.statistics);
          
          const playerData = {
            name: player.player.name,
            club: team.team.name,
            position: mapPosition(player.statistics?.[0]?.games?.position || player.player.type || 'Unknown'),
            price: generateFantasyPrice(player.statistics?.[0]?.games?.position || player.player.type || 'Unknown'),
            nationality: player.player.nationality,
            jersey_number: player.statistics?.[0]?.games?.number || null
          };
          
          console.log('Processed player data:', playerData);
          
          const { error } = await supabase.from('players').insert(playerData);
          if (!error) {
            totalPlayers++;
            debugInfo.push(`Successfully inserted player: ${player.player.name}`);
          } else {
            debugInfo.push(`Error inserting player ${player.player.name}: ${error.message}`);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errors.push(`Error processing ${team.team.name}: ${error}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${totalPlayers} players`,
      debug: debugInfo,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function mapPosition(apiPosition: string): string {
  console.log('Mapping position:', apiPosition);
  
  // API-Football uses different position codes
  const positionMap: { [key: string]: string } = {
    'G': 'GK',
    'D': 'DEF', 
    'M': 'MID',
    'F': 'FWD',
    'GK': 'GK',
    'DEF': 'DEF',
    'MID': 'MID',
    'FWD': 'FWD',
    'FW': 'FWD',
    'MF': 'MID',
    'DF': 'DEF'
  };
  
  const mappedPosition = positionMap[apiPosition] || 'Unknown';
  console.log('Mapped position:', apiPosition, '->', mappedPosition);
  return mappedPosition;
}

function generateFantasyPrice(position: string): number {
  // Simple price generation based on position
  const basePrices = {
    'GK': 4.5,
    'DEF': 5.0,
    'MID': 6.0,
    'FWD': 7.5
  };
  return basePrices[position as keyof typeof basePrices] || 5.0;
}
