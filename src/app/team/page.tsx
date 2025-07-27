"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

type Player = {
  id: number;
  name: string;
  club: string;
  position: string;
  price: number;
  nationality: string;
  jersey_number: number | null;
  is_captain?: boolean;
  is_vice_captain?: boolean;
};

type SavedTeam = {
  id: string;
  team_name: string;
  players: Player[];
  created_at: string;
  updated_at: string;
};

// Function to calculate formation from players
const getFormation = (players: Player[]): string => {
  const gk = players.filter(p => p.position === 'GK').length;
  const def = players.filter(p => p.position === 'DEF').length;
  const mid = players.filter(p => p.position === 'MID').length;
  const fwd = players.filter(p => p.position === 'FWD').length;
  
  return `${def}-${mid}-${fwd}`;
};

// Validation function to check formation constraints
const validateFormation = (players: Player[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const gk = players.filter(p => p.position === 'GK').length;
  const def = players.filter(p => p.position === 'DEF').length;
  const fwd = players.filter(p => p.position === 'FWD').length;

  if (gk !== 1) {
    errors.push('Team must have exactly 1 goalkeeper');
  }
  if (def < 3) {
    errors.push('Team must have at least 3 defenders');
  }
  if (fwd < 1) {
    errors.push('Team must have at least 1 attacker');
  }

  return { isValid: errors.length === 0, errors };
};

// PlayerSlot component for the football pitch layout
const PlayerSlot = ({ 
  player, 
  onRemove, 
  onCaptain, 
  onViceCaptain,
  onSubstitute,
  selectedPlayers,
  playerIndex
}: { 
  player: Player; 
  onRemove: () => void; 
  onCaptain: () => void; 
  onViceCaptain: () => void; 
  onSubstitute?: (playerToSub: Player) => void;
  selectedPlayers: Player[];
  playerIndex: number;
}) => {
  // Get club colors and jersey styles
  const getJerseyStyle = (club: string) => {
    const styles: Record<string, { 
      bg: string; 
      text: string; 
      pattern?: string;
      collar?: string;
      sleeves?: string;
      trim?: string;
    }> = {
      'Arsenal': { 
        bg: 'bg-red-600', 
        text: 'text-white',
        sleeves: 'bg-white',
        collar: 'bg-white'
      },
      'Aston Villa': { 
        bg: 'bg-purple-600', 
        text: 'text-white',
        trim: 'bg-yellow-400'
      },
      'Bournemouth': { 
        bg: 'bg-red-600', 
        text: 'text-white',
        pattern: 'stripes-red-black'
      },
      'Brentford': { 
        bg: 'bg-red-600', 
        text: 'text-white',
        pattern: 'stripes-red-white'
      },
      'Brighton': { 
        bg: 'bg-blue-600', 
        text: 'text-white',
        trim: 'bg-white'
      },
      'Burnley': { 
        bg: 'bg-purple-600', 
        text: 'text-white',
        trim: 'bg-blue-400'
      },
      'Chelsea': { 
        bg: 'bg-blue-600', 
        text: 'text-white',
        collar: 'bg-white'
      },
      'Crystal Palace': { 
        bg: 'bg-blue-600', 
        text: 'text-white',
        pattern: 'stripes-blue-red',
        collar: 'bg-blue-600'
      },
      'Everton': { 
        bg: 'bg-blue-600', 
        text: 'text-white',
        trim: 'bg-yellow-400'
      },
      'Fulham': { 
        bg: 'bg-white', 
        text: 'text-black',
        trim: 'bg-black'
      },
      'Liverpool': { 
        bg: 'bg-red-600', 
        text: 'text-white',
        trim: 'bg-yellow-400'
      },
      'Luton': { 
        bg: 'bg-orange-600', 
        text: 'text-white'
      },
      'Manchester City': { 
        bg: 'bg-blue-400', 
        text: 'text-white',
        sleeves: 'bg-blue-600',
        collar: 'bg-blue-600'
      },
      'Manchester United': { 
        bg: 'bg-red-600', 
        text: 'text-white',
        pattern: 'stripes-red-dark'
      },
      'Newcastle': { 
        bg: 'bg-black', 
        text: 'text-white',
        pattern: 'stripes-black-white'
      },
      'Nottingham Forest': { 
        bg: 'bg-red-600', 
        text: 'text-white'
      },
      'Sheffield United': { 
        bg: 'bg-red-600', 
        text: 'text-white',
        pattern: 'stripes-red-white'
      },
      'Tottenham': { 
        bg: 'bg-white', 
        text: 'text-black',
        trim: 'bg-black'
      },
      'West Ham': { 
        bg: 'bg-purple-600', 
        text: 'text-white',
        sleeves: 'bg-blue-400',
        collar: 'bg-blue-400'
      },
      'Wolves': { 
        bg: 'bg-orange-600', 
        text: 'text-white',
        pattern: 'stripes-orange-black'
      }
    };
    return styles[club] || { bg: 'bg-gray-600', text: 'text-white' };
  };

  const jerseyStyle = getJerseyStyle(player.club);

  return (
    <div className="relative group">
      {/* Authentic Premier League Jersey */}
      <div className={`relative w-24 h-32 ${jerseyStyle.bg} ${jerseyStyle.text} shadow-lg rounded-t-lg overflow-hidden`}>
        {/* Jersey base with realistic shape */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
        
        {/* Jersey collar - varies by club */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-2 ${jerseyStyle.collar || 'bg-white/30'} rounded-b-lg`}></div>
        
        {/* Jersey sleeves - for clubs with different colored sleeves */}
        {jerseyStyle.sleeves && (
          <>
            <div className={`absolute top-2 left-0 w-4 h-18 ${jerseyStyle.sleeves} rounded-r-lg`}></div>
            <div className={`absolute top-2 right-0 w-4 h-18 ${jerseyStyle.sleeves} rounded-l-lg`}></div>
          </>
        )}
        
        {/* Jersey trim - for clubs with colored trim */}
        {jerseyStyle.trim && (
          <>
            <div className={`absolute top-0 left-0 w-full h-1 ${jerseyStyle.trim}`}></div>
            <div className={`absolute bottom-0 left-0 w-full h-1 ${jerseyStyle.trim}`}></div>
            <div className={`absolute top-0 left-0 w-1 h-full ${jerseyStyle.trim}`}></div>
            <div className={`absolute top-0 right-0 w-1 h-full ${jerseyStyle.trim}`}></div>
          </>
        )}
        
        {/* Jersey patterns - authentic club designs */}
        {jerseyStyle.pattern === 'stripes-red-black' && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-red-600 via-black to-red-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        )}
        
        {jerseyStyle.pattern === 'stripes-red-white' && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-red-600 via-white to-red-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/20 to-transparent"></div>
          </div>
        )}
        
        {jerseyStyle.pattern === 'stripes-blue-red' && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600/20 to-transparent"></div>
          </div>
        )}
        
        {jerseyStyle.pattern === 'stripes-black-white' && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-black via-white to-black opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
          </div>
        )}
        
        {jerseyStyle.pattern === 'stripes-orange-black' && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-orange-600 via-black to-orange-600 opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-600/20 to-transparent"></div>
          </div>
        )}
        
        {jerseyStyle.pattern === 'stripes-red-dark' && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-b from-red-600 via-red-800 to-red-600 opacity-60"></div>
          </div>
        )}
        
        {/* Jersey number area */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 flex items-center justify-center">
          <div className="text-xs font-bold opacity-90">#</div>
        </div>
        
        {/* Player name on jersey */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center w-full px-1">
          <div className="text-[10px] font-bold opacity-90 leading-tight">
            {player.name.length > 10 
              ? player.name.split(' ')[0]
              : player.name
            }
          </div>
        </div>
        
        {/* Club name at bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center w-full px-1">
          <div className="text-[8px] font-medium opacity-80 leading-tight">
            {player.club.length > 10 
              ? player.club.split(' ')[0]
              : player.club
            }
          </div>
        </div>
      </div>
      
      {/* Player price info */}
      <div className="absolute -bottom-8 left-0 right-0 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <div className="text-gray-300 text-center">£{player.price}m</div>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onRemove}
          className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
          title="Remove player"
        >
          ×
        </button>
        <button
          onClick={() => {}} // Info button placeholder
          className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-blue-600 shadow-lg"
          title="Player info"
        >
          i
        </button>
        {onSubstitute && selectedPlayers.length > 11 && (
          <button
            onClick={() => onSubstitute(player)}
            className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-green-600 shadow-lg"
            title="Substitute player"
          >
            ↕
          </button>
        )}
      </div>
      
      {/* Captain/Vice Captain Indicators */}
      {player.is_captain && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
          C
        </div>
      )}
      {player.is_vice_captain && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
          VC
        </div>
      )}
      
      {/* Captain/Vice Captain Selection Buttons */}
      <div className="absolute -bottom-12 left-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onCaptain}
          className={`flex-1 text-xs px-1 py-1 rounded ${
            player.is_captain 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-600 text-white hover:bg-yellow-500'
          }`}
        >
          C
        </button>
        <button
          onClick={onViceCaptain}
          className={`flex-1 text-xs px-1 py-1 rounded ${
            player.is_vice_captain 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-600 text-white hover:bg-orange-500'
          }`}
        >
          VC
        </button>
      </div>
      
      {/* Substitution indicator for bench players */}
      {playerIndex >= 11 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
          SUB
        </div>
      )}
    </div>
  );
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
  const { user, loading: authLoading } = useSupabaseUser();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("My Fantasy Team");
  const [savedTeam, setSavedTeam] = useState<SavedTeam | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

  // Auto-load team when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadSavedTeam();
    }
  }, [user, authLoading]);

  const loadSavedTeam = async () => {
    if (!user) return;
    
    setLoadingTeam(true);
    try {
      const response = await fetch(`/api/load-team?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.team) {
        setSavedTeam(data.team);
        setTeamName(data.team.team_name);
        setSelectedPlayers(data.team.players);
        setMessage(null); // No success message for auto-load
      } else if (data.success && !data.team) {
        // No team found - clear any existing team data
        setSavedTeam(null);
        setSelectedPlayers([]);
        setTeamName("My Fantasy Team");
        setMessage(null);
      }
    } catch (error) {
      console.error('Error loading team:', error);
      setMessage({ type: 'error', text: 'Failed to load team' });
    } finally {
      setLoadingTeam(false);
    }
  };

  const saveTeam = async () => {
    if (selectedPlayers.length !== FPL_RULES.TOTAL_PLAYERS) {
      setMessage({ type: 'error', text: `Team must have exactly ${FPL_RULES.TOTAL_PLAYERS} players` });
      return;
    }

    if (teamStats.budgetRemaining < 0) {
      setMessage({ type: 'error', text: 'Team is over budget' });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/save-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName,
          players: selectedPlayers,
          userId: user?.id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Team saved successfully!' });
        await loadSavedTeam(); // Refresh the saved team data
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save team' });
      }
    } catch (error) {
      console.error('Error saving team:', error);
      setMessage({ type: 'error', text: 'Failed to save team' });
    } finally {
      setSaving(false);
    }
  };

  const setCaptain = (playerId: number) => {
    setSelectedPlayers(prev => prev.map(player => ({
      ...player,
      is_captain: player.id === playerId,
      is_vice_captain: player.is_vice_captain && player.id !== playerId
    })));
  };

  const setViceCaptain = (playerId: number) => {
    setSelectedPlayers(prev => prev.map(player => ({
      ...player,
      is_vice_captain: player.id === playerId,
      is_captain: player.is_captain && player.id !== playerId
    })));
  };

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

  // Function to handle substitutions (move player between starting XI and bench)
  const handleSubstitution = (playerToSub: Player, playerToBringOn: Player) => {
    const currentIndex = selectedPlayers.findIndex(p => p.id === playerToSub.id);
    const benchIndex = selectedPlayers.findIndex(p => p.id === playerToBringOn.id);
    
    if (currentIndex < 11 && benchIndex >= 11) {
      // Substituting a starting player with a bench player
      const newTeam = [...selectedPlayers];
      [newTeam[currentIndex], newTeam[benchIndex]] = [newTeam[benchIndex], newTeam[currentIndex]];
      setSelectedPlayers(newTeam);
    }
  };

  // Auto-substitute to meet formation constraints
  const autoSubstituteForConstraints = () => {
    if (selectedPlayers.length < 11) return;
    
    const startingXI = selectedPlayers.slice(0, 11);
    const bench = selectedPlayers.slice(11);
    const validation = validateFormation(startingXI);
    
    if (validation.isValid) return;
    
    const newStartingXI = [...startingXI];
    const newBench = [...bench];
    
    // Check goalkeeper constraint
    const gkCount = startingXI.filter(p => p.position === 'GK').length;
    if (gkCount !== 1) {
      if (gkCount === 0) {
        // Need to bring in a goalkeeper from bench
        const benchGK = bench.find(p => p.position === 'GK');
        if (benchGK) {
          const benchIndex = bench.findIndex(p => p.id === benchGK.id);
          const startingIndex = startingXI.findIndex(p => p.position !== 'GK');
          if (startingIndex !== -1) {
            [newStartingXI[startingIndex], newBench[benchIndex]] = [newBench[benchIndex], newStartingXI[startingIndex]];
          }
        }
      } else if (gkCount > 1) {
        // Need to move extra goalkeepers to bench
        const extraGKs = startingXI.filter(p => p.position === 'GK').slice(1);
        const nonGKBench = bench.filter(p => p.position !== 'GK');
        extraGKs.forEach((gk, index) => {
          if (index < nonGKBench.length) {
            const gkIndex = newStartingXI.findIndex(p => p.id === gk.id);
            const benchIndex = newBench.findIndex(p => p.id === nonGKBench[index].id);
            [newStartingXI[gkIndex], newBench[benchIndex]] = [newBench[benchIndex], newStartingXI[gkIndex]];
          }
        });
      }
    }
    
    // Check defenders constraint (at least 3)
    const defCount = newStartingXI.filter(p => p.position === 'DEF').length;
    if (defCount < 3) {
      const neededDefs = 3 - defCount;
      const benchDefs = newBench.filter(p => p.position === 'DEF').slice(0, neededDefs);
      const nonDefStarting = newStartingXI.filter(p => p.position !== 'DEF' && p.position !== 'GK');
      
      benchDefs.forEach((def, index) => {
        if (index < nonDefStarting.length) {
          const defIndex = newBench.findIndex(p => p.id === def.id);
          const startingIndex = newStartingXI.findIndex(p => p.id === nonDefStarting[index].id);
          [newStartingXI[startingIndex], newBench[defIndex]] = [newBench[defIndex], newStartingXI[startingIndex]];
        }
      });
    }
    
    // Check forwards constraint (at least 1)
    const fwdCount = newStartingXI.filter(p => p.position === 'FWD').length;
    if (fwdCount < 1) {
      const benchFwd = newBench.find(p => p.position === 'FWD');
      if (benchFwd) {
        const nonFwdStarting = newStartingXI.filter(p => p.position !== 'FWD' && p.position !== 'GK');
        if (nonFwdStarting.length > 0) {
          const fwdIndex = newBench.findIndex(p => p.id === benchFwd.id);
          const startingIndex = newStartingXI.findIndex(p => p.id === nonFwdStarting[0].id);
          [newStartingXI[startingIndex], newBench[fwdIndex]] = [newBench[fwdIndex], newStartingXI[startingIndex]];
        }
      }
    }
    
    setSelectedPlayers([...newStartingXI, ...newBench]);
  };

  // Smart substitution - find best player to substitute
  const findBestSubstitution = (playerToSub: Player) => {
    const bench = selectedPlayers.slice(11);
    const samePositionBench = bench.filter(p => p.position === playerToSub.position);
    
    if (samePositionBench.length > 0) {
      // Prefer same position players
      return samePositionBench[0];
    } else {
      // Find any bench player
      return bench[0];
    }
  };

  // Auto-substitute button handler
  const handleAutoSubstitute = () => {
    autoSubstituteForConstraints();
    setMessage({
      type: 'success',
      text: 'Formation automatically adjusted to meet constraints!'
    });
  };

  // Handle manual substitution
  const handleManualSubstitution = (playerToSub: Player) => {
    const bestSub = findBestSubstitution(playerToSub);
    if (bestSub) {
      handleSubstitution(playerToSub, bestSub);
      setMessage({
        type: 'success',
        text: `${playerToSub.name} substituted with ${bestSub.name}`
      });
    } else {
      setMessage({
        type: 'error',
        text: 'No suitable substitute found'
      });
    }
  };

  const playersByPosition = {
    GK: players.filter(p => p.position === 'GK'),
    DEF: players.filter(p => p.position === 'DEF'),
    MID: players.filter(p => p.position === 'MID'),
    FWD: players.filter(p => p.position === 'FWD')
  };

  console.log('Team page - Players by position:', playersByPosition);

  if (loading || authLoading) {
    return (
      <RequireAuth>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center">
            {authLoading ? 'Checking authentication...' : 'Loading players...'}
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Pick Your Fantasy Team
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Build your dream Premier League squad with 15 players and compete for glory
          </p>
        </div>
        
        {/* Selected Team - Football Pitch Layout (Moved to top) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Selected Team ({selectedPlayers.length}/{FPL_RULES.TOTAL_PLAYERS})
          </h3>
          
          {selectedPlayers.length === 0 ? (
            <div className="text-center text-gray-400 py-8 bg-gray-800 rounded-lg">
              No players selected. Choose your 15 players to build your fantasy team.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Starting XI - Football Pitch */}
              <div className="relative bg-green-600 rounded-lg p-4 overflow-hidden max-w-3xl mx-auto">
                {/* Football pitch background with markings */}
                <div className="absolute inset-0 bg-gradient-to-b from-green-600 to-green-700 opacity-80"></div>
                <div className="absolute inset-0 border-2 border-white border-opacity-30 rounded-lg"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white bg-opacity-30 transform -translate-y-1/2"></div>
                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white bg-opacity-20 transform -translate-y-1/2"></div>
                <div className="absolute bottom-1/4 left-0 right-0 h-0.5 bg-white bg-opacity-20 transform translate-y-1/2"></div>
                
                {/* Premier League branding */}
                <div className="absolute top-2 left-4 text-white text-xs font-bold opacity-80">Premier League</div>
                <div className="absolute top-2 right-4 text-white text-xs font-bold opacity-80">Premier League</div>
                
                                  {/* Starting XI Formation */}
                  <div className="relative z-10">
                                      <div className="text-center text-white text-sm font-medium mb-6 opacity-80">
                    Starting XI - {getFormation(selectedPlayers.slice(0, 11))}
                  </div>
                  
                  {/* Formation Validation */}
                  {selectedPlayers.length >= 11 && (() => {
                    const validation = validateFormation(selectedPlayers.slice(0, 11));
                    return (
                      <div className="mb-4">
                        {validation.isValid ? (
                          <div className="text-center text-green-400 text-sm font-medium">
                            ✓ Formation is valid
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-red-400 text-sm font-medium mb-2">
                              ⚠ Formation constraints not met:
                            </div>
                            <div className="space-y-1 mb-3">
                              {validation.errors.map((error, index) => (
                                <div key={index} className="text-red-300 text-xs">
                                  • {error}
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={handleAutoSubstitute}
                              className="btn btn-secondary text-xs px-3 py-1"
                            >
                              🔄 Auto-Fix Formation
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                    
                    {/* Goalkeeper Row (Bottom) */}
                    <div className="flex justify-center mb-6">
                      <div className="flex justify-center">
                        {selectedPlayers.slice(0, 11).filter(p => p.position === 'GK').map((player, index) => (
                          <PlayerSlot 
                            key={player.id} 
                            player={player} 
                            onRemove={() => handlePlayerSelect(player)} 
                            onCaptain={() => setCaptain(player.id)} 
                            onViceCaptain={() => setViceCaptain(player.id)}
                            onSubstitute={handleManualSubstitution}
                            selectedPlayers={selectedPlayers}
                            playerIndex={selectedPlayers.findIndex(p => p.id === player.id)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Defenders Row */}
                    <div className="flex justify-center mb-6">
                      <div className="flex justify-center gap-6">
                        {selectedPlayers.slice(0, 11).filter(p => p.position === 'DEF').map((player, index) => (
                          <PlayerSlot 
                            key={player.id} 
                            player={player} 
                            onRemove={() => handlePlayerSelect(player)} 
                            onCaptain={() => setCaptain(player.id)} 
                            onViceCaptain={() => setViceCaptain(player.id)}
                            onSubstitute={handleManualSubstitution}
                            selectedPlayers={selectedPlayers}
                            playerIndex={selectedPlayers.findIndex(p => p.id === player.id)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Midfielders Row */}
                    <div className="flex justify-center mb-6">
                      <div className="flex justify-center gap-6">
                        {selectedPlayers.slice(0, 11).filter(p => p.position === 'MID').map((player, index) => (
                          <PlayerSlot 
                            key={player.id} 
                            player={player} 
                            onRemove={() => handlePlayerSelect(player)} 
                            onCaptain={() => setCaptain(player.id)} 
                            onViceCaptain={() => setViceCaptain(player.id)}
                            onSubstitute={handleManualSubstitution}
                            selectedPlayers={selectedPlayers}
                            playerIndex={selectedPlayers.findIndex(p => p.id === player.id)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Forwards Row (Top) */}
                    <div className="flex justify-center">
                      <div className="flex justify-center gap-8">
                        {selectedPlayers.slice(0, 11).filter(p => p.position === 'FWD').map((player, index) => (
                          <PlayerSlot 
                            key={player.id} 
                            player={player} 
                            onRemove={() => handlePlayerSelect(player)} 
                            onCaptain={() => setCaptain(player.id)} 
                            onViceCaptain={() => setViceCaptain(player.id)}
                            onSubstitute={handleManualSubstitution}
                            selectedPlayers={selectedPlayers}
                            playerIndex={selectedPlayers.findIndex(p => p.id === player.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
              
              {/* Bench - Separate Section */}
              {selectedPlayers.length > 11 && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-w-3xl mx-auto">
                  <div className="text-center text-white text-lg font-medium mb-6">
                    Bench ({selectedPlayers.length - 11} players)
                  </div>
                  <div className="flex justify-center">
                    <div className="flex justify-center gap-6">
                      {selectedPlayers.slice(11).map((player, index) => (
                        <PlayerSlot 
                          key={player.id} 
                          player={player} 
                          onRemove={() => handlePlayerSelect(player)} 
                          onCaptain={() => setCaptain(player.id)} 
                          onViceCaptain={() => setViceCaptain(player.id)}
                          onSubstitute={handleManualSubstitution}
                          selectedPlayers={selectedPlayers}
                          playerIndex={selectedPlayers.findIndex(p => p.id === player.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Team Management */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input min-w-[200px]"
                  placeholder="Enter team name"
                />
              </div>
              <button
                onClick={saveTeam}
                disabled={
                  saving || 
                  selectedPlayers.length !== FPL_RULES.TOTAL_PLAYERS || 
                  teamStats.budgetRemaining < 0 ||
                  (selectedPlayers.length >= 11 && !validateFormation(selectedPlayers.slice(0, 11)).isValid)
                }
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  selectedPlayers.length >= 11 && !validateFormation(selectedPlayers.slice(0, 11)).isValid
                    ? "Fix formation constraints before saving"
                    : undefined
                }
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>Save Team</span>
                )}
              </button>
            </div>
            {savedTeam && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Last saved: {new Date(savedTeam.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Auto-loading indicator */}
        {loadingTeam && user && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            Loading your saved team...
          </div>
        )}
        
        {/* Team Statistics */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Team Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Budget</span>
                <span className="text-white font-bold">£{teamStats.totalCost}m / £{FPL_RULES.BUDGET}m</span>
              </div>
              <div className={`text-sm ${teamStats.budgetRemaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {teamStats.budgetRemaining >= 0 ? `£${teamStats.budgetRemaining}m remaining` : `£${Math.abs(teamStats.budgetRemaining)}m over budget`}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${teamStats.budgetRemaining < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (teamStats.totalCost / FPL_RULES.BUDGET) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Players</span>
                <span className="text-white font-bold">{selectedPlayers.length} / {FPL_RULES.TOTAL_PLAYERS}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${(selectedPlayers.length / FPL_RULES.TOTAL_PLAYERS) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <span className="text-gray-400 font-medium">Positions</span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">GK</span>
                  <span className="text-white font-medium">{teamStats.positionCounts.GK}/{FPL_RULES.POSITION_LIMITS.GK.max}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">DEF</span>
                  <span className="text-white font-medium">{teamStats.positionCounts.DEF}/{FPL_RULES.POSITION_LIMITS.DEF.max}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">MID</span>
                  <span className="text-white font-medium">{teamStats.positionCounts.MID}/{FPL_RULES.POSITION_LIMITS.MID.max}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">FWD</span>
                  <span className="text-white font-medium">{teamStats.positionCounts.FWD}/{FPL_RULES.POSITION_LIMITS.FWD.max}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <span className="text-gray-400 font-medium">Teams</span>
              <div className="space-y-1 text-sm max-h-24 overflow-y-auto">
                {Object.entries(teamStats.playersPerClub).map(([club, count]) => (
                  <div key={club} className="flex items-center justify-between">
                    <span className="text-gray-300 truncate">{club}</span>
                    <span className="text-white font-medium">{count}/{FPL_RULES.MAX_PLAYERS_PER_TEAM}</span>
                  </div>
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
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Available Players</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {Object.entries(playersByPosition).map(([position, positionPlayers]) => (
              <div key={position} className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {position}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{positionPlayers.length} players</span>
                    <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                      <span className="text-sm text-blue-400 font-medium">
                        {teamStats.positionCounts[position as keyof typeof teamStats.positionCounts]}/{FPL_RULES.POSITION_LIMITS[position as keyof typeof FPL_RULES.POSITION_LIMITS].max}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {positionPlayers
                    .slice()
                    .sort((a, b) => b.price - a.price)
                    .map((player) => {
                      const isSelected = selectedPlayers.find(p => p.id === player.id);
                      const canSelect = validateSelection(player).length === 0;
                      return (
                        <div
                          key={player.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500/50 shadow-lg'
                              : canSelect
                              ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50 hover:border-gray-500/50 hover:scale-105'
                              : 'bg-gray-800/50 border-gray-700/50 opacity-50 cursor-not-allowed'
                          }`}
                          onClick={() => handlePlayerSelect(player)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-white truncate">{player.name}</div>
                            <div className="text-blue-400 font-bold">£{player.price}m</div>
                          </div>
                          <div className="text-sm text-gray-400">{player.club}</div>
                          {isSelected && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-blue-400 font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
