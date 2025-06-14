import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Spinner = () => (
  <div className="flex justify-center my-5">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const HelpModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-700 dark:text-gray-300 text-xl"
      >
        ❌
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🆘 Page Guide</h2>
      <ol className="list-decimal space-y-2 text-gray-700 dark:text-gray-300 text-sm pl-5">
        <li>Click <strong>🎲 Catch Random Pokémon</strong> to fetch a random Pokémon.</li>
        <li>Heart icon (❤️/🤍) toggles the Pokémon as favorite.</li>
        <li>Each catch is stored in the history below for later reference.</li>
        <li>Use <strong>📜 Show/Hide History</strong> to toggle the history section.</li>
        <li>Use <strong>🗑️ Clear History</strong> to reset all stored Pokémon.</li>
        <li>Pagination lets you browse history in pages of 5 Pokémon.</li>
      </ol>
    </div>
  </div>
);

const RandomPokemon = () => {
  const [pokemon, setPokemon] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = history.slice(startIndex, startIndex + itemsPerPage);

  const getRandomPokemonId = () => Math.floor(Math.random() * 1025) + 1;

  const fetchRandomPokemon = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = getRandomPokemonId();
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      setPokemon(data);

      const updatedHistory = [data, ...history.filter((p) => p.id !== data.id)];
      setHistory(updatedHistory);
      localStorage.setItem('caughtHistory', JSON.stringify(updatedHistory));
      setCurrentPage(1);
    } catch {
      setError('Failed to fetch Pokémon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('caughtHistory');
    const fav = localStorage.getItem('favorites');
    if (cached) {
      const historyList = JSON.parse(cached);
      setHistory(historyList);
      setPokemon(historyList[0]);
    } else {
      fetchRandomPokemon();
    }
    if (fav) {
      setFavorites(JSON.parse(fav));
    }
    setLoading(false);
  }, []);

  const getStat = (statName) =>
    pokemon?.stats.find((s) => s.stat.name === statName)?.base_stat || 'N/A';

  const handleHistoryClick = (selected) => {
    setPokemon(selected);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const clearHistory = () => {
    localStorage.removeItem('caughtHistory');
    setHistory([]);
    setPokemon(null);
  };

  const isFavorite = (poke) => favorites.some(fav => fav.id === poke.id);

  const toggleFavorite = (poke) => {
    let updated;
    if (isFavorite(poke)) {
      updated = favorites.filter(fav => fav.id !== poke.id);
      toast.info(`${poke.name.toUpperCase()} removed from favorites ❌`);
    } else {
      updated = [poke, ...favorites.filter(fav => fav.id !== poke.id)];
      toast.success(`${poke.name.toUpperCase()} added to favorites ❤️`);
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const renderPagination = () => {
  const pages = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Always show the first page
    pages.push(1);

    // Add left ellipsis if currentPage is beyond 4
    if (currentPage > 4) pages.push('...');

    // Determine middle page range
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if current page is near the start
    if (currentPage <= 4) {
      start = 2;
      end = 4;
    }

    // Adjust if current page is near the end
    if (currentPage >= totalPages - 3) {
      start = totalPages - 3;
      end = totalPages - 1;
    }

    for (let i = start; i <= end; i++) pages.push(i);

    // Add right ellipsis if currentPage is before totalPages - 3
    if (currentPage < totalPages - 3) pages.push('...');

    // Always show the last page
    pages.push(totalPages);
  }

  return pages.map((p, i) =>
    p === '...' ? (
      <span key={`ellipsis-${i}`} className="px-2 text-gray-500">...</span>
    ) : (
      <button
        key={p}
        onClick={() => setCurrentPage(p)}
        className={`px-3 py-1 rounded-md transition ${
          currentPage === p
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {p}
      </button>
    )
  );
};


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-yellow-50 to-rose-100 dark:from-gray-800 dark:to-gray-900 relative">
      <Sidebar />
      <div className="w-full p-6 sm:p-10 font-sans text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
          🎯 Catch a Random Pokémon!
        </h1>

        <div className="space-x-3 mb-6">
          <button
            onClick={fetchRandomPokemon}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow transition"
          >
            🎲 Catch Random Pokémon
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow transition"
          >
            📜 {showHistory ? 'Hide' : 'Show'} History
          </button>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow transition"
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {loading && <Spinner />}
        {error && <p className="text-red-600 font-semibold">{error}</p>}

        {pokemon && !loading && (
          <div className="relative mx-auto bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 max-w-md">
            <button
              onClick={() => toggleFavorite(pokemon)}
              className="absolute top-3 right-3 text-2xl transition"
              title={isFavorite(pokemon) ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              {isFavorite(pokemon) ? '❤️' : '🤍'}
            </button>

            <h2 className="text-xl font-semibold capitalize mb-3 text-gray-800 dark:text-white">
              {pokemon.name}
            </h2>
            <img
              src={pokemon.sprites?.other['official-artwork'].front_default}
              alt={pokemon.name}
              className="mx-auto w-48 h-48 object-contain"
            />
            <p className="text-gray-600 dark:text-gray-300"><strong>Height:</strong> {pokemon.height}</p>
            <p className="text-gray-600 dark:text-gray-300"><strong>Weight:</strong> {pokemon.weight}</p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Type:</strong> {pokemon.types.map(t => t.type.name).join(', ')}
            </p>

            <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-white">⚔️ Stats</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-left mt-2 text-gray-600 dark:text-gray-300">
              <li>HP: {getStat('hp')}</li>
              <li>Attack: {getStat('attack')}</li>
              <li>Defense: {getStat('defense')}</li>
              <li>Sp. Attack: {getStat('special-attack')}</li>
              <li>Sp. Defense: {getStat('special-defense')}</li>
              <li>Speed: {getStat('speed')}</li>
            </ul>
          </div>
        )}

        {showHistory && history.length > 1 && (
          <div className="mt-10 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              🧾 Caught Pokémon History
            </h2>

            {currentItems.map((p, index) => (
              <div
                key={p.id + '_' + index}
                onClick={() => handleHistoryClick(p)}
                className="flex items-center gap-4 p-3 mb-3 border rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
              >
                <img
                  src={p.sprites?.front_default}
                  alt={p.name}
                  className="w-12 h-12"
                />
                <span className="capitalize font-medium text-gray-700 dark:text-white">
                  {p.name}
                </span>
              </div>
            ))}

            {history.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  ⬅️ Prev
                </button>

                {renderPagination()}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Next ➡️
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 text-white text-2xl rounded-full shadow-lg hover:bg-indigo-700 transition z-50"
        title="Help"
      >
        ?
      </button>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default RandomPokemon;