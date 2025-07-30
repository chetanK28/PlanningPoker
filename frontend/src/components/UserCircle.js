import React from "react";
import UserCard from "./UserCard";

const UserCircle = ({ users, votes, revealed }) => {
  const radius = 120;
  const centerX = 160;
  const centerY = 160;

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {users.map((user, index) => {
        const angle = (2 * Math.PI * index) / users.length;
        const x = centerX + radius * Math.cos(angle) - 48;
        const y = centerY + radius * Math.sin(angle) - 48;

        const hasVoted = votes[user.username] !== undefined;

        return (
          <div
            key={user.username}
            className={`absolute rounded-full p-1 transition-all duration-300 ${hasVoted ? "border-4 border-green-500" : "border-4 border-gray-300"
              }`}
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <UserCard
              username={user.username}
              vote={votes[user.username]}
              revealed={revealed}
              index={index}
              totalUsers={users.length}
            />
          </div>
        );
      })}
    </div>
  );
};

export default UserCircle;