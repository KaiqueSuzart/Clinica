const http = require('http');

const data = JSON.stringify({
    cliente_id: "8", // Carlos
    descricao: "Teste de novo orçamento - não deve substituir",
    valor_total: 1000,
    desconto: 50,
    valor_final: 950,
    status: "rascunho",
    data_validade: "2024-12-31",
    observacoes: "Teste para verificar se substitui orçamentos",
    forma_pagamento: "Cartão",
    parcelas: 1,
    itens: [
        {
            descricao: "Procedimento de teste",
            quantidade: 1,
            valor_unitario: 950,
            valor_total: 950,
            observacoes: "Item de teste"
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

console.log('Criando novo orçamento...');
console.log('Dados:', data);

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', responseData);
        
        // Agora vamos contar novamente
        setTimeout(() => {
            console.log('\n--- Verificando quantidade após criação ---');
            
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
                        console.log(`Quantidade de orçamentos após criação: ${budgets.length}`);
                        
                        budgets.forEach((budget, index) => {
                            console.log(`${index + 1}. ID: ${budget.id.substring(0, 8)}... - Cliente: ${budget.clientelA?.nome || 'N/A'} - Valor: R$ ${budget.valor_final} - Criado: ${budget.created_at.substring(0, 10)}`);
                        });
                    } catch (e) {
                        console.log('Erro ao processar resposta de verificação');
                    }
                });
            });
            
            checkReq.on('error', (error) => {
                console.error('Erro na verificação:', error.message);
            });
            
            checkReq.end();
        }, 1000);
    });
});

req.on('error', (error) => {
    console.error('Erro:', error.message);
});

req.write(data);
req.end();
