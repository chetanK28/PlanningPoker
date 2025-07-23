const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let rooms = {}; // { roomId: { users: {}, votes: {}, usernames: {} } }

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // --- Handle user joining a room ---
  socket.on("join-room", ({ room, username, role }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = { users: {}, votes: {}, usernames: {} };
    }

    rooms[room].users[socket.id] = { username, role };
    rooms[room].usernames[socket.id] = username;

    console.log(`📌 ${username} joined room ${room} as ${role}`);
    io.to(room).emit("room-update", rooms[room]);
  });

  // --- Handle voting ---
  socket.on("vote", ({ room, vote, username }) => {
    if (rooms[room]) {
      rooms[room].votes[username] = vote;
      console.log(`🗳️ ${username} voted in room ${room}: ${vote}`);
      io.to(room).emit("vote-update", rooms[room].votes);
    }
  });

  // --- Reveal all votes ---
  socket.on("reveal-votes", (room) => {
    if (rooms[room]) {
      console.log(`🎯 Revealing votes in room ${room}`);
      io.to(room).emit("reveal", rooms[room].votes);
    }
  });

  // --- Reset all votes ---
  socket.on("reset-votes", (room) => {
    if (rooms[room]) {
      rooms[room].votes = {};
      io.to(room).emit("vote-update", {}); // Clear UI
      io.to(room).emit("reset"); // Trigger local state reset
      console.log(`♻️ Votes reset in room ${room}`);
    }
  });

  // --- Handle user disconnect ---
  socket.on("disconnect", () => {
    for (const room in rooms) {
      const username = rooms[room].usernames[socket.id];

      if (username) {
        delete rooms[room].users[socket.id];
        delete rooms[room].usernames[socket.id];
        delete rooms[room].votes[username];

        console.log(`❌ ${username} left room ${room}`);
        io.to(room).emit("room-update", rooms[room]);

        // Auto-clean room if no users left
        if (
          Object.keys(rooms[room].users).length === 0 &&
          Object.keys(rooms[room].votes).length === 0
        ) {
          delete rooms[room];
          console.log(`🧹 Room ${room} deleted (empty)`);
        }
      }
    }

    console.log("🔌 User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
