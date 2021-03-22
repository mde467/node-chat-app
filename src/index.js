const path = require("path")
const http = require('http')
const express = require("express");
const socketio = require("socket.io")
const Filter = require('bad-words')
const {generateMessage, generateLocation, generateClientMessage} = require("./utils/messages");
const { addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users");
const app = express()
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT  || 3000;
const publicDir = path.join(__dirname , "../public");

app.use(express.static(publicDir))

io.on('connection', function(socket) {
    socket.on('join', (options, callback)=>{
        const {error, user}= addUser({id:socket.id, ...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('serverMessage', generateMessage("Welcome!"))
        socket.broadcast.to(user.room).emit('serverMessage', generateMessage(
            `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room : user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    
    socket.on('sendMessage', function(msg, callback) {
        const user = getUser(socket.id);
        const filter = new Filter()
        if(filter.isProfane(msg))
        {
            return callback("Avoid using bad words");
        }
        io.emit('message', generateClientMessage(user.username,msg) )
        callback()
    });

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user)
        {
            io.emit('serverMessage', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id);
        const locationURL = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
        io.emit('locationMessage', generateLocation(user.username, locationURL)) 
        callback("location shared")
    })
});

server.listen(port, ()=>{
    console.log("app is lstening at port " + port);
})