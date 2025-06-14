import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [modalPokemon, setModalPokemon] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(stored);
  }, []);

  const removeFavorite = (id) => {
    const updated = favorites.filter(p => p.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavorites(updated);
  };

  const handleCardClick = async (p) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
      const data = await res.json();
      setModalPokemon(data);
    } catch (error) {
      console.error("Error fetching Pokémon details:", error);
    }
  };

  const closeModal = () => {
    setModalPokemon(null);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-6 pt-20 md:pt-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          ⭐ Your Favorite Pokémon
        </h2>

        {favorites.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No favorites yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((p) => (
              <li
                key={p.id}
                onClick={() => handleCardClick(p)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center text-center cursor-pointer"
              >
                <img
                  src={p.sprite}
                  alt={p.name}
                  className="w-24 h-24 object-contain hover:scale-105 transition"
                />
                <h3 className="capitalize text-lg font-semibold mt-3 text-gray-800 dark:text-white">
                  {p.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(p.id);
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Pokémon Details Modal */}
      {modalPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 dark:text-white text-2xl font-bold"
            >
              ×
            </button>
            <img
              src={modalPokemon.sprites.other['official-artwork'].front_default}
              alt={modalPokemon.name}
              className="w-full h-auto"
            />
            <h2 className="text-center text-xl font-semibold mt-4 capitalize text-gray-800 dark:text-white">
              {modalPokemon.name}
            </h2>
          </div>
        </div>
      )}

      {/* Help Floating Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
        title="Help for Favorites Page"
      >
        ?
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <button
              onClick={() => setShowHelp(false)}
              className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 text-white text-2xl rounded-full shadow-lg hover:bg-indigo-700 transition z-50"
        title="Help"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Help - Favorites Page</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>This page displays all Pokémon you have added to your favorites list.</li>
              <li>Clicking on a Pokémon opens a detailed popup with its official artwork and name.</li>
              <li>You can remove a Pokémon from your favorites by clicking the <strong>Remove</strong> button.</li>
              <li>Favorites are stored in your browser’s <strong>localStorage</strong> for persistence.</li>
              <li>The favorites remain saved even if you refresh or close your browser.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
