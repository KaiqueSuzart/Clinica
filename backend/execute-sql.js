// Script simples para executar SQL no Supabase
const { createClient } = require('@supabase/supabase-js');

// Use as credenciais do seu Supabase
const supabaseUrl = 'https://your-project.supabase.co'; // Substitua pela sua URL
const supabaseKey = 'your-anon-key'; // Substitua pela sua chave

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumns() {
  try {
    console.log('🔧 Adicionando colunas à tabela empresa...');
    
    // Executar SQL diretamente
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE empresa ADD COLUMN IF NOT EXISTS descricao TEXT;
        ALTER TABLE empresa ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
        ALTER TABLE empresa ADD COLUMN IF NOT EXISTS endereco TEXT;
        ALTER TABLE empresa ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20);
        ALTER TABLE empresa ADD COLUMN IF NOT EXISTS logo_url TEXT;
      `
    });

    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Colunas adicionadas com sucesso!');
    }
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

addColumns();
