import React from "react";
import { motion } from "framer-motion";

const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-purple-500"];

const UserCard = ({ username, vote, revealed, index }) => {
  return (
    <motion.div
      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl ${colors[index % colors.length]} transform perspective-800`}
      animate={{ rotateY: revealed ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="font-semibold text-sm">{username}</div>
      <div className="text-xl font-bold mt-1">
        {revealed ? vote : "🃏"}
      </div>
    </motion.div>
  );
};

export default UserCard;
