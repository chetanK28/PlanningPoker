import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import VoteButtons from "./components/VoteButtons";
import UserCircle from "./components/UserCircle";

const socket = io("http://localhost:5000");

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomId, setRoomId] = useState(searchParams.get("room") || "");
  const [roomName, setRoomName] = useState(localStorage.getItem("roomName") || "");
  const [username, setUsername] = useState("");
  const [inputUsername, setInputUsername] = useState(localStorage.getItem("username") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [votes, setVotes] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [average, setAverage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  useEffect(() => {
    if (roomId && username && role) {
      setJoined(true);
      socket.emit("join-room", { room: roomId, username, role });
    }
  }, [roomId, username, role]);

  useEffect(() => {
    const handleRoomUpdate = (data) => setUsers(Object.values(data.users));
    const handleVoteUpdate = (data) => setVotes(data);
    const handleReveal = (data) => {
      setVotes(data);
      setRevealed(true);
      calculateAverage(data);
    };
    const handleReset = () => {
      setVotes({});
      setRevealed(false);
      setAverage(null);
      setSelectedVote(null);
    };

    socket.on("room-update", handleRoomUpdate);
    socket.on("vote-update", handleVoteUpdate);
    socket.on("reveal", handleReveal);
    socket.on("reset", handleReset);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("vote-update", handleVoteUpdate);
      socket.off("reveal", handleReveal);
      socket.off("reset", handleReset);
    };
  }, []);

  const calculateAverage = (votes) => {
    const numericVotes = Object.values(votes)
      .filter((v) => !isNaN(v) && v !== "?" && v !== "∞")
      .map(Number);
    if (numericVotes.length > 0) {
      const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
      setAverage(avg.toFixed(2));
    } else {
      setAverage("N/A");
    }
  };

  const createRoom = () => {
  if (!inputUsername || !roomName) return;
  const newRoomId = `room-${Math.random().toString(36).substr(2, 8)}`;
  setRoomId(newRoomId);
  setSearchParams({ room: newRoomId });
  setRole("scrumMaster");
  setUsername(inputUsername);
  setJoined(true);
  localStorage.setItem("role", "scrumMaster");
  localStorage.setItem("username", inputUsername);
  localStorage.setItem("roomName", roomName);
  socket.emit("join-room", { room: newRoomId, username: inputUsername, role: "scrumMaster" });
};


  const joinRoom = () => {
    if (!inputUsername) return;
    setUsername(inputUsername);
    setRole("Participant");
    setJoined(true);
    localStorage.setItem("username", inputUsername);
    localStorage.setItem("role", "Participant");
    socket.emit("join-room", { room: roomId, username: inputUsername, role: "Participant" });
  };

  const castVote = (vote) => {
    setSelectedVote(vote);
    setVotes((prev) => ({ ...prev, [username]: vote }));
    socket.emit("vote", { room: roomId, vote, username });
  };

  const revealVotes = () => {
    if (Object.keys(votes).length === users.length) {
      socket.emit("reveal-votes", roomId);
    } else {
      alert("All users must vote before revealing.");
    }
  };

  const resetVotes = () => {
    socket.emit("reset-votes", roomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 text-gray-800 p-6">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-white shadow rounded-lg">
        <div className="font-extrabold text-xl text-blue-700">Planning Poker Game</div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">{username}</div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="border border-blue-500 text-blue-600 hover:bg-blue-100 rounded px-3 py-1"
          >
            Invite players
          </button>
          {copied && (
            <span className="text-green-600 font-semibold animate-pulse">✅ Link Copied!</span>
          )}
        </div>
      </div>

      {!joined ? (
        <div className="max-w-md mx-auto mt-16 space-y-6 bg-white shadow-lg rounded-lg p-6">
          {!roomId ? (
            <>
              <input
                className="p-3 border border-gray-300 rounded w-full"
                placeholder="Enter Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <button
                className="mt-4 w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={createRoom}
              >
                Create New Room
              </button>
            </>
          ) : (
            <>
              <input
                className="p-3 border border-gray-300 rounded w-full"
                placeholder="Enter Name"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
              />
              <button
                className="mt-4 w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={joinRoom}
                disabled={!inputUsername}
              >
                Join Room
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center mt-10">
          {users.length === 1 && (
            <div className="mb-6 text-blue-500 text-center text-lg">
              Feeling lonely? 🥱<br />
              <button
                className="underline text-blue-700"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                Invite players
              </button>
            </div>
          )}

          <div className="relative w-[400px] h-[400px] border-4 border-gray-300 rounded-full flex items-center justify-center bg-white shadow-lg">
            <div className="absolute w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl text-gray-600">
              Table
            </div>
            <UserCircle users={users} votes={votes} revealed={revealed} />
          </div>

          <div className="mt-12">
            <VoteButtons castVote={castVote} selectedVote={selectedVote} />

            {role === "scrumMaster" && (
              <div className="flex flex-col items-center mt-6 space-y-4">
                <button
                  className="p-3 bg-green-700 text-black font-bold rounded hover:bg-green-800"
                  onClick={revealVotes}
                >
                  Reveal Votes
                </button>
                <button
                  className="p-3 bg-red-600 text-black font-bold rounded hover:bg-red-700"
                  onClick={resetVotes}
                >
                  Reset Votes
                </button>
              </div>
            )}

            {revealed && average !== null && (
              <div className="mt-6 text-2xl font-bold text-purple-700">
                Average Vote: {average}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
