const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const sendButton = document.getElementById('send-button');

let localConnection;
let remoteConnection;
let localChannel;
let remoteChannel;

const servers = null;

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
            addMessage('Remote', e.data);
        };
    };

    localChannel.onmessage = e => {
        addMessage(nameInput.value || 'You', e.data);
    };

    localConnection.createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription));
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
        localChannel.send(message);
        addMessage(name, message);
        messageInput.value = '';
    }
});

createConnection();
