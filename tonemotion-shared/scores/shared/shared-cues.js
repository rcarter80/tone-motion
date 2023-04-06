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

// simple way to display cue number. If I ever use this in another piece, I can fold this into the tonemotion source file
function displayCueNumber(cue) {
  tm.publicMessage('');
  let message;
  if (pieceStartedAtTime) {
    // Cue 1 has been triggered at least once, so piece has officially begun
    let time = tm.currentCue.startedAt - pieceStartedAtTime;
    let minutes = Math.floor(time / 60000);
    let seconds = Math.floor((time - (minutes * 60000)) / 1000);
    let formattedSeconds = seconds.toString().padStart(2, '0')
    message = `${cue}<br><span style="font-size:75%">Time: ${minutes}'${formattedSeconds}"</span>`;
  } else {
    // piece hasn't officially begun (maybe it's a rehearsal)
    message = cue;
  }
  cue_label.innerHTML = message;
}

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
  cue_label.innerHTML = '';
};
tm.cue[0].cueTransition = function() {
  displayCueNumber('(1)');
  tm.setBackgroundPurple();
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 1: First section (struck glass sounds)
// once cue 1 is triggered for first time, record time that piece began
let pieceStartedAtTime = undefined;
tm.cue[1] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[1].goCue = function() {
  if (!pieceStartedAtTime) {
    pieceStartedAtTime = tm.currentCue.startedAt;
    console.log('Piece started at ' + pieceStartedAtTime);
  }
  displayCueNumber('1');
};
tm.cue[1].triggerShakeSound = function() {
};
tm.cue[1].cueTransition = function() {
  displayCueNumber('(2)');
  tm.setBackgroundPurple();
};
tm.cue[1].stopCue = function() {
};

// *******************************************************************
// CUE 2: tilt sparkly sounds that can be muted when phone is upright
tm.cue[2] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[2].goCue = function() {
  displayCueNumber('2');
};
tm.cue[2].updateTiltSounds = function() {
};
tm.cue[2].cueTransition = function() {
  displayCueNumber('(3)');
  tm.setBackgroundPurple();
};
tm.cue[2].stopCue = function() {
};

// *******************************************************************
// CUE 3: shake-triggered chimes with octaves selected by device position
tm.cue[3] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[3].goCue = function() {
  displayCueNumber('3');
};
tm.cue[3].triggerShakeSound = function() {
};
tm.cue[3].cueTransition = function() {
  displayCueNumber('(4)');
  tm.setBackgroundPurple();
};
tm.cue[3].stopCue = function() {
};

// *******************************************************************
// CUE 4: tilt octaves on D, F, E, A, Bb
tm.cue[4] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[4].goCue = function() {
  displayCueNumber('4');
};
tm.cue[4].updateTiltSounds = function() {
};
tm.cue[4].cueTransition = function() {
  displayCueNumber('(5)');
  tm.setBackgroundPurple();
};
tm.cue[4].stopCue = function() {
};

// *******************************************************************
// CUE 5: shake glass through array
tm.cue[5] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[5].goCue = function() {
  displayCueNumber('5');
};
tm.cue[5].triggerShakeSound = function() {
};
tm.cue[5].cueTransition = function() {
  displayCueNumber('(6)');
  tm.setBackgroundPurple();
};
tm.cue[5].stopCue = function() {
};

// *******************************************************************
// CUE 6: struck glass with variable delay on y-axis and pitch in 12 zones
tm.cue[6] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[6].goCue = function() {
  displayCueNumber('6');
};
tm.cue[6].updateTiltSounds = function() {
};
tm.cue[6].cueTransition = function() {
  displayCueNumber('(7)');
  tm.setBackgroundPurple();
};
tm.cue[6].stopCue = function() {
};

// *******************************************************************
// CUE 7: CODA only accessible through private server - play at end of perf.
// For San Diego version, musicians will join audience on phone for cue 7
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const misc_sounds = 'tonemotion-shared/audio/misc/';
// chime tuned to 4th partial above A (220Hz)
var chP4 = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
var chP4b = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
var chP6 = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
var chP6b = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
var chP7 = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
var chP7b = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
var chP10 = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toDestination();
var chP10b = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toDestination();
var chP13 = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
var chP13b = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
var chP14 = new Tone.Player(chime_sounds + "chimeBeats3080Hz.mp3").toDestination();
// same chime sounds starting at 2 oct lower playback rate and bending up
var chLoP4 = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
// use fade out to prevent clicking at end of sound
chLoP4.fadeOut = 5;
var chLoP4b = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
chLoP4b.fadeOut = 5;
var chLoP6 = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
chLoP6.fadeOut = 5;
var chLoP6b = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
chLoP6b.fadeOut = 5;
var chLoP7 = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
chLoP7.fadeOut = 5;
var chLoP7b = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
chLoP7b.fadeOut = 5;
var chLoP10b = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toDestination();
chLoP10b.fadeOut = 5;
var chLoP13 = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
chLoP13.fadeOut = 5;
var chLoP13b = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
chLoP13b.fadeOut = 5;
var chLoP14 = new Tone.Player(chime_sounds + "chimeBeats3080Hz.mp3").toDestination();
chLoP14.fadeOut = 5;

var c7_drop = new Tone.Player(misc_sounds + "finalDrop.mp3").toDestination();

var c7_chimeArr = [chP10, chP7, chP14, chP4, chP13, chP6, chP4b, chP6b, chP10b, chP13b, chP7b];
// array of playback rates that represent targets of pitch bends
var c7_chBendArr = [1.031786, 1.020448, 1.07714, 0.9921, 1.03789, 1.05824, 0.9921, 1.05824, 1.031786, 1.03789, 1.020448];
var c7_chLoArr = [chLoP7, chLoP14, chLoP4, chLoP13, chLoP6, chLoP4b, chLoP6b, chLoP10b, chLoP13b];
// low chimes start 2 oct lower but bend up to 1 oct lower than high chimes
var c7_chLoBendArr = [0.510224, 0.53857, 0.49605, 0.518945, 0.52912, 0.49605, 0.52912, 0.515893, 0.518945];

var c7_chCount, c7_chIndex, c7_thisCh, c7_chLoIndex, c7_thisLoCh;
var c7_chArrLen = c7_chimeArr.length;
var c7_chLoArrLen = c7_chLoArr.length;

tm.cue[7] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[7].goCue = function() {
  // for cue display interface
  displayCueNumber('7');

  // for actual chime sounds that musicians play
  c7_chCount = 0;
  c7_chLoCount = 0;
};
tm.cue[7].triggerShakeSound = function() {
  // no sound until final "drop" sound 3.25 seconds into cue
  if (tm.getElapsedTimeInCue(7) > 3250) {
    // set pitch and properties of lower chime
    c7_chLoIndex = c7_chCount % c7_chLoArrLen;
    c7_thisLoCh = c7_chLoArr[c7_chLoIndex];
    c7_thisLoCh.playbackRate = tm.getSectionBreakpoints(7, [0,0.25, 15000,0.25, 45000,c7_chLoBendArr[c7_chLoIndex]]);
    c7_thisLoCh.volume.value = tm.getSectionBreakpoints(7, [0, -24, 60000, -24, 90000, -99]);
    c7_thisLoCh.start();
    // set pitch and properties of higher chime triggered just after low
    c7_chIndex = c7_chCount % c7_chArrLen;
    c7_thisCh = c7_chimeArr[c7_chIndex];
    c7_thisCh.playbackRate = tm.getSectionBreakpoints(7, [0,1, 15000,1, 45000,c7_chBendArr[c7_chIndex]]);
    c7_thisCh.volume.value = tm.getSectionBreakpoints(7, [0, -18, 60000, -18, 90000, -99]);
    c7_thisCh.start('+0.05');
    // increment counter used by BOTH chime layers
    c7_chCount++;
  }
};
tm.cue[7].stopCue = function() {
};

// *******************************************************************
// CUE 8: turn off all sound (only accessible through private server)
tm.cue[8] = new TMCue('finished', -1);
tm.cue[8].goCue = function() {
  cue_label.innerHTML = '';
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9: tacet and shouldn't be used, but here to avoid errors
tm.cue[9] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[9].goCue = function() {
  cue_label.innerHTML = '';
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
  cue_label.innerHTML = '';
};
tm.cue[10].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 11: SHAKE tutorial
tm.cue[11] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[11].goCue = function() {
  cue_label.innerHTML = '';
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
  cue_label.innerHTML = '';
};
tm.cue[12].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 13: TILT tutorial (volume and timbre on y-axis, pitch on x-axis)
tm.cue[13] = new TMCue('tilt', 0, NO_LIMIT);
tm.cue[13].goCue = function() {
  cue_label.innerHTML = '';
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
  cue_label.innerHTML = '';
};
tm.cue[14].stopCue = function() {
  // nothing to clean up
};
