const http = require('http');

const data = JSON.stringify({
    cliente_id: "8",
    descricao: "Teste status",
    valor_total: 100,
    desconto: 0,
    valor_final: 100,
    status: "rascunho",
    data_validade: "2024-12-31",
    itens: [{
        descricao: "Teste",
        quantidade: 1,
        valor_unitario: 100,
        valor_total: 100
    }]
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

console.log('Testando criação...');

const req = http.request(options, (res) => {
    console.log(`Status HTTP: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Response Body:', responseData);
        
        if (res.statusCode === 201) {
            console.log('✅ Orçamento criado com sucesso!');
        } else {
            console.log('❌ Erro na criação do orçamento');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Erro de conexão:', error.message);
});

req.write(data);
req.end();
