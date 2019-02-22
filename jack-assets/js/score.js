const tm = new ToneMotion();
tm.debug = true;
window.onload = function() {
  tm.init();
};

// Instruments need global scope within this file, but can appear just above the first cue in which they sound
Tone.Transport.bpm.value = 76;

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
  tm.publicLog('tm.cue[2].goCue() called');
}

// *******************************************************************
// CUE 3: shake tutorial
var cowbell = new Tone.Player("jack-assets/audio/cowbell.mp3").toMaster();
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

// *******************************************************************
// CUE 6: Warping shake chimes
var vibeE4 = new Tone.Player("jack-assets/audio/vibe-E4.mp3").toMaster();
var vibeD5 = new Tone.Player("jack-assets/audio/vibe-D5.mp3").toMaster();
var vibeB5 = new Tone.Player("jack-assets/audio/vibe-B5.mp3").toMaster();
var vibeGsharp6 = new Tone.Player("jack-assets/audio/vibe-Gsharp6.mp3").toMaster();
// DOLATER: could fine tune playbackRate to get just intonation
var vibesArray = [vibeE4, vibeD5, vibeB5, vibeGsharp6];
// array for pitch bending intervals of vibes
// must be same length as vibesArray. refactor with error checking
// down 2 half steps, 3 half steps, 4 half steps, 3 half steps
var vibesBendArray = [0.109, 0.159, 0.206, 0.159];

tm.cue[6] = new TMCue('shake', 1579, NO_LIMIT); // 4 beats @ 152bpm
tm.cue[6].goCue = function() {
  // triplet flourish of vibes on downbeat (could clean up)
  var thisVibe = vibesArray[Math.floor(Math.random()*vibesArray.length)];
  thisVibe.start();
  var thisVibe = vibesArray[Math.floor(Math.random()*vibesArray.length)];
  thisVibe.start('+8t');
  var thisVibe = vibesArray[Math.floor(Math.random()*vibesArray.length)];
  thisVibe.start('+4t');
};
tm.cue[6].triggerShakeSound = function() {
  // testing how to change sounds throughout section
  // DOLATER: refactor this to tonemotion library as tm.getSectionCounter()
  // and remove log of sectionCounter
  var elapsedTime = Date.now() - tm.clientServerOffset - tm.currentCueStartedAt;
  var durationOfSection = 50000; // just short of end of section
  // clamp counter at 1.0 (in case section takes longer than expected)
  var sectionCounter = (elapsedTime / durationOfSection <= 1) ? elapsedTime / durationOfSection : 1;

  var randomVibe = Math.floor(Math.random() * vibesArray.length);
  vibesArray[randomVibe].playbackRate = 1 - (vibesBendArray[randomVibe] * sectionCounter);
  vibesArray[randomVibe].start();
};

// *******************************************************************
// CUE 7: hidden cue with non-interactive reversed cymbal
// duration of revCym is 4467 ms.
var revCym = new Tone.Player("jack-assets/audio/revCym.mp3").toMaster();
tm.cue[7] = new TMCue('hidden');
tm.cue[7].goCue = function() {
  revCym.start();
}

// *******************************************************************
// CUE 8: pulsing cello pizzicati
var pzFsharp2 = new Tone.Player("jack-assets/audio/vc-pz-Fsharp2.mp3").toMaster();
var pzFsharp3 = new Tone.Player("jack-assets/audio/vc-pz-Fsharp3.mp3").toMaster();
var pzFsharp4 = new Tone.Player("jack-assets/audio/vc-pz-Fsharp4.mp3").toMaster();
var pzFsharp5 = new Tone.Player("jack-assets/audio/vc-pz-Fsharp5.mp3").toMaster();
var pzG2 = new Tone.Player("jack-assets/audio/vc-pz-G2.mp3").toMaster();
var pzD4 = new Tone.Player("jack-assets/audio/vc-pz-D4.mp3").toMaster();
var pzG4 = new Tone.Player("jack-assets/audio/vc-pz-G4.mp3").toMaster();
var pzB4 = new Tone.Player("jack-assets/audio/vc-pz-B4.mp3").toMaster();
// clave is triggered at end of cue
var clave = new Tone.Player("jack-assets/audio/clave.mp3").toMaster();
var pizzLoop = new Tone.Loop(function(time) {
  if (tm.accel.y < 0.5) {
    if (tm.accel.x < 0.25) {
      pzG2.start();
    } else if (tm.accel.x < 0.5) {
      pzD4.start();
    } else if (tm.accel.x < 0.75) {
      pzG4.start();
    } else {
      pzB4.start();
    }
  } else {
    if (tm.accel.x < 0.25) {
      pzFsharp2.start();
    } else if (tm.accel.x < 0.5) {
      pzFsharp3.start();
    } else if (tm.accel.x < 0.75) {
      pzFsharp4.start();
    } else {
      pzFsharp5.start();
    }
  }
}, "8t");
// no limit on open window could mean late arrivals are not synchronized to triplet pulse
tm.cue[8] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[8].goCue = function() {
  pizzLoop.start();
};
tm.cue[8].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[8].stopCue = function() {
  pizzLoop.stop();
  // clave sound punctuates section
  // won't be synchronized across devices, but will result in splatter
  clave.start();
};

// *******************************************************************
// CUE 9: Continues cello pizz with added synth
var triSynthRound1 = new Tone.Synth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 0.06,
    decay: 0.04,
    sustain: 0.3,
    release: 0.05
  }
}).toMaster()
var triSynthRound2 = new Tone.Synth({
  oscillator: {
    type: 'triangle5'
  },
  envelope: {
    attack: 0.06,
    decay: 0.04,
    sustain: 0.3,
    release: 0.05
  }
}).toMaster()
var pizzLoop2 = new Tone.Loop(function(time) {
  if (tm.accel.y < 0.5) {
    if (tm.accel.x < 0.2) {
      pzG2.start();
    } else if (tm.accel.x < 0.4) {
      pzD4.start();
    } else if (tm.accel.x < 0.6) {
      pzG4.start();
    } else if (tm.accel.x < 0.8) {
      pzB4.start();
    } else {
      triSynthRound1.triggerAttackRelease('G5', '16t');
      triSynthRound2.triggerAttackRelease('B5', '16t', '+16t');
    }
  } else {
    if (tm.accel.x < 0.2) {
      pzFsharp2.start();
    } else if (tm.accel.x < 0.4) {
      pzFsharp3.start();
    } else if (tm.accel.x < 0.6) {
      pzFsharp4.start();
    } else if (tm.accel.x < 0.8) {
      pzFsharp5.start();
    } else {
      triSynthRound1.triggerAttackRelease('F#5', '16t');
      triSynthRound2.triggerAttackRelease('F#6', '16t', '+16t');
    }
  }
}, "8t");

// no limit on open window could mean late arrivals are not synchronized to triplet pulse
var triangle = new Tone.Player("jack-assets/audio/triangle.mp3").toMaster();
tm.cue[9] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[9].goCue = function() {
  triangle.start();
  pizzLoop2.start('+4n');
};
tm.cue[9].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[9].stopCue = function() {
  pizzLoop2.stop();
};

// *******************************************************************
// CUE 10: hidden cue with non-interactive reversed cymbal
tm.cue[10] = new TMCue('hidden');
tm.cue[10].goCue = function() {
  revCym.start();
}

// *******************************************************************
// CUE 11: Arpeggiated synths in 4-bar chord progression
var sawSynthRev1 = new Tone.Synth({
  oscillator: {
    type: 'sawtooth64'
  },
  envelope: {
    attack: 0.06,
    decay: 0.01,
    sustain: 0.1,
    release: 0.001
  }
}).toMaster()
var sawSynthRev2 = new Tone.Synth({
  oscillator: {
    type: 'sawtooth8'
  },
  envelope: {
    attack: 0.06,
    decay: 0.01,
    sustain: 0.1,
    release: 0.001
  }
}).toMaster()
var chordArray = [
  ['E3', 'B3', 'E4', 'G4', 'B4', 'G5', 'E6'],
  ['E3', 'C4', 'E4', 'G4', 'C5', 'G5', 'E6'],
  ['D3', 'B3', 'D4', 'G4', 'D5', 'G5', 'D6'],
  ['D3', 'A3', 'D4', 'A4', 'D5', 'A5', 'D6']
];

// breakpoint arrays for changing values in cue 12
var detuneArrCue12 = [22000, 100]; // up half step by end of section
var volumeArrCue12 = [22000, -6, 26000, -99]; // gradual fade
var synthChordLoop = new Tone.Loop(function(time) {
  var elapsedTime = Date.now() - tm.clientServerOffset - tm.currentCueStartedAt;

  // Pitches bend up half step and volume fades out only during cue 12
  if (tm.currentCue === tm.cue[12]) {
    var detune = tm.getSectionBreakpoints(detuneArrCue12);
    var fadeout = tm.getSectionBreakpoints(volumeArrCue12);
    triSynthRound1.detune.value = detune;
    triSynthRound2.detune.value = detune;
    sawSynthRev1.detune.value = detune;
    sawSynthRev2.detune.value = detune;
    triSynthRound1.volume.value = fadeout;
    triSynthRound2.volume.value = fadeout;
    sawSynthRev1.volume.value = fadeout;
    sawSynthRev2.volume.value = fadeout;
  }

  // 12632 ms = 4 measures. 3158 ms = 1 measure.
  // counts 4-bar loop (thisLoop is guaranteed to be 0 - 3)
  var chord = Math.floor((elapsedTime % 12632) / 3158);
  var pitch = Math.floor(tm.accel.x * 4);
  if (tm.accel.y < 0.5) {
    triSynthRound1.triggerAttackRelease(chordArray[chord][pitch], '16n');
    triSynthRound2.triggerAttackRelease(chordArray[chord][pitch+2], '16n', '+16n');
  } else {
    sawSynthRev1.triggerAttackRelease(chordArray[chord][pitch], '32n');
    sawSynthRev2.triggerAttackRelease(chordArray[chord][pitch+2], '32n', '+16n');
  }
}, '8n');
tm.cue[11] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[11].goCue = function() {
  synthChordLoop.start();
  triSynthRound1.detune.value = 0;
  triSynthRound2.detune.value = 0;
  sawSynthRev1.detune.value = 0;
  sawSynthRev2.detune.value = 0;
  triSynthRound1.volume.value = 0;
  triSynthRound2.volume.value = 0;
  sawSynthRev1.volume.value = 0;
  sawSynthRev2.volume.value = 0;
};
tm.cue[11].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[11].stopCue = function() {
  synthChordLoop.stop();
  clave.start(); // punctuates end of section
};

// *******************************************************************
// CUE 12: continuation of arpeggios, now with pitch bend and dimin.
tm.cue[12] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[12].goCue = function() {
  triangle.start();
  synthChordLoop.start();
};
tm.cue[12].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[12].stopCue = function() {
  synthChordLoop.stop();
};

// *******************************************************************
// CUE 13: tacet
tm.cue[13] = new TMCue('tacet', -1);
tm.cue[13].goCue = function() {
  // no sound here
}

// *******************************************************************
// CUE 14: high active synths converging on Bb / D
var revChime = new Tone.Player("jack-assets/audio/revChime.mp3").toMaster();
var durationOfCue14 = 19000; // about 2 bars from end of section
var loopCue14 = new Tone.Loop(function(time) {
  var elapsedTime = Date.now() - tm.clientServerOffset - tm.currentCueStartedAt;

  // clamp counter at 1.0 (in case section takes longer than expected)
  var sectionCounter = (elapsedTime / durationOfCue14 <= 1) ? elapsedTime / durationOfCue14 : 1;

  // synths start with random detuning and converge on Bb/D
  detuneVal = Math.random();
  triSynthRound1.detune.value = (detuneVal*400) * (1-sectionCounter);
  triSynthRound2.detune.value = -(detuneVal*400) * (1-sectionCounter);
  sawSynthRev1.detune.value = (detuneVal*400) * (1-sectionCounter);
  sawSynthRev2.detune.value = -(detuneVal*400) * (1-sectionCounter);

  if (tm.accel.y < 0.5 && tm.accel.x < 0.5) { // up and left quadrant
    triSynthRound1.triggerAttackRelease('Bb5', '16t');
    triSynthRound2.triggerAttackRelease('D6', '16t', '+32n');
  } else if (tm.accel.y < 0.5) { // up and right quadrant
    triSynthRound1.triggerAttackRelease('Bb6', '16t');
    triSynthRound2.triggerAttackRelease('D7', '16t', '+32n');
  } else if (tm.accel.x < 0.5) { // upside down and tipped left
    sawSynthRev1.triggerAttackRelease('Bb5', '32t');
    sawSynthRev2.triggerAttackRelease('D6', '32t', '+32n');
  } else { // upside down and tipped right
    sawSynthRev1.triggerAttackRelease('Bb6', '32t');
    sawSynthRev2.triggerAttackRelease('D7', '32t', '+32n');
  }
}, '16n');
tm.cue[14] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[14].goCue = function() {
  // reset synths that were previously faded out
  triSynthRound1.detune.value = 0;
  triSynthRound2.detune.value = 0;
  sawSynthRev1.detune.value = 0;
  sawSynthRev2.detune.value = 0;
  triSynthRound1.volume.value = 0;
  triSynthRound2.volume.value = 0;
  sawSynthRev1.volume.value = 0;
  sawSynthRev2.volume.value = 0;
  clave.start();
  loopCue14.start();
};
tm.cue[14].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[14].stopCue = function() {
  revChime.start();
  loopCue14.stop();
};

// *******************************************************************
// CUE 15: Warping shake chimes
var kick = new Tone.Player("jack-assets/audio/kick.mp3").toMaster();
var vibeA3 = new Tone.Player("jack-assets/audio/vibe-A3.mp3").toMaster();
var vibeA4 = new Tone.Player("jack-assets/audio/vibe-A4.mp3").toMaster();
var vibeCsharp6 = new Tone.Player("jack-assets/audio/vibe-Csharp6.mp3").toMaster();
var vibeCsharp7 = new Tone.Player("jack-assets/audio/vibe-Csharp7.mp3").toMaster();
var vibesArrayCue15 = [vibeA3, vibeA4, vibeCsharp6, vibeCsharp7];
// array for pitch bending intervals of vibes
// must be same length as vibesArray. refactor with error checking
// up 1 half step to Bb OR down to justly tuned 7th partial
var vibesBendArrayCue15 = [-0.05946, -0.05946, 0.2642, 0.2642];

tm.cue[15] = new TMCue('shake', 1579, NO_LIMIT); // 4 beats @ 152bpm
tm.cue[15].goCue = function() {
  // kick sound has cello jete tail and random playback speed
  // result is cluster of pitches
  kick.playbackRate = 1 + Math.random();
  kick.start();
  // flourish of vibes on downbeat
  var thisVibe = vibesArrayCue15[Math.floor(Math.random()*vibesArrayCue15.length)];
  thisVibe.start('+16n');
  var thisVibe = vibesArrayCue15[Math.floor(Math.random()*vibesArrayCue15.length)];
  thisVibe.start('+8n');
  var thisVibe = vibesArrayCue15[Math.floor(Math.random()*vibesArrayCue15.length)];
  thisVibe.start('+4n');
};
tm.cue[15].triggerShakeSound = function() {
  // testing how to change sounds throughout section
  // DOLATER: refactor this to new getSectionBreakpoints() function
  var elapsedTime = Date.now() - tm.clientServerOffset - tm.currentCueStartedAt;
  var durationOfSection = 38000; // about 4 bars before end of section
  // clamp counter at 1.0 (in case section takes longer than expected)
  var sectionCounter = (elapsedTime / durationOfSection <= 1) ? elapsedTime / durationOfSection : 1;

  var randomVibe = Math.floor(Math.random() * vibesArrayCue15.length);
  vibesArrayCue15[randomVibe].playbackRate = 1 - (vibesBendArrayCue15[randomVibe] * sectionCounter);
  vibesArrayCue15[randomVibe].start();
};

// *******************************************************************
// CUE 16: hidden cue with non-interactive reversed cymbal
// duration of revCym is 4467 ms.
tm.cue[16] = new TMCue('hidden');
tm.cue[16].goCue = function() {
  revCym.start();
};

// *******************************************************************
// CUE 17: jete sounds on cello in response to shake
var vcJete1 = new Tone.Player("jack-assets/audio/vc-jete-1.mp3").toMaster();
var vcJete2 = new Tone.Player("jack-assets/audio/vc-jete-2.mp3").toMaster();
var vcJeteTrem1 = new Tone.Player("jack-assets/audio/vc-jete-trem-1.mp3").toMaster();
var vcJeteTrem2 = new Tone.Player("jack-assets/audio/vc-jete-trem-2.mp3").toMaster();
var vcClb1 = new Tone.Player("jack-assets/audio/vc-clb-1.mp3").toMaster();
var vcClb2 = new Tone.Player("jack-assets/audio/vc-clb-2.mp3").toMaster();
var vcClbGliss1 = new Tone.Player("jack-assets/audio/vc-clb-gliss-1.mp3").toMaster();
var vcClbGliss2 = new Tone.Player("jack-assets/audio/vc-clb-gliss-2.mp3").toMaster();
var vcJeteArray = [vcClb1, vcJete2, vcJeteTrem1, vcClb2, vcClbGliss1, vcJeteTrem2, vcClbGliss2, vcJete1];
var vcJeteArrayIndex = 0;

tm.cue[17] = new TMCue('shake',  1579, NO_LIMIT);
tm.cue[17].goCue = function() {
  vcJete1.start();
};
tm.cue[17].triggerShakeSound = function() {
  thisVcSound = vcJeteArray[vcJeteArrayIndex % vcJeteArray.length];
  // gradually shift up a whole step by end of section
  thisVcSound.playbackRate = tm.getSectionBreakpoints([0, 1, 44000, 1.1225]);
  thisVcSound.start();
  // avoid overlapping file playback by cycling through them
  vcJeteArrayIndex++;
};
tm.cue[17].stopCue = function() {
  // probably nothing to do here
};

// *******************************************************************
// CUE 18: hidden cue with non-interactive reversed cymbal
// duration of revCym is 4467 ms.
tm.cue[18] = new TMCue('hidden');
tm.cue[18].goCue = function() {
  revCym.start();
}

// *******************************************************************
// CUE 19: granulated sparkles
// TODO: create granulator file and add fadeout through section
var c1_granulatorGrainSize = 0.1; // WAS 0.125 determines how often .scrub() is called. actual grain size is longer
var c1_granulator = new Tone.GrainPlayer({
  "url": "demo-assets/audio/c1_grFileB.mp3",
  "overlap": 0.01,
  "grainSize": c1_granulatorGrainSize * 2,
  "loop": true,
  "detune": 0
}).toMaster();
var c1_granulatorOffset = 8.5; // subsequent scrub positions set interactively in updateSoundsInCue4() below
var c1_granulatorDur = 22;

tm.cue[19] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[19].goCue = function() {
  Tone.Transport.scheduleRepeat(function(time) {
    // GrainPlayer may not be ready for .scrub(). Catch InvalidStateError
    // Known issue - if try fails, the grain player still scrubs but detune is reset to 0
    try { c1_granulator.seek(c1_granulatorOffset); } catch(e) { console.log(e); }
  }, c1_granulatorGrainSize);
}
tm.cue[19].updateTiltSounds = function() {
  if (tm.accel.y < 0.33) {
    c1_granulator.volume.value = -60 + (60 * (tm.accel.y * 3));
  }
  else {
    c1_granulator.volume.value = 0;
  }
  // .seek() invoked by .scheduleRepeat()
  c1_granulatorOffset = tm.accel.x * c1_granulatorDur;
}
tm.cue[19].stopCue = function() {
  Tone.Transport.cancel(); // cancel granulator repeat
}

// *******************************************************************
// CUE 20: tacet
tm.cue[20] = new TMCue('tacet', -1);
tm.cue[20].goCue = function() {
  // no sound here
}

// *******************************************************************
// CUE 21: finished
// Could pad the ending with one 'tacet' cue and THEN 'finished' cue to prevent accidental triggering of end, which shuts app down.
tm.cue[21] = new TMCue('finished', -1);
tm.cue[21].goCue = function() {
  tm.publicLog('The piece is done.');
}

// *******************************************************************
// CUES 22-26: use for quartet to test pedal and cue counter
tm.cue[22] = new TMCue('waiting', -1);
tm.cue[22].goCue = function() {
  tm.publicLog('Test cue 22 was triggered.');
};
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
