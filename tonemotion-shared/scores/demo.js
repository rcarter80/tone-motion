const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

// Shortcuts to audio file paths
const demo_sounds = 'tonemotion-shared/audio/demo/';

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// *******************************************************************
// CUE 1: Shake gesture triggering sounds that rotate through an array

// load sounds here
var triangle = new Tone.Player(demo_sounds + 'triangle.mp3').toMaster();
var meow = new Tone.Player(demo_sounds + 'meow.mp3').toMaster();

// fill array of sounds here
var soundArray = [triangle, meow];

// counter to rotate through array of sounds
var soundCounter = 0;

tm.cue[1] = new TMCue('shake', -1);

tm.cue[1].goCue = function() {
  soundCounter = 0;
};

tm.cue[1].triggerShakeSound = function() {
  // rotate through sounds in array
  soundArray[soundCounter % soundArray.length].start();
  // increment counter to keep track of what sound is next
  soundCounter++;
};

tm.cue[1].stopCue = function() {
  // stop all sounds at end of cue
  for (var i = 0; i < soundArray.length; i++) {
    soundArray[i].stop();
  }
};

// *******************************************************************
// CUE 2: no sound here
tm.cue[2] = new TMCue('tacet', -1);
tm.cue[2].goCue = function() {
  // nothing to play
}
tm.cue[2].stopCue = function() {
  // nothing to clean up
}
