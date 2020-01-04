const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/seth-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/seth-server/current-cue');
  }
};

// Shortcuts to audio file paths
// TODO: delete unused paths
const cello_sounds = 'tonemotion-shared/audio/cello/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const glass_sounds = 'tonemotion-shared/audio/glass/';
const piano_sounds = 'tonemotion-shared/audio/piano/';
const glock_sounds = 'tonemotion-shared/audio/glockenspiel/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';

// Instruments need global scope within this file, but can appear just above the first cue in which they sound
Tone.Transport.bpm.value = 69;

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// *******************************************************************
// CUE 1: tilt tutorial
// Test tone for "tilt" tutorial
var testToneFilter = new Tone.Filter(440, "lowpass").toMaster();
var testTone = new Tone.Synth({
  oscillator: {
    type: "sawtooth"
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.9,
    release: 0.1
  }
}).connect(testToneFilter);
testTone.volume.value = -12; // The music is not very loud, so let's encourage people to turn up volume.
var testToneFreqScale = new Tone.Scale(440, 880); // scales control signal (0.0 - 1.0)
var testToneFilterScale = new Tone.Scale(440, 10000);
xTilt.chain(testToneFreqScale, testTone.frequency); // ctl sig is mapped to freq
yTilt.chain(testToneFilterScale, testToneFilter.frequency);
tm.cue[1] = new TMCue('tilt', -1);
tm.cue[1].goCue = function() {
  testTone.triggerAttack(440);
}
tm.cue[1].updateTiltSounds = function() {
  // interactivity handled through tm.xTilt and yTilt signals
}
tm.cue[1].stopCue = function() {
  testTone.triggerRelease();
}

// *******************************************************************
// CUE 2: tacet tutorial
tm.cue[2] = new TMCue('tacet', -1);
tm.cue[2].goCue = function() {
  // nothing to play
}
tm.cue[2].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 3: shake tutorial
var cowbell = new Tone.Player(perc_sounds + 'cowbell.mp3').toMaster();
tm.cue[3] = new TMCue('shake', -1);
tm.cue[3].goCue = function() {
  // nothing to do until shake gestures
};
tm.cue[3].triggerShakeSound = function() {
  cowbell.start();
};
tm.cue[3].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 4: sets status to 'waitingForPieceToStart'
tm.cue[4] = new TMCue('waiting', -1);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[4].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 5: Actual beginning of piece, but first section is tacet
tm.cue[5] = new TMCue('tacet', -1);
tm.cue[5].goCue = function() {
  if (tm.debug) { tm.publicLog('The piece has started.'); }
};
tm.cue[5].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 6: [A1] Shaking bells through predefined pitch array (with looped tail)
var glFsharp3 = new Tone.Player(glock_sounds + "glockFsharp3.mp3").toMaster();
// load same audio file into second buffer to allow retrigger without artifact
// NOTE: octaves are actually one octave higher
var glFsharp3b = new Tone.Player(glock_sounds + "glockFsharp3.mp3").toMaster();
var glG3 = new Tone.Player(glock_sounds + "glockG3.mp3").toMaster();
var glG3b = new Tone.Player(glock_sounds + "glockG3.mp3").toMaster();
var glA3 = new Tone.Player(glock_sounds + "glockA3.mp3").toMaster();
var glA3b = new Tone.Player(glock_sounds + "glockA3.mp3").toMaster();
var glB3 = new Tone.Player(glock_sounds + "glockB3.mp3").toMaster();
var glB3b = new Tone.Player(glock_sounds + "glockB3.mp3").toMaster();
var glCsharp4 = new Tone.Player(glock_sounds + "glockCsharp4.mp3").toMaster();
var glCsharp4b = new Tone.Player(glock_sounds + "glockCsharp4.mp3").toMaster();
var glD4 = new Tone.Player(glock_sounds + "glockD4.mp3").toMaster();
var glD4b = new Tone.Player(glock_sounds + "glockD4.mp3").toMaster();
var glE4 = new Tone.Player(glock_sounds + "glockE4.mp3").toMaster();
var glE4b = new Tone.Player(glock_sounds + "glockE4.mp3").toMaster();
var glFsharp4 = new Tone.Player(glock_sounds + "glockFsharp4.mp3").toMaster();
var glFsharp4b = new Tone.Player(glock_sounds + "glockFsharp4.mp3").toMaster();
var glG4 = new Tone.Player(glock_sounds + "glockG4.mp3").toMaster();
var glG4b = new Tone.Player(glock_sounds + "glockG4.mp3").toMaster();
var glA4 = new Tone.Player(glock_sounds + "glockA4.mp3").toMaster();
var glA4b = new Tone.Player(glock_sounds + "glockA4.mp3").toMaster();
var glB4 = new Tone.Player(glock_sounds + "glockB4.mp3").toMaster();
var glB4b = new Tone.Player(glock_sounds + "glockB4.mp3").toMaster();
var glCsharp5 = new Tone.Player(glock_sounds + "glockCsharp5.mp3").toMaster();
var glCsharp5b = new Tone.Player(glock_sounds + "glockCsharp5.mp3").toMaster();
var glD5 = new Tone.Player(glock_sounds + "glockD5.mp3").toMaster();
var glD5b = new Tone.Player(glock_sounds + "glockD5.mp3").toMaster();
var glA5 = new Tone.Player(glock_sounds + "glockA5.mp3").toMaster();
var glA5b = new Tone.Player(glock_sounds + "glockA5.mp3").toMaster();
var chA6lo = new Tone.Player(chime_sounds + "chime-1748Hz-A6.mp3").toMaster();
var chA6hi = new Tone.Player(chime_sounds + "chime-1772Hz-A6.mp3").toMaster();


var counterCue6 = 0;
// initial array of pitches triggered
var pitchArrayCue6 = [glG3, glG4, glB3, glB4, glG3b, glG4b, glB3b, glB4b, glFsharp3, glFsharp4, glFsharp3b, glFsharp4b, glCsharp4, glCsharp5, glCsharp4b, glCsharp5b, glD4, glD5, glD4b, glD5b, glCsharp4, glCsharp5, glCsharp4b, glCsharp5b, glB3, glB4, glB3b, glB4b];
// loop of As triggered after loop is over
var pitchLoopCue6 = [glA3, glA4, chA6lo, glA4b, glA3b, glA4, chA6hi, glA4b];
var thisGlockenspiel;

// TODO: decide on timing of trigger and check math (2 beats is 1875 ms?)
tm.cue[6] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[6].goCue = function() {
  // reset counter
  counterCue6 = 0;
};
// TODO: decide whether to fade out shake sounds in second half of section. maybe fade to softer but NOT silence (in part because silent sounds make it seem cue isn't working if it was triggered too long ago)
tm.cue[6].triggerShakeSound = function() {
  if (counterCue6 < pitchArrayCue6.length) {
    thisGlockenspiel = pitchArrayCue6[counterCue6];
  } else {
    // repeats same three pitches until end of section
    thisGlockenspiel = pitchLoopCue6[counterCue6 % pitchLoopCue6.length];
  }
  // pitches bend up quarter tone in section half of section
  thisGlockenspiel.playbackRate = tm.getSectionBreakpoints(6, [0,1, 30000,1, 60000,1.0293]);
  thisGlockenspiel.start();
  counterCue6++;
};
tm.cue[6].stopCue = function() {
  // nothing to clean up UNLESS I use a reversed chime at end of cue
};

// *******************************************************************
// CUE 7: [B1 first 5 mm.] short TACET section, just listening to cello

tm.cue[7] = new TMCue('tacet', -1);
tm.cue[7].goCue = function() {
  // no sound here
};
tm.cue[7].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 8: [B1] quasi-granulated sparkles
var pingPongLoop = new Tone.Player(granulated_sounds + 'pingPongLoop.mp3').toMaster();
pingPongLoop.loop = true;

var popRocksLoop = new Tone.Player(granulated_sounds + 'popRocksLoop.mp3').toMaster();
popRocksLoop.loop = true;

tm.cue[8] = new TMCue('tilt', 1875, NO_LIMIT); // 2 beats @ 64bpm
// REVISION: could add third sound
tm.cue[8].goCue = function() {
  // mute both loops by default - unmute below
  pingPongLoop.volume.value = -99;
  popRocksLoop.volume.value = -99;
  pingPongLoop.start();
  popRocksLoop.start();
};
tm.cue[8].updateTiltSounds = function() {
  // playback rate can range from quarter speed to four times speed
  pingPongLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  popRocksLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.5) {
    // ping pong audible when device tilted to right
    pingPongLoop.volume.value = tm.getSectionBreakpoints(8, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    popRocksLoop.volume.value = -99;
  } else {
    popRocksLoop.volume.value = tm.getSectionBreakpoints(8, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    pingPongLoop.volume.value = -99;
  }
};
tm.cue[8].stopCue = function() {
  pingPongLoop.stop();
  popRocksLoop.stop();
};

// *******************************************************************
// CUE 9: [A2] Shaking glasses through predefined pitch array (with looped tail)

var glassFsharp4 = new Tone.Player(glass_sounds + "glassRealFsharp4.mp3").toMaster();
var glassG4 = new Tone.Player(glass_sounds + "glassRealG4.mp3").toMaster();
var glassA4 = new Tone.Player(glass_sounds + "glassRealA4.mp3").toMaster();
var glassB4 = new Tone.Player(glass_sounds + "glassRealB4.mp3").toMaster();
var glassCsharp5 = new Tone.Player(glass_sounds + "glassRealCsharp5.mp3").toMaster();
var glassD5 = new Tone.Player(glass_sounds + "glassRealD5.mp3").toMaster();
var glassE5 = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
var glassFsharp5 = new Tone.Player(glass_sounds + "glassRealFsharp5.mp3").toMaster();
var glassG5 = new Tone.Player(glass_sounds + "glassRealG5.mp3").toMaster();
var glassA5 = new Tone.Player(glass_sounds + "glassRealA5.mp3").toMaster();
var glassB5 = new Tone.Player(glass_sounds + "glassRealB5.mp3").toMaster();
var glassCsharp6 = new Tone.Player(glass_sounds + "glassRealCsharp6.mp3").toMaster();
var glassD6 = new Tone.Player(glass_sounds + "glassRealD6.mp3").toMaster();
var glassE6 = new Tone.Player(glass_sounds + "glassRealE6.mp3").toMaster();
var glassFsharp6 = new Tone.Player(glass_sounds + "glassRealFsharp6.mp3").toMaster();
var glassG6 = new Tone.Player(glass_sounds + "glassRealG6.mp3").toMaster();
var glassA6 = new Tone.Player(glass_sounds + "glassRealA6.mp3").toMaster();
var chA6a = new Tone.Player(chime_sounds + "chimeA6.mp3").toMaster();
var chA6b = new Tone.Player(chime_sounds + "chimeA6.mp3").toMaster();
var chA6c = new Tone.Player(chime_sounds + "chimeA6.mp3").toMaster();
var chA7a = new Tone.Player(chime_sounds + "chimeA7.mp3").toMaster();
var chA7b = new Tone.Player(chime_sounds + "chimeA7.mp3").toMaster();
var chA7c = new Tone.Player(chime_sounds + "chimeA7.mp3").toMaster();

var counterCue9 = 0;
// initial array of pitches triggered
var pitchArrayCue9 = [glassG4, glassG5, glassB4, glassB5, glassFsharp4, glassFsharp5, glassCsharp5, glassCsharp6, glassD5, glassD6, glassCsharp5, glassCsharp6, glassB4, glassB5, glassA4, glassA5, glassG4, glassG5, glassD5, glassD6, glassD5, glassD6, glassE5, glassE6, glassFsharp5, glassFsharp6, glassCsharp5, glassCsharp6, glassCsharp5, glassCsharp6, glassE5, glassE6, glassE5, glassE6];
// loop of As triggered after loop is over
var pitchLoopCue9 = [chA6a, chA7a, chA6b, chA7b, chA6c, chA7c];
var soundfileCue9;

tm.cue[9] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[9].goCue = function() {
  // reset counter
  counterCue9 = 0;
};
tm.cue[9].triggerShakeSound = function() {
  if (counterCue9 < pitchArrayCue9.length) {
    soundfileCue9 = pitchArrayCue9[counterCue9];
  } else {
    // repeats same two pitches until end of section
    soundfileCue9 = pitchLoopCue9[counterCue9 % pitchLoopCue9.length];
  }
  // pitches bend up quarter tone in section half of section
  soundfileCue9.playbackRate = tm.getSectionBreakpoints(9, [0,1, 30000,1, 60000,0.971532]);
  soundfileCue9.start();
  counterCue9++;
};
tm.cue[9].stopCue = function() {
  // nothing to clean up UNLESS I use reversed chime at end of section
};

// *******************************************************************
// CUE 10: [B2 first 5 mm.] short TACET section, just listening to cello

tm.cue[10] = new TMCue('tacet', -1);
tm.cue[10].goCue = function() {
  // no sound here
};
tm.cue[10].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 11: [B2] 3 percussive loops with variable playback speed

var pingpongClickLoop = new Tone.Player(granulated_sounds + "pingpongClickLoop.mp3").toMaster();
pingpongClickLoop.loop = true;

var ziplockClickLoop = new Tone.Player(granulated_sounds + "ziplockClickLoop.mp3").toMaster();
ziplockClickLoop.loop = true;

var claveLoop = new Tone.Player(granulated_sounds + "claveLoop.mp3").toMaster();
claveLoop.loop = true;

tm.cue[11] = new TMCue('tilt', 1875, NO_LIMIT); // 2 beats @ 64bpm

tm.cue[11].goCue = function() {
  // mute both loops by default - unmute below
  pingpongClickLoop.volume.value = -99;
  ziplockClickLoop.volume.value = -99;
  claveLoop.volume.value = -99;
  pingpongClickLoop.start();
  ziplockClickLoop.start();
  claveLoop.start();
};

tm.cue[11].updateTiltSounds = function() {
  // playback rate can range from quarter speed to four times speed
  pingpongClickLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  ziplockClickLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  claveLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.6) {
    // ping pong audible when device tilted to right
    pingpongClickLoop.volume.value = tm.getSectionBreakpoints(11, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    ziplockClickLoop.volume.value = -99;
    claveLoop.volume.value = -99;
  } else if (tm.accel.x > 0.2) {
    ziplockClickLoop.volume.value = tm.getSectionBreakpoints(11, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    pingpongClickLoop.volume.value = -99;
    claveLoop.volume.value = -99;
  } else {
    claveLoop.volume.value = tm.getSectionBreakpoints(11, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    pingpongClickLoop.volume.value = -99;
    ziplockClickLoop.volume.value = -99;
  }
};
tm.cue[11].stopCue = function() {
  pingpongClickLoop.stop();
  ziplockClickLoop.stop();
  claveLoop.stop();
};
// *******************************************************************
// CUE 12: [A3] glock / glass sounds through canon

var counterCue12 = 0;
var soundfileCue12, indexCue12;
var noteDur = 60 / 64 * 1000; // milliseconds per quarter note

// upper voice of canon
var hiPitchArrayCue12 = [glassG5, glassB5, glassFsharp5, glassCsharp6, glassD6, glassCsharp6, glassB5, glassA5, glassG5, glassD6, glassD6, glassE6, glassFsharp6, glassCsharp6, glassCsharp6, glassE6, glassE6, glassA6, glassFsharp6, glassG6, glassE6, glassD6, glassD6, glassCsharp6, glassB5, glassE6, glassE6, glassD6, glassD6, glassCsharp6, glassCsharp6, glassB5, glassG5, glassB5, glassFsharp5, glassCsharp6, glassD6, glassCsharp6, glassB5, glassA5, glassG5, glassD6, glassD6, glassE6, glassFsharp6, glassCsharp6, glassCsharp6, glassE6, glassE6, chA7a, glassFsharp6, glassG6, glassE6, glassD6, glassD6, glassCsharp6, glassB5, glassE6, glassE6, glassD6, glassD6, glassCsharp6, glassCsharp6, glassB5];
// lower voice of canon
var loPitchArrayCue12 = [glG3, glG3b, glB3, glB3b, glFsharp3, glFsharp3b, glCsharp4, glCsharp4b, glD4, glD4b, glCsharp4, glCsharp4b, glB3, glB3b, glA3, glA3b, glG3, glG3b, glD4, glD4b, glD4, glD4b, glE4, glE4b, glFsharp4, glFsharp4b, glCsharp4, glCsharp4b, glCsharp4, glCsharp4b, glE4, glE4b, glE4, glE4b, chA6a, chA6b, glFsharp4, glFsharp4b, glG4, glG4b, glE4, glE4b, glD4, glD4b, glD4, glD4b, glCsharp4, glCsharp4b, glB3, glB3b, glE4, glE4b, glE4, glE4b, glD4, glD4b, glD4, glD4b, glCsharp4, glCsharp4b, glCsharp4, glCsharp4b, glB3, glB3b];

tm.cue[12] = new TMCue('shake', -1);
tm.cue[12].goCue = function() {
  counterCue12 = 0;
};
tm.cue[12].triggerShakeSound = function() {
  // select note based on time since cue started (to keep all parts synched)
  indexCue12 = Math.floor(tm.getElapsedTimeInCue(12)/noteDur);
  // if any extra time, keep playing last note
  if (indexCue12 > (hiPitchArrayCue12.length - 1)) {
    indexCue12 = hiPitchArrayCue12.length - 1;
  }
  // alternately select between lower and higher canon
  soundfileCue12 = (counterCue12 % 2) ? hiPitchArrayCue12[indexCue12] : loPitchArrayCue12[indexCue12];

  soundfileCue12.start();
  counterCue12++;
};
tm.cue[12].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 13: [C1]

// *******************************************************************
// CUE 14: quasi-granulated sparkles
var pingPongLoop = new Tone.Player(granulated_sounds + 'pingPongLoop.mp3').toMaster();
pingPongLoop.loop = true;

var popRocksLoop = new Tone.Player(granulated_sounds + 'popRocksLoop.mp3').toMaster();
popRocksLoop.loop = true;

tm.cue[14] = new TMCue('tilt', 1875, NO_LIMIT); // 3 beats @ 96bpm
// REVISION: could add third sound
tm.cue[14].goCue = function() {
  // sound files triggered below. nothing to do here
};
tm.cue[14].updateTiltSounds = function() {
  // playback rate can range from quarter speed to four times speed
  pingPongLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  popRocksLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.5) {
    // ping pong audible when device tilted to right
    if (pingPongLoop.state === 'stopped') {
      pingPongLoop.start();
      popRocksLoop.stop();
    }
  } else {
    if (popRocksLoop.state === 'stopped') {
      popRocksLoop.start();
      pingPongLoop.stop();
    }
  }
  pingPongLoop.volume.value = tm.getSectionBreakpoints(14, [0,0, 10000,0, 15000,-3, 25000,-12, 30000,-99]);
  popRocksLoop.volume.value = tm.getSectionBreakpoints(14, [0,0, 10000,0, 15000,-3, 25000,-12, 30000,-99]);
};
tm.cue[14].stopCue = function() {
  // should be faded out by now, but cancel in 2 seconds just in case
  pingPongLoop.stop('+2');
  popRocksLoop.stop('+2');
};

// *******************************************************************
// CUE 15: shaken piano notes starting on G4/G5 and switching to D5/D6
var pianoG4 = new Tone.Player(piano_sounds + "pianoG4.mp3").toMaster();
var pianoG5 = new Tone.Player(piano_sounds + "pianoG5.mp3").toMaster();
var pianoD5 = new Tone.Player(piano_sounds + "pianoD5.mp3").toMaster();
var pianoD6 = new Tone.Player(piano_sounds + "pianoD6.mp3").toMaster();

var counterCue15 = 0;

tm.cue[15] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[15].goCue = function() {
  counterCue15 = 0;
};
tm.cue[15].triggerShakeSound = function() {
  if (counterCue15 > 7) {
    (counterCue15 % 2) ? pianoD6.start() : pianoD5.start();
  } else {
    (counterCue15 % 2) ? pianoG5.start() : pianoG4.start();
  }
  counterCue15++;
};
tm.cue[15].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 16: tacet
tm.cue[16] = new TMCue('tacet', -1);
tm.cue[16].goCue = function() {
  // no sound here
};
tm.cue[16].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 17: piano loop with pitch/time bend on x-axis
var pianoLoopA = new Tone.Player(piano_sounds + "pianoLoop.mp3").toMaster();

tm.cue[17] = new TMCue('tilt', 2500, 0);
tm.cue[17].goCue = function() {
  pianoLoopA.volume.value = 0;
  pianoLoopA.start();
};
tm.cue[17].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up (up to 1.2 times)
    pianoLoopA.playbackRate = 1 + (tm.accel.y - 0.6) * 0.5;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoopA.playbackRate = 1 - (0.4 - tm.accel.y) * 0.25;
  } else {
    pianoLoopA.playbackRate = 1;
  }
}
tm.cue[17].stopCue = function() {
  // gradual fade out before stopping this iteration (in case listener plays very slowly)
  pianoLoopA.volume.rampTo(-99, 8);
};

// *******************************************************************
// CUE 18: second iteration of piano loop. started over again to resync
var pianoLoopB = new Tone.Player(piano_sounds + "pianoLoop.mp3").toMaster();

tm.cue[18] = new TMCue('tilt', 2500, 0);
tm.cue[18].goCue = function() {
  // trigger same sound stored in different buffer to prevent artifacts
  pianoLoopB.volume.value = 0;
  pianoLoopB.start();
};
tm.cue[18].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up
    pianoLoopB.playbackRate = 1 + (tm.accel.y - 0.6) * 0.4;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoopB.playbackRate = 1 - (0.4 - tm.accel.y) * 0.2;
  } else {
    pianoLoopB.playbackRate = 1;
  }
}
tm.cue[18].stopCue = function() {
  pianoLoopB.volume.rampTo(-99, 8);
};

// *******************************************************************
// CUE 19: third iteration of piano loop. started over again to resync
var pianoLoopC = new Tone.Player(piano_sounds + "pianoLoop.mp3").toMaster();

tm.cue[19] = new TMCue('tilt', 2500, 0);
tm.cue[19].goCue = function() {
  // loop has been fading out, but stop in case it's still going
  pianoLoopC.stop();
  // reset volume before starting loop again
  pianoLoopC.volume.value = 0;
  pianoLoopC.start();
};
tm.cue[19].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up (up to 1.2 times)
    pianoLoopC.playbackRate = 1 + (tm.accel.y - 0.6) * 0.2;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoopC.playbackRate = 1 - (0.4 - tm.accel.y) * 0.1;
  } else {
    pianoLoopC.playbackRate = 1;
  }
}
tm.cue[19].stopCue = function() {
  // gradual fade out before stopping this iteration (in case listener plays very slowly)
  pianoLoopC.volume.rampTo(-99, 10);
};

// *******************************************************************
// CUE 20: shaken piano octave Es
var counterCue20 = 0;
var pianoE5 = new Tone.Player(piano_sounds + "pianoE5.mp3").toMaster();
var pianoE6 = new Tone.Player(piano_sounds + "pianoE6.mp3").toMaster();
var pianoE7 = new Tone.Player(piano_sounds + "pianoE7.mp3").toMaster();
var pianoArrayCue20 = [pianoE5, pianoE6, pianoE7];

tm.cue[20] = new TMCue('shake', 2500, 0);
tm.cue[20].goCue = function() {
  // reset counter
  counterCue20 = 0;
};
tm.cue[20].triggerShakeSound = function() {
  pianoArrayCue20[counterCue20 % pianoArrayCue20.length].start();
  counterCue20++;
};
tm.cue[20].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 21: tacet coda
tm.cue[21] = new TMCue('tacet', -1);
tm.cue[21].goCue = function() {
  // nothing to play
}
tm.cue[21].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 22: finished
tm.cue[22] = new TMCue('finished', -1);
tm.cue[22].goCue = function() {
  tm.publicLog('The piece is done.');
}

// *******************************************************************
// CUES 23-26: use for quartet to test pedal and cue counter

tm.cue[23] = new TMCue('waiting', -1);
tm.cue[23].goCue = function() {
  tm.publicLog('Test cue 23 was triggered.');
};
tm.cue[24] = new TMCue('waiting', -1);
tm.cue[24].goCue = function() {
  tm.publicLog('Test cue 24 was triggered.');
};
tm.cue[25] = new TMCue('waiting', -1);
tm.cue[25].goCue = function() {
  tm.publicLog('Test cue 25 was triggered.');
};
tm.cue[26] = new TMCue('waiting', -1);
tm.cue[26].goCue = function() {
  tm.publicLog('Test cue 26 was triggered.');
};
