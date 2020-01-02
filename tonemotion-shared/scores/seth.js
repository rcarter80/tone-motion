const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/seth-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/seth-server/current-cue');
  }
};

// Shortcuts to audio file paths
// TODO: delete unused paths
const cello_sounds = 'tonemotion-shared/audio/cello/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const glass_sounds = 'tonemotion-shared/audio/glass/';
const piano_sounds = 'tonemotion-shared/audio/piano/';
const glock_sounds = 'tonemotion-shared/audio/glockenspiel/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';

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
tm.cue[4].stopCue = function() {
  // nothing to clean up
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
// CUE 6: [A1] Shaking bells through predefined pitch array (with looped tail)
var glFsharp3 = new Tone.Player(glock_sounds + "glockFsharp3.mp3").toMaster();
// load same audio file into second buffer to allow retrigger without artifact
var glFsharp3b = new Tone.Player(glock_sounds + "glockFsharp3.mp3").toMaster();
var glG3 = new Tone.Player(glock_sounds + "glockG3.mp3").toMaster();
var glG3b = new Tone.Player(glock_sounds + "glockG3.mp3").toMaster();
var glA3 = new Tone.Player(glock_sounds + "glockA3.mp3").toMaster();
var glA3b = new Tone.Player(glock_sounds + "glockA3.mp3").toMaster();
var glB3 = new Tone.Player(glock_sounds + "glockB3.mp3").toMaster();
var glB3b = new Tone.Player(glock_sounds + "glockB3.mp3").toMaster();
var glCsharp4 = new Tone.Player(glock_sounds + "glockCsharp4.mp3").toMaster();
var glCsharp4b = new Tone.Player(glock_sounds + "glockCsharp4.mp3").toMaster();
var glD4 = new Tone.Player(glock_sounds + "glockD4.mp3").toMaster();
var glD4b = new Tone.Player(glock_sounds + "glockD4.mp3").toMaster();
var glFsharp4 = new Tone.Player(glock_sounds + "glockFsharp4.mp3").toMaster();
var glFsharp4b = new Tone.Player(glock_sounds + "glockFsharp4.mp3").toMaster();
var glG4 = new Tone.Player(glock_sounds + "glockG4.mp3").toMaster();
var glG4b = new Tone.Player(glock_sounds + "glockG4.mp3").toMaster();
var glA4 = new Tone.Player(glock_sounds + "glockA4.mp3").toMaster();
var glA4b = new Tone.Player(glock_sounds + "glockA4.mp3").toMaster();
var glB4 = new Tone.Player(glock_sounds + "glockB4.mp3").toMaster();
var glB4b = new Tone.Player(glock_sounds + "glockB4.mp3").toMaster();
var glCsharp5 = new Tone.Player(glock_sounds + "glockCsharp5.mp3").toMaster();
var glCsharp5b = new Tone.Player(glock_sounds + "glockCsharp5.mp3").toMaster();
var glD5 = new Tone.Player(glock_sounds + "glockD5.mp3").toMaster();
var glD5b = new Tone.Player(glock_sounds + "glockD5.mp3").toMaster();
var glA5 = new Tone.Player(glock_sounds + "glockA5.mp3").toMaster();
var glA5b = new Tone.Player(glock_sounds + "glockA5.mp3").toMaster();
var chA6lo = new Tone.Player(chime_sounds + "chime-1748Hz-A6.mp3").toMaster();
var chA6hi = new Tone.Player(chime_sounds + "chime-1772Hz-A6.mp3").toMaster();


var counterCue6 = 0;
// initial array of pitches triggered
var pitchArrayCue6 = [glG3, glG4, glB3, glB4, glG3b, glG4b, glB3b, glB4b, glFsharp3, glFsharp4, glFsharp3b, glFsharp4b, glCsharp4, glCsharp5, glCsharp4b, glCsharp5b, glD4, glD5, glD4b, glD5b, glCsharp4, glCsharp5, glCsharp4b, glCsharp5b, glB3, glB4, glB3b, glB4b];
// loop of As triggered after loop is over
var pitchLoopCue6 = [glA3, glA4, chA6lo, glA4b, glA3b, glA4, chA6hi, glA4b];
var thisGlockenspiel;

// TODO: decide on timing of trigger and check math (2 beats is 1875 ms?)
tm.cue[6] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[6].goCue = function() {
  // reset counter
  counterCue6 = 0;
};
// TODO: decide whether to fade out shake sounds in second half of section. maybe fade to softer but NOT silence (in part because silent sounds make it seem cue isn't working if it was triggered too long ago)
tm.cue[6].triggerShakeSound = function() {
  if (counterCue6 < pitchArrayCue6.length) {
    thisGlockenspiel = pitchArrayCue6[counterCue6];
  } else {
    // repeats same three pitches until end of section
    thisGlockenspiel = pitchLoopCue6[counterCue6 % pitchLoopCue6.length];
  }
  // pitches bend up quarter tone in section half of section
  thisGlockenspiel.playbackRate = tm.getSectionBreakpoints(6, [0,1, 30000,1, 60000,1.0293]);
  thisGlockenspiel.start();
  counterCue6++;
};
tm.cue[6].stopCue = function() {
  // nothing to clean up UNLESS I use a reversed chime at end of cue
};

// *******************************************************************
// CUE 7: [B1 first 5 mm.] short TACET section, just listening to cello

tm.cue[7] = new TMCue('tacet', -1);
tm.cue[7].goCue = function() {
  // no sound here
};
tm.cue[7].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 8: [B1] quasi-granulated sparkles
var pingPongLoop = new Tone.Player(granulated_sounds + 'pingPongLoop.mp3').toMaster();
pingPongLoop.loop = true;

var popRocksLoop = new Tone.Player(granulated_sounds + 'popRocksLoop.mp3').toMaster();
popRocksLoop.loop = true;

tm.cue[8] = new TMCue('tilt', 1875, NO_LIMIT); // 2 beats @ 64bpm
// REVISION: could add third sound
tm.cue[8].goCue = function() {
  // sound files triggered below. nothing to do here
};
tm.cue[8].updateTiltSounds = function() {
  // playback rate can range from quarter speed to four times speed
  pingPongLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  popRocksLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.5) {
    // ping pong audible when device tilted to right
    if (pingPongLoop.state === 'stopped') {
      pingPongLoop.start();
      popRocksLoop.stop();
    }
  } else {
    if (popRocksLoop.state === 'stopped') {
      popRocksLoop.start();
      pingPongLoop.stop();
    }
  }
  pingPongLoop.volume.value = tm.getSectionBreakpoints(8, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
  popRocksLoop.volume.value = tm.getSectionBreakpoints(8, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
};
tm.cue[8].stopCue = function() {
  pingPongLoop.stop();
  popRocksLoop.stop();
};

// *******************************************************************
// CUE 9: [A2] Shaking glasses through predefined pitch array (with looped tail)
tm.cue[9] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[9].goCue = function() {
};
tm.cue[9].triggerShakeSound = function() {

};
tm.cue[9].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 10: Synths cycling through pitch cells (pitch: x-axis, articulation: y)
var counterCue10 = 0;

var brightLeadSynth = new Tone.DuoSynth({
  vibratoAmount: 0.15,
  vibratoRate: 8,
  harmonicity: 1.5,
  portamento: 0.02,
  voice0: {
    volume: 0,
    oscillator: {
      type: 'square13'
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0,
      sustain: 1,
      release: 0.5
    },
    envelope: {
      attack: 0.03,
      decay: 0,
      sustain: 1,
      release: 0.05
    }
  },
  voice1: {
    volume: -15,
    oscillator: {
      type: 'triangle5'
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0,
      sustain: 1,
      release: 0.5
    },
    envelope: {
      attack: 0.03,
      decay: 0,
      sustain: 1,
      release: 0.05
    }
  }
}).toMaster();

var synthSaw16 = new Tone.Synth({
  oscillator: {
    type: 'sawtooth16'
  },
  envelope: {
    attack: 0.05,
    decay: 0.02,
    sustain: 0.8,
    release: 0.1
  }
}).toMaster();

var synthTriangle17 = new Tone.Synth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 0.01,
    decay: 0.01,
    sustain: 0.5,
    release: 0.15
  }
}).toMaster();

var pitchArrayCue10 = [['B2','B3','B4','D5','B5','D6','B6','D7'], ['B2','B3','B4','C#5','D5','B5','C#6','D6','B6','C#7','D7'], ['B2','B3','B4','C#5','D5','E5','B5','C#6','D6','E6','B6','C#7','D7','E7'], ['A2','A3','A4','C#5','D5','E5','A5','C#6','D6','E6','A6','C#7','D7','E7'], ['B2','B3','B4','D5','B5','D6','B6','D7'], ['B2','B3','B4','F#5','B5','F#6','B6','F#7'], ['A2','A3','A4','C#5','D5','F#5','A5','C#6','D6','F#6','A6','C#7','D7','F#7'], ['A2','A3','A4','C#5','D5','E5','A5','C#6','D6','E6','A6','C#7','D7','E7']];
var thisPitchCell, thisPitch;

var synthLoopCue10 = new Tone.Loop(function(time) {
  // stays on each pitch cell for 1 bar (24 sixteeth notes)
  thisPitchCell = pitchArrayCue10[Math.floor(counterCue10 / 24) % pitchArrayCue10.length];

  if (tm.accel.y > 0.5) {
    // continuous synth with interactive pitch on x-axis
    if (brightLeadSynth.volume.value == -99) {
      brightLeadSynth.volume.rampTo(-6, 0.05);
    }
    // clamp tm.accel.x to 0.99 to prevent reading past bounds of pitch array
    thisPitch = thisPitchCell[Math.floor((tm.accel.x * 0.99) * (thisPitchCell.length))];
    if (brightLeadSynth.frequency.value != thisPitch) {
      brightLeadSynth.setNote(thisPitch);
    }
  } else {
    // mute continuous synth if not already muted
    if (brightLeadSynth.volume.value > -99) {
      brightLeadSynth.volume.rampTo(-99, 0.05);
    }
    // prevent using last note in array because that will be triggered next
    thisPitch = Math.floor((tm.accel.x * 0.99) * (thisPitchCell.length - 1));
    // alternate adjacent pitches of cell to prevent excessive repetition
    // use two synths to allow overlapping sound
    counterCue10 % 2 ? synthSaw16.triggerAttackRelease(thisPitchCell[thisPitch], '16n') : synthTriangle17.triggerAttackRelease(thisPitchCell[thisPitch + 1], '16n');
  }
  counterCue10++;
}, '16n');
// stop loop after 15 measures and 4 beats (leaving 2 beats for fill in cue 11)
synthLoopCue10.iterations = 376;

// open window of just one extra beat to keep things pretty closely aligned
tm.cue[10] = new TMCue('tilt', 2143, 714);
tm.cue[10].goCue = function() {
  // new tempo for this sections
  Tone.Transport.bpm.value = 84;
  counterCue10 = 0;
  // unmute other synths because those are only triggered in response to action
  synthSaw16.volume.value = 0;
  synthTriangle17.volume.value = 0;
  // trigger continuous synth that holds through section, but mute by default
  brightLeadSynth.volume.value = -99;
  brightLeadSynth.triggerAttack('B4');
  synthLoopCue10.start();
}
tm.cue[10].updateTiltSounds = function() {
  // all tilt interactivity handled in loop
  // nothing to do here but override method
};
tm.cue[10].stopCue = function() {
  // fade out sounds and then stop
  brightLeadSynth.volume.rampTo(-99, '1m');
  brightLeadSynth.triggerRelease('+1m');
  synthLoopCue10.stop('+1m');
}

// *******************************************************************
// CUE 11: non-interactive synth fill (just last 2 beats of section)
// must arrive on time for perfect synchrony, but sparse texture allows holes
tm.cue[11] = new TMCue('listen', 2857, 0);

var synthSquare13 = new Tone.Synth({
  oscillator: {
    type: 'square13'
  },
  envelope: {
    attack: 0.02,
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
      synthSquare13.triggerAttackRelease(pitchArrayCue11[counterCue11], '16t');
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
  thisVcSound.playbackRate = tm.getSectionBreakpoints(12, [0,1.26, 4286,1.26, 30000,2.119]);

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
  thisGlassSound.playbackRate = tm.getSectionBreakpoints(13, [0,1, 4286,1, 30000,1.682]);
  thisGlassSound.start();
  counterCue13++;
};
tm.cue[13].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 14: quasi-granulated sparkles
var pingPongLoop = new Tone.Player(granulated_sounds + 'pingPongLoop.mp3').toMaster();
pingPongLoop.loop = true;

var popRocksLoop = new Tone.Player(granulated_sounds + 'popRocksLoop.mp3').toMaster();
popRocksLoop.loop = true;

tm.cue[14] = new TMCue('tilt', 1875, NO_LIMIT); // 3 beats @ 96bpm
// REVISION: could add third sound
tm.cue[14].goCue = function() {
  // sound files triggered below. nothing to do here
};
tm.cue[14].updateTiltSounds = function() {
  // playback rate can range from quarter speed to four times speed
  pingPongLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  popRocksLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.5) {
    // ping pong audible when device tilted to right
    if (pingPongLoop.state === 'stopped') {
      pingPongLoop.start();
      popRocksLoop.stop();
    }
  } else {
    if (popRocksLoop.state === 'stopped') {
      popRocksLoop.start();
      pingPongLoop.stop();
    }
  }
  pingPongLoop.volume.value = tm.getSectionBreakpoints(14, [0,0, 10000,0, 15000,-3, 25000,-12, 30000,-99]);
  popRocksLoop.volume.value = tm.getSectionBreakpoints(14, [0,0, 10000,0, 15000,-3, 25000,-12, 30000,-99]);
};
tm.cue[14].stopCue = function() {
  // should be faded out by now, but cancel in 2 seconds just in case
  pingPongLoop.stop('+2');
  popRocksLoop.stop('+2');
};

// *******************************************************************
// CUE 15: shaken piano notes starting on G4/G5 and switching to D5/D6
var pianoG4 = new Tone.Player(piano_sounds + "pianoG4.mp3").toMaster();
var pianoG5 = new Tone.Player(piano_sounds + "pianoG5.mp3").toMaster();
var pianoD5 = new Tone.Player(piano_sounds + "pianoD5.mp3").toMaster();
var pianoD6 = new Tone.Player(piano_sounds + "pianoD6.mp3").toMaster();

var counterCue15 = 0;

tm.cue[15] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[15].goCue = function() {
  counterCue15 = 0;
};
tm.cue[15].triggerShakeSound = function() {
  if (counterCue15 > 7) {
    (counterCue15 % 2) ? pianoD6.start() : pianoD5.start();
  } else {
    (counterCue15 % 2) ? pianoG5.start() : pianoG4.start();
  }
  counterCue15++;
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
var pianoLoopA = new Tone.Player(piano_sounds + "pianoLoop.mp3").toMaster();

tm.cue[17] = new TMCue('tilt', 2500, 0);
tm.cue[17].goCue = function() {
  pianoLoopA.volume.value = 0;
  pianoLoopA.start();
};
tm.cue[17].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up (up to 1.2 times)
    pianoLoopA.playbackRate = 1 + (tm.accel.y - 0.6) * 0.5;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoopA.playbackRate = 1 - (0.4 - tm.accel.y) * 0.25;
  } else {
    pianoLoopA.playbackRate = 1;
  }
}
tm.cue[17].stopCue = function() {
  // gradual fade out before stopping this iteration (in case listener plays very slowly)
  pianoLoopA.volume.rampTo(-99, 8);
};

// *******************************************************************
// CUE 18: second iteration of piano loop. started over again to resync
var pianoLoopB = new Tone.Player(piano_sounds + "pianoLoop.mp3").toMaster();

tm.cue[18] = new TMCue('tilt', 2500, 0);
tm.cue[18].goCue = function() {
  // trigger same sound stored in different buffer to prevent artifacts
  pianoLoopB.volume.value = 0;
  pianoLoopB.start();
};
tm.cue[18].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up
    pianoLoopB.playbackRate = 1 + (tm.accel.y - 0.6) * 0.4;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoopB.playbackRate = 1 - (0.4 - tm.accel.y) * 0.2;
  } else {
    pianoLoopB.playbackRate = 1;
  }
}
tm.cue[18].stopCue = function() {
  pianoLoopB.volume.rampTo(-99, 8);
};

// *******************************************************************
// CUE 19: third iteration of piano loop. started over again to resync
var pianoLoopC = new Tone.Player(piano_sounds + "pianoLoop.mp3").toMaster();

tm.cue[19] = new TMCue('tilt', 2500, 0);
tm.cue[19].goCue = function() {
  // loop has been fading out, but stop in case it's still going
  pianoLoopC.stop();
  // reset volume before starting loop again
  pianoLoopC.volume.value = 0;
  pianoLoopC.start();
};
tm.cue[19].updateTiltSounds = function() {
  // put pitch bend here
  if (tm.accel.y > 0.6) {
    // if phone tips upside down past threshold, speed up (up to 1.2 times)
    pianoLoopC.playbackRate = 1 + (tm.accel.y - 0.6) * 0.2;
  } else if (tm.accel.y < 0.4) {
    // if phone tips rightside down past threshold, slow down
    // need to invert axis and scale for this range of tm.accel.y from 0.0-0.4
    pianoLoopC.playbackRate = 1 - (0.4 - tm.accel.y) * 0.1;
  } else {
    pianoLoopC.playbackRate = 1;
  }
}
tm.cue[19].stopCue = function() {
  // gradual fade out before stopping this iteration (in case listener plays very slowly)
  pianoLoopC.volume.rampTo(-99, 10);
};

// *******************************************************************
// CUE 20: shaken piano octave Es
var counterCue20 = 0;
var pianoE5 = new Tone.Player(piano_sounds + "pianoE5.mp3").toMaster();
var pianoE6 = new Tone.Player(piano_sounds + "pianoE6.mp3").toMaster();
var pianoE7 = new Tone.Player(piano_sounds + "pianoE7.mp3").toMaster();
var pianoArrayCue20 = [pianoE5, pianoE6, pianoE7];

tm.cue[20] = new TMCue('shake', 2500, 0);
tm.cue[20].goCue = function() {
  // reset counter
  counterCue20 = 0;
};
tm.cue[20].triggerShakeSound = function() {
  pianoArrayCue20[counterCue20 % pianoArrayCue20.length].start();
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
