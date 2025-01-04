
const io = require('socket.io')(server);
io.on('connect', (socket) => {
  console.log(`New connection: ${socket.id}`);

  
  socket.on('message', (data) => {
      console.log(`New message from ${socket.id}: ${data}`);
  })
})
module.exports = io;