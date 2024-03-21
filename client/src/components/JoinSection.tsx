import { useState } from "react";
import styles from "../styles/JoinSection.module.css";

interface JoinSectionProps {
  onJoin: (userName: string, roomCode: string) => void;
  onGenerateCode: () => string;
}

const JoinSection: React.FC<JoinSectionProps> = ({
  onJoin,
  onGenerateCode,
}) => {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleJoinClick = () => {
    if (!userName || !roomCode) {
      alert("Please enter your name and room code.");
      return;
    }
    onJoin(userName, roomCode);
  };

  const handleGenerateCode = () => {
    const code = onGenerateCode();
    setRoomCode(code);
  };

  return (
    <div className={styles.joinSection}>
      <input
        type='text'
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder='Enter your name'
      />
      <input
        type='text'
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder='Enter room code'
      />
      <button onClick={handleJoinClick}>Join Room</button>
      <button onClick={handleGenerateCode}>Generate Code</button>
    </div>
  );
};

export default JoinSection;
