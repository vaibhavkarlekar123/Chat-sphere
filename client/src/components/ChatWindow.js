import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";
import styles from "./ChatWindow.module.css";

const API = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export default function ChatWindow({ targetUserId, selectedUser, onSetSelectedUser, onBack }) {
  const { user } = useAuth();
  const { getSocket, isUserOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);

  // Fetch user info if selectedUser not provided
  useEffect(() => {
    if (targetUserId && !selectedUser) {
      axios.get(`${API}/api/users`).then(({ data }) => {
        const found = data.find((u) => u._id === targetUserId);
        if (found) onSetSelectedUser(found);
      });
    }
  }, [targetUserId, selectedUser]);

  // Load messages
  useEffect(() => {
    if (!targetUserId) return;
    setLoading(true);
    setMessages([]);
    axios
      .get(`${API}/api/messages/${targetUserId}`)
      .then(({ data }) => {
        setMessages(data.messages);
        setRoomId(data.roomId);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [targetUserId]);

  // Socket events
  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("room:join", roomId);

    const handleReceive = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleTypingStart = ({ username }) => setTypingUser(username);
    const handleTypingStop = () => setTypingUser(null);

    socket.on("message:receive", handleReceive);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [roomId, getSocket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !roomId || !targetUserId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("message:send", {
      senderId: user._id,
      receiverId: targetUserId,
      text: trimmed,
      roomId,
    });

    setText("");
    // Stop typing
    socket.emit("typing:stop", { roomId, userId: user._id });
    clearTimeout(typingTimer.current);
  }, [text, roomId, targetUserId, user, getSocket]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket || !roomId) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing:start", { roomId, userId: user._id, username: user.username });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      socket.emit("typing:stop", { roomId, userId: user._id });
    }, 1500);
  };

  const isOnline = selectedUser ? isUserOnline(selectedUser._id) : false;

  return (
    <div className={styles.chatWindow}>
      {/* Chat Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className={styles.headerUser}>
          <div className={styles.avatarWrap}>
            <img
              src={selectedUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.username}`}
              alt={selectedUser?.username}
              className={styles.avatar}
            />
            {isOnline && <span className={styles.onlineDot} />}
          </div>
          <div>
            <div className={styles.headerName}>{selectedUser?.username || "..."}</div>
            <div className={`${styles.headerStatus} ${isOnline ? styles.online : ""}`}>
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyChatIcon}>💬</div>
            <p>No messages yet</p>
            <p className={styles.emptyHint}>Say hello to {selectedUser?.username}!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender._id === user._id || msg.sender === user._id}
                showAvatar={
                  i === 0 ||
                  (messages[i - 1]?.sender?._id || messages[i - 1]?.sender) !==
                    (msg.sender?._id || msg.sender)
                }
              />
            ))}
            {typingUser && (
              <div className={styles.typingIndicator}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingText}>{typingUser} is typing</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputBar}>
        <input
          ref={inputRef}
          className={styles.input}
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${selectedUser?.username || ""}…`}
          maxLength={1000}
          disabled={!roomId}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!text.trim() || !roomId}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
