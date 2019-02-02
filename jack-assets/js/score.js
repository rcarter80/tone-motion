const tm = new ToneMotion();
tm.debug = true;
tm.showConsoleOnLaunch = true;
// set to false to speed up load time while testing
tm.shouldSyncToServer = false;

window.onload = function() {
  tm.init();
};

// Instruments need global scope within this file
var synth = new Tone.Synth().toMaster();
var chimeSynth = new Tone.MetalSynth().toMaster();

// Granulator
var c1_granulatorGrainSize = 0.1; // WAS 0.125 determines how often .scrub() is called. actual grain size is longer
var c1_granulator = new Tone.GrainPlayer({
  "url": "demo-assets/audio/c1_grFileB.mp3",
  "overlap": 0.01,
  "grainSize": c1_granulatorGrainSize * 2,
  "loop": true,
  "detune": 0
}).toMaster();
var c1_granulatorOffset = 8.5; // subsequent scrub positions set interactively in updateSoundsInCue4() below
var c1_granulatorDur = 22;

// Chime player
var chimePlayer = new Tone.Players({
  "ch1654": "demo-assets/audio/chime-1654Hz-Ab6.mp3",
  "ch1661": "demo-assets/audio/chime-1661Hz-Ab6.mp3",
  "ch1748": "demo-assets/audio/chime-1748Hz-A6.mp3",
  "ch1929": "demo-assets/audio/chime-1929Hz-B6.mp3",
  "ch2417": "demo-assets/audio/chime-2417Hz-D7.mp3",
  "ch2568": "demo-assets/audio/chime-2568Hz-E7.mp3",
}).toMaster();
var chimeArray = ["ch1654", "ch1661", "ch1748", "ch1929", "ch2417", "ch2568"];

var vibeE4 = new Tone.Player("jack-assets/audio/vibe-E4.mp3").toMaster();
var vibeD5 = new Tone.Player("jack-assets/audio/vibe-D5.mp3").toMaster();
var vibeB5 = new Tone.Player("jack-assets/audio/vibe-B5.mp3").toMaster();
var vibeGsharp6 = new Tone.Player("jack-assets/audio/vibe-Gsharp6.mp3").toMaster();
var vibesArray = [vibeE4, vibeB5, vibeD5, vibeGsharp6];

// Cue number 0 sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('tm.cue[0].goCue() called. Instrument setup could go here');
};

// Tutorial cues: cue 1 is tilt tutorial
tm.cue[1] = new TMCue('tilt', -1);
tm.cue[1].goCue = function() {
  tm.publicLog('tm.cue[1].goCue() called.');

  Tone.Transport.scheduleRepeat(function(time) {
    // GrainPlayer may not be ready for .scrub(). Catch InvalidStateError
    // Known issue - if try fails, the grain player still scrubs but detune is reset to 0
    try { c1_granulator.seek(c1_granulatorOffset); } catch(e) { console.log(e); }
  }, c1_granulatorGrainSize);
}
tm.cue[1].updateTiltSounds = function() {
  if (tm.accel.y < 0.33) {
    c1_granulator.volume.value = -60 + (60 * (tm.accel.y * 3));
  }
  else {
    c1_granulator.volume.value = 0;
  }
  // .seek() invoked by .scheduleRepeat()
  c1_granulatorOffset = tm.accel.x * c1_granulatorDur;
}
tm.cue[1].stopCue = function() {
  Tone.Transport.cancel(); // cancel granulator repeat
  tm.publicLog('tm.cue[1].stopCue() called.');
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
};
tm.cue[3].triggerShakeSound = function() {
  // trigger random chime in response to shake gesture
  var thisChime = chimeArray[Math.floor(Math.random()*chimeArray.length)];
  chimePlayer.get(thisChime).start();

  tm.publicLog('Shake gesture triggered at ' + Date.now());
};

// Cue number 4 sets status to 'waitingForPieceToStart'
tm.cue[4] = new TMCue('waiting', -1);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// Actual beginning of piece, but first section is tacet
tm.cue[5] = new TMCue('tacet', -1);
tm.cue[5].goCue = function() {
  tm.publicLog('The piece has started.');
};

// Warping shake chimes
tm.cue[6] = new TMCue('shake', 1579, NO_LIMIT); // 4 beats @ 152bpm
tm.cue[6].goCue = function() {
  // todo trigger flourish of vibes on first downbeat of section
  var thisVibe = vibesArray[Math.floor(Math.random()*vibesArray.length)];
  thisVibe.start();
};
tm.cue[6].triggerShakeSound = function() {
  var thisVibe = vibesArray[Math.floor(Math.random()*vibesArray.length)];
  thisVibe.start();
};

// TODO: update number of final cue
tm.cue[999] = new TMCue('finished', -1);
tm.cue[999].goCue = function() {
  tm.publicLog('The piece is done.');
}
