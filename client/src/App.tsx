import { useState, useEffect } from "react";
import ChatBox from "./components/ChatBox";
import JoinSection from "./components/JoinSection";
import MessageBox from "./components/MessageBox";
import RoomsSection from "./components/RoomsSection";

interface Message {
  user: string;
  content: string;
}

const App: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = "ws://localhost:8080";
    const webSocket = new WebSocket(wsUrl);

    webSocket.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    setWs(webSocket);

    return () => {
      webSocket.close();
    };
  }, []);

  const joinRoom = (userNameInput: string, roomName: string) => {
    if (!userNameInput || !roomName) {
      alert("Username and room code are required");
      return;
    }

    setUserName(userNameInput);
    setCurrentRoom(roomName);

    if (ws) {
      ws.send(
        JSON.stringify({ action: "join", room: roomName, user: userNameInput })
      );
    }
  };

  const leaveRoom = () => {
    if (!currentRoom) {
      alert("You are not in a room.");
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({ action: "leave", room: currentRoom, user: userName })
      );
    }

    setCurrentRoom("");
    setMessages([]);
  };

  const sendMessage = (content: string) => {
    if (!ws) {
      alert("WebSocket is not connected");
      return;
    }

    ws.send(JSON.stringify({ action: "message", content, user: userName }));
  };

  const handleGenerateCode = (): string => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  return (
    <div>
      <h1>Chat Room</h1>
      <JoinSection onJoin={joinRoom} onGenerateCode={handleGenerateCode} />
      <button onClick={leaveRoom}>Leave Room</button>
      <ChatBox userName={userName} messages={messages} />
      <MessageBox onSendMessage={sendMessage} />
      <RoomsSection
        currentRoom={currentRoom}
        onJoinRoom={(roomName) => joinRoom(userName, roomName)}
      />
    </div>
  );
};

export default App;
