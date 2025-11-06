import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { courses, instructors, instruments } from '../data/lessons.js';
import LessonBooking from '../components/LessonBooking.jsx';

export default function Lessons() {
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const modalContentRef = useRef(null);

  // Lock body scroll while modal is open and restore on close / unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (selectedCourse) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';

      // Prevent layout shift when scrollbar disappears
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      // Ensure modal content starts from its top and focus it for accessibility
      requestAnimationFrame(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
          modalContentRef.current.focus();
        }
      });
    } else {
      // restore
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    }

    return () => {
      // cleanup if component unmounts while modal is open
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [selectedCourse]);

  // Close on Escape for accessibility
  useEffect(() => {
    if (!selectedCourse) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedCourse(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCourse]);

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2>Music Lessons</h2>
        <p className="small">
          Choose your instrument, find your level, and start your musical journey with expert guidance.
        </p>
      </div>

      <div
        className="card"
        style={{
          margin: 'var(--space-xl) 0',
          background: 'var(--gradient-glass)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}
      >
        <h3>Scheduling & Pricing</h3>
        <p className="small">
          Weekly classes with flexible time slots. Choose between group sessions for collaborative learning or private lessons for personalized attention.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-md)'
          }}
        >
          <div className="tag pill" style={{ fontSize: '1rem' }}>Group lessons from $25/session</div>
          <div className="tag pill" style={{ fontSize: '1rem' }}>Private lessons from $45/session</div>
          <div className="tag pill" style={{ fontSize: '1rem' }}>Course bundles from $199</div>
        </div>
      </div>

      <h3>Available Courses</h3>
      <ul className="grid">
        {courses.map((c, index) => (
          <li
            key={c.id}
            className="card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="badge">
              {c.instrument} • {c.level}
            </div>
            <h3>{c.summary}</h3>
            <p className="small">Duration: {c.duration}</p>
            <div className="price">${c.price}</div>
            <div className="actions">
              <button
                className="btn primary"
                onClick={() => setSelectedCourse(c)}
              >
                Enroll Now
              </button>
              <button className="btn">Learn More</button>
            </div>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: 'var(--space-2xl)' }}>Meet Our Instructors</h3>
      <ul className="grid">
        {instructors.map((instructor, index) => (
          <li
            key={instructor.id}
            className="card"
            style={{
              animationDelay: `${0.4 + index * 0.1}s`,
              cursor: 'pointer'
            }}
            onClick={() => setSelectedInstructor(selectedInstructor === instructor.id ? null : instructor.id)}
          >
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <img
                src={instructor.img}
                alt={instructor.name}
                className="product-image"
                style={{ height: '200px', width: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3>{instructor.name}</h3>
            <div className="badge">{instructor.instrument}</div>
            <p className="small">{instructor.bio}</p>

            {selectedInstructor === instructor.id && (
              <div
                style={{
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  animation: 'fadeInUp var(--transition-normal) ease-out'
                }}
              >
                <p className="small">
                  <strong>Specialties:</strong> Performance technique, music theory, and student engagement.
                  <br />
                  <strong>Experience:</strong> 10+ years teaching and performing professionally.
                  <br />
                  <strong>Teaching Style:</strong> Patient, encouraging, and results-focused.
                </p>
                <button
                  className="btn primary"
                  style={{ marginTop: 'var(--space-sm)' }}
                  onClick={() =>
                    setSelectedCourse({
                      id: `private-${instructor.id}`,
                      instrument: instructor.instrument,
                      level: 'Private',
                      duration: '1 hour',
                      price: 45,
                      summary: `Private ${instructor.instrument} lesson with ${instructor.name}`
                    })
                  }
                >
                  Book a Lesson
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div
        className="card"
        style={{
          marginTop: 'var(--space-xl)',
          textAlign: 'center',
          background: 'var(--gradient-glass)'
        }}
      >
        <h3>Instruments We Teach</h3>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-md)'
          }}
        >
          {instruments.map((instrument) => (
            <div key={instrument} className="tag pill" style={{ fontSize: '1rem' }}>
              {instrument}
            </div>
          ))}
        </div>
        <p className="small" style={{ marginTop: 'var(--space-md)', color: 'var(--text-muted)' }}>
          Don't see your instrument? Contact us - we're always expanding our offerings!
        </p>
      </div>

      {/* Modal portal for booking */}
      {selectedCourse &&
        createPortal(
          <div
            role="presentation"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 'var(--space-lg)'
            }}
            onClick={(e) => {
              // close when clicking on backdrop
              if (e.target === e.currentTarget) setSelectedCourse(null);
            }}
          >
            <div
              ref={modalContentRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              style={{
                width: 'min(900px, 100%)',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--surface-0)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              <LessonBooking course={selectedCourse} onClose={() => setSelectedCourse(null)} />
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
