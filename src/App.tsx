import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Navbar from './components/Navbar';
import ContestList from './components/ContestList';
import AdminPanel from './components/AdminPanel';
import { useTheme } from './hooks/useTheme';
import { fetchContests, fetchSolutions } from './services/api';
import { Contest } from './types/contest';

interface Solution {
  contestId: string;
  videoUrl: string;
  title: string;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [contests, setContests] = useState<Contest[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const contestData = await fetchContests();
      setContests(contestData);
      const solutionData = await fetchSolutions(contestData);
      setSolutions(solutionData);
      setLoading(false);
    }
    loadData();
  }, []);
  
  return (
    <Router>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-amber-950 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
        <Navbar>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-amber-700 dark:hover:bg-amber-400 text-amber-200 dark:text-amber-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </Navbar>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <ContestList
                  contests={contests}
                  solutions={solutions}
                  loading={loading}
                />
              }
            />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;