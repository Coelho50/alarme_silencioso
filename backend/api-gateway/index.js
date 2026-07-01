const express = require('express');
const httpProxy = require('express-http-proxy');
const logger = require('morgan');

const app = express();
app.use(logger('dev'));

// Função que atua como "guarda de trânsito", decidindo para qual contêiner enviar o tráfego
function selectProxyHost(req) {
    if (req.path.startsWith('/configuracoes')) {
        return 'http://controle-service:8081/'; // Roteia para o serviço
    } else if (req.path.startsWith('/logs')) {
        return 'http://logging-service:8082/'; // Roteia para o serviço
    }
    return null;
}

app.use((req, res, next) => {
    const proxyHost = selectProxyHost(req);
    if (proxyHost == null) {
        res.status(404).send('Rota não encontrada no API Gateway');
    } else {
        httpProxy(proxyHost)(req, res, next);
    }
});

// O Gateway sempre escuta na porta 8000
app.listen(8000, () => {
    console.log('API Gateway iniciado na porta: 8000!');
});