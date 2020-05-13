const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  // TODO: create SNM server and use instead of JACK server
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

// Shortcuts to audio file paths
// TODO: deleted unused paths
const glass_sounds = 'tonemotion-shared/audio/glass/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const plucked_sounds = 'tonemotion-shared/audio/plucked/';
const cello_sounds = 'tonemotion-shared/audio/cello/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const piano_sounds = 'tonemotion-shared/audio/piano/';

// Instruments need global scope within this file, but can appear just above the first cue in which they sound
Tone.Transport.bpm.value = 72;
const semitone = 1.059463;

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
// CUE 6: glass sounds (getting softer), then single chime, then lower plucked
var glE4 = new Tone.Player(glass_sounds + "glassRealE4.mp3").toMaster();
var glF4 = new Tone.Player(glass_sounds + "glassRealE4.mp3").toMaster();
// reusing E4 and pitching up half step. could also create second sound file
glF4.playbackRate = semitone;
var glA4 = new Tone.Player(glass_sounds + "glassRealA4.mp3").toMaster();
var glB4 = new Tone.Player(glass_sounds + "glassRealB4.mp3").toMaster();
var glC5 = new Tone.Player(glass_sounds + "glassRealC5.mp3").toMaster();
var glE5 = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
// duplicate file to avoid retirggering artifacts
var glE5b = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
var glF5 = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
glF5.playbackRate = semitone;
var glA5 = new Tone.Player(glass_sounds + "glassRealA5.mp3").toMaster();
var glB5 = new Tone.Player(glass_sounds + "glassRealB5.mp3").toMaster();
var glC6 = new Tone.Player(glass_sounds + "glassRealC6.mp3").toMaster();
var glE6 = new Tone.Player(glass_sounds + "glassRealE6.mp3").toMaster();
var chimeD7 = new Tone.Player(chime_sounds + "2sec-chime-D7.mp3").toMaster();
var pluckedD3 = new Tone.Player(plucked_sounds + "pluckedD3.mp3").toMaster();
var pluckedD4 = new Tone.Player(plucked_sounds + "pluckedD4.mp3").toMaster();
var pluckedD4b = new Tone.Player(plucked_sounds + "pluckedD4.mp3").toMaster();
var pluckedD5 = new Tone.Player(plucked_sounds + "pluckedD5.mp3").toMaster();
var pluckedF3 = new Tone.Player(plucked_sounds + "pluckedF3.mp3").toMaster();
var pluckedF4 = new Tone.Player(plucked_sounds + "pluckedF4.mp3").toMaster();
var pluckedF4b = new Tone.Player(plucked_sounds + "pluckedF4.mp3").toMaster();
var pluckedF5 = new Tone.Player(plucked_sounds + "pluckedF5.mp3").toMaster();

// array of initial glass sounds for first part of cue
glassArrayCue6 = [glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b];
// second array of sounds (no fade out)
chimeArrayCue6 = [chimeD7, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b];
// final array of sounds to keep looping
pluckedArrayCue6 = [pluckedF3, pluckedF4, pluckedF5, pluckedF4b];

var counterCue6 = 0;
var thisVolCue6, thisGlassCue6, thisPluckedCue6, loopCounterCue6;

// 1667 ms. = 2 beats @ 72bpm
tm.cue[6] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[6].goCue = function() {
  counterCue6 = 0;
};
tm.cue[6].triggerShakeSound = function() {
  if (counterCue6 < glassArrayCue6.length) {
    // glass sounds fade from 0dBfs to -24dBfs over course of array
    thisVolCue6 = -((counterCue6 / 59) * 24);
    thisGlassCue6 = glassArrayCue6[counterCue6];
    thisGlassCue6.volume.value = thisVolCue6;
    thisGlassCue6.start();
  } else if (counterCue6 < (glassArrayCue6.length + chimeArrayCue6.length)) {
    chimeArrayCue6[(counterCue6 - glassArrayCue6.length)].start();
  } else {
    loopCounterCue6 = counterCue6 - glassArrayCue6.length - chimeArrayCue6.length;
    // plucked sounds fade from 0dBfs to -24dBfs over course of array
    if (loopCounterCue6 < 60) {
      thisVolCue6 = -((loopCounterCue6 / 59) * 24);
    } else {
      thisVolCue6 = -24;
    }
    thisPluckedCue6 = pluckedArrayCue6[loopCounterCue6 % pluckedArrayCue6.length];
    thisPluckedCue6.volume.value = thisVolCue6;
    thisPluckedCue6.start();
  }
  counterCue6++;
};
tm.cue[6].stopCue = function() {
};

// *******************************************************************
// CUE 7:
