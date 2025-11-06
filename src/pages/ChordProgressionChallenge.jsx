import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/apiClient.js';

const chords = {
  Am: ['A2', 'E3', 'A3', 'C4', 'E4'],
  G: ['G2', 'B2', 'D3', 'G3', 'B3', 'D4'],
  C: ['C3', 'E3', 'G3', 'C4', 'E4'],
  F: ['F2', 'A2', 'C3', 'F3', 'A3', 'C4'],
  Dm: ['D3', 'A3', 'D4', 'F3'],
  Em: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
};

const chordKeys = Object.keys(chords);

function ChordChallengeGame() {
  const { logActivity } = useAuth();
  const synthRef = useRef(null);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState('idle'); // 'idle', 'demo', 'playing', 'finished'
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [highScore, setHighScore] = useState(null);

  useEffect(() => {
    // Set up a guitar-like synth
    synthRef.current = new Tone.PolySynth({
      oscillator: { type: 'sawtooth', partials: [1, 0.5, 0.3] },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 1.2 }
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const playChord = useCallback(async (chordName) => {
    if (Tone.context.state !== 'running') await Tone.start();
    const chordNotes = chords[chordName];
    if (chordNotes) {
      // Strum effect
      chordNotes.forEach((note, i) => {
        synthRef.current.triggerAttackRelease(note, '2n', Tone.now() + i * 0.05);
      });
    }
  }, []);

  const generateSequence = useCallback(() => {
    const newSeq = Array.from({ length: 4 }, () => chordKeys[Math.floor(Math.random() * chordKeys.length)]);
    setSequence(newSeq);
    setCurrentIndex(0);
    setScore(0);
    setFeedback('');
    setIsWrong(false);
  }, []);

  useEffect(() => {
    if (gameState === 'idle') {
      generateSequence();
    }
  }, [gameState, generateSequence]);

  const startDemo = useCallback(async () => {
    setGameState('demo');
    setFeedback('Listen to the sequence...');
    await Tone.start();
    // Loop through the sequence to play each chord
    // Add a small initial delay before the first chord plays
    await new Promise(resolve => setTimeout(resolve, 500));
    for (let i = 0; i < sequence.length; i++) {
      setCurrentIndex(i); // Update the index to highlight the correct chord
      playChord(sequence[i]); // Play the chord sound immediately with the highlight
      await new Promise(resolve => setTimeout(resolve, 1200)); // Wait before the next chord
    }
    setTimeout(() => {
      setCurrentIndex(0); // Reset index for the player's turn
      setFeedback('');
      setGameState('playing');
    }, 1000);
  }, [sequence, playChord]);

    const handleIncorrect = useCallback((isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsWrong(true);
    setFeedback(isTimeout ? 'Time\'s up! Try the next one.' : 'Incorrect! Try the next one.');
    // Use functional update for score to ensure we have the latest value for logging
    setScore(prevScore => {
      setTimeout(() => {
        setIsWrong(false);
        setFeedback('');
        const nextIndex = currentIndex + 1;
        if (nextIndex < sequence.length) {
          setCurrentIndex(nextIndex);
        } else {
          setGameState('finished');
          const activity = { type: 'chord_challenge_game', pointsEarned: prevScore, tokensEarned: Math.floor(prevScore / 50) };
          logActivity(activity);
          api(`/api/user/highscore/${activity.type}`)
            .then(data => setHighScore(data.highScore))
            .catch(err => console.error("Failed to fetch high score", err));
        }
      }, 1200);
      return prevScore; // No change to score
    });
  }, [currentIndex, sequence.length, logActivity]);


  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          handleIncorrect(true); // Pass true to indicate timeout
          return 100;
        }
        return prev + 2; // ~5 seconds per chord
      });
    }, 100);
  }, [handleIncorrect]);

  const handleCorrect = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScore(prevScore => {
      const newScore = prevScore + 100;
      setFeedback('Correct! 👍');
      setIsWrong(false);
      setTimeout(() => {
        setFeedback('');
        const nextIndex = currentIndex + 1;
        if (nextIndex < sequence.length) {
          setCurrentIndex(nextIndex);
        } else {
          setGameState('finished');
          const activity = { type: 'chord_challenge_game', pointsEarned: newScore, tokensEarned: Math.floor(newScore / 50) };
          logActivity(activity);
          api(`/api/user/highscore/${activity.type}`)
            .then(data => setHighScore(data.highScore))
            .catch(err => console.error("Failed to fetch high score", err));
        }
      }, 800);
      return newScore;
    });
  };


  useEffect(() => {
    if (gameState === 'playing') {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, startTimer]);

  const handleChordClick = (chordName) => {
    if (gameState !== 'playing') return;
    playChord(chordName);
    if (chordName === sequence[currentIndex]) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setIsWrong(false);
    setHighScore(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
      <h2>Chord Progression Challenge</h2>
      <p className="muted">Listen to the sequence, then play it back using the chord buttons below.</p>

      <div style={{ margin: 'var(--space-lg) 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <span className="small">Sequence</span>
          <span className="small">Score: <strong>{score}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
          {sequence.map((chord, i) => (
            <div key={i} 
              style={{
              padding: '12px 20px',
              background: 
                (gameState === 'playing' && i === currentIndex && isWrong) 
                  ? 'var(--error)' 
                  : ((gameState === 'playing' && i === currentIndex) || (gameState === 'demo' && i === currentIndex)) 
                    ? 'var(--accent-primary)' 
                    : 'var(--surface-elevated)',
              color: (gameState === 'playing' && i === currentIndex) || (gameState === 'demo' && i === currentIndex) ? 'white' : 'var(--text)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold',
              fontSize: '1.2em',
              minWidth: '60px',
              transition: 'all 0.3s ease',
              border: i < currentIndex ? '2px solid var(--success)' : '2px solid transparent'
            }}>
              {gameState === 'demo' || i < currentIndex ? chord : '?'}
            </div>
          ))}
        </div>
      </div>

      {gameState === 'playing' && (
        <div style={{ height: '8px', background: 'var(--surface-elevated)', borderRadius: '4px', overflow: 'hidden', margin: 'var(--space-md) 0' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.1s linear' }}></div>
        </div>
      )}

      {feedback && <div className="alert info" style={{ margin: 'var(--space-md) 0' }}>{feedback}</div>}

      {gameState === 'finished' ? (
        <div style={{ margin: 'var(--space-lg) 0' }}>
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
              <h3 style={{ margin: 0 }}>Challenge Complete!</h3>
            </div>

            {highScore !== null && (
              <p className="muted" style={{ margin: 0, padding: '0 var(--space-md)' }}>
                {score > highScore ? `🎉 New High Score! (Previous: ${highScore})` : `High Score: ${highScore}`}
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
                <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{Number(score).toLocaleString()}</div>
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
                <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{Number(score).toLocaleString()}</div>
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
                <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Sequence Length</div>
                <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{sequence.length}</div>
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
                <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>🎵 {Math.floor(score / 50)}</div>
              </div>
            </div>

            <p className="small muted" style={{ marginTop: 'var(--space-md)' }}>
              You earned {score} XP and {Math.floor(score / 50)} Tokens!
            </p>

            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "var(--space-md)", display: "flex", gap: "var(--space-sm)", justifyContent: "center" }}>
              <button
                className="btn primary"
                onClick={resetGame}
                style={{ minWidth: 140 }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-sm)', margin: 'var(--space-lg) 0' }}>
          {chordKeys.map(name => (
            <button
              key={name}
              onClick={() => handleChordClick(name)}
              disabled={gameState !== 'playing'}
              className="btn"
              style={{ padding: '16px', fontSize: '1.1em', fontWeight: '600', opacity: gameState !== 'playing' ? 0.6 : 1 }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="actions" style={{ justifyContent: 'center', gap: 'var(--space-md)' }}>
        {gameState === 'idle' && <button onClick={startDemo} className="btn primary">Start Challenge</button>}
        {(gameState === 'demo' || gameState === 'playing') && <button onClick={resetGame} className="btn">Reset</button>}
      </div>
    </div>
  );
}

export default function ChordProgressionChallenge() {
  return (
    <section>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/learn/practice/guitar/ranked/selection" className="link-accent small">← Back to Guitar Games</Link>
        </div>
        <ChordChallengeGame />
      </div>
    </section>
  );
}