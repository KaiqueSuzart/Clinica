export const config = {
  supabase: {
    url: 'https://hszzeqafyslpqxqomddu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzenplcWFmeXNscHF4cW9tZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTU2ODgsImV4cCI6MjA1OTg5MTY4OH0.TRhCkEBjEpk9tiNarGX6-iqr-iOQiTE8V2q6ti0v550',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzenplcWFmeXNscHF4cW9tZGR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDMxNTY4OCwiZXhwIjoyMDU5ODkxNjg4fQ.6_LPAwsPGlsZY0JRTDT2CoRL8I9gAMINF3fE6ikOSw4'
  },
  app: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  jwt: {
    secret: 'clinica_jwt_secret_2024',
    expiresIn: '7d'
  }
};








