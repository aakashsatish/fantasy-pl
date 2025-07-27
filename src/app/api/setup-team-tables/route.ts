import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    console.log('Setting up team tables...');

    // Create user_teams table
    const { error: teamsError } = await supabase
      .from('user_teams')
      .select('*')
      .limit(1);

    if (teamsError && teamsError.code === '42P01') { // Table doesn't exist
      console.log('Creating user_teams table...');
      // We'll need to create this manually in Supabase dashboard
      console.log('Please create the user_teams table manually in Supabase dashboard');
    }

    // Create user_team_players table
    const { error: playersError } = await supabase
      .from('user_team_players')
      .select('*')
      .limit(1);

    if (playersError && playersError.code === '42P01') { // Table doesn't exist
      console.log('Creating user_team_players table...');
      // We'll need to create this manually in Supabase dashboard
      console.log('Please create the user_team_players table manually in Supabase dashboard');
    }

    return Response.json({ 
      success: true, 
      message: 'Please create tables manually in Supabase dashboard',
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Go to SQL Editor',
        '3. Run the following SQL:',
        '',
        'CREATE TABLE IF NOT EXISTS user_teams (',
        '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
        '  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,',
        '  team_name TEXT NOT NULL DEFAULT \'My Fantasy Team\',',
        '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
        '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
        '  UNIQUE(user_id)',
        ');',
        '',
        'CREATE TABLE IF NOT EXISTS user_team_players (',
        '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
        '  user_team_id UUID REFERENCES user_teams(id) ON DELETE CASCADE,',
        '  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,',
        '  is_captain BOOLEAN DEFAULT FALSE,',
        '  is_vice_captain BOOLEAN DEFAULT FALSE,',
        '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
        '  UNIQUE(user_team_id, player_id)',
        ');',
        '',
        'ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE user_team_players ENABLE ROW LEVEL SECURITY;',
        '',
        'CREATE POLICY "Users can view own teams" ON user_teams FOR SELECT USING (auth.uid() = user_id);',
        'CREATE POLICY "Users can insert own teams" ON user_teams FOR INSERT WITH CHECK (auth.uid() = user_id);',
        'CREATE POLICY "Users can update own teams" ON user_teams FOR UPDATE USING (auth.uid() = user_id);',
        'CREATE POLICY "Users can delete own teams" ON user_teams FOR DELETE USING (auth.uid() = user_id);',
        '',
        'CREATE POLICY "Users can view own team players" ON user_team_players FOR SELECT USING (',
        '  EXISTS (',
        '    SELECT 1 FROM user_teams',
        '    WHERE user_teams.id = user_team_players.user_team_id',
        '    AND user_teams.user_id = auth.uid()',
        '  )',
        ');',
        'CREATE POLICY "Users can insert own team players" ON user_team_players FOR INSERT WITH CHECK (',
        '  EXISTS (',
        '    SELECT 1 FROM user_teams',
        '    WHERE user_teams.id = user_team_players.user_team_id',
        '    AND user_teams.user_id = auth.uid()',
        '  )',
        ');',
        'CREATE POLICY "Users can update own team players" ON user_team_players FOR UPDATE USING (',
        '  EXISTS (',
        '    SELECT 1 FROM user_teams',
        '    WHERE user_teams.id = user_team_players.user_team_id',
        '    AND user_teams.user_id = auth.uid()',
        '  )',
        ');',
        'CREATE POLICY "Users can delete own team players" ON user_team_players FOR DELETE USING (',
        '  EXISTS (',
        '    SELECT 1 FROM user_teams',
        '    WHERE user_teams.id = user_team_players.user_team_id',
        '    AND user_teams.user_id = auth.uid()',
        '  )',
        ');'
      ]
    });

  } catch (error) {
    console.error('Error setting up team tables:', error);
    return Response.json({ success: false, error: 'Failed to setup team tables' }, { status: 500 });
  }
} 