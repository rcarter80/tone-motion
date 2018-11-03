const tm = new ToneMotion();
tm.debug = true;
tm.showConsoleOnLaunch = true;
tm.shouldSyncToServer = false; // to speed up load time while testing

window.onload = function() {
  tm.init();
  tm.testWithoutMotion();
};

// Cue number 0 sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('tm.cue[0].goCue() called. Instrument setup could go here');
};

// Test cues
tm.cue[1] = new TMCue('tilt', -1);
tm.cue[1].goCue = function() {
  tm.publicLog('tm.cue[1].goCue() called');
}
tm.cue[1].updateTiltSounds = function() {
  statusLabel.innerHTML = 'updateTiltSounds() called at ' + Date.now() + ' with value of ' + tm.xSig.value;
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
}

tm.cue[4] = new TMCue('waiting', -1);
tm.cue[4].goCue = function() {
  tm.publicLog('tm.cue[4].goCue() called at ' + Date.now());
}
tm.cue[4].stopCue = function() {
  tm.publicLog('tm.cue[4].stopCue() called at ' + Date.now());
}

tm.cue[5] = new TMCue('tiltAndShake', 2000, 0);
tm.cue[5].goCue = function() {
  tm.publicLog('tm.cue[5].goCue() called at ' + Date.now());
}

tm.cue[7] = new TMCue('listen', 1000, 500);
tm.cue[7].goCue = function() {
  tm.publicLog('tm.cue[7].goCue() called');
}

tm.cue[8] = new TMCue('listen', 0, 0);
// this cue is impossible to make on time and will throw missed cue

tm.cue[9] = new TMCue('finished', -1);
tm.cue[9].goCue = function() {
  tm.publicLog('The piece is done.');
}
