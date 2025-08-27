/**
 * Script para configurar automaticamente o Storage no Supabase
 * Execute: node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://hszzeqafyslpqxqomddu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzenplcWFmeXNscHF4cW9tZGR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDMxNTY4OCwiZXhwIjoyMDU5ODkxNjg4fQ.6_LPAwsPGlsZY0JRTDT2CoRL8I9gAMINF3fE6ikOSw4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🚀 Iniciando configuração do Storage...\n');

  try {
    // 1. Criar bucket
    console.log('📁 Criando bucket patient-files...');
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('patient-files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Erro ao criar bucket:', bucketError);
    } else {
      console.log('✅ Bucket criado com sucesso ou já existe');
    }

    // 2. Ler e executar SQL
    console.log('\n📝 Executando configuração SQL...');
    const sqlPath = path.join(__dirname, '..', 'supabase-setup-completo-storage.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir o SQL em comandos menores para evitar timeout
    const sqlCommands = sqlContent
      .split(';')
      .filter(cmd => cmd.trim().length > 0)
      .map(cmd => cmd.trim() + ';');

    console.log(`📊 Executando ${sqlCommands.length} comandos SQL...`);

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.trim() === ';') continue;

      console.log(`   Executando comando ${i + 1}/${sqlCommands.length}...`);
      
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: command
      });

      if (sqlError) {
        console.warn(`⚠️  Aviso no comando ${i + 1}:`, sqlError.message);
      }
    }

    // 3. Verificar configuração
    console.log('\n🔍 Verificando configuração...');

    // Verificar se bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    const patientFilesBucket = buckets?.find(b => b.id === 'patient-files');

    if (patientFilesBucket) {
      console.log('✅ Bucket patient-files encontrado');
    } else {
      console.log('❌ Bucket patient-files não encontrado');
    }

    // Verificar tabela
    const { data: tableData, error: tableError } = await supabase
      .from('patient_files')
      .select('*')
      .limit(1);

    if (!tableError) {
      console.log('✅ Tabela patient_files acessível');
    } else {
      console.log('❌ Erro ao acessar tabela patient_files:', tableError.message);
    }

    console.log('\n🎉 Configuração do Storage concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Iniciar o backend: npm start');
    console.log('   2. Testar upload via API');
    console.log('   3. Usar interface frontend');

  } catch (error) {
    console.error('❌ Erro geral na configuração:', error);
  }
}

// Executar setup
setupStorage().catch(console.error);
