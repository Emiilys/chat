const socket = io();  // Conectar ao servidor Socket.io

// Elementos do DOM
const usernameContainer = document.getElementById('username-container');  // Contêiner onde o nome do usuário será inserido
const usernameInput = document.getElementById('username');  // Input de nome de usuário
const usernameButton = document.getElementById('set-username');  // Botão para definir o nome

const roomSelection = document.getElementById('room-selection');  // Tela de seleção de salas
const chatContainer = document.getElementById('chat-container');  // Container do chat
const roomList = document.getElementById('room-list');  // Lista de salas
const createRoomButton = document.getElementById('create-room');  // Botão para criar nova sala
const sendButton = document.getElementById('send-button');  // Botão de envio de mensagem
const messageList = document.getElementById('messages');  // Lista de mensagens no chat
const input = document.getElementById('input');  // Campo de input de mensagem
const roomTitle = document.getElementById('room-title');  // Título da sala no chat

let currentRoom = "";  // Variável para armazenar a sala atual
let username = "";  // Variável para armazenar o nome do usuário

// Espera o DOM ser carregado completamente antes de adicionar eventos
document.addEventListener("DOMContentLoaded", () => {

    // Evento para definir o nome do usuário
    usernameButton.addEventListener('click', () => {
        const name = usernameInput.value.trim();  // Pega o nome inserido
        if (name) {
            username = name;  // Atribui o nome à variável username
            socket.emit('setUsername', username);  // Envia o nome para o servidor
            console.log(`Nome definido: ${username}`);

            // Oculta a tela de inserção do nome e exibe a tela de seleção de salas
            usernameContainer.style.display = 'none';
            roomSelection.style.display = 'block';
        } else {
            alert("Por favor, insira um nome.");  // Caso o nome esteja vazio, exibe um alerta
        }
    });

    // Evento para criar uma nova sala
    createRoomButton.addEventListener('click', () => {
        const roomName = prompt("Digite o nome da nova sala:");  // Solicita o nome da sala
        if (roomName) {
            const password = prompt("Digite a senha para a sala:");  // Solicita a senha para a sala
            socket.emit('createRoom', { roomName, password });  // Envia a criação da sala com nome e senha para o servidor
        }
    });

    // Evento para atualizar a lista de salas disponíveis
    socket.on('updateRooms', (rooms) => {
        roomList.innerHTML = '';  // Limpa a lista de salas
        rooms.forEach((room) => {
            const newRoom = document.createElement('li');  // Cria um novo item de sala na lista
            newRoom.textContent = room;  // Define o nome da sala
            newRoom.addEventListener('click', () => joinRoom(room));  // Adiciona evento de clique para entrar na sala
            roomList.appendChild(newRoom);  // Adiciona o item de sala na lista
        });
    });

    // Função para entrar em uma sala
    function joinRoom(roomName) {
        const password = prompt("Digite a senha para entrar na sala:");  // Solicita a senha da sala
        socket.emit('joinRoom', { roomName, password });  // Envia o nome da sala e a senha para o servidor
    }

    const leaveRoomButton = document.getElementById('leave-room');  // Botão de sair

    // Evento para o botão de sair
    leaveRoomButton.addEventListener('click', function () {
        if (currentRoom) {
            socket.emit('leaveRoom', currentRoom);  // Emite o evento para o servidor
            console.log(`Saindo da sala: ${currentRoom}`);
            chatContainer.style.display = 'none';  // Esconde a tela de chat
            roomSelection.style.display = 'block';  // Exibe a tela de seleção de salas
        }
    });

    // Evento para enviar mensagem
    sendButton.addEventListener('click', () => {
        const messageText = input.value;  // Pega o texto da mensagem
        if (messageText) {
            socket.emit('message', { room: currentRoom, text: messageText, sender: username });  // Envia a mensagem para o servidor
            input.value = '';  // Limpa o campo de input após o envio
        }
    });

    // Evento para receber mensagens
    socket.on('message', ({ text, sender }) => {
        const messageItem = document.createElement('li');  // Cria um novo item de mensagem
        messageItem.className = sender === username ? 'message-user' : 'message-other';  // Define a classe da mensagem
        messageItem.innerHTML = `<strong>${sender}:</strong> ${text}`;  // Adiciona o nome do remetente e o texto da mensagem
        messageList.appendChild(messageItem);  // Adiciona a mensagem à lista de mensagens
    });
});
