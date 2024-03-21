import { useEffect, useRef, useState } from "react";
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
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [localMessages]);

  const renderMessage = (message: Message, index: number) => {
    let messageClass = styles.otherMessage;
    if (message.user === userName) {
      messageClass = styles.ownMessage;
    } else if (message.user === "System") {
      messageClass = styles.systemMessage;
    }

    return (
      <div key={index} className={`${styles.message} ${messageClass}`}>
        <span>
          {message.user}: {message.content}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.chatBox} ref={chatBoxRef}>
      {localMessages.map(renderMessage)}
    </div>
  );
};

export default ChatBox;
