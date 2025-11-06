import React from 'react';
import { Link } from 'react-router-dom';

// Mock data for user's practice sessions, as managed by an admin
const mockPracticeLog = [
  {
    id: 1,
    date: '2024-05-20',
    duration: 45, // in minutes
    instrument: 'Piano',
    topic: 'Practiced C Major and G Major scales, focusing on consistent timing.',
    instructor: 'Jane Doe',
  },
  {
    id: 2,
    date: '2024-05-18',
    duration: 60,
    instrument: 'Guitar',
    topic: 'Learned the Am-G-C-F chord progression and practiced smooth transitions.',
    instructor: 'John Smith',
  },
  {
    id: 3,
    date: '2024-05-15',
    duration: 30,
    instrument: 'Piano',
    topic: 'Introduction to music theory: understanding key signatures.',
    instructor: 'Jane Doe',
  },
  {
    id: 4,
    date: '2024-05-12',
    duration: 50,
    instrument: 'Guitar',
    topic: 'Worked on fingerpicking patterns and played "Stairway to Heaven" intro.',
    instructor: 'John Smith',
  },
];

export default function PracticeLog() {
  return (
    <section>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/learn" className="link-accent small">← Back to Learn Page</Link>
        </div>
        <h2>Your Practice Log</h2>
        <p className="muted" style={{ marginBottom: 'var(--space-xl)' }}>
          A history of your practice sessions and topics covered at our academy.
        </p>

        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {mockPracticeLog.map(log => (
            <div key={log.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-sm)' }}>
                <h4 style={{ margin: 0 }}>{log.instrument} Practice</h4>
                <span className="small muted">{new Date(log.date).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: '0 0 var(--space-sm)' }}>{log.topic}</p>
              <div className="small muted" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-elevated)', paddingTop: 'var(--space-sm)' }}>
                <span>Duration: <strong>{log.duration} mins</strong></span>
                <span>Instructor: <strong>{log.instructor}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}