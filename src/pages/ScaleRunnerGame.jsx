import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tone from 'tone';
import { useAuth } from '../context/AuthContext.jsx';
import Piano from '../components/Piano.jsx';
import { api } from '../context/apiClient.js';

const scales = {
    easy: [
        { name: 'C Major', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
        { name: 'G Major', notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'] },
    ],
    medium: [
        { name: 'D Major', notes: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'] },
        { name: 'A Minor (Natural)', notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
    ],
    hard: [
        { name: 'E♭ Major', notes: ['D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5', 'D5', 'D#5'] },
        { name: 'C# Minor (Harmonic)', notes: ['C#4', 'D#4', 'E4', 'F#4', 'G#4', 'A4', 'B#4', 'C#5'] },
    ]
};

const allScales = {
    easy: [...scales.easy],
    medium: [...scales.easy, ...scales.medium],
    hard: [...scales.easy, ...scales.medium, ...scales.hard],
};

const keyMap = {
    // Bottom row
    'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
    ',': 'C5', '.': 'D5', '/': 'E5',
    // Top row
    's': 'C#4', 'd': 'D#4', 'g': 'F#4', 'h': 'G#4', 'j': 'A#4',
    'l': 'C#5', ';': 'D#5',
};

const GAME_DURATION = 60; // seconds


export default function ScaleRunnerGame() {
    const { logActivity } = useAuth();
    const navigate = useNavigate();
    const sampler = useRef(null);
    const timerRef = useRef(null);

    const [isLoaded, setLoaded] = useState(false);
    const [activeNotes, setActiveNotes] = useState(new Set());
    const [gameState, setGameState] = useState('selection');
    const [difficulty, setDifficulty] = useState(null);
    const [score, setScore] = useState(0);
    const [remainingTime, setRemainingTime] = useState(GAME_DURATION);
    const [currentScale, setCurrentScale] = useState(null);
    const [userProgress, setUserProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [gameSummary, setGameSummary] = useState(null);
    const [highScore, setHighScore] = useState(null);

    useEffect(() => {
        sampler.current = new Tone.Sampler({
            urls: { C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3", C5: "C5.mp3" },
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
        sampler.current.triggerAttackRelease(note, '8n');
    };

     const handleNoteOn = (note) => {
        if (gameState !== 'playing' || !currentScale) return;
        playNoteAudio(note);

        const expectedNote = currentScale.notes[userProgress];
        if (note === expectedNote) {
            const newProgress = userProgress + 1;
            setUserProgress(newProgress);

            if (newProgress === currentScale.notes.length) {
                // Scale complete
                const points = 100 + (difficulty === 'medium' ? 50 : difficulty === 'hard' ? 100 : 0);
                setScore(s => s + points);
                setMessage(`Correct! +${points} pts`);
                setTimeout(() => nextScale(difficulty), 1000);
            }
        } else {
            // Wrong note
            setMessage(`Wrong note! Expected ${expectedNote}. Resetting scale.`);
            setScore(s => Math.max(0, s - 10));
            setUserProgress(0);
        }
    };

    const nextScale = useCallback((diff) => {
        const available = allScales[diff];
        const newScale = available[Math.floor(Math.random() * available.length)];
        setCurrentScale(newScale);
        setUserProgress(0);
        setMessage('');
    }, []);

    const startGame = useCallback((diff) => {
        setDifficulty(diff);
        setGameState('playing');
        setScore(0);
        setRemainingTime(GAME_DURATION);
        setGameSummary(null);
        setHighScore(null);
        nextScale(diff);

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
    }, [nextScale]);

    const gameOver = useCallback(() => {
        setGameState('gameOver');
        const summary = { score, difficulty };
        setGameSummary(summary);
        const activity = { type: 'scale_runner_game', pointsEarned: score, tokensEarned: Math.floor(score / 150) };
        logActivity?.(activity);
        api(`/api/user/highscore/${activity.type}`)
            .then(data => setHighScore(data.highScore))
            .catch(err => console.error("Failed to fetch high score", err));
        if (timerRef.current) clearInterval(timerRef.current);
    }, [score, difficulty, logActivity, api]);

    useEffect(() => {
        if (remainingTime === 0 && gameState === 'playing') {
            gameOver();
        }
    }, [remainingTime, gameState, gameOver]);

    const handleKeyDown = useCallback((e) => {
        if (gameState !== 'playing' || !currentScale) return;
        const note = keyMap[e.key.toLowerCase()];
        if (note && !activeNotes.has(note)) {
            e.preventDefault();
            setActiveNotes(s => new Set(s).add(note));
            handleNoteOn(note);
        }
    }, [gameState, currentScale, activeNotes, handleNoteOn]);

    const handleKeyUp = useCallback((e) => {
        if (gameState !== 'playing') return;
        const note = keyMap[e.key.toLowerCase()];
        if (note && activeNotes.has(note)) {
            e.preventDefault();
            setActiveNotes(s => { const ns = new Set(s); ns.delete(note); return ns; });
        }
    }, [gameState, activeNotes]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

   

    if (gameState === 'selection') {
        return (
            <section>
                <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
                    <h3>Scale Runner</h3>
                    <p className="muted">Play the requested scales as fast as you can. Choose a difficulty to start.</p>
                    <div className="actions" style={{ justifyContent: 'center', gap: 'var(--space-sm)', margin: 'var(--space-lg) 0' }}>
                        <button className="btn primary" onClick={() => startGame('easy')} disabled={!isLoaded}>Easy</button>
                        <button className="btn primary" onClick={() => startGame('medium')} disabled={!isLoaded}>Medium</button>
                        <button className="btn primary" onClick={() => startGame('hard')} disabled={!isLoaded}>Hard</button>
                    </div>
                    {!isLoaded && <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>}
                    <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
                        <button className="btn" onClick={() => navigate('/learn/practice/piano/ranked')}>Back to Games</button>
                    </div>
                </div>
            </section>
        );
    }

    if (gameState === 'gameOver') {
        return (
            <section>
                <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
                    <h3>Game Over!</h3>
                    <p>You played on <strong style={{ textTransform: 'capitalize' }}>{gameSummary?.difficulty}</strong> difficulty.</p>
                    <div style={{ margin: 'var(--space-lg) 0' }}>
                        <h4>Final Score</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{gameSummary?.score}</p>
                        {highScore !== null && (
                            <p className="muted">
                                {gameSummary?.score > highScore ? `🎉 New High Score! (Previous: ${highScore})` : `High Score: ${highScore}`}
                            </p>
                        )}
                    </div>
                    <p className="small muted">
                        You earned {gameSummary?.score || 0} XP and {Math.floor((gameSummary?.score || 0) / 150)} Tokens!
                    </p>
                    <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-md)' }}>
                        <button className="btn primary" onClick={() => startGame(difficulty || 'easy')}>Play Again</button>
                        <button className="btn" onClick={() => navigate('/learn/practice/piano/ranked')}>Choose Another Game</button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="piano-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <h2>Scale Runner</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
                        <span>Score: <strong>{score}</strong></span>
                        <span>Time: <strong>{remainingTime}s</strong></span>
                    </div>
                    <button className="btn" onClick={gameOver}>End Game</button>
                </div>

                <div style={{ textAlign: 'center', minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    {currentScale ? (
                        <>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                Play: <span style={{ color: 'var(--accent-primary)' }}>{currentScale.name}</span>
                            </p>
                            <p className="small muted">
                                Next note: <strong>{currentScale.notes[userProgress]}</strong>
                            </p>
                            <p className={`small ${message.startsWith('Correct') ? 'success-text' : 'error-text'}`} style={{ minHeight: '20px', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                                {message}
                            </p>
                        </>
                    ) : <p>Loading scale...</p>}
                </div>

                <Piano
                    mode="game"
                    activeNotes={activeNotes}
                    onNoteOn={handleNoteOn}
                    onNoteOff={(note) => setActiveNotes(s => { const ns = new Set(s); ns.delete(note); return ns; })}
                    disabled={gameState !== 'playing' || !isLoaded}
                    showNoteNames={true}
                />
                {!isLoaded && <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>}
            </div>
        </section>
    );
}