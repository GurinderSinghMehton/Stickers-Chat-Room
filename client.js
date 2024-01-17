import {io} from "socket.io-client"

const messageContainer = document.getElementById("message-container")
const form = document.getElementById("form")
const messageInput = document.getElementById("message-input")
const roomInput = document.getElementById("room-input")
const joinRoomButton = document.getElementById("room-button")

var audio = new Audio('sounds/msg (2).wav');

const userName = prompt("Enter Your name");


const socket = io('http://localhost:3000')
const userSocket = io('http://localhost:3000/user', {auth: {token: userName}})


socket.on('connect', ()=>{
  displayMessage(`${userName} connected`, 'right')
})

socket.emit('new-user-joined', userName);

userSocket.on('connect_error', error => {    
    displayMessage(error, 'right');
})

socket.on('receive-message', message =>{
    displayMessage(`${message.name}: ${message.message}`, 'left')
})

socket.on('user-connected', userName => {
  displayMessage(`${userName} connected`, 'new-join');
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const message = messageInput.value
  const room = roomInput.value
  if(message === "") return
  displayMessage(`You: ${message}`, 'right')
  socket.emit('send-message', message, room)
  messageInput.value = ""
})

joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value
    socket.emit('join-room', room, message => {
        join(message, 'room-join')
    })
})

function displayMessage(message, position){
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  if(position =='left'){ 
    audio.play();
  }
}

function join(message, Class){
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageElement.classList.add('message');
  messageElement.classList.add(Class);
  messageContainer.append(messageElement);
}

let count = 0
setInterval(() => {
    socket.emit('ping', ++count)
}, 1000)

document.addEventListener('keydown', e => {
    if(e.target.matches('input')) return
    if(e.key === 'c') socket.connect()
    if(e.key === 'd') socket.disconnect()
})