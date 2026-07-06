const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyParser.json());

// 1. Ligação à base de dados do serviço de logging
const db = new sqlite3.Database('./logs.db', (err) => {
    if (err) {
        console.error('ERRO: Não foi possível ligar ao SQLite (Logging).');
        throw err;
    }
    console.log('Ligado ao SQLite (Logging)!');
});

// 2. Criação da tabela de histórico ajustada para o Alarme IoT
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS historico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_tipo TEXT NOT NULL,
        evento TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('ERRO: Falha ao criar tabela de histórico.');
            throw err;
        }
    });
});

// 3. Rota POST: O ESP8266 (e o App) chamam esta rota para registar um evento
app.post('/logs', (req, res) => {
    // Recebe as variáveis exatamente com os nomes que o App e o ESP8266 enviam
    const { sensor_tipo, evento } = req.body;
    
    if (!sensor_tipo || !evento) {
        return res.status(400).send('sensor_tipo e evento são obrigatórios.');
    }

    const timestamp = new Date().toISOString();

    db.run(`INSERT INTO historico (sensor_tipo, evento, timestamp) VALUES (?, ?, ?)`, 
    [sensor_tipo, evento, timestamp], function(err) {
        if (err) {
            return res.status(500).send('Erro ao guardar o log.');
        }
        res.status(201).send(`Log registado com sucesso! ID: ${this.lastID}`);
    });
});

// 4. Rota GET: O App Móvel chama esta rota para carregar a FlatList do histórico
app.get('/logs', (req, res) => {
    // Retorna ordenado do mais recente para o mais antigo
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
    console.log('Serviço de Logging IoT em execução na porta: 8082');
});