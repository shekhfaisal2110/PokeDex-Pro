// components/HelpOverlay.jsx
import React, { useState } from 'react';

const HelpOverlay = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-md z-50"
        title="Help"
      >
        ❓
      </button>

      {/* Help Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-lg"
              title="Close"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-3">How this Page Works</h2>
            <ol className="list-decimal space-y-2 text-sm pl-4">
              <li><strong>Search Pokémon:</strong> Use the search box to find a Pokémon by name.</li>
              <li><strong>Filter by Type:</strong> Use the dropdown to filter Pokémon by their type (e.g., fire, water).</li>
              <li><strong>Favorite Pokémon:</strong> Click the ❤️ / 🤍 button to add or remove from your favorites. Favorites are stored in localStorage.</li>
              <li><strong>Click for Details:</strong> Clicking on a Pokémon card opens a modal with a larger image.</li>
              <li><strong>Dark Mode Support:</strong> The UI adapts based on your system's dark/light mode.</li>
              <li><strong>Responsive Layout:</strong> The layout adjusts for mobile, tablet, and desktop screens.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpOverlay;
