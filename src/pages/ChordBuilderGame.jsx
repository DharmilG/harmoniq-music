import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Piano from '../components/Piano.jsx';
import { api } from '../context/apiClient.js';

const chords = {
    easy: [
        { name: 'C Major', notes: ['C4', 'E4', 'G4'] },
        { name: 'G Major', notes: ['G4', 'B4', 'D5'] },
        { name: 'F Major', notes: ['F4', 'A4', 'C5'] },
        { name: 'A Minor', notes: ['A4', 'C5', 'E5'] },
        { name: 'D Minor', notes: ['D4', 'F4', 'A4'] },
        { name: 'E Minor', notes: ['E4', 'G4', 'B4'] },
    ],

    medium: [
        { name: 'D Major', notes: ['D4', 'F#4', 'A4'] },
        { name: 'A Major', notes: ['A4', 'C#5', 'E5'] },
        { name: 'E Major', notes: ['E4', 'G#4', 'B4'] },
        { name: 'C Major 7', notes: ['C4', 'E4', 'G4', 'B4'] },
        { name: 'G7', notes: ['G4', 'B4', 'D5', 'F4'] },
        { name: 'A7', notes: ['A4', 'C#5', 'E5', 'G4'] },
        { name: 'Dm7', notes: ['D4', 'F4', 'A4', 'C5'] },
        { name: 'Em7', notes: ['E4', 'G4', 'B4', 'D5'] },
    ],

    hard: [
        { name: 'F# Minor', notes: ['F#4', 'A4', 'C#5'] },
        { name: 'C Diminished', notes: ['C4', 'D#4', 'F#4'] },
        { name: 'B Diminished', notes: ['B4', 'D5', 'F4'] },
        { name: 'C Augmented', notes: ['C4', 'E4', 'G#4'] },
        { name: 'E7', notes: ['E4', 'G#4', 'B4', 'D5'] },
        { name: 'F Major 7', notes: ['F4', 'A4', 'C5', 'E5'] },
        { name: 'G Minor', notes: ['G4', 'A#4', 'D5'] },
        { name: 'A Minor 7', notes: ['A4', 'C5', 'E5', 'G4'] },
    ]
};

const allChords = {
    easy: [...chords.easy],
    medium: [...chords.easy, ...chords.medium],
    hard: [...chords.easy, ...chords.medium, ...chords.hard],
};

const GAME_DURATION = 60; // seconds

export default function ChordBuilderGame() {
    const { logActivity } = useAuth();
    const navigate = useNavigate();
    const sampler = useRef(null);
    const timerRef = useRef(null);
    const pressTimesRef = useRef(new Map()); // note -> timestamp
    const chordAttemptedNotes = useRef(new Set());

    const [isLoaded, setLoaded] = useState(false);
    const [activeNotes, setActiveNotes] = useState(new Set());
    const [gameState, setGameState] = useState('selection'); // selection, playing, gameOver
    const [difficulty, setDifficulty] = useState(null);
    const [score, setScore] = useState(0);
    const [remainingTime, setRemainingTime] = useState(GAME_DURATION);
    const [currentChord, setCurrentChord] = useState(null);
    const [message, setMessage] = useState('');
    const [wrongStreak, setWrongStreak] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [gameSummary, setGameSummary] = useState(null);
    const [highScore, setHighScore] = useState(null);

    // ---- Audio Setup ----
    useEffect(() => {
        sampler.current = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C1: "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                A1: "A1.mp3",
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
                C3: "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                A3: "A3.mp3",
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                A5: "A5.mp3",
                C6: "C6.mp3",
            },
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => setLoaded(true)
        }).toDestination();
        return () => {
            sampler.current?.dispose();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const playNoteAudio = async (note) => {
        if (!sampler.current || !isLoaded) return;
        if (Tone.context.state !== 'running') await Tone.start();
        sampler.current.triggerAttack(note);
    };

    const releaseNoteAudio = (note) => {
        sampler.current?.triggerRelease(note);
    };

    // ---- Helpers: compare notes using MIDI numbers ----
    const notesArrayToMidiSet = (notesArray) => {
        const s = new Set();
        for (const n of notesArray) {
            try {
                s.add(Tone.Frequency(n).toMidi());
            } catch (e) {
                s.add(n);
            }
        }
        return s;
    };

    // ---- Game Logic ----
    const nextChord = useCallback((diff) => {
        const available = allChords[diff];
        const newChord = available[Math.floor(Math.random() * available.length)];
        setCurrentChord({ ...newChord, _shownAt: Date.now() });
        setMessage('');
        setActiveNotes(new Set());
        pressTimesRef.current.clear();
        chordAttemptedNotes.current.clear();
    }, []);

    const startGame = useCallback((diff) => {
        setDifficulty(diff);
        setGameState('playing');
        setScore(0);
        setRemainingTime(GAME_DURATION);
        setGameSummary(null);
        setWrongStreak(0);
        setHighScore(null);
        setFeedback(null);
        setActiveNotes(new Set());
        pressTimesRef.current.clear();
        chordAttemptedNotes.current.clear();
        nextChord(diff);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [nextChord]);

    const gameOver = useCallback((isFail = false) => {
        setGameState('gameOver');
        const points = isFail ? 0 : score;
        const summary = { score: points, difficulty };
        setGameSummary(summary);
        const activity = { type: 'chord_builder_game', pointsEarned: points, tokensEarned: Math.floor(points / 100) };
        logActivity?.(activity);
        api(`/api/user/highscore/${activity.type}`)
            .then(data => setHighScore(data.highScore))
            .catch(err => console.error("Failed to fetch high score", err));
        if (timerRef.current) clearInterval(timerRef.current);
    }, [score, difficulty, logActivity, api]);

    useEffect(() => {
        if (remainingTime === 0 && gameState === 'playing') {
            gameOver(false);
        }
    }, [remainingTime, gameState, gameOver]);

    // Check chord match
    const checkChord = useCallback(() => {
        if (!currentChord) return;

        const targetMidiSet = notesArrayToMidiSet(currentChord.notes);
        const attemptedNotesArray = Array.from(chordAttemptedNotes.current);
        const attemptedMidiSet = notesArrayToMidiSet(attemptedNotesArray);

        if (attemptedMidiSet.size < targetMidiSet.size) return;

        const isMatch = Array.from(targetMidiSet).every(t => attemptedMidiSet.has(t));

        if (isMatch && attemptedMidiSet.size === targetMidiSet.size) {
            // Correct chord!
            const targetTimes = currentChord.notes.map(note => pressTimesRef.current.get(note)).filter(t => t != null);
            if (targetTimes.length !== targetMidiSet.size) return;

            const minT = Math.min(...targetTimes);
            const maxT = Math.max(...targetTimes);
            const diffMs = targetTimes.length > 1 ? maxT - minT : 0;

            let accuracy = 50;
            if (diffMs <= 150) accuracy = 100;
            else if (diffMs <= 350) accuracy = 85;
            else if (diffMs <= 600) accuracy = 70;

            const base = 100;
            const accBonus = Math.round((accuracy - 50) * 0.6);
            const timeSinceChordShown = Date.now() - currentChord._shownAt;
            const speedBonus = Math.max(0, Math.floor(Math.max(0, 2000 - timeSinceChordShown) / 200));
            const gained = base + accBonus + speedBonus;

            setScore(s => s + gained);
            setMessage(`Correct! +${gained} pts (Acc: ${accuracy}%)`);
            setWrongStreak(0);
            setFeedback({ type: 'correct', notes: currentChord.notes });

            chordAttemptedNotes.current.clear();
            pressTimesRef.current.clear();

            setTimeout(() => {
                setFeedback(null);
                nextChord(difficulty);
            }, 500);
        } else if (attemptedMidiSet.size >= targetMidiSet.size) {
            // Wrong chord
            setMessage('Wrong chord!');
            setWrongStreak(w => {
                const newW = w + 1;
                if (newW >= 3) {
                    gameOver(true);
                }
                return newW;
            });
            setFeedback({ type: 'wrong', notes: attemptedNotesArray });
            chordAttemptedNotes.current.clear();
            pressTimesRef.current.clear();
            setActiveNotes(new Set());
            setTimeout(() => {
                setFeedback(null);
            }, 500);
        }
    }, [currentChord, difficulty, nextChord, gameOver, score]);

    // --- Note handlers ---
    const handleNoteOn = (note) => {
        if (gameState !== 'playing') return;
        playNoteAudio(note);

        setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.add(note);
            if (!pressTimesRef.current.has(note)) {
                pressTimesRef.current.set(note, performance.now());
            }
            chordAttemptedNotes.current.add(note);
            checkChord();
            return newSet;
        });
    };

    const handleNoteOff = (note) => {
        if (gameState !== 'playing') return;
        releaseNoteAudio(note);
        setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(note);
            return newSet;
        });
    };

    // ---- Render Logic ----
    if (gameState === 'selection') {
        return (
            <section>
                <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
                    <h3>Chord Builder</h3>
                    <p className="muted">Build the requested chords as fast as you can. Choose a difficulty to start.</p>
                    <div className="actions" style={{ justifyContent: 'center', gap: 'var(--space-sm)', margin: 'var(--space-lg) 0' }}>
                        <button className="btn primary" onClick={() => startGame('easy')} disabled={!isLoaded}>Easy</button>
                        <button className="btn primary" onClick={() => startGame('medium')} disabled={!isLoaded}>Medium</button>
                        <button className="btn primary" onClick={() => startGame('hard')} disabled={!isLoaded}>Hard</button>
                    </div>
                    {!isLoaded && <p>Loading sounds...</p>}
                    <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
                        <button className="btn" onClick={() => navigate('/learn/practice/piano/ranked')}>Back to Games</button>
                    </div>
                </div>
            </section>
        );
    }

    if (gameState === 'gameOver') {
        const finalScore = gameSummary?.score || 0;
        const tokensEarned = Math.floor(finalScore / 100);
        
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
                        <h3 style={{ margin: 0 }}>Game Over!</h3>
                        <div style={{ color: "var(--muted-foreground)" }}>Difficulty: <strong style={{ textTransform: "capitalize" }}>{gameSummary?.difficulty || difficulty}</strong></div>
                    </div>

                    {highScore !== null && (
                        <p className="muted" style={{ margin: 0, padding: '0 var(--space-md)' }}>
                            {finalScore > highScore ? `🎉 New High Score! (Previous: ${highScore})` : `High Score: ${highScore}`}
                        </p>
                    )}

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
                            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Final Score</div>
                            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{Number(finalScore).toLocaleString()}</div>
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
                            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{Number(finalScore).toLocaleString()}</div>
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
                            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Difficulty</div>
                            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6, textTransform: "capitalize" }}>{gameSummary?.difficulty || difficulty}</div>
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

                    <p className="small muted" style={{ marginTop: 'var(--space-md)' }}>
                        You earned {Number(finalScore).toLocaleString()} XP and {tokensEarned} Tokens!
                    </p>

                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "var(--space-md)", display: "flex", gap: "var(--space-sm)", justifyContent: "center" }}>
                        <button
                            className="btn primary"
                            onClick={() => startGame(difficulty || 'easy')}
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

    // playing state
    return (
        <section>
            <div className="piano-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <h2>Chord Builder</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
                        <span>Score: <strong>{score}</strong></span>
                        <span>Time: <strong>{remainingTime}s</strong></span>
                    </div>
                    <button className="btn" onClick={() => gameOver(false)}>End Game</button>
                </div>

                <div style={{
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'var(--color-background-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    marginBottom: 'var(--space-md)'
                }}>
                    {currentChord ? (
                        <>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                Play: <span style={{ color: 'var(--color-primary)' }}>{currentChord.name}</span>
                            </p>
                            <p className={`small ${message.startsWith('Correct') ? 'success-text' : 'error-text'}`}
                               style={{ minHeight: '20px', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                                {message}
                            </p>
                        </>
                    ) : (
                        <p>Loading chord...</p>
                    )}
                </div>

                <Piano
                    mode="game"
                    activeNotes={activeNotes}
                    feedbackType={feedback?.type}
                    feedbackNotes={feedback?.notes ? new Set(feedback.notes) : null}
                    onNoteOn={handleNoteOn}
                    onNoteOff={handleNoteOff}
                    disabled={gameState !== 'playing' || !isLoaded}
                    showNoteNames={true}
                />
                {!isLoaded && <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>}
            </div>
        </section>
    );
}