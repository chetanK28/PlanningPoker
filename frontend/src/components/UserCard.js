import React from "react";
import { motion } from "framer-motion";

const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-purple-500"];

const UserCard = ({ username, vote, revealed, index }) => {
  return (
    <motion.div
      className={`w-24 h-24 rounded-full relative text-white shadow-xl ${colors[index % colors.length]}`}
      animate={{ rotateY: revealed ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
    >
      {/* Front Face */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center font-semibold text-sm"
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        <div>{username}</div>
        <div className="text-xl font-bold mt-1">🃏</div>
      </div>

      {/* Back Face */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center font-semibold text-sm"
        style={{
          transform: "rotateY(180deg)",
          backfaceVisibility: "hidden",
        }}
      >
        <div>{username}</div>
        <div className="text-xl font-bold mt-1">{vote}</div>
      </div>
    </motion.div>
  );
};

export default UserCard;
