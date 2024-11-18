const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(server);

app.use(cors({
    origin: 'https://myleschatapp.click', // Allow all origins, change this to a specific domain for production
}));
// Serve static files
app.use(express.static(__dirname));
app.use('/socket.io-client', express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));

// Serve index.html when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

const users = new Map();
const userColors = new Map();

// Socket.IO
io.on('connection', socket => {
    socket.on("new-user", data => {
        const username = data.user;
        const color = data.color;
        users.set(socket.id,username);
        userColors.set(username, color);
        socket.broadcast.emit("user-connected", {user:username, color:color});
    });
    socket.on('request-users',()=> {
        const usersArray = Array.from(users.values());
        const colorsObj = Object.fromEntries(userColors); // Convert Map to a plain object
        socket.emit('send-users',{users:usersArray, colors:colorsObj});
    });
    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", users.get(socket.id));
        users.delete(socket.id);
    });
    socket.on('sendmessage', message => {
        const username = users.get(socket.id);
        socket.broadcast.emit('message',{user:username, message:message, color:userColors.get(username)});
    });

});