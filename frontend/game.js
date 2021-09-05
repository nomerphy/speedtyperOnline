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
const timerHTML = document.querySelector('.timer')
const slash = document.querySelector('.slash')
const resultMenu = document.querySelector('.results')
const resultMenuStats = document.querySelector('.results__main')
const wpmHTML = document.querySelector('.wpm')
const accuracyHTML = document.querySelector('.accuracy')
const wpmRawHTML = document.querySelector('.raw__wpm')
const charactersHTML = document.querySelector('.characters')
const timeHTML = document.querySelector('.time')
const highScoreHTML = document.querySelector('.highscore')
const chart = document.querySelector('.chart')
const screenshotBtn = document.querySelector('.screenshot')
const wordsHistory = document.querySelector('.results__history')
const hintsContainer = document.querySelector('.hints');

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
        document.addEventListener('keyup', deleteLetterIndex)
        document.addEventListener('keydown', nextWordActive)
        document.addEventListener('keydown', startIntervalOnKey)
        textarea.addEventListener('input', addExtraLetter)
        textarea.addEventListener('input', checkIsWordCorrect)
        wordsAmount.classList.add('active')
        textarea.focus()
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

let playerIndex

window.requestAnimationFrame(function() {
  socket.on('player-number', function(playerNumber) {
    playerIndex = playerNumber
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

// start timer
let prevTime
let timed = false
let timerInterval

function startIntervalOnKey() {
  if (!timed) {
    timed = true
    prevTime = Date.now()
    timerInterval = setInterval(setTimer, 100)
  }
}

function setTimer() {
  const currentTime = Date.now() - prevTime
  const time = (currentTime / 1000).toFixed(3)
  timerHTML.textContent = time
}

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

  slashCoords()
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

  slashCoords()
}



// caret animation
function slashCoords() {
  const word = document.querySelector('.word.active') || wordsContainer.firstChild;
  const letter = word.children[letterIndex];
  const letterCoords = letter.getBoundingClientRect();

  slash.style.left = `${letterCoords.left}px`;
  slash.style.top = `${letterCoords.top}px`;
}

function checkIsWordCorrect() {
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

  // animate caret
  const letterCoords = letter.getBoundingClientRect();
  slash.classList.remove('animated');
  slash.style.left = `${letterCoords.right}px`;
  slash.style.top = `${letterCoords.top}px`;

  const lastWord = wordsContainer.lastChild

  if (lastWord.classList.contains('active') && letterIndex === lastWord.children.length) {
    endResult()
    clearInterval(timerInterval)
  }

  // check for space button on keyboard statement
}

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
    slashCoords()
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
    slashCoords()
    word.removeChild(word.lastChild)
  } else if (e.keyCode === 8 || e.keyCode === 46) {
    letterIndex--
    letterIndex = letterIndex <= 0 ? 0 : letterIndex
    const letter = word.children[letterIndex]
    letter.className = ''
    slashCoords()
  }
}

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

  slashCoords();
}

// end of test function
function endResult() {
  textarea.removeEventListener('input', checkIsWordCorrect)

  const timeContent = timerHTML.textContent
  const time = Number((timeContent / 60).toFixed(2))
  const letterLength = wordsContainer.querySelectorAll('span').length;
  const avgWords = wordsContainer.children.length;
  const avarageWordsAmount = (letterLength + wordIndex) / avgWords;
  const wpmRaw = ((letterLength + wordIndex) / avarageWordsAmount) / time;
  const correctLetters = wordsContainer.querySelectorAll('.correct').length;
  const incorrectLetters = wordsContainer.querySelectorAll('.incorrect').length;
  const extraLetters = wordsContainer.querySelectorAll('.extra').length;
  const rawAccuracy = (correctLetters / letterLength) * 100;
  const tooltipAccuracy = `${rawAccuracy.toString().slice(0, 5)}%`;
  const roundAccuracy = Math.round(rawAccuracy);
  const missedLetters = letterLength - (correctLetters + incorrectLetters);
  const wpm = (((letterLength + wordIndex) - (incorrectLetters + missedLetters + extraLetters)) / avarageWordsAmount) / time;
  const cpm = wpm * avarageWordsAmount;
  const roundedWPM = Math.round(wpm);
  const roundedWpmRaw = Math.round(wpmRaw);

  wpmHTML.textContent = roundedWPM;
  wpmHTML.setAttribute('data-tooltip', `${wpm.toFixed(2)} wpm (${cpm.toFixed(2)} cpm)`);

  wpmRawHTML.textContent = roundedWpmRaw;
  wpmRawHTML.setAttribute('data-tooltip', `${wpmRaw.toFixed(2)}`);

  charactersHTML.textContent = `${correctLetters + wordIndex}/${incorrectLetters}/${extraLetters}/${missedLetters}`;
  charactersHTML.setAttribute('data-tooltip', 'correct/incorrect/extra/missed');

  timeHTML.textContent = `${Number(timeContent).toFixed(0)}s`;
  timeHTML.setAttribute('data-tooltip', `${timeContent}s`);

  accuracyHTML.textContent = `${roundAccuracy}%`;
  accuracyHTML.setAttribute('data-tooltip', `${tooltipAccuracy}`);

  resultMenu.classList.add('active');

  //myChart.data.datasets[0].data = prevHighScore < wpm ? [roundedWPM, roundedWpmRaw, wpm.toFixed(0)] : [roundedWPM, roundedWpmRaw, Math.round(prevHighScore)];
  //myChart.update();

  randomHint();

  const containerWords = document.querySelectorAll('.word');
  containerWords.forEach((w) => {
    w.style.display = 'block';
  });

  wordsHistory.innerHTML = wordsContainer.innerHTML;
  setTimeout(() => {
    resultMenuStats.classList.add('active');
  }, 250);



  const playerObj = {
    playerIndex: playerIndex,
    playerTime: Number(timerHTML.textContent)
  }
  socket.emit('end-result', playerObj)
}

const hintsArray = [
  'Sit straight and remember to keep your back straight',
  'Keep your elbows bent at the right angle',
  'Face the screen with your head slightly tilted forward',
  'Keep at least 45 - 70 cm of distance between your eyes and the screen',
  'Еxpose the shoulder, arm, and wrist muscles to the least possible strain',
  'Hit keys only with the fingers for which they have been reserved',
  'Always return to the starting position of the fingers "ASDF – JKL;"',
  'When typing, imagine the location of the symbol on the keyboard',
  'Establish and maintain a rhythm while typing. Your keystrokes should come at equal intervals',
  'Use the thumb of whichever hand is more convenient for you to press the Space bar',
  'Take your time when typing to avoid mistakes',
  'Do not rush when you just started learning. Speed up only when your fingers hit the right keys out of habit',
  'Always scan the text a word or two in advance',
];

function randomHint() {
  const randomNumber = Math.floor(Math.random() * hintsArray.length);
  const hint = hintsArray[randomNumber];
  const hintContainer = document.querySelector('.hint');
  hintContainer.textContent = `Hint: ${hint}`;
}