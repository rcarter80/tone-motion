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
  // testTone.triggerAttack(440);
}
tm.cue[1].updateTiltSounds = function() {
  // interactivity handled through tm.xTilt and yTilt signals
}
tm.cue[1].stopCue = function() {
  // testTone.triggerRelease();
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
  // cowbell.start();
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

var concertRecording = new Tone.Player('tonemotion-shared/audio/misc/Direct Attention in concert copy.mp3').toMaster();

tm.cue[5] = new TMCue('tacet', 2000);
tm.cue[5].goCue = function() {
  concertRecording.start();
};

// *******************************************************************
// CUE 6: Warping shake chimes
var vibeE4 = new Tone.Player(vibes_sounds + "vibe-E4.mp3").toMaster();
var vibeD5 = new Tone.Player(vibes_sounds + "vibe-D5.mp3").toMaster();
var vibeB5 = new Tone.Player(vibes_sounds + "vibe-B5.mp3").toMaster();
var vibeGsharp6 = new Tone.Player(vibes_sounds + "vibe-Gsharp6.mp3").toMaster();
// DOLATER: could fine tune playbackRate to get just intonation
var vibesArray = [vibeE4, vibeD5, vibeB5, vibeGsharp6];
// array for pitch bending intervals of vibes
// must be same length as vibesArray. refactor with error checking
// down 2 half steps, 3 half steps, 4 half steps, 3 half steps
var vibesBendArray = [0.109, 0.159, 0.206, 0.159];

tm.cue[6] = new TMCue('shake', 1579, NO_LIMIT); // 4 beats @ 152bpm
tm.cue[6].goCue = function() {

};
tm.cue[6].triggerShakeSound = function() {

};

// *******************************************************************
// CUE 7: hidden cue with non-interactive reversed cymbal
// duration of revCym is 4467 ms.
var revCym = new Tone.Player(perc_sounds + "revCym.mp3").toMaster();
tm.cue[7] = new TMCue('hidden');
tm.cue[7].goCue = function() {

}

// *******************************************************************
// CUE 8: pulsing cello pizzicati
var pzFsharp2 = new Tone.Player(cello_sounds + "vc-pz-Fsharp2.mp3").toMaster();
var pzFsharp3 = new Tone.Player(cello_sounds + "vc-pz-Fsharp3.mp3").toMaster();
var pzFsharp4 = new Tone.Player(cello_sounds + "vc-pz-Fsharp4.mp3").toMaster();
var pzFsharp5 = new Tone.Player(cello_sounds + "vc-pz-Fsharp5.mp3").toMaster();
var pzG2 = new Tone.Player(cello_sounds + "vc-pz-G2.mp3").toMaster();
var pzD4 = new Tone.Player(cello_sounds + "vc-pz-D4.mp3").toMaster();
var pzG4 = new Tone.Player(cello_sounds + "vc-pz-G4.mp3").toMaster();
var pzB4 = new Tone.Player(cello_sounds + "vc-pz-B4.mp3").toMaster();
// clave is triggered at end of cue
var clave = new Tone.Player(perc_sounds + "clave.mp3").toMaster();
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

};
tm.cue[8].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[8].stopCue = function() {

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
var triangle = new Tone.Player(perc_sounds + "triangle.mp3").toMaster();
tm.cue[9] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[9].goCue = function() {

};
tm.cue[9].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[9].stopCue = function() {

};

// *******************************************************************
// CUE 10: hidden cue with non-interactive reversed cymbal
tm.cue[10] = new TMCue('hidden');
tm.cue[10].goCue = function() {

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
  var elapsedTime = Date.now() - tm.clientServerOffset - tm.cue[11].startedAt;

  // Pitches bend up half step and volume fades out only during cue 12
  if (tm.currentCue === tm.cue[12]) {
    var detune = tm.getSectionBreakpoints(12, detuneArrCue12);
    var fadeout = tm.getSectionBreakpoints(12, volumeArrCue12);
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

};
tm.cue[11].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[11].stopCue = function() {

};

// *******************************************************************
// CUE 12: continuation of arpeggios, now with pitch bend and dimin.
tm.cue[12] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[12].goCue = function() {

};
tm.cue[12].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[12].stopCue = function() {

};

// *******************************************************************
// CUE 13: tacet
tm.cue[13] = new TMCue('tacet', -1);
tm.cue[13].goCue = function() {
  // no sound here
}

// *******************************************************************
// CUE 14: high active synths converging on Bb / D
var revChime = new Tone.Player(chimes_sounds + "revChime.mp3").toMaster();
var durationOfCue14 = 19000; // about 2 bars from end of section
var loopCue14 = new Tone.Loop(function(time) {
  var elapsedTime = Date.now() - tm.clientServerOffset - tm.cue[14].startedAt;

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

};
tm.cue[14].updateTiltSounds = function() {
  // all tilt interactivity handled in goCue() function
  // nothing to do here but override method
};
tm.cue[14].stopCue = function() {

};

// *******************************************************************
// CUE 15: Warping shake chimes
var kick = new Tone.Player(perc_sounds + "kick.mp3").toMaster();
var vibeA3 = new Tone.Player(vibes_sounds + "vibe-A3.mp3").toMaster();
var vibeA4 = new Tone.Player(vibes_sounds + "vibe-A4.mp3").toMaster();
var vibeCsharp6 = new Tone.Player(vibes_sounds + "vibe-Csharp6.mp3").toMaster();
var vibeCsharp7 = new Tone.Player(vibes_sounds + "vibe-Csharp7.mp3").toMaster();
var vibesArrayCue15 = [vibeA3, vibeA4, vibeCsharp6, vibeCsharp7];
// array for pitch bending intervals of vibes
// must be same length as vibesArray. refactor with error checking
// up 1 half step to Bb OR down to justly tuned 7th partial
var vibesBendArrayCue15 = [-0.05946, -0.05946, 0.2642, 0.2642];

tm.cue[15] = new TMCue('shake', 1579, NO_LIMIT); // 4 beats @ 152bpm
tm.cue[15].goCue = function() {

};
tm.cue[15].triggerShakeSound = function() {

};

// *******************************************************************
// CUE 16: hidden cue with non-interactive reversed cymbal
// duration of revCym is 4467 ms.
tm.cue[16] = new TMCue('hidden');
tm.cue[16].goCue = function() {

};

// *******************************************************************
// CUE 17: jete sounds on cello in response to shake
var vcJete1 = new Tone.Player(cello_sounds + "vc-jete-1.mp3").toMaster();
var vcJete2 = new Tone.Player(cello_sounds + "vc-jete-2.mp3").toMaster();
var vcJeteTrem1 = new Tone.Player(cello_sounds + "vc-jete-trem-1.mp3").toMaster();
var vcJeteTrem2 = new Tone.Player(cello_sounds + "vc-jete-trem-2.mp3").toMaster();
var vcClb1 = new Tone.Player(cello_sounds + "vc-clb-1.mp3").toMaster();
var vcClb2 = new Tone.Player(cello_sounds + "vc-clb-2.mp3").toMaster();
var vcClbGliss1 = new Tone.Player(cello_sounds + "vc-clb-gliss-1.mp3").toMaster();
var vcClbGliss2 = new Tone.Player(cello_sounds + "vc-clb-gliss-2.mp3").toMaster();
var vcJeteArray = [vcClb1, vcJete2, vcJeteTrem1, vcClb2, vcClbGliss1, vcJeteTrem2, vcClbGliss2, vcJete1];
var vcJeteArrayIndex = 0;

tm.cue[17] = new TMCue('shake',  1579, NO_LIMIT);
tm.cue[17].goCue = function() {

};
tm.cue[17].triggerShakeSound = function() {

};
tm.cue[17].stopCue = function() {
  // probably nothing to do here
};

// *******************************************************************
// CUE 18: hidden cue with non-interactive reversed cymbal
// duration of revCym is 4467 ms.
tm.cue[18] = new TMCue('hidden');
tm.cue[18].goCue = function() {

}

// *******************************************************************
// CUE 19: granulated sparkles (section is c. 1'40")
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

tm.cue[19] = new TMCue('tilt', 1579, NO_LIMIT);
tm.cue[19].goCue = function() {

}
tm.cue[19].updateTiltSounds = function() {

}
tm.cue[19].stopCue = function() {

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
