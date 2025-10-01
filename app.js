var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let users = {};
let userCount = 0;

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   console.log('A user connected:', socket.id);

   // Handle user joining
   socket.on('user joined', function(username) {
      users[socket.id] = username;
      userCount++;
      
      console.log(`${username} joined the chat`);
      
      // Broadcast to all clients that a user joined
      socket.broadcast.emit('user joined', { username: username });
      
      // Send updated user count to all clients
      io.emit('online users', userCount);
   });

   // Handle chat messages
   socket.on('chat message', function(data) {
      console.log(`${data.username}: ${data.message}`);
      
      // Broadcast the message to all clients
      io.emit('chat message', data);
   });

   // Handle typing indicators
   socket.on('typing', function(username) {
      socket.broadcast.emit('typing', username);
   });

   socket.on('stop typing', function() {
      socket.broadcast.emit('stop typing');
   });

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      const username = users[socket.id];
      if (username) {
         console.log(`${username} disconnected`);
         
         delete users[socket.id];
         userCount--;
         
         // Broadcast to all clients that a user left
         socket.broadcast.emit('user left', { username: username });
         
         // Send updated user count to all clients
         io.emit('online users', userCount);
      }
   });
});

http.listen(3001, function() {
  console.log('listening on *:3001');
});
