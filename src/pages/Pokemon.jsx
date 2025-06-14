import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PokemonCards from '../components/PokemonCards';
import Sidebar from '../components/Sidebar';
import HelpOverlay from '../HelpOverlay/HelpOverlayPokemonCards';

const Pokemon = () => {
  const [pokemon, setPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [types, setTypes] = useState([]);
  const [modalPokemon, setModalPokemon] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  });

  const { id } = useParams();

  const fetchAllPokemon = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const data = await res.json();
      const details = await Promise.all(
        data.results.map(p => fetch(p.url).then(r => r.json()))
      );
      setPokemon(details);
    } catch (error) {
      console.error("Error fetching Pokémon:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch('https://pokeapi.co/api/v2/type');
      const data = await res.json();
      setTypes(data.results.map(t => t.name));
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const fetchPokemonByType = async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      const data = await res.json();
      const details = await Promise.all(
        data.pokemon.map(p => fetch(p.pokemon.url).then(r => r.json()))
      );
      setFilteredPokemon(details);
    } catch (error) {
      console.error("Error filtering by type:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (pokemonObj) => {
    let updatedFavorites;
    const current = JSON.parse(localStorage.getItem("favorites")) || [];
    const isAlreadyFav = current.find((p) => p.id === pokemonObj.id);

    if (isAlreadyFav) {
      updatedFavorites = current.filter((p) => p.id !== pokemonObj.id);
    } else {
      updatedFavorites = [...current, {
        id: pokemonObj.id,
        name: pokemonObj.name,
        sprite: pokemonObj.sprites.front_default,
      }];
    }

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites.map(p => p.id));
  };

  const handleCardClick = (p) => {
    const index = finalList.findIndex(item => item.id === p.id);
    setModalPokemon(p);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setModalPokemon(null);
    setCurrentIndex(null);
  };

  const showNext = () => {
    if (currentIndex < finalList.length - 1) {
      const nextIndex = currentIndex + 1;
      setModalPokemon(finalList[nextIndex]);
      setCurrentIndex(nextIndex);
    }
  };

  const showPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setModalPokemon(finalList[prevIndex]);
      setCurrentIndex(prevIndex);
    }
  };

  useEffect(() => {
    if (!id && pokemon.length === 0) {
      fetchAllPokemon();
      fetchTypes();
    }
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchPokemonByType(selectedType);
    }
  }, [selectedType]);

  const filteredList = selectedType ? filteredPokemon : pokemon;

  const finalList = search
    ? filteredList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : filteredList;

  return (
    <div className="flex bg-gray-100 min-h-screen dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-6 pt-20 md:pt-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">
          Catch Pokémon
        </h1>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pokémon..."
            className="px-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading Pokémon...</p>
            </div>
          </div>
        ) : (
          <ul className={`grid ${modalPokemon ? 'justify-center' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
            {finalList.map(p => (
              <li key={p.id} onClick={() => handleCardClick(p)}>
                <PokemonCards
                  pokemonData={p}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={() => toggleFavorite(p)}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Modal with navigation */}
        {modalPokemon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-600 dark:text-white text-2xl font-bold"
              >
                ×
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={showPrevious}
                  disabled={currentIndex === 0}
                  className="text-3xl text-gray-600 dark:text-white px-2 disabled:opacity-30"
                >
                  ←
                </button>

                <img
                  src={modalPokemon.sprites?.other?.['official-artwork']?.front_default}
                  alt={modalPokemon.name}
                  className="w-64 h-auto mx-auto"
                  loading="lazy"
                />

                <button
                  onClick={showNext}
                  disabled={currentIndex === finalList.length - 1}
                  className="text-3xl text-gray-600 dark:text-white px-2 disabled:opacity-30"
                >
                  →
                </button>
              </div>

              <h2 className="text-xl font-semibold mt-4 capitalize text-gray-800 dark:text-white">
                {modalPokemon.name}
              </h2>
            </div>
          </div>
        )}
      </main>

      <HelpOverlay />
    </div>
  );
};

export default Pokemon;
