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
// TODO: delete unused paths
const perc_sounds = 'tonemotion-shared/audio/perc/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const bell_sounds = 'tonemotion-shared/audio/bells/';
const harp_sounds = 'tonemotion-shared/audio/harp/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const piano_sounds = 'tonemotion-shared/audio/piano/';
const glass_sounds = 'tonemotion-shared/audio/glass/';

Tone.Transport.bpm.value = 156;
const halfStep = 2 ** (1 / 12);
const DqS4 = 220 * ((2**(1/24))**11); // D quarter-sharp 4
const AqS4 = 440 * (2**(1/24)); // A quarter-sharp 4
const DsS5 = 440 * ((2**(1/36))**16); // D sixth-sharp 5
const DqS5 = 440 * ((2**(1/24))**11); // D quarter-sharp 5
const DtS5 = 440 * ((2**(1/36))**17); // D third-sharp 5
const AsS5 = 880 * (2**(1/36)); // A sixth-sharp 5
const AqS5 = 880 * (2**(1/24)); // A quarter-sharp 5
const AtS5 = 880 * ((2**(1/36))**2); // A third-sharp 5

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
// can add tremolo by increasing depth of sinTremolo
// 1 sec attack and 3 sec release means up to 16 vox may be allocated with SHAKE
const sinTremolo = new Tone.Tremolo(4, 0.0).toDestination().start();
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
    release: 1,
    releaseCurve: "linear",
  },
  volume: -28,
}).connect(sinTremolo);

// sampler using vibes (with rattan sticks) and struck glass "bell" sounds
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

const harpSampler = new Tone.Sampler({
  urls: {
    'G3': 'harpG3.mp3',
    'B3': 'harpB3.mp3',
    'D4': 'harpD4.mp3',
    'G4': 'harpG4.mp3',
    'B4': 'harpB4.mp3',
    'D5': 'harpD5.mp3',
    'G5': 'harpG5.mp3',
  },
  baseUrl: harp_sounds,
});
const harpSamplerVol = new Tone.Volume(0);
harpSampler.chain(harpSamplerVol, Tone.Destination);

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

// TODO: delete unused instruments
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
}).toDestination();
fmSynth.oscillator.partials = [1, 0, 0, 0.25];
function fmSynthDefaults() {
  fmSynth.envelope.attack = 1;
  fmSynth.envelope.attackCurve = 'exponential';
  fmSynth.envelope.release = 2;
  fmSynth.envelope.releaseCurve = 'exponential';
  fmSynth.modulationEnvelope.attack = 1;
  fmSynth.modulationEnvelope.attackCurve = 'exponential';
  fmSynth.modulationEnvelope.release = 10;
  fmSynth.modulationEnvelope.releaseCurve = 'exponential';
  fmSynth.detune.value = 0;
  // keep volume out because I want to set it independently by cue
}
function fmSynthPreset2() {
  fmSynth.envelope.attack = 3;
  fmSynth.envelope.attackCurve = 'linear';
  fmSynth.envelope.release = 3;
  fmSynth.envelope.releaseCurve = 'linear';
  fmSynth.modulationEnvelope.attack = 3;
  fmSynth.modulationEnvelope.attackCurve = 'linear';
  fmSynth.modulationEnvelope.release = 3;
  fmSynth.modulationEnvelope.releaseCurve = 'linear';
  fmSynth.detune.value = 0;
  // keep volume out because I want to set it independently by cue
}

// reversed cymbal sound to use at ends of some sections
const revCym = new Tone.Player(perc_sounds + 'revCym.mp3').toDestination();

const triangle = new Tone.Player(perc_sounds + 'triangle.mp3').toDestination();
triangle.volume.value = -12;

const clave = new Tone.Player(perc_sounds + 'clave.mp3').toDestination();
clave.volume.value = -18;

// *******************************************************************
// CUE 0: piece is in "waiting" state by default
tm.cue[0] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 1: SHAKE tutorial

tm.cue[1] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[1].goCue = function() {
};
tm.cue[1].triggerShakeSound = function() {
  clave.start();
};
tm.cue[1].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 2: tacet tutorial
tm.cue[2] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[2].goCue = function() {
  // nothing to play
};
tm.cue[2].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 3: DIP tutorial
// TODO: write DIP tutorial. Could use very quiet TILT tutorial from earlier and add loud clave with dip. Or just use clave?
tm.cue[3] = new TMCue('dip', 0, NO_LIMIT);
tm.cue[3].goCue = function() {
};
tm.cue[3].updateTiltSounds = function() {
};
tm.cue[3].triggerDipSound = function() {
  clave.start();
}
tm.cue[3].stopCue = function() {
};

// *******************************************************************
// Section DIP/SHAKE limits, which are reset in 2 spots - define here only once
const LIMIT_5 = 931; // after testing, remove 9 (to make this 31)
const LIMIT_6 = 941; // remove 9 (to make this 41)
// need to define pitch array here in order to set LIMIT_7 from array length
const pitchArr_7 = ['Eb3', 'Eb4', 'Eb5', 'D4', 'Eb4', 'D5', 'G4', 'D3', 'C4', 'Eb5', 'D4', 'Bb3', 'G5', 'Eb4', 'Eb3', DqS4, 'C5', 'D4', 'Eb4', 'D5', 'G4', 'G3', 'G4', 'Bb4', 'A4', AqS4, 'Eb5', 'Bb4'];
const LIMIT_7 = pitchArr_7.length;
const pitchArr_8 = ['C3', 'C4', DqS5, 'D4', 'Eb4', 'D5', 'G4', 'D3', 'G4', 'Eb5', 'F4', 'G5', 'F4', 'Eb4', 'Bb2', 'D4', 'G5', 'F4', 'A5', 'F4', 'G4', 'Eb3', 'G4', AqS5, 'Eb4', 'Bb5', 'Eb4', 'D4'];
const LIMIT_8 = pitchArr_8.length;
const LIMIT_9 = 921; // after testing, remove 9

// *******************************************************************
// CUE 4: sets status to 'waitingForPieceToStart' AND resets all cue counters
tm.cue[4] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
  // reset ALL counters here, so that people can start and stop during piece and keep their counters intact, but I can reset every counter with this cue
  limit_5 = LIMIT_5;
  limit_6 = LIMIT_6;
  limit_7 = LIMIT_7;
  limit_8 = LIMIT_8;
  limit_9 = LIMIT_9;
};
tm.cue[4].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 5 (DIP): 1st section. Ice crunch tilt with gong (partials over Eb1)
let limit_5 = LIMIT_5; // limit of audience DIPS in section
// lower voice of canon (32 notes @ 2sec. per note, so section should be ~64s.)
const loPitchArr_5 = ['Eb4', 'D4', 'Eb4', 'G4', 'C4', 'D4', 'Bb3', 'Eb4', DqS4, 'D4', 'Eb4', 'G4', 'G4', 'A4', AqS4, 'Bb4', 'C4', 'D4', 'Eb4', 'G4', 'G4', 'F4', 'F4', 'Eb4', 'D4', 'F4', 'F4', 'G4', 'G4', 'Eb4', 'Eb4', 'D4'];
// upper voice of canon
const hiPitchArr_5 = ['Eb5', 'Eb5', 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'C5', 'C5', 'D5', 'D5', 'Bb4', 'Bb4', 'Eb5', 'Eb5', DtS5, DsS5, 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'G5', 'G5', 'A5', 'A5', AsS5, AtS5, 'Bb5', 'Bb5'];

tm.cue[5] = new TMCue('dip', 0, NO_LIMIT);
tm.cue[5].goCue = function() {
  // turn off motion testing to optimize motionUpdateLoop
  tm.shouldTestMotion = false;
};
tm.cue[5].updateTiltSounds = function() {
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
tm.cue[5].triggerDipSound = function() {
  pitchedIceLoop.stop();
  if (limit_5 > 0) {
    // still got DIPS left, so find time elapsed to determine pitch to play
    let time_5 = tm.getElapsedTimeInCue(5);
    // alternate selection from upper and lower voice of canon
    let arr_5 = (limit_5 % 2) ? loPitchArr_5 : hiPitchArr_5;
    let index_5 = Math.floor(time_5 / 2000);
    // stay on last pitch of array if last pitch is reached
    if (index_5 > arr_5.length - 1) {
      index_5 = arr_5.length - 1;
    }
    vibeSampler.triggerAttackRelease(arr_5[index_5], 5);
    limit_5--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of dips.`);
  }
  displayDipsLeft(limit_5);
};
tm.cue[5].triggerDipReset = function() {
  // slushy ice sounds only available when there are DIPS remaining
  if (limit_5 > 0) {
    pitchedIceLoop.start();
  }
};
tm.cue[5].stopCue = function() {
  pitchedIceLoop.stop();
};

// *******************************************************************
// CUE 6 (SHAKE): continuation of canon
let limit_6 = LIMIT_6; // limit of audience SHAKES in section
const hiPitchArr_6 = ['C5', 'C5', 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'G5', 'G5', 'F5', 'F5', 'F5', 'F5', 'Eb5', 'Eb5', 'D5', 'D5', 'F5', 'F5', 'F5', 'F5', 'G5', 'G5', 'G5', 'G5', 'Eb5', 'Eb5', 'Eb5', 'Eb5', 'D5', 'D5'];

tm.cue[6] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[6].goCue = function() {
  // TODO: add sound that announces new section. Could be here or could be a transition sound (which should now be connected to cue[6]). Could use reverse of sparklyTailSampler, so rev sound turns sparkly
  sparklyTailSampler.volume.value = -18;
};
tm.cue[6].triggerShakeSound = function() {
  if (limit_6 > 0) {
    // still got SHAKES left, so find time elapsed to determine pitch to play
    let time_6 = tm.getElapsedTimeInCue(6);
    // alternate selection from upper and lower voice of canon
    // (lower voice of canon is same pitches as cue 5)
    let arr_6 = (limit_6 % 2) ? loPitchArr_5 : hiPitchArr_6;
    let index_6 = Math.floor(time_6 / 2000);
    // stay on last pitch of array if last pitch is reached
    if (index_6 > arr_6.length - 1) {
      index_6 = arr_6.length - 1;
    }
    vibeSampler.triggerAttackRelease(arr_6[index_6], 5);
    let sparklyPitch = 440 + Math.random() * 200;
    sparklyTailSampler.triggerAttackRelease(sparklyPitch, 5);
    limit_6--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of shakes.`);
  }
  displayShakesLeft(limit_6);
};
tm.cue[6].stopCue = function() {
  // nothing to do here?
};

// *******************************************************************
// CUE 7 (DIP): accelerating clicks leading to 3-vox cannon (pitches in array)
let limit_7 = LIMIT_7; // limit of audience DIPS in section
bellSampler.release = 0.8; // bells pitched very low require gentler fade out
let count_7 = 0;

tm.cue[7] = new TMCue('dip', 0, NO_LIMIT);
// TODO: add more prominent cueTransition sound here. Could use similar reversed sparkles, but consider downbeat sound (maybe on goCue not cueTransition), which should have a clear pitch. Maybe not Eb. Maybe C? If using downbeat sound on goCue, don't forget getElapsedTimeInCue check to prevent retrigger if someone stops and starts again
tm.cue[7].goCue = function() {
  count_7 = 0;
};
tm.cue[7].updateTiltSounds = function() {
  if (tm.accel.y < 0.3) {
    pingpongClickLoop.volume.value = -99 + tm.accel.y * 197; // -99 to -40dB
    pingpongClickLoop.playbackRate = 0.75;
  } else if (tm.accel.y < 0.7) {
    pingpongClickLoop.volume.value = -40 + (tm.accel.y - 0.3) * 70; // 40 to -12dB
    pingpongClickLoop.playbackRate = 0.75 + (tm.accel.y - 0.3) * 3.125; // 0.75x - 2x
  } else {
    pingpongClickLoop.volume.value = -12 - (tm.accel.y - 0.7) * 290; //-12 to -99dB
    pingpongClickLoop.playbackRate = 2;
  }
};
tm.cue[7].triggerDipSound = function() {
  pingpongClickLoop.stop();
  if (limit_7 > 0) {
    bellSampler.triggerAttackRelease(pitchArr_7[count_7], 5);
    count_7++;
    limit_7--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of dips.`);
  }
  displayDipsLeft(limit_7);
};
tm.cue[7].triggerDipReset = function() {
  if (limit_7 > 0) {
    pingpongClickLoop.start();
  }
};
tm.cue[7].stopCue = function() {
  pingpongClickLoop.stop();
};

// *******************************************************************
// CUE 8 (SHAKE): 3-vox canon with 2-oct bells (higher note has feedback delay)
let limit_8 = LIMIT_8; // limit of audience SHAKE in section
let count_8 = 0;

tm.cue[8] = new TMCue('shake', 0, NO_LIMIT);
// TODO: decide on transition sounds?
tm.cue[8].goCue = function() {
  count_8 = 0;
  bellDelay.delayTime.value = 0.15 + Math.random() * 0.13;
};
tm.cue[8].triggerShakeSound = function() {
  if (limit_8 > 0) {
    // higher bell with feedback delay is 2 oct. higher. Get freq and mult by 4
    let hiPitch = (Tone.Frequency(pitchArr_8[count_8]).toFrequency()) * 4;
    bellDelaySampler.triggerAttackRelease(hiPitch, 5);
    bellSampler.triggerAttackRelease(pitchArr_8[count_8], 5);
    count_8++;
    limit_8--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of shakes.`);
  }
  displayShakesLeft(limit_8);
};
tm.cue[8].stopCue = function() {

};

// *******************************************************************
// CUE 9 (DIP) increased accel/decel clicks with restricted canon
let limit_9 = LIMIT_9; // limit of audience DIPS in section
// everyone is randomly assigned one of three clicky loops to control on y-axis
const clickLoop_9 = tm.pickRand([claveLoop, ziplockLoop, pingpongClickLoop]);
const loopArr_9 = ['Eb5', 'D5', 'Eb5', 'G5', 'C5', 'D5', DqS5, 'Eb5'];
let count_9 = 0;
let playCanon_9 = true;

tm.cue[9] = new TMCue('dip', 0, NO_LIMIT);
tm.cue[9].goCue = function() {
  // everyone is randomly assigned a part: either a time-based slow middle voice of canon, or an array-based loop based on opening of canon
  if (Math.random() > 0.5) {
    playCanon_9 = false;
  } else {
    playCanon_9 = true;
  }
  count_9 = 0;
  clickLoop_9.volume.value = -99; // start clicks muted
  clickLoop_9.start();
};
tm.cue[9].updateTiltSounds = function() {
  if (tm.accel.y < 0.2) {
    clickLoop_9.volume.value = -99;
    clickLoop_9.playbackRate = 0.5;
  } else if (tm.accel.y < 0.4) {
    clickLoop_9.volume.value = -99 + (tm.accel.y - 0.2) * 435; // -99 to -12 dB
    clickLoop_9.playbackRate = 0.5 + (tm.accel.y - 0.2) * 2.5; // 0.5 to 1
  } else if (tm.accel.y < 0.7) {
    clickLoop_9.volume.value = -12 + (tm.accel.y - 0.4) * 20; // -12 to -6 dB
    clickLoop_9.playbackRate = 1 + (tm.accel.y - 0.4) * 3.333; // 1 to 2
  } else {
    clickLoop_9.volume.value = -6;
    clickLoop_9.playbackRate = 2;
  }
};
tm.cue[9].triggerDipSound = function() {
  if (limit_9 > 0) {
    if (playCanon_9) {
      // randomly assigned to play middle voice of canon
      let time_9 = tm.getElapsedTimeInCue(9);
      let index_9 = Math.floor(time_9 / 4000); // 4 seconds for each note
      // only go through first 16 notes of canon voice
      if (index_9 > 15) {
        index_9 = 15;
      }
      // TODO: replace vibeSampler with new "glassSampler" ?
      vibeSampler.triggerAttackRelease(loPitchArr_5[index_9], 5);
      sineTails.triggerAttackRelease(loPitchArr_5[index_9], 6);
    } else {
      // randomly assigned to play array-based loop
      let index_9 = count_9 % loopArr_9.length;
      bellSampler.triggerAttackRelease(loopArr_9[index_9], 5);
      count_9++;
    }
    limit_9--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of dips.`);
  }
  if (limit_9 === 0) {
    // no more clicky sounds if you've used all your dips, but stop on last dip
    clickLoop_9.stop();
  }
  displayDipsLeft(limit_9);
};
tm.cue[9].triggerDipReset = function() {
};
tm.cue[9].stopCue = function() {
  clickLoop_9.stop();
};



//
// // *******************************************************************
// // CUE 6:
// const pitchArr_6 = ['G3', 'A3', 'Bb3', 'C4', 'G4', 'A4', 'Bb4', 'C5', 'G5', 'A5', 'Bb5', 'C6'];
// const arrLen_6 = pitchArr_6.length;
// const hiPitchArr_6 = ['G6', 'A6', 'Bb6', 'C7'];
// const hiArrLen_6 = hiPitchArr_6.length;
//
// const softBellLoop_6 = new Tone.Loop((time) => {
//   envVibeSampler.triggerAttackRelease(pitchArr_6[count_6 % arrLen_6], '4n');
//   count_6++;
// }, '16n');
//
// let limit_6 = 21;
// let count_6 = 0;
//
//
// const vibEnv = new Tone.AmplitudeEnvelope({
//   attack: 0.1,
//   decay: 0.2,
//   sustain: 1.0,
//   release: 1
// }).toDestination();
// const envVibeSampler = new Tone.Sampler({
//   urls: {
//     'F3': 'vibe_bell-F3.mp3',
//     'A3': 'vibe_bell-A3.mp3',
//     'Db4': 'vibe_bell-Db4.mp3',
//     'F4': 'vibe_bell-F4.mp3',
//     'A4': 'vibe_bell-A4.mp3',
//     'Db5': 'vibe_bell-Db5.mp3',
//     'A5': 'vibe_bell-A5.mp3',
//     'Db6': 'vibe_bell-Db6.mp3',
//   },
//   baseUrl: vibes_sounds,
// }).connect(vibEnv);
//
// const sineSynth = new Tone.Synth({
//   oscillator: {
//     type: 'sine',
//   },
// }).toDestination();
//
// tm.cue[6] = new TMCue('dip', 4000, NO_LIMIT);
// tm.cue[6].cueTransition = function() {
//   // NOTE: the following test prevents transition sound if section was previously cued (e.g., in rehearsal if we go back to this cue)
//   if (tm.getElapsedTimeInCue(6) < 100) {
//     tm.publicLog('cueTransition() called');
//   }
// }
// tm.cue[6].goCue = function() {
//   count_6 = 0;
//   softBellLoop_6.start();
// };
// let vol_6, bend_6;
// tm.cue[6].updateTiltSounds = function() {
//   if (tm.accel.y < 0.2) {
//     vol_6 = -99 + tm.accel.y * 195;
//     sineSynth.volume.rampTo(vol_6, tm.motionUpdateInSeconds); // -99 to -60 dB
//   } else if (tm.accel.y < 0.5) {
//     vol_6 = -60 + (tm.accel.y - 0.2) * 160;
//     sineSynth.volume.rampTo(vol_6, tm.motionUpdateInSeconds); // -60 to -12 dB
//   } else if (tm.accel.y < 0.7) {
//     vol_6 = -12 + (tm.accel.y - 0.5) * 60;
//     sineSynth.volume.rampTo(vol_6, tm.motionUpdateInSeconds); // -12 to 0 dB
//   } else {
//     sineSynth.volume.value = 0; // BUT envelope release is trigged at this point
//   }
//   bend_6 = -(tm.accel.y * 1200); // bends up to octave down when upside down
//   sineSynth.detune.rampTo(bend_6, tm.motionUpdateInSeconds);
// }
// tm.cue[6].triggerDipSound = function() {
//   tm.publicLog('dip');
//
//   let time_6 = tm.getElapsedTimeInCue(6);
//
//   if (limit_6 > 0) {
//     // dip triggers bell sound + enveloped flurry of softer faster vibes loop
//     // bellSampler.triggerAttackRelease(hiPitchArr_6[Math.floor(time_6/2000) % hiArrLen_6], 3);
//     // vibEnv.triggerAttackRelease('8n');
//     clave.start();
//     sineSynth.triggerRelease();
//     limit_6--;
//     displayDipsLeft(limit_6);
//   } else {
//     displayDipsLeft(limit_6);
//     tm.publicWarning(`I'm sorry, but you're all out of dips.`);
//   }
// };
// tm.cue[6].triggerDipReset = function() {
//   if (limit_6 > 0) {
//     tm.publicLog('dip reset');
//     // TODO: randomize inital pitch
//     sineSynth.triggerAttack('A4');
//   }
// };
// tm.cue[6].stopCue = function() {
//   softBellLoop_6.stop();
//   sineSynth.triggerRelease();
// };
