const {instrument} = require('@socket.io/admin-ui')

const io = require('socket.io')(3000, {
    cors: {
        origin: ["http://localhost:8080", "https://admin.socket.io"],
    },
})
const Users = {}

const userIo = io.of('/user')

userIo.on('connection', Uname => {
    console.log("connected to user namespace with username " + Uname.username)
})

userIo.use((socket, next) => {
    if (socket.handshake.auth.token){
        socket.username = getUsernameFromToken(socket.handshake.auth.token)
        next()
    }else{
        next(new Error('Please send token'))
    }
})

function getUsernameFromToken(token){
    return token
}

io.on('connection', socket => {
    socket.on('new-user-joined', name=>{
        Users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
    })
    socket.on('send-message', (message, room) => {
        if(room === ""){
            socket.broadcast.emit('receive-message', {message: message, name: Users[socket.id]})
        }else{
            socket.to(room).emit('receive-message', {message: message, name: Users[socket.id]})
        }
    })

    socket.on('join-room', (room, cb) => {
        socket.join(room)
        cb(`Joined ${room}`)
    })

    socket.on('ping', n => console.log(n))
})

instrument(io, {auth: false})