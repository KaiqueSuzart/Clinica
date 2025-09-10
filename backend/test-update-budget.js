const http = require('http');

// Primeiro, vamos listar os orçamentos para pegar um ID
const listBudgets = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/budgets',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Dados recebidos:', data);
        try {
          const budgets = JSON.parse(data);
          resolve(budgets);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
};

// Agora vamos testar a atualização
const testUpdate = async () => {
  try {
    console.log('=== Testando API de Orçamentos ===');
    
    // Listar orçamentos
    console.log('\n1. Listando orçamentos...');
    const budgets = await listBudgets();
    
    if (budgets.length === 0) {
      console.log('Nenhum orçamento encontrado. Criando um primeiro...');
      return;
    }
    
    const budgetId = budgets[0].id;
    console.log(`\n2. Testando atualização do orçamento ID: ${budgetId}`);
    
    // Dados para atualização
    const updateData = {
      data_validade: '2024-12-31',
      desconto: 50,
      tipo_desconto: 'fixed',
      valor_total: 1000,
      valor_final: 950,
      itens: [
        {
          descricao: 'Procedimento Atualizado',
          quantidade: 2,
          valor_unitario: 500,
          valor_total: 1000,
          observacoes: 'Observação atualizada'
        }
      ]
    };
    
    console.log('Dados de atualização:', JSON.stringify(updateData, null, 2));
    
    // Fazer requisição PUT
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/budgets/${budgetId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('\n3. Resposta da atualização:');
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Dados:', data);
        
        if (res.statusCode === 200) {
          console.log('\n✅ Atualização realizada com sucesso!');
        } else {
          console.log('\n❌ Erro na atualização');
        }
      });
    });

    req.on('error', (e) => {
      console.error('Erro na requisição:', e);
    });

    req.write(JSON.stringify(updateData));
    req.end();
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
};

testUpdate();
