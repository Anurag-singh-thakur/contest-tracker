import axios from 'axios';
import { Contest } from '../types/contest';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';


const PLAYLIST_IDS = {
  leetcode: 'PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr',
  codeforces: 'PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB',
  codechef: 'PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr'
};

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

export async function fetchSolutions(contests: Contest[]) {
  try {
    const solutions = await Promise.all(
      Object.entries(PLAYLIST_IDS).map(async ([platform, playlistId]) => {
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

    return solutions.flat().filter(solution => solution.contestId);
  } catch (error) {
    console.error('Error fetching YouTube solutions:', error);
    return [];
  }
}

function matchContestFromTitle(contests: Contest[], platform: string, videoTitle: string): string | null {
  const platformContests = contests.filter(contest => contest.platform === platform);
  
  for (const contest of platformContests) {
    // Remove common words and convert to lowercase for matching
    const normalizedTitle = videoTitle.toLowerCase().replace(/solution|editorial|explanation/g, '');
    const normalizedContestName = contest.name.toLowerCase();
    
    if (normalizedTitle.includes(normalizedContestName)) {
      return contest.id;
    }
  }
  
  return null;
}