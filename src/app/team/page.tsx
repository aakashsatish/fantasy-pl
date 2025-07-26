"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabaseClient";

type Player = {
  id: number;
  name: string;
  club: string;
  position: string;
  price: number;
  nationality: string;
  jersey_number: number | null;
};

// FPL Rules
const FPL_RULES = {
  BUDGET: 100, // £100M budget
  POSITION_LIMITS: {
    GK: { min: 2, max: 2 },
    DEF: { min: 5, max: 5 },
    MID: { min: 5, max: 5 },
    FWD: { min: 3, max: 3 }
  },
  MAX_PLAYERS_PER_TEAM: 3,
  TOTAL_PLAYERS: 15
};

export default function TeamSelectionPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPlayers() {
      console.log('Team page - Starting to fetch players');
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('position', { ascending: true })
        .order('name', { ascending: true });
      
      console.log('Team page - Supabase response:', { data, error });
      
      if (!error && data) {
        console.log('Team page - Setting players:', data.length, 'players');
        console.log('Team page - Sample player:', data[0]);
        setPlayers(data);
      } else {
        console.error('Team page - Error fetching players:', error);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  // Calculate team statistics
  const teamStats = {
    totalCost: selectedPlayers.reduce((sum, player) => sum + player.price, 0),
    budgetRemaining: FPL_RULES.BUDGET - selectedPlayers.reduce((sum, player) => sum + player.price, 0),
    positionCounts: {
      GK: selectedPlayers.filter(p => p.position === 'GK').length,
      DEF: selectedPlayers.filter(p => p.position === 'DEF').length,
      MID: selectedPlayers.filter(p => p.position === 'MID').length,
      FWD: selectedPlayers.filter(p => p.position === 'FWD').length
    },
    playersPerClub: selectedPlayers.reduce((acc, player) => {
      acc[player.club] = (acc[player.club] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Validate selection
  const validateSelection = (player: Player): string[] => {
    const newErrors: string[] = [];
    
    // Check if player is already selected
    if (selectedPlayers.find(p => p.id === player.id)) {
      return ['Player already selected'];
    }

    // Check budget
    if (teamStats.budgetRemaining < player.price) {
      newErrors.push(`Cannot afford ${player.name} (£${player.price}m). Budget remaining: £${teamStats.budgetRemaining}m`);
    }

    // Check position limits
    const currentPositionCount = teamStats.positionCounts[player.position as keyof typeof teamStats.positionCounts];
    const positionLimit = FPL_RULES.POSITION_LIMITS[player.position as keyof typeof FPL_RULES.POSITION_LIMITS];
    
    if (currentPositionCount >= positionLimit.max) {
      newErrors.push(`Maximum ${positionLimit.max} ${player.position} players allowed`);
    }

    // Check team limits
    const currentTeamCount = teamStats.playersPerClub[player.club] || 0;
    if (currentTeamCount >= FPL_RULES.MAX_PLAYERS_PER_TEAM) {
      newErrors.push(`Maximum ${FPL_RULES.MAX_PLAYERS_PER_TEAM} players from ${player.club} allowed`);
    }

    // Check total players
    if (selectedPlayers.length >= FPL_RULES.TOTAL_PLAYERS) {
      newErrors.push(`Maximum ${FPL_RULES.TOTAL_PLAYERS} players allowed`);
    }

    return newErrors;
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      setErrors([]);
    } else {
      // Add player
      const validationErrors = validateSelection(player);
      if (validationErrors.length === 0) {
        setSelectedPlayers([...selectedPlayers, player]);
        setErrors([]);
      } else {
        setErrors(validationErrors);
      }
    }
  };

  const playersByPosition = {
    GK: players.filter(p => p.position === 'GK'),
    DEF: players.filter(p => p.position === 'DEF'),
    MID: players.filter(p => p.position === 'MID'),
    FWD: players.filter(p => p.position === 'FWD')
  };

  console.log('Team page - Players by position:', playersByPosition);

  if (loading) {
    return (
      <RequireAuth>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center">Loading players...</div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-white">Pick Your Fantasy Team</h1>
        
        {/* Team Statistics */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-white">Team Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-white">
              <span className="font-medium">Budget:</span> £{teamStats.totalCost}m / £{FPL_RULES.BUDGET}m
              <div className={`text-xs ${teamStats.budgetRemaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {teamStats.budgetRemaining >= 0 ? `£${teamStats.budgetRemaining}m remaining` : `£${Math.abs(teamStats.budgetRemaining)}m over budget`}
              </div>
            </div>
            <div className="text-white">
              <span className="font-medium">Players:</span> {selectedPlayers.length} / {FPL_RULES.TOTAL_PLAYERS}
            </div>
            <div className="text-white">
              <span className="font-medium">Positions:</span>
              <div className="text-xs text-gray-300">
                GK: {teamStats.positionCounts.GK}/{FPL_RULES.POSITION_LIMITS.GK.max} | 
                DEF: {teamStats.positionCounts.DEF}/{FPL_RULES.POSITION_LIMITS.DEF.max} | 
                MID: {teamStats.positionCounts.MID}/{FPL_RULES.POSITION_LIMITS.MID.max} | 
                FWD: {teamStats.positionCounts.FWD}/{FPL_RULES.POSITION_LIMITS.FWD.max}
              </div>
            </div>
            <div className="text-white">
              <span className="font-medium">Teams:</span>
              <div className="text-xs text-gray-300">
                {Object.entries(teamStats.playersPerClub).map(([club, count]) => (
                  <div key={club}>{club}: {count}/{FPL_RULES.MAX_PLAYERS_PER_TEAM}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
        
        {/* Player Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(playersByPosition).map(([position, positionPlayers]) => (
            <div key={position} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {position} ({positionPlayers.length})
                <span className="text-sm text-gray-500 ml-2">
                  {teamStats.positionCounts[position as keyof typeof teamStats.positionCounts]}/{FPL_RULES.POSITION_LIMITS[position as keyof typeof FPL_RULES.POSITION_LIMITS].max}
                </span>
              </h2>
              <div className="space-y-2">
                {positionPlayers.map((player) => {
                  const isSelected = selectedPlayers.find(p => p.id === player.id);
                  const canSelect = validateSelection(player).length === 0;
                  
                  return (
                    <div
                      key={player.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-100 border-blue-500'
                          : canSelect
                          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div className="font-medium text-gray-800">{player.name}</div>
                      <div className="text-sm text-gray-600">{player.club}</div>
                      <div className="text-sm text-gray-500">£{player.price}m</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Team */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Selected Team ({selectedPlayers.length}/{FPL_RULES.TOTAL_PLAYERS})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {selectedPlayers.map((player) => (
              <div key={player.id} className="p-2 bg-white rounded border">
                <div className="font-medium text-sm text-gray-800">{player.name}</div>
                <div className="text-xs text-gray-600">{player.position} - {player.club}</div>
                <div className="text-xs text-gray-500">£{player.price}m</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
