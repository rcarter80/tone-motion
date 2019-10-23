const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/hub-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/hub-server/current-cue');
  }
};

// Shortcuts to audio file paths
// TODO: deleted unused paths
const cello_sounds = 'tonemotion-shared/audio/cello/';
const chimes_sounds = 'tonemotion-shared/audio/chimes/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';
const glass_sounds = 'tonemotion-shared/audio/glass/';
const piano_sounds = 'tonemotion-shared/audio/piano/';

// TODO: delete unused sounds (might use clave, might not. deleted if not)
var clave = new Tone.Player(perc_sounds + "clave.mp3").toMaster();
var revCym = new Tone.Player(perc_sounds + "revCym.mp3").toMaster();

// Instruments need global scope within this file, but can appear just above the first cue in which they sound
Tone.Transport.bpm.value = 69;

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// *******************************************************************
// CUE 1: tilt tutorial
// Test tone for "tilt" tutorial
var testToneFilter = new Tone.Filter(440, "lowpass").toMaster();
var testTone = new Tone.Synth({
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
var testToneFreqScale = new Tone.Scale(440, 880); // scales control signal (0.0 - 1.0)
var testToneFilterScale = new Tone.Scale(440, 10000);
xTilt.chain(testToneFreqScale, testTone.frequency); // ctl sig is mapped to freq
yTilt.chain(testToneFilterScale, testToneFilter.frequency);
tm.cue[1] = new TMCue('tilt', -1);
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
tm.cue[2] = new TMCue('tacet', -1);
tm.cue[2].goCue = function() {
  // nothing to play
}
tm.cue[2].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 3: shake tutorial
var cowbell = new Tone.Player(perc_sounds + 'cowbell.mp3').toMaster();
tm.cue[3] = new TMCue('shake', -1);
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
tm.cue[4] = new TMCue('waiting', -1);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// *******************************************************************
// CUE 5: Actual beginning of piece, but first section is tacet
tm.cue[5] = new TMCue('tacet', -1);
tm.cue[5].goCue = function() {
  if (tm.debug) { tm.publicLog('The piece has started.'); }
};
tm.cue[5].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 6: Warping tilt twinkles
var glLongE4 = new Tone.Player(glass_sounds + "glassLongE4.mp3").toMaster();
// load same audio file into second buffer to allow retrigger without artifact
var glLongE4b = new Tone.Player(glass_sounds + "glassLongE4.mp3").toMaster();
var glLongC5 = new Tone.Player(glass_sounds + "glassLongC5.mp3").toMaster();
var glLongC5b = new Tone.Player(glass_sounds + "glassLongC5.mp3").toMaster();
var glLongG5 = new Tone.Player(glass_sounds + "glassLongG5.mp3").toMaster();
var glLongG5b = new Tone.Player(glass_sounds + "glassLongG5.mp3").toMaster();
var glLongB5 = new Tone.Player(glass_sounds + "glassLongB5.mp3").toMaster();
var glLongB5b = new Tone.Player(glass_sounds + "glassLongB5.mp3").toMaster();
var glLongFsharp6 = new Tone.Player(glass_sounds + "glassLongFsharp6.mp3").toMaster();
var glLongFsharp6b = new Tone.Player(glass_sounds + "glassLongFsharp6.mp3").toMaster();
var glLongE5 = new Tone.Player(glass_sounds + "glassLongE5.mp3").toMaster();
var glLongE5b = new Tone.Player(glass_sounds + "glassLongE5.mp3").toMaster();
var glLongC6 = new Tone.Player(glass_sounds + "glassLongC6.mp3").toMaster();
var glLongC6b = new Tone.Player(glass_sounds + "glassLongC6.mp3").toMaster();
var glLongG6 = new Tone.Player(glass_sounds + "glassLongG6.mp3").toMaster();
var glLongG6b = new Tone.Player(glass_sounds + "glassLongG6.mp3").toMaster();
var glLongB6 = new Tone.Player(glass_sounds + "glassLongB6.mp3").toMaster();
var glLongB6b = new Tone.Player(glass_sounds + "glassLongB6.mp3").toMaster();
var glLongFsharp7 = new Tone.Player(glass_sounds + "glassLongFsharp7.mp3").toMaster();
var glLongFsharp7b = new Tone.Player(glass_sounds + "glassLongFsharp7.mp3").toMaster();
var glShortE4 = new Tone.Player(glass_sounds + "glassShortE4.mp3").toMaster();
var glShortC5 = new Tone.Player(glass_sounds + "glassShortC5.mp3").toMaster();
var glShortG5 = new Tone.Player(glass_sounds + "glassShortG5.mp3").toMaster();
var glShortB5 = new Tone.Player(glass_sounds + "glassShortB5.mp3").toMaster();
var glShortFsharp6 = new Tone.Player(glass_sounds + "glassShortFsharp6.mp3").toMaster();
var glShortE5 = new Tone.Player(glass_sounds + "glassShortE5.mp3").toMaster();
var glShortC6 = new Tone.Player(glass_sounds + "glassShortC6.mp3").toMaster();
var glShortG6 = new Tone.Player(glass_sounds + "glassShortG6.mp3").toMaster();
var glShortB6 = new Tone.Player(glass_sounds + "glassShortB6.mp3").toMaster();
var glShortFsharp7 = new Tone.Player(glass_sounds + "glassShortFsharp7.mp3").toMaster();
var glExtraLongG3 = new Tone.Player(glass_sounds + "glassExtraLongG3.mp3").toMaster();
var glExtraLongBb3 = new Tone.Player(glass_sounds + "glassExtraLongBb3.mp3").toMaster();
var glExtraLongD7 = new Tone.Player(glass_sounds + "glassExtraLongD7.mp3").toMaster();

// use array of duplicated sound files to avoid artifacts of retriggering
var glLongArrayE = [glLongE4, glLongE5, glLongE4b, glLongE5b];
var glLongArrayC = [glLongC5, glLongC6, glLongC5, glLongC6b];
var glLongArrayG = [glLongG5, glLongG6, glLongG5, glLongG6b];
var glLongArrayB = [glLongB5, glLongB6, glLongB5, glLongB6b];
var glLongArrayFsharp = [glLongFsharp6, glLongFsharp6b, glLongFsharp7, glLongFsharp7b];

var counterCue6 = 0;
// add slight random detune to longer sounds, which come into tune at end
var detuneCue6 = 1 + Math.random() * 0.02; // less than quarter-tone detune
console.log(detuneCue6);

var loopCue6 = new Tone.Loop(function(time) {
  if (tm.accel.y < 0.33) {
    if (tm.accel.x < 0.2) {
      // short sounds when phone is tilted up
      // gradually shift down over 6 bars (after no change for 4 bars)
      glShortE4.playbackRate = glShortE5.playbackRate = tm.getSectionBreakpoints([0,1, 13913,1, 34783,0.707]);
      (counterCue6 % 2) ? glShortE4.start() : glShortE5.start();
    } else if (tm.accel.x < 0.4) {
      glShortC5.playbackRate = glShortC6.playbackRate = tm.getSectionBreakpoints([0,1, 13913,1, 34783,0.794]);
      (counterCue6 % 2) ? glShortC5.start() : glShortC6.start();
    } else if (tm.accel.x < 0.6) {
      glShortG5.playbackRate = glShortG6.playbackRate = tm.getSectionBreakpoints([0,1, 13913,1, 34783,0.667]);
      (counterCue6 % 2) ? glShortG5.start() : glShortG6.start();
    } else if (tm.accel.x < 0.8) {
      glShortB5.playbackRate = glShortB6.playbackRate = tm.getSectionBreakpoints([0,1, 13913,1, 34783,0.841]);
      (counterCue6 % 2) ? glShortB5.start() : glShortB6.start();
    } else {
      glShortFsharp6.playbackRate = glShortFsharp7.playbackRate = tm.getSectionBreakpoints([0,1, 13913,1, 34783,0.794]);
      (counterCue6 % 2) ? glShortFsharp6.start() : glShortFsharp7.start();
    }
  } else {
    if (tm.accel.x < 0.2) {
      glLongE4.playbackRate = glLongE5.playbackRate = glLongE4b.playbackRate = glLongE5b.playbackRate = tm.getSectionBreakpoints([0,detuneCue6, 13913,detuneCue6, 34783,0.707]);
      glLongArrayE[counterCue6 % 4].start();
    } else if (tm.accel.x < 0.4) {
      glLongC5.playbackRate = glLongC6.playbackRate = glLongC5b.playbackRate = glLongC6b.playbackRate = tm.getSectionBreakpoints([0,detuneCue6, 13913,detuneCue6, 34783,0.794]);
      glLongArrayC[counterCue6 % 4].start();
    } else if (tm.accel.x < 0.6) {
      glLongG5.playbackRate = glLongG6.playbackRate = glLongG5b.playbackRate = glLongG6b.playbackRate = tm.getSectionBreakpoints([0,detuneCue6, 13913,detuneCue6, 34783,0.667]);
      glLongArrayG[counterCue6 % 4].start();
    } else if (tm.accel.x < 0.8) {
      glLongB5.playbackRate = glLongB6.playbackRate = glLongB5b.playbackRate = glLongB6b.playbackRate = tm.getSectionBreakpoints([0,detuneCue6, 13913,detuneCue6, 34783,0.841]);
      glLongArrayB[counterCue6 % 4].start();
    } else {
      glLongFsharp6.playbackRate = glLongFsharp7.playbackRate = glLongFsharp6b.playbackRate = glLongFsharp7b.playbackRate = tm.getSectionBreakpoints([0,detuneCue6, 13913,detuneCue6, 34783,0.794]);
      glLongArrayFsharp[counterCue6 % 4].start();
    }
  }
  counterCue6++;
}, "32n");

// 1739 ms. = 2 beats @ 69bpm
tm.cue[6] = new TMCue('tilt', 1739, NO_LIMIT);
tm.cue[6].goCue = function() {
  // reset tempo in case most recent cue had different tempo
  Tone.Transport.bpm.value = 69;
  // reset counter in case section has been repeated
  counterCue6 = 0;
  loopCue6.start();
};
tm.cue[6].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[6].stopCue = function() {
  loopCue6.stop();
  // sound with much longer tail triggered when looped stops
  glExtraLongBb3.start();
};

// *******************************************************************
// CUE 7: 1-bar fill with random hocket and unison last long note
var counterCue7 = 0;
var pitchArrayCue7 = [glShortE4,glShortG5,glShortC5,glShortFsharp6,glShortB5,glShortG5, glShortFsharp7,glShortE5,glShortG6,glShortC6,glShortB6,glShortE5, glShortFsharp7,glShortE4,glShortG5,glShortC5,glShortFsharp6,glShortE4, glShortC5,glShortG5,glShortB5,glShortG6,glShortB6];
var fillLoopCue7 = new Tone.Loop(function(time) {
  if (counterCue7 === 23) {
    glExtraLongD7.start();
  } else {
    // weighted probability of note happening
    if (Math.random() < 0.1666) {
      pitchArrayCue7[counterCue7].start();
    }
  }
  counterCue7++;
}, "16t");
// 4 beats of sextuplets but last note of bar is different sound file
fillLoopCue7.iterations = 24;

// must arrive on time for perfect synchrony, but sparse texture allows holes
tm.cue[7] = new TMCue('listen', 1739, 0);
tm.cue[7].goCue = function() {
  // reset tempo in case most recent cue had different tempo
  Tone.Transport.bpm.value = 69;
  // reset counter in case section has been repeated
  counterCue7 = 0;
  // use short sound from previous section, but pitch has already bent down
  glShortE4.playbackRate = glShortE5.playbackRate = 0.707;
  glShortC5.playbackRate = glShortC6.playbackRate = 0.794;
  glShortG5.playbackRate = glShortG6.playbackRate = 0.667;
  glShortB5.playbackRate = glShortB6.playbackRate = 0.841;
  glShortFsharp6.playbackRate = glShortFsharp7.playbackRate = 0.794;
  fillLoopCue7.start();
}
tm.cue[7].stopCue = function() {
  // shouldn't need to stop because fill stops itself, but just in case
  fillLoopCue7.stop();
}

// *******************************************************************
// CUE 8: tacet
tm.cue[8] = new TMCue('tacet', -1);
tm.cue[8].goCue = function() {
  // no sound here
}
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9: Shaking bells through predefined pitch array (with looped tail)
// TODO: replace glassReal files with better recordings. could use 2 glasses
var glE3 = new Tone.Player(glass_sounds + "glassRealE3.mp3").toMaster();
var glF3 = new Tone.Player(glass_sounds + "glassRealF3.mp3").toMaster();
var glA3 = new Tone.Player(glass_sounds + "glassRealA3.mp3").toMaster();
var glBb3 = new Tone.Player(glass_sounds + "glassRealBb3.mp3").toMaster();
var glD4 = new Tone.Player(glass_sounds + "glassRealD4.mp3").toMaster();
var glE4 = new Tone.Player(glass_sounds + "glassRealE4.mp3").toMaster();
var glF4 = new Tone.Player(glass_sounds + "glassRealF4.mp3").toMaster();
var glA4 = new Tone.Player(glass_sounds + "glassRealA4.mp3").toMaster();
var glBb4 = new Tone.Player(glass_sounds + "glassRealBb4.mp3").toMaster();
var glD5 = new Tone.Player(glass_sounds + "glassRealD5.mp3").toMaster();

var counterCue9 = 0;
// initial array of pitches triggered
var pitchArrayCue9 = [glBb3,glBb4,glD4,glD5,glBb3,glD4,glBb4,glD5, glA3,glA4,glD4,glD5,glA3,glD4,glA4,glD5, glBb3,glBb4,glD4,glD5,glBb3,glD4,glBb4,glD5, glA3,glA4,glD4,glD5,glA3,glD4,glA4,glD5, glF3,glF4,glD4,glD5,glF3,glD4,glF4,glD5, glE3,glE4,glD4,glD5,glE3,glD4,glE4,glD5, glF3,glF4,glD4,glD5,glF3,glD4,glF4,glD5, glE3,glE4,glD4,glD5,glE3,glD4,glE4,glD5];
// loop of 3 Ds that repeat after first array is exhausted
var pitchLoopCue9 = [glD4,glD5,glExtraLongD7];

tm.cue[9] = new TMCue('shake', 1739, NO_LIMIT);
tm.cue[9].goCue = function() {
  // reset counter
  counterCue9 = 0;
};
tm.cue[9].triggerShakeSound = function() {
  if (counterCue9 < pitchArrayCue9.length) {
    pitchArrayCue9[counterCue9].start();
  } else {
    // repeats same three pitches until end of section
    pitchLoopCue9[counterCue9 % pitchLoopCue9.length].start();
  }
  counterCue9++;
};
tm.cue[9].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 10: Synths cycling through pitch cells (pitch: x-axis, articulation: y)
var counterCue10 = 0;

// TODO: refine synth sound, create two more synths, rename with reusable names
var testSynth1 = new Tone.MonoSynth({
  oscillator: {
    type: 'sawtooth16'
  },
  envelope: {
    attack: 0.03,
    decay: 0.01,
    sustain: 0.8,
    release: 0.03
  }
}).toMaster()
var testSynth2 = new Tone.MonoSynth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 0.03,
    decay: 0.01,
    sustain: 0.8,
    release: 0.03
  }
}).toMaster()
var testSynth3 = new Tone.MonoSynth({
  oscillator: {
    type: 'square13'
  },
  envelope: {
    attack: 0.03,
    decay: 0.01,
    sustain: 0.8,
    release: 0.03
  }
}).toMaster()

var pitchArrayCue10 = [['B2','B3','B4','D5','B5','D6','B6','D7'], ['B2','B3','B4','C#5','D5','B5','C#6','D6','B6','C#7','D7'], ['B2','B3','B4','C#5','D5','E5','B5','C#6','D6','E6','B6','C#7','D7','E7'], ['A2','A3','A4','C#5','D5','E5','A5','C#6','D6','E6','A6','C#7','D7','E7'], ['B2','B3','B4','D5','B5','D6','B6','D7'], ['B2','B3','B4','F#5','B5','F#6','B6','F#7'], ['A2','A3','A4','C#5','D5','F#5','A5','C#6','D6','F#6','A6','C#7','D7','F#7'], ['A2','A3','A4','C#5','D5','E5','A5','C#6','D6','E6','A6','C#7','D7','E7']];
var thisPitchCell, thisPitch;

var synthLoopCue10 = new Tone.Loop(function(time) {
  // stays on each pitch cell for 1 bar (24 sixteeth notes)
  thisPitchCell = pitchArrayCue10[Math.floor(counterCue10 / 24) % pitchArrayCue10.length];

  if (tm.accel.y > 0.5) {
    // continuous synth with interactive pitch on x-axis
    if (testSynth3.volume.value == -99) {
      testSynth3.volume.rampTo(0, 0.05);
    }
    // clamp tm.accel.x to 0.99 to prevent reading past bounds of pitch array
    thisPitch = thisPitchCell[Math.floor((tm.accel.x * 0.99) * (thisPitchCell.length))];
    if (testSynth3.frequency.value != thisPitch) {
      testSynth3.setNote(thisPitch);
    }
  } else {
    // mute continuous synth if not already muted
    if (testSynth3.volume.value > -99) {
      testSynth3.volume.rampTo(-99, 0.05);
    }
    // prevent using last note in array because that will be triggered next
    thisPitch = Math.floor((tm.accel.x * 0.99) * (thisPitchCell.length - 1));
    // alternate adjacent pitches of cell to prevent excessive repetition
    // use two synths to allow overlapping sound
    testSynth1.filterEnvelope.baseFrequency = (200 + tm.accel.y * 1800); testSynth2.filterEnvelope.baseFrequency = (200 + tm.accel.y * 1800);

    counterCue10 % 2 ? testSynth1.triggerAttackRelease(thisPitchCell[thisPitch], '16n') : testSynth2.triggerAttackRelease(thisPitchCell[thisPitch + 1], '16n');
  }
  counterCue10++;
}, '16n');

// open window of just one extra beat to keep things pretty closely aligned
tm.cue[10] = new TMCue('tilt', 2143, 714);
tm.cue[10].goCue = function() {
  // new tempo for this sections
  Tone.Transport.bpm.value = 84;
  counterCue10 = 0;
  // unmute other synths because those are only triggered in response to action
  testSynth1.volume.value = 0;
  testSynth2.volume.value = 0;
  // trigger continuous synth that holds through section, but mute by default
  testSynth3.volume.value = -99;
  testSynth3.triggerAttack('B4');
  synthLoopCue10.start();
}
tm.cue[10].updateTiltSounds = function() {
  // all tilt interactivity handled in loop
  // nothing to do here but override method
};
tm.cue[10].stopCue = function() {
  // fade out sounds and then stop
  testSynth1.volume.rampTo(-99, '1m');
  testSynth2.volume.rampTo(-99, '1m');
  testSynth3.volume.rampTo(-99, '1m');
  testSynth3.triggerRelease('+1m');
  synthLoopCue10.stop('+1m');
}

// *******************************************************************
// CUE 11: non-interactive synth fill (just last 2 beats of section)
// must arrive on time for perfect synchrony, but sparse texture allows holes
tm.cue[11] = new TMCue('listen', 2857, 0);

var testSynth4 = new Tone.MonoSynth({
  oscillator: {
    type: 'square13'
  },
  envelope: {
    attack: 0.03,
    decay: 0.01,
    sustain: 0.8,
    release: 0.03
  }
}).toMaster()

var counterCue11 = 0;
var pitchArrayCue11 = ['A3','A4','A5','C#5','C#6','C#7','A6','A5','A4','C#6','C#5','C#4'];
// randomly assign client to 1 of 6 parts (sextuplet subdivision of beat)
var partSwitchCue11 = Math.floor(Math.random() * 6);

var fillLoopCue11 = new Tone.Loop(function(time) {
  if (counterCue11 > 10) {
    glExtraLongG3.start();
  } else {
    if (counterCue11 % 6 === partSwitchCue11) {
      testSynth4.triggerAttackRelease(pitchArrayCue11[counterCue11], '16t');
    }
  }
  counterCue11++;
}, '16t');
fillLoopCue11.iterations = 12;

tm.cue[11].goCue = function() {
  // reset tempo and counter
  Tone.Transport.bpm.value = 84;
  counterCue11 = 0;
  fillLoopCue11.start();
}
tm.cue[11].stopCue = function() {
  // shouldn't need to stop because fill stops itself, but just in case
  // delay loop stop to prevent premature cut off
  fillLoopCue11.stop('+2n');
}

// *******************************************************************
// CUE 12: Shake gesture triggers cello jete glissing up from D4 to B4

var vcJete1 = new Tone.Player(cello_sounds + "vc-jete-1.mp3").toMaster();
var vcJete2 = new Tone.Player(cello_sounds + "vc-jete-2.mp3").toMaster();
var vcClbGliss1 = new Tone.Player(cello_sounds + "vc-clb-gliss-1.mp3").toMaster();
var vcClbGliss2 = new Tone.Player(cello_sounds + "vc-clb-gliss-2.mp3").toMaster();
var vcJeteArray = [vcJete1, vcClbGliss1, vcJete2, vcClbGliss2];
var counterCue12 = 0;
var thisVcSound;

tm.cue[12] = new TMCue('shake', -1);
tm.cue[12].goCue = function() {
  counterCue12 = 0;
  // sound is recorded at Bb but needs to be a D
  vcJete1.playbackRate = 1.26;
  vcJete1.start();
};
tm.cue[12].triggerShakeSound = function() {
  // avoid overlapping file playback by cycling through them
  thisVcSound = vcJeteArray[counterCue12 % vcJeteArray.length];
  // Sound in recording is Bb. Need to start on D4 and go to B4
  // stays on D4 for 1 bar, then goes up to B4 over next 6 bars (and stays)
  thisVcSound.playbackRate = tm.getSectionBreakpoints([0,1.26, 4286,1.26, 30000,2.119]);

  thisVcSound.start();
  counterCue12++;
};
tm.cue[12].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 13: Shake gesture triggers bouncy glass sound glissing up from B4 to G#5
var glBounceB5 = new Tone.Player(glass_sounds + "glassBounceB5.mp3").toMaster();
var glBounceB6 = new Tone.Player(glass_sounds + "glassBounceB6.mp3").toMaster();

var counterCue13 = 0;
var thisGlassSound;

tm.cue[13] = new TMCue('shake', -1);
tm.cue[13].goCue = function() {
  // reset counter
  counterCue13 = 0;
};
tm.cue[13].triggerShakeSound = function() {
  thisGlassSound = counterCue13 % 2 ? glBounceB5 : glBounceB6;

  // stays on B4 for 1 bar, then goes up to G#5 over next 6 bars (and stays)
  thisGlassSound.playbackRate = tm.getSectionBreakpoints([0,1, 4286,1, 30000,1.682]);
  thisGlassSound.start();
  counterCue13++;
};
tm.cue[13].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 14: granulated sparkles
// determines how often .seek() is called. actual grain size is longer
var granulatorGrainSize = 0.1;
var granulator = new Tone.GrainPlayer({
  "url": granulated_sounds + "grFile.mp3",
  "overlap": 0.0125,
  "grainSize": granulatorGrainSize * 2,
  "loop": true,
  "detune": 0
}).toMaster();
var granulatorOffset = 8.5; // subsequent scrub positions set interactively in updateSoundsInCue4() below
var granulatorDur = 35;

tm.cue[14] = new TMCue('tilt', 1875, NO_LIMIT); // 3 beats @ 96bpm
tm.cue[14].goCue = function() {
  Tone.Transport.scheduleRepeat(function(time) {
    // GrainPlayer may not be ready for .seek(). Catch InvalidStateError
    // If try fails, grain player still scrubs but detune is reset to 0
    granulator.volume.value = tm.getSectionBreakpoints([0,0, 10000,0, 15000,-3, 25000,-12, 30000,-99]);
    try { granulator.seek(granulatorOffset); } catch(e) { console.log(e); }
  }, granulatorGrainSize);
}
tm.cue[14].updateTiltSounds = function() {
  // .seek() invoked by .scheduleRepeat()
  // index into sound file controlled by x-axis
  granulatorOffset = tm.accel.x * granulatorDur;
  // playback rate of grain set by y-axis
  granulator.detune = 2400 * tm.accel.y;
}
tm.cue[14].stopCue = function() {
  Tone.Transport.cancel(); // cancel granulator repeat
}

// *******************************************************************
// CUE 15: shaken bell crossfading from G4 to D6

tm.cue[15] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[15].goCue = function() {
  // nothing to do here
};
tm.cue[15].triggerShakeSound = function() {
  // TODO: replace with new sound files on G4 and D6 and fix crossfade
  glLongG5.volume.value = tm.getSectionBreakpoints([0,0, 5000,0, 25000,-99]);
  glD5.volume.value = tm.getSectionBreakpoints([0,-99, 5000,-99, 25000,0]);

  glLongG5.start();
  glD5.start();
};
tm.cue[15].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 16: tacet
tm.cue[16] = new TMCue('tacet', -1);
tm.cue[16].goCue = function() {
  // no sound here
};
tm.cue[16].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 17: piano loop with pitch/time bend on x-axis
var pianoLoop = new Tone.Player(piano_sounds + "pianoLoop.mp3").toMaster();

tm.cue[17] = new TMCue('tilt', 2500, 0);
tm.cue[17].goCue = function() {
  pianoLoop.volume.value = 0;
  pianoLoop.start();
};
tm.cue[17].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up (up to 1.2 times)
    pianoLoop.playbackRate = 1 + (tm.accel.y - 0.6) * 0.5;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoop.playbackRate = 1 - (0.4 - tm.accel.y) * 0.25;
  } else {
    pianoLoop.playbackRate = 1;
  }
}
tm.cue[17].stopCue = function() {
  // gradual fade out before stopping this iteration (in case listener plays very slowly)
  pianoLoop.volume.rampTo(-99, 8);
};

// *******************************************************************
// CUE 18: second iteration of piano loop. started over again to resync

// TODO: adjust fade out (make longer or don't fade to -99?)

tm.cue[18] = new TMCue('tilt', 2500, 0);
tm.cue[18].goCue = function() {
  // loop has been fading out, but stop in case it's still going
  pianoLoop.stop();
  // reset volume before starting loop again
  pianoLoop.volume.value = 0;
  pianoLoop.start();
};
tm.cue[18].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up (up to 1.2 times)
    pianoLoop.playbackRate = 1 + (tm.accel.y - 0.6) * 0.5;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoop.playbackRate = 1 - (0.4 - tm.accel.y) * 0.25;
  } else {
    pianoLoop.playbackRate = 1;
  }
}
tm.cue[18].stopCue = function() {
  pianoLoop.volume.rampTo(-99, 8);
};

// *******************************************************************
// CUE 19: third iteration of piano loop. started over again to resync

tm.cue[19] = new TMCue('tilt', 2500, 0);
tm.cue[19].goCue = function() {
  // loop has been fading out, but stop in case it's still going
  pianoLoop.stop();
  // reset volume before starting loop again
  pianoLoop.volume.value = 0;
  pianoLoop.start();
};
tm.cue[19].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up (up to 1.2 times)
    pianoLoop.playbackRate = 1 + (tm.accel.y - 0.6) * 0.5;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoop.playbackRate = 1 - (0.4 - tm.accel.y) * 0.25;
  } else {
    pianoLoop.playbackRate = 1;
  }
}
tm.cue[19].stopCue = function() {
  // gradual fade out before stopping this iteration (in case listener plays very slowly)
  // TODO: make last fade out longer?
  pianoLoop.volume.rampTo(-99, 8);
};

// *******************************************************************
// CUE 20: shaken piano octave Es
var counterCue20 = 0;
var pianoE5 = new Tone.Player(piano_sounds + "pianoE5.mp3").toMaster();
var pianoE6 = new Tone.Player(piano_sounds + "pianoE6.mp3").toMaster();
var pianoE7 = new Tone.Player(piano_sounds + "pianoE7.mp3").toMaster();

var pianoArrayCue20 = [pianoE5, pianoE6, pianoE7];
var thisPianoNote;

tm.cue[20] = new TMCue('shake', 2500, 0);
tm.cue[20].goCue = function() {
  // reset counter
  counterCue20 = 0;
};
tm.cue[20].triggerShakeSound = function() {
  // TODO: record or make better piano sounds
  thisPianoNote = pianoArrayCue20[counterCue20 % pianoArrayCue20.length];

  thisPianoNote.start();

  counterCue20++;
};
tm.cue[20].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 21: tacet coda
tm.cue[21] = new TMCue('tacet', -1);
tm.cue[21].goCue = function() {
  // nothing to play
}
tm.cue[21].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 22: finished
tm.cue[22] = new TMCue('finished', -1);
tm.cue[22].goCue = function() {
  tm.publicLog('The piece is done.');
}

// *******************************************************************
// CUES 23-26: use for quartet to test pedal and cue counter

tm.cue[23] = new TMCue('waiting', -1);
tm.cue[23].goCue = function() {
  tm.publicLog('Test cue 23 was triggered.');
};
tm.cue[24] = new TMCue('waiting', -1);
tm.cue[24].goCue = function() {
  tm.publicLog('Test cue 24 was triggered.');
};
tm.cue[25] = new TMCue('waiting', -1);
tm.cue[25].goCue = function() {
  tm.publicLog('Test cue 25 was triggered.');
};
tm.cue[26] = new TMCue('waiting', -1);
tm.cue[26].goCue = function() {
  tm.publicLog('Test cue 26 was triggered.');
};
