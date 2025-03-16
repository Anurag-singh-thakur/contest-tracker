import React, { useState } from 'react';
import { useContestStore } from '../store/useContestStore';
import { Search, Youtube } from 'lucide-react';

export default function AdminPanel() {
  const { contests, setSolutionUrl } = useContestStore();
  const [search, setSearch] = useState('');
  const [selectedContest, setSelectedContest] = useState<string | null>(null);
  const [solutionUrl, setSolutionInput] = useState('');
  
  const pastContests = contests.filter(contest => 
    contest.status === 'past' &&
    contest.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContest && solutionUrl) {
      setSolutionUrl(selectedContest, solutionUrl);
      setSelectedContest(null);
      setSolutionInput('');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-200">Admin Panel</h1>
      
      <div className="bg-amber-50 dark:bg-amber-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-amber-800 dark:text-amber-200">
          Manage Contest Solutions
        </h2>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-amber-300 dark:border-amber-700 rounded-lg dark:bg-amber-800 text-amber-800 dark:text-amber-200 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-amber-700 dark:text-amber-300">Select Contest</label>
            <select
              value={selectedContest || ''}
              onChange={(e) => setSelectedContest(e.target.value)}
              className="w-full p-2 border border-amber-300 dark:border-amber-700 rounded-lg dark:bg-amber-800 text-amber-800 dark:text-amber-200 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Choose a contest...</option>
              {pastContests.map(contest => (
                <option key={contest.id} value={contest.id}>
                  {contest.name} ({contest.platform})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-amber-700 dark:text-amber-300">Solution URL</label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
              <input
                type="url"
                placeholder="YouTube video URL"
                value={solutionUrl}
                onChange={(e) => setSolutionInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-amber-300 dark:border-amber-700 rounded-lg dark:bg-amber-800 text-amber-800 dark:text-amber-200 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!selectedContest || !solutionUrl}
            className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-amber-950 py-2 px-4 rounded-lg disabled:opacity-50"
          >
            Add Solution
          </button>
        </form>
      </div>
    </div>
  );
}