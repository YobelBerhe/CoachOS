/**
 * Analytics Tracking System
 * Supports PostHog or can be extended to other providers
 */

import config from './config';

// Track custom event
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (config.isDevelopment) {
    console.log('📊 Event:', eventName, properties);
  }
  
  // If PostHog is configured, use it
  if (config.analytics.enabled && window.posthog) {
    window.posthog.capture(eventName, properties);
  }
}

// Track page view
export function trackPageView(pageName: string, properties?: Record<string, any>) {
  if (config.isDevelopment) {
    console.log('📄 Page View:', pageName);
  }
  
  if (config.analytics.enabled && window.posthog) {
    window.posthog.capture('$pageview', {
      page: pageName,
      ...properties,
    });
  }
}

// Identify user
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (config.isDevelopment) {
    console.log('👤 Identify User:', userId, properties);
  }
  
  if (config.analytics.enabled && window.posthog) {
    window.posthog.identify(userId, properties);
  }
}

// Reset on logout
export function resetAnalytics() {
  if (config.analytics.enabled && window.posthog) {
    window.posthog.reset();
  }
}

// Pre-defined events
export const AnalyticsEvents = {
  // User events
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Recipe events
  RECIPE_VIEWED: 'recipe_viewed',
  RECIPE_CREATED: 'recipe_created',
  RECIPE_FAVORITED: 'recipe_favorited',
  RECIPE_UNLOCKED: 'recipe_unlocked',
  RECIPE_LOGGED: 'recipe_logged_to_diary',
  RECIPE_REVIEWED: 'recipe_reviewed',
  
  // Food tracking
  FOOD_LOGGED: 'food_logged',
  MEAL_COMPLETED: 'meal_completed',
  DAILY_GOAL_MET: 'daily_nutrition_goal_met',
  
  // Workout events
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  EXERCISE_COMPLETED: 'exercise_completed',
  
  // Sleep events
  SLEEP_LOGGED: 'sleep_logged',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Engagement
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
};

// Extend window type for PostHog
declare global {
  interface Window {
    posthog?: any;
  }
}
