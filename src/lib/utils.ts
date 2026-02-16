import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ISO date string to readable format
 * @param dateString - ISO date string (e.g., "2026-02-10T19:08:56.423Z")
 * @param format - Format style: 'short' (Feb 10, 2026) or 'long' (February 10, 2026)
 * @returns Formatted date string
 */
export function formatDate(dateString: string | undefined | null, format: 'short' | 'long' = 'short'): string {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    
    if (format === 'long') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
    
    // Short format: Feb 10, 2026
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Format ISO date string to relative time (e.g., "2 days ago", "3 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
    
    // For older dates, show formatted date
    return formatDate(dateString, 'short')
  } catch {
    return '—'
  }
}
