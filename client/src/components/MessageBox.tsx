import { useState } from "react";
import styles from "../styles/MessageBox.module.css";

interface MessageBoxProps {
  onSendMessage: (message: string) => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.messageBox}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder='Type your message here...'
      ></textarea>
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
};

export default MessageBox;
