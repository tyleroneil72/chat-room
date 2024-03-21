import React, { useEffect, useState } from "react";
import styles from "./styles/RoomsSection.module.css";

interface Room {
  name: string;
  count: number;
}

interface RoomsSectionProps {
  currentRoom: string;
  onJoinRoom: (roomName: string) => void;
}

const RoomsSection: React.FC<RoomsSectionProps> = ({
  currentRoom,
  onJoinRoom,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/rooms");
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 3000); // Fetch rooms every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.roomsSection}>
      <h3>Available Rooms</h3>
      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            {room.name} ({room.count} users)
            <button
              onClick={() => onJoinRoom(room.name)}
              disabled={currentRoom === room.name}
            >
              Join Room
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomsSection;
