import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RandomPokemon from './pages/RandomPokemon';
import FavoritesPage from './pages/Favorites';
import Pokemon from './pages/Pokemon';
import Home from './pages/Home'; // Import this new file
import PokemonCardGame from './pages/PokemonCardGame';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/PokemonCardGame" element={<PokemonCardGame />} />
        <Route path="/RandomPokemon" element={<RandomPokemon />} />
        <Route path="/pokemon" element={<Pokemon />} />
        <Route path="/pokemon/:id" element={<Pokemon />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
