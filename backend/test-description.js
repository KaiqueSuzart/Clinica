const http = require('http');

const data = JSON.stringify({
    cliente_id: "8", // Carlos
    descricao: "Teste de descrição detalhada",
    valor_total: 2000,
    desconto: 100,
    valor_final: 1900,
    status: "rascunho",
    data_validade: "2024-12-31",
    observacoes: "Teste para verificar descrição",
    forma_pagamento: "Cartão",
    parcelas: 2,
    itens: [
        {
            descricao: "Limpeza profissional",
            quantidade: 1,
            valor_unitario: 1500,
            valor_total: 1500,
            observacoes: "Limpeza completa com flúor"
        },
        {
            descricao: "Aplicação de flúor",
            quantidade: 1,
            valor_unitario: 500,
            valor_total: 500,
            observacoes: "Aplicação de flúor gel"
        }
    ]
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/budgets',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Criando orçamento com descrições detalhadas...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 201) {
            console.log('✅ Orçamento criado com sucesso!');
            console.log('Response:', responseData);
            
            // Verificar se foi criado corretamente
            setTimeout(() => {
                console.log('\n--- Verificando orçamentos ---');
                
                const checkOptions = {
                    hostname: 'localhost',
                    port: 3001,
                    path: '/budgets',
                    method: 'GET'
                };
                
                const checkReq = http.request(checkOptions, (checkRes) => {
                    let checkData = '';
                    checkRes.on('data', (chunk) => {
                        checkData += chunk;
                    });
                    
                    checkRes.on('end', () => {
                        try {
                            const budgets = JSON.parse(checkData);
                            console.log(`Total de orçamentos: ${budgets.length}`);
                            
                            // Mostrar o último orçamento criado
                            const lastBudget = budgets[0]; // Ordenado por created_at desc
                            console.log(`\nÚltimo orçamento criado:`);
                            console.log(`ID: ${lastBudget.id}`);
                            console.log(`Cliente: ${lastBudget.clientelA?.nome}`);
                            console.log(`Valor: R$ ${lastBudget.valor_final}`);
                            console.log(`Itens:`);
                            
                            lastBudget.itens_orcamento?.forEach((item, index) => {
                                console.log(`  ${index + 1}. ${item.descricao}`);
                                console.log(`     Quantidade: ${item.quantidade}`);
                                console.log(`     Valor unitário: R$ ${item.valor_unitario}`);
                                console.log(`     Total: R$ ${item.valor_total}`);
                                console.log(`     Observações: ${item.observacoes || 'N/A'}`);
                            });
                        } catch (e) {
                            console.log('Erro ao processar resposta:', e.message);
                        }
                    });
                });
                
                checkReq.on('error', (error) => {
                    console.error('Erro na verificação:', error.message);
                });
                
                checkReq.end();
            }, 1000);
        } else {
            console.log('❌ Erro na criação do orçamento');
            console.log('Response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Erro de conexão:', error.message);
});

req.write(data);
req.end();
