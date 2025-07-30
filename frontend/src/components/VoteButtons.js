import React from "react";
import { motion } from "framer-motion";
 
const availableVotes = ["1", "2", "3", "5", "8", "13"];
 
const VoteButtons = ({ selectedVote, castVote }) => {
  return (
<div className="w-full flex flex-col items-center gap-6 mt-6">
<div className="grid grid-cols-6 gap-4">
        {availableVotes.map((num) => (
<motion.button
            key={num}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => castVote(num)}
            aria-label={`Vote ${num}`}
            className={`px-6 py-4 rounded text-xl font-semibold shadow transition-all duration-200 ${
              selectedVote === num
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
>
            {num}
</motion.button>
        ))}
</div>
</div>
  );
};
 
export default VoteButtons;