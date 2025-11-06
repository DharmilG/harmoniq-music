import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock data for levels and instruments
const levels = [
    { name: 'Beginner', points: 0, level: 1 },
    { name: 'Novice', points: 1000, level: 2 },
    { name: 'Apprentice', points: 2500, level: 3 },
    { name: 'Adept', points: 5000, level: 4 },
    { name: 'Virtuoso', points: 10000, level: 5 },
    { name: 'Expert', points: 20000, level: 6 },
    { name: 'Master', points: 40000, level: 7 },
    { name: 'Grandmaster', points: 80000, level: 8 },
    { name: 'Legend', points: 150000, level: 9 },
    { name: 'Maestro', points: 300000, level: 10 },
];

const instruments = [
    { id: 'piano', name: 'Piano', description: 'Basic 8 minor and 4 major keys.', unlockLevel: 1, path: '/learn/practice/piano/lobby' },
    { id: 'guitar', name: 'Guitar', description: 'Acoustic guitar with basic chords.', unlockLevel: 3, path: '/learn/practice/guitar/lobby' },
];

function getUserLevel(points) {
    let currentLevel = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (points >= levels[i].points) {
            currentLevel = levels[i];
            break;
        }
    }
    return currentLevel.level;
}

export default function InstrumentSelection() {
    const { user, getGamificationStats } = useAuth();
    const [stats, setStats] = useState({ points: 0 });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            getGamificationStats()
                .then(setStats)
                .catch(err => setError(err.message || 'Failed to load stats.'));
        }
    }, [user, getGamificationStats]);

    const userLevel = getUserLevel(stats.points);

    return (
        <section>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <h2>Choose Your Instrument</h2>
                <p className="muted" style={{ marginBottom: 'var(--space-xl)' }}>Select an instrument to start your practice session.</p>

                {error && <div className="alert error">{error}</div>}

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
                    {instruments.map(instrument => {
                        const isUnlocked = userLevel >= instrument.unlockLevel;
                        return (
                            <div key={instrument.id} className={`card ${!isUnlocked ? 'disabled' : ''}`} style={{ opacity: isUnlocked ? 1 : 0.6 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        {instrument.name}
                                        {!isUnlocked && <span className="badge small" style={{ marginLeft: 'auto' }}>🔒 Lv. {instrument.unlockLevel}</span>}
                                    </h3>
                                    <p className="small muted" style={{ flexGrow: 1 }}>{instrument.description}</p>
                                    {isUnlocked ? (
                                        <Link to={instrument.path} className="btn primary" style={{ marginTop: 'auto' }}>Play</Link>
                                    ) : (
                                        <button className="btn" disabled>Locked</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}