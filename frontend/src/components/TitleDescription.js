import React, { useState } from "react";
 
const TitleDescription = ({ role, title, description, onSubmit }) => {
  const [newTitle, setNewTitle] = useState(title);
  const [newDesc, setNewDesc] = useState(description);
 
  const handleSubmit = () => {
    if (newTitle && newDesc) {
      onSubmit(newTitle, newDesc);
    }
  };
 
  return (
    <div className="bg-white shadow p-4 rounded">
      {role === "scrumMaster" ? (
        <>
          <input
            type="text"
            placeholder="Enter Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full mb-2 p-2 border border-gray-300 rounded"
          />
          <textarea
            placeholder="Enter Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full mb-2 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
        </>
      ) : (
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-gray-700">{description}</p>
        </div>
      )}
    </div>
  );
};
 
export default TitleDescription;