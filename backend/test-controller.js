const http = require('http');

// Teste sem itens primeiro
const data1 = JSON.stringify({
    cliente_id: "1",
    descricao: "Teste sem itens",
    valor_total: 100,
    desconto: 0,
    valor_final: 100,
    status: "rascunho",
    data_validade: "2024-12-31"
});

console.log('Teste 1 - Sem itens:');
console.log('Dados:', data1);

const options1 = {
    hostname: 'localhost',
    port: 3001,
    path: '/budgets',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data1.length
    }
};

const req1 = http.request(options1, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', responseData);
        console.log('---');
        
        // Teste 2 - Com itens
        console.log('Teste 2 - Com itens:');
        
        const data2 = JSON.stringify({
            cliente_id: "1",
            descricao: "Teste com itens",
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
        
        console.log('Dados:', data2);
        
        const options2 = {
            hostname: 'localhost',
            port: 3001,
            path: '/budgets',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data2.length
            }
        };
        
        const req2 = http.request(options2, (res2) => {
            console.log(`Status: ${res2.statusCode}`);
            
            let responseData2 = '';
            res2.on('data', (chunk) => {
                responseData2 += chunk;
            });
            
            res2.on('end', () => {
                console.log('Response:', responseData2);
            });
        });
        
        req2.on('error', (error) => {
            console.error('Error 2:', error.message);
        });
        
        req2.write(data2);
        req2.end();
    });
});

req1.on('error', (error) => {
    console.error('Error 1:', error.message);
});

req1.write(data1);
req1.end();
