import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import styles from "./Sidebar.module.css";

const API = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export default function Sidebar({ activeUserId, onSelectUser }) {
  const { user, logout } = useAuth();
  const { isUserOnline, isConnected } = useSocket();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users`);
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (!q.trim()) return setSearchResults([]);
    try {
      const { data } = await axios.get(`${API}/api/users/search?q=${q}`);
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err.message);
    }
  }, []);

  const displayUsers = searchQuery ? searchResults : users;

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>◈</span>
          <span className={styles.brandName}>ChatSphere</span>
        </div>
        <div className={styles.headerActions}>
          <div className={`${styles.connDot} ${isConnected ? styles.connOnline : ""}`} title={isConnected ? "Connected" : "Disconnected"} />
          <button className={styles.logoutBtn} onClick={logout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Current user info */}
      <div className={styles.currentUser} onClick={() => setShowProfile(!showProfile)}>
        <div className={styles.avatarWrap}>
          <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt={user?.username} className={styles.avatar} />
          <span className={styles.onlineBadge} />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.username}>{user?.username}</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search users…"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchQuery && (
          <button className={styles.clearSearch} onClick={() => handleSearch("")}>×</button>
        )}
      </div>

      {/* Users list */}
      <div className={styles.usersList}>
        {loading ? (
          <div className={styles.loadingState}>
            {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : displayUsers.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? "No users found" : "No other users yet"}
          </div>
        ) : (
          displayUsers.map((u) => (
            <button
              key={u._id}
              className={`${styles.userItem} ${activeUserId === u._id ? styles.active : ""}`}
              onClick={() => onSelectUser(u)}
            >
              <div className={styles.avatarWrap}>
                <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} className={styles.avatar} />
                {isUserOnline(u._id) && <span className={styles.onlineBadge} />}
              </div>
              <div className={styles.userItemInfo}>
                <span className={styles.userItemName}>{u.username}</span>
                <span className={`${styles.userItemStatus} ${isUserOnline(u._id) ? styles.online : ""}`}>
                  {isUserOnline(u._id) ? "● Online" : "○ Offline"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
