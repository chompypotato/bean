const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const sendButton = document.getElementById('send-button');

let localConnection;
let remoteConnection;
let localChannel;
let remoteChannel;

const servers = null;
const NAME_TAG = "NAME";

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
            handleMessage(e.data);
        };
    };

    localChannel.onmessage = e => {
        handleMessage(e.data);
    };

    localConnection.createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription));
}

function handleMessage(data) {
    const [type, ...messageParts] = data.split(":", 2);
    const message = messageParts.join(":");
    if (type === NAME_TAG) {
        remoteUserName = message; // Update remote user's name
    } else {
        addMessage(type, message);
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
        localChannel.send(`${name}:${message}`);
        addMessage(name, message);
        messageInput.value = '';
    }
});

function sendName() {
    const name = nameInput.value || 'You';
    localChannel.send(`${NAME_TAG}:${name}`);
}

createConnection();
sendName();
