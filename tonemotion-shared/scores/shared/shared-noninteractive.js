const tm = new ToneMotion();
tm.debug = false; // if true, skips clock sync and shows console

window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/shared-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/shared-server/current-cue');
  }
};

// Shortcuts to audio file paths
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const glass_sounds = 'tonemotion-shared/audio/glass/';
const misc_sounds = 'tonemotion-shared/audio/misc/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const bell_sounds = 'tonemotion-shared/audio/bells/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';

// *******************************************************************
// CUE 0: ONLY used in performance to keep everything silent until start
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  // nothing to do here
};
// trigger transition from cue 6 back to cue 1 ONLY if coming from cue 6, so this flag is only set to true at cue 6 goCue(), set to false after cue 1 goCue
let c0_transitionFlag = false;
tm.cue[0].cueTransition = function() {
  if (c0_transitionFlag) {
    // If cue 6 loops back to cue 1, this transition from cue 0 will be triggered, which will stop the cue 6 loops
    c6_loGlassLoop.stop();
    c6_midGlassLoop.stop();
    c6_hiGlassLoop.stop();
    revGlassC5_7s.volume.value = -9;
    revGlassC5_7s.playbackRate = 1.26; // major third, so E5
    revGlassC5_7s.start();
  }
}
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 1: First section of piece. Looped long tones and shake sounds
var glassRimD3 = new Tone.Player(glass_sounds + "glassRimLayeredD3.mp3").toDestination();
var glassRimE3 = new Tone.Player(glass_sounds + "glassRimLayeredE3.mp3").toDestination();
var glassRimG4 = new Tone.Player(glass_sounds + "glassRimLayeredG4.mp3").toDestination();
var glassRimC4 = new Tone.Player(glass_sounds + "glassRimRealC4-B3.mp3").toDestination();
var glassRimB4 = new Tone.Player(glass_sounds + "glassRimRealB4_10s.mp3").toDestination();
var glassSynthRimB4 = new Tone.Player(glass_sounds + "glassRimB4_triEnv.mp3").toDestination();

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
bellSampler.volume.value = -2;

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
vibeSampler.volume.value = -3;

// sampler using a single (lower) struck glass sound
const glassSampler = new Tone.Sampler({
  urls: {
    'C5': 'glassRealC5_15s.mp3',
  },
  baseUrl: glass_sounds,
}).toDestination();
glassSampler.volume.value = -5;

var revGlassC5_7s = new Tone.Player(glass_sounds + "revGlassC5_7s.mp3").toDestination();
// randomized playbackRate yields F#4, C5, D5, A5
var c1_revGlassPitchArray = [1, 1.122, 1.682, 2.828];
// put files in array to fade collectively at end of cue
var c1_soundFileArray = [glassRimD3, glassRimE3, glassRimG4, glassRimC4, glassRimB4, glassSynthRimB4];

// E3 and D3 form alternating bass line at first, but gradually phase
var c1_loopE3 = new Tone.Loop(function(time) {
  glassRimE3.start();
}, 17.5);
var c1_loopD3 = new Tone.Loop(function(time) {
  glassRimD3.start('+8');
}, 18);

// loops have slight randomization to cause back-and-forth drift (.humanize) but also long-term phasing between playback devices (Math.random() in interval)
var c1_loopG3 = new Tone.Loop(function(time) {
  glassRimG4.start('+2');
}, 14 + (Math.random() * 2));
c1_loopG3.humanize = 1;
var c1_loopC4 = new Tone.Loop(function(time) {
  glassRimC4.start('+5');
}, 13 + (Math.random() * 4));
c1_loopC4.humanize = 2;
var c1_loopB4 = new Tone.Loop(function(time) {
  // slight detuning from varied playback rate in real glass only
  glassRimB4.playbackRate = 1 + (Math.random() * 0.02);
  glassRimB4.start('+7');
  // synth glass always plays B4 in tune
  glassSynthRimB4.start('+7');
}, 17 + (Math.random() * 4));
c1_loopB4.humanize = 3;

// all sections start 3 seconds after cue
tm.cue[1] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[1].goCue = function() {
  // optimize motion update loop by turning off motion testing when piece starts
  tm.shouldTestMotion = false;
  tm.clearMotionErrorMessage();
  tm.publicMessage('Section 1');
  if (c0_transitionFlag) {
    // piece has looped back around from cue 6 to 1. PLay downbeat sound
    glassSampler.triggerAttackRelease('E5', 15);
    bellSampler.triggerAttackRelease('E7', 5, '+0.2');
    c0_transitionFlag = false;
  }
  // set levels, which may have been turned down at end of previous section
  glassRimE3.volume.value = -9;
  glassRimD3.volume.value = -9;
  glassRimD3.playbackRate = 1; // may have been changed in other cue
  glassRimG4.volume.value = -15;
  glassRimC4.volume.value = -4;
  glassRimB4.volume.value = -15;
  glassSynthRimB4.volume.value = -12;
  revGlassC5_7s.volume.value = -9;
  c1_loopE3.start();
  c1_loopD3.start();
  c1_loopG3.start();
  c1_loopC4.start();
  c1_loopB4.start();
};
tm.cue[1].cueTransition = function() {
  // randomly select 1 of 4 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c1_revGlassPitchArray[Math.floor(Math.random() * c1_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  tm.fadeFilesOverCurve(c1_soundFileArray, 0, 3);
}
tm.cue[1].stopCue = function() {
  c1_loopE3.stop();
  c1_loopD3.stop();
  c1_loopG3.stop();
  c1_loopC4.stop();
  c1_loopB4.stop();
};

// *******************************************************************
// CUE 2: continued long tones with sporadic interjections of noisy layer
var glassRimC3andB2 = new Tone.Player(glass_sounds + "glassRimLayeredC3andB2.mp3").toDestination();
var glassRimA3 = new Tone.Player(glass_sounds + "glassRimLayeredA3.mp3").toDestination();
var glassRimE4BendUp = new Tone.Player(glass_sounds + "glassRimRealE4-F4.mp3").toDestination();
var glassRimF5BendDown = new Tone.Player(glass_sounds + "glassRimRealF5-E5.mp3").toDestination();
var glassSynthRimE4BendUp = new Tone.Player(glass_sounds + "glassRimE4BendUp_triEnv.mp3").toDestination();
var glassSynthRimF5BendDown = new Tone.Player(glass_sounds + "glassRimF5BendDown_envTri.mp3").toDestination();

var iceCrunch = new Tone.Player(granulated_sounds + "iceInWineGlass.mp3").toDestination();
// gap between sounds is 30 - 60 seconds
var c2_noiseDelay = 30 + (Math.random() * 30);

// put files in array to fade collectively at end of cue, except sounds that continue in next cue are faded separately
var c2_soundFileArray = [glassRimC3andB2, glassRimA3, iceCrunch];

// randomized playbackRate yields D5, D6
var c2_revGlassPitchArray = [1.122, 2.244];

// C3 and B2 alternate and don't phase in one part, but phase between devices
// loop interval discrepancy between parts is 0.0 to just less than 1 second
var c2_loopC3B2 = new Tone.Loop(function(time) {
  // audio file is c. 22 long
  glassRimC3andB2.start();
}, 22 + Math.random());
var c2_loopA3 = new Tone.Loop(function(time) {
  glassRimA3.playbackRate = 1 + (Math.random() * 0.01);
  glassRimA3.start('+3');
}, 14 + (Math.random() * 2));
c2_loopA3.humanize = 1;
var c2_loopE4 = new Tone.Loop(function(time) {
  // audio file is c. 6 long
  glassRimE4BendUp.start('+5');
  glassSynthRimE4BendUp.start('+5');
}, 13 + (Math.random() * 4));
c2_loopE4.humanize = 2;
var c2_loopF5 = new Tone.Loop(function(time) {
  // audio file is c. 5 long
  glassRimF5BendDown.start('+7');
  glassSynthRimF5BendDown.start('+7');
}, 16 + (Math.random() * 4));
c2_loopF5.humanize = 3;
var c2_noiseLoop = new Tone.Loop(function(time) {
  iceCrunch.playbackRate = 1.8 + (Math.random() * 0.2);
  // delay before first hearing is handled in goCue()
  iceCrunch.start();
}, c2_noiseDelay);

// all sections start 3 seconds after cue
tm.cue[2] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[2].goCue = function() {
  tm.publicMessage('Section 2');
  // only trigger downbeat sound at beginning of cue, not if restarted
  if (tm.getElapsedTimeInCue(2) < 200) {
    glassSampler.triggerAttackRelease('C6', 10);
    bellSampler.triggerAttackRelease('C7', 5, '+0.2');
  }
  // set levels - may have been turned down to -99 at end of section before
  glassRimC3andB2.volume.value = -9;
  glassRimA3.volume.value = -12;
  glassRimE4BendUp.volume.value = -16;
  glassRimF5BendDown.volume.value = -20;
  glassSynthRimE4BendUp.volume.value = -16;
  glassSynthRimF5BendDown.volume.value = -20;
  iceCrunch.volume.value = -3;
  revGlassC5_7s.volume.value = -9;
  c2_loopC3B2.start();
  c2_loopA3.start();
  c2_loopE4.start();
  c2_loopF5.start();
  c2_noiseLoop.start('+' + c2_noiseDelay);
};
tm.cue[2].cueTransition = function() {
  // randomly select 1 of 2 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c2_revGlassPitchArray[Math.floor(Math.random() * c2_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  tm.fadeFilesOverCurve(c2_soundFileArray, 0, 3);
  // these audio files will play again in the next cue
  glassRimE4BendUp.volume.rampTo(-60, 3);
  glassRimF5BendDown.volume.rampTo(-60, 3);
  glassSynthRimE4BendUp.volume.rampTo(-60, 3);
  glassSynthRimF5BendDown.volume.rampTo(-60, 3);
  c2_loopE4.stop();
  c2_loopF5.stop();
}
tm.cue[2].stopCue = function() {
  c2_loopC3B2.stop();
  c2_loopA3.stop();
  c2_loopE4.stop();
  c2_loopF5.stop();
  c2_noiseLoop.stop();
};

// *******************************************************************
// CUE 3: Bass line that phases between parts
var modeledGlassD3 = new Tone.Player(glass_sounds + "modeledGlassD3-12s.mp3").toDestination();
var modeledGlassF3 = new Tone.Player(glass_sounds + "modeledGlassF3-12s.mp3").toDestination();
var modeledGlassE3 = new Tone.Player(glass_sounds + "modeledGlassE3-12s.mp3").toDestination();
var modeledGlassG3 = new Tone.Player(glass_sounds + "modeledGlassG3-12s.mp3").toDestination();
var glassRealC5_15s = new Tone.Player(glass_sounds + "glassRealC5_15s.mp3").toDestination();

var c3_soundFileArray = [modeledGlassD3, modeledGlassF3, modeledGlassE3, modeledGlassG3, glassRimE4BendUp, glassRimF5BendDown, glassSynthRimE4BendUp, glassSynthRimF5BendDown];

// randomized playbackRate yields D5, Ab5, Ab6
var c3_revGlassPitchArray = [1.122, 1.587, 3.175];

var c3_octaveShift;
var c3_bassLoop = new Tone.Loop(function(time) {
  // random sporadic struck glass on C5 (automatically shifts D up octave)
  if (Math.random() > 0.8) {
    modeledGlassD3.playbackRate = 2;
    // shift D up octave and use volume gap to play struck C
    // randomly detuned up to almost semitone
    glassRealC5_15s.playbackRate = 0.95 + (Math.random() * 0.05);
    glassRealC5_15s.start('+3');
  } else {
    modeledGlassD3.playbackRate = 1;
  }
  // other glasses can be randomly shifted up octave
  c3_octaveShift = Math.random();
  if (c3_octaveShift >  0.95) {
    modeledGlassF3.playbackRate = 2;
  } else if (c3_octaveShift > 0.9) {
    modeledGlassE3.playbackRate = 2;
  } else if (c3_octaveShift > 0.85) {
    modeledGlassG3.playbackRate = 2;
  } else {
    // octave only reset by c3_octaveShift under 0.85
    // so multiple octave shifts could accumulate
    modeledGlassF3.playbackRate = 1;
    modeledGlassE3.playbackRate = 1;
    modeledGlassG3.playbackRate = 1;
  }

  // each audio file is c. 12 long
  modeledGlassD3.start();
  // overlap between notes varies (up to 2 sec.) with each loop iteration
  modeledGlassF3.start('+' + (4 + Math.random() * 2));
  modeledGlassE3.start('+' + (9 + Math.random() * 2));
  modeledGlassG3.start('+' + (13 + Math.random() * 2));
  // notes will not phase within one part, but WILL phase among devices
}, 20 + Math.random());

tm.cue[3] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[3].goCue = function() {
  tm.publicMessage('Section 3');
  // only trigger downbeat sound at beginning of cue, not if restarted
  if (tm.getElapsedTimeInCue(3) < 200) {
    glassSampler.triggerAttackRelease('D6', 10);
    bellSampler.triggerAttackRelease('D7', 5, '+0.2');
  }
  modeledGlassD3.volume.value = -12;
  modeledGlassF3.volume.value = -12;
  modeledGlassE3.volume.value = -12;
  modeledGlassG3.volume.value = -12;
  glassRealC5_15s.volume.value= -6;
  revGlassC5_7s.volume.value = -9;
  c3_bassLoop.start();
  glassRimE4BendUp.volume.rampTo(-22, 3);
  glassSynthRimE4BendUp.volume.rampTo(-22, 3);
  glassRimF5BendDown.volume.rampTo(-24, 3);
  glassSynthRimF5BendDown.volume.rampTo(-24, 3);
  c2_loopE4.start('+1');
  c2_loopF5.start('+1');
}
tm.cue[3].cueTransition = function() {
  // play struck glass on Bb
  glassRealC5_15s.playbackRate = 0.89;
  glassRealC5_15s.start();
  // randomly select 1 of 3 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c3_revGlassPitchArray[Math.floor(Math.random() * c3_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  tm.fadeFilesOverCurve(c3_soundFileArray, 1, 5);
}
tm.cue[3].stopCue = function() {
  c3_bassLoop.stop();
  c2_loopE4.stop();
  c2_loopF5.stop();
}

// *******************************************************************
// CUE 4: bass synthesized from glass waveform
// waveforms for synths to alternate between
var waveHollow = [1, 0.1, 0, 0, 0.5, 0, 0.01];
var waveGlass = [1.000000, 0.033102, 0.006012, 0.000684, 0.018704, 0, 0.000944, 0.003032, 0.002122, 0.000996, 0.002339, 0.002330, 0.001975, 0.000728, 0.001273, 0.001438, 0.003552, 0.001057, 0.001507, 0, 0, 0.002512,  0.001126, 0, 0.000658, 0.000624, 0, 0, 0.000615, 0, 0.000312];

var glassBassSynth = new Tone.Synth({
  envelope: {
    attack: 2,
    decay: 0,
    sustain: 1,
    release: 1.9
  }
}).toDestination();
glassBassSynth.envelope.attackCurve = [0, 0.05, 0.15, 0.3, 0.6, 1];

// second voice
var glassBassSynth2 = new Tone.Synth({
  envelope: {
    attack: 3,
    decay: 0,
    sustain: 1,
    release: 0.9
  }
}).toDestination();
glassBassSynth2.envelope.attackCurve = [0, 0.1, 0.2, 0.4, 1.0];
glassBassSynth2.oscillator.partials = waveHollow;
// LFO to slightly detune upper voice
var c4_detuneLFO = new Tone.LFO(0.1, 1180, 1220);
c4_detuneLFO.connect(glassBassSynth2.detune);

var c4_note1, c4_note2, c4_note3, c4_note4;
// all notes in lower octave for 1st 30s, but then they randomly move up
// after 2 minutes, all guaranteed to be octave up, and then they move down
var c4_switch = [0,0, 30000,0, 60000,0.5, 120000,1, 180000,0.5, 210000,0, 240000,0];
var c4_breakpointVal;

// loop will slowly phase between devices
var c4_bassLoop = new Tone.Loop(function(time) {
  // interpolated value in c4_switch breakpoint loop (updated once per Loop)
  c4_breakpointVal = tm.getSectionBreakpointLoop(4, c4_switch);
  // randomly select waveform for lower voice (same throughout Loop)
  glassBassSynth.oscillator.partials = (Math.random() < c4_breakpointVal) ? waveHollow : waveGlass;

  // weighted probability of octave shift
  c4_note1 = (Math.random() < c4_breakpointVal) ? 'Bb3' : 'Bb1';
  glassBassSynth.triggerAttackRelease(c4_note1, 2);
  // weighted probability of second voice added higher
  if (Math.random() < c4_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c4_note1, 3, '+2');
  }

  c4_note2 = (Math.random() < c4_breakpointVal) ? 'G3' : 'G2';
  glassBassSynth.triggerAttackRelease(c4_note2, 2, '+4');
  if (Math.random() < c4_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c4_note2, 3, '+6');
  }

  c4_note3 = (Math.random() < c4_breakpointVal) ? 'D3' : 'D2';
  glassBassSynth.triggerAttackRelease(c4_note3, 2, '+8');
  if (Math.random() < c4_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c4_note3, 3, '+10');
  }

  c4_note4 = (Math.random() < c4_breakpointVal) ? 'C4' : 'C3';
  glassBassSynth.triggerAttackRelease(c4_note4, 2, '+12');
  if (Math.random() < c4_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c4_note4, 3, '+14');
  }
}, 16 + (Math.random() * 0.4));

tm.cue[4] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicMessage('Section 4');
  glassBassSynth.volume.value = -3;
  glassBassSynth2.volume.value = -20;
  c4_detuneLFO.start();
  c4_bassLoop.start();
};
tm.cue[4].cueTransition = function() {
  glassRimD3.volume.value = -99;
  glassRimD3.volume.rampTo(0, 3);
  glassRimD3.playbackRate = (Math.random() > 0.5) ? 2 : 1;
  glassRimD3.start();
  glassBassSynth.volume.rampTo(-40, 8);
  glassBassSynth2.volume.rampTo(-40, 8);
}
tm.cue[4].stopCue = function() {
  c4_detuneLFO.stop();
  c4_bassLoop.stop();
};

// *******************************************************************
// CUE 5: drone on D slowly fades in and slides down major 2nd
// delay for drone
var c5_delay = new Tone.FeedbackDelay({
  delayTime: 0.2,
  feedback: 0.8
}).toDestination();
var c5_drone = new Tone.Player(glass_sounds + "glassRimC3_30s.mp3").connect(c5_delay);
// second drone at staggered interval
var c5_drone2 = new Tone.Player(glass_sounds + "glassRimC3_30s.mp3").connect(c5_delay);

var c5_highSynthTremolo = new Tone.Tremolo(6, 1).toDestination().start();
var c5_highSynthPan = new Tone.Panner(-1);
var c5_highSynth = new Tone.Synth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 2,
    attackCurve: [0, 0.05, 0.15, 0.4, 1.0],
    decay: 0.01,
    sustain: 0.8,
    release: 2
  }
}).chain(c5_highSynthPan, c5_highSynthTremolo);
var c5_highSynthTremolo2 = new Tone.Tremolo(6, 1).toDestination().start();
var c5_highSynthPan2 = new Tone.Panner(1);
var c5_highSynth2 = new Tone.Synth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 2,
    attackCurve: [0, 0.05, 0.15, 0.4, 1.0],
    decay: 0.01,
    sustain: 0.8,
    release: 2
  }
}).chain(c5_highSynthPan2, c5_highSynthTremolo2);

var c5_highPitch, c5_highDur, c5_highPitch2, c5_highDur;

// loops of very high wobbly shiny synths (will phase among devices)
var c5_highSynthLoop = new Tone.Loop(function(time) {
  // high synth drops by a major 9th
  c5_highSynth.detune.value = tm.getSectionBreakpoints(5, [0,0, 30000,0, 60000,-1400]);
  // randomly change tremolo speed
  c5_highSynthTremolo.frequency.value = 3 + (Math.random() * 4);
  // randomly select very high partials of D0 (18.354 in Hz)
  c5_highPitch = 18.354 * tm.pickRand([160, 192, 224, 256, 288, 320, 352]);
  c5_highDur = 2 + (Math.random() * 1);
  c5_highSynth.triggerAttackRelease(c5_highPitch, c5_highDur);
}, 5 + (Math.random() * 10));
var c5_highSynthLoop2 = new Tone.Loop(function(time) {
  // high synth drops by a major 9th
  c5_highSynth2.detune.value = tm.getSectionBreakpoints(5, [0,0, 30000,0, 60000,-1400]);
  // randomly change tremolo speed
  c5_highSynthTremolo2.frequency.value = 3 + (Math.random() * 4);
  // randomly select very high partials of D0 (18.354 in Hz)
  c5_highPitch2 = 18.354 * tm.pickRand([160, 192, 224, 256, 288, 320, 352]);
  c5_highDur2 = 2 + (Math.random() * 1);
  c5_highSynth2.triggerAttackRelease(c5_highPitch2, c5_highDur2);
}, 5 + (Math.random() * 10));

var c5_droneLoop = new Tone.Loop(function(time) {
  // audio file is on C3 and slides down to D3 after 2 minutes (WAS 3 min.)
  c5_drone.playbackRate = tm.getSectionBreakpoints(5, [0,1.12246, 30000,1.12246, 120000,1]);
  c5_drone.start();
}, 30);
var c5_droneLoop2 = new Tone.Loop(function(time) {
  // audio file is on C3 and slides down to D3 after 2 minutes (WAS 3 min.)
  c5_drone2.playbackRate = tm.getSectionBreakpoints(5, [0,1.12246, 30000,1.12246, 120000,1]);
  c5_drone2.start();
}, 30);


tm.cue[5] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[5].goCue = function() {
  tm.publicMessage('Section 5');
  // only trigger downbeat sound at beginning of cue, not if restarted
  if (tm.getElapsedTimeInCue(5) < 200) {
    vibeSampler.triggerAttackRelease('D6', 5);
    bellSampler.triggerAttackRelease('D7', 5, '+0.2');
  }
  c5_drone.volume.value = -12;
  c5_droneLoop.start();
  c5_drone2.volume.value = -12;
  c5_droneLoop2.start('+10');
  c5_highSynth.volume.value = -28;
  c5_highSynthLoop.start();
  c5_highSynth2.volume.value = -28;
  c5_highSynthLoop2.start('+5');
};
tm.cue[5].stopCue = function() {
  // loops stop immediately but sound in current loop continues (with fadeout)
  c5_droneLoop.stop();
  c5_drone.volume.rampTo(-99, 5);
  c5_droneLoop2.stop();
  c5_drone2.volume.rampTo(-99, 5);
  c5_highSynthLoop.stop();
  c5_highSynthLoop2.stop();
};

// *******************************************************************
// CUE 6: phasing struck glass in sparse texture
var c6_loDelay = new Tone.FeedbackDelay({
  delayTime: 0.375,
  feedback: 0.65
}).toDestination();
var glassB3 = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_loDelay);

var c6_midDelay = new Tone.FeedbackDelay({
  delayTime: 0.375,
  feedback: 0.65
}).toDestination();
var glassB4 = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c6_midDelay);

var c6_hiDelay = new Tone.FeedbackDelay({
  delayTime: 0.375,
  feedback: 0.65
}).toDestination();
var glassFsharp5 = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c6_hiDelay);

// array of playbackRates to create pitches: C, D, B, E
var c6_pitchArr = [1.05946, 1.1892, 1, 1.3348];
var c6_loCounter, c6_midCounter, c6_hiCounter;
// set randomized phasing to reach targets between 2 and 3 minutes
var c6_hiDelayTargetTime = 120000 + (Math.random() * 60000);
var c6_hiDelayTarget = 0.22 + (Math.random() * 0.08);
var c6_loDelayTargetTime = 120000 + (Math.random() * 60000);
var c6_loDelayTarget = 0.3 + (Math.random() * 0.05);

// array of pitches for final transition sound (wrapping back to beginning)
c6_revGlassPitchArray = [0.94387, 1.8877, 3.7755];

// three layers of struck glass sounds with feedback delay
var c6_hiGlassLoop = new Tone.Loop(function(time) {
  // delay times start synchronized and then phase within and across devices
  c6_hiDelay.delayTime.value = tm.getSectionBreakpoints(6, [0,0.375, 48000,0.375, c6_hiDelayTargetTime,c6_hiDelayTarget]);
  // set pitch from array of playback rates
  glassFsharp5.playbackRate = c6_pitchArr[c6_hiCounter % c6_pitchArr.length];
  glassFsharp5.start();
  // reset loop interval if delay time has changed
  c6_hiGlassLoop.interval = c6_hiDelay.delayTime.value * 16;
  c6_hiCounter++;
}, c6_hiDelay.delayTime.value * 16);

var c6_midGlassLoop = new Tone.Loop(function(time) {
  glassB4.playbackRate = c6_pitchArr[c6_midCounter % c6_pitchArr.length];
  glassB4.start();
  c6_midCounter++;
}, c6_midDelay.delayTime.value * 16);

var c6_loGlassLoop = new Tone.Loop(function(time) {
  // delay times start synchronized and then phase within and across devices
  c6_loDelay.delayTime.value = tm.getSectionBreakpoints(6, [0,0.375, 48000,0.375, c6_loDelayTargetTime,c6_loDelayTarget]);
  glassB3.playbackRate = c6_pitchArr[c6_loCounter % c6_pitchArr.length];
  glassB3.start();
  // trigger high loop after 4 iterations of this pitch loop
  if (c6_loCounter === 16) {
    c6_hiGlassLoop.start();
  }
  // reset loop interval if delay time has changed
  c6_loGlassLoop.interval = c6_loDelay.delayTime.value * 16;
  c6_loCounter++;
}, c6_loDelay.delayTime.value * 16);

tm.cue[6] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[6].goCue = function() {
  tm.publicMessage('Section 6');
  c6_loCounter = c6_midCounter = c6_hiCounter = 0;
  glassB3.volume.value = -6;
  glassB4.volume.value = -9;
  glassFsharp5.volume.value = -4;
  c6_loGlassLoop.start();
  // start middle loop offset from low loop
  var c6_hiGlassPreDelay = '+ ' + c6_loDelay.delayTime.value / 2;
  c6_midGlassLoop.start(c6_hiGlassPreDelay);
  // set flag to enable transition sounds back to cue 1 after loop
  c0_transitionFlag = true;
};
tm.cue[6].cueTransition = function() {
  // loops will gradually fade out with feedback delay
  c6_loGlassLoop.stop();
  c6_midGlassLoop.stop();
  c6_hiGlassLoop.stop();
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 3 possible octaves for reversed glass sound
  revGlassC5_7s.playbackRate = c6_revGlassPitchArray[Math.floor(Math.random() * c6_revGlassPitchArray.length)];
  revGlassC5_7s.start();
}
tm.cue[6].stopCue = function() {
  // also need to stop loops here in case user taps 'stop' button
  c6_loGlassLoop.stop();
  c6_midGlassLoop.stop();
  c6_hiGlassLoop.stop();
};

// *******************************************************************
// CUE 7: CODA only accessible through private server - play at end of perf.
var c7_drop = new Tone.Player(misc_sounds + "finalDrop.mp3").toDestination();
// chime tuned to 4th partial above A (220Hz)
var chP4 = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
var chP4b = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
var chP6 = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
var chP6b = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
var chP7 = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
var chP7b = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
var chP10 = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toDestination();
var chP10b = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toDestination();
var chP13 = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
var chP13b = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
var chP14 = new Tone.Player(chime_sounds + "chimeBeats3080Hz.mp3").toDestination();
var chP14b = new Tone.Player(chime_sounds + "chimeBeats3080Hz.mp3").toDestination();
var chP18 = new Tone.Player(chime_sounds + "chimeBeats3960Hz.mp3").toDestination();
var chP18b = new Tone.Player(chime_sounds + "chimeBeats3960Hz.mp3").toDestination();
var chP19 = new Tone.Player(chime_sounds + "chimeBeats4180Hz.mp3").toDestination();
var chP19b = new Tone.Player(chime_sounds + "chimeBeats4180Hz.mp3").toDestination();

var c7_chimeArr = [chP10, chP7, chP14, chP18, chP4, chP13, chP6, chP19, chP4b, chP14b, chP7, chP18b, chP6b, chP10b, chP13b, chP7b, chP19b];
// chimes bend from partials over A220 to partials over F3 (174.61Hz)
var c7_chBendArr = [1.031786, 1.020448, 1.07714, 1.014149, 0.9921, 1.03789, 1.05824, 1.0025454, 0.9921, 1.07714, 1.020448, 1.014149, 1.05824, 1.031786, 1.03789, 1.020448, 1.0025454];

var c7_chCount, c7_index, c7_thisCh;
var c7_arrLen = c7_chimeArr.length;

var c7_chLoop = new Tone.Loop(function(time) {
  // chime loop with random holes (only trigger chimes on half of subdivisions)
  // chimes get more sparse after 30 seconds until they stop completely
  let chimeGap = tm.getSectionBreakpoints(7, [0, 0.5, 30000, 0.5, 90000, 0.0]);
  if (Math.random() < chimeGap) {
    c7_index = c7_chCount % c7_arrLen;
    c7_thisCh = c7_chimeArr[c7_index];
    // bend chimes independently to morph into spectrum on F
    c7_thisCh.playbackRate = tm.getSectionBreakpoints(7, [0,1, 15000,1, 45000,c7_chBendArr[c7_index]]);
    c7_thisCh.volume.value = tm.getSectionBreakpoints(7, [0, -30, 75000, -30, 90000, -60]);
    c7_thisCh.start();
    c7_chCount++;
  }
}, (c6_loDelay.delayTime.value / 3));
// loops of very high wobbly shiny synths (reuses cue 4 synths
var c7_highSynthLoop = new Tone.Loop(function(time) {
  // high synth drops by a major 10th
  c5_highSynth.detune.value = tm.getSectionBreakpoints(7, [0,0, 15000,0, 45000,-1600]);
  // randomly change tremolo speed
  c5_highSynthTremolo.frequency.value = 3 + (Math.random() * 4);
  // randomize same initial pitches as chime loop, but they detune differently
  c5_highPitch = tm.pickRand([1760, 2640, 3080, 4400, 5720, 6160, 7920, 8360]);
  c5_highDur = 2 + (Math.random() * 1);
  c5_highSynth.volume.value = tm.getSectionBreakpoints(7, [0, -32, 45000, -32, 90000, -99]);
  c5_highSynth.triggerAttackRelease(c5_highPitch, c5_highDur);
}, 5 + (Math.random() * 10));
var c7_highSynthLoop2 = new Tone.Loop(function(time) {
  // high synth drops by a major 10th
  c5_highSynth2.detune.value = tm.getSectionBreakpoints(7, [0,0, 15000,0, 45000,-1600]);
  // randomly change tremolo speed
  c5_highSynthTremolo2.frequency.value = 3 + (Math.random() * 4);
  // same initial pitches as chime loop (8va), but they detune differently
  c5_highPitch2 = tm.pickRand([1760, 2640, 3080, 4400, 5720, 6160, 7920, 8360]);
  c5_highDur2 = 2 + (Math.random() * 1);
  c5_highSynth2.volume.value = tm.getSectionBreakpoints(7, [0, -32, 45000, -32, 90000, -99]);
  c5_highSynth2.triggerAttackRelease(c5_highPitch2, c5_highDur2);
}, 5 + (Math.random() * 10));

tm.cue[7] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[7].goCue = function() {
  tm.publicMessage('Section 7');
  c7_chCount = 0;
  c7_drop.start();
  // volumes for chimes and high synths set in loops above (includes fade out)
  c7_chLoop.start('+3.25');
  c7_highSynthLoop.start('+3.25');
  c7_highSynthLoop2.start('+8.25');
};
tm.cue[7].stopCue = function() {
  c7_chLoop.stop();
  c7_highSynthLoop.stop();
  c7_highSynthLoop2.stop();
};

// *******************************************************************
// CUE 8: turn off all sound (only accessible through private server)
// using 'tacet' instead of 'finished' to avoid accidental shutdown
tm.cue[8] = new TMCue('tacet', -1);
tm.cue[8].goCue = function() {
  // nothing to display
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9: Piece done, but just set status as 'tacet' to avoid shutting down
tm.cue[9] = new TMCue('tacet', -1);
tm.cue[9].goCue = function() {
  // nothing to play
};
tm.cue[9
].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 10: used as a tutorial for phones
tm.cue[10] = new TMCue('tacet', -1);
tm.cue[10].goCue = function() {
  // nothing to play
};
tm.cue[10].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 11: used as a tutorial for phones
tm.cue[11] = new TMCue('tacet', -1);
tm.cue[11].goCue = function() {
  // nothing to play
};
tm.cue[11].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 12: used as a tutorial for phones
tm.cue[12] = new TMCue('tacet', -1);
tm.cue[12].goCue = function() {
  // nothing to play
};
tm.cue[12].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 13: used as a tutorial for phones
tm.cue[13] = new TMCue('tacet', -1);
tm.cue[13].goCue = function() {
  // nothing to play
};
tm.cue[13].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 14: sets status to 'waitingForPieceToStart'
// In performance, after tutorials, we'll arrive here, and then should go directly to cue 0 so that incrementing cue (e.g., with pedal) will start piece. OR I can set counter directly to 1 to begin piece. (Going from 14 - 'waiting' - to 0 - 'waiting' - is fine except that it clears the message that the piece will begin soon).
tm.cue[14] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[14].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[14].stopCue = function() {
  // nothing to clean up
};
