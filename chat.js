const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const sendButton = document.getElementById('send-button');

let localConnection;
let remoteConnection;
let localChannel;
let remoteChannel;

const servers = null;
let remoteUserName = 'Remote'; // Default remote name

function createConnection() {
    localConnection = new RTCPeerConnection(servers);
    remoteConnection = new RTCPeerConnection(servers);

    localChannel = localConnection.createDataChannel('chat');
    remoteChannel = remoteConnection.createDataChannel('chat');

    localConnection.onicecandidate = e => {
        if (e.candidate) {
            remoteConnection.addIceCandidate(e.candidate);
        }
    };

    remoteConnection.onicecandidate = e => {
        if (e.candidate) {
            localConnection.addIceCandidate(e.candidate);
        }
    };

    remoteConnection.ondatachannel = e => {
        remoteChannel = e.channel;
        remoteChannel.onmessage = e => {
            handleMessage(JSON.parse(e.data));
        };
    };

    localChannel.onmessage = e => {
        handleMessage(JSON.parse(e.data));
    };

    localConnection.createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription));
}

function handleMessage(data) {
    if (data.type === 'name') {
        remoteUserName = data.name; // Update remote user's name
    } else if (data.type === 'message') {
        addMessage(data.name, data.message);
    }
}

function addMessage(name, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${name}: ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    const name = nameInput.value || 'You';
    if (message) {
        const messageData = JSON.stringify({ type: 'message', name, message });
        localChannel.send(messageData);
        addMessage(name, message);
        messageInput.value = '';
    }
});

function sendName() {
    const name = nameInput.value || 'You';
    const nameData = JSON.stringify({ type: 'name', name });
    localChannel.send(nameData);
}

createConnection();
sendName();
