import React from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, Youtube } from 'lucide-react';
import { Contest } from '../types/contest';
import { useContestStore } from '../store/useContestStore';
import { getTimeRemaining } from '../lib/utils';

interface ContestCardProps {
  contest: Contest;
}

export default function ContestCard({ contest }: ContestCardProps) {
  const { bookmarks, toggleBookmark } = useContestStore();
  const isBookmarked = bookmarks.includes(contest.id);
  
  const statusColors = {
    upcoming: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    ongoing: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    past: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30'
  };
  
  return (
    <div className="bg-amber-50 dark:bg-amber-900 rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200">{contest.name}</h2>
          <p className="text-sm text-amber-600 dark:text-amber-400 capitalize">{contest.platform}</p>
        </div>
        <button
          onClick={() => toggleBookmark(contest.id)}
          className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-700 dark:text-amber-300">Starts</span>
          <span className="text-amber-800 dark:text-amber-200">{new Date(contest.startTime).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-700 dark:text-amber-300">Ends</span>
          <span className="text-amber-800 dark:text-amber-200">{new Date(contest.endTime).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-700 dark:text-amber-300">Time Remaining</span>
          <span className="text-amber-800 dark:text-amber-200">{getTimeRemaining(contest.startTime)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[contest.status]}`}>
          {contest.status}
        </span>
        
        <div className="flex gap-2">
          {contest.solutionUrl && (
            <a
              href={contest.solutionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              <Youtube className="w-5 h-5" />
            </a>
          )}
          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}