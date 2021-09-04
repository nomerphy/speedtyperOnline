const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const app = express()
const server = http.Server(app)
const io = socketio(server)

app.use(express.static('frontend'))


// connect to JSON database words
const databaseWords = require('./words.json')

// variables
let emptyArray = []
let wordsArray = []

server.listen(3000, console.log('server started'))

const connections = [null, null]

io.on('connection', function(socket) {
let playerIndex = -1

  for (let i in connections) {
    if (connections[i] === null) {
      playerIndex = i
    }
  }

  socket.emit('player-number', playerIndex)

  if (playerIndex == -1) return

  if (playerIndex == 1) {
    createWordsArray(databaseWords[0], emptyArray, wordsArray)

    setTimeout(() => {
      emptyArray = []
      wordsArray = []
    }, 5000)
  }

  connections[playerIndex] = socket
  socket.broadcast.emit('player-connect', playerIndex)

  socket.on('disconnect', function() {
      console.log(`Player ${playerIndex} disconnected`)
      socket.broadcast.emit('player-disconnect', playerIndex)
      connections[playerIndex] = null
  })

  io.emit('send-words', wordsArray)
})

function createWordsArray(data, arr, container) {
  const wordsAmountArray = [10, 15, 20, 25, 30, 35, 40, 45, 50]
  const randomTotalNumber = Math.floor(Math.random() * wordsAmountArray.length)

  const wordsTotal = wordsAmountArray[randomTotalNumber]

  for (let a in data) {
    let value = data[a]
    arr.push(value)
  }

  arr = arr.reduce((a, b) => a.concat(b))

  for (let i = 0; i < wordsTotal; i++) {
    const randomNum = Math.floor(Math.random() * arr.length)
    container.push(arr[randomNum])
  }
}