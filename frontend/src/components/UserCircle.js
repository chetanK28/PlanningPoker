import React from "react";
import UserCard from "./UserCard";

const UserCircle = ({ users, votes, revealed }) => {
  const radius = 120; // Circle radius in px
  const centerX = 160;
  const centerY = 160;

  return (
    <div className="relative w-80 h-80 flex items-center justify-center mt-8">
      {users.map((user, index) => {
        const angle = (2 * Math.PI * index) / users.length;
        const x = centerX + radius * Math.cos(angle) - 48; // 48 = half of card width
        const y = centerY + radius * Math.sin(angle) - 48; // 48 = half of card height

        return (
          <div
            key={user.username}
            className="absolute"
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
