const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyParser.json());

// 1. Ligação à base de dados do serviço de controlo
const db = new sqlite3.Database('./controle.db', (err) => {
    if (err) {
        console.error('ERRO: Não foi possível ligar ao SQLite (Controlo).');
        throw err;
    }
    console.log('Ligado ao SQLite (Controlo)!');
});

// 2. Criação da tabela com a estrutura exata do Alarme IoT
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS configuracoes (
        id INTEGER PRIMARY KEY,
        estado_alarme TEXT NOT NULL,
        sensibilidade_pir INTEGER NOT NULL,
        tag_autorizada TEXT
    )`, (err) => {
        if (err) {
            console.error('ERRO: Falha ao criar tabela de configurações.');
            throw err;
        }
    });

    // Inicializa a configuração padrão (id 1) se não existir
    db.run(`INSERT OR IGNORE INTO configuracoes (id, estado_alarme, sensibilidade_pir, tag_autorizada) 
            VALUES (1, 'desligado', 5000, 'N/A')`);
});

// 3. Rota GET: O ESP8266 e o App chamam esta rota para saber o estado do alarme
app.get('/configuracoes', (req, res) => {
    db.get(`SELECT estado_alarme, sensibilidade_pir, tag_autorizada FROM configuracoes WHERE id = 1`, (err, result) => {
        if (err) {
            console.error("Erro ao obter configurações: " + err.message);
            return res.status(500).send('Erro ao obter dados.');
        }
        // Devolve exatamente o que o ESP8266 e o App esperam ler
        res.status(200).json(result);
    });
});

// 4. Rota POST: O App Móvel chama esta rota para ligar/desligar o alarme
app.post('/configuracoes', (req, res) => {
    const { estado_alarme, sensibilidade_pir, tag_autorizada } = req.body;
    
    if (!estado_alarme) {
        return res.status(400).send('O estado_alarme é obrigatório.');
    }

    db.run(`UPDATE configuracoes SET estado_alarme = ?, sensibilidade_pir = ?, tag_autorizada = ? WHERE id = 1`, 
    [estado_alarme, sensibilidade_pir || 5000, tag_autorizada || 'N/A'], function(err) {
        if (err) {
            return res.status(500).send('Erro ao atualizar o estado do alarme.');
        }
        res.status(200).send('Alarme atualizado com sucesso!');
    });
});

// Inicia o serviço na porta 8081
app.listen(8081, () => {
    console.log('Serviço de Controlo IoT em execução na porta: 8081');
});