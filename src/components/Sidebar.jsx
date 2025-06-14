import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
   { path: '/pokemon', icon: '📋', label: 'All Pokémon' },
  { path: '/RandomPokemon', icon: '🔁', label: 'Random Pokémon' },
  { path: '/favorites', icon: '⭐', label: 'Favorites' },
  { path: '/PokemonCardGame', icon: '🃏', label: 'Card Battle Game' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Close sidebar on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Toggle button */}
      {!isOpen && (
        <button
          className="fixed top-4 right-4 z-50 text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-md shadow-md focus:outline-none transition duration-300"
          onClick={() => setIsOpen(true)}
        >
          ☰
        </button>
      )}

      {/* Optional Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Close Button */}
        <div className="flex justify-between items-center p-4 text-xl font-semibold border-b border-gray-700">
          <span>PokeDexPro</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-red-500 text-2xl"
          >
            ❌
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mt-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-blue-600 transition-colors duration-200"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
