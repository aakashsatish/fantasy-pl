"use client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  // Redirect authenticated users to team page
  useEffect(() => {
    if (user && !loading) {
      router.push('/team');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <span className="text-blue-400 text-sm font-medium">⚽ Premier League Fantasy</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Premier Fantasy
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Build your dream Premier League team and compete with friends in the ultimate fantasy football experience
            </p>
            
            {!user && !loading && (
              <div className="space-y-6">
                <Link
                  href="/auth"
                  className="btn btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
                >
                  <span>🚀</span>
                  <span>Get Started</span>
                </Link>
                <p className="text-gray-400 text-sm">
                  Join thousands of managers competing for glory
                </p>
              </div>
            )}
            
            {(user || loading) && (
              <div className="space-y-4">
                <div className="text-gray-400 text-lg">
                  {loading ? 'Loading your account...' : 'Redirecting to your team...'}
                </div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional tools and features to help you build the perfect fantasy team
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="card p-8 text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">⚽</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Build Your Squad</h3>
            <p className="text-gray-300 leading-relaxed">
              Select 15 players from the Premier League with a £100M budget. 
              Follow FPL rules with position limits and team restrictions.
            </p>
          </div>
          
          <div className="card p-8 text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">👑</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Captain Selection</h3>
            <p className="text-gray-300 leading-relaxed">
              Choose your captain and vice-captain for double points. 
              Make strategic decisions to maximize your team&apos;s potential.
            </p>
          </div>
          
          <div className="card p-8 text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Save & Manage</h3>
            <p className="text-gray-300 leading-relaxed">
              Save your team and load it anytime. Make transfers and 
              adjustments as the season progresses.
            </p>
          </div>
        </div>

        {/* How to Play Section */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">How to Play</h2>
            <p className="text-gray-400">Master the rules and dominate your league</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm">1</span>
                <span>Team Requirements</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>2 Goalkeepers</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>5 Defenders</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>5 Midfielders</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>3 Forwards</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Maximum 3 players per club</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>£100M budget limit</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm">2</span>
                <span>Game Features</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Real Premier League players</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>FPL-style pricing</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Captain and vice-captain selection</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Team saving and loading</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>User authentication</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Responsive design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
