import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import WelcomeScreen from "../components/WelcomeScreen";
import styles from "./ChatPage.module.css";

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user._id}`);
    setIsMobileOpen(false);
  };

  const handleBack = () => {
    setSelectedUser(null);
    navigate("/");
    setIsMobileOpen(true);
  };

  return (
    <div className={styles.chatPage}>
      <div className={`${styles.sidebar} ${!selectedUser || isMobileOpen ? styles.sidebarVisible : ""}`}>
        <Sidebar
          activeUserId={userId}
          onSelectUser={handleSelectUser}
        />
      </div>
      <div className={`${styles.main} ${selectedUser ? styles.mainVisible : ""}`}>
        {selectedUser || userId ? (
          <ChatWindow
            targetUserId={userId}
            selectedUser={selectedUser}
            onSetSelectedUser={setSelectedUser}
            onBack={handleBack}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
}
