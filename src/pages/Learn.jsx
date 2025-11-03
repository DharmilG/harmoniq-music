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
    };
}

export default function LearnPage() {
    const { user, getGamificationStats, loading } = useAuth();
    const [stats, setStats] = useState({ points: 0, tokens: 0 });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            getGamificationStats()
                .then(setStats)
                .catch(err => setError(err.message || 'Failed to load stats.'));
        }
    }, [user, getGamificationStats]);

    const { level, progress, pointsToNextLevel, nextLevelName } = getLevelInfo(stats.points);

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
                </div>

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
<<<<<<< HEAD
=======
                        <div className="activity-item" style={{ border: '1px solid var(--border-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <h4>Log Practice Time</h4>
                                <p className="small muted" style={{ flexGrow: 1 }}>Keep track of your real-world practice sessions. Earn +5 for every 10 minutes.</p>
                                <Link to="#" className="btn" style={{ marginTop: 'auto' }}>Log Time</Link>
                            </div>
                        </div>
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
                    </div>
                </div>

                {/* --- START OF FIX --- */}
                <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                    <h3>Rewards</h3>
                    <p className="muted">Use your tokens to unlock instruments, tutorials, and enter competitions.</p>
                    <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
<<<<<<< HEAD
=======
                        <p className="muted">Reward Store Coming Soon!</p>
                        
                        {/* Flex container to hold the bar and button */}
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 'var(--space-sm, 8px)', // Add a small gap
                            marginTop: 'var(--space-md)' 
                        }}>
                            {/* Your original button */}
<<<<<<< HEAD
                            <Link to="/rewards" className="btn primary">Visit Store</Link>
=======
                            <Link to="#" className="btn primary">Visit Store</Link>
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
                        </div>
                    </div>
                </div>
                {/* --- END OF FIX --- */}

            </div>
        </section>
    );
}