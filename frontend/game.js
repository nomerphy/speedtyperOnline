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
const hintsContainer = document.querySelector('.hints')
const popUp = document.querySelector('.pop__up');
const popUpText = document.querySelector('.pop__up-text');
const altText = document.querySelector('.alt-text')
const prevHighScore = localStorage.getItem('highscore')
const fullscreenBtn = document.querySelector('.fullscreenBtn')
const animationContainer = document.querySelector('.animation__container')

//themes
const themeChanger = document.querySelector('.theme__changer')
const themePicker = document.querySelector('.words__themePicker')
const themePickerBg = document.querySelector('.words__themePicker-bg')
const findTheme = document.querySelector('.findTheme')
const randomThemeBtn = document.querySelector('.randomThemeBtn')

  const successIcon = `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60ZM45.7591 21.8542C46.5237 21.0571 46.4973 19.791 45.7002 19.0264C44.903 18.2618 43.637 18.2881 42.8723 19.0853L26.1252 36.5449L17.3897 28.0977C16.5956 27.3299 15.3295 27.3512 14.5617 28.1452C13.7938 28.9392 13.8151 30.2054 14.6091 30.9732L24.7882 40.8163C25.1706 41.186 25.6844 41.3882 26.2161 41.3782C26.7479 41.3682 27.2537 41.1468 27.6219 40.763L45.7591 21.8542Z" fill="#222222" />
      </svg>`
const errorIcon = `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30 0C13.4583 0 0 13.4583 0 30C0 46.5417 13.4583 60 30 60C46.5417 60 60 46.5417 60 30C60 13.4583 46.5417 0 30 0ZM42.1336 38.5985C42.6219 39.0866 42.6219 39.8781 42.1336 40.3663L40.3664 42.1336C39.8781 42.6217 39.0868 42.6217 38.5985 42.1336L30 33.5352L21.4015 42.1337C20.9132 42.6218 20.1219 42.6218 19.6336 42.1337L17.8663 40.3663C17.378 39.8782 17.378 39.0867 17.8663 38.5985L26.4648 29.9999L17.8663 21.4014C17.378 20.9133 17.378 20.1218 17.8663 19.6336L19.6336 17.8662C20.1219 17.3781 20.9132 17.3781 21.4015 17.8662L30 26.4647L38.5985 17.8662C39.0868 17.3781 39.8781 17.3781 40.3664 17.8662L42.1337 19.6336C42.622 20.1217 42.622 20.9132 42.1337 21.4014L33.5352 29.9999L42.1336 38.5985Z" fill="#222222"/>
</svg>`

let confettiDuration

function startGame() {
  const countdownMessageLine = document.querySelector('.countdown-message__line')
  altText.classList.add('active')
  let seconds = 11
  const intervalId = setInterval(function() {
  seconds--
  countdownMessage(true, seconds)
  countdownMessageLine.style.width = `${seconds * 10}%`

  if (seconds < 2) {
    animationContainer.classList.add('active')
  }

  if (seconds === 3) {
    createAudioCountdown()
  }

  if (seconds == 0) {
    clearInterval(intervalId)
    countdownMessage(false, 0)

    if (remoteGame !== null && localGame !== null) {
        localGame.restart()
    } else {
        deployWords(wordsArray)
        wordsContainer.classList.add('active')
        document.addEventListener('keyup', deleteLetterIndex)
        document.addEventListener('keydown', nextWordActive)
        document.addEventListener('keydown', startIntervalOnKey)
        textarea.addEventListener('input', addExtraLetter)
        textarea.addEventListener('input', checkIsWordCorrect)
        wordsAmount.classList.add('active')
        wordsAmount.textContent = 'Start!'
        textarea.focus()
        slashCoords()
    }
  }
  }, 1000)
}

function createAudioCountdown() {
  const audioArray = ['./audio/racecountdown.mp3']
  const randomAudio = Math.floor(Math.random(audioArray))
  const audio = new Audio()
  audio.src = audioArray[randomAudio]
  audio.volume = 0.1
  audio.play()
}

function messageVisibility(className, show) {
  const messageContainer = document.querySelector(className)
  // messageContainer.style.display = show ? 'flex' : 'none'
  const isShow = show ? messageContainer.classList.add('active') : messageContainer.classList.remove('active')
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
    console.log(playerIndex)
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

  socket.on('winner', (winner) => {
    if (winner === Number(playerIndex)) {
      popUpText.textContent = 'You win!'
      popUp.insertAdjacentHTML('afterbegin', successIcon)
      popUp.classList.add('active')
      popUpInterval = setInterval(changePopUpLine, 25)
      confettiDuration = Date.now() + 4000
      startConfetti()

      const audiosArray = ['./audio/win1.wav', './audio/win2.wav', './audio/win3.mp3']
      const randomAudio = Math.floor(Math.random() * audiosArray.length)

      const audio = new Audio()
      audio.src = audiosArray[randomAudio]
      audio.volume = 0.1
      audio.play()
    } else {
      popUp.insertAdjacentHTML('afterbegin', errorIcon)
      popUpText.textContent = 'You lose!'
      popUp.classList.add('active')
      popUpInterval = setInterval(changePopUpLine, 25)
    }
  })
})

// loader animation
const move = ms => new Promise(resolve => setTimeout(resolve, ms))

async function startWriting() {
  const strings = [
    'Waiting for Player 2',
   'Tired?',
   'Check your layout',
   'Waiting for Opponent',
   'You are beautiful',
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
      await move(1000)
      await erase()
      await move(1000)
    }
  }
}

async function erase() {
  while (altText.textContent.length) {
    await move(125)
    altText.textContent = altText.textContent.substring(0, altText.textContent.length -1)
  }
}

async function write(text) {
  let index = null

  while(index < text.length) {
    index++
    await move(125)
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
  const word = document.querySelector('.word.active') || wordsContainer.firstChild
  const letter = word.children[letterIndex] || word.firstChild
  const letterCoords = letter.getBoundingClientRect()

  slash.style.left = `${letterCoords.left}px`
  slash.style.top = `${letterCoords.top}px`
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

// chart.js
const myChart = new Chart(chart, {
  type: 'bar',
  data: {
    labels: ['wpm', 'raw wpm', 'highscore'],
    datasets: [{
      data: [],
      backgroundColor: [
        '#686de0',
        '#5f27cd',
        '#00b894',
      ],
      borderColor: [
        '#555',
        '#555',
        '#555',
      ],
      borderWidth: 1,
    }],
  },
  options: {
    legend: {
      display: false,
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
        },
      }],
    },
  },
});

Chart.defaults.global.defaultFontFamily = getComputedStyle(document.body).fontFamily;

// end of test function
function endResult() {
  textarea.removeEventListener('input', checkIsWordCorrect)
  textarea.removeEventListener('blur', addBlurEffect);

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

  myChart.data.datasets[0].data = prevHighScore < wpm ? [roundedWPM, roundedWpmRaw, wpm.toFixed(0)] : [roundedWPM, roundedWpmRaw, Math.round(prevHighScore)];
  myChart.update();

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
    playerIndex: Number(playerIndex),
    info: {
      wpm: roundedWPM,
      mistakes: incorrectLetters + extraLetters + missedLetters,
      accuracy: roundAccuracy,
      time: Number(timeContent)
    }

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

const themesArray = [
  'original_light',
  'original_dark',
  'obelix',
  'olive_fern',
  'slighter',
  'oceanic',
  'neon',
  'react',
  'dangeon',
  'python',
  'javascript',
  'strawberry_fields',
  'sky',
  'plastic_tree',
  'brownie',
  'sea_gradient',
  'salmon',
  'mud_racer',
  'creamy',
  'lifestyle',
  'innocence',
  'twitch',
  'joker',
  'forest',
  'sapphire',
  'vanilla',
  'radiance',
  'faceit',
  'steam',
  'peachy',
  'spaceless',
  'sun',
  'lilac',
  'esmeralda',
  'matrix',
  'gardenia',
  'syneva',
  'vibe',
  'moonlight',
  'yellowstone',
  'cobalt',
  'led_zeppelin',
  'greenwild',
]

// random themes
function checkTheme() {
  const currentTheme = null
  if (currentTheme === null) {
    const randomThemeNum = Math.floor(Math.random() * themesArray.length);
    document.body.className = themesArray[randomThemeNum];
    themeChanger.textContent = themesArray[randomThemeNum];
    Chart.defaults.global.defaultFontColor = getComputedStyle(document.body).getPropertyValue('--background');
  } else {
    document.body.className = currentTheme;
    themeChanger.textContent = currentTheme;
    Chart.defaults.global.defaultFontColor = getComputedStyle(document.body).getPropertyValue('--background');
  }
}

document.addEventListener('DOMContentLoaded', checkTheme);

// words history
function toggleWordHistory() {
  hintsContainer.classList.toggle('active')
  wordsHistory.classList.toggle('active')
}

document.querySelector('.history').addEventListener('click', toggleWordHistory)

// Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

// blur effect
function addBlurEffect() {
  document.querySelector('.words__blurred').classList.add('active');
  wordsContainer.classList.add('blurred');
  slash.classList.remove('animated');
  slash.style.opacity = '0';
}

function removeBlurEffect() {
  document.querySelector('.words__blurred').classList.remove('active');
  document.querySelector('.words__textarea').focus();
  wordsContainer.classList.remove('blurred');
  slash.classList.add('animated');
  slash.style.opacity = '1';
}

textarea.addEventListener('blur', addBlurEffect);
textarea.addEventListener('focus', removeBlurEffect);

// check for capsLock
function checkCapsLock(event) {
  const string = String.fromCharCode(event.keyCode);
  const capsLockKey = document.querySelector('.caps__lock-key');

  if ((string.toUpperCase().replace(/[,.;:=+?!1234567890/|]/g, '').trim(' ') === string) !== event.shiftKey) {
    capsLockKey.classList.add('active');
  } else {
    capsLockKey.classList.remove('active');
  }
}
document.addEventListener('keypress', checkCapsLock);

function checkCapsLockOnKeyDown(event) {
  const capsLockKey = document.querySelector('.caps__lock-key');
  if (event.keyCode === 20) {
    capsLockKey.classList.toggle('active');
  }
}

document.addEventListener('keydown', checkCapsLockOnKeyDown);

// popup
const popUpLine = document.querySelector('.pop__up-line')
let popUpCounter = 100
let popUpInterval

function changePopUpLine() {
  popUpCounter--
  popUpLine.style.width = `${popUpCounter}%`

  if (popUpCounter === 0) {
    clearInterval(popUpInterval)
    popUpCounter = 100
    popUp.classList.remove('active')
    popUpText.textContent = ''
    setTimeout(() => {popUpLine.style.width = '100%'}, 350)
  }
}


// screenshot function
function saveScreenshot() {
  domtoimage.toPng(resultMenuStats).then((dataUrl) => {
    const img = document.createElement('img');
    img.src = dataUrl;

    try {
      fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        window.navigator.clipboard.write([
          new ClipboardItem({
            'image/png' : blob
          })
        ])
      })

      popUpText.textContent = 'Copied!'
      popUp.classList.add('active')
      popUpInterval = setInterval(changePopUpLine, 25)
    } catch (err) {
      window.open(img);
    }
  });
}

screenshotBtn.addEventListener('click', saveScreenshot);

// tooltip
let tooltipElement

function showTooltip(event) {
  const { target } = event
  const tooltipHTML = target.dataset.tooltip
  if (!tooltipHTML) return false
  tooltipElement = document.createElement('div')
  tooltipElement.className = 'tooltip'
  tooltipElement.innerHTML = tooltipHTML
  document.body.appendChild(tooltipElement)

  const tooltipCoords = target.getBoundingClientRect()
  let left = tooltipCoords.left + (target.offsetWidth - tooltipElement.offsetWidth) / 2
  if (left < 0) left = 0

  let top = tooltipCoords.top - tooltipElement.offsetHeight - 10
  if (top < 0) {
    top = tooltipCoords.top + target.offsetHeight + 10
  }

  tooltipElement.style.left = `${left}px`
  tooltipElement.style.top = `${top}px`
}

document.addEventListener('mouseover', showTooltip)

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.remove()
    tooltipElement = null
  }
}

document.addEventListener('mouseout', hideTooltip)

// confetti
const confettiColors = ['#badc58', '#ffffff', '#f9ca24', '#d63031']

function startConfetti() {
  confetti({
    particleCount: 2,
    angle: 60,
    spread: 200,
    origin: { y: 0 },
    colors: confettiColors,
  });

  confetti({
    particleCount: 2,
    angle: 120,
    spread: 200,
    origin: { y: 0 },
    colors: confettiColors,
  });

  if (Date.now() < confettiDuration) {
    requestAnimationFrame(startConfetti);
  }
}