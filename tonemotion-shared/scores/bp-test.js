const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  // TODO: create server for ryancarter.org/bp
  if (tm.localTest) {
    tm.init('http://localhost:3000/shared-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/shared-server/current-cue');
  }
};

// Shortcuts to audio file paths
const perc_sounds = 'tonemotion-shared/audio/perc/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';
const glock_sounds = 'tonemotion-shared/audio/glockenspiel/';
const bell_sounds = 'tonemotion-shared/audio/bells/';
const glass_sounds = 'tonemotion-shared/audio/glass/';

// INSTRUMENTS USED IN MULTIPLE CUES
// sinusoidal tails to add to shake sounds (poly voice allocation automatic)
// 1 sec attack and 3 sec release means up to 16 vox may be allocated with SHAKE
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
  volume: -28,
}).toDestination();

// sampler using vibes (with rattan sticks) and struck glass "bell" sounds
const vibeSampler = new Tone.Sampler({
  urls: {
    'F3': 'vibe_bell-F3.mp3',
    'A3': 'vibe_bell-A3.mp3',
    'Db4': 'vibe_bell-Db4.mp3',
    'F4': 'vibe_bell-F4.mp3',
    'A4': 'vibe_bell-A4.mp3',
    'Db5': 'vibe_bell-Db5.mp3',
  },
  baseUrl: vibes_sounds,
}).toDestination();


// *******************************************************************
// CUE 0:

const DqS4 = 220 * ((2**(1/24))**11); // D quarter-sharp 4

const Aqb4 = 440 * ((2**(1/24))**23); // A quarter-flat 5 NOT
const Aqb5 = 440 * ((2**(1/24))**23); // A quarter-flat 5

const pitchArr1_0 = ['F4', 'F5', 'F5', 'F4', 'Eb5', 'Eb5', 'F4', 'D5', 'D5', 'F4', 'C5', 'C5', 'Eb4', 'C5', 'Eb4', DqS4, DqS4, 'C5', 'D4', 'C5', 'D4', 'C4', 'C5', 'C5'];
const pitchArr2 = ['B4', 'A5', 'B4', 'A5', 'B4', Aqb5, 'B4', Aqb5, 'B4', 'G#5', 'B4', 'G#5', 'B4', 'F#5', 'B4', 'F#5', 'A4', 'F#5', 'A4', 'F#5', Aqb4, 'F#5', Aqb4, 'F#5', 'G#4', 'F#5', 'G#4', 'F#5', 'F#4', 'F#5', 'F#4', 'F#5', 'F4', 'F5', 'Eb6', 'A5', 'G6', 'C7', 'F4', 'F5', 'Eb6', 'A5', 'G6', 'F4', 'F5', 'Eb6', 'A5'];
const pitchArr3 = ['F4', 'F5', 'F6', 'F5'];
let count_0 = 0;

// uses two handbell sounds from freesound.org/people/radwoc/ (CC0 license)
const bellSparkle = new Tone.Player(bell_sounds + 'bell_sparkle-FAA.mp3').toDestination();

tm.cue[0] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  count_0 = 0;

  // TODO: remove "true ||" so that this isn't always triggered
  if (true || tm.getElapsedTimeInCue(0) < 1000) {
    // only trigger opening sound if it's actually beginning of cue
    // otherwise if someone stops and restarts, this sound is triggered again
    bellSparkle.start();
  }
};
tm.cue[0].triggerShakeSound = function() {

  // test for first pitch series
  vibeSampler.triggerAttackRelease(pitchArr1_0[count_0], 3);
  sineTails.triggerAttackRelease(pitchArr1_0[count_0], 1);
  count_0++;

  let time0 = tm.getElapsedTimeInCue(0);
  // TODO: adjust timing for tempo (if not quarter=60)
  // if (time0 < 24000) {
  //   // first notes are coordinated by time so everyone is playing same note
  //   vibeSampler.triggerAttackRelease(pitchArr1[Math.floor(time0 / 1000)], 4);
  // } else if (count_0 < pitchArr2.length) {
  //   // then notes go through array, creating an independent canon
  //   sineTails.triggerAttackRelease(pitchArr2[count_0], 1);
  //   vibeSampler.triggerAttackRelease(pitchArr2[count_0], 4);
  //   count_0++;
  // } else {
  //   // final loop of pitches
  //   sineTails.triggerAttackRelease(pitchArr3[(count_0 - pitchArr2.length) % pitchArr3.length], 1);
  //   vibeSampler.triggerAttackRelease(pitchArr3[(count_0 - pitchArr2.length) % pitchArr3.length], 4);
  //   count_0++;
  // }

};
tm.cue[0].stopCue = function() {
  sineTails.releaseAll();
};

// *******************************************************************
// CUE 1: tilt tutorial
// Test tone for "tilt" tutorial
let testToneFilter = new Tone.Filter(440, "lowpass").toDestination();
let testTone = new Tone.Synth({
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
let testToneFreqScale = new Tone.Scale(440, 880); // scales control signal (0.0 - 1.0)
let testToneFilterScale = new Tone.Scale(440, 10000);
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
let cowbell = new Tone.Player(perc_sounds + 'cowbell.mp3').toDestination();
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
