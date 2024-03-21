import { useEffect, useState } from "react";
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
  const [roomCode, setRoomCode] = useState("");
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

  const joinRoom = (userName: string, roomCode: string) => {
    if (!userName || !roomCode) {
      alert("Username and room code are required");
      return;
    }

    setUserName(userName);
    setRoomCode(roomCode);

    if (ws) {
      ws.send(
        JSON.stringify({ action: "join", room: roomCode, user: userName })
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

  return (
    <div>
      <h1>Chat Room App</h1>
      <JoinSection onJoin={joinRoom} onGenerateCode={() => "GeneratedCode"} />
      <ChatBox userName={userName} messages={messages} />
      <MessageBox onSendMessage={sendMessage} />
      <RoomsSection />
    </div>
  );
};

export default App;
