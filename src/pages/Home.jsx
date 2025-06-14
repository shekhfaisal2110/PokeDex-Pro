import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const navItems = [
     { path: '/pokemon', icon: '📋', label: 'All Pokémon' },
    { path: '/RandomPokemon', icon: '🔁', label: 'Random Pokémon' },
    { path: '/favorites', icon: '⭐', label: 'Favorites' },
    { path: '/PokemonCardGame', icon: '🃏', label: 'Card Battle Game' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <h1 className="text-4xl font-bold mb-10 text-gray-800 dark:text-white text-center">
        🎮 Welcome to <span className="text-blue-600">PokeDexPro</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {navItems.map(({ path, icon, label }) => (
          <div
            key={path}
            onClick={() => navigate(path)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 cursor-pointer text-center transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
          >
            <div className="text-4xl">{icon}</div>
            <div className="mt-4 text-lg font-semibold text-gray-700 dark:text-white">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
