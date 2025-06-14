import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import Sidebar from "../components/Sidebar";

const getRandomId = () => Math.floor(Math.random() * 150) + 1;

const fetchPokemon = async (id) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    attack: data.stats[1].base_stat,
    image: data.sprites.other.dream_world.front_default,
  };
};

const getStoredMatchHistory = () => {
  const data = localStorage.getItem("matchHistory");
  return data ? JSON.parse(data) : [];
};

const storeMatchResult = (result) => {
  const history = getStoredMatchHistory();
  const updated = [...history, result];
  localStorage.setItem("matchHistory", JSON.stringify(updated));
};

const PokemonCardGame = () => {
  const [round, setRound] = useState(1);
  const [userOptions, setUserOptions] = useState([]);
  const [computerPokemon, setComputerPokemon] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [history, setHistory] = useState([]);
  const [finalResult, setFinalResult] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [matchHistory, setMatchHistory] = useState(getStoredMatchHistory());
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!localStorage.getItem("username"));
const [musicPlaying, setMusicPlaying] = useState(false);



const [wins, setWins] = useState(0);
const [losses, setLosses] = useState(0);
const [draws, setDraws] = useState(0);
const [totalGames, setTotalGames] = useState(0);



  const winAudio = new Audio("/win.wav");
  const loseAudio = new Audio("/lose.wav");
  const bgAudio = new Audio("/bg-music.mp3");
  const defaultMusic = "/bg-music.mp3";

  const bgAudioRef = useRef(null);

  useEffect(() => {
    const storedMusic = localStorage.getItem("preferredMusic") || defaultMusic;
    const audio = new Audio(storedMusic);
    audio.loop = true;
    audio.volume = 0.2;
    bgAudioRef.current = audio;

    if (username) {
      loadNewRound(); // Call your game logic
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [username]);

  const toggleMusic = () => {
    const audio = bgAudioRef.current;
    if (!audio) return;

    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().then(() => setMusicPlaying(true));
    }
  };

  const setFavoriteMusic = (musicUrl) => {
    localStorage.setItem("preferredMusic", musicUrl);
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
    }
    const newAudio = new Audio(musicUrl);
    newAudio.loop = true;
    newAudio.volume = 0.2;
    bgAudioRef.current = newAudio;
    newAudio.play().then(() => setMusicPlaying(true));
  };


  bgAudio.loop = true;
bgAudio.volume = 0.2; // Optional: keep it subtle
winAudio.volume = 1;
loseAudio.volume = 1;

  const matchesPerPage = 5;
  const paginatedHistory = matchHistory.slice().reverse().slice(
    (currentPage - 1) * matchesPerPage,
    currentPage * matchesPerPage
  );

  const postMatchResult = async (username, result) => {
    try {
      // await fetch("http://localhost:5000/api/match", {
      await fetch("https://pokedexpro-backend.onrender.com/api/match",{
      method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, result }),
      });
    } catch (error) {
      console.error("Failed to post match result:", error);
    }
  };

  const computeLeaderboard = async () => {
    try {
      // const res = await fetch("http://localhost:5000/api/leaderboard");
      const res= await fetch("https://pokedexpro-backend.onrender.com/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  useEffect(() => {
    computeLeaderboard();
  }, [matchHistory]);

  useEffect(() => {
  if (username) {
    loadNewRound();
    bgAudio.play().catch(() => {});
  }
}, [username]);

  const loadNewRound = async () => {
    const ids = [getRandomId(), getRandomId(), getRandomId()];
    const pokemons = await Promise.all(ids.map(fetchPokemon));
    setUserOptions(pokemons);
    setSelectedPokemon(null);
    setComputerPokemon(null);
  };

  const handleSelect = async (poke) => {
    const computer = await fetchPokemon(getRandomId());
    setComputerPokemon(computer);
    setSelectedPokemon(poke);

    let result = "";
    if (poke.attack > computer.attack) {
      result = "User Wins";
    } else if (poke.attack < computer.attack) {
      result = "Computer Wins";
    } else {
      result = "Draw";
    }

    const roundResult = {
      round,
      user: poke,
      computer,
      result,
    };

    const updatedHistory = [...history, roundResult];
    setHistory(updatedHistory);

    if (round === 3) {
      setGameOver(true);
      const userWins = updatedHistory.filter((h) => h.result === "User Wins").length;
      const computerWins = updatedHistory.filter((h) => h.result === "Computer Wins").length;

      let matchResult = "";
      if (userWins > computerWins) {
        matchResult = "🎉 You won the match!";
        winAudio.play();
        confetti();
        postMatchResult(username, "win");
      } else if (computerWins > userWins) {
        matchResult = "💻 Computer won the match!";
        
      loseAudio.play();
        postMatchResult(username, "lose");
      } else {
        matchResult = "🤝 Match Draw!";
        postMatchResult(username, "draw");
      }

      setFinalResult(matchResult);

      const gameData = {
        timestamp: new Date().toLocaleString(),
        result: matchResult,
        rounds: updatedHistory,
      };

      storeMatchResult(gameData);
      setMatchHistory((prev) => [...prev, gameData]);
    } else {
      setTimeout(() => {
        setRound((prev) => prev + 1);
        loadNewRound();
      }, 1500);
    }
  };
useEffect(() => {
  const savedHistory = JSON.parse(localStorage.getItem('matchHistory')) || [];
  const savedUsername = localStorage.getItem('username') || 'faisal';

  setMatchHistory(savedHistory);
  setUsername(savedUsername);

  const winCount = savedHistory.filter((m) => m.result.includes("won")).length;
  const lossCount = savedHistory.filter((m) => m.result.includes("lost")).length;
  const drawCount = savedHistory.filter((m) => m.result.includes("draw")).length;

  setWins(winCount);
  setLosses(lossCount);
  setDraws(drawCount);
  setTotalGames(savedHistory.length);
}, []);

  const restartGame = () => {
    setRound(1);
    setHistory([]);
    setFinalResult("");
    setGameOver(false);
    loadNewRound();
    stopAllAudio();
  };

  const stopAllAudio = () => {
  winAudio.pause();
  winAudio.currentTime = 0;
  loseAudio.pause();
  loseAudio.currentTime = 0;
  bgAudio.pause();
  bgAudio.currentTime = 0;
};


  const totalPages = Math.ceil(matchHistory.length / matchesPerPage);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("username", username.trim());
      setShowUsernamePrompt(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-rose-100 dark:from-gray-800 dark:to-gray-900">
      <Sidebar />
       
   

      {/* Username Prompt Modal */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <form
            onSubmit={handleUsernameSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-[90%] shadow-lg text-center"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Welcome Trainer!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enter your name to start the battle:</p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-700 dark:text-white mb-4"
              placeholder="Enter your name"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold"
            >
              Start Game
            </button>
          </form>
        </div>
      )}

      {!showUsernamePrompt && (
        <div className="p-6 text-center max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">⚔️ Pokémon Card Battle</h1>
          <h2 className="text-lg text-gray-600 dark:text-gray-300 mb-6">Welcome, {username}! Round {round} / 3</h2>

          {/* Include rest of game UI here */}
          {/* Keep your existing JSX for history, leaderboard, help modal, gameOver results, selection, etc. */} <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-rose-100 dark:from-gray-800 dark:to-gray-900">
      <Sidebar />
      <div className="p-6 text-center max-w-6xl mx-auto">

        {/* 🏆 Leaderboard Button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="fixed bottom-20 right-6 z-50 bg-yellow-500 text-white w-12 h-12 text-xl font-bold rounded-full shadow-lg hover:bg-yellow-600 transition"
          title="Leaderboard"
        >
          🏆
        </button>

        {/* 🏆 Leaderboard Modal */}
        {showLeaderboard && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-xl w-[90%] text-center relative">
      <button
        onClick={() => setShowLeaderboard(false)}
        className="absolute top-2 right-4 text-2xl text-gray-600 hover:text-red-500"
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🏆 Global Top 100 Winners</h2>

      <ul className="max-h-72 overflow-y-auto text-left space-y-2 text-sm scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-gray-800">

        {leaderboard.slice(0, 100).map((u, i) => {
          const isCurrentUser = u.username === username;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";

          return (
            <li
              key={i}
              className={`px-2 py-1 rounded transition-all ${
                isCurrentUser
                  ? "bg-yellow-200 dark:bg-yellow-600 font-bold hover:bg-yellow-300 dark:hover:bg-yellow-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <b>#{i + 1}</b> {medal} - {u.username} | Wins: {u.wins}, Losses: {u.losses}, Draws: {u.draws}, Games: {u.games}
            </li>
          );
        })}
      </ul>

      {/* Bottom fixed section for current user if not in top 100 */}
      {!leaderboard.slice(0, 100).some((u) => u.username === username) && (
        <div className="mt-4 border-t pt-3 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
          <h3 className="font-semibold text-blue-600 dark:text-blue-300 mb-1">📌 Your Stats</h3>
          {(() => {
            const userEntry = leaderboard.find((u) => u.username === username);
            const rank = leaderboard.findIndex((u) => u.username === username) + 1;
            if (userEntry) {
              return (
                <p>
                  <b>#{rank}</b> - {userEntry.username} | Wins: {userEntry.wins}, Losses: {userEntry.losses}, Draws: {userEntry.draws}, Games: {userEntry.games}
                </p>
              );
            } else {
              return <p className="italic text-gray-500">You're not ranked yet. Start playing to enter the board!</p>;
            }
          })()}
        </div>
      )}
    </div>
  </div>
)}


        {/* ... rest of your component (history, help modal, cards, results, etc.) */}
        <div className="p-6  text-center max-w-6xl mx-auto">
        

        <button
  onClick={() => setShowHistory(!showHistory)}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-4 mr-4"
>
  📜 {showHistory ? "Hide" : "Show"} History
</button>

<button
  onClick={toggleMusic}
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md mb-4"
>
  {musicPlaying ? "🔇 Pause Music" : "🎵 Play Music"}
</button>

        {showHistory && (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg z-50">
    <button
      onClick={() => setShowHistory(false)}
      className="absolute top-3 right-4 text-xl text-gray-500 hover:text-red-500"
    >
      ❌
    </button>

    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">🕹️ Past Matches</h3>

    {/* Stats Header */}
    <div className="text-sm text-gray-800 dark:text-gray-200 mb-4 text-center">
  <p>👤 Username: <strong>{username}</strong></p>
  <p>
    ✅ Wins: <strong>{wins}</strong> | ❌ Losses: <strong>{losses}</strong> | 🤝 Draws: <strong>{draws}</strong> | 🎮 Games: <strong>{totalGames}</strong>
  </p>

  {/* Share & Home */}
  <div className="flex justify-center flex-wrap gap-3 mt-3">
    <a
      href={`https://wa.me/?text=👤 ${username}'s Match Stats:%0A✅ Wins: ${wins}%0A❌ Losses: ${losses}%0A🤝 Draws: ${draws}%0A🎮 Total Games: ${totalGames}%0APlay now: ${window.location.origin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700"
    >
      📤 Share on WhatsApp
    </a>
    <a
      href="/"
      className="inline-block bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700"
    >
      🏠 Back to Home
    </a>
  </div>
</div>


    {/* Match List */}
    <ul className="max-h-60 overflow-y-auto text-left text-sm text-gray-700 dark:text-gray-300 space-y-2">
      {paginatedHistory.map((m, index) => (
        <li key={index}>
          <b>{m.timestamp}</b>: {m.result}
        </li>
      ))}
    </ul>

    {/* Pagination */}
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        className={`px-2 py-1 rounded-md ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
      >
        ⬅️
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-1 rounded-md ${currentPage === i + 1 ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        className={`px-2 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
      >
        ➡️
      </button>
    </div>
  </div>
)}


        {!gameOver && (
          <>
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Choose your Pokémon:</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {userOptions.map((poke) => (
                <div
                  key={poke.id}
                  onClick={() => handleSelect(poke)}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg w-40 shadow hover:scale-105 transition-transform cursor-pointer"
                >
                  <img src={poke.image} alt={poke.name} className="w-24 mx-auto" />
                  <p className="capitalize mt-2 font-semibold text-gray-800 dark:text-white">{poke.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">⚔️ {poke.attack}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedPokemon && computerPokemon && (
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Result:</h3>
            <div className="flex justify-center gap-8 flex-wrap">
              {[{ ...selectedPokemon, label: "You" }, { ...computerPokemon, label: "Computer" }].map((poke, i) => (
                <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow w-40">
                  <h4 className="font-bold text-gray-700 dark:text-white">{poke.label}</h4>
                  <img src={poke.image} className="w-24 mx-auto" alt={poke.name} />
                  <p className="capitalize font-semibold mt-2 text-gray-800 dark:text-white">{poke.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">⚔️ {poke.attack}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{finalResult}</h2>
            <h3 className="text-lg font-semibold mt-4 text-gray-800 dark:text-white">🕹️ Match History (This Game)</h3>
            <ul className="text-left mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {history.map((h) => (
                <li key={h.round}>
                  <strong>Round {h.round}:</strong> {h.user.name} (⚔️ {h.user.attack}) vs {h.computer.name} (⚔️ {h.computer.attack}) →{" "}
                  <b>{h.result}</b>
                </li>
              ))}
            </ul>
            <button
              onClick={restartGame}
              className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
            >
              🔄 Restart Game
            </button>
          </div>
        )}

        {/* Floating Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-12 h-12 text-xl font-bold rounded-full shadow-lg hover:bg-blue-700 transition"
          title="Help"
        >
          ?
        </button>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white max-w-xl w-[90%] p-6 rounded-lg shadow-lg relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-3 text-2xl text-gray-600 dark:text-white hover:text-red-500"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">🆘 Help - Pokémon Card Battle</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
  <li>Each match has <strong>3 rounds</strong>.</li>
  <li>Choose 1 of 3 Pokémon cards each round.</li>
  <li>Their attack is compared to the computer’s Pokémon.</li>
  <li>Win the round if your attack is higher.</li>
  <li>After 3 rounds, overall winner is declared.</li>
  <li>Your battle history is saved and viewable anytime using the 📜 <strong>Show History</strong> button.</li>
  <li>Use the 🎵 <strong>Play/Pause Music</strong> button to toggle background music.</li>
  <li>🏆 <strong>Leaderboard</strong> displays top 100 global players. If you're not in top 100, your rank still shows at the bottom!</li>
  <li>You can restart the game anytime after a match ends.</li>
  <li>📤 <strong>Share your match stats on WhatsApp</strong> directly from the History screen!</li>
</ol>

              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Enjoy your battle and good luck!
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
        </div>
      )}
    </div>
  );
};

export default PokemonCardGame;
