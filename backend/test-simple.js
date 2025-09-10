const http = require('http');

const data = JSON.stringify({
    cliente_id: "1",
    descricao: "Teste simples",
    valor_total: 100,
    desconto: 0,
    valor_final: 100,
    status: "rascunho",
    data_validade: "2024-12-31",
    itens: [
        {
            descricao: "Item teste",
            quantidade: 1,
            valor_unitario: 100,
            valor_total: 100
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

console.log('Enviando dados:', data);

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', responseData);
        try {
            const parsed = JSON.parse(responseData);
            console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Could not parse response as JSON');
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(data);
req.end();
