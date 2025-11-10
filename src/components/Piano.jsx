import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as Tone from 'tone';

const keyMap = {
    // Bottom row
    'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
    ',': 'C5', '.': 'D5', '/': 'E5',
    // Top row
    's': 'C#4', 'd': 'D#4', 'g': 'F#4', 'h': 'G#4', 'j': 'A#4',
    'l': 'C#5', ';': 'D#5',
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
    { note: 'C5', type: 'white' }, { note: 'C#5', type: 'black' }, { note: 'D5', type: 'white' },
    { note: 'D#5', type: 'black' }, { note: 'E5', type: 'white' }
];

const Piano = ({
    mode = 'unranked',
    activeNotes: activeNotesProp = new Set(),
    onNoteOn,
    onNoteOff,
    disabled = false,
    showNoteNames = true,
    className = '',
}) => {
    const sampler = useRef(null);
    const [isLoaded, setLoaded] = useState(false);
    // Use an internal state for active notes only if not controlled from parent
    const [internalActiveNotes, setInternalActiveNotes] = useState(new Set());
    const [audioStarted, setAudioStarted] = useState(false);

    const activeNotes = onNoteOn ? activeNotesProp : internalActiveNotes;

    useEffect(() => {
        // Initialize the Sampler
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
            // The base URL for the samples
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            // Callback to run when all samples are loaded
            onload: () => {
                setLoaded(true);
            }
        }).toDestination();

        return () => {
            // Cleanup sampler on unmount
            if (sampler.current) sampler.current.dispose();
        };
    }, []);

    const startAudio = async () => {
        if (!audioStarted) {
            await Tone.start();
            setAudioStarted(true);
            console.log("Audio context started");
        }
    };

    const playNote = useCallback((note) => {
        if (onNoteOn) {
            onNoteOn(note);
        } else if (sampler.current && isLoaded && !activeNotes.has(note)) {
            sampler.current.triggerAttack(note, Tone.now());
            setInternalActiveNotes(prev => new Set(prev).add(note));
        }
    }, [isLoaded, activeNotes, onNoteOn]);

    const stopNote = useCallback((note) => {
        if (onNoteOff) {
            onNoteOff(note);
        } else if (sampler.current && isLoaded && activeNotes.has(note)) {
            // Note: Sampler doesn't have triggerRelease for individual notes in the same way.
            // The sound will decay naturally based on the sample's envelope.
            setInternalActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(note);
                return newSet;
            });
        }
    }, [isLoaded, activeNotes, onNoteOff]);

    // Keyboard event handlers
    useEffect(() => {
        // Only attach listeners if the piano is not controlled by a parent game
        if (onNoteOn) return;

        const handleKeyDown = (e) => {
            const note = keyMap[e.key.toLowerCase()];
            if (note) {
                e.preventDefault();
                startAudio();
                playNote(note);
            }
        };

        const handleKeyUp = (e) => {
            const note = keyMap[e.key.toLowerCase()];
            if (note) {
                e.preventDefault();
                stopNote(note);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [playNote, stopNote, onNoteOn]);

    return (
        <div className="piano-container" onClick={startAudio}>
            {mode !== 'game' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <h2>Play Piano</h2>
                        <span className="badge" style={{ textTransform: 'capitalize' }}>{mode} Mode</span>
                    </div>
                    <p className="muted">
                        {isLoaded ? 'Use your keyboard to play. Click the piano to enable audio.' : 'Loading piano samples...'}
                    </p>
                </>
            )}
            <div className={`piano ${!isLoaded || disabled ? 'loading' : ''} ${mode === 'game' ? 'game-mode' : ''}`}>
                {allKeys.map(({ note, type }) => (
                    <div
                        key={note}
                        data-note={note}
                        className={`piano-key ${type} ${activeNotes.has(note) ? 'active' : ''}`}
                        onMouseDown={() => !disabled && isLoaded && playNote(note)}
                        onMouseUp={() => !disabled && isLoaded && stopNote(note)}
                        onMouseLeave={() => !disabled && isLoaded && stopNote(note)}
                    >
                        <div className="key-label">
                            <span className="key-char">{noteToKey[note]?.toUpperCase()}</span>
                            {showNoteNames && <span className="note-name">{note}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Piano;