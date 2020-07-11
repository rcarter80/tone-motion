const tm = new ToneMotion();
tm.debug = false;
tm.showConsoleOnLaunch = true;
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/test-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/test-server/current-cue');
  }
};

// Shortcuts to audio file paths
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';

// *******************************************************************
// CUE 0: TACET
tm.cue[0] = new TMCue('tacet', 1000, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicMessage('write diagnostic message to go here with latency result');
};
tm.cue[0].stopCue = function() {
  // nothing to do here?
};

// *******************************************************************
// CUE 1: TILT
var claveLoop = new Tone.Player(granulated_sounds + "claveLoop.mp3").toMaster();
claveLoop.loop = true;

tm.cue[1] = new TMCue('tilt', 1000, NO_LIMIT);
tm.cue[1].goCue = function() {
  claveLoop.start();
};
tm.cue[1].updateTiltSounds = function() {
  claveLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
};
tm.cue[1].stopCue = function() {
  claveLoop.stop();
};

// *******************************************************************
// CUE 2: SHAKE
var clave = new Tone.Player(perc_sounds + 'clave.mp3').toMaster();

tm.cue[2] = new TMCue('shake', 1000, NO_LIMIT);
tm.cue[2].goCue = function() {
  // nothing to play
};
tm.cue[2].triggerShakeSound = function() {
  clave.start();
};
tm.cue[2].stopCue = function() {
  // nothing to clean up
};
