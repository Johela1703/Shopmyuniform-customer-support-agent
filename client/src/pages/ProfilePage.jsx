import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, School, GraduationCap, Phone, MapPin, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, updateUser, selectedSchool, setSchool, selectedGrade, setGrade } = useContext(AuthContext);

  const [name, setName] = useState(user ? user.name : '');
  const [studentName, setStudentName] = useState(user ? user.studentName : '');
  const [grade, setGradeState] = useState(user ? user.grade || 'Grade 7' : 'Grade 7');
  const [phone, setPhone] = useState(user ? user.phone : '');
  const [street, setStreet] = useState(user && user.shippingAddress ? user.shippingAddress.street : '');
  const [city, setCity] = useState(user && user.shippingAddress ? user.shippingAddress.city : '');
  const [state, setState] = useState(user && user.shippingAddress ? user.shippingAddress.state : '');
  const [pincode, setPincode] = useState(user && user.shippingAddress ? user.shippingAddress.pincode : '');

  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState(user && user.schoolId ? (user.schoolId._id || user.schoolId) : '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/schools')
      .then((res) => res.json())
      .then((data) => {
        setSchools(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          studentName,
          grade,
          schoolId: schoolId || null,
          phone,
          shippingAddress: { street, city, state, pincode },
        }),
      });

      const updated = await res.json();
      if (res.ok) {
        updateUser(updated);
        if (updated.schoolId) {
          setSchool(updated.schoolId);
        }
        setGrade(updated.grade);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Parent & Student Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
        Configure your student's school and grade to customize your uniform catalog and AI assistant responses.
      </p>

      {savedSuccess && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> Profile information updated successfully!
        </div>
      )}

      <form onSubmit={handleSaveProfile} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="#2563eb" /> Personal Details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Parent / Guardian Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <GraduationCap size={20} color="#2563eb" /> Student Academic Information
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Student Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Alex Jenkins"
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Student Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGradeState(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
            >
              {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>School Institution</label>
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
          >
            <option value="">-- Select School --</option>
            {schools.map((sch) => (
              <option key={sch._id} value={sch._id}>{sch.name} ({sch.city})</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
