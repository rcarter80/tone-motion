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

// reversed cymbal sound to use at ends of some sections
const revCym = new Tone.Player(perc_sounds + 'revCym.mp3').toDestination();

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

// *******************************************************************
// CUE 5: actual beginning of piece (audience is tacet)
tm.cue[5] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[5].goCue = function() {
  // optimize motion update loop by turning off motion testing when piece starts
  tm.shouldTestMotion = false;
  tm.clearMotionErrorMessage();
}
tm.cue[5].stopCue = function() {
  // nothing to clean up
}

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
}
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
}

// *******************************************************************
// CUE 8: [E] - tacet transition
tm.cue[8] = new TMCue('tacet', -1);
tm.cue[8].goCue = function() {
  // nothing to play
}
tm.cue[8].stopCue = function() {
  // nothing to clean up
}

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
}).toDestination();

let pitchArr_9 = ['E4', 'E4', 'E5', 'F#5', 'G5', 'A6', 'C#6', 'D6', 'E6', 'E6'];
let pitchArr8ba_9 = ['E3', 'E3', 'E4', 'F#4', 'G4', 'A5', 'C#5', 'D5', 'E5', 'E5'];

const harpLoop_9 = new Tone.Loop((time) => {
	harpSampler.triggerAttackRelease(pitchArr8ba_9[Math.floor(tm.accel.x * 0.99 * pitchArr_9.length)], 1);
  harpSampler.triggerAttackRelease(pitchArr_9[Math.floor(tm.accel.x * 0.99 * pitchArr_9.length)], 1, '+8n');
}, '4n');

tm.cue[9] = new TMCue('tilt', 1538, NO_LIMIT); // 4 beats @ 156 bpm
tm.cue[9].goCue = function() {
  harpLoop_9.start();
  fmSynth.triggerAttack('E4');
}

// TODO: make this into sampler. This is just a test
const testBellE = new Tone.Player(bell_sounds + 'handbell-F6.mp3').toDestination();
testBellE.playbackRate = 1 / (2 ** (1/12));

tm.cue[9].updateTiltSounds = function() {
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
    fmSynth.modulationIndex.value = 20 - (1.0 - tm.accel.y) * 50; // 5 to 20
    fmSynth.volume.value = -24 - (1.0 - tm.accel.y) * 20; // -30 to -24 dB
  }
}
// called ONLY if next cue is triggered, NOT if user taps 'stop' button
tm.cue[9].cueTransition = function() {
  harpSampler.triggerAttackRelease('F#4', 1, '+4n');
  harpSampler.triggerAttackRelease('G4', 1, '+4n.');
  harpSampler.triggerAttackRelease('A4', 1, '+2n');
  vibeSampler.triggerAttackRelease('A5', 3, '+2n');
  // transition sounds called before stop cue below, so stop loop now
  harpLoop_9.stop();
}
// called BOTH when new cue is triggered OR if user taps 'stop' button
tm.cue[9].stopCue = function() {
  fmSynth.triggerRelease();
  // stop loop here too so that if someone taps stop button, the sound stops
  harpLoop_9.stop();
}

// *******************************************************************
// CUE 10: [G] - continuation of previous section with pitches sliding up

tm.cue[10] = new TMCue('tilt', 1538, NO_LIMIT); // 4 beats @ 156 bpm
tm.cue[10].goCue = function() {
  fmSynth.triggerAttack('E4');
  testBellE.start();
}
tm.cue[10].updateTiltSounds = function() {
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
    fmSynth.modulationIndex.value = 20 - (1.0 - tm.accel.y) * 50; // 5 to 20
    fmSynth.volume.value = -24 - (1.0 - tm.accel.y) * 20; // -30 to -24 dB
  }
}
tm.cue[10].cueTransition = function() {

}
tm.cue[10].stopCue = function() {
  fmSynth.triggerRelease();
}

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
  // TODO: if using .detune for pitch bend, need to reset at start of cue
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
