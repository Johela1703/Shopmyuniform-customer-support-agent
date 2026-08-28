import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, School, Check, Sparkles } from 'lucide-react';

export default function SchoolSelectorModal({ onClose }) {
  const { selectedSchool, setSchool, selectedGrade, setGrade } = useContext(AuthContext);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempSchool, setTempSchool] = useState(selectedSchool);
  const [tempGrade, setTempGrade] = useState(selectedGrade || 'Grade 7');

  const gradesList = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  useEffect(() => {
    fetch('/api/schools')
      .then((res) => res.json())
      .then((data) => {
        setSchools(data);
        if (!tempSchool && data.length > 0) {
          setTempSchool(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load schools', err);
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    setSchool(tempSchool);
    setGrade(tempGrade);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-school" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <School color="#2563eb" size={22} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Select School & Student Grade</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Filtering uniforms by school and grade ensures accurate dress code compliance and instant stock availability.
          </p>

          {/* School Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Institution
            </label>
            {loading ? (
              <p>Loading schools...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {schools.map((sch) => {
                  const isSelected = tempSchool && tempSchool._id === sch._id;
                  return (
                    <div
                      key={sch._id}
                      onClick={() => setTempSchool(sch)}
                      style={{
                        padding: '0.8rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary-light)' : '1px solid var(--border-light)',
                        backgroundColor: isSelected ? '#f0f7ff' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: '0.2s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                          {sch.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {sch.city} • Code: {sch.code}
                        </div>
                      </div>
                      {isSelected && <Check size={20} color="#2563eb" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grade Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Student Grade Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {gradesList.map((g) => {
                const isSelected = tempGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setTempGrade(g)}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      border: isSelected ? '2px solid var(--primary-light)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'white',
                      color: isSelected ? 'white' : 'var(--text-main)',
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          >
            <Sparkles size={18} /> Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
