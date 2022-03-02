const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  // TODO: create server for ryancarter.org/bp
  if (tm.localTest) {
    tm.init('http://localhost:3000/snm-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/snm-server/current-cue');
  }
};

// Shortcuts to audio file paths
const perc_sounds = 'tonemotion-shared/audio/perc/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';
const glock_sounds = 'tonemotion-shared/audio/glockenspiel/';
const bell_sounds = 'tonemotion-shared/audio/bells/';
const glass_sounds = 'tonemotion-shared/audio/glass/';
const harp_sounds = 'tonemotion-shared/audio/harp/';

// 1st tempo used by Tone.Loop. Putting this is goCue() caused ~2 min. latency
Tone.Transport.bpm.value = 156;

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
  fmSynth.detune.value = 0;
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
  // vibes sounds can't be triggered by cueTransition because that is only called when triggered cue is NEXT cue (i.e., cue 10) but 10 is hidden cue
  harpLoop_9.stop();
  vibeSampler.triggerAttackRelease('B5', 3);
  vibeSampler.triggerAttackRelease('C#6', 3, '+8n');
  vibeSampler.triggerAttackRelease('D6', 3, '+4n');
  fmSynth.triggerRelease();
};

// *******************************************************************
// CUE 10: [G] - hidden cue to bend pitches up
tm.cue[10] = new TMCue('hidden', 0, NO_LIMIT);
tm.cue[10].goCue = function() {
  // once this flag is set to true, pitch bend in cue 9 are triggered
  cue10WasTriggered = true;
};

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
let playGongFlag_16 = true;

tm.cue[16] = new TMCue('tilt', 0, NO_LIMIT); // immediate trigger, faded in
tm.cue[16].goCue = function() {
  // gong sounds triggered when phone is upside down, but that sets flag that can only be reset when phone tilted back up, so gong only plays once per downward tipping gesture
  playGongFlag_16 = true;
};
tm.cue[16].updateTiltSounds = function() {
  if (tm.accel.y > 0.7) {
    if (playGongFlag_16) {
      console.log('gong');
      playGongFlag_16 = false; // flag is false until phone tipped back up
    }
  } else if (tm.accel.y < 0.3) {
    if (!playGongFlag_16) {
      playGongFlag_16 = true; // tipping phone upright resets flag
    }
  }
};
tm.cue[16].stopCue = function() {
};

// *******************************************************************
// CUE 22: [S] - TILT synth like cue 9 [F]
let pitchArr_22 = ['G4', 'G4', 'G5', 'A5', 'Bb5', 'C6', 'E6', 'F6', 'G6', 'G6'];
let pitchArr8ba_22 = ['G3', 'G3', 'G4', 'A4', 'Bb4', 'C5', 'E5', 'F5', 'G5', 'G5'];

const harpLoop_22 = new Tone.Loop((time) => {
	harpSampler.triggerAttackRelease(pitchArr_22[Math.floor(tm.accel.x * 0.99 * pitchArr_22.length)], 1);
  harpSampler.triggerAttackRelease(pitchArr8ba_22[Math.floor(tm.accel.x * 0.99 * pitchArr8ba_22.length)], 1, '+8n');
}, '4n');

tm.cue[22] = new TMCue('tilt', 1538, NO_LIMIT); // 4 beats @ 156 bpm
tm.cue[22].goCue = function() {
  harpLoop_22.start();
  fmSynth.detune.value = 0;
  fmSynth.triggerAttack('G4');
}

tm.cue[22].updateTiltSounds = function() {
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
}
// called ONLY if next cue is triggered, NOT if user taps 'stop' button
tm.cue[22].cueTransition = function() {
  // harpSampler.triggerAttackRelease('G3', 1, '+4n');
  // harpSampler.triggerAttackRelease('G4', 1, '+4n.');
  // harpSampler.triggerAttackRelease('G5', 1, '+4n.');
  // vibeSampler.triggerAttackRelease('G5', 3, '+2n');
  // // transition sounds called before stop cue below, so stop loop now
  // harpLoop_9.stop();
}
// called BOTH when new cue is triggered OR if user taps 'stop' button
tm.cue[22].stopCue = function() {
  fmSynth.triggerRelease();
  // stop loop here too so that if someone taps stop button, the sound stops
  harpLoop_22.stop();
}
