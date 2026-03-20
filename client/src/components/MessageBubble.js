import React from "react";
import styles from "./MessageBubble.module.css";

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const senderAvatar =
    message.sender?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.username}`;

  return (
    <div className={`${styles.row} ${isOwn ? styles.own : styles.other}`}>
      {!isOwn && (
        <div className={styles.avatarSlot}>
          {showAvatar ? (
            <img src={senderAvatar} alt={message.sender?.username} className={styles.avatar} />
          ) : (
            <div className={styles.avatarSpacer} />
          )}
        </div>
      )}
      <div className={styles.bubbleGroup}>
        {!isOwn && showAvatar && (
          <span className={styles.senderName}>{message.sender?.username}</span>
        )}
        <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
          <span className={styles.text}>{message.text}</span>
        </div>
        <span className={styles.time}>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
