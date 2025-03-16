import axios from 'axios';
import { Contest } from '../types/contest';

// API endpoints for contests
const CODEFORCES_API = 'https://codeforces.com/api/contest.list';
const CODECHEF_API = '/api/codechef/api/list/contests/all';
const LEETCODE_API = '/api/leetcode/graphql';

// YouTube API configuration
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

// Define your playlists for different platforms
const PLAYLIST_IDS: { [key in 'leetcode' | 'codeforces' | 'codechef']?: string } = {
  leetcode: 'PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr',
  codeforces: 'PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB',
  codechef: 'PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr'
};

// Interface for YouTube API response
interface YouTubeResponse {
  items: Array<{
    snippet: {
      title: string;
      resourceId: {
        videoId: string;
      };
    };
  }>;
}

// Exported function to fetch contests from all sources
export async function fetchContests(): Promise<Contest[]> {
  try {
    const [codeforcesContests, codechefContests, leetcodeContests] = await Promise.all([
      fetchCodeforcesContests(),
      fetchCodechefContests(),
      fetchLeetcodeContests()
    ]);
    return [...codeforcesContests, ...codechefContests, ...leetcodeContests];
  } catch (error) {
    console.error('Error fetching contests:', error);
    return [];
  }
}

async function fetchCodeforcesContests(): Promise<Contest[]> {
  try {
    const response = await axios.get(CODEFORCES_API);
    return response.data.result.map((contest: any) => ({
      id: `cf-${contest.id}`,
      name: contest.name,
      platform: 'codeforces',
      startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
      endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000).toISOString(),
      url: `https://codeforces.com/contest/${contest.id}`,
      status: getContestStatus(
        contest.startTimeSeconds * 1000,
        (contest.startTimeSeconds + contest.durationSeconds) * 1000
      )
    }));
  } catch (error: any) {
    handleError(error, 'Codeforces');
    return [];
  }
}

async function fetchCodechefContests(): Promise<Contest[]> {
  try {
    const response = await axios.get(CODECHEF_API);
    const contests = [
      ...(response.data.future_contests || []),
      ...(response.data.present_contests || []),
      ...(response.data.past_contests || [])
    ];

    return contests
  
      .filter((contest: any) => {
        const isValid = contest?.contest_code && contest?.contest_start_date && contest?.contest_end_date;
        if (!isValid) console.warn('Invalid Codechef contest structure', contest);
        return isValid;
      })
      .map((contest: any) => {
        
        const startDate = contest.contest_start_date_iso
          ? new Date(contest.contest_start_date_iso)
          : new Date(contest.contest_start_date);
        const endDate = new Date(contest.contest_end_date);
        
        if (isNaN(startDate.getTime())) {
          console.warn(`Invalid start date for Codechef contest ${contest.contest_code}`);
          return null;
        }
        if (isNaN(endDate.getTime())) {
          console.warn(`Invalid end date for Codechef contest ${contest.contest_code}`);
          return null;
        }

        return {
          id: `cc-${contest.contest_code}`,
          name: contest.contest_name,
          platform: 'codechef',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          url: `https://www.codechef.com/${contest.contest_code}`,
          status: getContestStatus(startDate.getTime(), endDate.getTime())
        };
      })
     
      .filter((contest: Contest | null): contest is Contest => contest !== null);
  } catch (error: any) {
    handleError(error, 'Codechef');
    return [];
  }
}

async function fetchLeetcodeContests(): Promise<Contest[]> {
  const query = `
    query {
      allContests {
        title
        titleSlug
        startTime
        duration
      }
    }
  `;
  try {
    const response = await axios.post(LEETCODE_API, { query });
    return response.data.data.allContests
      .filter((contest: any) => contest.titleSlug && contest.startTime && contest.duration)
      .map((contest: any) => {
        const startTime = Number(contest.startTime) * 1000;
        const duration = Number(contest.duration) * 1000;
        const endTime = startTime + duration;

        if (isNaN(startTime) || isNaN(endTime)) {
          console.warn(`Invalid timestamps for Leetcode contest ${contest.titleSlug}`);
          return null;
        }

        return {
          id: `lc-${contest.titleSlug}`,
          name: contest.title,
          platform: 'leetcode',
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          url: `https://leetcode.com/contest/${contest.titleSlug}`,
          status: getContestStatus(startTime, endTime)
        };
      })
      .filter((contest: Contest | null): contest is Contest => contest !== null);
  } catch (error: any) {
    handleError(error, 'Leetcode');
    return [];
  }
}

export async function fetchSolutions(
  contests: Contest[]
): Promise<{ contestId: string; videoUrl: string; title: string }[]> {
  try {
    const solutions = await Promise.all(
      Object.entries(PLAYLIST_IDS).map(async ([platform, playlistId]) => {
        // If a playlistId isn't defined for a platform, skip it
        if (!playlistId) return [];
        const response = await axios.get<YouTubeResponse>(YOUTUBE_API_URL, {
          params: {
            key: API_KEY,
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50
          }
        });

        return response.data.items.map(item => ({
          contestId: matchContestFromTitle(contests, platform, item.snippet.title),
          videoUrl: `https://youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
          title: item.snippet.title
        }));
      })
    );
    // Flatten the array and filter out solutions that didn't match any contest
    return solutions.flat().filter(solution => solution.contestId !== null);
  } catch (error) {
    console.error('Error fetching YouTube solutions:', error);
    return [];
  }
}


function getContestStatus(startTime: number, endTime: number): 'upcoming' | 'ongoing' | 'past' {
  const now = Date.now();
  if (isNaN(startTime)) return 'past';
  if (isNaN(endTime)) return 'past';
  
  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'past';
  return 'ongoing';
}

function handleError(error: any, platform: string): void {
  if (!error.response) {
    console.error(`Network error when fetching ${platform} contests:`, error);
  } else {
    console.error(
      `Error fetching ${platform} contests:`,
      error.response.status,
      error.response.data
    );
  }
}


function normalizeString(str: string): string {

  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') 
    .replace(/solutions?/gi, '')
    .replace(/editorial/gi, '')
    .replace(/explanation/gi, '')
    .replace(/video/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchContestFromTitle(contests: Contest[], platform: string, videoTitle: string): string | null {
  // Filter contests for the given platform
  const platformContests = contests.filter(contest => contest.platform === platform);
  // Normalize the video title for comparison
  const normVideo = normalizeString(videoTitle);

  for (const contest of platformContests) {
   
    const normContest = normalizeString(contest.name);

 
    if (normVideo.includes(normContest) || normContest.includes(normVideo)) {
      return contest.id;
    }

    
    if (platform === 'codechef') {
      const numberMatch = contest.name.match(/\d+/);
      if (numberMatch) {
        const contestNumber = numberMatch[0];
        if (normVideo.includes(contestNumber)) {
          return contest.id;
        }
      }
    }
  }

  return null;
}
