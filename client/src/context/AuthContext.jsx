import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smu_token') || null);
  const [selectedSchool, setSelectedSchool] = useState(
    JSON.parse(localStorage.getItem('smu_selected_school') || 'null')
  );
  const [selectedGrade, setSelectedGrade] = useState(
    localStorage.getItem('smu_selected_grade') || ''
  );
  const [loading, setLoading] = useState(true);

  // Load user profile if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          if (data.schoolId && !selectedSchool) {
            setSelectedSchool(data.schoolId);
          }
          if (data.grade && !selectedGrade) {
            setSelectedGrade(data.grade);
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (userData) => {
    setUser(userData);
    setToken(userData.token);
    localStorage.setItem('smu_token', userData.token);
    if (userData.schoolId) {
      setSelectedSchool(userData.schoolId);
      localStorage.setItem('smu_selected_school', JSON.stringify(userData.schoolId));
    }
    if (userData.grade) {
      setSelectedGrade(userData.grade);
      localStorage.setItem('smu_selected_grade', userData.grade);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smu_token');
  };

  const setSchool = (school) => {
    setSelectedSchool(school);
    if (school) {
      localStorage.setItem('smu_selected_school', JSON.stringify(school));
    } else {
      localStorage.removeItem('smu_selected_school');
    }
  };

  const setGrade = (gradeStr) => {
    setSelectedGrade(gradeStr);
    localStorage.setItem('smu_selected_grade', gradeStr);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        selectedSchool,
        setSchool,
        selectedGrade,
        setGrade,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
