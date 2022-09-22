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
const misc_sounds = 'tonemotion-shared/audio/misc/';

Tone.Transport.bpm.value = 156;
const halfStep = 2 ** (1 / 12);
const AeS3 = 220 * (2 ** (1 / 48)); // A eighth-sharp 3
const AqS3 = 220 * (2 ** (1 / 24)); // A quarter-sharp 3
const AteS3 = 220 * ((2 ** (1 / 48)) ** 3); // A 3-eighths-sharp 3
const DqS4 = 220 * ((2 ** (1 / 24)) ** 11); // D quarter-sharp 4
const AqS4 = 440 * (2 ** (1 / 24)); // A quarter-sharp 4
const DsS5 = 440 * ((2 ** (1 / 36)) ** 16); // D sixth-sharp 5
const DqS5 = 440 * ((2 ** (1 / 24)) ** 11); // D quarter-sharp 5
const DtS5 = 440 * ((2 ** (1 / 36)) ** 17); // D third-sharp 5
const AsS5 = 880 * (2 ** (1 / 36)); // A sixth-sharp 5
const AqS5 = 880 * (2 ** (1 / 24)); // A quarter-sharp 5
const AtS5 = 880 * ((2 ** (1 / 36)) ** 2); // A third-sharp 5

const WAIT_TIME = 1000; // use to globally set standard wait time for cues

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
  clave.start();
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
  limit_5 = 931; // after testing, remove 9 (to make this 31)
  limit_6 = 941; // remove 9 (to make this 41)
  limit_7 = pitchArr_7.length;
  limit_8 = pitchArr_8.length;
  limit_9 = 921; // after testing, remove 9
  limit_10 = 931; // after testing, remove 9
  limit_11 = 941; // after testing, remove 9
  limit_12 = 129;
  limit_13 = 916; // after testing, remove 9
  limit_14 = 99; // after testing, remove 9
  limit_15 = 96; // after testing, remove 9
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
// CUE 5 (DIP): 1st section. Ice crunch tilt with gong (partials over Eb1)
// lower voice of canon (32 notes @ 2sec. per note, so section should be ~64s.)
const loPitchArr_5 = ['Eb4', 'D4', 'Eb4', 'G4', 'C4', 'D4', 'Bb3', 'Eb4', DqS4, 'D4', 'Eb4', 'G4', 'G4', 'A4', AqS4, 'Bb4', 'C4', 'D4', 'Eb4', 'G4', 'G4', 'F4', 'F4', 'Eb4', 'D4', 'F4', 'F4', 'G4', 'G4', 'Eb4', 'Eb4', 'D4'];
// upper voice of canon
const hiPitchArr_5 = ['Eb5', 'Eb5', 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'C5', 'C5', 'D5', 'D5', 'Bb4', 'Bb4', 'Eb5', 'Eb5', DtS5, DsS5, 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'G5', 'G5', 'A5', 'A5', AsS5, AtS5, 'Bb5', 'Bb5'];

tm.cue[5] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
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
    // REVISION idea: for notes that signal microtone coming, on first attack double with sinusoid that bends. Need to create new monoSine instrument
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
const hiPitchArr_6 = ['C5', 'C5', 'D5', 'D5', 'Eb5', 'Eb5', 'G5', 'G5', 'G5', 'G5', 'F5', 'F5', 'F5', 'F5', 'Eb5', 'Eb5', 'D5', 'D5', 'F5', 'F5', 'F5', 'F5', 'G5', 'G5', 'G5', 'G5', 'Eb5', 'Eb5', 'Eb5', 'Eb5', 'D5', 'D5'];

tm.cue[6] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
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
    // REVISION idea: with pitches that will bend, add sineTails WITH pitch bend
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
bellSampler.release = 0.8; // bells pitched very low require gentler fade out
let count_7 = 0;

tm.cue[7] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
// TODO: add more prominent cueTransition sound here. Could use similar reversed sparkles (in addition to downbeat sound on goCue())
tm.cue[7].goCue = function() {
  if (tm.getElapsedTimeInCue(7) < 200) {
    vibeSampler.triggerAttackRelease('C5', 5);
    vibeSampler.triggerAttackRelease('C6', 5, '+0.25');
    sparklyTailSampler.triggerAttackRelease(440, 5);
  }
  count_7 = 0;
};
tm.cue[7].updateTiltSounds = function() {
  if (tm.accel.y < 0.3) {
    pingpongClickLoop.volume.value = -99 + tm.accel.y * 197; // -99 to -40dB
    pingpongClickLoop.playbackRate = 0.75;
  } else if (tm.accel.y < 0.7) {
    pingpongClickLoop.volume.value = -40 + (tm.accel.y - 0.3) * 70; //-40 to -12
    pingpongClickLoop.playbackRate = 0.75 + (tm.accel.y - 0.3) * 3.125; //.75-2x
  } else {
    pingpongClickLoop.volume.value = -12 - (tm.accel.y - 0.7) * 290; //-12 to-99
    pingpongClickLoop.playbackRate = 2;
  }
};
tm.cue[7].triggerDipSound = function() {
  pingpongClickLoop.stop();
  if (limit_7 > 0) {
    bellSampler.triggerAttackRelease(pitchArr_7[count_7], 5);
    sineTails.triggerAttackRelease(pitchArr_7[count_7], 6);
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
let count_8 = 0;
tm.cue[8] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
// TODO: decide on transition sounds?
tm.cue[8].goCue = function() {
  if (tm.getElapsedTimeInCue(8) < 200) {
    vibeSampler.triggerAttackRelease('Bb4', 5);
    vibeSampler.triggerAttackRelease('Bb5', 5, '+0.25');
    sparklyTailSampler.triggerAttackRelease(440, 5);
  }
  count_8 = 0;
  bellDelay.delayTime.value = 0.15 + Math.random() * 0.13;
};
tm.cue[8].triggerShakeSound = function() {
  if (limit_8 > 0) {
    // higher bell with feedback delay is 2 oct. higher. Get freq and mult by 4
    let hiPitch = (Tone.Frequency(pitchArr_8[count_8]).toFrequency()) * 4;
    bellDelaySampler.triggerAttackRelease(hiPitch, 5);
    bellSampler.triggerAttackRelease(pitchArr_8[count_8], 5);
    sineTails.triggerAttackRelease(pitchArr_8[count_8], 6);
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

// NOTE: When composing fixed media, use gradually fading in sinusoids in this cue to match sineTails in phones, but start very subtle and gradually sweep up in frequency while getting fuller and louder

// everyone is randomly assigned one of three clicky loops to control on y-axis
const clickLoop_9 = tm.pickRand([claveLoop, ziplockLoop, pingpongClickLoop]);
const loopArr_9 = ['Eb5', 'D5', 'Eb5', 'G5', 'C5', 'D5', DqS5, 'Eb5'];
let count_9 = 0;
let playCanon_9 = true;

tm.cue[9] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
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
    clickLoop_9.volume.value = -99 + (tm.accel.y - 0.2) * 405; // -99 to -18 dB
    clickLoop_9.playbackRate = 0.5 + (tm.accel.y - 0.2) * 2.5; // 0.5 to 1
  } else if (tm.accel.y < 0.7) {
    clickLoop_9.volume.value = -18 + (tm.accel.y - 0.4) * 30; // -18 to -9 dB
    clickLoop_9.playbackRate = 1 + (tm.accel.y - 0.4) * 3.333; // 1 to 2
  } else {
    clickLoop_9.volume.value = -9;
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

// *******************************************************************
// CUE 10 (SHAKE) synchronized pulse triggered by shake sounds
// NOTE: When composing fixed media, could gradually fade in synchronized pulsed sounds. Could be mostly unpitched (like same clicks as phones) and could be multiple (pp < ff) gestures with stereo movement. Also could add high "drone" on A3 glissing to Bb3
const loPitchArr_10 = ['G3', 'G3', 'G3', 'G3', 'A3', 'A3', AeS3, AeS3, AqS3, AqS3, AteS3, AteS3, 'Bb3', 'Bb3', 'Bb3', 'Bb3'];
const midPitchArr_10 = ['C4', 'D4', 'Eb4', 'G4', 'G4', 'F4', 'F4', 'Eb4', 'D4', 'F4', 'F4', 'G4', 'G4', 'Eb4', 'Eb4', 'D4'];
const hiPitchArr_10 = ['D5', 'D5', 'F5', 'F5', 'F5', 'F5', 'G5', 'G5', 'G5', 'G5', 'Eb5', 'Eb5', 'Eb5', 'Eb5', 'D5', 'D5'];
const ampEnvHi_10 = new Tone.AmplitudeEnvelope({
  attack: 0.1,
  decay: 0.2,
  sustain: 1.0,
  release: 4
}).toDestination();
const ampEnvLo_10 = new Tone.AmplitudeEnvelope({
  attack: 0.1,
  decay: 0.2,
  sustain: 1.0,
  release: 4
}).toDestination();
let soundFileHi_10, soundFileLo_10;
let partSelector_10 = Math.random();
if (partSelector_10 > 0.8) {
  // 1 out of 5 people is randomly assigned pair of clicky loops (no pitches)
  soundFileHi_10 = 'clave-pingpong_loop.mp3';
  soundFileLo_10 = 'clave-ziplock_loop.mp3';
} else if (partSelector_10 > 0.4) {
  // 2 out of 5 people randomly assigned pitched loops alternating Eb/G - D/F
  soundFileHi_10 = 'Eb-G_loop.mp3';
  soundFileLo_10 = 'D-F_loop.mp3';
} else {
  // 2 out of 5 people randomly assigned pitched loops alternating C/G - Bb/D
  soundFileHi_10 = 'C-Eb_loop.mp3';
  soundFileLo_10 = 'Bb-D_loop.mp3';
}
const loopHi_10 = new Tone.Player(misc_sounds + soundFileHi_10).connect(ampEnvHi_10);
loopHi_10.loop = true;
const loopLo_10 = new Tone.Player(misc_sounds + soundFileLo_10).connect(ampEnvLo_10);
loopLo_10.loop = true;
let count_10 = 0;

tm.cue[10] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[10].goCue = function() {
  loopHi_10.start();
  loopLo_10.start();
  count_10 = 0;
};
tm.cue[10].triggerShakeSound = function() {
  // REVISION idea: if this is too static, could randomly assign array-based faster note loop. If low vox is too hard to hear, could randomly assign three octaves higher with bells instead of vibes
  if (limit_10 > 0) {
    let time_10 = tm.getElapsedTimeInCue(10);
    // rotate array selection among three voices (and separate arrays)
    let arr_10;
    if (count_10 % 3 === 2) {
      arr_10 = hiPitchArr_10;
    } else if (count_10 % 3 === 1) {
      arr_10 = midPitchArr_10;
    } else {
      arr_10 = loPitchArr_10;
    }
    // select pitch index for array
    let index_10 = Math.floor(time_10 / 4000);
    // stay on last pitch of array if last pitch is reached
    if (index_10 > arr_10.length - 1) {
      index_10 = arr_10.length - 1;
    }
    vibeSampler.triggerAttackRelease(arr_10[index_10], 5);
    sineTails.triggerAttackRelease(arr_10[index_10], 6);
    // alternate between envelopes that trigger higher and lower loops
    let env = (count_10 % 2) ? ampEnvLo_10 : ampEnvHi_10;
    env.triggerAttackRelease(0.1);
    count_10++;
    limit_10--;
  } else {
    tm.publicWarning(`I'm sorry, but you're all out of shakes.`);
  }
  displayShakesLeft(limit_10);
};
tm.cue[10].stopCue = function() {
  loopHi_10.stop();
  loopLo_10.stop();
};

// *******************************************************************
// CUE 11 (DIP) no pulse, but increasingly chaotic, heteregeneous sounds

tm.cue[11] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[11].goCue = function() {
};
tm.cue[11].updateTiltSounds = function() {
};
tm.cue[11].triggerDipSound = function() {
};
tm.cue[11].triggerDipReset = function() {
};
tm.cue[11].stopCue = function() {
};

// *******************************************************************
// CUE 12 (SHAKE) peak variety, surging drone in fixed media, sudden cutoff

tm.cue[12] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[12].goCue = function() {
};
tm.cue[12].triggerShakeSound = function() {
};
tm.cue[12].stopCue = function() {
};

// *******************************************************************
// CUE 13 (DIP) much calmer, residual buzz, melty pitches (canon bending up?)

tm.cue[13] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[13].goCue = function() {
};
tm.cue[13].updateTiltSounds = function() {
};
tm.cue[13].triggerDipSound = function() {
};
tm.cue[13].triggerDipReset = function() {
};
tm.cue[13].stopCue = function() {
};

// *******************************************************************
// CUE 14 (SHAKE) very low density, fading buzzes and melts. Shorter (c. 30")

tm.cue[14] = new TMCue('shake', WAIT_TIME, NO_LIMIT);
tm.cue[14].goCue = function() {
};
tm.cue[14].triggerShakeSound = function() {
};
tm.cue[14].stopCue = function() {
};

// *******************************************************************
// CUE 15 (DIP) continuation of cue 14 with very few dips. Shorter (c. 30")

tm.cue[15] = new TMCue('dip', WAIT_TIME, NO_LIMIT);
tm.cue[15].goCue = function() {
};
tm.cue[15].updateTiltSounds = function() {
};
tm.cue[15].triggerDipSound = function() {
};
tm.cue[15].triggerDipReset = function() {
};
tm.cue[15].stopCue = function() {
};

// *******************************************************************
// CUE 16: finished
tm.cue[16] = new TMCue('finished', 0, NO_LIMIT);
tm.cue[16].goCue = function() {
};


// TODO: delete unused code below
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
