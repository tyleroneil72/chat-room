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

  const joinRoom = (roomName: string) => {
    if (!userName || !roomName) {
      alert("Username and room code are required");
      return;
    }

    setCurrentRoom(roomName);

    if (ws) {
      ws.send(
        JSON.stringify({ action: "join", room: roomName, user: userName })
      );
    }
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
      <JoinSection
        onJoin={(user, room) => {
          setUserName(user);
          joinRoom(room);
        }}
        onGenerateCode={handleGenerateCode}
      />
      <ChatBox userName={userName} messages={messages} />
      <MessageBox onSendMessage={sendMessage} />
      <RoomsSection currentRoom={currentRoom} onJoinRoom={joinRoom} />
    </div>
  );
};

export default App;
