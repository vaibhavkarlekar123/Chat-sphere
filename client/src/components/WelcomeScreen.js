import React from "react";
import styles from "./WelcomeScreen.module.css";

export default function WelcomeScreen() {
  return (
    <div className={styles.welcome}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <div className={styles.icon}>◈</div>
        <h2>Welcome to ChatSphere</h2>
        <p>Select a user from the sidebar to start a conversation.</p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span>⚡</span> Real-time messaging
          </div>
          <div className={styles.feature}>
            <span>🟢</span> Online presence
          </div>
          <div className={styles.feature}>
            <span>✏️</span> Typing indicators
          </div>
        </div>
      </div>
    </div>
  );
}
