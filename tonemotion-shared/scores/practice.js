const tm = new ToneMotion();
tm.debug = false; // if true, skips clock sync and shows console
tm.showConsoleOnLaunch = false;
tm.demoOnly = true;
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

// Shortcuts to audio file paths
const cello_sounds = 'tonemotion-shared/audio/cello/';
const chimes_sounds = 'tonemotion-shared/audio/chimes/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';
const glass_sounds = 'tonemotion-shared/audio/glass/';

// Instruments need global scope within this file, but can appear just above the first cue in which they sound
Tone.Transport.bpm.value = 120;

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// *******************************************************************
// CUE 1: TILT tutorial (volume and timbre on y-axis, pitch on x-axis)
const fmSynth = new Tone.FMSynth({
  envelope: {
    attack: 1,
    decay: 0.1,
    sustain: 1,
    release: 2,
  },
  modulationEnvelope: {
    attack: 1,
    decay: 0.1,
    sustain: 1,
    release: 10,
  },
  harmonicity: 0.125,
}).toMaster();
fmSynth.oscillator.partials = [1, 0, 0, 0.25];

let tiltPitchArr_tut = ['E4', 'E4', 'B4', 'E5', 'E5', 'F#5', 'G#5', 'A#5', 'B5'];
let len_tut = tiltPitchArr_tut.length;
tm.cue[1] = new TMCue('tilt', 0, NO_LIMIT);
tm.cue[1].goCue = function() {
  fmSynth.volume.value = -99;
  fmSynth.triggerAttack('E4');
  tm.publicMessage('During a section marked "tilt," you can control sounds by holding your phone in different positions. In this case, the tone you hear will be muted when your phone is upright, but will get louder and brighter as you tip your phone upside down. Additionally, you can control the note that you play. When you tilt your phone to the left, it will play lower notes, and when you tilt your phone to the right, it will play higher notes.');
};
tm.cue[1].updateTiltSounds = function() {
  fmSynth.frequency.value = tiltPitchArr_tut[Math.floor(tm.accel.x * 0.99 * len_tut)];
  let fmSynVol;
  if (tm.accel.y < 0.25) {
    // set volume with rampTo to avoid zipper noise
    fmSynVol = -18 - (0.25 - tm.accel.y) * 324; // -99 to -18 dB
    fmSynth.volume.rampTo(fmSynVol, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 1.5 - (0.25 - tm.accel.y) * 2; // 1 to 1.5
  } else if (tm.accel.y < 0.5) {
    fmSynth.volume.rampTo(-18, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 4 - (0.5 - tm.accel.y) * 10; // 1.5 to 4
  } else if (tm.accel.y < 0.75) {
    fmSynVol = -12 - (0.75 - tm.accel.y) * 24; // -18 to -12 dB
    fmSynth.volume.rampTo(fmSynVol, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 6 - (0.75 - tm.accel.y) * 8; // 4 to 6
  } else {
    fmSynth.volume.rampTo(-12, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 8 - (1.0 - tm.accel.y) * 8; // 6 to 8
  }
};
tm.cue[1].stopCue = function() {
  fmSynth.triggerRelease();
};

// *******************************************************************
// CUE 2: tacet tutorial. NOT USED FOR FIXED CUE SITES.
tm.cue[2] = new TMCue('tacet', -1);
tm.cue[2].goCue = function() {
  // nothing to play
}
tm.cue[2].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 3: shake practice
var clave = new Tone.Player(perc_sounds + 'clave.mp3').toMaster();

tm.cue[3] = new TMCue('shake', -1);
tm.cue[3].goCue = function() {
  tm.publicMessage('During a section marked "shake," you can trigger sounds by shaking your phone. Just flicking your wrist gently will play a sound, in this case just a short click. If you hold your phone still, it will not make sound.');
};
tm.cue[3].triggerShakeSound = function() {
  clave.start();
};
tm.cue[3].stopCue = function() {
  // nothing to clean up
};
