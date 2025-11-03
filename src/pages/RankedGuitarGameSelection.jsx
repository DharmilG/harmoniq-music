import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/apiClient.js';

const rankedGuitarGames = [
    { id: 'chord-progression', name: 'Chord Progression Challenge', description: 'Follow the chord sequence and play them in time.', path: '/learn/practice/guitar/ranked/chord-progression', comingSoon: false },
    { id: 'rhythm-master', name: 'Rhythm Master', description: 'Strum along to complex rhythms to prove your timing.', path: '/learn/practice/guitar/ranked/rhythm-master', comingSoon: false, unlockId: 'game_rhythm_master', price: 300 },
];

export default function RankedGuitarGameSelection() {
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
                <h2>Ranked Guitar: Choose a Game</h2>
                <p className="muted" style={{ marginBottom: 'var(--space-xl)' }}>Select a game to test your guitar skills and earn XP.</p>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {rankedGuitarGames.map(game => {
                        const isLocked = game.unlockId && !unlockedRewardIds.has(game.unlockId);
                        const isDisabled = game.comingSoon || isLocked;

                        return (
                        <div key={game.id} className={`card ${isDisabled ? 'disabled' : ''}`} style={{ opacity: isDisabled ? 0.6 : 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    {game.name}
                                    {isLocked && <span className="badge small" style={{ marginLeft: 'auto' }}>🔒 {game.price} Tokens</span>}
                                </h3>
                                <p className="small muted" style={{ flexGrow: 1 }}>{game.description}</p>
                                {isDisabled ? (
                                    isLocked ? (
                                        <Link to="/rewards" className="btn" style={{ marginTop: 'auto' }}>Unlock in Store</Link>
                                    ) : (
                                    <button className="btn" disabled>Play</button>
                                    )
                                ) : (
                                    <Link to={game.path} className="btn primary">Play</Link>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
                <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
                    <Link to="/learn/practice/guitar/lobby" className="btn">Back to Lobby</Link>
                </div>
            </div>
        </section>
    );
}