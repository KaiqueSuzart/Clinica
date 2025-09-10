const http = require('http');

const data = JSON.stringify({
    cliente_id: "8",
    descricao: "Teste descrição",
    valor_total: 1000,
    desconto: 0,
    valor_final: 1000,
    status: "rascunho",
    data_validade: "2024-12-31",
    itens: [
        {
            descricao: "Procedimento teste",
            quantidade: 1,
            valor_unitario: 1000,
            valor_total: 1000,
            observacoes: "Descrição detalhada do procedimento"
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

console.log('Testando criação com descrição...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', responseData);
    });
});

req.on('error', (error) => {
    console.error('Erro:', error.message);
});

req.write(data);
req.end();
