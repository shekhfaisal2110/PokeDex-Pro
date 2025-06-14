import React, { useEffect, useState } from 'react';

const PokemonCards = ({ pokemonData }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!pokemonData) return;
    const stored = JSON.parse(localStorage.getItem('favorites')) || [];
    setIsFavorite(stored.some(p => p.id === pokemonData.id));
  }, [pokemonData?.id]);

  const toggleFavorite = (e) => {
    e.stopPropagation(); // Prevent modal from opening
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (isFavorite) {
      const updated = favorites.filter(p => p.id !== pokemonData.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      const newFavorite = {
        id: pokemonData.id,
        name: pokemonData.name,
        sprite: pokemonData.sprites?.other?.dream_world?.front_default || '',
      };
      const updated = [newFavorite, ...favorites.filter(p => p.id !== pokemonData.id)];
      try {
        localStorage.setItem('favorites', JSON.stringify(updated));
        setIsFavorite(true);
      } catch (e) {
        console.error("Storage limit exceeded!", e);
        alert("Storage full! Cannot add more favorites.");
      }
    }
  };

  // 🌟 Show loader if data is not ready
  if (!pokemonData) {
    return (
      <li className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 m-4 w-full sm:w-64 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
      </li>
    );
  }

  return (
    <li className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 m-4 w-full sm:w-64 transform hover:scale-105 transition-transform duration-300">
      {/* Favorite Icon Top Right */}
      <button
        onClick={toggleFavorite}
        className="absolute top-2 right-2 text-2xl"
        title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>

      <figure className="flex justify-center">
        <img
          src={pokemonData.sprites?.other?.dream_world?.front_default}
          alt={pokemonData.name}
          className="h-32 w-32 object-contain"
          loading="lazy"
        />
      </figure>
      <h1 className="text-xl font-bold text-gray-800 dark:text-white text-center capitalize mt-4">
        {pokemonData.name}
      </h1>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-1">
        {pokemonData.types.map(t => t.type.name).join(', ')}
      </p>
      <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
        <p><strong>Speed:</strong> {pokemonData.stats[5]?.base_stat}</p>
        <p><strong>Experience:</strong> {pokemonData.base_experience}</p>
      </div>

      <button
        onClick={toggleFavorite}
        className={`mt-4 w-full py-2 rounded-md text-white font-semibold transition duration-300 ${
          isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isFavorite ? 'Remove Favorite' : 'Add to Favorite'}
      </button>
    </li>
  );
};

export default PokemonCards;
