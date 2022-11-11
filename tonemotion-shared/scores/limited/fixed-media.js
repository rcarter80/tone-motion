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
const marimba_sounds = 'tonemotion-shared/audio/marimba/';

// interval and microtonal pitch definitions
const halfStepUp = 2 ** (1 / 12);
const halfStepDown = 1 / halfStepUp;
const GqS2 = 55 * ((2 ** (1 / 48)) ** 42); // G quarter-sharp 2
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
    attack: 3,
    attackCurve: "linear",
    decay: 0.1,
    decayCurve: "linear",
    sustain: 1,
    release: 3,
    releaseCurve: "linear",
  },
  volume: -28,
}).toDestination();
// a 2nd monophonic synth (identical to above) is needed for cue 11/12 overlap
const monoSine2 = new Tone.Synth({
  oscillator: {
    type: 'sine',
  },
  envelope: {
    attack: 3,
    attackCurve: "linear",
    decay: 0.1,
    decayCurve: "linear",
    sustain: 1,
    release: 3,
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

// bowed marimba time-stretched to 8-second sample (panned LEFT)
// TODO: try to switch back to WAV file that I allude to below, which caused issues with pushing to github
// NOTE: uses WAV, not MP3, because this is for good speaker playback
const bowedMarLeftPanner = new Tone.Panner(-1).toDestination();
const bowedMarSamplerL = new Tone.Sampler({
  urls: {
    'A3': 'bowed_marimba-A3_8sec.mp3',
  },
  baseUrl: marimba_sounds,
}).connect(bowedMarLeftPanner);
// bowed marimba time-stretched to 8-second sample (panned RIGHT)
// NOTE: uses WAV, not MP3, because this is for good speaker playback
const bowedMarRightPanner = new Tone.Panner(1).toDestination();
const bowedMarSamplerR = new Tone.Sampler({
  urls: {
    'A3': 'bowed_marimba-A3_8sec.mp3',
  },
  baseUrl: marimba_sounds,
}).connect(bowedMarRightPanner);
// bowed marimba time-stretched to 8-second sample (panned CENTER)
const bowedMarSamplerC = new Tone.Sampler({
  urls: {
    'E2': 'bowed_marimba-E2_8sec.mp3',
    'G2': 'bowed_marimba-E2_8sec.mp3',
  },
  baseUrl: marimba_sounds,
}).toDestination();

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
// CUE 4: sets status to 'waitingForPieceToStart', resets all phone cue counters
tm.cue[4] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
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
tm.cue[8] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[8].goCue = function() {
};
tm.cue[8].triggerShakeSound = function() {
};
tm.cue[8].stopCue = function() {
};

// *******************************************************************
// CUE 9 sine tails fading in (at first sounding like they come from phones)
let index_9 = 0;
const loopTimeL_9 = 4 + Math.random() * 2; // notes triggered every 4 to 6 sec.
const sineLoopL_9 = new Tone.Loop(function(time) {
  let time_9 = tm.getElapsedTimeInCue(9);
  let index_9 = Math.floor(time_9 / 2000); // 2 seconds for each note
  // only go through first 16 notes of canon voice
  if (index_9 > 15) {
    index_9 = 15;
  }
  sineTailsL.triggerAttackRelease(loPitchArr_5[index_9], 2);
}, loopTimeL_9);
const loopTimeR_9 = 4 + Math.random() * 2; // notes triggered every 4 to 6 sec.
const sineLoopR_9 = new Tone.Loop(function(time) {
  let time_9 = tm.getElapsedTimeInCue(9);
  let index_9 = Math.floor(time_9 / 2000); // 2 seconds for each note
  // only go through first 16 notes of canon voice
  if (index_9 > 15) {
    index_9 = 15;
  }
  sineTailsR.triggerAttackRelease(loPitchArr_5[index_9], 2);
}, loopTimeR_9);

tm.cue[9] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[9].goCue = function() {
  sineTailsL.volume.value = -60;
  sineTailsR.volume.value = -60;
  sineTailsL.volume.rampTo(-6, 25);
  sineTailsR.volume.rampTo(-6, 25);
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
// CUE 10 bowed marimba A3-Bb3, sporadic sync'd clicks pp < ff
const Bb3 = 220 * halfStepUp;
const bowedMarLoopL_10 = new Tone.Loop(function(time) {
  // linear slide from A3 to Bb3
  let pitch = tm.getSectionBreakpoints(10, [0, 220, 5000, 220, 25000, Bb3]);
  bowedMarSamplerL.triggerAttackRelease(pitch, 8.5);
}, 9);
const bowedMarLoopR_10 = new Tone.Loop(function(time) {
  // linear slide from A3 to Bb3
  let pitch = tm.getSectionBreakpoints(10, [0, 220, 5000, 220, 25000, Bb3]);
  bowedMarSamplerR.triggerAttackRelease(pitch, 8.5);
}, 9);

// synchronized pulse: clave ang ping pong loop with pp < ff and random panning
const fadeInEnv = new Tone.AmplitudeEnvelope({
  attack: 2,
  attackCurve: 'sine',
  decay: 0.1,
  sustain: 1.0,
  release: 0.1,
});
const fadeInPanner = new Tone.Panner(0).toDestination();
const fadeInClick = new Tone.Player(misc_sounds + 'clave-pingpong_loop.mp3').chain(fadeInEnv, fadeInPanner);
fadeInClick.loop = true;
const fadeClickTime_10 = 5 + (2 * Math.random())
const fadeClickLoop_10 = new Tone.Loop(function(time) {
  // set initial pan position randomly (-1 is hard left, 1, is hard right)
  let pan1 = -1 + (Math.random() * 2);
  fadeInPanner.pan.value = pan1;
  fadeInEnv.triggerAttackRelease(1.25);
  // pan quickly to second random position
  let pan2 = -1 + (Math.random() * 2);
  fadeInPanner.pan.rampTo(pan2, 1.25);
}, fadeClickTime_10);
// same as above but twice as fast (still synchronized, so rhythms interlock)
const fastFadeInEnv = new Tone.AmplitudeEnvelope({
  attack: 2,
  attackCurve: 'sine',
  decay: 0.1,
  sustain: 1.0,
  release: 0.1,
});
const fastFadeInPanner = new Tone.Panner(0).toDestination();
const fastFadeInClick = new Tone.Player(misc_sounds + 'clave-pingpong_loop.mp3').chain(fastFadeInEnv, fastFadeInPanner);
fastFadeInClick.playbackRate = 2;
fastFadeInClick.loop = true;
const fastFadeClickTime_10 = 5 + (2 * Math.random());
const fastFadeClickLoop_10 = new Tone.Loop(function(time) {
  // set initial pan position randomly (-1 is hard left, 1, is hard right)
  let pan1 = -1 + (Math.random() * 2);
  fastFadeInPanner.pan.value = pan1;
  fastFadeInEnv.triggerAttackRelease(1);
  // pan quickly to second random position
  let pan2 = -1 + (Math.random() * 2);
  fastFadeInPanner.pan.rampTo(pan2, 1);
}, fastFadeClickTime_10);

tm.cue[10] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[10].cueTransition = function() {
  clickTransition.volume.value = -9;
  clickTransition.start();
};
tm.cue[10].goCue = function() {
  if (tm.getElapsedTimeInCue(10) < CUE_SOUND_WINDOW) {
    vibeSampler.volume.value = -9;
    vibeSampler.triggerAttackRelease('G3', 5);
    clavePingpong.volume.value = -6;
    clavePingpong.start();
    clavePingpong.volume.rampTo(-99, 3);
  }
  bowedMarSamplerL.volume.value = -60;
  bowedMarSamplerL.volume.rampTo(-9, 25);
  bowedMarLoopL_10.start();
  bowedMarSamplerR.volume.value = -60;
  bowedMarSamplerR.volume.rampTo(-9, 25);
  bowedMarLoopR_10.start('+4.5'); // right channel is staggered from left
  fadeInClick.volume.value = -6;
  fadeInClick.start();
  fadeClickLoop_10.start();
  fastFadeInClick.volume.value = -6;
  fastFadeInClick.start();
  fastFadeClickLoop_10.start('+6');
};
tm.cue[10].triggerShakeSound = function() {
};
tm.cue[10].stopCue = function() {
  bowedMarLoopL_10.stop();
  bowedMarSamplerL.volume.rampTo(-60, 1);
  bowedMarLoopR_10.stop();
  bowedMarSamplerR.volume.rampTo(-60, 1);
  fadeInClick.stop();
  fadeClickLoop_10.stop();
  fastFadeClickLoop_10.stop();
};

// *******************************************************************
// CUE 11 (DIP) rising/decaying pulse. increasingly chaotic sounds (c. 60")

// TODO: Continuing clicks could now be one 8-note clave/pingpong/ziplock pattern that keep looping but slowly fades out before phones fade and gliss.

// sub-bass is routed through tremolo to use LFO to control amplitude
const tremolo_11 = new Tone.Tremolo(1.5, 1).toDestination().start();
tremolo_11.spread = 0; // by default, LFOs are out of phase in each channel
tremolo_11.type = "triangle";
const wobbleBass_11 = new Tone.Synth({
  // envelope times designed SPECIFICALLY for 16-second long notes
  envelope: {
    attack: 8,
    attackCurve: "linear",
    decay: 5,
    decayCurve: "linear",
    sustain: 0.1,
    release: 3,
    releaseCurve: "sine",
  }
}).connect(tremolo_11);
wobbleBass_11.oscillator.partials = [1, 0.5];

const bowedMarSampler16s = new Tone.Sampler({
  urls: {
    'G1': 'bowed_marimba-G3_16sec.mp3', // actually 2 octaves higher
  },
  baseUrl: marimba_sounds,
}).toDestination();

// 2-dimensional array uses 2nd element of subarray as pitch-bend flag
const subBassPitchArr_11 = [['G1', 1], ['Ab1', 0], ['G1', 0], ['Eb1', 0]];
let count_11 = 0;
const droneLoop_11 = new Tone.Loop(function(time) {
  wobbleBass_11.detune.value = 0;
  wobbleBass_11.triggerAttackRelease(subBassPitchArr_11[count_11][0], 12.9);
  bowedMarSampler16s.triggerAttackRelease(subBassPitchArr_11[count_11][0], 16);
  if (subBassPitchArr_11[count_11][1]) {
    wobbleBass_11.detune.rampTo(100, 16); // bend flag is true, so bend pitch up
  }
  if (count_11 < 3) {
    count_11++;
  } else {
    count_11 = 3; // stay on last note of array if section continues beyond 64"
  }
}, 16);

const downbeatThud_11 = new Tone.Player(misc_sounds + 'thud_Db2-C2.mp3').toDestination();

tm.cue[11] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[11].cueTransition = function() {
  revVibeSampler.volume.value = -12;
  revVibeSampler.triggerAttackRelease(['D5', 'D6'], 2);
};
tm.cue[11].goCue = function() {
  if (tm.getElapsedTimeInCue(11) < CUE_SOUND_WINDOW) {
    downbeatThud_11.volume.value = -3;
    downbeatThud_11.start();
    // REVISION idea: could justly tune below (e.g., to 10 / 14th partial of Db)
    vibeSampler.triggerAttackRelease('F5', 5, '+0.1');
    chimeSampler.triggerAttackRelease('B6', 5, '+0.2');
  }
  count_11 = 0;
  wobbleBass_11.volume.value = -18;
  wobbleBass_11.volume.rampTo(-6, 48);
  wobbleBass_11.envelope.release = 3; // release time changed in stopCue()
  bowedMarSampler16s.volume.value = -24;
  droneLoop_11.start();
};
tm.cue[11].updateTiltSounds = function() {
};
tm.cue[11].triggerDipSound = function() {
};
tm.cue[11].triggerDipReset = function() {
};
tm.cue[11].stopCue = function() {
  droneLoop_11.stop();
  wobbleBass_11.envelope.release = 1; // release to minimize cue 12 overlap
  wobbleBass_11.triggerRelease();
  bowedMarSampler16s.volume.rampTo(-60, 1);
};

// *******************************************************************
// CUE 12 (SHAKE) peak variety, cresc drone in fixed media, cutoff (c. 60")
// TODO: Transition could help boost tenor voice of canon (which is pianoSampler in phones). Downbeat sound maybe same as cue 11 but based on Bb2 and no gliss?

const loBowedMarSampler = new Tone.Sampler({
  urls: {
    'Bb1': 'bowed-marimba_Bb1-16s.mp3'
  },
  baseUrl: marimba_sounds,
}).toDestination();
const loBentBowedMarSampler = new Tone.Sampler({
  urls: {
    'G1': 'bowed-marimba_G1_Ab1-16s.mp3'
  },
  baseUrl: marimba_sounds,
}).toDestination();

// 2-dimensional array uses 2nd element of subarray as pitch-bend flag
const subBassPitchArr_12 = [['Bb1', 0], ['Ab1', 0], ['C2', 0], ['G1', 1]];
let count_12 = 0;
const droneLoop_12 = new Tone.Loop(function(time) {
  let inst_12;
  if (subBassPitchArr_12[count_12][1]) {
    // bend flag is true, so select sampler with built-in pitch bend
    inst_12 = loBentBowedMarSampler;
  } else {
    inst_12 = loBowedMarSampler;
  }
  inst_12.triggerAttackRelease(subBassPitchArr_12[count_12][0], 16);
  // TODO: decide if I actually want to support possibility of repeating last note or if I should set iterations to 4
  if (count_12 < 3) {
    count_12++;
  } else {
    count_12 = 3; // stay on last note of array if section continues beyond 64"
  }
}, 16);

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
  // TODO: set actual start volume and then use rampTo() to crescendo
  loBowedMarSampler.volume.value = -9;
  loBentBowedMarSampler.volume.value = -9;
  droneLoop_12.start();
};
tm.cue[12].triggerShakeSound = function() {
};
tm.cue[12].stopCue = function() {
  droneLoop_12.stop();
  loBowedMarSampler.volume.rampTo(-60, 1);
  loBentBowedMarSampler.volume.rampTo(-60, 1);
};

// *******************************************************************
// CUE 13 (DIP) much calmer, residual buzz, melty pitches (c. 60")
let count_13 = 0;

tm.cue[13] = new TMCue('dip', WAIT_TIME, NO_LIMIT);

// NOTE: in fixed media, use cueTransition() to trigger final whooshing sound with sudden cutoff (can also use to trigger release of fixed media drone). For fixed media sound that continues, use slow fade in triggered by [13].goCue(). Final woosh could be reversed sound but also use a whole big flurry of rising clicks? may need to go back and rescale previous clicks to softer. long sinusoidal tail in cue 13, but then tacet. Downbeat sound of cue 13 can also be flurry of detuned bells in stereo (single audio file made in Logic) + synthesized sinusoidal tail with very long decay

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
