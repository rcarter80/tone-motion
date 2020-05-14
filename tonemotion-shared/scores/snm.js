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
glassArray_c6 = [glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b];
// second array of sounds (no fade out)
chimeArray_c6 = [chimeD7, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b];
// final array of sounds to keep looping
pluckedArray_c6 = [pluckedF3, pluckedF4, pluckedF5, pluckedF4b];

var counter_c6 = 0;
var thisVol_c6, thisGlass_c6, thisPlucked_c6, loopCounter_c6;

// 1667 ms. = 2 beats @ 72bpm
tm.cue[6] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[6].goCue = function() {
  counter_c6 = 0;
};
tm.cue[6].triggerShakeSound = function() {
  if (counter_c6 < glassArray_c6.length) {
    // glass sounds fade from 0dBfs to -24dBfs over course of array
    thisVol_c6 = -((counter_c6 / 59) * 24);
    thisGlass_c6 = glassArray_c6[counter_c6];
    thisGlass_c6.volume.value = thisVol_c6;
    thisGlass_c6.start();
  } else if (counter_c6 < (glassArray_c6.length + chimeArray_c6.length)) {
    chimeArray_c6[(counter_c6 - glassArray_c6.length)].start();
  } else {
    loopCounter_c6 = counter_c6 - glassArray_c6.length - chimeArray_c6.length;
    // plucked sounds fade from 0dBfs to -24dBfs over course of array
    if (loopCounter_c6 < 60) {
      thisVol_c6 = -((loopCounter_c6 / 59) * 24);
    } else {
      thisVol_c6 = -24;
    }
    thisPlucked_c6 = pluckedArray_c6[loopCounter_c6 % pluckedArray_c6.length];
    thisPlucked_c6.volume.value = thisVol_c6;
    thisPlucked_c6.start();
  }
  counter_c6++;
};
tm.cue[6].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 7:

// TODO: fix these two layers and add next two

var fmSynth_c7 = new Tone.FMSynth({
  harmonicity: 1.5,
  envelope: {
    attack: 1.25,
    decay: 0,
    sustain: 1,
    release: 1.25,
    releaseCurve: 'linear',
  },
  modulation: {
    type: 'sine',
  },
  modulationEnvelope: {
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 10,
  },
}).toMaster();
fmSynth_c7.detune.value = 1200;
fmSynth_c7.oscillator.partials = [1, 0.5, 0, 0.25, 0, 0, 0, 0.125];
var lfo_c7 = new Tone.LFO('32n', -99, 0);
lfo_c7.connect(fmSynth_c7.volume);

var fmSynth_c7b = new Tone.FMSynth({
  harmonicity: 1.5,
  envelope: {
    attack: 1.25,
    decay: 0,
    sustain: 1,
    release: 1.25,
    releaseCurve: 'linear',
  },
  modulation: {
    type: 'sine',
  },
  modulationEnvelope: {
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 10,
  },
}).toMaster();
fmSynth_c7b.oscillator.partials = [1, 0.5, 0, 0.25, 0, 0, 0, 0.125];

var counter_c7 = 0;

var testArr = ['C3', 'D3'];

var loop_c7 = new Tone.Loop(function(time) {
  fmSynth_c7.frequency.value = testArr[counter_c7 % testArr.length];
  fmSynth_c7b.frequency.value = testArr[counter_c7 % testArr.length];
  counter_c7++;
},'2n.');
loop_c7.iterations = 24;

// TODO: change wait time to something like 1 second
tm.cue[7] = new TMCue('tilt', 1667, NO_LIMIT);
tm.cue[7].goCue = function() {
  counter_c7   = 0;
  fmSynth_c7b.triggerAttack('E3');
  fmSynth_c7.triggerAttack('E3');
  lfo_c7.start();
  loop_c7.start();
};
tm.cue[7].updateTiltSounds = function() {
  fmSynth_c7.modulationIndex.value = 1 + tm.accel.y * 19;
  fmSynth_c7b.modulationIndex.value = 1 + tm.accel.y * 19;

  if (tm.accel.x > 0.5) {
    fmSynth_c7.volume.value = 0;
    fmSynth_c7b.volume.value = -99;
  } else {
    fmSynth_c7.volume.value = -99;
    fmSynth_c7b.volume.value = 0;
  }
};
tm.cue[7].stopCue = function() {
  loop_c7.stop();
  fmSynth_c7.triggerRelease();
  fmSynth_c7b.triggerRelease();
  lfo_c7.stop();
};
