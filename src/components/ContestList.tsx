import  { useEffect } from 'react';
import { useContestStore } from '../store/useContestStore';
import { fetchContests, fetchSolutions } from '../services/api';
import ContestFilters from './ContestFilters';
import ContestCard from './ContestCard';

export default function ContestList() {
  const { contests, setContests, filters } = useContestStore();

  useEffect(() => {
    const loadContests = async () => {
     
      const fetchedContests = await fetchContests();
      
      setContests(fetchedContests);

      const solutions = await fetchSolutions(fetchedContests);
 
      const updatedContests = fetchedContests.map(contest => {
        const solution = solutions.find(sol => sol.contestId === contest.id);
        return solution ? { ...contest, solutionUrl: solution.videoUrl } : contest;
      });

      
      setContests(updatedContests);
    };

    loadContests();
    // Refresh contests every 5 minutes
    const interval = setInterval(loadContests, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setContests]);

  const filteredContests = contests.filter(contest => {
    const platformMatch = filters.platforms[contest.platform];
    const statusMatch = filters.status === 'all' || contest.status === filters.status;
    return platformMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-mono text-amber-800 dark:text-amber-200">
        Programming Contests
      </h1>
      <ContestFilters />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContests.map(contest => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  );
}
