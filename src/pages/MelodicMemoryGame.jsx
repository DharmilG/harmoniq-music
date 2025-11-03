import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { useAuth } from '../context/AuthContext.jsx';
import Piano from '../components/Piano.jsx';

const availableNotes = [
  'C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5'
];
=======
import { useAuth } from '../context/AuthContext';
import './PianoPractice.css';
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4

const keyMap = {
    'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
    's': 'C#4', 'd': 'D#4', 'g': 'F#4', 'h': 'G#4', 'j': 'A#4',
    ',': 'C5',
};

<<<<<<< HEAD
const speeds = {
  easy: { hold: 800, pause: 400 },
  medium: { hold: 400, pause: 200 },
  hard: { hold: 300, pause: 100 }
};

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
  const [gameState, setGameState] = useState('selection');
  const [difficulty, setDifficulty] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [message, setMessage] = useState('Choose your difficulty to begin the game.');
  const [gameSummary, setGameSummary] = useState(null);

  // ---- Audio ----
  useEffect(() => {
    sampler.current = new Tone.Sampler({
      urls: { C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3", C5: "C5.mp3" },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => setLoaded(true)
    }).toDestination();
    return () => sampler.current?.dispose();
  }, []);

  const playNoteAudio = async (note, duration = '8n') => {
    if (!sampler.current || !isLoaded) return;
    if (Tone.context.state !== 'running') await Tone.start();
    sampler.current.triggerAttackRelease(note, duration);
  };

  // ---- Game Logic ----
  const playSequence = useCallback(async (seq) => {
    setGameState('watching');
    setMessage('Watch and listen...');
    const speed = speeds[difficulty] || speeds.easy;
    for (const note of seq) {
      if (difficulty !== 'hard') {
        setActiveNotes(s => new Set([...s, note]));
      }
      await playNoteAudio(note);
      await new Promise(r => setTimeout(r, speed.hold));
      if (difficulty !== 'hard') {
        setActiveNotes(s => {
          const ns = new Set(s);
          ns.delete(note);
          return ns;
        });
      }
      await new Promise(r => setTimeout(r, speed.pause));
    }
    setGameState('playing');
    setMessage('Your turn!');
  }, [playNoteAudio, difficulty]);

  const startGame = useCallback((diff) => {
    setDifficulty(diff);
    setGameSummary(null);
    setSequence([]);
    setUserSequence([]);
    setActiveNotes(new Set());
    setTimeout(() => {
      const first = availableNotes[Math.floor(Math.random() * availableNotes.length)];
      const seq = [first];
      setSequence(seq);
      setUserSequence([]);
      playSequence(seq);
    }, 0);
  }, [playSequence]);

  const handleUserPlay = useCallback(async (note) => {
    if (gameState !== 'playing') return;
    playNoteAudio(note);
    setActiveNotes(s => new Set([...s, note]));
    setTimeout(() => setActiveNotes(s => {
      const ns = new Set(s);
      ns.delete(note);
      return ns;
    }), 200);

    const newUser = [...userSequence, note];
    const pos = newUser.length - 1;

    if (sequence[pos] !== note) {
      const total = Math.max(1, sequence.length);
      const correct = userSequence.length;
      const acc = Math.round((correct / total) * 100);
      const reward = getReward(acc);
      setGameState('gameOver');
      setMessage(`Game Over! You completed ${total} round(s).`);
      setGameSummary({ rounds: total, accuracy: acc, reward });
      if (reward.xp || reward.tokens) logActivity({ type: 'melodic_memory_game', pointsEarned: reward.xp, tokensEarned: reward.tokens });
      return;
    }

    setUserSequence(newUser);

    if (newUser.length === sequence.length) {
      setMessage('Correct! Next round...');
      setTimeout(() => {
        const next = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        const newSeq = [...sequence, next];
        setSequence(newSeq);
        setUserSequence([]);
        playSequence(newSeq);
      }, 1500);
    }
  }, [gameState, userSequence, sequence, playNoteAudio, logActivity, playSequence]);

  // ---- Keyboard Input for Game ----
  useEffect(() => {
    const handleKeyDown = (e) => {
        const note = keyMap[e.key.toLowerCase()];
        if (note && gameState === 'playing' && !activeNotes.has(note)) {
            e.preventDefault();
            handleUserPlay(note);
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, activeNotes, handleUserPlay]);


  // ---- Render ----
  if (gameSummary) {
    return (
      <section>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h3>{gameSummary.accuracy < 50 ? 'Challenge Failed' : 'Game Over!'}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: 'var(--space-lg) 0' }}>
            <div><strong>Rounds</strong><br />{gameSummary.rounds}</div>
            <div><strong>Accuracy</strong><br />{gameSummary.accuracy}%</div>
          </div>
          {gameSummary.accuracy >= 50 ? (
            <p className="small muted">You earned {gameSummary.reward.xp} XP and {gameSummary.reward.tokens} Tokens!</p>
          ) : (
            <p className="small muted">You need at least 50% accuracy to pass. Keep practicing!</p>
          )}
          <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-md)' }}>
            <button className="btn primary" onClick={() => startGame(difficulty)}>Play Again</button>
            <button className="btn" onClick={() => navigate('/learn/practice/piano/ranked')}>Choose Another Game</button>
          </div>
        </div>
      </section>
    );
  }

  if (gameState === 'selection') {
    return (
      <section>
        <div className="piano-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Melodic Memory</h2>
            <button className="btn" onClick={() => navigate('/learn/practice/piano/lobby')}>Exit Game</button>
          </div>
          <p className="muted">Choose your difficulty to begin the game.</p>
          <div className="actions" style={{ justifyContent: 'center', gap: 'var(--space-sm)', margin: 'var(--space-lg) 0' }}>
            <button className="btn primary" onClick={() => startGame('easy')} disabled={!isLoaded}>Easy</button>
            <button className="btn primary" onClick={() => startGame('medium')} disabled={!isLoaded}>Medium</button>
            <button className="btn primary" onClick={() => startGame('hard')} disabled={!isLoaded}>Hard</button>
          </div>
          <Piano
            mode="game"
            activeNotes={activeNotes}
            onNoteOn={handleUserPlay}
            disabled={true || !isLoaded}
            showNoteNames={false}
          />
          {!isLoaded && <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>}
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
        <Piano
          mode="game"
          activeNotes={activeNotes}
          onNoteOn={handleUserPlay}
          disabled={gameState !== 'playing' || !isLoaded}
          showNoteNames={false}
        />
        {!isLoaded && <div className="spinner" style={{ margin: 'var(--space-xl) auto' }}></div>}
      </div>
    </section>
  );
=======
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
        return (
            <section>
                <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
                    <h3>{gameSummary.accuracy < 50 ? 'Challenge Failed' : 'Game Over!'}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', margin: 'var(--space-lg) 0' }}>
                        <div><strong>Rounds</strong><br />{gameSummary.rounds}</div>
                        <div><strong>Accuracy</strong><br />{gameSummary.accuracy}%</div>
                    </div>
                    {gameSummary.accuracy >= 50 ? (
                        <p className="small muted">You earned {gameSummary.reward.xp} XP and {gameSummary.reward.tokens} 🎵 Tokens!</p>
                    ) : (
                        <p className="small muted">You need at least 50% accuracy to pass. Keep practicing!</p>
                    )}
                    <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-md)' }}>
                        <button className="btn primary" onClick={startGame}>Play Again</button>
                        <button className="btn" onClick={() => navigate('/learn/practice/piano/ranked')}>Choose Another Game</button>
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
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
}