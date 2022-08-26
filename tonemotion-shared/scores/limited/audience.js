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
const harp_sounds = 'tonemotion-shared/audio/harp/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const piano_sounds = 'tonemotion-shared/audio/piano/';
const glass_sounds = 'tonemotion-shared/audio/glass/';

Tone.Transport.bpm.value = 156;
const halfStep = 2 ** (1 / 12);

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
// CUE 4: sets status to 'waitingForPieceToStart' AND resets all cue counters
tm.cue[4] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
  // reset ALL counters here, so that people can start and stop during piece and keep their counters intact, but I can reset every counter with this cue
  limit_5 = 21;
  limit_6 = 21;
};
tm.cue[4].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// sketched idea labeled "cue 5" but commented out
// let limit_5 = 21;
//
// tm.cue[5] = new TMCue('shake', 2000, NO_LIMIT);
// tm.cue[5].goCue = function() {
//   // turn off motion testing to optimize motionUpdateLoop
//   tm.shouldTestMotion = false;
// };
// tm.cue[5].triggerShakeSound = function() {
//   if (limit_5 > 0) {
//     clave.start();
//     limit_5--;
//     displayShakesLeft(limit_5);
//   } else {
//     displayShakesLeft(limit_5);
//     tm.publicWarning(`I'm sorry, but you're all out of shakes.`);
//   }
// };
// tm.cue[5].stopCue = function() {
//   // this is just a test
//   // tm.clearCueDisplay();
// };

// *******************************************************************
// CUE 5 (DIP): 1st section. Ice crunch tilt with gong (unison to M3 cluster)
limit_5 = 21; // limit of audience DIPS in section (reset also above)

// Center of most prominent frequency is c. 507Hz (~C5)
const pitchedIceLoop = new Tone.Player(granulated_sounds + 'pitchedIceLoop.mp3').toDestination();
pitchedIceLoop.loop = true;
pitchedIceLoop.playbackRate = 0.773; // retuned to G4
// NOTE: "melting ice#02" has nice noisy ice sounds. could use later

tm.cue[5] = new TMCue('dip', 0, NO_LIMIT);
tm.cue[5].goCue = function() {
  pitchedIceLoop.start();
};
tm.cue[5].updateTiltSounds = function() {
  if (tm.accel.y < 0.3) {
    pitchedIceLoop.volume.value = -99 + tm.accel.y * 290; // -99 to -12dB
  } else if (tm.accel.y < 0.7) {
    pitchedIceLoop.volume.value = -12 + (tm.accel.y - 0.3) * 22; // -12 to -3dB
  } else {
    pitchedIceLoop.volume.value = -3 - (tm.accel.y - 0.7) * 320; // -3 to -99dB
  }
};
tm.cue[5].triggerDipSound = function() {
  limit_5--;
  displayDipsLeft(limit_5);
  // TODO: if DIP limit is reached, stop ice loop so they can't make any sound
};
tm.cue[5].triggerDipReset = function() {
};
tm.cue[5].stopCue = function() {
  pitchedIceLoop.stop();
};

// *******************************************************************
// CUE 6:
const pitchArr_6 = ['G3', 'A3', 'Bb3', 'C4', 'G4', 'A4', 'Bb4', 'C5', 'G5', 'A5', 'Bb5', 'C6'];
const arrLen_6 = pitchArr_6.length;
const hiPitchArr_6 = ['G6', 'A6', 'Bb6', 'C7'];
const hiArrLen_6 = hiPitchArr_6.length;

const softBellLoop_6 = new Tone.Loop((time) => {
  envVibeSampler.triggerAttackRelease(pitchArr_6[count_6 % arrLen_6], '4n');
  count_6++;
}, '16n');

let limit_6 = 21;
let count_6 = 0;


const vibEnv = new Tone.AmplitudeEnvelope({
  attack: 0.1,
  decay: 0.2,
  sustain: 1.0,
  release: 1
}).toDestination();
const envVibeSampler = new Tone.Sampler({
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
}).connect(vibEnv);

const sineSynth = new Tone.Synth({
  oscillator: {
    type: 'sine',
  },
}).toDestination();

tm.cue[6] = new TMCue('dip', 4000, NO_LIMIT);
tm.cue[6].cueTransition = function() {
  // NOTE: the following test prevents transition sound if section was previously cued (e.g., in rehearsal if we go back to this cue)
  if (tm.getElapsedTimeInCue(6) < 100) {
    tm.publicLog('cueTransition() called');
  }
}
tm.cue[6].goCue = function() {
  count_6 = 0;
  softBellLoop_6.start();
};
let vol_6, bend_6;
tm.cue[6].updateTiltSounds = function() {
  if (tm.accel.y < 0.2) {
    vol_6 = -99 + tm.accel.y * 195;
    sineSynth.volume.rampTo(vol_6, tm.motionUpdateInSeconds); // -99 to -60 dB
  } else if (tm.accel.y < 0.5) {
    vol_6 = -60 + (tm.accel.y - 0.2) * 160;
    sineSynth.volume.rampTo(vol_6, tm.motionUpdateInSeconds); // -60 to -12 dB
  } else if (tm.accel.y < 0.7) {
    vol_6 = -12 + (tm.accel.y - 0.5) * 60;
    sineSynth.volume.rampTo(vol_6, tm.motionUpdateInSeconds); // -12 to 0 dB
  } else {
    sineSynth.volume.value = 0; // BUT envelope release is trigged at this point
  }
  bend_6 = -(tm.accel.y * 1200); // bends up to octave down when upside down
  sineSynth.detune.rampTo(bend_6, tm.motionUpdateInSeconds);
}
tm.cue[6].triggerDipSound = function() {
  tm.publicLog('dip');

  let time_6 = tm.getElapsedTimeInCue(6);

  if (limit_6 > 0) {
    // dip triggers bell sound + enveloped flurry of softer faster vibes loop
    // bellSampler.triggerAttackRelease(hiPitchArr_6[Math.floor(time_6/2000) % hiArrLen_6], 3);
  	// vibEnv.triggerAttackRelease('8n');
    clave.start();
    sineSynth.triggerRelease();
    limit_6--;
    displayDipsLeft(limit_6);
  } else {
    displayDipsLeft(limit_6);
    tm.publicWarning(`I'm sorry, but you're all out of dips.`);
  }
};
tm.cue[6].triggerDipReset = function() {
  if (limit_6 > 0) {
    tm.publicLog('dip reset');
    // TODO: randomize inital pitch
    sineSynth.triggerAttack('A4');
  }
};
tm.cue[6].stopCue = function() {
  softBellLoop_6.stop();
  sineSynth.triggerRelease();
};

// *******************************************************************
// CUE 7
const claveLoop = new Tone.Player(granulated_sounds + 'claveLoop.mp3').toDestination();
claveLoop.loop = true;

const ziplockLoop = new Tone.Player(granulated_sounds + 'ziplockClickLoop.mp3').toDestination();
ziplockLoop.loop = true;

const pingpongClickLoop = new Tone.Player(granulated_sounds + 'pingpongClickLoop.mp3').toDestination();
pingpongClickLoop.loop = true;

// everyone is randomly assigned one of three clicky loops to control on y-axis
const clickLoop_7 = tm.pickRand([claveLoop, ziplockLoop, pingpongClickLoop]);

const pitchArr_7 = ['G5', 'F#5', 'G5', 'E5', 'F#5', 'G5', 'D5', 'C#5'];
let count_7 = 0;

tm.cue[7] = new TMCue('dip', -1);
tm.cue[7].goCue = function() {
  count_7 = 0;
};
tm.cue[7].updateTiltSounds = function() {
  if (tm.accel.y < 0.2) {
    clickLoop_7.volume.value = -99;
  } else if (tm.accel.y < 0.4) {
    clickLoop_7.volume.value = -99 + (tm.accel.y - 0.2) * 375; // -99 to -24 dB
  } else if (tm.accel.y < 0.7) {
    clickLoop_7.volume.value = -24 + (tm.accel.y - 0.4) * 70; // -24 to -3 dB
  } else {
    clickLoop_7.volume.value = -3; // but loop stops at this point anyway
  }
  clickLoop_7.playbackRate = 1 + (tm.accel.y * 3);
};
tm.cue[7].triggerDipSound = function() {
  let pitch_7 = pitchArr_7[count_7 % pitchArr_7.length];
  bellSampler.triggerAttackRelease(pitch_7, 5);
  clickLoop_7.stop();
  count_7++;
};
tm.cue[7].triggerDipReset = function() {
  clickLoop_7.start();
};
tm.cue[7].stopCue = function() {
  clickLoop_7.stop();
};

// *******************************************************************
// CUE 8: [E] - tacet transition
tm.cue[8] = new TMCue('tacet', -1);
tm.cue[8].goCue = function() {
  // nothing to play
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};
