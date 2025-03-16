import React, { useState, useRef, useEffect } from 'react';
import { useContestStore } from '../store/useContestStore';
import { Filter, ChevronDown } from 'lucide-react';

export default function ContestFilters() {
  const { filters, updateFilters } = useContestStore();
  const [platformsOpen, setPlatformsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  
  const platformsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (platformsRef.current && !platformsRef.current.contains(event.target as Node)) {
        setPlatformsOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePlatformChange = (platform: keyof typeof filters.platforms) => {
    updateFilters({
      platforms: {
        ...filters.platforms,
        [platform]: !filters.platforms[platform]
      }
    });
  };

  const handleStatusChange = (status: typeof filters.status) => {
    updateFilters({ status });
    setStatusOpen(false);
  };

  // Get active platforms
  const activePlatforms = Object.entries(filters.platforms)
    .filter(([_, enabled]) => enabled)
    .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1));

  return (
    <div className="bg-amber-100 dark:bg-amber-900 p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <Filter className="mr-2 text-amber-600 dark:text-amber-500" size={18} />
        <h3 className="font-medium text-gray-800 dark:text-gray-200">Filters</h3>
      </div>

      <div className="space-y-4">
        {/* Platforms Dropdown */}
        <div className="relative" ref={platformsRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Platforms
          </label>
          <button
            className="flex items-center justify-between w-full px-3 py-2 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200"
            onClick={() => setPlatformsOpen(!platformsOpen)}
            type="button"
          >
            <span className="text-sm truncate">
              {activePlatforms.length > 0 
                ? activePlatforms.join(', ') 
                : 'Select platforms'}
            </span>
            <ChevronDown size={16} className={`transition-transform ${platformsOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {platformsOpen && (
            <div className="absolute z-10 w-full mt-1 bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {Object.entries(filters.platforms).map(([platform, enabled]) => (
                <div 
                  key={platform}
                  onClick={() => handlePlatformChange(platform as keyof typeof filters.platforms)}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30"
                >
                  <div className={`w-4 h-4 mr-2 rounded ${enabled ? 'bg-amber-600 dark:bg-amber-500' : 'border border-amber-400 dark:border-amber-600'}`}>
                    {enabled && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                  <span className={`${enabled ? 'font-medium' : ''} text-amber-800 dark:text-amber-200`}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <button
            className="flex items-center justify-between w-full px-3 py-2 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200"
            onClick={() => setStatusOpen(!statusOpen)}
            type="button"
          >
            <span className="text-sm font-medium">
              {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
            </span>
            <ChevronDown size={16} className={`transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {statusOpen && (
            <div className="absolute z-10 w-full mt-1 bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-md shadow-lg">
              {['all', 'upcoming', 'ongoing', 'past'].map((status) => (
                <div 
                  key={status}
                  onClick={() => handleStatusChange(status as typeof filters.status)}
                  className="px-3 py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30"
                >
                  <span className={`text-sm ${
                    filters.status === status 
                      ? 'text-white dark:text-amber-950 bg-amber-600 dark:bg-amber-500 px-2 py-1 rounded-full'
                      : 'text-amber-800 dark:text-amber-200'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}