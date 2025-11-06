import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard.jsx';

const gameNames = {
  'notefall_game': 'Notefall',
  'melodic_memory_game': 'Melodic Memory',
  'scale_runner_game': 'Scale Runner',
  'chord_builder_game': 'Chord Builder',
  'chord_challenge_game': 'Chord Progression Challenge',
  'rhythm_master_game': 'Rhythm Master'
};

export default function LeaderboardPage() {
  const { gameType } = useParams();
  const title = gameType ? `${gameNames[gameType] || gameType} Leaderboard` : 'Global Leaderboard';

  return (
    <section>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 var(--space-md)' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/learn" className="link-accent small">← Back to Learn</Link>
        </div>
        <Leaderboard gameType={gameType} title={title} />
      </div>
    </section>
  );
}

