const tm = new ToneMotion();
tm.debug = true;
tm.showConsoleOnLaunch = true;
// TODO: change back to shouldSyncToServer = true
tm.shouldSyncToServer = false; // to speed up load time while testing

window.onload = function() {
  tm.init();
};

// Instruments need global scope within this file
var synth = new Tone.Synth().toMaster();

var chimePlayer = new Tone.Players({
  "ch1654": "demo-assets/audio/chime-1654Hz-Ab6.mp3",
  "ch1661": "demo-assets/audio/chime-1661Hz-Ab6.mp3",
  "ch1748": "demo-assets/audio/chime-1748Hz-A6.mp3",
  "ch1929": "demo-assets/audio/chime-1929Hz-B6.mp3",
  "ch2417": "demo-assets/audio/chime-2417Hz-D7.mp3",
  "ch2568": "demo-assets/audio/chime-2568Hz-E7.mp3",
}).toMaster();
var chimeArray = ["ch1654", "ch1661", "ch1748", "ch1929", "ch2417", "ch2568"];

// Cue number 0 sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('tm.cue[0].goCue() called. Instrument setup could go here');
};

// Test cues
tm.cue[1] = new TMCue('tilt', 2000, 0);
tm.cue[1].goCue = function() {
  tm.publicLog('tm.cue[1].goCue() called.');

  synth.triggerAttackRelease("C4", 4);
}
tm.cue[1].updateTiltSounds = function() {
  // TODO: add pitch handling or filtering here?
}

tm.cue[2] = new TMCue('tacet', -1);
tm.cue[2].goCue = function() {
  tm.publicLog('tm.cue[2].goCue() called');
}

tm.cue[3] = new TMCue('shake', -1);
tm.cue[3].goCue = function() {
  // trigger random chime at beginning of SHAKE section
  var thisChime = chimeArray[Math.floor(Math.random()*chimeArray.length)];
  chimePlayer.get(thisChime).start();

  tm.publicLog('tm.cue[3].goCue() called');
}
tm.cue[3].triggerShakeSound = function() {
  // trigger random chime in response to shake gesture
  var thisChime = chimeArray[Math.floor(Math.random()*chimeArray.length)];
  chimePlayer.get(thisChime).start();

  tm.publicLog('Shake gesture triggered at ' + Date.now());
}

tm.cue[4] = new TMCue('finished', -1);
tm.cue[4].goCue = function() {
  tm.publicLog('The piece is done.');
}
