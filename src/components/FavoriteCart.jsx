import React from 'react';

const FavoriteCart = ({ favorites, onRemove, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 shadow-lg overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-gray-600 dark:text-white font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white text-center">⭐ Favorites</h2>

        {favorites.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No favorites yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {favorites.map(p => (
              <li key={p.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <img src={p.sprite} alt={p.name} className="w-14 h-14 object-contain" />
                  <span className="capitalize font-semibold text-gray-800 dark:text-white">{p.name}</span>
                </div>
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FavoriteCart;
