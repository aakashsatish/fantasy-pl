import { createServerSupabaseClient, getServerUser } from '@/lib/supabase-server';

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'No user found',
        debug: 'User is null'
      }, { status: 401 });
    }

    return Response.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email
      },
      message: 'Authentication working'
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return Response.json({ 
      success: false, 
      error: 'Test auth failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 