Passo 1: Adaptar o Backend (Node.js & SQLite)

O seu backend precisará expor parâmetros para o ESP32 ler, e receber os dados de movimento/RFID.

    API Gateway: O seu arquivo api_gateway/index.js serve perfeitamente como ponto de entrada. Você só precisará atualizar as chaves do objeto SERVICES para refletir as portas dos seus dois novos microservices (ex: controle: 'http://localhost:3001', logging: 'http://localhost:3002') e remover as rotas antigas de condomínios e entregas.  

    Serviço de Logging: O arquivo log/index.js já tem a lógica do SQLite pronta para ser usada. Você apenas precisa modificar a instrução CREATE TABLE. Substitua o campo entrega_id por campos mais adequados ao seu contexto atual, como sensor_tipo (PIR ou RFID) e evento (ex: "movimento detectado", "tag lida").  

    Serviço de Controle: Você pode usar a estrutura do ctrl_abertura/index.js como esqueleto inicial. Em vez de ter um endpoint /abrir que apenas registra uma mensagem no console, você deve criar endpoints GET e POST para manter em memória (ou em um banco de dados) as configurações enviadas pelo aplicativo. Sugestões de parâmetros a armazenar:  

        estado_alarme: Ligado / Desligado.

        sensibilidade_pir: Tempo de espera antes de o sensor registrar um novo movimento.

        tag_autorizada: O ID da tag RFID que tem permissão para acessar.

Passo 2: O Sistema Embarcado (ESP32 em C/C++)

Ao programar a lógica do microcontrolador, o seu código C/C++ deverá implementar um loop com os seguintes passos:

    Ler Configurações: Fazer uma requisição HTTP GET ao endpoint de Controle do API Gateway para saber se o alarme está armado e quais os parâmetros de funcionamento.

    Monitorar Sensores: Ler continuamente o estado do sensor PIR e aguardar a aproximação de um cartão no leitor MFRC.

    Executar Ação (Atuador): Se o alarme estiver armado e o PIR detectar movimento, ou se uma tag RFID não reconhecida for lida, o ESP32 deve acionar o atuador (ex: ligar o LED de alerta).

    Registrar Evento: Imediatamente a seguir, o ESP32 deve fazer uma requisição HTTP POST para o endpoint de Logging para avisar da ocorrência.

Passo 3: O Aplicativo Móvel (Snack / React Native)

O seu aplicativo servirá como painel de controle no celular e deverá conter duas telas ou seções principais:

    Dashboard de Eventos: Fazer um GET ao serviço de Logging para listar na tela o histórico de vezes que o alarme disparou, ordenado do registro mais recente para o mais antigo.

    Configurações: Um formulário com botões para "Armar" e "Desarmar" o alarme, e campos de texto para definir a sensibilidade, enviando essas informações através de um POST para o serviço de Controle.

Passo 4: Integração e Testes (Rede Local)

Como o emulador do Snack não consegue se comunicar com o localhost do seu computador, e você vai testar tudo com o celular físico e o ESP32, o segredo da comunicação está na rede local.

    Conecte o celular, o sistema embarcado e o computador que vai rodar o backend na mesma rede Wi-Fi.

    Para descobrir o endereço IP do computador, execute o comando ifconfig (se usar Linux ou MacOS) ou ipconfig (no Windows).

    Ao interagir com o backend, substitua a palavra localhost na URL pelo endereço IP que você acabou de descobrir, tanto no código do ESP32 quanto nas requisições do seu aplicativo móvel.