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
// wait time for every cue
var cueDelay = 1500;

// TODO: add "first cue has been triggered" boolean to test against and if not, ask user to go to server to trigger cue. otherwise latency appears very high on page load and first cue retrieved.

// *******************************************************************
// CUE 0: TACET
tm.cue[0] = new TMCue('tacet', cueDelay, NO_LIMIT);
tm.cue[0].goCue = function() {
  // TODO: added latency result function with warnings for high latency
  var timestamp = Date.now() - tm.clientServerOffset;
  tm.publicMessage('New cue number ' + this.cueOnClient + ' fetched from server at ' + timestamp + ' after being set on server at ' + tm.cueTimeFromServer + '. Total latency: ' + (timestamp - tm.cueTimeFromServer) + ' milliseconds.');
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
  // sound is full scale if phone is mostly upright. muted if upside down.
  if (tm.accel.y < 0.5) {
    claveLoop.volume.value = (tm.accel.y * 198 - 99);
  } else {
    claveLoop.volume.value = 0;
  }
  // pitch and speed go up on y-axis
  claveLoop.playbackRate = 0.1 + tm.accel.y * 2.9;
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
