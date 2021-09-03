let remoteGame = null
let localGame = null
const socket = io.connect(window.location.origin)

let wordsArray

const wordsContainer = document.querySelector('.words__container');

function startGame() {
  let seconds = 3
  const intervalId = setInterval(function() {
  seconds--
  countdownMessage(true, seconds)

  if (seconds == 0) {
    clearInterval(intervalId)
    countdownMessage(false, 0)

    if (remoteGame !== null && localGame !== null) {
        localGame.restart()
    } else {
        deployWords(wordsArray)
    }
	}
	}, 1000)
}

function messageVisibility(className, show) {
  const messageContainer = document.querySelector(className)
  messageContainer.style.display = show ? 'flex' : 'none'
}

function waitingPlayerTwo(show) {
  messageVisibility('.waiting-message', show)
}

function gameFull() {
  messageVisibility('.game-full', true)
}

function countdownMessage(show, number) {
  messageVisibility('.countdown-message', show)

  const countdownNumber = document.querySelector('.countdown-number')
  countdownNumber.textContent = number
}

window.requestAnimationFrame(function() {
  socket.on('player-number', function(playerNumber) {
    if (playerNumber == 1) {
      waitingPlayerTwo(true)
      socket.on('player-connect', function() {
      waitingPlayerTwo(false)
      startGame()
    })

    } else if (playerNumber === -1) {
      gameFull()
   } else {
      startGame()
    }
  })

  socket.on('send-words', function(words) {
    wordsArray = words
  })

  socket.on('player-disconnect', function(playerIndex) {
    console.log(`${playerIndex} has disconnected`)
  })
})

function deployWords(words) {
  words.forEach((word) => {
    const wordItem = document.createElement('p')
    wordItem.className = 'word'
    const letters = word.split('')

    letters.forEach((letter) => {
      const letterItem = document.createElement('span')
      letterItem.textContent = letter
      wordItem.appendChild(letterItem)
      wordsContainer.appendChild(wordItem)
    })
  })
}