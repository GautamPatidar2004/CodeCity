/**
 * Dynamic Time-of-Day Greeting Utility
 * Returns contextual greeting, emoji, and time period based on user local time.
 */

export interface TimeGreeting {
  greeting: string
  emoji: string
  period: 'morning' | 'afternoon' | 'evening' | 'night'
}

export function getTimeGreeting(): TimeGreeting {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning',
      emoji: '👋',
      period: 'morning',
    }
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon',
      emoji: '☀️',
      period: 'afternoon',
    }
  } else if (hour >= 17 && hour < 22) {
    return {
      greeting: 'Good evening',
      emoji: '✨',
      period: 'evening',
    }
  } else {
    return {
      greeting: 'Good evening',
      emoji: '🌙',
      period: 'night',
    }
  }
}
