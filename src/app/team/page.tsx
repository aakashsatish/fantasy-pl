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

export default function TeamSelectionPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

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

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(playersByPosition).map(([position, positionPlayers]) => (
            <div key={position} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{position} ({positionPlayers.length})</h2>
              <div className="space-y-2">
                {positionPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedPlayers.find(p => p.id === player.id)
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="font-medium text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.club}</div>
                    <div className="text-sm text-gray-500">£{player.price}m</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Selected Team ({selectedPlayers.length}/15)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {selectedPlayers.map((player) => (
              <div key={player.id} className="p-2 bg-white rounded border">
                <div className="font-medium text-sm text-gray-800">{player.name}</div>
                <div className="text-xs text-gray-600">{player.position} - {player.club}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
