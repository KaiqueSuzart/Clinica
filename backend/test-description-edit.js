const http = require('http');

// Testar GET para verificar se os dados estão corretos
console.log('Verificando dados dos orçamentos...');

const getOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/budgets',
    method: 'GET'
};

const getReq = http.request(getOptions, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const budgets = JSON.parse(responseData);
                console.log(`Total de orçamentos: ${budgets.length}`);
                
                // Mostrar detalhes dos itens
                budgets.forEach((budget, index) => {
                    console.log(`\n=== Orçamento ${index + 1} ===`);
                    console.log(`ID: ${budget.id}`);
                    console.log(`Cliente: ${budget.clientelA?.nome}`);
                    console.log(`Descrição: ${budget.descricao}`);
                    
                    if (budget.itens_orcamento && budget.itens_orcamento.length > 0) {
                        console.log(`Itens:`);
                        budget.itens_orcamento.forEach((item, itemIndex) => {
                            console.log(`  ${itemIndex + 1}. Procedimento: "${item.descricao}"`);
                            console.log(`     Observações: "${item.observacoes}"`);
                            console.log(`     Quantidade: ${item.quantidade}`);
                            console.log(`     Valor unitário: R$ ${item.valor_unitario}`);
                            console.log(`     Total: R$ ${item.valor_total}`);
                        });
                    }
                });
            } catch (e) {
                console.log('Erro ao processar resposta:', e.message);
            }
        } else {
            console.log('❌ Erro no GET');
            console.log('Response:', responseData);
        }
    });
});

getReq.on('error', (error) => {
    console.error('Erro no GET:', error.message);
});

getReq.end();
