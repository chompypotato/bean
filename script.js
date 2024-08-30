let userName = '';

// Set name functionality
document.getElementById('setNameButton').addEventListener('click', function() {
    const nameInput = document.getElementById('nameInput').value.trim();

    if (nameInput === '') {
        alert('Please enter a name.');
        return;
    }

    userName = nameInput;
    document.getElementById('nameInput').value = '';
    document.getElementById('nameSection').style.display = 'none'; // Hide name input section after setting the name
});

// Send message functionality
document.getElementById('sendButton').addEventListener('click', function() {
    if (userName === '') {
        alert('Please set your name first.');
        return;
    }

    const messageInput = document.getElementById('messageInput').value.trim();
    
    if (messageInput === '') {
        alert('Please enter a message.');
        return;
    }

    const chatBox = document.getElementById('chatBox');

    // Create a new message element
    const messageElement = document.createElement('div');
    messageElement.textContent = `${userName}: ${messageInput}`;
    chatBox.appendChild(messageElement);

    // Clear the message input
    document.getElementById('messageInput').value = '';
    
    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
});
