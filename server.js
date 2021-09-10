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

let playerOneWmp, playerTwoWmp, playerOneMistakes, playerTwoMistakes, playerOneAccuracy, playerTwoAccuracy, playerOneTime, playerTwoTime, winnerIndex
let winningCount = 0
let endPlayerCount = 0

function createWordsArray(data, arr, container) {
  //const wordsAmountArray = [10, 15, 20, 25, 30, 35, 40, 45, 50]
  const wordsAmountArray = [10, 15]
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
    createWordsArray(databaseWords, emptyArray, wordsArray)

    setTimeout(() => {
      emptyArray = []
      wordsArray = []
    }, 7000)
  }

  connections[playerIndex] = socket
  socket.broadcast.emit('player-connect', playerIndex)

  socket.on('end-result', function(data) {
    console.log(data)
    if (data.playerIndex == 0) {
      playerOneWmp = data.info.wpm
      playerOneMistakes = data.info.mistakes
      playerOneAccuracy = data.info.accuracy
      playerOneTime = data.info.time
      endPlayerCount++
    }

    if (data.playerIndex == 1) {
      playerTwoWmp = data.info.wpm
      playerTwoMistakes = data.info.mistakes
      playerTwoAccuracy = data.info.accuracy
      playerTwoTime = data.info.time
      endPlayerCount++
    }

    if (endPlayerCount === 2) {
       checkForWinner()
       //socket.broadcast.emit('winner', winnerIndex)
       io.emit('winner', winnerIndex)
       console.log(`winningCount ${winningCount}`)
       console.log(winnerIndex)

       setTimeout(() => {
        endPlayerCount = 0
        winningCount = 0
        winnerIndex = 0
       }, 1000)
    }

    // console.log(`Player one wmp : ${playerOneWmp}`)
    // console.log(`Player two wmp : ${playerTwoWmp}`)
  })

  socket.on('disconnect', function() {
      console.log(`Player ${playerIndex} disconnected`)
      socket.broadcast.emit('player-disconnect', playerIndex)
      connections[playerIndex] = null
  })

  let playerOneProgress, playerTwoProgress, playerOneCurrentWpm, playerTwoCurrentWpm

  socket.on('player-progress', function(progress) {
    if (progress.playerIndex == 0) {
      playerOneProgress = (progress.wordIndex / progress.wordLength) * 100
      playerOneCurrentWpm = progress.currentWpm
    }

    if (progress.playerIndex == 1) {
      playerTwoProgress = (progress.wordIndex / progress.wordLength) * 100
      playerTwoCurrentWpm = progress.currentWpm
    }

    const progressObj = {
      playerOneProgress: playerOneProgress,
      playerOneCurrentWpm: playerOneCurrentWpm,
      playerTwoProgress: playerTwoProgress,
      playerTwoCurrentWpm: playerTwoCurrentWpm
    }
    io.emit('send-progress', progressObj)
  })

  io.emit('send-words', wordsArray)
})

// winningCount
function checkForWinner() {
  if (playerOneWmp > playerTwoWmp) {
    winningCount -= 1
  } else if (playerOneWmp === playerTwoWmp) {
    winningCount += 0
  } else {
    winningCount += 1
  }

  if (playerOneMistakes < playerTwoMistakes) {
    winningCount -= 2
  } else if (playerOneMistakes === playerTwoMistakes) {
    winningCount += 0
  } else {
    winningCount += 2
  }

  if (playerOneAccuracy > playerTwoAccuracy) {
    winningCount -= 1.5
  } else if (playerOneAccuracy === playerTwoAccuracy) {
    winningCount += 0
  } else {
    winningCount += 1.5
  }

  if (playerOneTime < playerTwoTime) {
    winningCount -= 2
  } else if (playerOneTime === playerTwoTime) {
    winningCount += 0
  } else {
    winningCount += 2
  }

  const winner = winningCount < 0 ? 0 : 1

  winnerIndex = winner
}
