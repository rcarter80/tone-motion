const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.meter.isOn = true;
tm.meter.rapid = true;
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/shared-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/shared-server/current-cue');
  }
};

// Shortcuts to audio file paths
const perc_sounds = 'tonemotion-shared/audio/perc/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';

// INSTRUMENTS USED IN MULTIPLE CUES
// sinusoidal tails to add to shake sounds (poly voice allocation automatic)
// 1 sec attack and 3 sec attack means up to 16 vox may be allocated with SHAKE
const sineTails = new Tone.PolySynth(Tone.Synth, {
  oscillator: {
    type: 'sine',
  },
  envelope: {
    attack: 1,
    attackCurve: "linear",
    decay: 0.1,
    decayCurve: "linear",
    sustain: 1,
    release: 3,
    releaseCurve: "linear",
  },
  volume: -24,
}).toDestination();

// *******************************************************************
// CUE 0:
const Dqb4 = 220 * ((2**(1/24))**9); // D quarter-flat 4
const testArr = ['E4', 'E5', 'E4', 'D5', 'E4', 'C#5', 'E4', 'B4', 'D4', 'B4', Dqb4, 'B4', 'C#4', 'B4', 'B3', 'B4'];
let count0 = 0;

const testSampler = new Tone.Sampler({
  urls: {
    A6: '2sec-chime-A6.mp3',
  },
  baseUrl: chime_sounds,
}).toDestination();

tm.cue[0] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  count0 = 0;
};
tm.cue[0].triggerShakeSound = function() {
  // TODO: implement time-based pitch selection, followed by array rotation
  let time0 = tm.getElapsedTimeInCue(0);
  console.log(time0);

  sineTails.triggerAttackRelease(testArr[count0 % testArr.length], 1);
  testSampler.triggerAttackRelease(testArr[count0 % testArr.length], 4);
  count0++;
};
tm.cue[0].stopCue = function() {
  sineTails.releaseAll();
};

// *******************************************************************
// CUE 1: tilt tutorial
// Test tone for "tilt" tutorial
var testToneFilter = new Tone.Filter(440, "lowpass").toDestination();
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
tm.cue[1] = new TMCue('tilt', 0, NO_LIMIT);
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
tm.cue[2] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[2].goCue = function() {
  // nothing to play
}
tm.cue[2].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 3: shake tutorial
var cowbell = new Tone.Player(perc_sounds + 'cowbell.mp3').toDestination();
tm.cue[3] = new TMCue('shake', 0, NO_LIMIT);
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
tm.cue[4] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[4].stopCue = function() {
  // nothing to clean up
};
