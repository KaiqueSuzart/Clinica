// IMPORTANTE: Este arquivo contém credenciais. Em produção, use variáveis de ambiente!
// As credenciais aqui são apenas para desenvolvimento local

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || 'https://hszzeqafyslpqxqomddu.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzenplcWFmeXNscHF4cW9tZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTU2ODgsImV4cCI6MjA1OTg5MTY4OH0.TRhCkEBjEpk9tiNarGX6-iqr-iOQiTE8V2q6ti0v550',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzenplcWFmeXNscHF4cW9tZGR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDMxNTY4OCwiZXhwIjoyMDU5ODkxNjg4fQ.6_LPAwsPGlsZY0JRTDT2CoRL8I9gAMINF3fE6ikOSw4'
  },
  app: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'clinica_jwt_secret_2024',
    expiresIn: '7d'
  }
};

