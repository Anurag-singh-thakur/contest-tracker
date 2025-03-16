import { create } from 'zustand';
import { Contest, ContestFilters } from '../types/contest';
import { fetchSolutions } from '../services/youtube';

interface ContestStore {
  contests: Contest[];
  filters: ContestFilters;
  bookmarks: string[];
  setContests: (contests: Contest[]) => void;
  toggleBookmark: (contestId: string) => void;
  updateFilters: (filters: Partial<ContestFilters>) => void;
  setSolutionUrl: (contestId: string, url: string) => void;
  fetchYoutubeSolutions: () => Promise<void>;
}

export const useContestStore = create<ContestStore>((set, get) => ({
  contests: [],
  bookmarks: [],
  filters: {
    platforms: {
      codeforces: true,
      codechef: true,
      leetcode: true,
    },
    status: 'all',
  },
  setContests: (contests) => set({ contests }),
  toggleBookmark: (contestId) =>
    set((state) => ({
      bookmarks: state.bookmarks.includes(contestId)
        ? state.bookmarks.filter((id) => id !== contestId)
        : [...state.bookmarks, contestId],
    })),
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setSolutionUrl: (contestId, url) =>
    set((state) => ({
      contests: state.contests.map((contest) =>
        contest.id === contestId ? { ...contest, solutionUrl: url } : contest
      ),
    })),
  fetchYoutubeSolutions: async () => {
    const solutions = await fetchSolutions(get().contests);
    set((state) => ({
      contests: state.contests.map((contest) => {
        const solution = solutions.find((s) => s.contestId === contest.id);
        return solution ? { ...contest, solutionUrl: solution.videoUrl } : contest;
      }),
    }));
  },
}));