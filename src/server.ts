// Importação das dependências necessárias
import express, { Application } from 'express'; // Importando o Express para criar a aplicação web
import http from 'http'; // Importando o módulo HTTP do Node.js para criar o servidor
import { Server } from 'socket.io'; // Importando o Socket.IO para comunicação em tempo real
import path from 'path'; // Importando o módulo Path para manipulação de caminhos de arquivos

// Caminho para o diretório raiz
const __dirname = path.resolve();

class App {
    // Declarando variáveis que representam a aplicação, servidor, Socket.IO, salas e usuários
    private app: Application; // Instância da aplicação Express
    private http: http.Server; // Instância do servidor HTTP
    private io: Server; // Instância do servidor Socket.IO
    private rooms: Set<string> = new Set(); // Armazena o nome das salas criadas
    private users: Map<string, string> = new Map(); // Mapeia os nomes dos usuários pelas salas

    constructor() {
        // Inicializando a aplicação Express e o servidor HTTP
        this.app = express();
        this.http = http.createServer(this.app);
        this.io = new Server(this.http); // Inicializa o Socket.IO com o servidor HTTP

        // Chamando funções para configurar o Socket.IO e as rotas HTTP
        this.listenSocket();
        this.setupRoutes();
    }

    // Função para iniciar o servidor HTTP
    listenServer() {
        this.http.listen(3000, () => console.log('Servidor rodando na porta 3000'));
    }

    // Função que configura os eventos do Socket.IO
    listenSocket() {
        // Escutando quando um novo usuário se conecta
        this.io.on('connection', (socket) => {
            console.log(`Usuário conectado: ${socket.id}`); // Exibe no console a conexão do usuário

            // Evento para criar uma nova sala
            socket.on('createRoom', (room) => {
                this.rooms.add(room); // Adiciona a sala ao Set de salas
                this.io.emit('updateRooms', Array.from(this.rooms)); // Emite a lista de salas para todos os clientes
            });

            // Evento para o usuário entrar em uma sala
            socket.on('joinRoom', (room) => {
                socket.join(room); // Faz o usuário entrar na sala
                console.log(`Usuário ${socket.id} entrou na sala: ${room}`);
            });

            // Evento para o usuário sair de uma sala
            socket.on('leaveRoom', (room) => {
                socket.leave(room); // Faz o usuário sair da sala
                console.log(`Usuário ${socket.id} saiu da sala: ${room}`);
            });

            // Evento para definir o nome do usuário
            socket.on('setUsername', (username: string) => {
                console.log(`Nome definido para o usuário: ${username}`);
                socket.username = username; // Armazena o nome do usuário na conexão
            });

            // Evento para o envio de mensagens nas salas
            socket.on('message', ({ room, text, sender }) => {
                console.log(`Mensagem na sala ${room}: ${text} de ${sender}`);
                this.io.to(room).emit('message', { room, text, sender }); // Emite a mensagem para todos os usuários da sala
            });

            // Evento para quando o usuário se desconectar
            socket.on('disconnect', () => {
                console.log(`Usuário desconectado: ${socket.id}`); // Exibe no console quando o usuário desconectar
            });
        });
    }

    // Função para configurar as rotas HTTP
    setupRoutes() {
        // Rota principal para enviar o arquivo HTML
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html')); // Envia o arquivo index.html para o navegador
        });
    }
}

// Instanciando a classe e inicializando o servidor
const app = new App();
app.listenServer(); // Inicia o servidor na porta 3000
