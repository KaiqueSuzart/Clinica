const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configurações do Supabase - usando service role key
const supabaseUrl = 'https://hszzeqafyslpqxqomddu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzenplcWFmeXNscHF4cW9tZGR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDMxNTY4OCwiZXhwIjoyMDU5ODkxNjg4fQ.6_LPAwsPGlsZY0JRTDT2CoRL8I9gAMINF3fE6ikOSw4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

async function applyTableFix() {
  try {
    console.log('🔧 Aplicando correção na estrutura da tabela retornos...');
    
    // Ler o SQL de correção
    const sqlContent = fs.readFileSync('./fix-table-structure.sql', 'utf8');
    
    console.log('📋 SQL para executar:');
    console.log(sqlContent);
    
    // Tentar executar comandos individuais
    console.log('\n🔍 Verificando estrutura atual da tabela...');
    
    // Verificar se a coluna existe
    const { data: columns, error: columnsError } = await supabase
      .from('retornos')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.log('❌ Erro ao verificar tabela:', columnsError);
    } else {
      console.log('✅ Tabela acessível');
    }
    
    // Tentar inserir um registro de teste
    console.log('\n🧪 Testando inserção com data_consulta_original...');
    
    const { data: testData, error: testError } = await supabase
      .from('retornos')
      .insert({
        cliente_id: 12,
        data_retorno: '2025-09-20',
        hora_retorno: '09:00',
        motivo: 'Teste de estrutura',
        procedimento: 'Teste',
        status: 'pendente',
        observacoes: 'Teste após correção',
        data_consulta_original: '2025-09-06',
        empresa_id: 1
      })
      .select('*')
      .single();
    
    if (testError) {
      console.log('❌ Erro na inserção:', testError);
      console.log('📋 Execute manualmente no Supabase SQL Editor:');
      console.log('\n' + '='.repeat(60));
      console.log(sqlContent);
      console.log('='.repeat(60));
    } else {
      console.log('✅ Inserção bem-sucedida:', testData);
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
    console.log('📋 Execute manualmente no Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    const sqlContent = fs.readFileSync('./fix-table-structure.sql', 'utf8');
    console.log(sqlContent);
    console.log('='.repeat(60));
  }
}

applyTableFix();

