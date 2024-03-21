import { useEffect, useRef } from "react";
import styles from "../styles/ChatBox.module.css";

interface Message {
  user: string;
  content: string;
}

interface ChatBoxProps {
  userName: string;
  messages: Message[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ userName, messages }) => {
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.user === userName;
    const messageClass = isOwnMessage ? styles.ownMessage : styles.otherMessage;

    return (
      <div key={index} className={`${styles.message} ${messageClass}`}>
        <span>
          {isOwnMessage ? "" : `${message.user}: `}
          {message.content}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.chatBox} ref={chatBoxRef}>
      {messages.map(renderMessage)}
    </div>
  );
};

export default ChatBox;
