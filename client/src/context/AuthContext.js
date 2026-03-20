import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const API = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("chatToken"));
  const [loading, setLoading] = useState(true);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const { data } = await axios.get(`${API}/api/auth/me`);
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
    localStorage.setItem("chatToken", data.token);
    setToken(data.token);
    setUser(data.user);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    return data.user;
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post(`${API}/api/auth/register`, { username, email, password });
    localStorage.setItem("chatToken", data.token);
    setToken(data.token);
    setUser(data.user);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("chatToken");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
