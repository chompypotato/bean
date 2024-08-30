const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const sendButton = document.getElementById('send-button');

let localConnection;
let remoteConnection;
let localChannel;
let remoteChannel;

const servers = null;
const NAME_TAG = 'name';
const MESSAGE_TAG = 'message';

let remoteUserName = 'Remote';

function createConnection() {
    localConnection = new RTCPeerConnection(servers);
    remoteConnection = new RTCPeerConnection(servers);

    localChannel = localConnection.createDataChannel('chat');
    console.log('Local channel created:', localChannel);

    remoteConnection.ondatachannel = e => {
        remoteChannel = e.channel;
        console.log('Remote channel received:', remoteChannel);
        remoteChannel.onmessage = e => {
            console.log('Received data from remote channel:', e.data);
            handleMessage(e.data, 'remote');
        };
    };

    localChannel.onmessage = e => {
        console.log('Received data from local channel:', e.data);
        handleMessage(e.data, 'local');
    };

    localConnection.onicecandidate = e => {
        if (e.candidate) {
            console.log('Sending ICE candidate:', e.candidate);
            remoteConnection.addIceCandidate(e.candidate)
                .catch(err => console.error('Error adding ICE candidate:', err));
        }
    };

    remoteConnection.onicecandidate = e => {
        if (e.candidate) {
            console.log('Sending ICE candidate:', e.candidate);
            localConnection.addIceCandidate(e.candidate)
                .catch(err => console.error('Error adding ICE candidate:', err));
        }
    };

    localConnection.createOffer()
        .then(offer => {
            console.log('Creating offer:', offer);
            return localConnection.setLocalDescription(offer);
        })
        .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
        .then(() => remoteConnection.createAnswer())
        .then(answer => {
            console.log('Creating answer:', answer);
            return remoteConnection.setLocalDescription(answer);
        })
        .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
        .catch(err => console.error('Error during connection setup:', err));
}

function handleMessage(data, source) {
    try {
        const parsedData = JSON.parse(data);
        console.log('Handling message:', parsedData);
        if (parsedData.type === NAME_TAG) {
            remoteUserName = parsedData.name;
            console.log(`Updated remote user name to: ${remoteUserName}`);
        } else if (parsedData.type === MESSAGE_TAG) {
            addMessage(source === 'local' ? 'You' : remoteUserName, parsedData.message);
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
    const name = nameInput.value || 'You';
    if (message) {
        const messageData = JSON.stringify({ type: MESSAGE_TAG, name, message });
        console.log('Sending message:', messageData);
        localChannel.send(messageData);
        addMessage(name, message);
        messageInput.value = '';
    }
});

function sendName() {
    const name = nameInput.value || 'You';
    const nameData = JSON.stringify({ type: NAME_TAG, name });
    console.log('Sending name:', nameData);
    localChannel.send(nameData);
}

createConnection();
sendName();
