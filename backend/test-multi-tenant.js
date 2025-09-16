/**
 * Script de teste para o sistema multi-tenant
 * Testa isolamento de dados entre empresas
 */

const API_BASE_URL = 'http://localhost:3000';

// Função para fazer requisições
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${data.message || 'Erro desconhecido'}`);
    }

    return data;
  } catch (error) {
    console.error(`Erro na requisição ${url}:`, error.message);
    throw error;
  }
}

// Função para registrar empresa
async function registerEmpresa(empresaData) {
  console.log(`\n🏢 Registrando empresa: ${empresaData.nome_empresa}`);
  
  const data = await makeRequest('/auth/register-empresa', {
    method: 'POST',
    body: JSON.stringify(empresaData),
  });

  console.log(`✅ Empresa registrada com sucesso!`);
  console.log(`   ID da Empresa: ${data.empresa.id}`);
  console.log(`   ID do Usuário: ${data.user.id}`);
  
  return {
    token: data.session?.access_token,
    empresaId: data.empresa.id,
    userId: data.user.id,
    empresa: data.empresa,
    user: data.user,
  };
}

// Função para registrar usuário em empresa existente
async function registerUser(userData, token) {
  console.log(`\n👤 Registrando usuário: ${userData.nome}`);
  
  const data = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  console.log(`✅ Usuário registrado com sucesso!`);
  console.log(`   ID do Usuário: ${data.user.id}`);
  
  return data;
}

// Função para fazer login
async function login(email, password) {
  console.log(`\n🔐 Fazendo login: ${email}`);
  
  const data = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  console.log(`✅ Login realizado com sucesso!`);
  console.log(`   Usuário: ${data.user.email}`);
  console.log(`   Empresa: ${data.empresa.nome}`);
  
  return {
    token: data.session?.access_token,
    empresaId: data.empresa.id,
    userId: data.user.id,
    empresa: data.empresa,
    user: data.user,
  };
}

// Função para testar isolamento de dados
async function testDataIsolation(token, empresaNome) {
  console.log(`\n🔍 Testando isolamento de dados para: ${empresaNome}`);
  
  try {
    // Testar busca de pacientes
    const pacientes = await makeRequest('/patients', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`   📊 Pacientes encontrados: ${pacientes.length}`);

    // Testar busca de consultas
    const consultas = await makeRequest('/appointments', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`   📅 Consultas encontradas: ${consultas.length}`);

    // Testar busca de orçamentos
    const orcamentos = await makeRequest('/budgets', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`   💰 Orçamentos encontrados: ${orcamentos.length}`);

    // Testar dados do usuário atual
    const me = await makeRequest('/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log(`   👤 Usuário atual: ${me.nome} (${me.empresa.nome})`);

    return {
      pacientes: pacientes.length,
      consultas: consultas.length,
      orcamentos: orcamentos.length,
    };
  } catch (error) {
    console.error(`   ❌ Erro no teste de isolamento:`, error.message);
    return null;
  }
}

// Função para criar dados de teste
async function createTestData(token, empresaNome) {
  console.log(`\n📝 Criando dados de teste para: ${empresaNome}`);
  
  try {
    // Criar paciente de teste
    const paciente = await makeRequest('/patients', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        nome: `Paciente Teste - ${empresaNome}`,
        telefone: '(11) 99999-9999',
        email: `paciente@${empresaNome.toLowerCase().replace(/\s+/g, '')}.com`,
        cpf: '123.456.789-00',
        data_nascimento: '1990-01-01',
        observacoes: `Paciente de teste da ${empresaNome}`,
      }),
    });
    console.log(`   ✅ Paciente criado: ${paciente.nome}`);

    // Criar consulta de teste
    const consulta = await makeRequest('/appointments', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        cliente_id: paciente.id,
        data_consulta: '2024-12-25',
        hora_inicio: '09:00',
        duracao_minutos: 60,
        tipo_consulta: 'Consulta de teste',
        procedimento: 'Avaliação inicial',
        observacoes: `Consulta de teste da ${empresaNome}`,
        status: 'pendente',
        valor: 150.00,
      }),
    });
    console.log(`   ✅ Consulta criada: ${consulta.tipo_consulta}`);

    return { paciente, consulta };
  } catch (error) {
    console.error(`   ❌ Erro ao criar dados de teste:`, error.message);
    return null;
  }
}

// Função principal de teste
async function runMultiTenantTest() {
  console.log('🚀 Iniciando teste do sistema multi-tenant...\n');

  try {
    // 1. Registrar primeira empresa
    const empresa1 = await registerEmpresa({
      email: 'admin1@empresa1.com',
      password: 'senha123',
      nome: 'Dr. João Silva',
      cargo: 'admin',
      role: 'admin',
      nome_empresa: 'Clínica Odontológica Empresa 1',
      email_empresa: 'contato@empresa1.com',
      cnpj: '11.111.111/0001-11',
      telefone_empresa: '(11) 11111-1111',
      endereco: 'Rua A, 123 - São Paulo/SP',
    });

    // 2. Registrar segunda empresa
    const empresa2 = await registerEmpresa({
      email: 'admin2@empresa2.com',
      password: 'senha123',
      nome: 'Dr. Maria Santos',
      cargo: 'admin',
      role: 'admin',
      nome_empresa: 'Clínica Odontológica Empresa 2',
      email_empresa: 'contato@empresa2.com',
      cnpj: '22.222.222/0001-22',
      telefone_empresa: '(11) 22222-2222',
      endereco: 'Rua B, 456 - Rio de Janeiro/RJ',
    });

    // 3. Criar dados de teste para cada empresa
    await createTestData(empresa1.token, 'Empresa 1');
    await createTestData(empresa2.token, 'Empresa 2');

    // 4. Testar isolamento - Empresa 1
    const dadosEmpresa1 = await testDataIsolation(empresa1.token, 'Empresa 1');

    // 5. Testar isolamento - Empresa 2
    const dadosEmpresa2 = await testDataIsolation(empresa2.token, 'Empresa 2');

    // 6. Verificar isolamento
    console.log('\n🔒 VERIFICAÇÃO DE ISOLAMENTO:');
    console.log('================================');
    
    if (dadosEmpresa1 && dadosEmpresa2) {
      console.log(`Empresa 1 - Pacientes: ${dadosEmpresa1.pacientes}, Consultas: ${dadosEmpresa1.consultas}, Orçamentos: ${dadosEmpresa1.orcamentos}`);
      console.log(`Empresa 2 - Pacientes: ${dadosEmpresa2.pacientes}, Consultas: ${dadosEmpresa2.consultas}, Orçamentos: ${dadosEmpresa2.orcamentos}`);
      
      // Verificar se os dados estão isolados
      const isolamentoOk = 
        dadosEmpresa1.pacientes > 0 && 
        dadosEmpresa2.pacientes > 0 &&
        dadosEmpresa1.pacientes !== dadosEmpresa2.pacientes;

      if (isolamentoOk) {
        console.log('\n✅ TESTE PASSOU! Os dados estão corretamente isolados entre empresas.');
      } else {
        console.log('\n❌ TESTE FALHOU! Os dados não estão isolados corretamente.');
      }
    }

    // 7. Testar troca de empresa (se o usuário tiver acesso a múltiplas empresas)
    console.log('\n🔄 Testando troca de empresa...');
    try {
      // Fazer login novamente para obter token fresco
      const loginEmpresa1 = await login('admin1@empresa1.com', 'senha123');
      
      // Tentar trocar para empresa 2 (deve falhar se o usuário não tiver acesso)
      try {
        await makeRequest('/auth/switch-empresa', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${loginEmpresa1.token}` },
          body: JSON.stringify({ empresa_id: empresa2.empresaId }),
        });
        console.log('   ⚠️  Usuário conseguiu trocar para empresa diferente (verificar permissões)');
      } catch (error) {
        console.log('   ✅ Usuário não conseguiu trocar para empresa diferente (comportamento esperado)');
      }
    } catch (error) {
      console.log('   ❌ Erro no teste de troca de empresa:', error.message);
    }

    console.log('\n🎉 Teste do sistema multi-tenant concluído!');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
    process.exit(1);
  }
}

// Executar teste se o script for chamado diretamente
if (require.main === module) {
  runMultiTenantTest();
}

module.exports = {
  runMultiTenantTest,
  registerEmpresa,
  registerUser,
  login,
  testDataIsolation,
  createTestData,
};

