import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/apiClient.js';

const rankedGames = [
    { id: 'notefall', name: 'Notefall', description: 'Play the falling notes in sync to score points.', path: '/learn/practice/piano/ranked/notefall', gameType: 'notefall_game', comingSoon: false },
    { id: 'melodic-memory', name: 'Melodic Memory', description: 'Listen to a sequence of notes and play them back. (Simon Says)', path: '/learn/practice/piano/ranked/melodic-memory', gameType: 'melodic_memory_game', comingSoon: false },
    { id: 'scale-runner', name: 'Scale Runner', description: 'Play scales with speed and accuracy to master your technique.', path: '/learn/practice/piano/ranked/scale-runner', gameType: 'scale_runner_game', comingSoon: false },
    { id: 'chord-builder', name: 'Chord Builder', description: 'Quickly form the requested chords on the piano.', path: '/learn/practice/piano/ranked/chord-builder', gameType: 'chord_builder_game', comingSoon: false, unlockId: 'game_chord_builder', price: 500 },
];

export default function RankedGameSelection() {
    const { user } = useAuth();
    const [unlockedRewardIds, setUnlockedRewardIds] = useState(new Set());

    useEffect(() => {
        if (user) {
            api('/api/user/rewards')
                .then(data => setUnlockedRewardIds(new Set(data.unlockedRewardIds)))
                .catch(err => console.error("Failed to fetch user rewards", err));
        }
    }, [user]);

    return (
        <section>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <h2>Ranked Mode: Choose a Game</h2>
                <p className="muted" style={{ marginBottom: 'var(--space-xl)' }}>
                    Select a game to test your skills and earn XP.
                </p>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {rankedGames.map(game => {
                        const isLocked = game.unlockId && !unlockedRewardIds.has(game.unlockId);
                        const isDisabled = game.comingSoon || isLocked;

                        return (
                            <div key={game.id} className={`card ${isDisabled ? 'disabled' : ''}`} style={{ opacity: isDisabled ? 0.6 : 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        {game.name}
                                        {game.comingSoon && (
                                            <span className="badge small" style={{ marginLeft: 'auto' }}>
                                                Coming Soon
                                            </span>
                                        )}
                                        {isLocked && (
                                            <span className="badge small" style={{ marginLeft: 'auto' }}>
                                                🔒 {game.price} Tokens
                                            </span>
                                        )}
                                    </h3>

                                    <p className="small muted" style={{ flexGrow: 1 }}>
                                        {game.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'auto' }}>
                                        {isDisabled ? (
                                            isLocked ? (
                                                <Link to="/rewards" className="btn" style={{ flex: 1 }}>
                                                    Unlock in Store
                                                </Link>
                                            ) : (
                                                <button className="btn" disabled style={{ flex: 1 }}>
                                                    Play
                                                </button>
                                            )
                                        ) : (
                                            <Link to={game.path} className="btn primary" style={{ flex: 1 }}>
                                                Play
                                            </Link>
                                        )}
                                        {game.gameType && (
                                            <Link to={`/leaderboard/${game.gameType}`} className="btn" style={{ flex: 1 }}>
                                                🏆 Leaderboard
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-xl)', gap: 'var(--space-md)' }}>
                    <Link to="/learn/practice/piano/lobby" className="btn">
                        Back to Lobby
                    </Link>
                    <Link to="/leaderboard" className="btn">
                        View Global Leaderboard
                    </Link>
                </div>
            </div>
        </section>
    );
}
