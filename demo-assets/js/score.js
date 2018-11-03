const tm = new ToneMotion();
tm.debug = true;
tm.showConsoleOnLaunch = true;
tm.shouldSyncToServer = true; // to speed up load time while testing

window.onload = function() {
  tm.init();
};

// Instruments need global scope within this file
var synth = new Tone.Synth().toMaster();

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
  tm.publicLog('tm.cue[3].goCue() called');
}
tm.cue[3].triggerShakeSound = function() {
  tm.publicLog('Shake gesture triggered at ' + Date.now());
  synth.triggerAttackRelease("C4", 0.25);
}

tm.cue[4] = new TMCue('finished', -1);
tm.cue[4].goCue = function() {
  tm.publicLog('The piece is done.');
}
