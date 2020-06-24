const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let rooms = [];

app.use(express.static('.'));

app.get('/', (req,res) => {
    res.sendFile(__dirname+'/index.html')
});
io.on('connection', (socket) => {
    /**
     * Custom socket event to create a new room
     * We use the join method to add a room
     */
    socket.on('createRoom', (data) => {
       
        let roomId =getRoom();
        socket.join(roomName);
        socket.emit('newRoom',{name: data.name, room:roomName})
    });

    /**
     * Custom socket event to join a room
     * if room exists and has only one player then join room
     * else throw error
     */
    socket.on('joinRoom', (data) => {
        let room = io.nsps['/'].adapter.rooms[data.room];
        if( room && room.length == 1){
            socket.join(data.room);
            socket.to(data.room).emit('player1', {});
            socket.emit('player2', {name: data.name, room: data.room })
          }
          else {
            socket.emit('err', {message: 'Room not found or over capacity'});
          }
    });

    socket.on('play', (data) => {
        socket.to(data.room).emit('turnPlayed', {
            index: data.index,
            room: data.room
        });
    });
    socket.on('gameEnded', function(data){
        socket.to(data.room).emit('gameEnd', data);
    });

    socket.on('disconnect', (data) => {
        socket.broadcast.emit('closed',data.room);
    })
});

function getRoom(){
    const roomId = parseInt(Math.random()*Date.now()).toString().slice(0,8);

    if(rooms.indexOf(roomId) === -1) {
        rooms.push(roomId);
        return roomId;
    } 
    return getRoom();
}
server.listen(process.env.PORT || 5000);