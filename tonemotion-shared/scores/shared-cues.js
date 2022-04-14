const tm = new ToneMotion();
tm.debug = false; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/shared-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/shared-server/current-cue');
  }
};

// cue label is within message container, but separate from message label that could show error messages, etc. cue label has HUGE font for showing cue number
const cue_label = document.querySelector('#cue_label');

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[0].cueTransition = function() {
  cue_label.innerHTML = '(1)';
  tm.setBackgroundPurple();
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 1: First section (struck glass sounds)
tm.cue[1] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[1].goCue = function() {
  cue_label.innerHTML = '1';
};
tm.cue[1].triggerShakeSound = function() {
};
tm.cue[1].cueTransition = function() {
  console.log('Cue 2 starting soon');
};
tm.cue[1].stopCue = function() {
};

// *******************************************************************
// CUE 2: tilt sparkly sounds that can be muted when phone is upright
tm.cue[2] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[2].goCue = function() {
  console.log('Current cue: 2');
};
tm.cue[2].updateTiltSounds = function() {
};
tm.cue[2].cueTransition = function() {
  console.log('Cue 3 starting soon');
};
tm.cue[2].stopCue = function() {
};

// *******************************************************************
// CUE 3: shake-triggered chimes with octaves selected by device position
tm.cue[3] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[3].goCue = function() {
  console.log('Current cue: 3');
};
tm.cue[3].triggerShakeSound = function() {
};
tm.cue[3].cueTransition = function() {
  console.log('Cue 4 starting soon');
};
tm.cue[3].stopCue = function() {
};

// *******************************************************************
// CUE 4: tilt octaves on D, F, E, A, Bb
tm.cue[4] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[4].goCue = function() {
  console.log('Current cue: 4');
};
tm.cue[4].updateTiltSounds = function() {
};
tm.cue[4].cueTransition = function() {
  console.log('Cue 5 starting soon');
};
tm.cue[4].stopCue = function() {
};

// *******************************************************************
// CUE 5: shake glass through array
tm.cue[5] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[5].goCue = function() {
  console.log('Current cue: 5');
};
tm.cue[5].triggerShakeSound = function() {
};
tm.cue[5].cueTransition = function() {
  console.log('Cue 6 starting soon');
};
tm.cue[5].stopCue = function() {
};

// *******************************************************************
// CUE 6: struck glass with variable delay on y-axis and pitch in 12 zones
tm.cue[6] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[6].goCue = function() {
  console.log('Current cue: 6');
};
tm.cue[6].updateTiltSounds = function() {
};
tm.cue[6].cueTransition = function() {
  console.log('Cue 7 starting soon');
};
tm.cue[6].stopCue = function() {
};

// *******************************************************************
// CUE 7: CODA only accessible through private server - play at end of perf.
tm.cue[7] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[7].goCue = function() {
  console.log('Current cue: 7');
};
tm.cue[7].triggerShakeSound = function() {
};
tm.cue[7].stopCue = function() {
};

// *******************************************************************
// CUE 8: turn off all sound (only accessible through private server)
tm.cue[8] = new TMCue('finished', -1);
tm.cue[8].goCue = function() {
  // nothing to do here
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9: tacet and shouldn't be used, but here to avoid errors
tm.cue[9] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[9].goCue = function() {
  // nothing to play
};
tm.cue[9].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// Tutorial cues are below. In concert, I need to cue server directly to cue 10, while cue 9 is used by non-interactive site for final sounds I want to keep these cues in this site but musicians won't actually need to do tutorials
// *******************************************************************
// CUE 10: piece is in "waiting" state by default
tm.cue[10] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[10].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[10].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 11: SHAKE tutorial
tm.cue[11] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[11].goCue = function() {
};
tm.cue[11].triggerShakeSound = function() {
};
tm.cue[11].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 12: tacet tutorial
tm.cue[12] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[12].goCue = function() {
  // nothing to play
};
tm.cue[12].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 13: TILT tutorial (volume and timbre on y-axis, pitch on x-axis)
tm.cue[13] = new TMCue('tilt', 0, NO_LIMIT);
tm.cue[13].goCue = function() {
};
tm.cue[13].updateTiltSounds = function() {
};
tm.cue[13].stopCue = function() {
};

// *******************************************************************
// CUE 14: sets status to 'waitingForPieceToStart'
// In performance, after tutorials, we'll arrive here, and then should go directly to cue 0 so that incrementing cue (e.g., with pedal) will start piece. OR I can set counter directly to 1 to begin piece. (Going from 14 - 'waiting' - to 0 - 'waiting' - is fine except that it clears the message that the piece will begin soon).
tm.cue[14] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[14].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[14].stopCue = function() {
  // nothing to clean up
};
