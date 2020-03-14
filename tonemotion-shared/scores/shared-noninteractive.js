const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  // TODO: I'm using the JACK server while composing, but create dedicated server with special features (like looping through valid cues only)
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

// Shortcuts to audio file paths
// TODO: delete unused paths
const cello_sounds = 'tonemotion-shared/audio/cello/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const glass_sounds = 'tonemotion-shared/audio/glass/';
const glock_sounds = 'tonemotion-shared/audio/glockenspiel/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const harp_sounds = 'tonemotion-shared/audio/harp/';

// send everything through a limiter to be safe
var masterLimiter = new Tone.Limiter(-1);
Tone.Master.chain(masterLimiter);

// *******************************************************************
// CUE 0: First section of piece. Looped long tones and shake sounds
var glassRimD3 = new Tone.Player(glass_sounds + "glassRimRealD3_10s.mp3").toMaster();
var glassRimE3 = new Tone.Player(glass_sounds + "glassRimRealE3_10s.mp3").toMaster();
var glassRimG3 = new Tone.Player(glass_sounds + "glassRimRealG3_10s.mp3").toMaster();
var glassRimC4 = new Tone.Player(glass_sounds + "glassRimRealC4-B3.mp3").toMaster();
var glassRimB4 = new Tone.Player(glass_sounds + "glassRimRealB4_10s.mp3").toMaster();

var glassSynthRimD3 = new Tone.Player(glass_sounds + "glassRimD3_triEnv.mp3").toMaster();
var glassSynthRimE3 = new Tone.Player(glass_sounds + "glassRimE3_triEnv.mp3").toMaster();
var glassSynthRimG3 = new Tone.Player(glass_sounds + "glassRimG3_triEnv.mp3").toMaster();
var glassSynthRimB4 = new Tone.Player(glass_sounds + "glassRimB4_triEnv.mp3").toMaster();

var revGlassC5_7s = new Tone.Player(glass_sounds + "revGlassC5_7s.mp3").toMaster();
// randomized playbackRate yields F#4, C5, D5, A5
var c0_revGlassPitchArray = [1, 1.122, 1.682, 2.828];
// put files in array to fade collectively at end of cue
var c0_soundFileArray = [glassRimD3, glassRimE3, glassRimG3, glassRimC4, glassRimB4, glassSynthRimD3, glassSynthRimE3, glassSynthRimG3, glassSynthRimB4];

// E3 and D3 form alternating bass line at first, but gradually phase
var c0_loopE3 = new Tone.Loop(function(time) {
  // first sound is actual glass played on rim
  glassRimE3.start();
  // second sound in physically modeled synthesized "glass rim"
  glassSynthRimE3.start();
}, 17.5);
var c0_loopD3 = new Tone.Loop(function(time) {
  glassRimD3.start('+8');
  glassSynthRimD3.start('+8');
}, 18);

// loops have slight randomization to cause back-and-forth drift (.humanize) but also long-term phasing between playback devices (Math.random() in interval)
var c0_loopG3 = new Tone.Loop(function(time) {
  glassRimG3.start('+2');
  glassSynthRimG3.start('+2');
}, 10 + (Math.random() * 2));
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
}, 16 + (Math.random() * 4));
c0_loopB4.humanize = 3;

// all sections start 2 seconds after cue
tm.cue[0] = new TMCue('listen', 2000, NO_LIMIT);
tm.cue[0].goCue = function() {
  // set levels, which may have been turned down at end of previous section
  glassRimE3.volume.value = -6;
  glassRimD3.volume.value = -6;
  glassRimD3.playbackRate = 1; // may have been changed in other cue
  glassRimG3.volume.value = -12;
  glassRimC4.volume.value = -6;
  glassRimB4.volume.value = -16;
  glassSynthRimE3.volume.value = -12;
  glassSynthRimD3.volume.value = -12;
  glassSynthRimG3.volume.value = -16;
  glassSynthRimB4.volume.value = -16;
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
  tm.fadeFilesOverCurve(c0_soundFileArray, 0, 3);
  c0_loopE3.stop();
  c0_loopD3.stop();
  c0_loopG3.stop();
  c0_loopC4.stop();
  c0_loopB4.stop();
};

// *******************************************************************
// CUE 1: continued long tones with sporadic interjections of noisy layer
var glassRimC3andB2 = new Tone.Player(glass_sounds + "glassRimC3andB2.mp3").toMaster();
var glassRimA3 = new Tone.Player(glass_sounds + "glassRimRealA3_9s.mp3").toMaster();
var glassRimE4BendUp = new Tone.Player(glass_sounds + "glassRimRealE4-F4.mp3").toMaster();
var glassRimF5BendDown = new Tone.Player(glass_sounds + "glassRimRealF5-E5.mp3").toMaster();

var glassSynthRimA3 = new Tone.Player(glass_sounds + "glassRimA3_triEnv.mp3").toMaster();
var glassSynthRimE4BendUp = new Tone.Player(glass_sounds + "glassRimE4BendUp_triEnv.mp3").toMaster();
var glassSynthRimF5BendDown = new Tone.Player(glass_sounds + "glassRimF5BendDown_envTri.mp3").toMaster();

var iceCrunch = new Tone.Player(granulated_sounds + "iceInWineGlass.mp3").toMaster();
// gap between sounds is 30 - 60 seconds
var c1_noiseDelay = 30 + (Math.random() * 30);

// put files in array to fade collectively at end of cue
// does NOT include the two files that continue in next section
var c1_soundFileArray = [glassRimC3andB2, glassRimA3, iceCrunch, glassSynthRimA3, glassSynthRimE4BendUp, glassSynthRimF5BendDown];

// randomized playbackRate yields D5, D6
var c1_revGlassPitchArray = [1.122, 2.244];

// C3 and B2 alternate and don't phase in one part, but phase between devices
// loop interval discrepancy between parts is 0.0 to just less than 1 second
var c1_loopC3B2 = new Tone.Loop(function(time) {
  // audio file is c. 12 long
  glassRimC3andB2.start();
}, 12 + Math.random());
var c1_loopA3 = new Tone.Loop(function(time) {
  // slight detuning from varied playback rate in real glass only
  glassRimA3.playbackRate = 1 + (Math.random() * 0.01);
  glassRimA3.start('+3');
  glassSynthRimA3.start('+3');
}, 10 + (Math.random() * 2));
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

// all sections start 2 seconds after cue
tm.cue[1] = new TMCue('listen', 2000, NO_LIMIT);
tm.cue[1].goCue = function() {
  // set levels, which may have been turned down to -99 at end of section before
  glassRimC3andB2.volume.value = -9;
  glassRimA3.volume.value = -16;
  glassRimE4BendUp.volume.value = -20;
  glassRimF5BendDown.volume.value = -24;
  glassSynthRimA3.volume.value = -16;
  glassSynthRimE4BendUp.volume.value = -20;
  glassSynthRimF5BendDown.volume.value = -24;
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
  tm.fadeFilesOverCurve(c1_soundFileArray, 2, 3);
  c1_loopC3B2.stop();
  c1_loopA3.stop();
  c1_noiseLoop.stop();
  // c1_loopE4 and c1_loopF5 do NOT stop because they continue in next cue
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

tm.cue[2] = new TMCue('listen', 2000, NO_LIMIT);
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
  c1_loopE4.start();
  c1_loopF5.start();
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

tm.cue[3] = new TMCue('listen', 2000, NO_LIMIT);
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
// CUE 4: drone on B slowly fades in and slides up octave

// reverb for drone
var c4_delay = new Tone.FeedbackDelay({
  delayTime: 0.2,
  feedback: 0.8
}).toMaster();
var c4_drone = new Tone.Player(glass_sounds + "glassRimC3_30s.mp3").connect(c4_delay);

var c4_highSynthTremolo = new Tone.Tremolo(6, 1).toMaster().start();
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
}).connect(c4_highSynthTremolo);

var c4_highPitch, c4_highDur;

// loop of very high wobbly shiny synths (will phase among devices)
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

var c4_counter;

var c4_playbackRateLoop = new Tone.Loop(function(time) {
  c4_drone.start();
  c4_counter++;
}, 32);


tm.cue[4] = new TMCue('listen', 2000, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicMessage('Section 4');

  c4_drone.volume.value = -9;
  c4_playbackRateLoop.start();

  c4_highSynth.volume.value = -32;
  c4_highSynthLoop.start();
};
tm.cue[4].stopCue = function() {
  // TODO: add drone fade out
  c4_playbackRateLoop.stop();
  c4_highSynthLoop.stop();
};

// *******************************************************************
// CUE 5: [intro] Actual beginning of piece, but first section is tacet
tm.cue[5] = new TMCue('tacet', -1);
tm.cue[5].goCue = function() {
  if (tm.debug) { tm.publicLog('The piece has started.'); }
};
tm.cue[5].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 6: [intro] CUE FIXED MEDIA FILE 1
tm.cue[6] = new TMCue('tacet', -1);
tm.cue[6].goCue = function() {
  // nothing happens for audience - just cues fixed media
};
tm.cue[6].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 7: [A1] Shaking bells through predefined pitch array (with looped tail)
// CUE FIXED MEDIA FILE 2
var glFsharp3 = new Tone.Player(glock_sounds + "glockFsharp3.mp3").toMaster();
// load same audio file into second buffer to allow retrigger without artifact
// NOTE: octaves are actually one octave higher
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
var glE4 = new Tone.Player(glock_sounds + "glockE4.mp3").toMaster();
var glE4b = new Tone.Player(glock_sounds + "glockE4.mp3").toMaster();
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


var counterCue7 = 0;
// initial array of pitches triggered
var pitchArrayCue7 = [glG3, glG4, glB3, glB4, glG3b, glG4b, glB3b, glB4b, glFsharp3, glFsharp4, glFsharp3b, glFsharp4b, glCsharp4, glCsharp5, glCsharp4b, glCsharp5b, glD4, glD5, glD4b, glD5b, glCsharp4, glCsharp5, glCsharp4b, glCsharp5b, glB3, glB4, glB3b, glB4b];
// loop of As triggered after loop is over
var pitchLoopCue7 = [glA3, glA4, chA6lo, glA4b, glA3b, glA4, chA6hi, glA4b];
var thisGlockenspiel;

tm.cue[7] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[7].goCue = function() {
  // reset counter
  counterCue7 = 0;
};

tm.cue[7].triggerShakeSound = function() {
  if (counterCue7 < pitchArrayCue7.length) {
    thisGlockenspiel = pitchArrayCue7[counterCue7];
  } else {
    // repeats same three pitches until end of section
    thisGlockenspiel = pitchLoopCue7[counterCue7 % pitchLoopCue7.length];
  }
  // pitches bend up quarter tone in section half of section
  thisGlockenspiel.playbackRate = tm.getSectionBreakpoints(7, [0,1, 30000,1, 60000,1.0293]);
  thisGlockenspiel.start();
  counterCue7++;
};
tm.cue[7].stopCue = function() {
  // nothing to clean up UNLESS I use a reversed chime at end of cue
};

// *******************************************************************
// CUE 8: [B1 first 5 mm.] short TACET section, just listening to cello

tm.cue[8] = new TMCue('tacet', 1875, NO_LIMIT);
tm.cue[8].goCue = function() {
  // no sound here
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9:

// *******************************************************************
// CUE 10: [A2] Shaking glass through predefined pitch array (with looped tail)

var glassFsharp4 = new Tone.Player(glass_sounds + "glassRealFsharp4.mp3").toMaster();
var glassG4 = new Tone.Player(glass_sounds + "glassRealG4.mp3").toMaster();
var glassA4 = new Tone.Player(glass_sounds + "glassRealA4.mp3").toMaster();
var glassB4 = new Tone.Player(glass_sounds + "glassRealB4.mp3").toMaster();
var glassCsharp5 = new Tone.Player(glass_sounds + "glassRealCsharp5.mp3").toMaster();
var glassD5 = new Tone.Player(glass_sounds + "glassRealD5.mp3").toMaster();
var glassE5 = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
var glassFsharp5 = new Tone.Player(glass_sounds + "glassRealFsharp5.mp3").toMaster();
var glassG5 = new Tone.Player(glass_sounds + "glassRealG5.mp3").toMaster();
var glassA5 = new Tone.Player(glass_sounds + "glassRealA5.mp3").toMaster();
var glassB5 = new Tone.Player(glass_sounds + "glassRealB5.mp3").toMaster();
var glassCsharp6 = new Tone.Player(glass_sounds + "glassRealCsharp6.mp3").toMaster();
var glassD6 = new Tone.Player(glass_sounds + "glassRealD6.mp3").toMaster();
var glassE6 = new Tone.Player(glass_sounds + "glassRealE6.mp3").toMaster();
var glassFsharp6 = new Tone.Player(glass_sounds + "glassRealFsharp6.mp3").toMaster();
var glassG6 = new Tone.Player(glass_sounds + "glassRealG6.mp3").toMaster();
var glassA6 = new Tone.Player(glass_sounds + "glassRealA6.mp3").toMaster();
var chA6a = new Tone.Player(chime_sounds + "chimeA6.mp3").toMaster();
var chA6b = new Tone.Player(chime_sounds + "chimeA6.mp3").toMaster();
var chA6c = new Tone.Player(chime_sounds + "chimeA6.mp3").toMaster();
var chA7a = new Tone.Player(chime_sounds + "chimeA7.mp3").toMaster();
var chA7b = new Tone.Player(chime_sounds + "chimeA7.mp3").toMaster();
var chA7c = new Tone.Player(chime_sounds + "chimeA7.mp3").toMaster();

var counterCue10 = 0;
// initial array of pitches triggered
var pitchArrayCue10 = [glassG4, glassG5, glassB4, glassB5, glassFsharp4, glassFsharp5, glassCsharp5, glassCsharp6, glassD5, glassD6, glassCsharp5, glassCsharp6, glassB4, glassB5, glassA4, glassA5, glassG4, glassG5, glassD5, glassD6, glassD5, glassD6, glassE5, glassE6, glassFsharp5, glassFsharp6, glassCsharp5, glassCsharp6, glassCsharp5, glassCsharp6, glassE5, glassE6, glassE5, glassE6];
// loop of As triggered after loop is over
var pitchLoopCue10 = [chA6a, chA7a, chA6b, chA7b, chA6c, chA7c];
var soundfileCue10;

tm.cue[10] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[10].goCue = function() {
  // reset counter
  counterCue10 = 0;
};
tm.cue[10].triggerShakeSound = function() {
  if (counterCue10 < pitchArrayCue10.length) {
    soundfileCue10 = pitchArrayCue10[counterCue10];
  } else {
    // repeats same two pitches until end of section
    soundfileCue10 = pitchLoopCue10[counterCue10 % pitchLoopCue10.length];
  }
  // pitches bend down quarter tone in section half of section
  soundfileCue10.playbackRate = tm.getSectionBreakpoints(10, [0,1, 30000,1, 60000,0.971532]);
  soundfileCue10.start();
  counterCue10++;
};
tm.cue[10].stopCue = function() {
  // nothing to clean up UNLESS I use reversed chime at end of section
};

// *******************************************************************
// CUE 11: [B2 first 5 mm.] short TACET section, just listening to cello

tm.cue[11] = new TMCue('tacet', 1875, NO_LIMIT);
tm.cue[11].goCue = function() {
  // no sound here
};
tm.cue[11].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 12: [B2] 3 percussive loops with variable playback speed

var pingpongClickLoop = new Tone.Player(granulated_sounds + "pingpongClickLoop.mp3").toMaster();
pingpongClickLoop.loop = true;

var ziplockClickLoop = new Tone.Player(granulated_sounds + "ziplockClickLoop.mp3").toMaster();
ziplockClickLoop.loop = true;

var claveLoop = new Tone.Player(granulated_sounds + "claveLoop.mp3").toMaster();
claveLoop.loop = true;

tm.cue[12] = new TMCue('tilt', 1875, NO_LIMIT); // 2 beats @ 64bpm

tm.cue[12].goCue = function() {
  // mute both loops by default - unmute below
  pingpongClickLoop.volume.value = -99;
  ziplockClickLoop.volume.value = -99;
  claveLoop.volume.value = -99;
  pingpongClickLoop.start();
  ziplockClickLoop.start();
  claveLoop.start();
};

tm.cue[12].updateTiltSounds = function() {
  // playback rate can range from quarter speed to four times speed
  pingpongClickLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  ziplockClickLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  claveLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.6) {
    // ping pong audible when device tilted to right
    pingpongClickLoop.volume.value = tm.getSectionBreakpoints(12, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    ziplockClickLoop.volume.value = -99;
    claveLoop.volume.value = -99;
  } else if (tm.accel.x > 0.2) {
    ziplockClickLoop.volume.value = tm.getSectionBreakpoints(12, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    pingpongClickLoop.volume.value = -99;
    claveLoop.volume.value = -99;
  } else {
    claveLoop.volume.value = tm.getSectionBreakpoints(12, [0,0, 26250,0, 33750,-3, 37500,-12, 41250,-99]);
    pingpongClickLoop.volume.value = -99;
    ziplockClickLoop.volume.value = -99;
  }
};
tm.cue[12].stopCue = function() {
  pingpongClickLoop.stop();
  ziplockClickLoop.stop();
  claveLoop.stop();
};
// *******************************************************************
// CUE 13: [A3] glock / glass sounds through canon

var counterCue13 = 0;
var soundfileCue13, indexCue13;
var noteDur = 60 / 64 * 1000; // milliseconds per quarter note

// upper voice of canon
var hiPitchArrayCue13 = [glassG5, glassB5, glassFsharp5, glassCsharp6, glassD6, glassCsharp6, glassB5, glassA5, glassG5, glassD6, glassD6, glassE6, glassFsharp6, glassCsharp6, glassCsharp6, glassE6, glassE6, glassA6, glassFsharp6, glassG6, glassE6, glassD6, glassD6, glassCsharp6, glassB5, glassE6, glassE6, glassD6, glassD6, glassCsharp6, glassCsharp6, glassB5, glassG5, glassB5, glassFsharp5, glassCsharp6, glassD6, glassCsharp6, glassB5, glassA5, glassG5, glassD6, glassD6, glassE6, glassFsharp6, glassCsharp6, glassCsharp6, glassE6, glassE6, chA7a, glassFsharp6, glassG6, glassE6, glassD6, glassD6, glassCsharp6, glassB5, glassE6, glassE6, glassD6, glassD6, glassCsharp6, glassCsharp6, glassB5];
// lower voice of canon
var loPitchArrayCue13 = [glG3, glG3b, glB3, glB3b, glFsharp3, glFsharp3b, glCsharp4, glCsharp4b, glD4, glD4b, glCsharp4, glCsharp4b, glB3, glB3b, glA3, glA3b, glG3, glG3b, glD4, glD4b, glD4, glD4b, glE4, glE4b, glFsharp4, glFsharp4b, glCsharp4, glCsharp4b, glCsharp4, glCsharp4b, glE4, glE4b, glE4, glE4b, chA6a, chA6b, glFsharp4, glFsharp4b, glG4, glG4b, glE4, glE4b, glD4, glD4b, glD4, glD4b, glCsharp4, glCsharp4b, glB3, glB3b, glE4, glE4b, glE4, glE4b, glD4, glD4b, glD4, glD4b, glCsharp4, glCsharp4b, glCsharp4, glCsharp4b, glB3, glB3b];

tm.cue[13] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[13].goCue = function() {
  counterCue13 = 0;
};
tm.cue[13].triggerShakeSound = function() {
  // select note based on time since cue started (to keep all parts synched)
  indexCue13 = Math.floor(tm.getElapsedTimeInCue(13)/noteDur);
  // if any extra time, keep playing last note
  if (indexCue13 > (hiPitchArrayCue13.length - 1)) {
    indexCue13 = hiPitchArrayCue13.length - 1;
  }
  // alternately select between lower and higher canon
  soundfileCue13 = (counterCue13 % 2) ? hiPitchArrayCue13[indexCue13] : loPitchArrayCue13[indexCue13];

  soundfileCue13.start();
  counterCue13++;
};
tm.cue[13].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 14: [C1] triplet synths and clicky sounds (with pitch on tilt)

var synthTriangle17 = new Tone.Synth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 0.05,
    decay: 0.01,
    sustain: 0.5,
    release: 0.2
  }
}).toMaster();
synthTriangle17.volume.value = -12;

var synthTriangle17b = new Tone.Synth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 0.05,
    decay: 0.01,
    sustain: 0.5,
    release: 0.15
  }
}).toMaster();
synthTriangle17b.volume.value = -12;

var synthTriangle17c = new Tone.Synth({
  oscillator: {
    type: 'triangle17'
  },
  envelope: {
    attack: 0.05,
    decay: 0.01,
    sustain: 0.5,
    release: 0.1
  }
}).toMaster();
synthTriangle17c.volume.value = -12;

var loPitchArrayCue14 = ['B2', 'B2', 'C#3', 'C#3', 'C#3', 'C#3', 'D#3', 'D#3', 'A#2', 'A#2', 'F#3', 'F#3', 'F#3', 'F#3', 'F3', 'F3', 'D#3', 'D#3', 'C#3', 'C#3', 'C#3', 'C#3', 'D#3', 'D#3', 'A#2', 'A#2', 'C#3', 'C#3', 'C#3', 'C#3', 'F#3', 'F#3', 'F#3', 'F#3', 'G#3', 'G#3', 'G#3', 'G#3', 'A#3', 'A#3', 'F#3', 'F#3', 'G#3', 'G#3', 'G#3', 'G#3', 'F#3', 'F#3', 'F3', 'F3', 'G#3', 'G#3', 'D#3', 'D#3', 'B2', 'B2', 'C#3', 'C#3', 'A#2', 'A#2', 'A#2', 'A#2', 'C#3', 'C#3'];
var hiPitchArrayCue14 = ['B3', 'C#4', 'C#4', 'D#4', 'A#3', 'F#4', 'F#4', 'F4', 'D#4', 'C#4', 'C#4', 'D#4', 'A#3', 'C#4', 'C#4', 'F#4', 'F#4', 'G#4', 'G#4', 'A#4', 'F#4', 'G#4', 'G#4', 'F#4', 'F4', 'G#4', 'D#4', 'B3', 'C#4', 'A#3', 'A#3','C#4', 'B3', 'C#4', 'C#4', 'D#4', 'A#3', 'F#4', 'F#4', 'F4', 'D#4', 'C#4', 'C#4', 'D#4', 'A#3', 'C#4', 'C#4', 'F#4', 'F#4', 'G#4', 'G#4', 'A#4', 'F#4', 'G#4', 'G#4', 'F#4', 'F4', 'G#4', 'D#4', 'B3', 'C#4', 'A#3', 'A#3','C#4'];

var pingPong = new Tone.Player(perc_sounds + "pingPong.mp3").toMaster();
var clave = new Tone.Player(perc_sounds + "clave.mp3").toMaster();

var ziplockClick = new Tone.Player(perc_sounds + "ziplockClick.mp3").toMaster();
var percArrayCue14 = [clave, ziplockClick, pingPong, ziplockClick, pingPong, clave, pingPong, ziplockClick, pingPong];

var percCounterCue14 = 0;
var pitchIndexCue14, pitchCue14, pitchBendCue14, pitchShiftCue14;

var loopCue14 = new Tone.Loop(function(time) {
  // select note based on time since cue started (to keep all parts synched)
  pitchIndexCue14 = Math.floor(tm.getElapsedTimeInCue(14)/noteDur);
  // if any extra time, keep playing last note
  if (pitchIndexCue14 > (loPitchArrayCue14.length - 1)) {
    pitchIndexCue14 = loPitchArrayCue14.length - 1;
  }
  // tilted to left plays synth on low canon voice
  if (tm.accel.x < 0.4) {
    pitchCue14 = loPitchArrayCue14[pitchIndexCue14];
    // in second half, bends down whole step
    pitchBendCue14 = tm.getSectionBreakpoints(14, [0,0, 30000,0, 60000,200]);
    // octave displacement controlled on y-axis
    pitchShiftCue14 = Math.floor(tm.accel.y * 4) * 1200 - pitchBendCue14;
    synthTriangle17.detune.value = pitchShiftCue14;
    synthTriangle17.triggerAttackRelease(pitchCue14, '16n');
    synthTriangle17b.detune.value = 1200 + pitchShiftCue14;
    synthTriangle17b.triggerAttackRelease(pitchCue14, '8t', '+16t');
    synthTriangle17c.detune.value = 2400 + pitchShiftCue14;
    synthTriangle17c.triggerAttackRelease(pitchCue14, '8t', '+8t');
  // tilted to right plays synth on high canon voice
  } else if (tm.accel.x > 0.6) {
    pitchCue14 = hiPitchArrayCue14[pitchIndexCue14];
    // in second half, bends down whole step
    pitchBendCue14 = tm.getSectionBreakpoints(14, [0,0, 30000,0, 60000,200]);
    // octave displacement controlled on y-axis
    pitchShiftCue14 = Math.floor(tm.accel.y * 4) * 1200 - pitchBendCue14;
    synthTriangle17.detune.value = pitchShiftCue14;
    synthTriangle17.triggerAttackRelease(pitchCue14, '16n');
    synthTriangle17b.detune.value = 1200 + pitchShiftCue14;
    synthTriangle17b.triggerAttackRelease(pitchCue14, '8t', '+16t');
    synthTriangle17c.detune.value = 2400 + pitchShiftCue14;
    synthTriangle17c.triggerAttackRelease(pitchCue14, '8t', '+8t');
  // held in center plays percussive sounds in triplets
  } else {
    clave.playbackRate = 0.5 + tm.accel.y * 4.5;
    ziplockClick.playbackRate = 0.2 + tm.accel.y * 4.8;
    pingPong.playbackRate = 0.2 + tm.accel.y * 4.8;
    percArrayCue14[percCounterCue14 % percArrayCue14.length].start();
    percArrayCue14[(percCounterCue14 + 1) % percArrayCue14.length].start('+16t');
    percArrayCue14[(percCounterCue14 + 2) % percArrayCue14.length].start('+8t');
    percCounterCue14 += 3;
  }
}, '8n'); // tempo is 128bpm, but just use halved rhythms to avoid tempo change

tm.cue[14] = new TMCue('tilt', 1875, NO_LIMIT);

tm.cue[14].goCue = function() {
  percCounterCue14 = 0;
  loopCue14.start();
};

tm.cue[14].updateTiltSounds = function() {
  // all interactivity handled in loop above
};

tm.cue[14].stopCue = function() {
  loopCue14.stop();
};

// *******************************************************************
// CUE 15: [A4] glock / glass sounds through canon with rising vc pizz
// CUE FIXED MEDIA FILE 3

var vcG2 = new Tone.Player(cello_sounds + "vc-long-pz-G2.mp3").toMaster();
var vcG2b = new Tone.Player(cello_sounds + "vc-long-pz-G2.mp3").toMaster();
var vcG3 = new Tone.Player(cello_sounds + "vc-long-pz-G3.mp3").toMaster();
vcG3.volume.value = -3;
var vcG4 = new Tone.Player(cello_sounds + "vc-long-pz-G4.mp3").toMaster();
vcG4.volume.value = -6;
var vcB4 = new Tone.Player(cello_sounds + "vc-long-pz-B4.mp3").toMaster();
vcB4.volume.value = -12;

var harpFsharp3 = new Tone.Player(harp_sounds + "harpFsharp3.mp3").toMaster();
var harpG3 = new Tone.Player(harp_sounds + "harpG3.mp3").toMaster();
var harpA3 = new Tone.Player(harp_sounds + "harpA3.mp3").toMaster();
var harpB3 = new Tone.Player(harp_sounds + "harpB3.mp3").toMaster();
var harpCsharp4 = new Tone.Player(harp_sounds + "harpCsharp4.mp3").toMaster();
var harpD4 = new Tone.Player(harp_sounds + "harpD4.mp3").toMaster();
var harpE4 = new Tone.Player(harp_sounds + "harpE4.mp3").toMaster();
var harpFsharp4 = new Tone.Player(harp_sounds + "harpFsharp4.mp3").toMaster();
var harpG4 = new Tone.Player(harp_sounds + "harpG4.mp3").toMaster();
var harpA4 = new Tone.Player(harp_sounds + "harpA4.mp3").toMaster();
var harpB4 = new Tone.Player(harp_sounds + "harpB4.mp3").toMaster();
var harpCsharp5 = new Tone.Player(harp_sounds + "harpCsharp5.mp3").toMaster();
var harpD5 = new Tone.Player(harp_sounds + "harpD5.mp3").toMaster();
var harpE5 = new Tone.Player(harp_sounds + "harpE5.mp3").toMaster();
var harpFsharp5 = new Tone.Player(harp_sounds + "harpFsharp5.mp3").toMaster();
var harpG5 = new Tone.Player(harp_sounds + "harpG5.mp3").toMaster();
var harpA5 = new Tone.Player(harp_sounds + "harpA5.mp3").toMaster();
var harpB5 = new Tone.Player(harp_sounds + "harpB5.mp3").toMaster();
var harpCsharp6 = new Tone.Player(harp_sounds + "harpCsharp6.mp3").toMaster();
var harpD6 = new Tone.Player(harp_sounds + "harpD6.mp3").toMaster();
var harpE6 = new Tone.Player(harp_sounds + "harpE6.mp3").toMaster();
var harpFsharp6 = new Tone.Player(harp_sounds + "harpFsharp6.mp3").toMaster();
var harpG6 = new Tone.Player(harp_sounds + "harpG6.mp3").toMaster();
var harpA6 = new Tone.Player(harp_sounds + "harpA6.mp3").toMaster();
var harpCsharp7 = new Tone.Player(harp_sounds + "harpCsharp7.mp3").toMaster();
var harpD7 = new Tone.Player(harp_sounds + "harpD7.mp3").toMaster();
var harpE7 = new Tone.Player(harp_sounds + "harpE7.mp3").toMaster();

var counterCue15 = 0;
var vcCounter = 0;
var vcProb, indexCue15, soundfileCue15;

// upper voice of canon
var hiPitchArrayCue15 = [harpG5, harpB5, harpFsharp5, harpCsharp6, harpD6, harpCsharp6, harpB5, harpA5, harpG5, harpD6, harpD7, harpE6, harpFsharp6, harpCsharp6, harpCsharp7, harpE6, harpE7, harpA6, harpFsharp6, harpG6, harpE6, harpD6, harpD7, harpCsharp6, harpB5, harpE6, harpE7, harpD6, harpD7, harpCsharp6, harpCsharp7, harpB5, harpG5, harpB5, harpFsharp5, harpCsharp6, harpD6, harpCsharp6, harpB5, harpA5, harpG5, harpD6, harpD7, harpE6, harpFsharp6, harpCsharp6, harpCsharp7, harpE6, harpE7, harpA6, harpFsharp6, harpG6, harpE6, harpD6, harpD7, harpCsharp6, harpB5, harpE6, harpE7, harpD6, harpD7, harpCsharp6, harpCsharp7, harpB5];
// lower voice of canon
var loPitchArrayCue15 = [harpG3, harpG4, harpB3, harpB4, harpFsharp3, harpFsharp4, harpCsharp4, harpCsharp5, harpD4, harpD5, harpCsharp4, harpCsharp5, harpB3, harpB4, harpA3, harpA4, harpG3, harpG4, harpD4, harpD5, harpD6, harpD5, harpE4, harpE5, harpFsharp4, harpFsharp5, harpCsharp4, harpCsharp5, harpCsharp6, harpCsharp5, harpE4, harpE5, harpE6, harpE5, harpA5, harpA6, harpFsharp4, harpFsharp5, harpG4, harpG5, harpE4, harpE5, harpD4, harpD5, harpD6, harpD5, harpCsharp4, harpCsharp5, harpB3, harpB4, harpE4, harpE5, harpE6, harpE5, harpD4, harpD5, harpD6, harpD5, harpCsharp4, harpCsharp5, harpCsharp6, harpCsharp5, harpB3, harpB4];

tm.cue[15] = new TMCue('shake', 1875, NO_LIMIT); // 4 beats @ 128bpm

tm.cue[15].goCue = function() {
  counterCue15 = 0;
  vcCounter = 0;
};

tm.cue[15].triggerShakeSound = function() {
  // randomly replace canon voices with cello pizz sweep (increasing prob.)
  vcProb = tm.getSectionBreakpoints(15, [0,0, 60000,0.5]);
  if (Math.random() < vcProb) {
    // pitch glisses up one octave
    vcG2.playbackRate = vcG2b.playbackRate = vcG3.playbackRate = vcG4.playbackRate = vcB4.playbackRate = tm.getSectionBreakpoints(15, [0,1, 15000,1, 52500,2]);
    // double-buffer longest pizz to avoid click on re-trigger
    (vcCounter % 2) ? vcG2.start() : vcG2b.start();
    vcG3.start('+32n');
    vcG4.start('+16n');
    vcB4.start('+16n.');
    vcCounter++;
  } else {
    // select note based on time since cue started (to keep all parts synched)
    indexCue15 = Math.floor(tm.getElapsedTimeInCue(15)/noteDur);
    // if any extra time, keep playing last note
    if (indexCue15 > (hiPitchArrayCue15.length - 1)) {
      indexCue15 = hiPitchArrayCue15.length - 1;
    }
    // alternately select between lower and higher canon
    soundfileCue15 = (counterCue15 % 2) ? hiPitchArrayCue15[indexCue15] : loPitchArrayCue15[indexCue15];

    soundfileCue15.start();
    counterCue15++;
  }
};

tm.cue[15].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 16: [C2 first 16"] short TACET section, just listening to cello

tm.cue[16] = new TMCue('tacet', 1875, NO_LIMIT);
tm.cue[16].goCue = function() {
  // no sound here
};
tm.cue[16].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 17: [C2] swirly synth sounds and sparkles

var synthVolume = {
  'soprano': -34,
  'alto': -32,
  'tenor': -28,
  'bass': -26
}
var synthEnvCue17 = {
  attack: 12,
  decay: 0.2,
  sustain: 0.9,
  release: 0.5
}

var sugarChimeLoop = new Tone.Player(granulated_sounds + 'chimesAndSugarLoop.mp3').toMaster();
sugarChimeLoop.loop = true;

var AMSynthCue17 = new Tone.AMSynth({
  envelope: synthEnvCue17,
  modulationEnvelope: synthEnvCue17
}).toMaster();

// soprano synth
var sopranoFilterCue17 = new Tone.Filter(1567.98, "lowpass").toMaster();
var sopranoSynthCue17 = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: synthEnvCue17
}).connect(sopranoFilterCue17);
sopranoSynthCue17.volume.value = synthVolume.soprano;
var sopranoFilterCue17Scale = new Tone.Scale(20, 6000);
xTilt.chain(sopranoFilterCue17Scale, sopranoFilterCue17.frequency);

// alto synth
var altoFilterCue17 = new Tone.Filter(622.25, "lowpass").toMaster();
var altoSynthCue17 = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: synthEnvCue17
}).connect(altoFilterCue17);
altoSynthCue17.volume.value = synthVolume.alto;
var altoFilterCue17Scale = new Tone.Scale(20, 5000);
xTilt.chain(altoFilterCue17Scale, altoFilterCue17.frequency);

// tenor synth
var tenorFilterCue17 = new Tone.Filter(220, "lowpass").toMaster();
var tenorSynthCue17 = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: synthEnvCue17
}).connect(tenorFilterCue17);
tenorSynthCue17.volume.value = synthVolume.tenor;
var tenorFilterCue17Scale = new Tone.Scale(3000, 20);
xTilt.chain(tenorFilterCue17Scale, tenorFilterCue17.frequency);

// bass synth
var bassFilterCue17 = new Tone.Filter(87.31, "lowpass").toMaster();
var bassSynthCue17 = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: synthEnvCue17
}).connect(bassFilterCue17);
bassSynthCue17.volume.value = synthVolume.bass;
var bassFilterCue17Scale = new Tone.Scale(2000, 20);
xTilt.chain(bassFilterCue17Scale, bassFilterCue17.frequency);

// flag to enable fade out of crunchies at end of cue
var playingCue17 = false;

tm.cue[17] = new TMCue('tilt', 1875, NO_LIMIT);

tm.cue[17].goCue = function() {
  playingCue17 = true;

  // trigger synth pitches and (after 15") begin pitch slides to next chord
  bassSynthCue17.triggerAttack(87.31);
  bassSynthCue17.frequency.setValueCurveAtTime([87.31, 77.78], '+15', 45);
  tenorSynthCue17.triggerAttack(220);
  tenorSynthCue17.frequency.setValueCurveAtTime([220, 233.08], '+15', 45);
  altoSynthCue17.triggerAttack(622.25);
  altoSynthCue17.frequency.setValueCurveAtTime([622.25, 392], '+15', 45);
  sopranoSynthCue17.triggerAttack(1567.98);
  sopranoSynthCue17.frequency.setValueCurveAtTime([1567.98, 1108.73], '+15', 45);
  AMSynthCue17.triggerAttack(783.99);
  AMSynthCue17.frequency.setValueCurveAtTime([783.99, 349.23], '+15', 45);

  sugarChimeLoop.volume.value = -99;
  sugarChimeLoop.start();
};

tm.cue[17].updateTiltSounds = function() {
  // wobbliness of AM synth controlled on y-axis
  AMSynthCue17.harmonicity.value = 1.0 + tm.accel.y * 0.01;
  // crunchy chimes and brown sugar in plastic container
  sugarChimeLoop.playbackRate = 0.25 + tm.accel.y * 3.75;

  // left strip has sparkly sounds
  if (tm.accel.x < 0.33) {
    if (playingCue17) {
      // don't use long release on envelop because of artifacts if triggered before attack is finished. instead use slow rampTo() if not playingCue17
      sugarChimeLoop.volume.value = 0;
      bassSynthCue17.volume.value = -99;
      tenorSynthCue17.volume.value = -99;
      altoSynthCue17.volume.value = -99;
      sopranoSynthCue17.volume.value = -99;
      AMSynthCue17.volume.value = -99;
    }
  // everything else has sweeping AMSynth and filtered synths
  } else {
    if (playingCue17) {
      sugarChimeLoop.volume.value = -99;
      bassSynthCue17.volume.value = synthVolume.bass;
      tenorSynthCue17.volume.value = synthVolume.tenor;
      altoSynthCue17.volume.value = synthVolume.alto;
      sopranoSynthCue17.volume.value = synthVolume.soprano;
      AMSynthCue17.volume.value = 0;
    }
  }
}

tm.cue[17].stopCue = function() {
  playingCue17 = false;
  bassSynthCue17.volume.rampTo(-99, 8);
  bassSynthCue17.triggerRelease('+8');
  tenorSynthCue17.volume.rampTo(-99, 8);
  tenorSynthCue17.triggerRelease('+8');
  altoSynthCue17.volume.rampTo(-99, 8);
  altoSynthCue17.triggerRelease('+8');
  sopranoSynthCue17.volume.rampTo(-99, 8);
  sopranoSynthCue17.triggerRelease('+8');
  AMSynthCue17.volume.rampTo(-99, 8);
  AMSynthCue17.triggerRelease('+8');
  sugarChimeLoop.volume.rampTo(-99, 5);
  sugarChimeLoop.stop('+5');
};

// *******************************************************************
// CUE 18: [coda] CUE FIXED MEDIA 4

var chEb6 = new Tone.Player(chime_sounds + "2sec-chime-Eb6.mp3").toMaster();
var chEb6b = new Tone.Player(chime_sounds + "2sec-chime-Eb6.mp3").toMaster();
var chEb7 = new Tone.Player(chime_sounds + "2sec-chime-Eb7.mp3").toMaster();
var chEb7b = new Tone.Player(chime_sounds + "2sec-chime-Eb7.mp3").toMaster();
var chF6 = new Tone.Player(chime_sounds + "2sec-chime-F6.mp3").toMaster();
var chF7 = new Tone.Player(chime_sounds + "2sec-chime-F7.mp3").toMaster();
var chG6 = new Tone.Player(chime_sounds + "2sec-chime-G6.mp3").toMaster();
var chD6 = new Tone.Player(chime_sounds + "2sec-chime-D6.mp3").toMaster();
var chD7 = new Tone.Player(chime_sounds + "2sec-chime-D7.mp3").toMaster();
var chD6b = new Tone.Player(chime_sounds + "2sec-chime-D6.mp3").toMaster();
var chD7b = new Tone.Player(chime_sounds + "2sec-chime-D7.mp3").toMaster();
var chBb6 = new Tone.Player(chime_sounds + "2sec-chime-Bb6.mp3").toMaster();
var chBb7 = new Tone.Player(chime_sounds + "2sec-chime-Bb7.mp3").toMaster();
var chA6 = new Tone.Player(chime_sounds + "2sec-chime-A6.mp3").toMaster();
var chC7 = new Tone.Player(chime_sounds + "2sec-chime-C7.mp3").toMaster();
var chC8 = new Tone.Player(chime_sounds + "2sec-chime-C8.mp3").toMaster();

var pitchArrayCue18 = [chEb6, chEb7, chEb6b, chEb7b, chEb6, chEb7, chEb6b, chEb7b, chEb6, chF6, chF7, chG6, chD6, chBb6, chBb7, chA6, chG6, chF6, chF7, chG6, chD6, chF6, chF7, chBb6, chBb7, chC7, chC8, chD7, chBb6, chC7, chC8, chBb6, chA6, chC7, chG6, chEb6, chF6];

// loop of Ds triggered after loop is over (pitch shifted down M2 by end)
var pitchLoopCue18 = [chD6, chD7, chD6b, chD7b];

var counterCue18 = 0;
var soundfileCue18;

tm.cue[18] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[18].goCue = function() {
  // reset counter
  counterCue18 = 0;
};
tm.cue[18].triggerShakeSound = function() {
  if (counterCue18 < pitchArrayCue18.length) {
    soundfileCue18 = pitchArrayCue18[counterCue18];
  } else {
    // repeats same two pitches until end of section
    soundfileCue18 = pitchLoopCue18[counterCue18 % pitchLoopCue18.length];
  }
  // pitches down major second
  soundfileCue18.playbackRate = tm.getSectionBreakpoints(18, [0,1, 15000,1, 60000,0.8908987]);
  soundfileCue18.volume.value = tm.getSectionBreakpoints(18, [0,0, 50000,0, 60000,-99]);
  soundfileCue18.start();
  counterCue18++;
};

tm.cue[18].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 19: tacet fermata
tm.cue[19] = new TMCue('tacet', -1);
tm.cue[19].goCue = function() {
  // nothing to play
}
tm.cue[19].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 20: finished
tm.cue[20] = new TMCue('finished', -1);
tm.cue[20].goCue = function() {
  tm.publicLog('The piece is done.');
}

// *******************************************************************
// CUES 21-24: use to test pedal and cue counter

tm.cue[21] = new TMCue('waiting', -1);
tm.cue[21].goCue = function() {
  tm.publicLog('Test cue 21 was triggered.');
};
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
