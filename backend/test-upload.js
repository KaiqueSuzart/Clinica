// Teste simples de upload de arquivo
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testUpload() {
  try {
    // Criar um arquivo de teste
    const testContent = 'Este é um arquivo de teste para upload';
    const testFile = 'test-file.txt';
    fs.writeFileSync(testFile, testContent);

    // Criar FormData
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile));
    form.append('patient_id', '1');
    form.append('category', 'document');
    form.append('description', 'Arquivo de teste');

    console.log('📤 Fazendo upload de teste...');

    // Fazer upload
    const response = await fetch('http://localhost:3001/files/upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload bem-sucedido!');
      console.log('📁 Arquivo:', result);
    } else {
      const error = await response.text();
      console.log('❌ Erro no upload:');
      console.log(error);
    }

    // Limpar arquivo de teste
    fs.unlinkSync(testFile);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testUpload();
