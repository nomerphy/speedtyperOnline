let remoteGame = null
let localGame = null

let wordIndex = 0
let letterIndex = null
letterIndex = letterIndex <= 0 ? 0 : letterIndex
const socket = io.connect(window.location.origin)

let wordsArray

const wordsContainer = document.querySelector('.words__container')
const textarea = document.querySelector('.words__textarea')
const wordsAmount = document.querySelector('.words__counter h1')

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

// loader animation
const altText = document.querySelector('.waiting-message p')

const move = ms => new Promise(resolve => setTimeout(resolve, ms))

async function startWriting() {
  const strings = ['Waiting for Player 2',
   'Tired?',
   'Waiting for Opponent',
   'He is coming',
   'Waiting for Player 2',
   'How are you today?',
   'Waiting for Noob',
   'Wpm 200?',
   '1vs1 noob?'
   ]

  while(altText) {
    for (let i = 0; i < strings.length; ++i) {
      const string = strings[i]
      await write(string)
      await move(750)
      await erase()
      await move(750)
    }
  }
}

async function erase() {
  while (altText.textContent.length) {
    await move(100)
    altText.textContent = altText.textContent.substring(0, altText.textContent.length -1)
  }
}

async function write(text) {
  let index = null

  while(index < text.length) {
    index++
    await move(100)
    altText.textContent = text.substring(0, index)
  }
}

startWriting()


function deployWords(words) {
  words.forEach((word) => {
    const wordItem = document.createElement('p')
    wordItem.className = 'word'
    const letters = word.split('')

    letters.forEach((letter) => {
      const letterItem = document.createElement('span')
      letterItem.textContent = letter
      wordItem.appendChild(letterItem)
      wordsContainer.append(wordItem)
      wordsContainer.firstChild.classList.add('active')
    })
  })
}

// add extra letter function

function addExtraLetter() {
  const word = document.querySelector('.word.active') || wordsContainer.firstChild
  const prevLength = word.children.length
  if (letterIndex >= prevLength) {
    const span = document.createElement('span')
    span.className = 'extra';
    span.innerHTML = textarea.value
    word.appendChild(span)
  }
}

textarea.addEventListener('input', addExtraLetter)

function checkIsWordCorrect() {
  console.log('checking');
  const word = document.querySelector('.word.active') || wordsContainer.firstChild
  const letter = word.children[letterIndex]
  const letterContent = letter.innerHTML || letter.textContent || letter.innerText
  clearWordsArea()

  if (textarea.value.trim('') === letterContent) {
    letterIndex++
    letter.classList.add('correct')
    textarea.value = ''
  } else if (textarea.value === ' ') {
    return false
    textarea.value = ''
  } else {
    letterIndex++
    letter.classList.add('incorrect')
    textarea.value = ''
  }

  const lastWord = wordsContainer.lastChild

  if (lastWord.classList.contains('active') && letterIndex === lastWord.children.length) {
    console.log('end of test')
    // endResult()
    // clearInterval(timerInterval)
  }

  // check for space button on keyboard statement
}

textarea.addEventListener('input', checkIsWordCorrect)

// make next word active function
function nextWordActive(e) {
  const word = document.querySelector('.word.active') || wordsContainer.firstChild
  const wordsLength = wordsContainer.children.length

  if (e.keyCode === 32) {
    wordIndex++
    const currentWord = wordsContainer.children[wordIndex]
    currentWord.classList.add('active')
    word.classList.remove('active')
    letterIndex = 0
    textarea.value = ''

    for (let i = 0; i < word.children.length; ++i) {
      if (word.children[i].classList.contains('incorrect') || word.children[i].classList.contains('extra')) {
        word.classList.add('word__incorrect')
      }
    }
  }

  wordsAmount.textContent = `${wordIndex} / ${wordsLength}`
}

// delete letter index function
function deleteLetterIndex(e) {
  const word = document.querySelector('.word.active') || wordsContainer.firstChild
  if (word.lastChild.classList.contains('extra') && e.keyCode === 8) {
    letterIndex--
    letterIndex = letterIndex <= 0 ? 0 : letterIndex
    word.removeChild(word.lastChild)
  } else if (e.keyCode === 8 || e.keyCode === 46) {
    letterIndex--
    letterIndex = letterIndex <= 0 ? 0 : letterIndex
    const letter = word.children[letterIndex]
    letter.className = ''
  }
}

document.addEventListener('keyup', deleteLetterIndex)
document.addEventListener('keydown', nextWordActive)

// clear words area
function clearWordsArea() {
  const wordsContainerLength = wordsContainer.children.length;
  const wordsContainerChildren = wordsContainer.children;
  if (wordsContainerLength > 10 && wordsContainerChildren[11].classList.contains('active')) {
    for (let i = 0; i <= 10; ++i) {
      wordsContainerChildren[i].style.display = 'none';
    }
  } else if (wordsContainerLength > 20 && wordsContainerChildren[21].classList.contains('active')) {
    for (let i = 10; i <= 20; ++i) {
      wordsContainerChildren[i].style.display = 'none';
    }
  } else if (wordsContainerLength > 30 && wordsContainerChildren[31].classList.contains('active')) {
    for (let i = 20; i <= 30; ++i) {
      wordsContainerChildren[i].style.display = 'none';
    }
  } else if (wordsContainerLength > 40 && wordsContainerChildren[41].classList.contains('active')) {
    for (let i = 30; i <= 40; ++i) {
      wordsContainerChildren[i].style.display = 'none';
    }
  } else if (wordsContainerLength > 50 && wordsContainerChildren[51].classList.contains('active')) {
    for (let i = 40; i <= 50; ++i) {
      wordsContainerChildren[i].style.display = 'none';
    }
  } else if (wordsContainerLength > 60 && wordsContainerChildren[61].classList.contains('active')) {
    for (let i = 50; i <= 60; ++i) {
      wordsContainerChildren[i].style.display = 'none';
    }
  } else if (wordsContainerLength > 70 && wordsContainerChildren[71].classList.contains('active')) {
    for (let i = 60; i <= 70; ++i) {
      wordsContainerChildren[i].style.display = 'none';
    }
  }

  //slashCoords();
}