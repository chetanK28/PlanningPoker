import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useSearchParams, Link } from "react-router-dom";
import VoteButtons from "./components/VoteButtons";
import UserCircle from "./components/UserCircle";
import TitleDescription from "./components/TitleDescription";
 
const socket = io("http://10.77.161.113:3001");
 
const copyToClipboard = (text) => {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};
 
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [notification, setNotification] = useState("");
 
  useEffect(() => {
    if (roomId && username && role) {
      setJoined(true);
      socket.emit("join-room", { room: roomId, username, role });
    }
  }, [roomId, username, role]);
 
  useEffect(() => {
    socket.on("room-update", (data) => setUsers(Object.values(data.users)));
    socket.on("vote-update", (data) => setVotes(data));
    socket.on("reveal", (data) => {
      setVotes(data);
      setRevealed(true);
      calculateAverage(data);
    });
    socket.on("reset", () => {
      setVotes({});
      setRevealed(false);
      setAverage(null);
      setSelectedVote(null);
    });
    socket.on("title-description-updated", ({ title, description }) => {
      setTitle(title);
      setDescription(description);
    });
    socket.on("notification", (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(""), 4000);
    });
 
    return () => {
      socket.off("room-update");
      socket.off("vote-update");
      socket.off("reveal");
      socket.off("reset");
      socket.off("title-description-updated");
      socket.off("notification");
    };
  }, []);
 
  const calculateAverage = (votes) => {
    const numericVotes = Object.values(votes).filter((v) => !isNaN(v)).map(Number);
    if (numericVotes.length > 0) {
      const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
      setAverage(avg.toFixed(2));
    } else {
      setAverage("N/A");
    }
  };
 
  const handleTitleDescSubmit = (newTitle, newDesc) => {
    setTitle(newTitle);
    setDescription(newDesc);
    socket.emit("set-title-description", {
      room: roomId,
      title: newTitle,
      description: newDesc,
      username
    });
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 text-gray-800 p-6">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-white shadow rounded-lg">
        <Link to="/" className="font-extrabold text-xl text-blue-700">
          Planning Poker Game
        </Link>
 
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">{username}</div>
          <button
            onClick={() => {
              copyToClipboard(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="border border-blue-500 text-blue-600 hover:bg-blue-100 rounded px-3 py-1"
          >
            Invite players
          </button>
          <button
            onClick={() => setShowSidebar(true)}
            className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
          >
            Title & Desc
          </button>
          {copied && <span className="text-green-600 font-semibold animate-pulse">✅ Link Copied!</span>}
        </div>
      </div>
 
      {notification && (
        <div className="text-center mt-4 text-sm text-white bg-blue-500 py-2 px-4 rounded shadow">
          {notification}
        </div>
      )}
 
      {showSidebar && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg p-4 z-50 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Title & Description</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-red-500 font-bold text-xl"
            >
              &times;
            </button>
          </div>
          <TitleDescription
            role={role}
            title={title}
            description={description}
            onSubmit={handleTitleDescSubmit}
          />
        </div>
      )}
 
      {!joined && !roomId ? (
        <div className="max-w-md mx-auto mt-16 space-y-6 bg-white shadow-lg rounded-lg p-6">
          <input
            className="p-3 border border-gray-300 rounded w-full"
            placeholder="Enter Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <input
            className="mt-4 p-3 border border-gray-300 rounded w-full"
            placeholder="Enter Your Name"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
          />
          <button
            className="mt-4 w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => {
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
            }}
          >
            Create New Room
          </button>
        </div>
      ) : !joined ? (
        <div className="max-w-md mx-auto mt-16 space-y-6 bg-white shadow-lg rounded-lg p-6">
          <input
            className="p-3 border border-gray-300 rounded w-full"
            placeholder="Enter Your Name"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
          />
          <button
            className="mt-4 w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setUsername(inputUsername);
              setRole("Participant");
              setJoined(true);
              localStorage.setItem("username", inputUsername);
              localStorage.setItem("role", "Participant");
              socket.emit("join-room", { room: roomId, username: inputUsername, role: "Participant" });
            }}
            disabled={!inputUsername}
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-10">
          <div className="relative w-[400px] h-[400px] border-4 border-gray-300 rounded-full flex items-center justify-center bg-white shadow-lg">
            <div class="absolute w-32 h-32 bg-white-200 rounded-full flex items-center justify-center font-bold text-xl text-white-600">
              Table
            </div>
            <UserCircle users={users} votes={votes} revealed={revealed} />
            {revealed && average !== null && (
              <div className="absolute bottom-[-60px] w-full text-center text-2xl font-bold text-purple-700">
                Average Vote: {average}
              </div>
            )}
          </div>
 
          <div className="mt-12">
            <VoteButtons
              castVote={(vote) => {
                setSelectedVote(vote);
                setVotes((prev) => ({ ...prev, [username]: vote }));
                socket.emit("vote", { room: roomId, vote, username });
              }}
              selectedVote={selectedVote}
            />
 
            {role === "scrumMaster" && (
              <div className="flex flex-col items-center mt-6 space-y-4">
                <button
                  className="p-3 bg-green-700 text-black font-bold rounded hover:bg-green-800"
                  onClick={() => {
                    if (Object.keys(votes).length === users.length) {
                      socket.emit("reveal-votes", roomId);
                    } else {
                      alert("All users must vote before revealing.");
                    }
                  }}
                >
                  Reveal Votes
                </button>
                <button
                  className="p-3 bg-red-600 text-black font-bold rounded hover:bg-red-700"
                  onClick={() => socket.emit("reset-votes", roomId)}
                >
                  Reset Votes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
 
export default App;
 
 