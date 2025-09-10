const http = require('http');

// Testar GET para verificar se o campo tipo_desconto está sendo retornado
console.log('Verificando campo tipo_desconto...');

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
                
                // Mostrar detalhes dos orçamentos
                budgets.forEach((budget, index) => {
                    console.log(`\n=== Orçamento ${index + 1} ===`);
                    console.log(`ID: ${budget.id}`);
                    console.log(`Cliente: ${budget.clientelA?.nome}`);
                    console.log(`Desconto: R$ ${budget.desconto}`);
                    console.log(`Tipo de Desconto: ${budget.tipo_desconto || 'N/A'}`);
                    console.log(`Valor Final: R$ ${budget.valor_final}`);
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
