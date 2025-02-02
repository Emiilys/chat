import express, { Application } from 'express'; //facilita a criação de servidores web e APIs
import http from 'http'; 
import { Server } from 'socket.io'; //permite comunicação em tempo real entre o cliente e o servidor. 
import path from 'path'; 

const __dirname = path.resolve(); // Define __dirname manualmente para obter o diretório atual

class App {
    private app: Application; 
    private http: http.Server; 
    private io: Server; 

    constructor() {
        this.app = express(); 
        this.http = http.createServer(this.app); // Cria um servidor HTTP usando a aplicação Express
        this.io = new Server(this.http); // Inicializa o Socket.IO com o servidor HTTP
        this.listenSocket(); 
        this.setupRoutes(); 
    }

    listenServer() {
        // Inicia o servidor na porta 3000 e exibe uma mensagem no console
        this.http.listen(3000, () => console.log('server is running'));
    }

    listenSocket() {
        // Configura o listener para conexões de socket
        this.io.on('connection', (socket) => {
            console.log('user connected =>', socket.id); // Exibe o ID do socket quando um usuário se conecta
        
            socket.on('message', (msg) => {
                this.io.emit('message', msg); // Emite a mensagem recebida 
            });
        });
    }

    setupRoutes() {
        // Configura a rota para a página inicial
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html')); 
        });
    }
}

const app = new App();
app.listenServer();