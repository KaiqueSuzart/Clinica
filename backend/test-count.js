const http = require('http');

// Teste para contar orçamentos
const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/budgets',
    method: 'GET'
};

console.log('Testando contagem de orçamentos...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        try {
            const data = JSON.parse(responseData);
            console.log(`Quantidade de orçamentos encontrados: ${data.length}`);
            
            data.forEach((budget, index) => {
                console.log(`${index + 1}. ID: ${budget.id.substring(0, 8)}... - Cliente: ${budget.clientelA?.nome || 'N/A'} - Valor: R$ ${budget.valor_final}`);
            });
        } catch (e) {
            console.log('Erro ao processar resposta:', e.message);
            console.log('Response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('Erro:', error.message);
});

req.end();
