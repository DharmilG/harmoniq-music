import React, { useState, useEffect } from 'react';
import { api } from '../context/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const gameNames = {
  'notefall_game': 'Notefall',
  'melodic_memory_game': 'Melodic Memory',
  'scale_runner_game': 'Scale Runner',
  'chord_builder_game': 'Chord Builder',
  'chord_challenge_game': 'Chord Progression Challenge',
  'rhythm_master_game': 'Rhythm Master'
};

export default function Leaderboard({ gameType = null, title = null }) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userEntry, setUserEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = gameType 
          ? `/api/leaderboard/${gameType}`
          : '/api/leaderboard';
        const data = await api(url);
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank);
        setUserEntry(data.userEntry);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameType]);

  const displayTitle = title || (gameType ? gameNames[gameType] || gameType : 'Global Leaderboard');

  if (loading) {
    return (
      <section>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="alert error">{error}</div>
        </div>
      </section>
    );
  }

  const formatXP = (xp) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toLocaleString();
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <section>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 var(--space-md)' }}>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>{displayTitle}</h2>
        <p className="muted" style={{ marginBottom: 'var(--space-lg)' }}>
          Rankings based on total XP earned. {gameType ? 'Top players for this game.' : 'Combined XP from all ranked games.'}
        </p>

        {userEntry && (
          <div className="card" style={{ 
            marginBottom: 'var(--space-lg)', 
            padding: 'var(--space-md)',
            background: 'var(--surface-highlight)',
            border: '2px solid var(--accent)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {getRankEmoji(userEntry.rank)}
              </div>
              <img 
                src={userEntry.avatar_url || `https://api.dicebear.com/8.x/avataaars/svg?seed=${userEntry.name}`}
                alt={userEntry.name}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>Your Rank: {userEntry.rank}</div>
                <div className="small muted">{userEntry.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                  {formatXP(userEntry.total_xp)} XP
                </div>
              </div>
            </div>
          </div>
        )}

        {leaderboard.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            <p className="muted">No players yet. Be the first to play and earn XP!</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Rank</th>
                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Player</th>
                    <th style={{ padding: 'var(--space-sm)', textAlign: 'right' }}>Total XP</th>
                    <th style={{ padding: 'var(--space-sm)', textAlign: 'right' }}>Games</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isCurrentUser = user && entry.id === user.id;
                    return (
                      <tr 
                        key={entry.id}
                        style={{ 
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: isCurrentUser ? 'var(--surface-highlight)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: 'var(--space-sm)', fontWeight: 'bold' }}>
                          {getRankEmoji(entry.rank)}
                        </td>
                        <td style={{ padding: 'var(--space-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <img 
                              src={entry.avatar_url || `https://api.dicebear.com/8.x/avataaars/svg?seed=${entry.name}`}
                              alt={entry.name}
                              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
                              {entry.name} {isCurrentUser && '(You)'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-sm)', textAlign: 'right', fontWeight: 'bold' }}>
                          {formatXP(entry.total_xp)}
                        </td>
                        <td style={{ padding: 'var(--space-sm)', textAlign: 'right', color: 'var(--text-muted)' }}>
                          {entry.games_played}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

