const tm = new ToneMotion();
// TODO: turn off debugging before deployment
tm.debug = true; // if true, skips clock sync and shows console

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

// send everything through a limiter to be safe
var masterLimiter = new Tone.Limiter(-1);
Tone.Master.chain(masterLimiter);

// *******************************************************************
// CUE -1: ONLY used in performance to keep everything silent until start
tm.cue[-1] = new TMCue('waiting', -1);
tm.cue[-1].goCue = function() {
  // nothing to do here
};
tm.cue[-1].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 0: First section of piece. Looped long tones and shake sounds
var glassRimD3 = new Tone.Player(glass_sounds + "glassRimLayeredD3.mp3").toMaster();
var glassRimE3 = new Tone.Player(glass_sounds + "glassRimLayeredE3.mp3").toMaster();
var glassRimG4 = new Tone.Player(glass_sounds + "glassRimLayeredG4.mp3").toMaster();
var glassRimC4 = new Tone.Player(glass_sounds + "glassRimRealC4-B3.mp3").toMaster();
var glassRimB4 = new Tone.Player(glass_sounds + "glassRimRealB4_10s.mp3").toMaster();
var glassSynthRimB4 = new Tone.Player(glass_sounds + "glassRimB4_triEnv.mp3").toMaster();

var revGlassC5_7s = new Tone.Player(glass_sounds + "revGlassC5_7s.mp3").toMaster();
// randomized playbackRate yields F#4, C5, D5, A5
var c0_revGlassPitchArray = [1, 1.122, 1.682, 2.828];
// put files in array to fade collectively at end of cue
var c0_soundFileArray = [glassRimD3, glassRimE3, glassRimG4, glassRimC4, glassRimB4, glassSynthRimB4];

// E3 and D3 form alternating bass line at first, but gradually phase
var c0_loopE3 = new Tone.Loop(function(time) {
  glassRimE3.start();
}, 17.5);
var c0_loopD3 = new Tone.Loop(function(time) {
  glassRimD3.start('+8');
}, 18);

// loops have slight randomization to cause back-and-forth drift (.humanize) but also long-term phasing between playback devices (Math.random() in interval)
var c0_loopG3 = new Tone.Loop(function(time) {
  glassRimG4.start('+2');
}, 14 + (Math.random() * 2));
c0_loopG3.humanize = 1;
var c0_loopC4 = new Tone.Loop(function(time) {
  glassRimC4.start('+5');
}, 13 + (Math.random() * 4));
c0_loopC4.humanize = 2;
var c0_loopB4 = new Tone.Loop(function(time) {
  // slight detuning from varied playback rate in real glass only
  glassRimB4.playbackRate = 1 + (Math.random() * 0.02);
  glassRimB4.start('+7');
  // synth glass always plays B4 in tune
  glassSynthRimB4.start('+7');
}, 17 + (Math.random() * 4));
c0_loopB4.humanize = 3;

// all sections start 3 seconds after cue
tm.cue[0] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[0].goCue = function() {
  // set levels, which may have been turned down at end of previous section
  glassRimE3.volume.value = -9;
  glassRimD3.volume.value = -9;
  glassRimD3.playbackRate = 1; // may have been changed in other cue
  glassRimG4.volume.value = -15;
  glassRimC4.volume.value = -4;
  glassRimB4.volume.value = -15;
  glassSynthRimB4.volume.value = -12;
  revGlassC5_7s.volume.value = -3;
  c0_loopE3.start();
  c0_loopD3.start();
  c0_loopG3.start();
  c0_loopC4.start();
  c0_loopB4.start();
};
tm.cue[0].stopCue = function() {
  // randomly select 1 of 4 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c0_revGlassPitchArray[Math.floor(Math.random() * c0_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  tm.fadeFilesOverCurve(c0_soundFileArray, 0, 5);
  c0_loopE3.stop();
  c0_loopD3.stop();
  c0_loopG3.stop();
  c0_loopC4.stop();
  c0_loopB4.stop();
};

// *******************************************************************
// CUE 1: continued long tones with sporadic interjections of noisy layer
var glassRimC3andB2 = new Tone.Player(glass_sounds + "glassRimLayeredC3andB2.mp3").toMaster();
var glassRimA3 = new Tone.Player(glass_sounds + "glassRimLayeredA3.mp3").toMaster();
var glassRimE4BendUp = new Tone.Player(glass_sounds + "glassRimRealE4-F4.mp3").toMaster();
var glassRimF5BendDown = new Tone.Player(glass_sounds + "glassRimRealF5-E5.mp3").toMaster();
var glassSynthRimE4BendUp = new Tone.Player(glass_sounds + "glassRimE4BendUp_triEnv.mp3").toMaster();
var glassSynthRimF5BendDown = new Tone.Player(glass_sounds + "glassRimF5BendDown_envTri.mp3").toMaster();

var iceCrunch = new Tone.Player(granulated_sounds + "iceInWineGlass.mp3").toMaster();
// gap between sounds is 30 - 60 seconds
var c1_noiseDelay = 30 + (Math.random() * 30);

// put files in array to fade collectively at end of cue
// does NOT include the two files that continue in next section
var c1_soundFileArray = [glassRimC3andB2, glassRimA3, iceCrunch, glassSynthRimE4BendUp, glassSynthRimF5BendDown];

// randomized playbackRate yields D5, D6
var c1_revGlassPitchArray = [1.122, 2.244];

// C3 and B2 alternate and don't phase in one part, but phase between devices
// loop interval discrepancy between parts is 0.0 to just less than 1 second
var c1_loopC3B2 = new Tone.Loop(function(time) {
  // audio file is c. 22 long
  glassRimC3andB2.start();
}, 22 + Math.random());
var c1_loopA3 = new Tone.Loop(function(time) {
  glassRimA3.playbackRate = 1 + (Math.random() * 0.01);
  glassRimA3.start('+3');
}, 14 + (Math.random() * 2));
c1_loopA3.humanize = 1;
var c1_loopE4 = new Tone.Loop(function(time) {
  // audio file is c. 6 long
  glassRimE4BendUp.start('+5');
  glassSynthRimE4BendUp.start('+5');
}, 13 + (Math.random() * 4));
c1_loopE4.humanize = 2;
var c1_loopF5 = new Tone.Loop(function(time) {
  // audio file is c. 5 long
  glassRimF5BendDown.start('+7');
  glassSynthRimF5BendDown.start('+7');
}, 16 + (Math.random() * 4));
c1_loopF5.humanize = 3;
var c1_noiseLoop = new Tone.Loop(function(time) {
  iceCrunch.playbackRate = 1.8 + (Math.random() * 0.2);
  // delay before first hearing is handled in goCue()
  iceCrunch.start();
}, c1_noiseDelay);

// all sections start 3 seconds after cue
tm.cue[1] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[1].goCue = function() {
  // set levels - may have been turned down to -99 at end of section before
  glassRimC3andB2.volume.value = -9;
  glassRimA3.volume.value = -12;
  glassRimE4BendUp.volume.value = -16;
  glassRimF5BendDown.volume.value = -20;
  glassSynthRimE4BendUp.volume.value = -16;
  glassSynthRimF5BendDown.volume.value = -20;
  iceCrunch.volume.value = -3;
  revGlassC5_7s.volume.value = -3;
  c1_loopC3B2.start();
  c1_loopA3.start();
  c1_loopE4.start();
  c1_loopF5.start();
  c1_noiseLoop.start('+' + c1_noiseDelay);
};
tm.cue[1].stopCue = function() {
  // randomly select 1 of 2 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c1_revGlassPitchArray[Math.floor(Math.random() * c1_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  tm.fadeFilesOverCurve(c1_soundFileArray, 2, 5);
  c1_loopC3B2.stop();
  c1_loopA3.stop();
  c1_noiseLoop.stop();
  c1_loopE4.stop();
  c1_loopF5.stop();
};

// *******************************************************************
// CUE 2: Bass line that phases between parts
var modeledGlassD3 = new Tone.Player(glass_sounds + "modeledGlassD3-12s.mp3").toMaster();
var modeledGlassF3 = new Tone.Player(glass_sounds + "modeledGlassF3-12s.mp3").toMaster();
var modeledGlassE3 = new Tone.Player(glass_sounds + "modeledGlassE3-12s.mp3").toMaster();
var modeledGlassG3 = new Tone.Player(glass_sounds + "modeledGlassG3-12s.mp3").toMaster();
var glassRealC5_15s = new Tone.Player(glass_sounds + "glassRealC5_15s.mp3").toMaster();

var c2_soundFileArray = [modeledGlassD3, modeledGlassF3, modeledGlassE3, modeledGlassG3, glassRimE4BendUp, glassRimF5BendDown, glassSynthRimE4BendUp, glassSynthRimF5BendDown];

// randomized playbackRate yields D5, Ab5, Ab6
var c2_revGlassPitchArray = [1.122, 1.587, 3.175];

var c2_octaveShift;
var c2_bassLoop = new Tone.Loop(function(time) {
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
  c2_octaveShift = Math.random();
  if (c2_octaveShift >  0.95) {
    modeledGlassF3.playbackRate = 2;
  } else if (c2_octaveShift > 0.9) {
    modeledGlassE3.playbackRate = 2;
  } else if (c2_octaveShift > 0.85) {
    modeledGlassG3.playbackRate = 2;
  } else {
    // octave only reset by c2_octaveShift under 0.85
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

tm.cue[2] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[2].goCue = function() {
  modeledGlassD3.volume.value = -12;
  modeledGlassF3.volume.value = -12;
  modeledGlassE3.volume.value = -12;
  modeledGlassG3.volume.value = -12;
  glassRealC5_15s.volume.value= -6;
  revGlassC5_7s.volume.value = -3;
  c2_bassLoop.start();
  // next two loops were already going in cue 1, but need to be retriggered here just in case client starts with this cue
  glassRimE4BendUp.volume.value = -22;
  glassSynthRimE4BendUp.volume.value = -22;
  glassRimF5BendDown.volume.value = -24;
  glassSynthRimF5BendDown.volume.value = -24;
  c1_loopE4.start('+5');
  c1_loopF5.start('+5');
}
tm.cue[2].stopCue = function() {
  // play struck glass on Bb
  glassRealC5_15s.playbackRate = 0.89;
  glassRealC5_15s.start();
  // randomly select 1 of 3 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c2_revGlassPitchArray[Math.floor(Math.random() * c2_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  tm.fadeFilesOverCurve(c2_soundFileArray, 1, 5);
  c2_bassLoop.stop();
  c1_loopE4.stop();
  c1_loopF5.stop();
}

// *******************************************************************
// CUE 3: bass synthesized from glass waveform
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
}).toMaster();
glassBassSynth.envelope.attackCurve = [0, 0.05, 0.15, 0.3, 0.6, 1];

// second voice
var glassBassSynth2 = new Tone.Synth({
  envelope: {
    attack: 3,
    decay: 0,
    sustain: 1,
    release: 0.9
  }
}).toMaster();
glassBassSynth2.envelope.attackCurve = [0, 0.1, 0.2, 0.4, 1.0];
glassBassSynth2.oscillator.partials = waveHollow;
// LFO to slightly detune upper voice
var c3_detuneLFO = new Tone.LFO(0.1, 1180, 1220);
c3_detuneLFO.connect(glassBassSynth2.detune);

var c3_note1, c3_note2, c3_note3, c3_note4;
// all notes in lower octave for 1st 30s, but then they randomly move up
// after 2 minutes, all guaranteed to be octave up, and then they move down
var c3_switch = [0,0, 30000,0, 60000,0.5, 120000,1, 180000,0.5, 210000,0, 240000,0];
var c3_breakpointVal;

// loop will slowly phase between devices
var c3_bassLoop = new Tone.Loop(function(time) {
  // interpolated value in c3_switch breakpoint loop (updated once per Loop)
  c3_breakpointVal = tm.getSectionBreakpointLoop(3, c3_switch);
  // randomly select waveform for lower voice (same throughout Loop)
  glassBassSynth.oscillator.partials = (Math.random() < c3_breakpointVal) ? waveHollow : waveGlass;

  // weighted probability of octave shift
  c3_note1 = (Math.random() < c3_breakpointVal) ? 'Bb3' : 'Bb1';
  glassBassSynth.triggerAttackRelease(c3_note1, 2);
  // weighted probability of second voice added higher
  if (Math.random() < c3_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c3_note1, 3, '+2');
  }

  c3_note2 = (Math.random() < c3_breakpointVal) ? 'G3' : 'G2';
  glassBassSynth.triggerAttackRelease(c3_note2, 2, '+4');
  if (Math.random() < c3_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c3_note2, 3, '+6');
  }

  c3_note3 = (Math.random() < c3_breakpointVal) ? 'D3' : 'D2';
  glassBassSynth.triggerAttackRelease(c3_note3, 2, '+8');
  if (Math.random() < c3_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c3_note3, 3, '+10');
  }

  c3_note4 = (Math.random() < c3_breakpointVal) ? 'C4' : 'C3';
  glassBassSynth.triggerAttackRelease(c3_note4, 2, '+12');
  if (Math.random() < c3_breakpointVal) {
    glassBassSynth2.triggerAttackRelease(c3_note4, 3, '+14');
  }
}, 16 + (Math.random() * 0.4));

tm.cue[3] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[3].goCue = function() {
  glassBassSynth.volume.value = -3;
  glassBassSynth2.volume.value = -20;
  c3_detuneLFO.start();
  c3_bassLoop.start();
};
tm.cue[3].stopCue = function() {
  glassRimD3.volume.value = -99;
  glassRimD3.volume.rampTo(0, 3);
  glassRimD3.playbackRate = (Math.random() > 0.5) ? 2 : 1;
  glassRimD3.start();
  glassBassSynth.volume.rampTo(-40, 8);
  glassBassSynth2.volume.rampTo(-40, 8);
  // stop LFO that detune second synth right now? or after fade out?
  c3_detuneLFO.stop();
  c3_bassLoop.stop();
};

// *******************************************************************
// CUE 4: drone on D slowly fades in and slides down major 2nd
// delay for drone
var c4_delay = new Tone.FeedbackDelay({
  delayTime: 0.2,
  feedback: 0.8
}).toMaster();
var c4_drone = new Tone.Player(glass_sounds + "glassRimC3_30s.mp3").connect(c4_delay);
// second drone at staggered interval
var c4_drone2 = new Tone.Player(glass_sounds + "glassRimC3_30s.mp3").connect(c4_delay);

var c4_highSynthTremolo = new Tone.Tremolo(6, 1).toMaster().start();
var c4_highSynthPan = new Tone.Panner(-1);
var c4_highSynth = new Tone.Synth({
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
}).chain(c4_highSynthPan, c4_highSynthTremolo);
var c4_highSynthTremolo2 = new Tone.Tremolo(6, 1).toMaster().start();
var c4_highSynthPan2 = new Tone.Panner(1);
var c4_highSynth2 = new Tone.Synth({
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
}).chain(c4_highSynthPan2, c4_highSynthTremolo2);

var c4_highPitch, c4_highDur, c4_highPitch2, c4_highDur;

// loops of very high wobbly shiny synths (will phase among devices)
var c4_highSynthLoop = new Tone.Loop(function(time) {
  // high synth drops by a major 9th
  c4_highSynth.detune.value = tm.getSectionBreakpoints(4, [0,0, 30000,0, 60000,-1400]);
  // randomly change tremolo speed
  c4_highSynthTremolo.frequency.value = 3 + (Math.random() * 4);
  // randomly select very high partials of D0 (18.354 in Hz)
  c4_highPitch = 18.354 * tm.pickRand([160, 192, 224, 256, 288, 320, 352]);
  c4_highDur = 2 + (Math.random() * 1);
  c4_highSynth.triggerAttackRelease(c4_highPitch, c4_highDur);
}, 5 + (Math.random() * 10));
var c4_highSynthLoop2 = new Tone.Loop(function(time) {
  // high synth drops by a major 9th
  c4_highSynth2.detune.value = tm.getSectionBreakpoints(4, [0,0, 30000,0, 60000,-1400]);
  // randomly change tremolo speed
  c4_highSynthTremolo2.frequency.value = 3 + (Math.random() * 4);
  // randomly select very high partials of D0 (18.354 in Hz)
  c4_highPitch2 = 18.354 * tm.pickRand([160, 192, 224, 256, 288, 320, 352]);
  c4_highDur2 = 2 + (Math.random() * 1);
  c4_highSynth2.triggerAttackRelease(c4_highPitch2, c4_highDur2);
}, 5 + (Math.random() * 10));

var c4_droneLoop = new Tone.Loop(function(time) {
  // audio file is on C3 and slides down to D3 after 3 minutes
  c4_drone.playbackRate = tm.getSectionBreakpoints(4, [0,1.12246, 30000,1.12246, 150000,1]);
  c4_drone.start();
}, 30);
var c4_droneLoop2 = new Tone.Loop(function(time) {
  // audio file is on C3 and slides down to D3 after 3 minutes
  c4_drone2.playbackRate = tm.getSectionBreakpoints(4, [0,1.12246, 30000,1.12246, 150000,1]);
  c4_drone2.start();
}, 30);


tm.cue[4] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicMessage('Section 4');

  c4_drone.volume.value = -6;
  c4_droneLoop.start();
  c4_drone2.volume.value = -6;
  c4_droneLoop2.start('+10');

  c4_highSynth.volume.value = -28;
  c4_highSynthLoop.start();
  c4_highSynth2.volume.value = -28;
  c4_highSynthLoop2.start('+5');
};
tm.cue[4].stopCue = function() {
  // loops stop immediately but sound in current loop continues (with fadeout)
  c4_droneLoop.stop();
  c4_drone.volume.rampTo(-99, 5);
  c4_droneLoop2.stop();
  c4_drone2.volume.rampTo(-99, 5);
  c4_highSynthLoop.stop();
  c4_highSynthLoop2.stop();
};

// *******************************************************************
// CUE 5: phasing struck glass in sparse texture
var c5_loDelay = new Tone.FeedbackDelay({
  delayTime: 0.375,
  feedback: 0.65
}).toMaster();
var glassB3 = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_loDelay);

var c5_midDelay = new Tone.FeedbackDelay({
  delayTime: 0.375,
  feedback: 0.65
}).toMaster();
var glassB4 = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c5_midDelay);

var c5_hiDelay = new Tone.FeedbackDelay({
  delayTime: 0.375,
  feedback: 0.65
}).toMaster();
var glassFsharp5 = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c5_hiDelay);

// array of playbackRates to create pitches: C, D, B, E
var c5_pitchArr = [1.05946, 1.1892, 1, 1.3348];
var c5_loCounter, c5_midCounter, c5_hiCounter;
// set randomized phasing to reach targets between 2 and 3 minutes
var c5_hiDelayTargetTime = 120000 + (Math.random() * 60000);
var c5_hiDelayTarget = 0.22 + (Math.random() * 0.08);
var c5_loDelayTargetTime = 120000 + (Math.random() * 60000);
var c5_loDelayTarget = 0.3 + (Math.random() * 0.05);

// array of pitches for final transition sound (wrapping back to beginning)
c5_revGlassPitchArray = [0.94387, 1.8877, 3.7755];

// three layers of struck glass sounds with feedback delay
var c5_hiGlassLoop = new Tone.Loop(function(time) {
  // delay times start synchronized and then phase within and across devices
  c5_hiDelay.delayTime.value = tm.getSectionBreakpoints(5, [0,0.375, 48000,0.375, c5_hiDelayTargetTime,c5_hiDelayTarget]);
  // set pitch from array of playback rates
  glassFsharp5.playbackRate = c5_pitchArr[c5_hiCounter % c5_pitchArr.length];
  glassFsharp5.start();
  // reset loop interval if delay time has changed
  c5_hiGlassLoop.interval = c5_hiDelay.delayTime.value * 16;
  c5_hiCounter++;
}, c5_hiDelay.delayTime.value * 16);

var c5_midGlassLoop = new Tone.Loop(function(time) {
  glassB4.playbackRate = c5_pitchArr[c5_midCounter % c5_pitchArr.length];
  glassB4.start();
  c5_midCounter++;
}, c5_midDelay.delayTime.value * 16);

var c5_loGlassLoop = new Tone.Loop(function(time) {
  // delay times start synchronized and then phase within and across devices
  c5_loDelay.delayTime.value = tm.getSectionBreakpoints(5, [0,0.375, 48000,0.375, c5_loDelayTargetTime,c5_loDelayTarget]);
  glassB3.playbackRate = c5_pitchArr[c5_loCounter % c5_pitchArr.length];
  glassB3.start();
  // trigger high loop after 4 iterations of this pitch loop
  if (c5_loCounter === 16) {
    c5_hiGlassLoop.start();
  }
  // reset loop interval if delay time has changed
  c5_loGlassLoop.interval = c5_loDelay.delayTime.value * 16;
  c5_loCounter++;
}, c5_loDelay.delayTime.value * 16);

tm.cue[5] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[5].goCue = function() {
  c5_loCounter = c5_midCounter = c5_hiCounter = 0;
  glassB3.volume.value = -6;
  glassB4.volume.value = -9;
  glassFsharp5.volume.value = -4;
  c5_loGlassLoop.start();
  // start middle loop offset from low loop
  var c5_hiGlassPreDelay = '+ ' + c5_loDelay.delayTime.value / 2;
  c5_midGlassLoop.start(c5_hiGlassPreDelay);
};
tm.cue[5].stopCue = function() {
  // loops will gradually fade out with feedback delay
  c5_loGlassLoop.stop();
  c5_midGlassLoop.stop();
  c5_hiGlassLoop.stop();
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 3 possible octaves for reversed glass sound
  revGlassC5_7s.playbackRate = c5_revGlassPitchArray[Math.floor(Math.random() * c5_revGlassPitchArray.length)];
  revGlassC5_7s.start();
};

// *******************************************************************
// CUE 6: CODA only accessible through private server - play at end of perf.
var c6_drop = new Tone.Player(misc_sounds + "finalDrop.mp3").toMaster();
// chime tuned to 4th partial above A (220Hz)
var chP4 = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toMaster();
var chP4b = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toMaster();
var chP6 = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toMaster();
var chP6b = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toMaster();
var chP7 = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toMaster();
var chP7b = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toMaster();
var chP10 = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toMaster();
var chP10b = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toMaster();
var chP13 = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toMaster();
var chP13b = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toMaster();
var chP14 = new Tone.Player(chime_sounds + "chimeBeats3080Hz.mp3").toMaster();
var chP14b = new Tone.Player(chime_sounds + "chimeBeats3080Hz.mp3").toMaster();
var chP18 = new Tone.Player(chime_sounds + "chimeBeats3960Hz.mp3").toMaster();
var chP18b = new Tone.Player(chime_sounds + "chimeBeats3960Hz.mp3").toMaster();
var chP19 = new Tone.Player(chime_sounds + "chimeBeats4180Hz.mp3").toMaster();
var chP19b = new Tone.Player(chime_sounds + "chimeBeats4180Hz.mp3").toMaster();

var c6_chimeArr = [chP10, chP7, chP14, chP18, chP4, chP13, chP6, chP19, chP4b, chP14b, chP7, chP18b, chP6b, chP10b, chP13b, chP7b, chP19b];
// chimes bend from partials over A220 to partials over F3 (174.61Hz)
var c6_chBendArr = [1.031786, 1.020448, 1.07714, 1.014149, 0.9921, 1.03789, 1.05824, 1.0025454, 0.9921, 1.07714, 1.020448, 1.014149, 1.05824, 1.031786, 1.03789, 1.020448, 1.0025454];

var c6_chCount, c6_index, c6_thisCh;
var c6_arrLen = c6_chimeArr.length;

var c6_chLoop = new Tone.Loop(function(time) {
  // chime loop with random holes (only trigger chimes on half of subdivisions)
  if (Math.random() < 0.5) {
    c6_index = c6_chCount % c6_arrLen;
    c6_thisCh = c6_chimeArr[c6_index];
    // bend chimes independently to morph into spectrum on F
    // TODO: decide on exact durations of pitch bend breakpoints
    c6_thisCh.playbackRate = tm.getSectionBreakpoints(6, [0,1, 15000,1, 45000,c6_chBendArr[c6_index]]);
    c6_thisCh.volume.value = -30;
    c6_thisCh.start();
    c6_chCount++;
  }
}, (c5_loDelay.delayTime.value / 3));
// loops of very high wobbly shiny synths (reuses cue 4 synths
var c6_highSynthLoop = new Tone.Loop(function(time) {
  // high synth drops by a major 10th
  c4_highSynth.detune.value = tm.getSectionBreakpoints(6, [0,0, 15000,0, 45000,-1600]);
  // randomly change tremolo speed
  c4_highSynthTremolo.frequency.value = 3 + (Math.random() * 4);
  // randomize same initial pitches as chime loop, but they detune differently
  c4_highPitch = tm.pickRand([1760, 2640, 3080, 4400, 5720, 6160, 7920, 8360]);
  c4_highDur = 2 + (Math.random() * 1);
  c4_highSynth.triggerAttackRelease(c4_highPitch, c4_highDur);
}, 5 + (Math.random() * 10));
var c6_highSynthLoop2 = new Tone.Loop(function(time) {
  // high synth drops by a major 10th
  c4_highSynth2.detune.value = tm.getSectionBreakpoints(6, [0,0, 15000,0, 45000,-1600]);
  // randomly change tremolo speed
  c4_highSynthTremolo2.frequency.value = 3 + (Math.random() * 4);
  // same initial pitches as chime loop (8va), but they detune differently
  c4_highPitch2 = tm.pickRand([1760, 2640, 3080, 4400, 5720, 6160, 7920, 8360]);
  c4_highDur2 = 2 + (Math.random() * 1);
  c4_highSynth2.triggerAttackRelease(c4_highPitch2, c4_highDur2);
}, 5 + (Math.random() * 10));

tm.cue[6] = new TMCue('listen', 3000, NO_LIMIT);
tm.cue[6].goCue = function() {
  c6_chCount = 0;
  c6_drop.start();
  c6_chLoop.start('+3.25');
  c4_highSynth.volume.value = -32;
  c6_highSynthLoop.start('+3.25');
  c4_highSynth2.volume.value = -32;
  c6_highSynthLoop2.start('+8.25');
};
tm.cue[6].stopCue = function() {
  c6_chLoop.stop();
  c6_highSynthLoop.stop();
  c6_highSynthLoop2.stop();
};

// *******************************************************************
// CUE 7: turn off all sound (only accessible through private server)
tm.cue[7] = new TMCue('finished', -1);
tm.cue[7].goCue = function() {
  // nothing to do here
};
tm.cue[7].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 8: used as a tutorial for phones
tm.cue[8] = new TMCue('tacet', -1);
tm.cue[8].goCue = function() {
  // nothing to play
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9: used as a tutorial for phones
tm.cue[9] = new TMCue('tacet', -1);
tm.cue[9].goCue = function() {
  // nothing to play
};
tm.cue[9].stopCue = function() {
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
