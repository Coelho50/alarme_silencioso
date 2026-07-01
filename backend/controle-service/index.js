const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyParser.json());

// 1. Conexão com o banco de dados próprio do serviço de controle
const db = new sqlite3.Database('./controle.db', (err) => {
    if (err) {
        console.error('ERRO: não foi possível conectar ao SQLite (Controle).');
        throw err;
    }
    console.log('Conectado ao SQLite (Controle)!');
});

// 2. Criação da tabela de configurações
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS configuracoes (
        parametro TEXT PRIMARY KEY NOT NULL,
        valor INTEGER NOT NULL
    )`, (err) => {
        if (err) {
            console.error('ERRO: não foi possível criar tabela de configurações.');
            throw err;
        }
    });

    // 3. Inicialização de segurança: Insere o gracePeriod padrão se não existir
    db.run(`INSERT OR IGNORE INTO configuracoes (parametro, valor) VALUES ('gracePeriod', 1000)`);
});

// 4. Rota GET: Retorna todas as configurações
app.get('/configuracoes', (req, res) => {
    db.all(`SELECT * FROM configuracoes`, [], (err, result) => {
        if (err) {
            console.error("Erro ao obter configurações: " + err.message);
            return res.status(500).send('Erro ao obter dados.');
        }
        res.status(200).json(result);
    });
});

// 5. Rota GET (por parâmetro): O ESP32 chamará esta rota para ler o gracePeriod
app.get('/configuracoes/:parametro', (req, res) => {
    db.get(`SELECT * FROM configuracoes WHERE parametro = ?`, [req.params.parametro], (err, result) => {
        if (err) {
            return res.status(500).send('Erro ao obter parâmetro.');
        } else if (result == null) {
            return res.status(404).send('Parâmetro não encontrado.');
        } else {
            res.status(200).json(result);
        }
    });
});

// 6. Rota PATCH: O App Mobile chamará esta rota para atualizar o gracePeriod
app.patch('/configuracoes/:parametro', (req, res) => {
    const { valor } = req.body;
    
    if (valor === undefined) {
        return res.status(400).send('O valor do parâmetro é obrigatório.');
    }

    db.run(`UPDATE configuracoes SET valor = ? WHERE parametro = ?`, 
    [valor, req.params.parametro], function(err) {
        if (err) {
            return res.status(500).send('Erro ao alterar o parâmetro.');
        } else if (this.changes === 0) {
            // Se o parâmetro não existia, nós criamos (Upsert manual)
            db.run(`INSERT INTO configuracoes (parametro, valor) VALUES (?, ?)`, 
            [req.params.parametro, valor], (insertErr) => {
                if (insertErr) return res.status(500).send('Erro ao criar o parâmetro.');
                res.status(201).send('Parâmetro criado com sucesso!');
            });
        } else {
            res.status(200).send('Parâmetro atualizado com sucesso!');
        }
    });
});

// Inicia o serviço na porta 8081
app.listen(8081, () => {
    console.log('Serviço de Controle em execução na porta: 8081');
});