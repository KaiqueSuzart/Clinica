const http = require('http');

// Testar GET para verificar se os dados estão corretos
console.log('Testando GET /budgets...');

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
                
                if (budgets.length > 0) {
                    const firstBudget = budgets[0];
                    console.log(`\nPrimeiro orçamento:`);
                    console.log(`ID: ${firstBudget.id}`);
                    console.log(`Cliente: ${firstBudget.clientelA?.nome}`);
                    console.log(`Data validade: ${firstBudget.data_validade}`);
                    console.log(`Status: ${firstBudget.status}`);
                    console.log(`Valor: R$ ${firstBudget.valor_final}`);
                    
                    if (firstBudget.itens_orcamento && firstBudget.itens_orcamento.length > 0) {
                        console.log(`\nItens:`);
                        firstBudget.itens_orcamento.forEach((item, index) => {
                            console.log(`  ${index + 1}. ${item.descricao}`);
                            console.log(`     Quantidade: ${item.quantidade}`);
                            console.log(`     Valor unitário: R$ ${item.valor_unitario}`);
                            console.log(`     Total: R$ ${item.valor_total}`);
                            console.log(`     Observações: ${item.observacoes || 'N/A'}`);
                        });
                    }
                    
                    // Testar PUT para editar
                    console.log(`\n--- Testando edição ---`);
                    const updateData = JSON.stringify({
                        data_validade: "2025-12-31"
                    });
                    
                    const updateOptions = {
                        hostname: 'localhost',
                        port: 3001,
                        path: `/budgets/${firstBudget.id}`,
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': updateData.length
                        }
                    };
                    
                    const updateReq = http.request(updateOptions, (updateRes) => {
                        console.log(`Status da edição: ${updateRes.statusCode}`);
                        
                        let updateResponseData = '';
                        updateRes.on('data', (chunk) => {
                            updateResponseData += chunk;
                        });
                        
                        updateRes.on('end', () => {
                            if (updateRes.statusCode === 200) {
                                console.log('✅ Orçamento editado com sucesso!');
                                console.log('Response:', updateResponseData);
                            } else {
                                console.log('❌ Erro na edição');
                                console.log('Response:', updateResponseData);
                            }
                        });
                    });
                    
                    updateReq.on('error', (error) => {
                        console.error('Erro na edição:', error.message);
                    });
                    
                    updateReq.write(updateData);
                    updateReq.end();
                }
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
