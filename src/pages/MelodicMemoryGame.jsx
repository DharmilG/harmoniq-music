import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PianoPractice.css';

const keyMap = {
    'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
    's': 'C#4', 'd': 'D#4', 'g': 'F#4', 'h': 'G#4', 'j': 'A#4',
    ',': 'C5',
};

const noteToKey = Object.entries(keyMap).reduce((acc, [key, note]) => {
    acc[note] = key;
    return acc;
}, {});

const allKeys = [
    { note: 'C4', type: 'white' }, { note: 'C#4', type: 'black' }, { note: 'D4', type: 'white' },
    { note: 'D#4', type: 'black' }, { note: 'E4', type: 'white' }, { note: 'F4', type: 'white' },
    { note: 'F#4', type: 'black' }, { note: 'G4', type: 'white' }, { note: 'G#4', type: 'black' },
    { note: 'A4', type: 'white' }, { note: 'A#4', type: 'black' }, { note: 'B4', type: 'white' },
    { note: 'C5', type: 'white' },
];

const availableNotes = allKeys.map(k => k.note);

function getReward(accuracy) {
    if (accuracy === 100) return { xp: 500, tokens: 1 };
    if (accuracy >= 90) return { xp: 250, tokens: 0.75 };
    if (accuracy >= 80) return { xp: 125, tokens: 0.5 };
    if (accuracy >= 70) return { xp: 60, tokens: 0.25 };
    if (accuracy >= 60) return { xp: 40, tokens: 0 };
    if (accuracy >= 50) return { xp: 20, tokens: 0 };
    return { xp: 0, tokens: 0 };
}

export default function MelodicMemoryGame() {
    const { logActivity } = useAuth();
    const navigate = useNavigate();
    const sampler = useRef(null);

    const [isLoaded, setLoaded] = useState(false);
    const [activeNotes, setActiveNotes] = useState(new Set());
    const [gameState, setGameState] = useState('idle'); // idle, watching, playing, gameOver
    const [sequence, setSequence] = useState([]);
    const [userSequence, setUserSequence] = useState([]);
    const [message, setMessage] = useState('Click "Start Game" to play!');
    const [gameSummary, setGameSummary] = useState(null);

    // --- Audio Setup ---
    useEffect(() => {
        sampler.current = new Tone.Sampler({
            urls: { C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3", C5: "C5.mp3" },
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => setLoaded(true)
        }).toDestination();
        return () => { if (sampler.current) sampler.current.dispose(); };
    }, []);

    const playNoteAudio = useCallback(async (note, duration = '8n') => {
        if (!sampler.current || !isLoaded) return;
        if (Tone.context.state !== 'running') await Tone.start();
        sampler.current.triggerAttackRelease(note, duration);
    }, [isLoaded]);

    // --- Game Logic ---
    const playSequence = useCallback(async (seq) => {
        setGameState('watching');
        setMessage('Watch and listen...');
        for (let i = 0; i < seq.length; i++) {
            const note = seq[i];
            setActiveNotes(prev => new Set(prev).add(note));
            await playNoteAudio(note);
            await new Promise(resolve => setTimeout(resolve, 300));
            setActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(note);
                return newSet;
            });
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        setGameState('playing');
        setMessage('Your turn!');
    }, [playNoteAudio]);

    const nextRound = useCallback(() => {
        const nextNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        const newSequence = [...sequence, nextNote];
        setSequence(newSequence);
        setUserSequence([]);
        playSequence(newSequence);
    }, [sequence, playSequence]);

    const startGame = useCallback(() => {
        setGameSummary(null);
        setSequence([]);
        const firstNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        const firstSequence = [firstNote];
        setSequence(firstSequence);
        setUserSequence([]);
        playSequence(firstSequence);
    }, [playSequence]);

    const handleUserPlay = useCallback(async (note) => {
        if (gameState !== 'playing') return;

        playNoteAudio(note);
        setActiveNotes(prev => new Set(prev).add(note));
        setTimeout(() => setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(note);
            return newSet;
        }), 200);

        const newUserSequence = [...userSequence, note];
        setUserSequence(newUserSequence);

        // Check if the played note is correct so far
        if (sequence[newUserSequence.length - 1] !== note) {
            setGameState('gameOver');
            const totalNotes = Math.max(1, sequence.length); // Ensure we don't divide by zero
            const correctNotes = userSequence.length - 1; // Only count correctly played notes
            const accuracy = totalNotes > 0 ? Math.round((correctNotes / totalNotes) * 100) : 0;
            const reward = getReward(accuracy);

            setMessage(`Game Over! You completed ${totalNotes} round(s).`);
            setGameSummary({
                rounds: totalNotes,
                accuracy,
                reward,
            });
            if (reward.xp > 0 || reward.tokens > 0) {
                logActivity({ type: 'melodic_memory_game', pointsEarned: reward.xp, tokensEarned: reward.tokens });
            }
            return;
        }

        // If sequence is complete and correct
        if (newUserSequence.length === sequence.length) {
            setMessage('Correct! Get ready for the next note...');
            setTimeout(nextRound, 1500);
        }
    }, [gameState, userSequence, sequence, playNoteAudio, nextRound, logActivity]);

    // --- Keyboard Handling ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            const note = keyMap[e.key.toLowerCase()];
            if (note && isLoaded && gameState === 'playing') {
                e.preventDefault();
                handleUserPlay(note);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUserPlay, isLoaded, gameState]);


    if (gameSummary) {
        const tokensEarned = gameSummary.reward.tokens;
        const xpEarned = gameSummary.reward.xp;
        
        return (
            <section>
                <div
                    className="card"
                    style={{
                        maxWidth: 640,
                        margin: "0 auto",
                        textAlign: "center",
                        padding: "var(--space-lg)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-lg)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
                        <h3 style={{ margin: 0 }}>{gameSummary.accuracy < 50 ? 'Challenge Failed' : 'Game Over!'}</h3>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "var(--space-md)",
                            alignItems: "stretch",
                        }}
                    >
                        <div
                            style={{
                                background: "rgba(59,130,246,0.06)",
                                padding: "var(--space-md)",
                                borderRadius: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 96,
                            }}
                        >
                            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Rounds Completed</div>
                            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{gameSummary.rounds}</div>
                        </div>

                        <div
                            style={{
                                background: "rgba(99,102,241,0.06)",
                                padding: "var(--space-md)",
                                borderRadius: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 96,
                            }}
                        >
                            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Accuracy</div>
                            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{gameSummary.accuracy}%</div>
                        </div>

                        <div
                            style={{
                                background: "rgba(74,222,128,0.06)",
                                padding: "var(--space-md)",
                                borderRadius: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 96,
                            }}
                        >
                            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>XP Earned</div>
                            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{xpEarned}</div>
                        </div>

                        <div
                            style={{
                                background: "rgba(251,146,60,0.06)",
                                padding: "var(--space-md)",
                                borderRadius: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 96,
                            }}
                        >
                            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Tokens Earned</div>
                            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>🎵 {tokensEarned}</div>
                        </div>
                    </div>

                    {gameSummary.accuracy >= 50 ? (
                        <p className="small muted" style={{ marginTop: 'var(--space-md)' }}>
                            You earned {xpEarned} XP and {tokensEarned} Tokens!
                        </p>
                    ) : (
                        <p className="small muted" style={{ marginTop: 'var(--space-md)' }}>
                            You need at least 50% accuracy to pass. Keep practicing!
                        </p>
                    )}

                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "var(--space-md)", display: "flex", gap: "var(--space-sm)", justifyContent: "center" }}>
                        <button
                            className="btn primary"
                            onClick={startGame}
                            style={{ minWidth: 140 }}
                        >
                            Play Again
                        </button>
                        <button
                            className="btn"
                            onClick={() => navigate('/learn/practice/piano/ranked')}
                            style={{ minWidth: 140 }}
                        >
                            Choose Another Game
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="piano-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Melodic Memory</h2>
                    <button className="btn" onClick={() => navigate('/learn/practice/piano/lobby')}>Exit Game</button>
                </div>
                <p className="muted">{message}</p>
                {gameState === 'idle' && (
                    <div className="actions" style={{ justifyContent: 'center' }}>
                        <button className="btn primary" onClick={startGame} disabled={!isLoaded}>
                            {isLoaded ? 'Start Game' : 'Loading...'}
                        </button>
                    </div>
                )}
                <div className={`piano ${!isLoaded ? 'loading' : ''} game-mode`}>
                    {allKeys.map(({ note, type }) => (
                        <div
                            key={note}
                            data-note={note}
                            className={`piano-key ${type} ${activeNotes.has(note) ? 'active' : ''}`}
                            onMouseDown={() => isLoaded && gameState === 'playing' && handleUserPlay(note)}
                        >
                            <div className="key-label">
                                <span className="key-char">{noteToKey[note]?.toUpperCase()}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {!isLoaded && <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>}
            </div>
        </section>
    );
}