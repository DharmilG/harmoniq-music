import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../context/apiClient.js';

// --- 1. NEW REUSABLE SVG COMPONENT ---
// I have moved the SVG design into its own function.
// It is exported, so you can import it and use it in other files.
// It takes the 'notes' and 'onPlayNote' function as props.

export function VirtualGuitarSvg({ notes, onPlayNote }) {
  return (
    <div style={{
      margin: 'var(--space-xl) auto',
      maxWidth: '800px',
      position: 'relative',
    }}>
      <svg width="100%" height="450" viewBox="0 0 800 450" style={{ display: 'block' }}>
        {/* Guitar body (acoustic style) */}
        <defs>
          <radialGradient id="bodyGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CD853F" />
            <stop offset="100%" stopColor="#8B4513" />
          </radialGradient>
          <radialGradient id="holeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1A0F08" />
            <stop offset="100%" stopColor="#2C1810" />
          </radialGradient>
        </defs>
        
        <ellipse cx="600" cy="225" rx="170" ry="200" fill="url(#bodyGradient)" stroke="#654321" strokeWidth="4"/>
        <ellipse cx="600" cy="225" rx="140" ry="170" fill="#DEB887" stroke="#8B4513" strokeWidth="3"/>
        
        {/* Sound hole */}
        <circle cx="600" cy="225" r="55" fill="url(#holeGradient)" stroke="#654321" strokeWidth="3"/>
        <circle cx="600" cy="225" r="50" fill="none" stroke="#8B4513" strokeWidth="1.5"/>
        <circle cx="600" cy="225" r="45" fill="none" stroke="#8B4513" strokeWidth="1"/>
        
        {/* Decorative rosette */}
        {[35, 40].map((r, i) => (
          <circle key={i} cx="600" cy="225" r={r} fill="none" stroke="#654321" strokeWidth="0.5"/>
        ))}
        
        {/* Neck - wider and more realistic */}
        <rect x="50" y="170" width="500" height="110" fill="#654321" stroke="#4A2511" strokeWidth="3" rx="5"/>
        <rect x="50" y="175" width="500" height="100" fill="#8B6914" stroke="#654321" strokeWidth="1" rx="3"/>
        
        {/* Frets - with position markers */}
        {[120, 180, 240, 300, 360, 420, 480].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="170" x2={x} y2="280" stroke="#E8E8E8" strokeWidth="3"/>
            {/* Position markers on 3rd and 5th frets */}
            {(i === 2 || i === 4) && (
              <circle cx={x - 30} cy="225" r="6" fill="#F5F5DC" opacity="0.6"/>
            )}
          </g>
        ))}
        
        {/* Nut (start of fretboard) */}
        <rect x="48" y="168" width="6" height="114" fill="#F5F5DC" stroke="#C0C0C0" strokeWidth="2" rx="1"/>
        
        {/* Headstock - more defined */}
        <path d="M 50 170 L 15 145 L 15 305 L 50 280 Z" fill="#654321" stroke="#4A2511" strokeWidth="3"/>
        <path d="M 20 150 L 45 168 L 45 282 L 20 300 Z" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
        
        {/* Tuning pegs - 4 strings */}
        {[190, 215, 240, 265].map((y, i) => (
          <g key={i}>
            <circle cx="12" cy={y} r="10" fill="#C0C0C0" stroke="#808080" strokeWidth="2"/>
            <circle cx="12" cy={y} r="6" fill="#404040"/>
            <rect x="6" y={y - 1.5} width="12" height="3" fill="#808080"/>
          </g>
        ))}
        
        {/* Bridge */}
        <rect x="570" y="195" width="10" height="60" fill="#2C1810" stroke="#1A0F08" strokeWidth="2" rx="2"/>
        
        {/* String anchor at bridge */}
        {[200, 218, 236, 254].map((y, i) => (
          <circle key={i} cx="575" cy={y} r="3" fill="#1A0F08"/>
        ))}
        
        {/* Interactive Strings - 4 strings representing 20 total notes (4 strings × 5 frets) */}
        {notes.map((stringNotes, stringIdx) => {
          const y = 195 + stringIdx * 30;
          const thickness = 5 - stringIdx * 0.8;
          return (
            <line
              key={stringIdx}
              x1="50"
              y1={y}
              x2="575"
              y2={y}
              stroke="#FFD700"
              strokeWidth={thickness}
              style={{
                cursor: 'pointer',
                filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.6))',
                transition: 'all 0.15s ease-out'
              }}
              // Use the prop function here
              onMouseEnter={() => onPlayNote(stringNotes[0])}
              onMouseOver={(e) => {
                e.target.style.stroke = '#FF8C00';
                e.target.style.strokeWidth = thickness + 1;
                e.target.style.filter = 'drop-shadow(0 0 6px rgba(255, 140, 0, 0.9))';
              }}
              onMouseOut={(e) => {
                e.target.style.stroke = '#FFD700';
                e.target.style.strokeWidth = thickness;
                e.target.style.filter = 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.6))';
              }}
            />
          );
        })}
        
        {/* String labels */}
        {['E', 'A', 'D', 'G'].map((label, i) => (
          <text 
            key={i} 
            x="30" 
            y={200 + i * 30} 
            fill="var(--text-muted)" 
            fontSize="12" 
            fontWeight="bold"
            fontFamily="monospace"
          >
            {label}
          </text>
        ))}
      </svg>
      <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '8px' }}>
        4 Strings (E-A-D-G) • Hover over strings to play • Total 20 notes (4 strings × 5 frets)
      </p>
    </div>
  );
}


// --- 2. YOUR MAIN GUITAR COMPONENT (CLEANED UP) ---
// This now uses the new acoustic synth configuration and
// calls the <VirtualGuitarSvg /> component.

export function Guitar({ hasChordsPack }) {
  // --- UPDATED REFS for new acoustic sound ---
  const synthRef = useRef(null);
  const eqRef = useRef(null);
  const vibratoRef = useRef(null);
  const reverbRef = useRef(null);
  
  // --- UPDATED useEffect for new acoustic sound ---
  useEffect(() => {
    synthRef.current = new Tone.PolySynth({
      oscillator: {
        type: 'fmsawtooth',
        modulationType: 'sine',
        harmonicity: 1.01,
        modulationIndex: 2
      },
      envelope: {
        attack: 0.005,
        decay: 0.8,
        sustain: 0.1,
        release: 1.5,
      },
      filter: {
        type: 'lowpass',
        Q: 1,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.2,
        release: 1.0,
        baseFrequency: 300,
        octaves: 4,
      }
    });

    vibratoRef.current = new Tone.Vibrato({
      frequency: 0.5,
      depth: 0.05,
      wet: 0.1,
    });

    eqRef.current = new Tone.EQ3({
      low: -2,
      mid: 3,
      high: 1,
    });

    reverbRef.current = new Tone.Reverb({
      decay: 1.0,
      wet: 0.2
    });

    // --- UPDATED CHAIN for new acoustic sound ---
    synthRef.current.connect(vibratoRef.current);
    vibratoRef.current.connect(eqRef.current);
    eqRef.current.connect(reverbRef.current);
    reverbRef.current.toDestination();
  }, []);

  const playNote = async (note) => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    // Using '8n' (eighth note) for fret buttons, but the hover
    // will just trigger the 'attack' part and the 'release' 
    // from the envelope will handle the fade out.
    // Let's give it a slightly longer duration for button clicks.
    synthRef.current.triggerAttackRelease(note, '4n');
  };

  const playChord = async (chordNotes) => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    // Strum effect
    chordNotes.forEach((note, i) => {
      // '2n' (half note) duration is good for chords
      synthRef.current.triggerAttackRelease(note, '2n', Tone.now() + i * 0.05);
    });
  };

  const chords = {
    Am: ['A2', 'E3', 'A3', 'C4', 'E4'],
    Dm: ['D3', 'A3', 'D4', 'F3'],
    G: ['G2', 'B2', 'D3', 'G3', 'B3', 'D4'],
    C: ['C3', 'E3', 'G3', 'C4', 'E4'],
    Em: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
    F: ['F2', 'A2', 'C3', 'F3', 'A3', 'C4'],
  };

  const advancedChords = {
    Cmaj7: ['C3', 'E3', 'G3', 'B3'],
    G7: ['G2', 'B2', 'D3', 'F3'],
    Dm7: ['D3', 'F3', 'A3', 'C4'],
    E7: ['E2', 'G#2', 'B2', 'D3'],
  };

  const notes = [
    ['E2', 'F2', 'F♯2', 'G2', 'G♯2'],  // String 1 (lowest/thickest)
    ['A2', 'A♯2', 'B2', 'C3', 'C♯3'],  // String 2
    ['D3', 'D♯3', 'E3', 'F3', 'F♯3'],  // String 3
    ['G3', 'G♯3', 'A3', 'A♯3', 'B3'],  // String 4 (highest/thinnest)
  ];

  return (
    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
      <h2>Virtual Guitar</h2>
      <p className="muted">Hover over strings to play them! Click fretboard buttons for specific notes.</p>

      {/* Chord buttons */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <p style={{ fontSize: '0.9em', marginBottom: '8px', color: 'var(--text-muted)' }}>Popular Chords:</p>
        {Object.entries(chords).map(([name, chordNotes]) => (
          <button
            key={name}
            onClick={() => playChord(chordNotes)}
            style={{
              margin: '4px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
              border: '2px solid var(--surface-modal)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text)',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Conditionally rendered Advanced Chords section */}
      {hasChordsPack && (
        <div style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-lg)', borderTop: '1px solid var(--surface-elevated)', paddingTop: 'var(--space-lg)' }}>
          <p style={{ fontSize: '0.9em', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <span className="badge success" style={{ marginRight: '8px' }}>Unlocked</span>
            Advanced Chords:
          </p>
          {Object.entries(advancedChords).map(([name, chordNotes]) => (
            <button
              key={name}
              onClick={() => playChord(chordNotes)}
              style={{
                margin: '4px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
                border: '2px solid var(--accent-primary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--text)',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* --- Visual Guitar --- */}
      {/* This now calls your new reusable component */}
      <VirtualGuitarSvg notes={notes} onPlayNote={playNote} />

      {/* Fretboard Grid: 4 strings (rows), 5 frets (columns) = 20 notes */}
      <div style={{
        margin: 'var(--space-xl) auto',
        maxWidth: '700px',
      }}>
        <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2em' }}>Fretboard</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(5, 1fr)',
          gap: '3px',
          background: 'var(--surface-elevated)',
          border: '2px solid var(--surface-modal)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
        }}>
          {/* Column headers - Fret numbers */}
          <div style={{ padding: '10px', fontWeight: 'bold', fontSize: '12px', color: 'var(--text-muted)' }}>
            String
          </div>
          {[0, 1, 2, 3, 4].map(fret => (
            <div key={fret} style={{ 
              padding: '10px', 
              fontWeight: 'bold', 
              fontSize: '12px', 
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              {fret === 0 ? 'Open' : `Fret ${fret}`}
            </div>
          ))}
          
          {/* Fretboard buttons with string labels */}
          {notes.map((stringNotes, stringIdx) => (
            <React.Fragment key={stringIdx}>
              {/* String label */}
              <div style={{
                padding: '15px 10px',
                background: 'var(--surface)',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text)',
              }}>
                {['E2', 'A2', 'D3', 'G3'][stringIdx].charAt(0)}
              </div>
              
              {/* Notes for this string */}
              {stringNotes.map((note, fretIdx) => (
                <button
                  key={`${stringIdx}-${fretIdx}`}
                  onClick={() => playNote(note)}
                  style={{
                    padding: '18px 8px',
                    background: fretIdx === 0 
                      ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' 
                      : 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
                    border: '2px solid var(--surface-modal)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: fretIdx === 0 ? 'white' : 'var(--text)',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    e.target.style.borderColor = '#FFD700';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.target.style.borderColor = 'var(--surface-modal)';
                  }}
                  title={`String ${stringIdx + 1} (${['E2', 'A2', 'D3', 'G3'][stringIdx]}), Fret ${fretIdx} - ${note}`}
                >
                  {note}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
        <p className="muted" style={{ fontSize: '0.9em', marginTop: 'var(--space-md)' }}>
          <strong>20 Total Notes:</strong> 4 Strings × 5 Positions (Open + 4 Frets)
        </p>
      </div>
    </div>
  );
}


// --- 3. YOUR PAGE WRAPPER COMPONENT (Unchanged) ---

export default function GuitarPractice() {
  const { user } = useAuth();
  const [unlockedRewardIds, setUnlockedRewardIds] = useState(new Set());

  useEffect(() => {
    if (user) {
      api('/api/user/rewards')
        .then(data => setUnlockedRewardIds(new Set(data.unlockedRewardIds)))
        .catch(err => console.error("Failed to fetch user rewards", err));
    }
  }, [user]);

  const hasChordsPack = unlockedRewardIds.has('pack_guitar_chords');

  return (
    <section>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/learn/practice/guitar/lobby" className="link-accent small">← Back to Guitar Lobby</Link>
        </div>
        <Guitar hasChordsPack={hasChordsPack} />
      </div>
    </section>
  );
}