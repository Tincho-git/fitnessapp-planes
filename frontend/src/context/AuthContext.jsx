import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // parse de jwt para obtener el payload
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Check if token exists in sessionStorage for this specific tab
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({ email: decoded.sub, role: decoded.role || 'CLIENT' });
      } else {
        sessionStorage.removeItem('jwtToken');
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();
      const token = data.accessToken;

      sessionStorage.setItem('jwtToken', token);
      const decoded = parseJwt(token);

      setUser({ email: decoded.sub, role: decoded.role || 'CLIENT' });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('jwtToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
