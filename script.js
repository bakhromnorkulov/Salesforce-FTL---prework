// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;
const TIME_LIMIT = 15;
const COLOR_CODES = {
  info: {color: "green"},
  warning: {color: "orange", threshold: WARNING_THRESHOLD},
  alert: {color: "red", threshold: ALERT_THRESHOLD}
};
const MAX_SCORE = 7;
const MAX_MISTAKE = 2;

//Global Variables
var pattern = [];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;
var mistakeCounter = 0;
var timePassed = 0;
var timeLeft = TIME_LIMIT;
var timerInterval = null;
var scoreCounter = 0;

//initialize color
setTimePathInitialColor(); 

//initialize timer
displayCountdownTimer(); 

//initialize score
displayScore(); 

//initialize mistakes
displayMistakes(); 

function generateRandomPattern(){
  
  //generate random pattern
  for (let i=1; i<=10; i++){
    
    //generate random number from 1 to 6
    var randomNumber = Math.floor(Math.random() * 6) + 1; 
    
    //append to pattern list
    pattern.push(randomNumber); 
  }
}

//Start the game
function startGame(){
  
  //initialize game variables
  pattern = [];
  progress = 0;
  timePassed = 0;
  mistakeCounter = 0;
  gamePlaying = true;
  scoreCounter = 0;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  
  //generate random pattern
  generateRandomPattern(); 
  displayScore();
  displayMistakes();
  playClueSequence();
}

//Stop the game
function stopGame(){
  gamePlaying = false;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  displayScore();
  displayMistakes();
  stopTimer();
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 250.1,
  6: 498.4
}

//Plays a tone for the amount of time specified
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}

//Tone will play
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}

//Tone will stop
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

//Show the image
function showImage(btn){
  var button = document.getElementById("button"+btn)
  
  //image source
  var imageSource = "url(https://cdn.glitch.global/e1c5f2fa-8135-4302-917f-aedd733f888d/img" + btn + ".jpg?v=1650498854334)";
  //show background image
  button.style.background = imageSource;  
}

//Hide the image
function hideImage(btn){
  var button = document.getElementById("button"+btn)
  
  //hide background image
  button.style.background = ""; 
}

//Remaining time
function formatTimeLeft(time){
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

//Display a message when finished
function displayCountdownTimer(){
  document.getElementById("base-timer-label").innerHTML = formatTimeLeft(timeLeft)
}

//Change the color based on the remaining time
function setTimePathInitialColor(){
  const {alert, warning, info} = COLOR_CODES;
  
  //change color from orange & red to green
  if (timeLeft <= alert.threshold){
    document.getElementById("base-timer-path-remaining").classList.remove(alert.color);
  }
  else if (timeLeft <= warning.threshold){
    document.getElementById("base-timer-path-remaining").classList.remove(warning.color);
  }
  document.getElementById("base-timer-path-remaining").classList.add(info.color);
}

function setRemainingPathColor(){
  const {alert, warning, info} = COLOR_CODES;
  
  //change color in particular time thresholds
  if (timeLeft <= alert.threshold){
    document.getElementById("base-timer-path-remaining").classList.remove(warning.color);
    document.getElementById("base-timer-path-remaining").classList.add(alert.color)
  }
  else if (timeLeft <= warning.threshold){
    document.getElementById("base-timer-path-remaining").classList.remove(info.color);
    document.getElementById("base-timer-path-remaining").classList.add(warning.color);
  }
}

function calculateTimeFraction(){
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray(){
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
}

function stopTimer(){
  //reset variables, color, and timer
  setTimePathInitialColor(timeLeft);
  timeLeft = TIME_LIMIT;
  timePassed = 0;
  displayCountdownTimer(timeLeft);
  clearInterval(timerInterval);
  setCircleDasharray();
}

function startTimer(){
  timerInterval = setInterval(() => {
    timePassed++;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTimeLeft(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
    if (timeLeft === 0){
      loseGame(scoreCounter);
    }
  }, 1000);
}

//Display the score
function displayScore(){
  if (!gamePlaying){
    scoreCounter = 0;
  }
  document.getElementById("score-counter").innerHTML = scoreCounter + " / " + MAX_SCORE;
}

//Display mistakes
function displayMistakes(){
  if (!gamePlaying){
    mistakeCounter = 0;
  }
  document.getElementById("mistake-counter").innerHTML = mistakeCounter + " / " + MAX_MISTAKE;
}

//Show image while onmousedown & hide when tone stops 
function playSingleClue(btn){
  if(gamePlaying){
    showImage(btn);
    playTone(btn,clueHoldTime);
    setTimeout(hideImage,clueHoldTime,btn);
  }
}

function playClueSequence(){
  guessCounter = 0;
  
  //set delay to initial wait time
  let delay = nextClueWaitTime; 
  
  //for each clue that is revealed so far
  for(let i=0; i<=progress; i++){ 
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    
    //set a timeout to play that clue
    setTimeout(playSingleClue,delay,pattern[i]) 
    delay += clueHoldTime 
    delay += cluePauseTime;
    
    //decrease clueHoldTime on each turn
    clueHoldTime -= 10; 
  }
  startTimer()
}

//Display Lose Game Message 
function loseGame(score){
  stopGame();
  alert("Game Over. You lost! Your score: " + score);
}

////Display Win Game Message 
function winGame(score){
  stopGame();
  alert("Game Over. You won! Your score: " + score);
}

function guess(btn){
  console.log("user guessed: " + btn);
  
  if(!gamePlaying){
    return;
  }
  
  if(pattern[guessCounter] == btn){
    
    //Guess was correct
    if(guessCounter == progress){
      if(progress == pattern.length - 1){
        
        //GAME OVER: WIN!
        scoreCounter = MAX_SCORE;
        displayScore();
        setTimeout(winGame, 250, scoreCounter);
        
      }else{
        
        //Pattern is correct. Add next segment
        progress++;
        scoreCounter++;
        stopTimer();
        displayScore();
        playClueSequence();
      }
    }else{
      
      //Cool. check the next guess
      guessCounter++;
    }
  }else{
    
    //Guess was incorrect. Increment mistake counter
    mistakeCounter++;
    displayMistakes();
    if (mistakeCounter >= MAX_MISTAKE){
      
      //more than 2 mistakes
     //GAME OVER: You Lost!
      
      setTimeout(loseGame, 250, scoreCounter);
    }
  }
}