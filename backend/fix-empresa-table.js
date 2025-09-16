const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmpresaTable() {
  try {
    console.log('🔧 Corrigindo tabela empresa...');

    // Adicionar colunas se não existirem
    const queries = [
      "ALTER TABLE empresa ADD COLUMN IF NOT EXISTS descricao TEXT;",
      "ALTER TABLE empresa ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);",
      "ALTER TABLE empresa ADD COLUMN IF NOT EXISTS endereco TEXT;",
      "ALTER TABLE empresa ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20);",
      "ALTER TABLE empresa ADD COLUMN IF NOT EXISTS logo_url TEXT;"
    ];

    for (const query of queries) {
      console.log(`Executando: ${query}`);
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`⚠️  Aviso: ${error.message}`);
      } else {
        console.log('✅ Executado com sucesso');
      }
    }

    // Verificar estrutura da tabela
    console.log('\n📋 Verificando estrutura da tabela empresa...');
    const { data, error } = await supabase
      .from('empresa')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao verificar tabela:', error);
    } else {
      console.log('✅ Tabela empresa verificada com sucesso');
      if (data && data.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(data[0]));
      }
    }

    console.log('\n🎉 Correção da tabela empresa concluída!');
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela:', error);
  }
}

fixEmpresaTable();
