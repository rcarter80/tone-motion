const tm = new ToneMotion();
tm.debug = false; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
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

// Instruments need global scope within this file, but can appear just above the first cue in which they sound
Tone.Transport.bpm.value = 120;

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// *******************************************************************
// CUE 1: tilt practice
var claveLoop = new Tone.Player(granulated_sounds + "claveLoop.mp3").toMaster();
claveLoop.loop = true;

// new demo sounds
const fmSynth = new Tone.FMSynth().toMaster();
const fmDrone = new Tone.FMSynth().toMaster();
fmDrone.volume.value = -12;
var fmPitch = 'E2';
var fmPitch2;
var fmPitchArr = ['E2', 'F#2', 'G2', 'A2', 'C3', 'D3', 'E3', 'F#3', 'G3', 'A3', 'C4', 'D4', 'E4'];
const fmLoop = new Tone.Loop((time) => {
	fmSynth.triggerAttackRelease(fmPitch, '16n');
  // var hertz = Tone.Frequency(fmPitch).toFrequency();
  // console.log(hertz);
  fmPitch2 = (Tone.Frequency(fmPitch).toFrequency() * 2);
  // fmSynth.triggerAttackRelease(fmPitch2, '8n', '+16n');
}, '8n');

tm.cue[1] = new TMCue('tilt', -1);
tm.cue[1].goCue = function() {
  // claveLoop.start();
  tm.publicMessage('During a section marked "tilt," your device will make sounds that respond to the position of your phone. In this case, you can mute your phone by holding it right-side up. The short, repeated sound gets louder, faster, and higher as you tip your phone upside down.');

  // HACK: Normally Transport would be triggered by tapping start button, but that's for fixed-cue interactive sites, and this is not meant to match any existing recording, so I'm just starting the transport here
  Tone.Transport.start();
  // fmLoop.start();
  fmSynth.triggerAttack(fmPitch);
  fmDrone.triggerAttack('E2');
};
tm.cue[1].updateTiltSounds = function() {
  // sound is full scale if phone is mostly upright. muted if upside down.
  if (tm.accel.y < 0.15) {
    // full-scale volume at y:0.15, roll off to silence if upright
    claveLoop.volume.value = (tm.accel.y * 660 - 99);
  } else {
    claveLoop.volume.value = 0;
  }
  // pitch and speed go up on y-axis
  claveLoop.playbackRate = 0.5 + tm.accel.y * 4.5;

  // select pitch based on notes in array but guard against corner case when tm.accel.x is exactly equal to 1.0
  fmPitch = fmPitchArr[Math.floor(tm.accel.x * 0.99 * fmPitchArr.length)];
  fmSynth.frequency.value = fmPitch;
};
tm.cue[1].stopCue = function() {
  claveLoop.stop();

  // fmLoop.stop();
  fmSynth.triggerRelease();
  fmDrone.triggerRelease();
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
  tm.publicMessage('During a section marked "shake," you can trigger sounds by shaking your phone. If you hold your phone still, it will not make sound.');
};
tm.cue[3].triggerShakeSound = function() {
  clave.start();
};
tm.cue[3].stopCue = function() {
  // nothing to clean up
};
