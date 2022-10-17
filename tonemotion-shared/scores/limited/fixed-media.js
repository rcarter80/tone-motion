const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/limited-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/limited-server/current-cue');
  }
};

// Shortcuts to audio file paths
const perc_sounds = 'tonemotion-shared/audio/perc/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const bell_sounds = 'tonemotion-shared/audio/bells/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const piano_sounds = 'tonemotion-shared/audio/piano/';
const misc_sounds = 'tonemotion-shared/audio/misc/';

// interval and microtonal pitch definitions
const halfStepUp = 2 ** (1 / 12);
const halfStepDown = 1 / halfStepUp;
const CeS3 = 110 * ((2 ** (1 / 48)) ** 13); // C eighth-sharp 3
const CqS3 = 110 * ((2 ** (1 / 48)) ** 14); // C quarter-sharp 3
const CteS3 = 110 * ((2 ** (1 / 48)) ** 15); // C 3-eighths-sharp 3
const GeS3 = 110 * ((2 ** (1 / 48)) ** 41); // G eighth-sharp 3
const GqS3 = 110 * ((2 ** (1 / 48)) ** 42); // G quarter-sharp 3
const GteS3 = 110 * ((2 ** (1 / 48)) ** 43); // G 3-eighths-sharp 3
const AeS3 = 220 * (2 ** (1 / 48)); // A eighth-sharp 3
const AqS3 = 220 * (2 ** (1 / 24)); // A quarter-sharp 3
const AteS3 = 220 * ((2 ** (1 / 48)) ** 3); // A 3-eighths-sharp 3
const CeS4 = 220 * ((2 ** (1 / 48)) ** 13); // C eighth-sharp 4
const CqS4 = 220 * ((2 ** (1 / 24)) ** 7); // C quarter-sharp 4
const CteS4 = 220 * ((2 ** (1 / 48)) ** 15); // C 3-eighths-sharp 4
const DqS4 = 220 * ((2 ** (1 / 24)) ** 11); // D quarter-sharp 4
const GqS4 = 220 * ((2 ** (1 / 24)) ** 21); // G quarter-sharp 4
const AqS4 = 440 * (2 ** (1 / 24)); // A quarter-sharp 4
const CeS5 = 440 * ((2 ** (1 / 48)) ** 13); // C eighth-sharp 5
const CqS5 = 440 * ((2 ** (1 / 48)) ** 14); // C quarter-sharp 5
const CteS5 = 440 * ((2 ** (1 / 48)) ** 15); // C 3-eighths-sharp 5
const DsS5 = 440 * ((2 ** (1 / 36)) ** 16); // D sixth-sharp 5
const DqS5 = 440 * ((2 ** (1 / 24)) ** 11); // D quarter-sharp 5
const DtS5 = 440 * ((2 ** (1 / 36)) ** 17); // D third-sharp 5
const GeS5 = 440 * ((2 ** (1 / 48)) ** 41); // G eighth-sharp 5
const GqS5 = 440 * ((2 ** (1 / 48)) ** 42); // G quarter-sharp 5
const GteS5 = 440 * ((2 ** (1 / 48)) ** 43); // G 3-eighths-sharp 5
const AsS5 = 880 * (2 ** (1 / 36)); // A sixth-sharp 5
const AqS5 = 880 * (2 ** (1 / 24)); // A quarter-sharp 5
const AtS5 = 880 * ((2 ** (1 / 36)) ** 2); // A third-sharp 5

const WAIT_TIME = 2000; // use to globally set standard wait time for cues
const CUE_SOUND_WINDOW = 200; // short window at beginning of cue to play sound

// shows number of shakes listener has left
function displayShakesLeft(num) {
  let shakes = (num === 1) ? 'shake' : 'shakes';
  status_label.innerHTML = `<span class="large">${num}</span><br>${shakes} left`;
}
// shows number of dips listener has left
function displayDipsLeft(num) {
  let dips = (num === 1) ? 'dip' : 'dips';
  status_label.innerHTML = `<span class="large">${num}</span><br>${dips} left`;
}

// INSTRUMENTS
// sinusoidal tails to add to shake sounds (poly voice allocation automatic)
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
// same as sineTails instrument but panned hard left
const sineLeftPanner = new Tone.Panner(-1).toDestination();
const sineTailsL = new Tone.PolySynth(Tone.Synth, {
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
}).connect(sineLeftPanner);
// same as sineTails instrument but panned hard right
const sineRightPanner = new Tone.Panner(1).toDestination();
const sineTailsR = new Tone.PolySynth(Tone.Synth, {
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
}).connect(sineRightPanner);
// monophonic sinusoid synth that allows pitch bend (not allowed with PolySynth)
const monoSine = new Tone.Synth({
  oscillator: {
    type: 'sine',
  },
  envelope: {
    attack: 1,
    attackCurve: "linear",
    decay: 0.1,
    decayCurve: "linear",
    sustain: 1,
    release: 1,
    releaseCurve: "linear",
  },
  volume: -28,
}).toDestination();

// monophonic buzzy synth with LFO
const buzzyTremolo = new Tone.Tremolo(4, 1.0).toDestination().start();
const buzzySynth = new Tone.Synth({
  oscillator: {
    type: 'sawtooth',
  },
  envelope: {
    attack: 1,
    attackCurve: "linear",
    decay: 0.1,
    decayCurve: "linear",
    sustain: 1,
    release: 1,
    releaseCurve: "linear",
  },
  volume: -60,
}).connect(buzzyTremolo);

// sampler using vibes (with rattan sticks) and struck glass "bell" sounds
// REVISION idea: could also create some kind of struck glass bowl sampler or almglocken sampler and sometimes use that instead of vibeSampler
const vibeSampler = new Tone.Sampler({
  urls: {
    'F3': 'vibe_bell-F3.mp3',
    'A3': 'vibe_bell-A3.mp3',
    'Db4': 'vibe_bell-Db4.mp3',
    'F4': 'vibe_bell-F4.mp3',
    'A4': 'vibe_bell-A4.mp3',
    'Db5': 'vibe_bell-Db5.mp3',
    'A5': 'vibe_bell-A5.mp3',
    'Db6': 'vibe_bell-Db6.mp3',
  },
  baseUrl: vibes_sounds,
}).toDestination();
// same but 1.5-sec. reversed sounds (to use with cueTransition 2s. before cue)
const revVibeSampler = new Tone.Sampler({
  // each sound file is exactly 1.5 sec. - transposed could be shorter or longer
  urls: {
    'F4': 'rev_vibe_bell-F4.mp3',
    'A4': 'rev_vibe_bell-A4.mp3',
    'Db5': 'rev_vibe_bell-Db5.mp3',
    'A5': 'rev_vibe_bell-A5.mp3',
    'Db6': 'rev_vibe_bell-Db6.mp3',
  },
  baseUrl: vibes_sounds,
}).toDestination();

// handbell sampler from freesound.org/people/radwoc/ (CC0 license)
const bellSampler = new Tone.Sampler({
  urls: {
    'C6': 'handbell-C6.mp3',
    'E6': 'handbell-E6.mp3',
    'Ab6': 'handbell-Ab6.mp3',
    'B6': 'handbell-B6.mp3',
  },
  baseUrl: bell_sounds,
}).toDestination();
const bellDelay = new Tone.FeedbackDelay({
  delayTime: 0.22,
  feedback: 0.4,
}).toDestination();
const bellDelaySampler = new Tone.Sampler({
  urls: {
    'C6': 'handbell-C6.mp3',
    'E6': 'handbell-E6.mp3',
    'Ab6': 'handbell-Ab6.mp3',
    'B6': 'handbell-B6.mp3',
  },
  baseUrl: bell_sounds,
}).connect(bellDelay);

// chime sampler from my old wind chimes
const chimeSampler = new Tone.Sampler({
  urls: {
    'D6': '2sec-chime-D6.mp3',
    'F6': '2sec-chime-F6.mp3',
    'A6': '2sec-chime-A6.mp3',
    'C7': '2sec-chime-C7.mp3',
    'D7': '2sec-chime-D7.mp3',
    'F7': '2sec-chime-F7.mp3',
  },
  baseUrl: chime_sounds,
}).toDestination();

// piano sampler with samples from Logic
const pianoSampler = new Tone.Sampler({
  urls: {
    'F4': 'piano-3s-F4.mp3',
    'A4': 'piano-3s-A4.mp3',
    'Db5': 'piano-3s-Db5.mp3',
    'F5': 'piano-3s-F5.mp3',
    'A5': 'piano-3s-A5.mp3',
    'Db6': 'piano-3s-Db6.mp3',
  },
  baseUrl: piano_sounds,
}).toDestination();

// 4-sec. "tail" of chimes/sugar. Not pitched, but Sampler manages retriggering
const sparklyTailSampler = new Tone.Sampler({
  urls: {
    // "tune" to A4 (440) so that I can use Hz as argument to triggerAttack()
    'A4': granulated_sounds + 'sparklyTail.mp3'
  }
}).toDestination();

// Center of most prominent frequency is c. 507Hz (~C5)
const pitchedIceLoop = new Tone.Player(granulated_sounds + 'pitchedIceLoop.mp3').toDestination();
pitchedIceLoop.loop = true;
// NOTE: "melting ice#02" has nice noisy ice sounds. could use later

const pingpongClickLoop = new Tone.Player(granulated_sounds + 'pingpongClickLoop.mp3').toDestination();
pingpongClickLoop.loop = true;

const claveLoop = new Tone.Player(granulated_sounds + 'claveLoop.mp3').toDestination();
claveLoop.loop = true;

const ziplockLoop = new Tone.Player(granulated_sounds + 'ziplockClickLoop.mp3').toDestination();
ziplockLoop.loop = true;

const clickTransition = new Tone.Player(misc_sounds + 'click-transition.mp3').toDestination();

const clave = new Tone.Player(perc_sounds + 'clave.mp3').toDestination();
clave.volume.value = -18;

const clickFading = new Tone.Player(misc_sounds + 'clave-pingpong-dimin.mp3').toDestination();

const clavePingpong = new Tone.Player(misc_sounds + 'clave-pingpong_loop.mp3').toDestination();

// *******************************************************************
// CUE 0: piece is in "waiting" state by default
tm.cue[0] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[0].stopCue = function() {
};

// *******************************************************************
// CUE 1: SHAKE tutorial
tm.cue[1] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[1].goCue = function() {
};
tm.cue[1].triggerShakeSound = function() {
  // no need for tutorial
};
tm.cue[1].stopCue = function() {
};

// *******************************************************************
// CUE 2: tacet tutorial
tm.cue[2] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[2].goCue = function() {
};
tm.cue[2].stopCue = function() {
};

// *******************************************************************
// CUE 3: DIP tutorial
tm.cue[3] = new TMCue('dip', 0, NO_LIMIT);
tm.cue[3].goCue = function() {
};
tm.cue[3].updateTiltSounds = function() {
};
tm.cue[3].triggerDipSound = function() {
  // no need for tutorial
}
tm.cue[3].stopCue = function() {
};

// *******************************************************************
// Section DIP/SHAKE limits
// need to define pitch array here in order to set limit_7 / 8 from array length
const pitchArr_7 = ['Eb5', 'Eb4', 'Eb5', 'D4', 'Eb4', 'D5', 'G4', 'D3', 'C4', 'Eb5', 'D4', 'Bb3', 'G5', 'Eb4', 'Eb3', DqS4, 'C5', 'D4', 'Eb4', 'D5', 'G4', 'G3', 'G4', 'Bb4', 'A4', AqS4, 'Eb5', 'Bb4'];
const pitchArr_8 = ['C5', 'C4', DqS5, 'D4', 'Eb4', 'D5', 'G4', 'D3', 'G4', 'Eb5', 'F4', 'G5', 'F4', 'Eb4', 'Bb2', 'D4', 'G5', 'F4', 'A5', 'F4', 'G4', 'Eb3', 'G4', AqS5, 'Eb4', 'Bb5', 'Eb4', 'D4'];
let limit_5, limit_6, limit_7, limit_8, limit_9, limit_10, limit_11, limit_12, limit_13, limit_14, limit_15;
function resetCueLimits() {
  // some dip and shake limits are higher for testing
  limit_5 = (tm.debug) ? 931 : 31;
  limit_6 = (tm.debug) ? 941 : 41;
  limit_7 = pitchArr_7.length;
  limit_8 = pitchArr_8.length;
  limit_9 = (tm.debug) ? 917 : 17;
  limit_10 = (tm.debug) ? 931 : 31;
  limit_11 = (tm.debug) ? 941 : 41;
  limit_12 = 129;
  limit_13 = (tm.debug) ? 916 : 16;
  limit_14 = (tm.debug) ? 99 : 9;
  limit_15 = (tm.debug) ? 98 : 8;
}
// call once to initially set limits on page load, but can also reset in cue 4
resetCueLimits();

// *******************************************************************
// CUE 4: sets status to 'waitingForPieceToStart' AND resets all cue counters
tm.cue[4] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
  // reset ALL counters here, so that people can start and stop during piece and keep their counters intact, but I can reset every counter with this cue
  resetCueLimits();
};
tm.cue[4].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 5 (DIP): 1st section. "Fixed" media is silent
// lower voice of canon (32 notes @ 2sec. per note, so section should be ~64")
// TODO: delete any unused declarations, including instruments above. I started the non-interactive script from the audience participatory script, so there will be a lot of unused code, but wait until all finish to delete everything.
const loPitchArr_5 = ['Eb4', 'D4', 'Eb4', 'G4', 'C4', 'D4', 'Bb3', 'Eb4', DqS4, 'D4', 'Eb4', 'G4', 'G4', 'A4', AqS4, 'Bb4', 'C4', 'D4', 'Eb4', 'G4', 'G4', 'F4', 'F4', 'Eb4', 'D4', 'F4', 'F4', 'G4', 'G4', 'Eb4', 'Eb4', 'D4'];
// upper voice of canon
const hiPitchArr_5 = ['Eb5', 'Eb5', 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'C5', 'C5', 'D5', 'D5', 'Bb4', 'Bb4', 'Eb5', 'Eb5', DtS5, DsS5, 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'G5', 'G5', 'A5', 'A5', AsS5, AtS5, 'Bb5', 'Bb5'];

tm.cue[5] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[5].goCue = function() {
  // turn off motion testing to optimize motionUpdateLoop
  tm.shouldTestMotion = false;
};
tm.cue[5].updateTiltSounds = function() {
};
tm.cue[5].triggerDipSound = function() {
};
tm.cue[5].triggerDipReset = function() {
};
tm.cue[5].stopCue = function() {
};

// *******************************************************************
// CUE 6 (SHAKE): non-interactive sound is silent
const hiPitchArr_6 = ['C5', 'C5', 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'G5', 'G5', 'F5', 'F5', 'F5', 'F5', 'Eb5', 'Eb5', 'D5', 'D5', 'F5', 'F5', 'F5', 'F5', 'G5', 'G5', 'G5', 'G5', 'Eb5', 'Eb5', 'Eb5', 'Eb5', 'D5', 'D5'];

tm.cue[6] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[6].goCue = function() {
};
tm.cue[6].triggerShakeSound = function() {
};
tm.cue[6].stopCue = function() {
};

// *******************************************************************
// CUE 7 (DIP): accel clicks-> vibes 3-vox canon, pitches in array (c. 30-60")
bellSampler.release = 0.8; // bells pitched very low require gentler fade out
let count_7 = 0;

tm.cue[7] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[7].goCue = function() {
};
tm.cue[7].updateTiltSounds = function() {
};
tm.cue[7].triggerDipSound = function() {
};
tm.cue[7].triggerDipReset = function() {
};
tm.cue[7].stopCue = function() {
};

// *******************************************************************
// CUE 8 (SHAKE): 3-vox canon with 2-oct bells, higher note w/ delay (c. 30-60")
let count_8 = 0;
tm.cue[8] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[8].goCue = function() {
};
tm.cue[8].triggerShakeSound = function() {
};
tm.cue[8].stopCue = function() {
};

// *******************************************************************
// CUE 9 (DIP) increased accel/decel clicks with restricted canon (c. 30")

// NOTE: When composing fixed media, use gradually fading in sinusoids in this cue to match sineTails in phones, but start very subtle and gradually sweep up in frequency while getting fuller and louder

let index_9 = 0;
const loopTimeL_9 = 2 + Math.random() * 2; // notes triggered every 2 to 4 sec.
const sineLoopL_9 = new Tone.Loop(function(time) {
  let time_9 = tm.getElapsedTimeInCue(9);
  let index_9 = Math.floor(time_9 / 2000); // 2 seconds for each note
  // only go through first 16 notes of canon voice
  if (index_9 > 15) {
    index_9 = 15;
  }
  sineTailsL.volume.value = tm.getSectionBreakpoints(9, [0, -99, 20000, 0]);
  sineTailsL.triggerAttackRelease(loPitchArr_5[index_9], 4);
}, loopTimeL_9);
const loopTimeR_9 = 2 + Math.random() * 2; // notes triggered every 2 to 4 sec.
const sineLoopR_9 = new Tone.Loop(function(time) {
  let time_9 = tm.getElapsedTimeInCue(9);
  let index_9 = Math.floor(time_9 / 2000); // 2 seconds for each note
  // only go through first 16 notes of canon voice
  if (index_9 > 15) {
    index_9 = 15;
  }
  sineTailsR.volume.value = tm.getSectionBreakpoints(9, [0, -99, 20000, 0]);
  sineTailsR.triggerAttackRelease(loPitchArr_5[index_9], 4);
}, loopTimeR_9);
let count_9 = 0;

tm.cue[9] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[9].goCue = function() {
  sineLoopL_9.start();
  sineLoopR_9.start();
};
tm.cue[9].updateTiltSounds = function() {
};
tm.cue[9].triggerDipSound = function() {
};
tm.cue[9].triggerDipReset = function() {
};
tm.cue[9].stopCue = function() {
  sineLoopL_9.stop();
  sineLoopR_9.stop();
};

// *******************************************************************
// CUE 10 (SHAKE) synchronized pulse triggered by shake sounds (c. 30")

// NOTE: When composing fixed media, could gradually fade in synchronized pulsed sounds. Could be mostly unpitched (like same clicks as phones) and could be multiple (pp < ff) gestures with stereo movement. Also could add high "drone" on A3 glissing to Bb3

// TODO: schedule clicks at slightly random intervals. could move to left and duplicate second on right
const fadeInEnv = new Tone.AmplitudeEnvelope({
  attack: 2,
  decay: 0.1,
  sustain: 1.0,
  release: 0.1
}).toDestination();
const fadeInClick = new Tone.Player(misc_sounds + 'clave-pingpong_loop.mp3').connect(fadeInEnv);
fadeInClick.loop = true;

tm.cue[10] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[10].cueTransition = function() {
  clickTransition.start();
};
tm.cue[10].goCue = function() {
  if (tm.getElapsedTimeInCue(10) < CUE_SOUND_WINDOW) {
    clavePingpong.volume.value = 0;
    clavePingpong.start();
    clavePingpong.volume.rampTo(-99, 3);
  }
  // need to reset upper loop parameters, which could change in cue 11
  fadeInClick.start();
  count_10 = 0;
};
tm.cue[10].triggerShakeSound = function() {
};
tm.cue[10].stopCue = function() {
  fadeInClick.stop();
};

// *******************************************************************
// CUE 11 (DIP) rising/decaying pulse. increasingly chaotic sounds (c. 60")
const loPitchArr_11 = ['G3', 'G3', 'G3', 'G3', 'Ab3', 'Ab3', 'Ab3', 'Ab3', 'G3', 'G3', 'G3', 'G3', 'Eb3', 'Eb3', 'Eb3', 'Eb3', 'Bb3', 'Bb3', 'Bb3', 'Bb3', 'Ab3', 'Ab3', 'Ab3', 'Ab3', 'C4', 'C4', 'C4', 'C4', 'G3', 'G3', GeS3, GeS3];
const midPitchArr_11 = ['G4', 'Ab4', 'G4', 'Eb4', 'Bb4', 'Ab4', 'C5', 'G4', GqS4, 'Ab4', 'G4', 'Eb4', 'Eb4', 'Db4', CqS4, 'C4', 'Bb4', 'Ab4', 'G4', 'Eb4', 'Eb4', 'F4', 'F4', 'G4', 'Ab4', 'F4', 'F4', 'Eb4', 'Eb4', 'G4', 'G4', 'Ab4'];
const hiPitchArr_11 = ['G5', 'G5', 'Ab5', 'Ab5', 'G5', 'G5', 'Eb5', 'Eb5', 'Bb5', 'Bb5', 'Ab5', 'Ab5', 'C6', 'C6', 'G5', GeS5, GqS5, GteS5, 'Ab5', 'Ab5', 'G5', 'G5', 'Eb5', 'Eb5', 'Eb5', 'Eb5', 'Db5', CteS5, CqS5, CeS5, 'C5', 'C5'];
let count_11 = 0;

tm.cue[11] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[11].cueTransition = function() {
  revVibeSampler.volume.value = -9;
  revVibeSampler.triggerAttackRelease(['D5', 'D6'], 2);
};
tm.cue[11].goCue = function() {
  if (tm.getElapsedTimeInCue(11) < CUE_SOUND_WINDOW) {
    vibeSampler.triggerAttackRelease('Db4', 5);
    vibeSampler.triggerAttackRelease('Db5', 5, '+0.1');
  }
  // upper of two loops is same as cue 10, but lower is different
  loopHi_10.start();
  loopLo_11.start();
  count_11 = 0;
};
tm.cue[11].updateTiltSounds = function() {
};
tm.cue[11].triggerDipSound = function() {
  if (limit_11 > 0) {
    let time_11 = tm.getElapsedTimeInCue(11);
    // rotate array selection among three voices (and separate arrays)
    let arr_11, inst_11;
    if (count_11 % 3 === 2) {
      arr_11 = hiPitchArr_11;
      inst_11 = bellSampler;
    } else if (count_11 % 3 === 1) {
      arr_11 = midPitchArr_11;
      inst_11 = vibeSampler;
    } else {
      arr_11 = loPitchArr_11;
      // REVISION idea: replace with a different instrument? like a pot or bowl
      inst_11 = pianoSampler;
    }
    // select pitch index for array
    let index_11 = Math.floor(time_11 / 2000);
    // stay on last pitch of array if last pitch is reached
    if (index_11 > arr_11.length - 1) {
      index_11 = arr_11.length - 1;
    }
    inst_11.triggerAttackRelease(arr_11[index_11], 5);
    sineTails.triggerAttackRelease(arr_11[index_11], 4);
    // alternating loops also gradually gliss apart then gliss up and fade out
    let bend;
    let bendSelector = Math.random();
    if (bendSelector < 0.3) {
      // randomly assigned to bend down half step
      bend = halfStepDown;
    } else if (bendSelector > 0.7) {
      bend = halfStepUp;
    } else {
      // 40% of phones don't bend until end of section
      bend = 1;
    }
    if (count_11 % 2) {
      loopLo_11.playbackRate = tm.getSectionBreakpoints(11, [0, 1, 20000, 1, 40000, bend, 50000, 2]);
      loopLo_11.volume.value = tm.getSectionBreakpoints(11, [0, 0, 40000, 0, 50000, -24]);
      ampEnvLo_11.triggerAttackRelease(0.1);
    } else {
      loopHi_10.playbackRate = tm.getSectionBreakpoints(11, [0, 1, 20000, 1, 40000, bend, 50000, 2]);
      loopHi_10.volume.value = tm.getSectionBreakpoints(11, [0, 0, 40000, 0, 50000, -24]);
      ampEnvHi_10.triggerAttackRelease(0.1);
    }
    count_11++;
    limit_11--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of dips.`);
  }
  displayDipsLeft(limit_11);
};
tm.cue[11].triggerDipReset = function() {
};
tm.cue[11].stopCue = function() {
  loopHi_10.stop();
  loopLo_11.stop();
};

// *******************************************************************
// CUE 12 (SHAKE) peak variety, cresc drone in fixed media, cutoff (c. 60")
const loPitchArr_12 = [GqS3, GqS3, GteS3, GteS3, 'Ab3', 'Ab3', 'Ab3', 'Ab3', 'G3', 'G3', 'G3', 'G3', 'Eb3', 'Eb3', 'Eb3', 'Eb3', 'Eb3', 'Eb3', 'Eb3', 'Eb3', 'Db3', 'Db3', CteS3, CteS3, CqS3, CqS3, CeS3, CeS3, 'C3', 'C3', 'C3', 'C3'];
// mid pitch line is same as from cue 10
const hiPitchArr_12 = ['Bb5', 'Bb5', 'Ab5', 'Ab5', 'G5', 'G5', 'Eb5', 'Eb5', 'Eb5', 'Eb5', 'F5', 'F5', 'F5', 'F5', 'G5', 'G5', 'Ab5', 'Ab5', 'F5', 'F5', 'F5', 'F5', 'Eb5', 'Eb5', 'Eb5', 'Eb5', 'G5', 'G5', 'G5', 'G5', 'Ab5', 'Ab5'];
let count_12 = 0;

tm.cue[12] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[12].cueTransition = function() {
  revVibeSampler.volume.value = -9;
  revVibeSampler.triggerAttackRelease([GqS4, GqS5], 2);
};
tm.cue[12].goCue = function() {
  if (tm.getElapsedTimeInCue(12) < CUE_SOUND_WINDOW) {
    vibeSampler.triggerAttackRelease('Ab4', 5);
    vibeSampler.triggerAttackRelease('Ab5', 5, '+0.1');
  }
  count_12 = 0;
};
tm.cue[12].triggerShakeSound = function() {
  if (limit_12 > 0) {
    let time_12 = tm.getElapsedTimeInCue(12);
    // rotate array selection among three voices (and separate arrays) OR clicks
    let arr_12, inst_12;
    if (count_12 % 4 === 3) {
      clickFading.playbackRate = tm.getSectionBreakpoints(12, [0, 1, 60000, 2]);
      clickFading.start();
    } else {
      // pitched sounds only triggered if clicking sound is not
      if (count_12 % 4 === 2) {
        arr_12 = hiPitchArr_12;
        inst_12 = bellSampler;
      } else if (count_12 % 4 === 1) {
        arr_12 = midPitchArr_11; // mid voice is same as cue 11
        inst_12 = vibeSampler;
      } else {
        arr_12 = loPitchArr_12;
        inst_12 = pianoSampler;
      }
      // select pitch index for array
      let index_12 = Math.floor(time_12 / 2000);
      // stay on last pitch of array if last pitch is reached
      if (index_12 > arr_12.length - 1) {
        index_12 = arr_12.length - 1;
      }
      inst_12.triggerAttackRelease(arr_12[index_12], 5);
      sineTails.triggerAttackRelease(arr_12[index_12], 4);
      // higher bell is 2 oct. higher and 0.1 sec later. Get freq and mult by 4
      let index = count_12 % midPitchArr_11.length;
      let hiPitch = (Tone.Frequency(midPitchArr_11[index]).toFrequency()) * 4;
      bellSampler.triggerAttackRelease(hiPitch, 5, '+0.1');
    }
    count_12++;
    limit_12--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of shakes.`);
  }
  displayShakesLeft(limit_12);
};
tm.cue[12].stopCue = function() {
};

// *******************************************************************
// CUE 13 (DIP) much calmer, residual buzz, melty pitches (c. 60")
let count_13 = 0;

tm.cue[13] = new TMCue('dip', WAIT_TIME, NO_LIMIT);

// NOTE: in fixed media, use cueTransition() to trigger final whooshing sound with sudden cutoff (can also use to trigger release of fixed media drone). For fixed media sound that continues, use slow fade in triggered by [13].goCue()

tm.cue[13].cueTransition = function() {
  revVibeSampler.volume.value = -9;
  revVibeSampler.triggerAttackRelease('C5', 2);
  clickTransition.start();
};
tm.cue[13].goCue = function() {
  if (tm.getElapsedTimeInCue(13) < CUE_SOUND_WINDOW) {
    pianoSampler.triggerAttackRelease('Bb2', 10);
    chimeSampler.triggerAttackRelease('Bb6', 5, '+0.2');
  }
  monoSine.volume.value = -40;
  count_13 = 0;
};
tm.cue[13].updateTiltSounds = function() {
  let buzzVol;
  if (tm.accel.y < 0.2) {
    // both synths bend pitch down with DIP reset, but buzzy bends more
    buzzySynth.detune.value = -100;
    monoSine.detune.value = -50;
    buzzySynth.volume.value = -60;
  } else if (tm.accel.y < 0.45) {
    buzzySynth.detune.value = -((0.45 - tm.accel.y) * 400);// 0-100 cents down
    monoSine.detune.value = -50;
    // buzzySynth fades in and out
    buzzVol = -24 - (0.45 - tm.accel.y) * 144; // -24 to -60dB
    buzzySynth.volume.rampTo(buzzVol, tm.motionUpdateInSeconds);
  } else if (tm.accel.y < 0.7) {
    // synths detune independently
    buzzySynth.detune.value = 0;
    monoSine.detune.value = -((0.7 - tm.accel.y) * 200); // 0 to 50 cents down
    buzzVol = -60 + (0.7 - tm.accel.y) * 144; // -60 to -24dB
    buzzySynth.volume.rampTo(buzzVol, tm.motionUpdateInSeconds);
  } else {
    buzzySynth.detune.value = 0;
    monoSine.detune.value = 0;
    buzzySynth.volume.value = -60;
  }
};
tm.cue[13].triggerDipSound = function() {
  if (limit_13 > 0) {
    let time_13 = tm.getElapsedTimeInCue(13);
    // alternate selection from upper and lower voice of canon
    let arr_13 = (count_13 % 2) ? hiPitchArr_5 : loPitchArr_5;
    let index_13 = Math.floor(time_13 / 2000);
    // stay on last pitch of array if last pitch is reached
    if (index_13 > arr_13.length - 1) {
      index_13 = arr_13.length - 1;
    }
    // pitches taken from earlier canon but transposed to Ab, then bending down
    let P4 = halfStepUp ** 5;
    let M3 = halfStepUp ** 4;
    let bend = tm.getSectionBreakpoints(13, [0, P4, 32000, P4, 60000, M3]);
    let pitch = (Tone.Frequency(arr_13[index_13]).toFrequency()) * bend;
    let inst = (count_13 % 2) ? bellSampler : vibeSampler;
    inst.triggerAttackRelease(pitch, 5);
    buzzySynth.triggerAttack(pitch * 2);
    monoSine.triggerAttack(pitch * 4);
    limit_13--;
    count_13++;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of dips.`);
  }
  displayDipsLeft(limit_13);
};
tm.cue[13].triggerDipReset = function() {
  buzzySynth.triggerRelease();
  monoSine.triggerRelease();
};
tm.cue[13].stopCue = function() {
  buzzySynth.triggerRelease();
  monoSine.triggerRelease();
};

// *******************************************************************
// CUE 14 (SHAKE) very low density, fading buzzes and melts (c. 30")
// also includes slower synchronized clave clicks.
// Fixed media can have same sync'd click loop on goCue, maybe fading out
let count_14 = 0;

const ampEnv_14 = new Tone.AmplitudeEnvelope({
  attack: 0.25,
  decay: 0.2,
  sustain: 1.0,
  release: 4,
}).toDestination();
const claveLoop_14 = new Tone.Player(misc_sounds + 'clave-solo_loop.mp3').connect(ampEnv_14);
claveLoop_14.loop = true;

tm.cue[14] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[14].cueTransition = function() {
  revVibeSampler.volume.value = -9;
  revVibeSampler.triggerAttackRelease(['F#4', 'D6'], 2);
};
tm.cue[14].goCue = function() {
  if (tm.getElapsedTimeInCue(14) < CUE_SOUND_WINDOW) {
    vibeSampler.triggerAttackRelease('E4', 5);
    vibeSampler.triggerAttackRelease('E5', 5, '+0.25');
  }
  chimeSampler.volume.value = -18;
  sparklyTailSampler.volume.value = -18;
  claveLoop_14.playbackRate = 1;
  claveLoop_14.volume.value = 0;
  claveLoop_14.start();
  count_14 = 0;
};
tm.cue[14].triggerShakeSound = function() {
  if (limit_14 > 0) {
    let time_14 = tm.getElapsedTimeInCue(14);
    // alternate canon voices. lower voice is same as last cue, higher changes
    let arr_14 = (count_14 % 2) ? hiPitchArr_6 : loPitchArr_5;
    let index_14 = Math.floor(time_14 / 2000);
    // only go through first 16 notes of array, cue 15 continues with next note
    if (index_14 > 15) {
      index_14 = 15;
    }
    // pitches taken from earlier canon but transposed to G, then bending down
    let M3 = halfStepUp ** 4;
    let m3 = halfStepUp ** 3;
    let bend = tm.getSectionBreakpoints(14, [0, M3, 32000, m3]);
    let pitch = (Tone.Frequency(arr_14[index_14]).toFrequency()) * bend;
    let inst = (count_14 % 2) ? bellSampler : vibeSampler;
    inst.triggerAttackRelease(pitch, 5);
    // chime sounds just after first sound, but is either 1 or 2 octaves higher
    let oct_14 = (count_14 % 2) ? 2 : 4;
    chimeSampler.triggerAttackRelease(pitch * oct_14, 2, '+0.1');
    let sparklyPitch = 440 + Math.random() * 200;
    sparklyTailSampler.triggerAttackRelease(sparklyPitch, 5);
    // slower synchronized clave clicks
    ampEnv_14.triggerAttackRelease(0.5);
    limit_14--;
    count_14++;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of shakes.`);
  }
  displayShakesLeft(limit_14);
};
tm.cue[14].stopCue = function() {
  claveLoop_14.stop();
};

// *******************************************************************
// CUE 15 (DIP) continuation of cue 14 with very few dips (c. 30"), followed by decelerating and dimin clave clicks
// pitch idea: go to 3-vox canon but no more bend (so stable at up minor 3rd)
let count_15 = 0;
const hiPitchArr_15 = ['F5', 'F5', 'Ab5', 'Ab5', 'Ab5', 'Ab5', 'Bb5', 'Bb5', 'Bb5', 'Bb5', 'Gb5', 'Gb5', 'Gb5', 'Gb5', 'F5', 'F5'];
const midPitchArr_15 = ['Eb4', 'F4', 'Gb4', 'Bb4', 'Bb4', 'Ab4', 'Ab4', 'Gb4', 'F4', 'Ab4', 'Ab4', 'Bb4', 'Bb4', 'Gb4', 'Gb4', 'F4'];
const loPitchArr_15 = ['Bb3', 'Bb3', 'Bb3', 'Bb3', 'C4', 'C4', CeS4, CeS4, CqS4, CqS4, CteS4, CteS4, 'Db4', 'Db4', 'Db4', 'Db4'];

tm.cue[15] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[15].cueTransition = function() {
  revVibeSampler.volume.value = -9;
  revVibeSampler.triggerAttackRelease(['Db5', 'Gb5'], 2);
};
tm.cue[15].goCue = function() {
  if (tm.getElapsedTimeInCue(15) < CUE_SOUND_WINDOW) {
    pianoSampler.triggerAttackRelease('Bb3', 5);
    vibeSampler.triggerAttackRelease('F5', 5, '+0.25');
  }
  claveLoop_14.start();
  count_15 = 0;
};
tm.cue[15].updateTiltSounds = function() {
  // ice crunch from first cue returns
  if (tm.accel.y < 0.3) {
    pitchedIceLoop.volume.value = -99 + tm.accel.y * 197; // -99 to -40dB
    pitchedIceLoop.playbackRate = 1.15844; // retuned to D5
  } else if (tm.accel.y < 0.7) {
    pitchedIceLoop.volume.value = -40 + (tm.accel.y - 0.3) * 70; // 40 to -12dB
    pitchedIceLoop.playbackRate = 1.15844 + (tm.accel.y - 0.3) * 0.17215; //D-Eb
  } else {
    pitchedIceLoop.volume.value = -12 - (tm.accel.y - 0.7) * 290; //-12 to -99dB
    pitchedIceLoop.playbackRate = 1.2273; // Eb5
  }
};
tm.cue[15].triggerDipSound = function() {
  pitchedIceLoop.stop();
  if (limit_15 > 0) {
    let time_15 = tm.getElapsedTimeInCue(15);
    // rotate array selection among three voices (and separate arrays)
    let arr_15;
    if (count_15 % 3 === 2) {
      arr_15 = hiPitchArr_15;
    } else if (count_15 % 3 === 1) {
      arr_15 = midPitchArr_15;
    } else {
      arr_15 = loPitchArr_15;
    }
    // select pitch index for array
    let index_15 = Math.floor(time_15 / 2000);
    // stay on last pitch of array if last pitch is reached
    if (index_15 > arr_15.length - 1) {
      index_15 = arr_15.length - 1;
    }
    vibeSampler.triggerAttackRelease(arr_15[index_15], 5);
    sineTails.triggerAttackRelease(arr_15[index_15], 4);
    // also trigger dimin/decel clave clicks, which continue until dip reset
    claveLoop_14.playbackRate = tm.getSectionBreakpoints(15, [0, 1, 10000, 1, 30000, 0.75]);
    claveLoop_14.volume.value = tm.getSectionBreakpoints(15, [0, -6, 10000, -6, 30000, -32]);
    ampEnv_14.triggerAttack();
    count_15++;
    limit_15--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of dips.`);
  }
  displayDipsLeft(limit_15);
};
tm.cue[15].triggerDipReset = function() {
  ampEnv_14.triggerRelease();
  // slushy ice sounds only available when there are DIPS remaining
  if (limit_15 > 0) {
    pitchedIceLoop.start();
  }
};
tm.cue[15].stopCue = function() {
  pitchedIceLoop.stop();
  ampEnv_14.triggerRelease();
  claveLoop_14.stop();
};

// *******************************************************************
// CUE 16: finished
tm.cue[16] = new TMCue('finished', 0, NO_LIMIT);
tm.cue[16].goCue = function() {
};
