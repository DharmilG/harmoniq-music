import { Link } from 'react-router-dom';
import './PianoLobby.css';

export default function PianoLobby() {
  return (
    <section className="container">
      <div className="lobby-header">
        <h2>Choose Your Practice Mode</h2>
        <p className="small">Select how you'd like to play. Ranked mode will test your skills, while Unranked is for free play.</p>
      </div>

      <div className="mode-selection-grid">
        <Link to="/learn/practice/piano/unranked" className="card mode-card">
          <div className="mode-card-content">
            <span className="mode-icon">🎹</span>
            <h3>Unranked Mode</h3>
            <p className="small">
              Practice freely without any pressure. Play any song, experiment with notes, and enjoy the music. Your progress won't be scored or saved.
            </p>
            <div className="btn" style={{ marginTop: 'auto' }}>
              Start Free Play
            </div>
          </div>
        </Link>

        <Link to="/learn/practice/piano/ranked" className="card mode-card">
          <div className="mode-card-content">
            <span className="mode-icon">🏆</span>
            <h3>Ranked Mode</h3>
            <p className="small">
              Test your skills against the clock! Follow the prompts, hit the right notes, and aim for a high score to climb the leaderboards.
            </p>
            <div className="btn primary" style={{ marginTop: 'auto' }}>
              Start Challenge
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
