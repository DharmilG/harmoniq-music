import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../context/apiClient';

const quizQuestions = [
  {
    question: "What 6-second drum solo from 'Amen, Brother' by The Winstons is the most sampled breakbeat in history, forming the foundation of drum and bass music?",
    options: ["The 'Funky Drummer' Break", "The 'Think' Break", "The 'Apache' Break", "The 'Amen Break'"],
    correctAnswer: "The 'Amen Break'"
  },
  {
    question: "In medieval music theory, what musical interval spanning three whole tones was nicknamed Diabolus in Musica ('The Devil in Music')?",
    options: ["The Perfect Fifth", "The Minor Second", "The Major Seventh", "The Tritone"],
    correctAnswer: "The Tritone"
  },
  {
    question: "What is the name of the early electronic instrument, invented by Léon Theremin, that is unique for being played entirely without physical contact?",
    options: ["The Ondes Martenot", "The Moog Synthesizer", "The Buchla Easel", "The Theremin"],
    correctAnswer: "The Theremin"
  },
  {
    question: "What specific chord progression, based on the 1930 George Gershwin standard 'I Got Rhythm,' is so fundamental to jazz improvisation that it's referred to by its own name?",
    options: ["The 12-Bar Blues", "The 'Coltrane' Changes", "The 'St. Louis Blues' form", "'Rhythm Changes'"],
    correctAnswer: "'Rhythm Changes'"
  },
  {
    question: "What was the first commercially successful digital synthesizer using FM synthesis, released in 1983, which went on to define the sound of 80s pop?",
    options: ["The Roland Juno-106", "The Korg M1", "The Moog Minimoog", "The Yamaha DX7"],
    correctAnswer: "The Yamaha DX7"
  },
  {
    question: "In audio production, what is the technique where a kick drum's volume triggers a volume reduction on a bassline to create space in the mix?",
    options: ["Parallel compression", "Multiband compression", "Gating", "Side-chain compression"],
    correctAnswer: "Side-chain compression"
  },
  {
    question: "What is the 'standard' tuning for a 12-string guitar?",
    options: ["All strings tuned in octaves", "All strings tuned in unison", "All strings tuned to a C major chord", "E-A-D-G in octaves, B-E in unison"],
    correctAnswer: "E-A-D-G in octaves, B-E in unison"
  },
  {
    question: "Which minimalist composer wrote the 1964 piece 'In C,' consisting of 53 short, numbered musical phrases played in sequence at the performers' own pace?",
    options: ["Philip Glass", "Steve Reich", "John Cage", "Terry Riley"],
    correctAnswer: "Terry Riley"
  },
  {
    question: "What is the name of the rotating speaker cabinet, closely associated with the Hammond B3 organ, that creates its signature swirling, 'chorus-like' effect?",
    options: ["A Marshall Stack", "A Fender Twin Reverb", "A Vox AC30", "A Leslie speaker"],
    correctAnswer: "A Leslie speaker"
  },
  {
    question: "In Indian classical music, what is the term for the melodic framework (similar to a mode or scale) upon which a performance is improvised?",
    options: ["Tala", "Sargam", "Alap", "Raga"],
    correctAnswer: "Raga"
  }
];

export default function DailyQuiz() {
    const { logActivity } = useAuth();
    const navigate = useNavigate();
    const [quizState, setQuizState] = useState('loading'); // loading, ready, in-progress, completed
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [userAnswers, setUserAnswers] = useState([]);

    useEffect(() => {
        const checkQuizStatus = async () => {
            try {
                const { canTakeQuiz } = await api('/api/quiz/status');
                if (canTakeQuiz) {
                    setQuizState('ready');
                } else {
                    setQuizState('completed');
                }
            } catch (error) {
                console.error("Failed to check quiz status", error);
                setFeedback(error.message || 'An unknown error occurred.'); // Set feedback with the error message
                setQuizState('error'); // Then set the state to error
            }
        };
        checkQuizStatus();
    }, []);

    const handleAnswer = (answer) => {
        if (selectedAnswer) return; // Prevent changing answer

        setSelectedAnswer(answer);
        setUserAnswers(prev => [...prev, { question: quizQuestions[currentQuestionIndex].question, userAnswer: answer }]);
        if (answer === quizQuestions[currentQuestionIndex].correctAnswer) {
            setScore(s => s + 1);
            setFeedback('Correct!');
        } else {
            setFeedback(`Incorrect. The correct answer was: ${quizQuestions[currentQuestionIndex].correctAnswer}`);
        }

        setTimeout(() => {
            if (currentQuestionIndex < quizQuestions.length - 1) {
                setCurrentQuestionIndex(i => i + 1);
                setSelectedAnswer(null);
                setFeedback('');
            } else {
                // End of quiz
                logActivity({ type: 'daily_quiz', pointsEarned: 50, tokensEarned: 0.25 });
                setQuizState('completed');
            }
        }, 2000);
    };

    if (quizState === 'loading') {
        return <div className="spinner" style={{ margin: 'var(--space-2xl) auto' }}></div>;
    }

    if (quizState === 'error') {
        return (
            <div className="card" style={{ maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
                <h3>Error Loading Quiz</h3>
                <p>{feedback || 'Could not load the quiz. Please try again later.'}</p> {/* Display specific error message */}
                <Link to="/learn" className="btn">Back to Learn Page</Link>
            </div>
        );
    }

    if (quizState === 'completed') {
        return (
            <div className="card" style={{ maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
                <h3>{userAnswers.length > 0 ? 'Quiz Complete!' : 'Daily Quiz'}</h3>
                {userAnswers.length > 0 ? (
                    <>
                        <p>You scored <strong>{score} out of {quizQuestions.length}</strong>.</p>
                        <p>Your accuracy is <strong>{((score / quizQuestions.length) * 100).toFixed(0)}%</strong>.</p>
                        <p className="small muted">You've earned 50 XP and 0.25 🎵 Tokens!</p>
                        <details style={{ textAlign: 'left', marginTop: 'var(--space-lg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Review Answers</summary>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--space-md)' }}>
                                {quizQuestions.map((q, index) => {
                                    const userAnswer = userAnswers[index]?.userAnswer;
                                    const isCorrect = userAnswer === q.correctAnswer;
                                    return (
                                        <li key={index} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                                            <strong>{q.question}</strong><br />
                                            <span style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>Your answer: {userAnswer}</span><br />
                                            {!isCorrect && <span className="small muted">Correct answer: {q.correctAnswer}</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        </details>
                    </>
                ) : (
                    <p>You've already completed your daily quiz. Come back tomorrow for a new one!</p>
                )}
                <div className="actions" style={{ justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
                    <Link to="/learn" className="btn primary">Back to Learn Page</Link>
                </div>
            </div>
        );
    }

    if (quizState === 'ready') {
        return (
            <div className="card" style={{ maxWidth: 600, margin: 'auto', textAlign: 'center' }}>
                <h2>Daily Quiz</h2>
                <p>Test your music theory knowledge and earn rewards!</p>
                <button className="btn primary" onClick={() => setQuizState('in-progress')}>Start Quiz</button>
            </div>
        );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <section>
            <div className="card" style={{ maxWidth: 600, margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h2>Daily Quiz</h2>
                    <p className="muted">{currentQuestionIndex + 1} / {quizQuestions.length}</p>
                </div>
                <progress value={currentQuestionIndex + 1} max={quizQuestions.length} style={{ width: '100%', marginBottom: 'var(--space-lg)' }}></progress>

                <h3 style={{ minHeight: '3em' }}>{currentQuestion.question}</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-sm)' }}>
                    {currentQuestion.options.map(option => {
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const isSelected = option === selectedAnswer;
                        let buttonClass = 'btn';
                        if (selectedAnswer) {
                            if (isCorrect) buttonClass += ' success';
                            else if (isSelected) buttonClass += ' error';
                        }

                        return (
                            <button
                                key={option}
                                className={buttonClass}
                                onClick={() => handleAnswer(option)}
                                disabled={!!selectedAnswer}
                                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {feedback && (
                    <div className={`alert ${feedback.startsWith('Correct') ? 'success' : 'error'}`} style={{ marginTop: 'var(--space-lg)' }}>
                        {feedback}
                    </div>
                )}
            </div>
        </section>
    );
}