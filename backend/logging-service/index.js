const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyParser.json());

// 1. Conexão com o banco de dados próprio do serviço de logging
const db = new sqlite3.Database('./logs.db', (err) => {
    if (err) {
        console.error('ERRO: não foi possível conectar ao SQLite (Logging).');
        throw err;
    }
    console.log('Conectado ao SQLite (Logging)!');
});

// 2. Criação da tabela de histórico
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS historico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        data_hora TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('ERRO: não foi possível criar tabela de histórico.');
            throw err;
        }
    });
});

// 3. Rota POST: O ESP32 chamará esta rota para registrar um evento (ex: Movimento ou Cartão lido)
app.post('/logs', (req, res) => {
    const { sensor, mensagem } = req.body;
    
    if (!sensor || !mensagem) {
        return res.status(400).send('Sensor e mensagem são obrigatórios.');
    }

    const data_hora = new Date().toISOString();

    db.run(`INSERT INTO historico (sensor, mensagem, data_hora) VALUES (?, ?, ?)`, 
    [sensor, mensagem, data_hora], function(err) {
        if (err) {
            return res.status(500).send('Erro ao salvar o log.');
        }
        res.status(201).send(`Log registrado com sucesso! ID: ${this.lastID}`);
    });
});

// 4. Rota GET: O App Mobile chamará esta rota para ver o histórico de sensores
app.get('/logs', (req, res) => {
    db.all(`SELECT * FROM historico ORDER BY id DESC`, [], (err, result) => {
        if (err) {
            console.error("Erro ao obter histórico: " + err.message);
            return res.status(500).send('Erro ao obter dados.');
        }
        res.status(200).json(result);
    });
});

// Inicia o serviço na porta 8082
app.listen(8082, () => {
    console.log('Serviço de Logging em execução na porta: 8082');
});