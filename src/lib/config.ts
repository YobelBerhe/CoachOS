/**
 * Application Configuration
 * Uses environment variables from Lovable Cloud
 */

export const config = {
  app: {
    name: 'DayAI',
    url: import.meta.env.VITE_SUPABASE_URL?.replace('//', '//app.') || 'http://localhost:5173',
    version: '1.0.0',
  },
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  },
  
  // Optional third-party integrations (can be added via Lovable secrets)
  analytics: {
    enabled: false, // Enable when you add VITE_POSTHOG_KEY
    posthogKey: import.meta.env.VITE_POSTHOG_KEY,
    posthogHost: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
  },
  
  sentry: {
    enabled: false, // Enable when you add VITE_SENTRY_DSN
    dsn: import.meta.env.VITE_SENTRY_DSN,
  },
  
  features: {
    enablePWA: true,
    enableDebug: import.meta.env.DEV,
  },
  
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validation
if (config.isProduction && !config.supabase.url) {
  console.error('⚠️ Missing Supabase configuration');
}

export default config;
