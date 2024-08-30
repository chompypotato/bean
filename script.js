// Load messages from local storage and display them
function loadMessages() {
    const chatBox = document.getElementById('chatBox');
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    
    chatBox.innerHTML = '';
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.name}: ${msg.text}`;
        chatBox.appendChild(messageElement);
    });
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
}

// Save message to local storage
function saveMessage(name, text) {
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages.push({ name, text });
    localStorage.setItem('messages', JSON.stringify(messages));
}

// Set name functionality
document.getElementById('setNameButton').addEventListener('click', function() {
    const nameInput = document.getElementById('nameInput').value.trim();
    if (nameInput === '') {
        alert('Please enter a name.');
        return;
    }
    localStorage.setItem('userName', nameInput);
    document.getElementById('nameSection').style.display = 'none'; // Hide name input section after setting the name
    loadMessages(); // Load existing messages
});

// Send message functionality
document.getElementById('sendButton').addEventListener('click', function() {
    const name = localStorage.getItem('userName');
    if (!name) {
        alert('Please set your name first.');
        return;
    }

    const messageInput = document.getElementById('messageInput').value.trim();
    if (messageInput === '') {
        alert('Please enter a message.');
        return;
    }

    saveMessage(name, messageInput);
    document.getElementById('messageInput').value = '';
    loadMessages(); // Load and display the updated messages
});

// Initial load
loadMessages();
