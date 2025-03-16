export interface Contest {
  id: string;
  name: string;
  platform: 'codeforces' | 'codechef' | 'leetcode';
  startTime: string;
  endTime: string;
  url: string;
  status: 'upcoming' | 'ongoing' | 'past';
  solutionUrl?: string;
  isBookmarked?: boolean;
}

export interface ContestFilters {
  platforms: {
    codeforces: boolean;
    codechef: boolean;
    leetcode: boolean;
  };
  status: 'all' | 'upcoming' | 'ongoing' | 'past';
}