// NotefallGame.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import * as Tone from "tone";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./NotefallGame.css";
import { api } from "../context/apiClient.js";
import Piano from "../components/Piano.jsx";

const allKeys = [
  { note: "C4" },
  { note: "C#4" },
  { note: "D4" },
  { note: "D#4" },
  { note: "E4" },
  { note: "F4" },
  { note: "F#4" },
  { note: "G4" },
  { note: "G#4" },
  { note: "A4" },
  { note: "A#4" },
  { note: "B4" },
  { note: "C5" },
  { note: "C#5" },
  { note: "D5" },
  { note: "D#5" },
  { note: "E5" },
];

const noteDisplayName = {
  C4: "C",
  "C#4": "C#",
  D4: "D",
  "D#4": "D#",
  E4: "E",
  F4: "F",
  "F#4": "F#",
  G4: "G",
  "G#4": "G#",
  A4: "A",
  "A#4": "A#",
  B4: "B",
  C5: "C",
  "C#5": "C#",
  D5: "D",
  "D#5": "D#",
  E5: "E",
};

const blackKeyNotes = new Set([
  "C#4",
  "D#4",
  "F#4",
  "G#4",
  "A#4",
  "C#5",
  "D#5",
]);

const difficulties = {
  easy: { noteSpeed: 120, spawnRate: 1500 },
  medium: { noteSpeed: 150, spawnRate: 1300 },
  hard: { noteSpeed: 200, spawnRate: 1200 },
};

const GAME_HEIGHT = 250;
const MAX_POINTS_PER_NOTE = 1000; // <-- each note can give up to 1000 points

export default function NotefallGame() {
  const { logActivity } = useAuth();
  const navigate = useNavigate();
  const sampler = useRef(null);
  const gameAreaRef = useRef(null);
  const animationFrameId = useRef(null);
  const fallingNotesRef = useRef([]);
  const pressesRef = useRef(new Map());
  const totalNotesRef = useRef(0);
  const sumAccRef = useRef(0); // sum of per-note accuracies (0-100 per note)
  const lastSecondRef = useRef(0);

  const [isLoaded, setLoaded] = useState(false);
  const [gameState, setGameState] = useState("selection");
  const [difficulty, setDifficulty] = useState(null);
  const [fallingNotes, setFallingNotes] = useState([]);
  const [activePianoKeys, setActivePianoKeys] = useState(new Set());
  const [score, setScore] = useState(0); // numeric score (points)
  const [accuracy, setAccuracy] = useState(100); // percentage 0-100
  const [remainingTime, setRemainingTime] = useState(60);
  const [gameSummary, setGameSummary] = useState(null);
  const [highScore, setHighScore] = useState(null);

  const lastTimeRef = useRef(0);
  const nextSpawnRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const gameDuration = 60000;

  const gameStateRef = useRef(gameState);
  const difficultyRef = useRef(difficulty);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    sampler.current = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => setLoaded(true),
    }).toDestination();
    return () => {
      sampler.current?.dispose();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  const playNoteAudio = async (note) => {
    if (!sampler.current || !isLoaded) return;
    if (Tone.context.state !== "running") await Tone.start();
    sampler.current.triggerAttack(note);
  };
  const releaseNoteAudio = (note) => sampler.current?.triggerRelease(note);

  const computeAccuracyForHit = (note, pressStartMs, pressEndMs) => {
    const noteStart = note.startTime + note.timeToHit;
    const noteEnd = noteStart + note.audioDur;
    const intersectionStart = Math.max(noteStart, pressStartMs);
    const intersectionEnd = Math.min(noteEnd, pressEndMs);
    const intersection = Math.max(0, intersectionEnd - intersectionStart);
    if (intersection <= 0) return 0;
    const overlapRatio = intersection / note.audioDur;
    const noteCenter = (noteStart + noteEnd) / 2;
    const pressCenter = (pressStartMs + pressEndMs) / 2;
    const centerDiff = Math.abs(pressCenter - noteCenter);
    const timingScore = Math.max(0, 1 - centerDiff / note.audioDur);
    const acc = Math.round(100 * overlapRatio * timingScore);
    return acc;
  };

  // returns the numeric accuracy (0-100) applied for this hit, and updates score/accuracy state
  const evaluateHit = useCallback((note, press) => {
    const acc = computeAccuracyForHit(note, press.start, press.end);
    if (acc > 0) {
      // update cumulative accuracy sum (0-100 per note)
      sumAccRef.current += acc;

      // scale to points for score, update score
      const points = Math.round((acc / 100) * MAX_POINTS_PER_NOTE);
      setScore((s) => s + points);

      // mark note as hit
      fallingNotesRef.current = fallingNotesRef.current.map((n) =>
        n.id === note.id ? { ...n, hit: true } : n
      );
      setFallingNotes([...fallingNotesRef.current]);

      // update accuracy percentage immediately
      const newAccPercent =
        totalNotesRef.current > 0
          ? Math.min(100, (sumAccRef.current / totalNotesRef.current) * 100)
          : 100;
      setAccuracy(newAccPercent);
    }
    return acc;
  }, []);

  const gameLoop = useCallback(
    (ts) => {
      if (gameStateRef.current !== "playing") return;
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = ts - lastTimeRef.current;
      lastTimeRef.current = ts;

      if (ts - gameStartTimeRef.current > gameDuration) {
        gameOver();
        return;
      }

      const elapsedSeconds = Math.floor((ts - gameStartTimeRef.current) / 1000);
      if (elapsedSeconds !== lastSecondRef.current) {
        setRemainingTime(60 - elapsedSeconds);
        lastSecondRef.current = elapsedSeconds;
      }

      // Clean up old notes (missed notes)
      let changed = false;
      const newFallingNotes = fallingNotesRef.current.filter((n) => {
        const elapsed = ts - n.startTime;
        if (elapsed > n.fallDuration) {
          // note missed (not hit)
          changed = true;
          return false;
        }
        return true;
      });
      if (changed) {
        fallingNotesRef.current = newFallingNotes;
        setFallingNotes(newFallingNotes);

        // recalc accuracy because totalNotesRef may have increased earlier on spawn,
        // and missed notes contribute 0 to sumAccRef (so the % may drop)
        const newAccPercent =
          totalNotesRef.current > 0
            ? Math.min(100, (sumAccRef.current / totalNotesRef.current) * 100)
            : 100;
        setAccuracy(newAccPercent);
      }

      if (ts >= nextSpawnRef.current) {
        const currentDiff = difficultyRef.current;
        if (!currentDiff) return;
        const noteSpeed = difficulties[currentDiff].noteSpeed;
        const timeToHit = (GAME_HEIGHT / noteSpeed) * 1000;
        const audioDur = 500 + Math.random() * 1000;
        const length = (audioDur / 1000) * noteSpeed;
        const exitTime = audioDur;
        const fallDuration = timeToHit + exitTime;
        const k = allKeys[Math.floor(Math.random() * allKeys.length)];
        const idx = allKeys.findIndex((i) => i.note === k.note);
        const laneW = 100 / allKeys.length;
        const x = idx * laneW + laneW / 2;
        const noteId = Date.now() + Math.random();
        const isBlack = blackKeyNotes.has(k.note);
        const noteWidth = isBlack ? 38 : 60;
        const noteName = noteDisplayName[k.note];
        const newNote = {
          id: noteId,
          note: k.note,
          x,
          length,
          startTime: ts,
          audioDur,
          timeToHit,
          fallDuration,
          hit: false,
          isFalling: false,
          width: noteWidth, // <-- stored here
          isBlack, // optional, for possible future use
        };

        fallingNotesRef.current.push(newNote);

        // increment total notes BEFORE recalculating accuracy so live accuracy reflects the new denominator
        totalNotesRef.current++;
        setFallingNotes([...fallingNotesRef.current]);

        // update live accuracy immediately (a newly spawned note lowers the average unless already accounted)
        const newAccPercent =
          totalNotesRef.current > 0
            ? Math.min(100, (sumAccRef.current / totalNotesRef.current) * 100)
            : 100;
        setAccuracy(newAccPercent);

        nextSpawnRef.current = ts + difficulties[currentDiff].spawnRate;

        // Trigger falling animation after mount
        setTimeout(() => {
          if (gameStateRef.current !== "playing") return;
          const note = fallingNotesRef.current.find((n) => n.id === noteId);
          if (note && !note.isFalling) {
            note.isFalling = true;
            setFallingNotes([...fallingNotesRef.current]);
          }
        }, 0);
      }

      animationFrameId.current = requestAnimationFrame(gameLoop);
    },
    [difficultyRef, gameStateRef]
  );

  const startGame = useCallback(
    (diff) => {
      setDifficulty(diff);
      setGameState("playing");
      setScore(0);
      setAccuracy(100);
      setRemainingTime(60);
      setFallingNotes([]);
      setActivePianoKeys(new Set());
      setGameSummary(null);
      setHighScore(null);
      fallingNotesRef.current = [];
      totalNotesRef.current = 0;
      sumAccRef.current = 0;
      pressesRef.current.clear();
      lastSecondRef.current = 0;
      gameStartTimeRef.current = performance.now();
      lastTimeRef.current = 0;
      nextSpawnRef.current = performance.now() + difficulties[diff].spawnRate;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    },
    [gameLoop]
  );

  const gameOver = useCallback(() => {
    setGameState("gameOver");
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    const finalScore = score; // already scaled points
    const avgAcc =
      totalNotesRef.current > 0 ? (sumAccRef.current / totalNotesRef.current) : 100;
    const finalAcc = avgAcc.toFixed(1);
    const totalPossible = totalNotesRef.current * MAX_POINTS_PER_NOTE;
    setGameSummary({
      userScore: finalScore,
      totalPossible,
      accuracy: finalAcc,
      totalNotes: totalNotesRef.current,
      difficulty,
    });
    const activity = {
      type: 'notefall_game',
      pointsEarned: finalScore,
      tokensEarned: Math.floor(finalScore / 1000)
    };
    logActivity(activity);
    api(`/api/user/highscore/${activity.type}`)
      .then(data => setHighScore(data.highScore))
      .catch(err => console.error("Failed to fetch high score", err));
  }, [difficulty, score, logActivity]);

  const handleKeyDown = useCallback(
    (e) => {
      if (gameStateRef.current !== "playing") return;
      const keyMap = {
        z: "C4",
        x: "D4",
        c: "E4",
        v: "F4",
        b: "G4",
        n: "A4",
        m: "B4",
        s: "C#4",
        d: "D#4",
        g: "F#4",
        h: "G#4",
        j: "A#4",
        ",": "C5",
        l: "C#5",
        ".": "D5",
        ";": "D#5",
        "/": "E5",
      };
      const note = keyMap[e.key.toLowerCase()];
      if (!note || activePianoKeys.has(note)) return;
      e.preventDefault();
      setActivePianoKeys((s) => new Set(s).add(note));
      playNoteAudio(note);
      pressesRef.current.set(note, { start: performance.now() });
    },
    [activePianoKeys, gameStateRef]
  );

  const handleKeyUp = useCallback(
    (e) => {
      if (gameStateRef.current !== "playing") return;
      const keyMap = {
        z: "C4",
        x: "D4",
        c: "E4",
        v: "F4",
        b: "G4",
        n: "A4",
        m: "B4",
        s: "C#4",
        d: "D#4",
        g: "F#4",
        h: "G#4",
        j: "A#4",
        ",": "C5",
        l: "C#5",
        ".": "D5",
        ";": "D#5",
        "/": "E5",
      };
      const note = keyMap[e.key.toLowerCase()];
      if (!note || !activePianoKeys.has(note)) return;
      e.preventDefault();
      const press = pressesRef.current.get(note);
      if (press) {
        press.end = performance.now();
        // find first matching unhit falling note and evaluate
        for (let i = 0; i < fallingNotesRef.current.length; i++) {
          const n = fallingNotesRef.current[i];
          if (!n.hit && n.note === note) {
            const acc = evaluateHit(n, press);
            if (acc > 0) {
              break;
            }
            // if acc === 0, it's a miss for this note — but we still consume the press
            break;
          }
        }
        pressesRef.current.delete(note);
      }
      setActivePianoKeys((s) => {
        const ns = new Set(s);
        ns.delete(note);
        return ns;
      });
      releaseNoteAudio(note);
    },
    [activePianoKeys, gameStateRef, evaluateHit]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      sampler.current?.dispose();
    };
  }, []);

  if (gameState === "selection") {
    return (
      <section>
        <div
          className="card"
          style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}
        >
          <h3>Notefall</h3>
          <p className="muted">
            Play the falling notes before they hit the bottom. Choose
            difficulty.
          </p>
          <div
            className="actions"
            style={{ justifyContent: "center", gap: "var(--space-sm)" }}
          >
            <button
              className="btn primary"
              onClick={() => startGame("easy")}
              disabled={!isLoaded}
            >
              Easy
            </button>
            <button
              className="btn primary"
              onClick={() => startGame("medium")}
              disabled={!isLoaded}
            >
              Medium
            </button>
            <button
              className="btn primary"
              onClick={() => startGame("hard")}
              disabled={!isLoaded}
            >
              Hard
            </button>
          </div>
          {!isLoaded && <p>Loading sounds...</p>}
          <div
            className="actions"
            style={{ justifyContent: "center", marginTop: "var(--space-xl)" }}
          >
            <button
              className="btn"
              onClick={() => navigate("/learn/practice/piano/ranked")}
            >
              Back to Games
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (gameState === "gameOver") {
  const userScore = sumAccRef.current*10;
  const totalPossible = totalNotesRef.current * MAX_POINTS_PER_NOTE;
  const finalAccuracy = (userScore / totalPossible * 100).toFixed(2);
  const totalNotesPlayed = gameSummary?.totalNotes ?? totalNotesRef.current;
  const tokensEarned = Math.floor(userScore / 1000);

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
          <div style={{ color: "var(--muted-foreground)" }}>Difficulty: <strong style={{ textTransform: "capitalize" }}>{gameSummary?.difficulty ?? difficultyRef.current}</strong></div>
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
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>User Score</div>
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{Number(userScore).toLocaleString()}</div>
          </div>

          {highScore !== null && (
            <p className="muted" style={{ gridColumn: '1 / -1', margin: 0, padding: '0 var(--space-md)' }}>
              {userScore > highScore ? `🎉 New High Score! (Previous: ${highScore})` : `High Score: ${highScore}`}
            </p>
          )}
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
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Total Possible</div>
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{Number(totalPossible).toLocaleString()}</div>
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
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{finalAccuracy}%</div>
          </div>

          <div
            style={{
              background: "rgba(226,232,240,0.06)",
              padding: "var(--space-md)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 96,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Total Notes</div>
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>{totalNotesPlayed}</div>
          </div>
        </div>

        <p className="small muted" style={{ marginTop: 'var(--space-md)' }}>
          You earned {Number(userScore).toLocaleString()} XP and {tokensEarned} Tokens!
        </p>

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "var(--space-md)", display: "flex", gap: "var(--space-sm)", justifyContent: "center" }}>
          <button
            className="btn primary"
            onClick={() => {
              setGameState("selection");
              setGameSummary(null);
            }}
            style={{ minWidth: 140 }}
          >
            Play Again
          </button>

          <button
            className="btn"
            onClick={() => navigate("/learn/practice/piano/ranked")}
            style={{ minWidth: 180 }}
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
      <div className="notefall-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 var(--space-md)",
          }}
        >
          <h2>Notefall</h2>
          <div>
            <span style={{ marginRight: "var(--space-lg)" }}>
              Score: {score}
            </span>
            <span style={{ marginRight: "var(--space-lg)" }}>
              Time: {Math.ceil(remainingTime)}s
            </span>
            <span>Accuracy: {accuracy.toFixed(1)}%</span>
          </div>
          <button className="btn" onClick={gameOver}>
            End Game
          </button>
        </div>

        <div className="notefall-game-area" ref={gameAreaRef}>
          {fallingNotes.map((n) => (
            <div
              key={n.id}
              className={`falling-note ${n.hit ? "hit" : ""} ${n.isBlack ? "black" : "white"}`}
              style={{
                left: `${n.x}%`,
                top: n.isFalling ? `${GAME_HEIGHT}px` : `-${n.length}px`,
                height: `${n.length}px`,
                width: `${n.width}px`, // <-- pixel width
                transition: n.isFalling ? `top ${n.fallDuration}ms linear` : "none",
                backgroundColor: n.hit ? "#4ade80" : n.isBlack ? "#3a609dff" : "#3b82f6",
                transform: "translateX(-50%)",
                borderRadius: "var(--radius-sm)",
                boxShadow: n.hit ? "0 0 10px rgba(74,222,128,0.6)" : "none",
              }}
            >
              <div className="note-name">{noteDisplayName[n.note]}</div>
            </div>
          ))}
        </div>
        <div className="piano-class">
          <Piano
            mode="game"
            activeNotes={activePianoKeys}
            onNoteOn={() => {}}
            onNoteOff={() => {}}
            disabled={!isLoaded}
            showNoteNames={false}
            className="game-mode"
          />
        </div>
        {!isLoaded && <div className="spinner" style={{ margin: "var(--space-xl) auto" }}></div>}
      </div>
    </section>
  );
}
