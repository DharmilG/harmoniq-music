import React from 'react';
import { Link } from 'react-router-dom';

export default function RankedGuitarGame() {
  return (
    <section>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/learn/practice/guitar/lobby" className="link-accent small">← Back to Guitar Lobby</Link>
        </div>
        <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
          <h2>Ranked Guitar Challenge</h2>
          <p className="muted">
            This is where the ranked guitar game will be. Coming soon!
          </p>
        </div>
      </div>
    </section>
  );
}