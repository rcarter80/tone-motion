const tm = new ToneMotion();
tm.debug = true;
tm.showConsoleOnLaunch = true;
tm.shouldSyncToServer = false; // to speed up load time while testing
tm.shouldTestOnDesktop = true;

window.onload = function() {
  tm.init();
};

// Cue number 0 sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  console.log('tm.cue[0].goCue() called');
};

// Test cues
tm.cue[1] = new TMCue('tilt', 1000, NO_LIMIT);
tm.cue[1].goCue = function() {
  console.log('tm.cue[1].goCue() called');
}

tm.cue[2] = new TMCue('tacet', 1000, NO_LIMIT);
tm.cue[2].goCue = function() {
  console.log('tm.cue[2].goCue() called');
}

tm.cue[3] = new TMCue('shake', 4000, NO_LIMIT);
tm.cue[3].goCue = function() {
  console.log('tm.cue[3].goCue() called');
}

tm.cue[4] = new TMCue('waiting', -1);
tm.cue[4].goCue = function() {
  console.log('tm.cue[4].goCue() called at ' + Date.now());
}
tm.cue[4].stopCue = function() {
  console.log('tm.cue[4].stopCue() called at ' + Date.now());
}

tm.cue[5] = new TMCue('tilt', 20000, 0);
tm.cue[5].goCue = function() {
  console.log('tm.cue[5].goCue() called at ' + Date.now());
}

tm.cue[7] = new TMCue('tilt', 1000, 500);
tm.cue[7].goCue = function() {
  console.log('tm.cue[7].goCue() called');
}

tm.cue[8] = new TMCue('listen', 500, 0);
tm.cue[8].goCue = function() {
  console.log('tm.cue[8].goCue() called');
}

tm.cue[9] = new TMCue('tiltAndShake', -1);
tm.cue[9].goCue = function() {
  console.log('tm.cue[9].goCue() called AS SOON AS I CAN at ' + Date.now());
}
