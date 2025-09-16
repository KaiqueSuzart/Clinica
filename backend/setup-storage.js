const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  try {
    console.log('🔧 Configurando Supabase Storage...');

    // Verificar se o bucket 'empresas' existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }

    console.log('📦 Buckets existentes:', buckets.map(b => b.name));

    const empresasBucket = buckets.find(b => b.name === 'empresas');
    
    if (!empresasBucket) {
      console.log('📦 Criando bucket "empresas"...');
      
      const { data, error } = await supabase.storage.createBucket('empresas', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        console.error('❌ Erro ao criar bucket:', error);
        return;
      }

      console.log('✅ Bucket "empresas" criado com sucesso!');
    } else {
      console.log('✅ Bucket "empresas" já existe');
    }

    // Configurar políticas RLS para o bucket
    console.log('🔐 Configurando políticas RLS...');
    
    const policies = [
      {
        name: 'Permitir leitura pública de logos',
        policy: `CREATE POLICY "Permitir leitura pública de logos" ON storage.objects FOR SELECT USING (bucket_id = 'empresas');`
      },
      {
        name: 'Permitir upload de logos para empresas autenticadas',
        policy: `CREATE POLICY "Permitir upload de logos para empresas autenticadas" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'empresas' AND auth.role() = 'authenticated');`
      },
      {
        name: 'Permitir atualização de logos da própria empresa',
        policy: `CREATE POLICY "Permitir atualização de logos da própria empresa" ON storage.objects FOR UPDATE USING (bucket_id = 'empresas' AND auth.role() = 'authenticated');`
      },
      {
        name: 'Permitir exclusão de logos da própria empresa',
        policy: `CREATE POLICY "Permitir exclusão de logos da própria empresa" ON storage.objects FOR DELETE USING (bucket_id = 'empresas' AND auth.role() = 'authenticated');`
      }
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.policy });
        if (error) {
          console.log(`⚠️  Aviso para política "${policy.name}":`, error.message);
        } else {
          console.log(`✅ Política "${policy.name}" configurada`);
        }
      } catch (err) {
        console.log(`⚠️  Aviso para política "${policy.name}":`, err.message);
      }
    }

    console.log('\n🎉 Configuração do Storage concluída!');
    console.log('📝 Próximos passos:');
    console.log('1. Verifique se o bucket "empresas" foi criado no Supabase Dashboard');
    console.log('2. Teste o upload de logo no frontend');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

setupStorage();
