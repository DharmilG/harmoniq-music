import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// This data would ideally come from the backend or a shared config file
const levels = [
    { name: 'Beginner', points: 0 },
    { name: 'Novice', points: 1000 },
    { name: 'Apprentice', points: 2500 },
    { name: 'Adept', points: 5000 },
    { name: 'Virtuoso', points: 10000 },
    { name: 'Expert', points: 20000 },
    { name: 'Master', points: 40000 },
    { name: 'Grandmaster', points: 80000 },
    { name: 'Legend', points: 150000 },
    { name: 'Maestro', points: 300000 },
];

function getIcon(name) {
  const icons = {
    'Beginner': '🎵',
    'Novice': '🎸',
    'Apprentice': '🎹',
    'Adept': '🥁',
    'Virtuoso': '🎻',
    'Expert': '🎺',
    'Master': '🎼',
    'Grandmaster': '👑',
    'Legend': '⭐',
    'Maestro': '🏆',
  };
  return icons[name] || '🎼';
}

function getLevelInfo(points) {
    let currentLevelIndex = 0;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (points >= levels[i].points) {
            currentLevelIndex = i;
            break;
        }
    }
    const currentLevel = levels[currentLevelIndex];
    const nextLevel = levels[currentLevelIndex + 1];
    const progress = nextLevel ? ((points - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100 : 100;

    return {
        level: currentLevel.name,
        nextLevelName: nextLevel ? nextLevel.name : 'Maestro',
        progress: Math.min(100, Math.max(0, progress)),
        pointsToNextLevel: nextLevel ? nextLevel.points - points : 0,
        currentIndex: currentLevelIndex,
    };
}

export default function LearnPage() {
    const { user, getGamificationStats, loading } = useAuth();
    const [stats, setStats] = useState({ points: 0, tokens: 0 });
    const [error, setError] = useState('');
    const [showLevels, setShowLevels] = useState(false);

    useEffect(() => {
        if (user) {
            getGamificationStats()
                .then(setStats)
                .catch(err => setError(err.message || 'Failed to load stats.'));
        }
    }, [user, getGamificationStats]);

    const { level, progress, pointsToNextLevel, nextLevelName, currentIndex } = getLevelInfo(stats.points);

    return (
        <section>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <h2>Learn & Grow</h2>
                <p className="muted" style={{ marginBottom: 'var(--space-xl)' }}>Engage in activities to earn points, level up, and unlock rewards.</p>

                {error && <div className="alert error">{error}</div>}

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>{level}</h3>
                            <p className="muted small" style={{ margin: 0 }}>{stats.points?.toLocaleString() || 0} Total Points</p>
                        </div>
                        <div className="muted">
                            <strong>{stats.tokens || 0}</strong> 🎵 Tokens
                        </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-md)' }}>
                        <label className="small" htmlFor="progress">Progress to next level</label>
                        <progress id="progress" value={progress} max="100" style={{ width: '100%', margin: 'var(--space-xs) 0' }}></progress>
                        <p className="small muted" style={{ textAlign: 'right', margin: 0 }}>
                            {pointsToNextLevel > 0 ? `${pointsToNextLevel.toLocaleString()} points to ${nextLevelName}` : 'You are a Maestro!'}
                        </p>
                    </div>
                    <div style={{ marginTop: 'var(--space-md)' }}>
                        <button className="btn" onClick={() => setShowLevels(s => !s)} disabled={loading}>
                            {showLevels ? 'Hide Levels' : 'View All Levels'}
                        </button>
                    </div>
                </div>

                {showLevels && (
                    <div style={{ marginTop: 'var(--space-lg)', animation: 'fadeInUp 0.3s ease-out' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Level Progression</h3>
                        <div className="horizontal-slider">
                            {levels.map((lvl, index) => {
                                const isUnlocked = stats.points >= lvl.points;
                                const isCurrent = index === currentIndex;
                                return (
                                    <div
                                        key={index}
                                        className="card"
                                        style={{
                                            flex: '0 0 220px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            gap: 'var(--space-xs)',
                                            padding: 'var(--space-md)',
                                            background: isCurrent ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--surface)',
                                            border: `2px solid ${isCurrent ? 'var(--accent-primary)' : (isUnlocked ? 'var(--surface-elevated)' : 'var(--surface)')}`,
                                            opacity: isUnlocked ? 1 : 0.5,
                                            position: 'relative',
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            fontSize: '1.5em',
                                        }}>
                                            {isCurrent ? '👑' : (isUnlocked ? '✅' : '🔒')}
                                        </div>
                                        <span style={{ fontSize: '2.5em', marginTop: 'var(--space-md)' }}>{getIcon(lvl.name)}</span>
                                        <strong style={{ marginTop: 'var(--space-sm)' }}>{lvl.name}</strong>
                                        <p className="small muted" style={{ margin: 0 }}>
                                            {lvl.points.toLocaleString()} XP
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                    <h3>Activities</h3>
                    <div style={{ display: 'grid', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                        <div className="activity-item" style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <h4>Instrument Practice</h4>
                                <p className="small muted" style={{ flexGrow: 1 }}>Play virtual instrument games. Earn +10 for correct notes, lose -5 for wrong ones.</p>
                                <Link to="/learn/practice" className="btn" style={{ marginTop: 'auto' }}>Play Now</Link>
                            </div>
                        </div>
                        <div className="activity-item" style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <h4>Daily Quiz</h4>
                                <p className="small muted" style={{ flexGrow: 1 }}>Test your music theory knowledge. Earn +50 for completing a quiz.</p>
                                <Link to="/learn/quiz" className="btn" style={{ marginTop: 'auto' }}>Take Quiz</Link>
                            </div>
                        </div>
                        <div className="activity-item" style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <h4>Log Practice Time</h4>
                                <p className="small muted" style={{ flexGrow: 1 }}>Keep track of your real-world practice sessions. Earn +5 for every 10 minutes.</p>
                                <Link to="/learn/practice-log" className="btn" style={{ marginTop: 'auto' }}>View Log</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Add styles to hide the scrollbar --- */}
                <style>{`
                    .horizontal-slider {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                    .horizontal-slider::-webkit-scrollbar {
                        display: none; /* Chrome, Safari, and Opera */
                    }
                    .horizontal-slider {
                        /* We can also remove the bottom padding that was making space for the scrollbar */
                        padding-bottom: 4px;
                    }
                `}</style>

                {/* --- START OF FIX --- */}
                <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                    <h3>Rewards</h3>
                    <p className="muted">Use your tokens to unlock instruments, tutorials, and enter competitions.</p>
                    <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>                        
                        {/* Flex container to hold the bar and button */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 'var(--space-sm, 8px)', // Add a small gap
                            marginTop: 'var(--space-md)' 
                        }}>
                            {/* Your original button */}
                            <Link to="/rewards" className="btn primary">Visit Store</Link>
                            <Link to="/leaderboard" className="btn">🏆 Global Leaderboard</Link>
                        </div>
                    </div>
                </div>
                {/* --- END OF FIX --- */}

            </div>
        </section>
    );
}