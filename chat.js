const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const sendButton = document.getElementById('send-button');
const remoteNameInput = document.getElementById('remote-name-input'); // Added input for remote name

// STUN server configuration
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const NAME_TAG = 'name';
const MESSAGE_TAG = 'message';

let localUserName = 'You';
let remoteUserName = 'Remote'; // Default remote user name

let localConnection;
let remoteConnection;
let localChannel;
let remoteChannel;

function createConnection() {
    localConnection = new RTCPeerConnection(servers);
    remoteConnection = new RTCPeerConnection(servers);

    // Create data channel on local peer
    localChannel = localConnection.createDataChannel('chat');
    localChannel.onopen = () => console.log('Local data channel is open');
    localChannel.onmessage = e => handleMessage(e.data, 'local');

    // Set up data channel on remote peer
    remoteConnection.ondatachannel = event => {
        remoteChannel = event.channel;
        remoteChannel.onopen = () => console.log('Remote data channel is open');
        remoteChannel.onmessage = e => handleMessage(e.data, 'remote');
    };

    // ICE candidate exchange
    localConnection.onicecandidate = e => {
        if (e.candidate) {
            console.log('Local ICE candidate:', e.candidate);
            remoteConnection.addIceCandidate(e.candidate)
                .catch(err => console.error('Error adding ICE candidate on remote:', err));
        }
    };

    remoteConnection.onicecandidate = e => {
        if (e.candidate) {
            console.log('Remote ICE candidate:', e.candidate);
            localConnection.addIceCandidate(e.candidate)
                .catch(err => console.error('Error adding ICE candidate on local:', err));
        }
    };

    // Offer/Answer exchange
    localConnection.createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
        .catch(error => console.error('Error during offer/answer setup:', error));
}

function handleMessage(data, source) {
    try {
        const parsedData = JSON.parse(data);
        console.log(`Message from ${source}:`, parsedData);
        if (parsedData.type === NAME_TAG) {
            remoteUserName = parsedData.name; // Update remote user's name
        } else if (parsedData.type === MESSAGE_TAG) {
            addMessage(source === 'local' ? localUserName : remoteUserName, parsedData.message);
        }
    } catch (error) {
        console.error('Error parsing message data:', error);
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
    localUserName = nameInput.value || 'You'; // Update local user name
    if (message) {
        const messageData = JSON.stringify({ type: MESSAGE_TAG, name: localUserName, message });
        console.log('Sending message:', messageData);
        localChannel.send(messageData);
        addMessage(localUserName, message);
        messageInput.value = '';
    }
});

function sendName() {
    const name = nameInput.value || 'You';
    const nameData = JSON.stringify({ type: NAME_TAG, name });
    console.log('Sending name:', nameData);
    localChannel.send(nameData);
}

// Update remote user's name and notify the other peer
function updateRemoteName() {
    const newRemoteName = remoteNameInput.value || 'Remote';
    const nameData = JSON.stringify({ type: NAME_TAG, name: newRemoteName });
    console.log('Sending updated remote name:', nameData);
    localChannel.send(nameData);
}

createConnection();
sendName(); // Send initial local name

// Event listener to update remote name
remoteNameInput.addEventListener('change', updateRemoteName);
