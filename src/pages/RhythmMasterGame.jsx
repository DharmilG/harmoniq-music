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
};

// A simple song pattern: time in seconds, chord name
const songPattern = [
  { time: 1, chord: 'Am' }, { time: 2, chord: 'Am' }, { time: 3, chord: 'G' }, { time: 4, chord: 'G' },
  { time: 5, chord: 'C' }, { time: 6, chord: 'C' }, { time: 7, chord: 'F' }, { time: 8, chord: 'F' },
  { time: 9, chord: 'Am' }, { time: 10, chord: 'G' }, { time: 11, chord: 'C' }, { time: 12, chord: 'C' },
  { time: 14, chord: 'Am' }, { time: 14.5, chord: 'G' }, { time: 15, chord: 'C' }, { time: 15.5, chord: 'F' },
  { time: 16, chord: 'Am' }, { time: 17, chord: 'G' }, { time: 18, chord: 'C' },
];

const LOOKAHEAD_TIME = 4; // seconds

function RhythmMasterGameComponent() {
  const { logActivity } = useAuth();
  const synthRef = useRef(null);
  const metronomeRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [gameState, setGameState] = useState('idle'); // idle, countdown, playing, finished
  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState({ text: '', key: 0 });
  const [countdown, setCountdown] = useState(3);
  const [highScore, setHighScore] = useState(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth', partials: [1, 0.5, 0.3] },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 1 }
    }).toDestination();
    metronomeRef.current = new Tone.MembraneSynth().toDestination();

    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      synthRef.current?.dispose();
      metronomeRef.current?.dispose();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const playChord = useCallback((chordName) => {
    const chordNotes = chords[chordName];
    if (chordNotes) {
      chordNotes.forEach((note, i) => {
        synthRef.current.triggerAttackRelease(note, '8n', Tone.now() + i * 0.02);
      });
    }
  }, []);

  const showFeedback = (text) => {
    setFeedback({ text, key: Date.now() });
  };

  const handleStrum = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Tone.Transport.seconds;
    const hitWindow = 0.15; // 150ms window

    let noteHit = false;
    const updatedNotes = notes.map(note => {
      if (!note.hit && Math.abs(now - note.time) < hitWindow) {
        const diff = Math.abs(now - note.time);
        if (diff < 0.07) { // Perfect
          setScore(s => s + 100 + combo * 10);
          setCombo(c => c + 1);
          showFeedback('Perfect!');
        } else { // Good
          setScore(s => s + 50);
          setCombo(c => c + 1);
          showFeedback('Good');
        }
        playChord(note.chord);
        noteHit = true;
        return { ...note, hit: true };
      }
      return note;
    });

    if (!noteHit) {
      setCombo(0);
      showFeedback('Miss');
    }

    setNotes(updatedNotes);
  }, [gameState, notes, combo, playChord]);

  const startGame = useCallback(async () => {
    await Tone.start();
    setScore(0);
    setCombo(0);
    setFeedback({ text: '', key: 0 });
    setGameState('countdown');
    setHighScore(null);

    let count = 3;
    const countdownInterval = setInterval(() => {
      setCountdown(count);
      metronomeRef.current.triggerAttackRelease('C2', '8n');
      count--;
      if (count < 0) {
        clearInterval(countdownInterval);
        setGameState('playing');
        
        const noteData = songPattern.map((n, i) => ({ ...n, id: i, hit: false, missed: false }));
        setNotes(noteData);

        Tone.Transport.bpm.value = 120;
        Tone.Transport.start();

        const gameLoop = () => {
          const now = Tone.Transport.seconds;
          setNotes(prevNotes => prevNotes.map(note => {
            if (!note.hit && !note.missed && now > note.time + 0.15) {
              setCombo(0);
              return { ...note, missed: true };
            }
            return note;
          }));

          if (now > songPattern[songPattern.length - 1].time + 2) {
            setGameState('finished');
            const activity = { type: 'rhythm_master_game', pointsEarned: score, tokensEarned: Math.floor(score / 100) };
            logActivity(activity);
            api(`/api/user/highscore/${activity.type}`)
              .then(data => setHighScore(data.highScore))
              .catch(err => console.error("Failed to fetch high score", err));
            Tone.Transport.stop();
          } else {
            animationFrameRef.current = requestAnimationFrame(gameLoop);
          }
        };
        gameLoop();
      }
    }, 1000);
  }, [logActivity, score]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleStrum();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStrum]);

  const now = Tone.Transport.seconds;

  if (gameState === 'idle' || gameState === 'countdown') {
    return (
      <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
        <h2>Rhythm Master</h2>
        <p className="muted">Hit the spacebar in time with the falling notes. Get ready!</p>
        {gameState === 'idle' ? (
          <button onClick={startGame} className="btn primary" style={{ marginTop: 'var(--space-lg)' }}>Start Game</button>
        ) : (
          <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: 'var(--space-lg) 0' }}>{countdown}</div>
        )}
      </div>
    );
  }

  if (gameState === 'finished') {
    const tokensEarned = Math.floor(score / 100);
    
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
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Max Combo</div>
              <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>x{combo}</div>
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
            You earned {Number(score).toLocaleString()} XP and {tokensEarned} Tokens!
          </p>

          <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "var(--space-md)", display: "flex", gap: "var(--space-sm)", justifyContent: "center" }}>
            <button
              className="btn primary"
              onClick={startGame}
              style={{ minWidth: 140 }}
            >
              Play Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <span>Score: <strong>{score}</strong></span>
        <span>Combo: <strong>x{combo}</strong></span>
      </div>
      <div style={{ height: '500px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', position: 'relative', border: '1px solid var(--surface-elevated)' }}>
        {/* Note track */}
        {notes.map(note => {
          const y = ((note.time - now) / LOOKAHEAD_TIME) * 100;
          if (y < -10 || y > 110) return null;
          return (
            <div key={note.id} style={{
              position: 'absolute',
              bottom: `${y}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              padding: '10px',
              background: note.hit ? 'var(--success)' : (note.missed ? 'var(--error)' : 'var(--accent-primary)'),
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 'bold',
              opacity: note.hit || note.missed ? 0.5 : 1,
              transition: 'all 0.1s'
            }}>
              {note.chord}
            </div>
          );
        })}

        {/* Hit Zone */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50px', background: 'rgba(var(--accent-primary-rgb), 0.2)', borderTop: '2px solid var(--accent-primary)' }}></div>
        
        {/* Feedback Text */}
        <div key={feedback.key} className="feedback-text" style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translateX(-50%)', fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', animation: 'fade-out 0.5s forwards' }}>
          {feedback.text}
        </div>
      </div>
      <p className="muted small" style={{ marginTop: 'var(--space-md)' }}>Press [SPACE] to strum!</p>
    </div>
  );
}

export default function RhythmMasterPage() {
  return (
    <section>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/learn/practice/guitar/ranked/selection" className="link-accent small">← Back to Guitar Games</Link>
        </div>
        <RhythmMasterGameComponent />
      </div>
      <style>{`
        @keyframes fade-out {
          from { opacity: 1; transform: translateX(-50%) scale(1); }
          to { opacity: 0; transform: translateX(-50%) scale(1.5); }
        }
      `}</style>
    </section>
  );
}