import { io } from '/socket.io-client/socket.io.esm.min.js';

const socket = io('myleschatapp.click');

const loginButton = document.getElementById('login-button');
var userColor = 'blue';
var userColors = new Map();

loginButton.onclick = function () {
    loginButton.style.transform = 'scale(0.75)';
    loginButton.style.color = "white";

    let usernameInput = document.querySelector('.input #username');
    let username = usernameInput.value; 

    setTimeout(function() {
        loginButton.style.transform = 'scale(1)';
        loginButton.style.color = "black";
    }, 100);
        
    if (username != "") {
        userColor = document.getElementById('color').value;
        //addUser(username,userColor);
        socket.emit('new-user', {user:username, color:userColor});
        socket.emit('request-users');
        //Styling
        const loginBox = document.querySelector('.login-box');
        const chatBox = document.querySelector('.chat-box');
        const containerStyle = document.querySelector('.container').style;
        containerStyle.width = '100vw';            
        containerStyle.height = '100vh';
        containerStyle.borderRadius = '0px';
        loginBox.style.display = 'none';
        chatBox.style.display = 'flex';
    } else {
        usernameInput.style.border = '2px solid red';
    }
};

// Socket client functions
socket.on('user-connected', data => {
    const text = (data.user + " has connected");
    addConsoleMessage(text);
    addUser(data.user, data.color);
});
socket.on('user-disconnected', name => {
    if (name!= null){
        const text = (name + " has disconnected");
        addConsoleMessage(text);
        removeUser(name);
    }
});
socket.on('send-users', data => {
    const userColors = data.colors; // Plain object
    data.users.forEach(userName => {
        const color = userColors[userName];
        addUser(userName, color);
    });
});
socket.on('message', data => {
    const text = (`${data.user}: ${data.message}`);
    addOtherMessage(text, data.color);
});

const chatLog = document.querySelector('.chat-box .text')

function addUserMessage(messageText){
    const chatLog = document.querySelector('.text');
    const newMessage = document.createElement('div');
    newMessage.classList.add('selfMessage');
    const innerMessage = document.createElement('p');
    innerMessage.textContent = messageText;
    newMessage.appendChild(innerMessage);
    chatLog.appendChild(newMessage);
    //Styling
    const colors = getColor(userColor);
    newMessage.style.border = '2px solid '+colors[1];
    newMessage.style.background = colors[0];
    chatLog.scrollTop = chatLog.scrollHeight;
}

function addOtherMessage(messageText, otherColor){
    const chatLog = document.querySelector('.text');
    const newMessage = document.createElement('div');
    newMessage.classList.add('otherMessage');
    const innerMessage = document.createElement('p');
    innerMessage.textContent = messageText;
    newMessage.appendChild(innerMessage);
    chatLog.appendChild(newMessage);
    //Styling
    const colors = getColor(otherColor);
    newMessage.style.border = '2px solid '+colors[1];
    newMessage.style.background = colors[0];
    chatLog.scrollTop = chatLog.scrollHeight;
}

function addConsoleMessage(messageText){
    const chatLog = document.querySelector('.text');
    const newMessage = document.createElement('div');
    newMessage.classList.add('consoleMessage');
    const innerMessage = document.createElement('p');
    const text = "Console: "+messageText;
    innerMessage.textContent = text;
    newMessage.appendChild(innerMessage);
    chatLog.appendChild(newMessage);
    chatLog.scrollTop = chatLog.scrollHeight;
}
function getColor(color) {
    let background = 'lightblue';//Blue by default
    let border = "#06283A";
    switch (color) {
        case 'red':
            border = "#eb2020";
            background = "#b88181";
            break;
        case 'orange':
            border = 'rgb(255, 102, 0)';
            background = 'rgb(245, 143, 75)';
            break;
        case 'green':
            border = 'green';
            background = 'lightgreen';
            break;
        case 'blue':
            border = "#06283A";
            background = 'lightblue';
            break;
        case  'purple':
            border = 'rgb(61, 7, 61)';
            background = 'rgb(177, 54, 177)';
            break;
        default:
            console.warn(`Unexpected color: ${color}`);
    }
    return [background, border];
}
//Creates and styles user HTML element
function addUser(userName, color){
    const container = document.querySelector('.users');
    const userDiv = document.createElement('div');
    userDiv.classList.add('user');
    const userIcon = document.createElement('i');
    userIcon.classList.add('fa-solid', 'fa-user');
    const usernameText = document.createElement('p');
    usernameText.textContent = userName;
    userDiv.appendChild(userIcon);
    userDiv.appendChild(usernameText);
    container.appendChild(userDiv);
    //Styling
    const colors = getColor(color);
    userDiv.style.border = '3px solid '+colors[1];
    userDiv.style.background = colors[0];
}
//Removes first user from list based on name
function removeUser(name){
    const container = document.querySelector('.users');
    document.querySelectorAll('.user').forEach(user => {
        if (user.textContent == name) {
            user.remove();
            return;
        }
    });
}

//Client message sending
const messageInput = document.getElementById('textBox');
const sendButton = document.getElementById('sendButton');

// Function to handle message sending
function sendMessage() {
    const message = messageInput.value;
    if (message !== "") {
        sendButton.style.transform = 'scale(0.75)';
        sendButton.style.color = "white";
        setTimeout(function() {
            sendButton.style.transform = 'scale(1)';
            sendButton.style.color = "black";
        }, 200);
        
        // Emit message to the server
        socket.emit('sendmessage', message);
        //Display message locally
        addUserMessage("You: " + message);
        
        // Clear the input field
        messageInput.value = '';
    }
}

// Trigger sendMessage on button click
sendButton.onclick = sendMessage;

// Trigger sendMessage on Enter key press in the input field
messageInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        sendMessage();
    }
});

