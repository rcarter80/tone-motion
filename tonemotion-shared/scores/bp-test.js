const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  // TODO: create server for ryancarter.org/bp
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
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

// 1st tempo used by Tone.Loop. Putting this is goCue() caused ~2 min. latency
Tone.Transport.bpm.value = 156;

// INSTRUMENTS USED IN MULTIPLE CUES
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
    release: 3,
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

// reversed cymbal sound to use at ends of some sections
const revCym = new Tone.Player(perc_sounds + 'revCym.mp3').toDestination();

const triangle = new Tone.Player(perc_sounds + 'triangle.mp3').toDestination();
triangle.volume.value = -12;

// *******************************************************************
// CUE 0: piece is in "waiting" state by default
tm.cue[0] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// TODO: change order of tutorial so that SHAKE is first
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
};
tm.cue[1].updateTiltSounds = function() {
  // interactivity handled through tm.xTilt and yTilt signals
};
tm.cue[1].stopCue = function() {
  testTone.triggerRelease();
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

// *******************************************************************
// CUE 5: actual beginning of piece (audience is tacet)
tm.cue[5] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[5].goCue = function() {
  // optimize motion update loop by turning off motion testing when piece starts
  tm.shouldTestMotion = false;
  tm.clearMotionErrorMessage();
};
tm.cue[5].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 6: [B] Audience enters with metallic SHAKE sounds outlining main theme
const DqS4 = 220 * ((2**(1/24))**11); // D quarter-sharp 4
const AqS3 = 220 * (2**(1/24)); // A quarter-sharp 3
const AqS4 = 440 * (2**(1/24)); // A quarter-sharp 4
const AqS5 = 880 * (2**(1/24)); // A quarter-sharp 5

const pitchArr1_6 = ['F4', 'F5', 'F5', 'F4', 'Eb5', 'Eb5', 'F4', 'D5', 'D5', 'F4', 'C5', 'C5', 'Eb4', 'C5', 'Eb4', DqS4, DqS4, 'C5', 'D4', 'C5', 'D4', 'C4', 'C5', 'C5'];
const pitchArr2_6 = ['C4', 'Bb4', 'C5', 'Bb5', 'C4', 'Bb5', 'C4', AqS4, 'C5', AqS5, 'C4', AqS5, 'C4', 'A4', 'C5', 'A5', 'C4', 'A5', 'C4', 'G4', 'C5', 'G5', 'C4', 'G5', 'Bb3', 'G4', 'Bb4', 'G5', 'Bb3', 'G5', AqS3, 'G4', AqS4, 'G5', AqS3, 'G5', 'A3', 'G4', 'A4', 'G5', 'A3', 'G5', 'G3', 'G4', 'G5', 'G4', 'G3', 'G5', 'E3', 'G#3', 'E4', 'G#4', 'E3', 'G#4', 'E3', 'G#3', 'E4', 'G#4', 'E3', 'G#4', 'E3', 'G#3', 'E4', 'G#4', 'E3', 'G#4', 'E3', 'G#3', 'E4', 'G#4', 'E3', 'G#4'];
const pitchArr3_6 = ['E4', 'E5', 'E6', 'E5'];
let count_6 = 0;

// uses two handbell sounds from freesound.org/people/radwoc/ (CC0 license)
const bellSparkle = new Tone.Player(bell_sounds + 'bell_sparkle-FAA.mp3').toDestination();

// wait window of 22 seconds prevents people from stopping and starting
tm.cue[6] = new TMCue('shake', 1818, 22000); // 4 beats @ 132 bpm
tm.cue[6].goCue = function() {
  // reset volume from possible previous change
  vibeSampler.volume.value = 0;
  sineTails.volume.value = -28;
  count_6 = 0;

  if (tm.getElapsedTimeInCue(6) < 1000) {
    // only trigger opening sound if it's actually beginning of cue
    // otherwise if someone stops and restarts, this sound is triggered again
    bellSparkle.start();
  }
};
tm.cue[6].triggerShakeSound = function() {
  let time_6 = tm.getElapsedTimeInCue(6);
  // prevent shakes at same time as bellSparkle (455ms = 1 beat @ 132 bpm)
  if (time_6 > 455) {
    // 21815 ms ~ 24 beats @ 66 bpm (this is first 8 measures of section)
    if (time_6 < 21815) {
      // first notes are coordinated by time so everyone is playing same note
      // 909 ms = 1 beat @ 66 bpm (each note in above array is one beat)
      vibeSampler.triggerAttackRelease(pitchArr1_6[Math.floor(time_6/909)], 3);
      sineTails.triggerAttackRelease(pitchArr1_6[Math.floor(time_6/909)], 1);
    } else if (count_6 < pitchArr2_6.length) {
      // then notes go through array, creating an independent canon
      vibeSampler.triggerAttackRelease(pitchArr2_6[count_6], 3);
      sineTails.triggerAttackRelease(pitchArr2_6[count_6], 1);
      count_6++;
    } else {
      // final loop of pitches
      vibeSampler.triggerAttackRelease(pitchArr3_6[(count_6 - pitchArr2_6.length) % pitchArr3_6.length], 3);
      sineTails.triggerAttackRelease(pitchArr3_6[(count_6 - pitchArr2_6.length) % pitchArr3_6.length], 1);
      count_6++;
    }
  }
};
tm.cue[6].stopCue = function() {
  sineTails.releaseAll();
};

// *******************************************************************
// CUE 7: [D] - cue to fade out final SHAKE sounds from last cue
let count_7 = 0;
let revCymTriggered = false;

tm.cue[7] = new TMCue('shake', -1);
tm.cue[7].goCue = function() {
  // reset flag in case section was previously triggered
  revCymTriggered = false;
  count_7 = 0;
  vibeSampler.volume.value = 0;
  sineTails.volume.value = -28;
  vibeSampler.volume.rampTo(-36, 6);
  sineTails.volume.rampTo(-36, 6);
};
tm.cue[7].triggerShakeSound = function() {
  // if anyone has NOT arrived at final pitches yet, it jumps to that loop here
  vibeSampler.triggerAttackRelease(pitchArr3_6[count_7 % pitchArr3_6.length], 3);
  sineTails.triggerAttackRelease(pitchArr3_6[count_7 % pitchArr3_6.length], 1);
  count_7++;
  // first shake between the 500ms and 1500ms point also triggers revCym, creating whooshing sound mostly around downbeat of m. 60
  let time_7 = tm.getElapsedTimeInCue(7);
  if (time_7 > 500 && time_7 < 1500) {
    if (!revCymTriggered) {
      revCym.start();
      revCymTriggered = true;
    }
  }
};
tm.cue[7].stopCue = function() {
  sineTails.releaseAll();
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

// *******************************************************************
// CUE 9: [F] - TILT synth with pitch on x-axis and intensity on y-axis
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
}

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

let pitchArr_9 = ['E4', 'E4', 'E5', 'F#5', 'G5', 'A5', 'C#6', 'D6', 'E6', 'E6'];
let pitchArr8ba_9 = ['E3', 'E3', 'E4', 'F#4', 'G4', 'A4', 'C#5', 'D5', 'E5', 'E5'];
let pitchLo_9, pitchHi_9;
let cue10WasTriggered = false;

const harpLoop_9 = new Tone.Loop((time) => {
  pitchLo_9 = pitchArr8ba_9[Math.floor(tm.accel.x * 0.99 * pitchArr_9.length)];
  pitchHi_9 = pitchArr_9[Math.floor(tm.accel.x * 0.99 * pitchArr_9.length)]
  if (cue10WasTriggered) {
    // pitch bend up perfect 4 in second half of section
    let trans = tm.getSectionBreakpoints(10, [0, 0, 12307, 5]);
    pitchLo_9 = Tone.Frequency(pitchLo_9).transpose(trans);
    pitchHi_9 = Tone.Frequency(pitchHi_9).transpose(trans);
  }
	harpSampler.triggerAttackRelease(pitchLo_9, 1);
  harpSampler.triggerAttackRelease(pitchHi_9, 1, '+8n');
}, '4n');

tm.cue[9] = new TMCue('tilt', 1538, NO_LIMIT); // 4 beats @ 156 bpm
tm.cue[9].goCue = function() {
  // additional volume control used during cue 11 - reset it here if needed
  harpSamplerVol.volume.value = 0;
  harpLoop_9.start();
  triangle.start();
  fmSynthDefaults();
  fmSynth.volume.value = -99; // prevent initial burst of unwanted sound
  fmSynth.triggerAttack('E4');
  cue10WasTriggered = false;
};
tm.cue[9].updateTiltSounds = function() {
  // after HIDDEN cue 10 is triggered, pitches bend up perfect 4
  if (cue10WasTriggered) {
    fmSynth.detune.value = tm.getSectionBreakpoints(10, [0, 0, 12307, 500]);
  }
  // multiply tm.accel.x by 0.99 to prevent bad access to pitchArr_9
  fmSynth.frequency.value = pitchArr8ba_9[Math.floor(tm.accel.x * 0.99 * pitchArr8ba_9.length)];
  if (tm.accel.y < 0.4) {
    // with phone mostly upright, synth is mostly silent and harp is soft
    harpSampler.volume.value = -12 - (0.4 - tm.accel.y) * 70; // -40 to -12 dB
    fmSynth.modulationIndex.value = 1;
    fmSynth.volume.value = -36 - (0.4 - tm.accel.y) * 157.5; // -99 to -36 dB
  } else if (tm.accel.y < 0.7) {
    // with phone in mid position, synth and harp cross fade, synth gets bright
    harpSampler.volume.value = -40 + (0.7 - tm.accel.y) * 93.4; // -12 to -40 dB
    fmSynth.modulationIndex.value = 5 - (0.7 - tm.accel.y) * 13.33; // 1 to 5
    fmSynth.volume.value = -30 - (0.7 - tm.accel.y) * 20; // -36 to -30 dB
  } else {
    // with phone mostly upside down, harp is soft and bright synth is heard
    harpSampler.volume.value = -99 + (1.0 - tm.accel.y) * 196; // -40 to -99 dB
    fmSynth.modulationIndex.value = 10 - (1.0 - tm.accel.y) * 16.66; // 5 to 10
    fmSynth.volume.value = -24 - (1.0 - tm.accel.y) * 20; // -30 to -24 dB
  }
};
tm.cue[9].stopCue = function() {
  // both are stopped in cue 10 transition, but stop here too in case user stops
  harpLoop_9.stop();
  fmSynth.triggerRelease();
};

// *******************************************************************
// CUE 10: [G] - hidden cue to bend pitches up
tm.cue[10] = new TMCue('hidden', 0, NO_LIMIT);
tm.cue[10].goCue = function() {
  // once this flag is set to true, pitch bend in cue 9 are triggered
  cue10WasTriggered = true;
};
tm.cue[10].cueTransition = function() {
  // this is called BEFORE tm.cue[9].stopCue
  harpLoop_9.stop();
  vibeSampler.triggerAttackRelease('B5', 3);
  vibeSampler.triggerAttackRelease('C#6', 3, '+8n');
  vibeSampler.triggerAttackRelease('D6', 3, '+4n');
  fmSynth.triggerRelease();
}

// *******************************************************************
// CUE 11: [H] - harp only dimin (still TILT)
let pitchArr_11 = ['C#4', 'C#4', 'C#5', 'D5', 'E5', 'F#5', 'G5', 'A5', 'C#6', 'C#6'];
let pitchArr8ba_11 = ['C#3', 'C#3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'C#5', 'C#5'];

const harpLoop_11 = new Tone.Loop((time) => {
  harpSampler.triggerAttackRelease(pitchArr8ba_11[Math.floor(tm.accel.x * 0.99 * pitchArr8ba_11.length)], 1, '+8n');
  harpSampler.triggerAttackRelease(pitchArr_11[Math.floor(tm.accel.x * 0.99 * pitchArr_11.length)], 1);
}, '4n');

tm.cue[11] = new TMCue('tilt', 1538, NO_LIMIT); // 4 beats @ 156 bpm
tm.cue[11].goCue = function() {
  harpLoop_11.start();
  bellSampler.triggerAttackRelease('C#5', 5);
};
tm.cue[11].updateTiltSounds = function() {
  // final harp sounds fade out (breakpoints at each downbeat)
  harpSamplerVol.volume.value = tm.getSectionBreakpoints(11, [0, 0, 1730, 0, 3460, -6, 5190, -15, 6923, -40]);
  if (tm.accel.y < 0.4) {
    harpSampler.volume.value = -12 - (0.4 - tm.accel.y) * 70; // -40 to -12 dB
  } else if (tm.accel.y < 0.7) {
    harpSampler.volume.value = -40 + (0.7 - tm.accel.y) * 93.4; // -12 to -40 dB
  } else {
    harpSampler.volume.value = -99 + (1.0 - tm.accel.y) * 196; // -40 to -99 dB
  }
};
tm.cue[11].stopCue = function() {
  harpLoop_11.stop();
};

// *******************************************************************
// CUE 12: four after [H]
tm.cue[12] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[12].goCue = function() {
  // nothing to play
};
tm.cue[12].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 13: [I] metallic SHAKE canon over flowing woodwinds
const Gqb4 = 220 * ((2**(1/24))**19); // G quarter-flat 4
const Gqb5 = 440 * ((2**(1/24))**19); // G quarter-flat 5
const Dqb5 = 440 * ((2**(1/24))**9); // D quarter-flat 5
const Dqb6 = 880 * ((2**(1/24))**9); // D quarter-flat 6
const Aqb4 = 220 * ((2**(1/24))**23); // A quarter-flat 4
const Aqb5 = 440 * ((2**(1/24))**23); // A quarter-flat 5

const pitchArr1_13 = ['A4', 'A5', 'A4', 'A5', 'A4', 'A5', 'G4', 'G5', Gqb4, Gqb5, 'F#4', 'F#5', 'F#4', 'F#5', 'F#4', 'F#5', 'F#4', 'F#5', 'E4', 'E5', 'E4', 'E5', 'E4', 'E5', 'A4', 'D5', 'A5', 'D6', 'A4', 'D5', 'A4', Dqb5, 'A5', Dqb6, 'A4', Dqb5, 'A4', 'C#5', 'A5', 'C#6', 'A4', 'C#5', 'A4', 'B4', 'A5', 'B5', 'A4', 'B4', 'A4', 'B4', 'A5', 'B4', 'A4', 'B4', Aqb4, 'B4', Aqb5, 'B4', Aqb4, 'B4', 'G#4', 'B4', 'G#5', 'B4', 'G#4', 'B4', 'F#4', 'B4', 'F#5', 'B4', 'F#4', 'B4', 'F4', 'B4', 'F5', 'B4', 'F4', 'B4', 'F4', 'B4', 'F5', 'B4', 'F4', 'B4'];
const pitchArr2_13 = ['F4', 'F5', 'F6', 'F5', 'F4', 'F5'];
let count_13 = 0;

tm.cue[13] = new TMCue('shake', 1730, NO_LIMIT); // 3 beats @ 104 bpm
tm.cue[13].goCue = function() {
  // reset volume from possible previous change
  vibeSampler.volume.value = 0;
  sineTails.volume.value = -28;
  count_13 = 0;
};
tm.cue[13].triggerShakeSound = function() {
  if (count_13 < pitchArr1_13.length) {
    // long array of first pitches for independent canon
    vibeSampler.triggerAttackRelease(pitchArr1_13[count_13], 3);
    sineTails.triggerAttackRelease(pitchArr1_13[count_13], 1);
  } else {
    // final loop of pitches that everyone arrives at
    vibeSampler.triggerAttackRelease(pitchArr2_13[(count_13 - pitchArr1_13.length) % pitchArr2_13.length], 3);
    sineTails.triggerAttackRelease(pitchArr2_13[(count_13 - pitchArr1_13.length) % pitchArr2_13.length], 1);
  }
  count_13++;
};
tm.cue[13].stopCue = function() {
  sineTails.releaseAll();
};

// *******************************************************************
// CUE 14: [K] - cue to fade out final SHAKE sounds from last cue
let count_14 = 0;

tm.cue[14] = new TMCue('shake', -1);
tm.cue[14].goCue = function() {
  count_14 = 0;
  vibeSampler.volume.value = 0;
  sineTails.volume.value = -28;
  vibeSampler.volume.rampTo(-36, 6);
  sineTails.volume.rampTo(-36, 6);
};
tm.cue[14].triggerShakeSound = function() {
  // if anyone has NOT arrived at final pitches yet, it jumps to that loop here
  vibeSampler.triggerAttackRelease(pitchArr2_13[count_14 % pitchArr2_13.length], 3);
  sineTails.triggerAttackRelease(pitchArr2_13[count_14 % pitchArr2_13.length], 1);
  count_14++;
};
tm.cue[14].stopCue = function() {
  sineTails.releaseAll();
};

// *******************************************************************
// CUE 15: four after [K] - tacet end to the first third of the piece
tm.cue[15] = new TMCue('tacet', -1);
tm.cue[15].goCue = function() {
  // nothing to play
};
tm.cue[15].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 16: [L] granular TILT texture during beginning of second part of piece
// REVISION: could replace clave loop with something else (bongos?). and could add sound to right side of TILT (like a ping pong ball click loop)
const claveLoop = new Tone.Player(granulated_sounds + 'claveLoop.mp3');
claveLoop.loop = true;
// used to control clave loop gain on x-axis
const claveLoopVol = new Tone.Volume(0);
// used to fade out clave loop during next (hidden) cue (17)
const claveLoopFade = new Tone.Volume(0);
claveLoop.chain(claveLoopVol, claveLoopFade, Tone.Destination);

const crunchyIce = new Tone.Player(granulated_sounds + 'iceInWineGlass.mp3');
const crunchyIceFade = new Tone.Volume(0);
crunchyIce.chain(crunchyIceFade, Tone.Destination);
crunchyIce.loop = true;
// I use a regular Tone.Player to granulate sound because GrainPlayer doesn't have .seek() or .scrub() anymore
let grLen_16 = 0.25;

// sampler using "vibes" sounds like I synthesized in Logic?
const synVibSampler = new Tone.Sampler({
  urls: {
    'A3': 'vibe-A3.mp3',
    'E4': 'vibe-E4.mp3',
  },
  baseUrl: vibes_sounds,
});
const synVibFade = new Tone.Volume(0);
synVibSampler.chain(synVibFade, Tone.Destination);

const pitchArr_16 = ['G4', 'F#4', 'D4', 'C#4', 'A3'];
let count_16 = 0;
let len_16 = 2; // first len_16 notes from pitchArr_16 are used, value goes up

let playGongFlag_16 = true;

tm.cue[16] = new TMCue('tilt', 0, NO_LIMIT); // immediate trigger, faded in
tm.cue[16].goCue = function() {
  // gong sounds triggered when phone is upside down, but that sets flag that can only be reset when phone tilted back up, so gong only plays once per downward tipping gesture
  playGongFlag_16 = true;
  claveLoopFade.volume.value = -99;
  claveLoopFade.volume.rampTo(0, 5);
  claveLoop.volume.value = -99; // start muted and only play with phone tipped
  claveLoop.start();
  crunchyIceFade.volume.value = -99;
  crunchyIceFade.volume.rampTo(0, 5);
  crunchyIce.start();
  synVibFade.volume.value = 0;
};
tm.cue[16].updateTiltSounds = function() {
  let time_16 = tm.getElapsedTimeInCue(16);
  // at first, only 2 notes from gong pitch array played, but then more added
  if (time_16 < 40000) {
    // only G and F# until [M]
    len_16 = 2;
  } else if (time_16 < 48000) {
    // then add D after two measures
    len_16 = 3;
  } else if (time_16 < 56000) {
    len_16 = 4;
  } else {
    len_16 = 5;
  }
  if (tm.accel.y < 0.4) {
    // phone silent when upright, crunchy and clicky sounds fade in when tipped
    // tipping phone upright resets flag so that gong can be triggered again
    if (!playGongFlag_16) {
      playGongFlag_16 = true;
    }
    crunchyIce.volume.value = -20 - (0.4 - tm.accel.y) * 197.5; // -99 to -20 dB
    crunchyIce.playbackRate = 0.8;
    claveLoop.playbackRate = 0.75;
    claveLoop.volume.value = -36 - (0.4 - tm.accel.y) * 157.5; // -99 to -36 dB
  } else if (tm.accel.y < 0.7) {
    // crunchy ice sounds fade in, with varying seek points and pitch/speed
    crunchyIce.playbackRate = 1.1 - (0.7 - tm.accel.y); // 0.8 to 1.1
    crunchyIce.volume.value = 0 - (0.7 - tm.accel.y) * 66.66; // -20 to 0 dB
    // clicking clave sounds accessible when phone tipped to left
    claveLoop.volume.value = 0 - (0.7 - tm.accel.y) * 120; // -36 to 0 dB
    claveLoop.playbackRate = 2 - (0.7 - tm.accel.y) * 4.166 // 0.75 to 2
  } else {
    // crunchy ice fades out again when phone upside down
    // tipping phone upside down triggers gong, but only ONCE until flag resets
    if (playGongFlag_16) {
      synVibSampler.triggerAttackRelease(pitchArr_16[count_16 % len_16], 5);
      playGongFlag_16 = false; // flag is false until phone tipped back up
      count_16++;
    }
    crunchyIce.volume.value = -36 + (1 - tm.accel.y) * 120; // 0 to -36 dB
    crunchyIce.playbackRate = 1.1;
    claveLoop.volume.value = 0;
    claveLoop.playbackRate = 2.75 - (1 - tm.accel.y) * 2.5 // 2 to 2.75
  }
  // clave loop only audible when phone tilted to left
  claveLoopVol.volume.value = -99 + (1.0 - tm.accel.x) * 99;
  // granulate crunchyIce and set seek point on x-axis
  crunchyIce.loopStart = tm.accel.x * 13;
  crunchyIce.loopEnd = crunchyIce.loopStart + grLen_16;
};
tm.cue[16].stopCue = function() {
  crunchyIce.stop();
  claveLoop.stop();
};

// *******************************************************************
// CUE 17: hidden cue to fade out cue 16
tm.cue[17] = new TMCue('hidden', 0, NO_LIMIT);
tm.cue[17].goCue = function() {
  // fade out clave and ice sounds (which also have gain controlled by TILT)
  claveLoopFade.volume.value = 0;
  claveLoopFade.volume.rampTo(-99, 16);
  crunchyIceFade.volume.value = 0;
  crunchyIceFade.volume.rampTo(-99, 16);
  synVibFade.volume.value = 0;
  synVibFade.volume.rampTo(-24, 16);
};

// *******************************************************************
// CUE 18: silence just before [N]
tm.cue[18] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[18].goCue = function() {
  // nothing to play
};
tm.cue[18].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 19: [O] - Cadenza: shakers with sine tails (LFO on TILT), then bells
const shaker1 = new Tone.Player(perc_sounds + 'shaker1.mp3').toDestination();
const shaker2 = new Tone.Player(perc_sounds + 'shaker2.mp3').toDestination();
const shaker3 = new Tone.Player(perc_sounds + 'shaker3.mp3').toDestination();
let shakerArr = [shaker1, shaker2, shaker3];
const ziplockClickLoop = new Tone.Player(granulated_sounds + 'ziplockClickLoop.mp3').toDestination();
ziplockClickLoop.loop = true;

const chimeA7 = new Tone.Player(chime_sounds + 'chimeA7.mp3').toDestination();
const chimeC8 = new Tone.Player(chime_sounds + '2sec-chime-C8.mp3').toDestination();
// randomly select one chime for sparkly interjection
let chime_19 = tm.pickRand([chimeA7, chimeC8]);
// randomly select two bell pitches at upper partials of F2
let randBellLo_19 = 55 * ((2**(1/12))**8) * tm.pickRand([10, 14, 17, 20]);
let randBellHi_19 = 55 * ((2**(1/12))**8) * tm.pickRand([23, 28, 36]);

let pitchArr_19 = ['Eb7', 'F6', 'G5', 'A4', 'A7', 'D7', 'E6', 'F5', 'G4'];
let count_19 = 0;
let triggerSparkles_19 = true;
let countdown_19 = 7; // initial number of shakers between bells after ~m.188
let bellCountdown = countdown_19; // actual # of shakers between bells goes down

// randomly select one of two pitch trajectories for second half (F/A or Eb/Eb)
const metalPitchArr_19 = tm.pickRand([['F5', 'A6'], ['Eb5', 'Eb6']]);
// players assigned F/A have 1 oct transposition. Ebs have mi7 trans
let transRange_19 = metalPitchArr_19[0] === 'F5' ? -12 : -10;

// randomly select one of three time spans for single revCym trigger
let revCymRange = tm.pickRand([[58000, 60000], [59000, 61000], [60000, 62000]]);
let triggerCymRev = true;

tm.cue[19] = new TMCue('tiltAndShake', 0, NO_LIMIT);
tm.cue[19].goCue = function() {
  count_19 = 0;
  sineTails.volume.value = -24;
  triggerSparkles_19 = true;
  ziplockClickLoop.volume.value = -99;
  ziplockClickLoop.start();
  vibeSampler.volume.value = 0;
  bellSampler.volume.value = 0;
};
tm.cue[19].updateTiltSounds = function() {
  // fast clicking sounds accessible with phone tipped upside down
  if (tm.accel.y < 0.5) {
    sineTails.set({ detune: 0 });
    ziplockClickLoop.volume.value = -99;
    ziplockClickLoop.playbackRate = 1;
  } else {
    sineTails.set({ detune: -((tm.accel.y - 0.5) * 100) });
    // sine tails bend down (up to 1/4 tone) with phone tipped upside down
    ziplockClickLoop.volume.value = -99 + (tm.accel.y - 0.5) * 198; // -99 to 0
    ziplockClickLoop.playbackRate = 1 + (tm.accel.y - 0.5) * 4; // 1 to 3
  }
  // sineTails tremolo parameters NOT set by yTilt because I don't normally allow TILT changes to sound, and I don't hear zipper noise here
  sinTremolo.depth.value = tm.accel.y;
  sinTremolo.frequency.value = 1 + tm.accel.y * 11;
};
tm.cue[19].triggerShakeSound = function() {
  let time_19 = tm.getElapsedTimeInCue(19);
  if (time_19 < 16000) {
    // from [O] to around m. 188 is just shakers and bendable sine tails
    shakerArr[count_19 % shakerArr.length].start();
    sineTails.triggerAttackRelease(pitchArr_19[count_19 % pitchArr_19.length], 3);
  } else if (triggerSparkles_19 && time_19 < 19000) {
    // first SHAKE gesture in 3" window in m. 188 triggers sparkly bells
    bellSampler.triggerAttackRelease('F5', 5);
    bellSampler.triggerAttackRelease(randBellLo_19, 5, '+16n');
    bellSampler.triggerAttackRelease(randBellHi_19, 5, '+8n');
    triggerSparkles_19 = false; // you only get one set of sparkles
  } else {
    // after sparkly burst, shakers gradually replaced by falling metals
    if (bellCountdown > 0) {
      shakerArr[count_19 % shakerArr.length].start();
      // gradual transposition from around m. 191 to m. 201
      let trans = tm.getSectionBreakpoints(19, [0, 0, 29000, 0, 59000, 12]);
      let pitch = Tone.Frequency(pitchArr_19[count_19 % pitchArr_19.length]).transpose(trans);
      sineTails.triggerAttackRelease(pitch, 3);
      bellCountdown--;
    } else {
      // F/A line falls octave lower while Eb/Eb falls only minor 7 lower
      let trans = tm.getSectionBreakpoints(19, [0, 0, 29000, 0, 59000, transRange_19]);
      if (count_19 % 2) {
        // alternate between low note in vibes/glass and high note in handbells
        let pitch = Tone.Frequency(metalPitchArr_19[0]).transpose(trans);
        vibeSampler.triggerAttackRelease(pitch, 3);
      } else {
        let pitch = Tone.Frequency(metalPitchArr_19[1]).transpose(trans);
        bellSampler.triggerAttackRelease(pitch, 5);
      }
      if (countdown_19 > 0) {
        // at first there are 7 shakers between bells, then 7, 6, etc down to 0
        bellCountdown = countdown_19--;
      } else {
        bellCountdown = 0;
      }
    }
  }
  count_19++;
  // first shake gesture in randomly assigned time span triggers reversed cymbal
  if (triggerCymRev && time_19 > revCymRange[0] && time_19 < revCymRange[1]) {
    revCym.start();
    triggerCymRev = false; // revCym only happens once per phone
  }
};
tm.cue[19].stopCue = function() {
  ziplockClickLoop.stop();
  sineTails.triggerRelease();
};

// *******************************************************************
// CUE 20: [Q] - orchestra enters after cadenza, phones fade out
let count_20 = 0;
let fmPitch_20 = tm.pickRand(['E4', 'G4', 'E5']);

// 4 beats @ 156 so audience may arrive a tiny bit earlier than orchestra at Q
tm.cue[20] = new TMCue('shake', 1538, 1000);
tm.cue[20].goCue = function() {
  count_20 = 0;
  vibeSampler.volume.value = 0;
  bellSampler.volume.value = 0;
  vibeSampler.volume.rampTo(-18, 6);
  bellSampler.volume.rampTo(-18, 6);
  fmSynth.envelope.attack = 3;
  fmSynth.envelope.attackCurve = 'linear';
  fmSynth.envelope.release = 3;
  fmSynth.envelope.releaseCurve = 'linear';
  fmSynth.modulationEnvelope.attack = 3;
  fmSynth.modulationEnvelope.attackCurve = 'linear';
  fmSynth.modulationEnvelope.release = 3;
  fmSynth.modulationEnvelope.releaseCurve = 'linear';
  fmSynth.volume.value = -6;
  fmSynth.triggerAttackRelease(fmPitch_20, 3.1);
  sineTails.triggerAttackRelease(fmPitch_20, 5);
};
tm.cue[20].triggerShakeSound = function() {
  // if anyone has NOT arrived at final pitches yet, it jumps to that loop here
  if (count_20 % 2) {
    bellSampler.triggerAttackRelease('G5', 5);
  } else {
    vibeSampler.triggerAttackRelease('E4', 3);
  }
  count_20++;
};
tm.cue[20].stopCue = function() {
  fmSynth.triggerRelease();
  sineTails.triggerRelease();
};

// *******************************************************************
// CUE 21: tacet after cadenza
tm.cue[21] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[21].goCue = function() {
  // nothing to play
};
tm.cue[21].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 22: [S] - TILT synth like cue 9 [F]
let pitchArr_22 = ['G4', 'G4', 'G5', 'A5', 'Bb5', 'C6', 'E6', 'F6', 'G6', 'G6'];
let pitchArr8ba_22 = ['G3', 'G3', 'G4', 'A4', 'Bb4', 'C5', 'E5', 'F5', 'G5', 'G5'];
let pitchLo_22, pitchHi_22;
let cue23WasTriggered = cue24WasTriggered = false;

const harpLoop_22 = new Tone.Loop((time) => {
  pitchLo_22 = pitchArr8ba_22[Math.floor(tm.accel.x * 0.99 * pitchArr_9.length)];
  pitchHi_22 = pitchArr_22[Math.floor(tm.accel.x * 0.99 * pitchArr_9.length)]
  if (cue23WasTriggered) {
    // pitch bend up whole step in second half of section
    let trans = tm.getSectionBreakpoints(23, [0, 0, 12307, 2]);
    pitchLo_22 = Tone.Frequency(pitchLo_22).transpose(trans);
    pitchHi_22 = Tone.Frequency(pitchHi_22).transpose(trans);
  }
  harpSampler.triggerAttackRelease(pitchLo_22, 1);
  harpSampler.triggerAttackRelease(pitchHi_22, 1, '+8n');
}, '4n');

tm.cue[22] = new TMCue('tilt', 1538, NO_LIMIT); // 4 beats @ 156 bpm
tm.cue[22].goCue = function() {
  harpSamplerVol.volume.value = 0;
  harpLoop_22.start();
  triangle.start();
  fmSynthDefaults();
  fmSynth.volume.value = -99; // prevent initial burst of unwanted sound
  fmSynth.triggerAttack('G4');
  cue23WasTriggered = cue24WasTriggered = false;
};
tm.cue[22].updateTiltSounds = function() {
  // after HIDDEN cue 23 is triggered, pitches bend up whole step
  if (cue23WasTriggered) {
    fmSynth.detune.value = tm.getSectionBreakpoints(23, [0, 0, 12307, 200]);
  }
  if (cue24WasTriggered) {
    // final harp sounds fade out (breakpoints at each downbeat)
    harpSamplerVol.volume.value = tm.getSectionBreakpoints(24, [0, 0, 1538, 0, 3076, -9, 4614, -18, 6152, -40]);
  }
  // multiply tm.accel.x by 0.99 to prevent bad access to pitchArr_9
  fmSynth.frequency.value = pitchArr8ba_22[Math.floor(tm.accel.x * 0.99 * pitchArr8ba_22.length)];
  if (tm.accel.y < 0.4) {
    // with phone mostly upright, synth is mostly silent and harp is soft
    harpSampler.volume.value = -12 - (0.4 - tm.accel.y) * 70; // -40 to -12 dB
    fmSynth.modulationIndex.value = 1;
    fmSynth.volume.value = -36 - (0.4 - tm.accel.y) * 157.5; // -99 to -36 dB
  } else if (tm.accel.y < 0.7) {
    // with phone in mid position, synth and harp cross fade, synth gets bright
    harpSampler.volume.value = -40 + (0.7 - tm.accel.y) * 93.4; // -12 to -40 dB
    fmSynth.modulationIndex.value = 5 - (0.7 - tm.accel.y) * 13.33; // 1 to 5
    fmSynth.volume.value = -30 - (0.7 - tm.accel.y) * 20; // -36 to -30 dB
  } else {
    // with phone mostly upside down, harp is soft and bright synth is heard
    harpSampler.volume.value = -99 + (1.0 - tm.accel.y) * 196; // -40 to -99 dB
    fmSynth.modulationIndex.value = 20 - (1.0 - tm.accel.y) * 50; // 5 to 20
    fmSynth.volume.value = -24 - (1.0 - tm.accel.y) * 20; // -30 to -24 dB
  }
};
tm.cue[22].stopCue = function() {
  // stopped by cue 24 transition, but stop here too in case user stops
  harpLoop_22.stop();
  fmSynth.triggerRelease();
};

// *******************************************************************
// CUE 23: m. 250 - hidden cue to bend pitches up
tm.cue[23] = new TMCue('hidden', 0, NO_LIMIT);
tm.cue[23].goCue = function() {
  // once this flag is set to true, pitch bend in cue 22 are triggered
  cue23WasTriggered = true;
};

// *******************************************************************
// CUE 24: m. 254 - hidden cue to fade out harp sounds
tm.cue[24] = new TMCue('hidden', 0, NO_LIMIT);
tm.cue[24].goCue = function() {
  cue24WasTriggered = true;
};
tm.cue[24].cueTransition = function() {
  // called BEFORE tm.cue[22].stopCue()
  harpLoop_22.stop();
  vibeSampler.triggerAttackRelease('B4', 3);
  vibeSampler.triggerAttackRelease('C5', 3, '+8n');
  vibeSampler.triggerAttackRelease('D5', 3, '+4n');
  fmSynth.triggerRelease();
}

// *******************************************************************
// CUE 25: [U] - SHAKE sounds of piano samples playing same notes as piano
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

let pitchArr1_25 = ['A4', 'A5', 'A4', 'A5', 'A4', 'A5', 'A5', 'B4', 'A5', 'A5', 'B4', 'A5', 'C#5', 'B5', 'B5', 'B5', 'D5', 'C#6', 'D5', 'C#6', 'D5', 'D6', 'D5', 'D6', 'D6', 'D5', 'D6', 'D6', 'A4', 'A5', 'A4', 'A5', 'A4', 'A5', 'A5', 'A4', 'G5', 'G5', 'A4', 'G5', 'G4', 'F#5', 'F#5', 'F#5', 'G4', 'F#5', 'F#4', 'E5', 'F#4', 'E5', 'E4', 'E5', 'E5', 'E4', 'E5', 'E5', 'E4', 'E6', 'E5'];
let count1_25 = count2_25 = 0;

tm.cue[25] = new TMCue('shake', 1538, NO_LIMIT); // 4 beats @ 156 bpm
tm.cue[25].goCue = function() {
  bellSampler.triggerAttackRelease('C#6', 5);
  count1_25 = count2_25 = 0;
  pianoSampler.volume.value = 0;
};
tm.cue[25].triggerShakeSound = function() {
  if (count1_25 < pitchArr1_25.length) {
    pianoSampler.triggerAttackRelease(pitchArr1_25[count1_25], 3);
    count1_25++;
  } else {
    // both upper sounds gradually slide up, lower E4 stays at pitch for now
    let trans;
    if (count2_25 > 30) {
      trans = 5; // max transposition P4 to As
    } else {
      trans = (count2_25 / 30) * 5.0; // gradually slide up perfect 4
    }
    if (count2_25 % 3 === 0) {
      pianoSampler.triggerAttackRelease('E4', 3);
    } else if (count2_25 % 3 === 1) {
      let pitch = Tone.Frequency('E6').transpose(trans);
      bellSampler.triggerAttackRelease(pitch, 5);
      sineTails.triggerAttackRelease(pitch, 1);
    } else {
      let pitch = Tone.Frequency('E5').transpose(trans);
      vibeSampler.triggerAttackRelease(pitch, 3);
      sineTails.triggerAttackRelease(pitch, 1);
    }
    count2_25++;
  }
};
tm.cue[25].stopCue = function() {
  sineTails.triggerRelease();
};

// *******************************************************************
// CUE 26: m. 286 - SHAKE sounds of piano/metal samples fading out
let count_26 = 0;

tm.cue[26] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[26].goCue = function() {
  count_26 = 0;
  pianoSampler.volume.value = 0;
  vibeSampler.volume.value = 0;
  bellSampler.volume.value = 0;
  sineTails.volume.value = -24;
  pianoSampler.volume.rampTo(-36, 6);
  vibeSampler.volume.rampTo(-36, 6);
  bellSampler.volume.rampTo(-36, 6);
  sineTails.volume.rampTo(-40, 6);
};
tm.cue[26].triggerShakeSound = function() {
  if (count2_25 % 3 === 0) {
    // both upper As stay put, but E4 moves toward F4 while fading out
    let trans = tm.getSectionBreakpoints(26, [0, 0, 6000, 1]);
    let pitch = Tone.Frequency('E4').transpose(trans);
    pianoSampler.triggerAttackRelease(pitch, 3);
  } else if (count2_25 % 3 === 1) {
    bellSampler.triggerAttackRelease('A6', 5);
    sineTails.triggerAttackRelease('A6', 1);
  } else {
    vibeSampler.triggerAttackRelease('A5', 3);
    sineTails.triggerAttackRelease('A5', 1);
  }
  count2_25++;
};
tm.cue[26].stopCue = function() {
  sineTails.triggerRelease();
};

// *******************************************************************
// CUE 27: [W] - TACET
tm.cue[27] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[27].goCue = function() {
  // nothing to play
};
tm.cue[27].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 28: [X] - TILT droning and warping synths
tm.cue[28] = new TMCue('tilt', 0, NO_LIMIT);
tm.cue[28].goCue = function() {
};
tm.cue[28].updateTiltSounds = function() {
};
tm.cue[28].stopCue = function() {
};

// *******************************************************************
// CUE 29: m. 330 - hidden cue to fade out synths
tm.cue[29] = new TMCue('hidden', 0, NO_LIMIT);
tm.cue[29].goCue = function() {
};

// *******************************************************************
// CUE 30: [Z] - TACET (audience is done playing)
tm.cue[30] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[30].goCue = function() {
  // nothing to play
};
tm.cue[30].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 31: finished
tm.cue[31] = new TMCue('finished', 0, NO_LIMIT);
tm.cue[31].goCue = function() {
  // nothing to play
};
