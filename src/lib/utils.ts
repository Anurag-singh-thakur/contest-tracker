import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeRemaining(startTime: string): string {
  return formatDistanceToNow(parseISO(startTime), { addSuffix: true });
}

export function getContestStatus(startTime: string, endTime: string): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date();
  const start = parseISO(startTime);
  const end = parseISO(endTime);

  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}