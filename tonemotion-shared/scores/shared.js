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
const glock_sounds = 'tonemotion-shared/audio/glockenspiel/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const vibes_sounds = 'tonemotion-shared/audio/vibes/';
const bell_sounds = 'tonemotion-shared/audio/bells/';
const piano_sounds = 'tonemotion-shared/audio/piano/';
const misc_sounds = 'tonemotion-shared/audio/misc/';

Tone.Transport.bpm.value = 60;

// INSTRUMENTS
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

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
// trigger transition from cue 6 back to cue 1 ONLY if coming from cue 6, so this flag is only set to true at cue 6 goCue(), set to false after cue 1 goCue
let c0_transitionFlag = false;
tm.cue[0].cueTransition = function() {
  if (c0_transitionFlag) {
    // If cue 6 loops back to cue 1, this transition from cue 0 will be triggered, which will stop the cue 6 loops
    revGlassC5_7s.volume.value = -9;
    revGlassC5_7s.playbackRate = 1.26; // major third, so E5
    revGlassC5_7s.start();
    c6_glassLoop.stop();
    ziplockClickLoop.stop();
  }
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 1: First section (struck glass sounds)
// This should really be done with a Sampler but I did it this way first
var glassE4 = new Tone.Player(glass_sounds + "glassRealE4.mp3").toDestination();
var glassE5 = new Tone.Player(glass_sounds + "glassRealE5.mp3").toDestination();
var glassE6 = new Tone.Player(glass_sounds + "glassRealE6.mp3").toDestination();
var glassG4 = new Tone.Player(glass_sounds + "glassRealG4.mp3").toDestination();
var glassG6 = new Tone.Player(glass_sounds + "glassRealG6.mp3").toDestination();
var glassD3 = new Tone.Player(vibes_sounds + "vibe_bell-F3.mp3").toDestination();
glassD3.playbackRate = 0.84088; // transpose from F to D
var glassFsharp6 = new Tone.Player(glass_sounds + "glassRealFsharp6.mp3").toDestination();
var glassD5 = new Tone.Player(glass_sounds + "glassRealD5.mp3").toDestination();
var glassD6 = new Tone.Player(glass_sounds + "glassRealD6.mp3").toDestination();
var glassC5 = new Tone.Player(glass_sounds + "glassRealC5.mp3").toDestination();
var glassC6 = new Tone.Player(glass_sounds + "glassRealC6.mp3").toDestination();
var glassC5_thirdFlat = new Tone.Player(glass_sounds + "glassRealC5.mp3").toDestination();
// plays a third tone flat
glassC5_thirdFlat.playbackRate = 0.9809;
var glassC6_thirdFlat = new Tone.Player(glass_sounds + "glassRealC6.mp3").toDestination();
glassC6_thirdFlat.playbackRate = 0.9809;
var glassC5_twoThirdsFlat = new Tone.Player(glass_sounds + "glassRealC5.mp3").toDestination();
// plays 2/3 tone flat
glassC5_twoThirdsFlat.playbackRate = 0.962;
var glassC6_twoThirdsFlat = new Tone.Player(glass_sounds + "glassRealC6.mp3").toDestination();
glassC6_twoThirdsFlat.playbackRate = 0.962;
var glassB4 = new Tone.Player(glass_sounds + "glassRealB4.mp3").toDestination();
var glassB5 = new Tone.Player(glass_sounds + "glassRealB5.mp3").toDestination();

var revGlassC5_7s = new Tone.Player(glass_sounds + "revGlassC5_7s.mp3").toDestination();
// randomized playbackRate yields C5, D5, A5, F#6
var c1_revGlassPitchArray = [1, 1.122, 1.682, 2.828];

var c1_glassArray = [glassE4, glassE5, glassE6, glassE4, glassE5, glassE6, glassG4, glassE5, glassG6, glassD3, glassE5, glassFsharp6, glassD5, glassD6, glassD3, glassD5, glassFsharp6, glassG4, glassC5, glassC6, glassC5_thirdFlat, glassC6_thirdFlat, glassC5_twoThirdsFlat, glassC6_twoThirdsFlat, glassB4, glassB5];

var c1_counter, c1_fadeCounter;
let c1_fade = false;

tm.cue[1] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[1].goCue = function() {
  if (c0_transitionFlag) {
    // piece has looped back around from cue 6 to 1. PLay downbeat sound
    bellSampler.triggerAttackRelease('E6', 5);
    bellSampler.triggerAttackRelease('E7', 5, '+0.2');
    c0_transitionFlag = false;
  }
  c1_counter = c1_fadeCounter = 0;
  c1_fade = false;
  // reset playbackRate, which is changed in cue 5
  glassD3.playbackRate = 0.84088;
  glassE4.playbackRate = 1;
  glassG4.playbackRate = 1;
  glassE5.playbackRate = 1;
  glassD6.playbackRate = 1;
  glassE6.playbackRate = 1;
  glassG6.playbackRate = 1;
  tm.publicMessage('Section 1: Shake your phone to play a sound.');
};
tm.cue[1].triggerShakeSound = function() {
  var thisGlass = c1_glassArray[c1_counter % c1_glassArray.length];
  if (c1_fade) {
    // transition to next cue triggers fade for shake glass sounds, but I can't use .getSectionBreakpoints() because it relies on cue having begun
    if (c1_fadeCounter++ < 6) {
      thisGlass.volume.value = -(c1_fadeCounter * 4);
    } else {
      thisGlass.volume.value = -24;
    }
  } else {
    thisGlass.volume.value = -9;
  }
  thisGlass.start();
  c1_counter++;
};
tm.cue[1].cueTransition = function() {
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 4 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c1_revGlassPitchArray[Math.floor(Math.random() * c1_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  c1_fade = true; // triggers fade of shake sounds during transition
};
tm.cue[1].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 2: tilt sparkly sounds that can be muted when phone is upright
const pingPongFade = new Tone.Volume(0);
const pingPongLoop = new Tone.Player(granulated_sounds + 'pingPongLoop.mp3');
pingPongLoop.chain(pingPongFade, Tone.Destination);
pingPongLoop.loop = true;

const popRocksFade = new Tone.Volume(0);
const popRocksLoop = new Tone.Player(granulated_sounds + 'popRocksLoop.mp3');
popRocksLoop.chain(popRocksFade, Tone.Destination);
popRocksLoop.loop = true;

// randomized playbackRate yields D5, D6
var c2_revGlassPitchArray = [1.122, 2.244];
// randomized pitch for opening bell
let c2_bellPitch = tm.pickRand(['C6', 'C6', 'E6']);

tm.cue[2] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[2].goCue = function() {
  // prevent people from triggering downbeat sound if they stop and start
  if (tm.getElapsedTimeInCue(2) < 500) {
    bellSampler.triggerAttackRelease(c2_bellPitch, 5);
  }
  // mute both loops by default - unmute below
  pingPongLoop.volume.value = -99;
  popRocksLoop.volume.value = -99;
  // additional gain control for fade in, fade out
  pingPongFade.volume.value = -99;
  pingPongLoop.start();
  pingPongFade.volume.rampTo(0, 1.5);
  popRocksFade.volume.value = -99;
  popRocksLoop.start();
  popRocksFade.volume.rampTo(0, 1);
  tm.publicMessage('Section 2: Hold your phone in different positions to play different crunchy sounds. Hold your phone upright to mute it.');
};
tm.cue[2].updateTiltSounds = function() {
  // playback rate can range from quarter speed to four times speed
  pingPongLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  popRocksLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.5) {
    // ping pong audible when device tilted to right
    popRocksLoop.volume.value = -99;
    if (tm.accel.y < 0.5) {
      // volume fades to silence when device is upright
      pingPongLoop.volume.value = -99 + ((tm.accel.y * 2) * 99);
    } else {
      // if device is mostly upright, full volume
      pingPongLoop.volume.value = 0;
    }
  } else {
    pingPongLoop.volume.value = -99;
    if (tm.accel.y < 0.5) {
      // volume fades to silence when device is upright
      popRocksLoop.volume.value = -99 + ((tm.accel.y * 2) * 99);
    } else {
      // if device is mostly upright, full volume
      popRocksLoop.volume.value = 0;
    }
  }
};
tm.cue[2].cueTransition = function() {
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 2 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c2_revGlassPitchArray[Math.floor(Math.random() * c2_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  pingPongFade.volume.rampTo(-48, 3);
  popRocksFade.volume.rampTo(-48, 3);
};
tm.cue[2].stopCue = function() {
  // not called until cue 3 about to start, at which point these are faded out
  pingPongLoop.stop();
  popRocksLoop.stop();
};

// *******************************************************************
// CUE 3: shake-triggered chimes with octaves selected by device position
var chimeA6 = new Tone.Player(chime_sounds + "chimeA6.mp3").toDestination();
var chimeA7 = new Tone.Player(chime_sounds + "chimeA7.mp3").toDestination();

const c3_delay = new Tone.FeedbackDelay({
  delayTime: 0.22,
  feedback: 0.4,
}).toDestination();
const pianoA4 = new Tone.Player(piano_sounds + "piano-3s-A4.mp3").connect(c3_delay);
const pianoA5 = new Tone.Player(piano_sounds + "piano-3s-A5.mp3").connect(c3_delay);

let c3_count = c3_count2 = 0;

// randomized playbackRate yields D5, Ab5, Ab6
var c3_revGlassPitchArray = [1.122, 1.587, 3.175];

tm.cue[3] = new TMCue('shake', 3000, NO_LIMIT);

tm.cue[3].goCue = function() {
  // prevent people from triggering downbeat sound if they stop and start
  if (tm.getElapsedTimeInCue(3) < 500) {
    bellSampler.triggerAttackRelease('D6', 5);
  }
  c3_count = 0;
  chimeA6.volume.value = -20;
  chimeA7.volume.value = -20;
  pianoA4.volume.value = -9;
  pianoA5.volume.value = -9;
  tm.publicMessage('Section 3: Shake your phone to play a chime. Shake your phone upside down to play a piano note with an echo.');
};

tm.cue[3].triggerShakeSound = function() {
  if (tm.accel.y < 0.75) {
    // device is shaken while upright
    // pitch bends down half step over 20s and then goes back up
    let thisChime = (c3_count % 2) ? chimeA7 : chimeA6;
    thisChime.playbackRate = tm.getSectionBreakpointLoop(3, [0,1, 20000,0.944, 40000,1]);
    thisChime.start();
    c3_count++;
  } else {
    // device is upside down
    let thisPiano = (c3_count2 % 2) ? pianoA5 : pianoA4;
    thisPiano.playbackRate = tm.getSectionBreakpointLoop(3, [0,1, 20000,0.944, 40000,1]);
    thisPiano.start();
    c3_count2++;
  }
};
tm.cue[3].cueTransition = function() {
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 3 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c3_revGlassPitchArray[Math.floor(Math.random() * c3_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  chimeA6.volume.rampTo(-60, 3);
  chimeA7.volume.rampTo(-60, 3);
  pianoA4.volume.rampTo(-60, 3);
  pianoA5.volume.rampTo(-60, 3);
};
tm.cue[3].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 4: tilt octaves on D, F, E, A, Bb
var octaveBellsA3 = new Tone.Player(glock_sounds + "octaveBellsA3.mp3").toDestination();
var octaveBellsA3b = new Tone.Player(glock_sounds + "octaveBellsA3.mp3").toDestination();
var octaveBellsA5 = new Tone.Player(glock_sounds + "octaveBellsA5.mp3").toDestination();
var octaveBellsA5b = new Tone.Player(glock_sounds + "octaveBellsA5.mp3").toDestination();
var octaveBellsBb3 = new Tone.Player(glock_sounds + "octaveBellsBb3.mp3").toDestination();
var octaveBellsBb3b = new Tone.Player(glock_sounds + "octaveBellsBb3.mp3").toDestination();
var octaveBellsBb5 = new Tone.Player(glock_sounds + "octaveBellsBb5.mp3").toDestination();
var octaveBellsBb5b = new Tone.Player(glock_sounds + "octaveBellsBb5.mp3").toDestination();
var octaveBellsD3 = new Tone.Player(glock_sounds + "octaveBellsD3.mp3").toDestination();
var octaveBellsD3b = new Tone.Player(glock_sounds + "octaveBellsD3.mp3").toDestination();
var octaveBellsD5 = new Tone.Player(glock_sounds + "octaveBellsD5.mp3").toDestination();
var octaveBellsD5b = new Tone.Player(glock_sounds + "octaveBellsD5.mp3").toDestination();
var octaveBellsE3 = new Tone.Player(glock_sounds + "octaveBellsE3.mp3").toDestination();
var octaveBellsE3b = new Tone.Player(glock_sounds + "octaveBellsE3.mp3").toDestination();
var octaveBellsE5 = new Tone.Player(glock_sounds + "octaveBellsE5.mp3").toDestination();
var octaveBellsE5b = new Tone.Player(glock_sounds + "octaveBellsE5.mp3").toDestination();
var octaveBellsF3 = new Tone.Player(glock_sounds + "octaveBellsF3.mp3").toDestination();
var octaveBellsF3b = new Tone.Player(glock_sounds + "octaveBellsF3.mp3").toDestination();
var octaveBellsF5 = new Tone.Player(glock_sounds + "octaveBellsF5.mp3").toDestination();
var octaveBellsF5b = new Tone.Player(glock_sounds + "octaveBellsF5.mp3").toDestination();
// transition sound
var glassRimD3 = new Tone.Player(glass_sounds + "glassRimRealD3_10s.mp3").toDestination();
// sparkly sound loop (with bandpass filter on y-axis)
var c4_filter = new Tone.Filter(1500, "bandpass").toDestination();
var sugarChimeLoop = new Tone.Player(granulated_sounds + "chimesAndSugarLoop.mp3").connect(c4_filter);
sugarChimeLoop.loop = true;

var c4_hiBellArray = [octaveBellsD5, octaveBellsF5, octaveBellsE5, octaveBellsA5, octaveBellsBb5];
var c4_hiBellArrayb = [octaveBellsD5b, octaveBellsF5b, octaveBellsE5b, octaveBellsA5b, octaveBellsBb5b];
var c4_loBellArray = [octaveBellsD3, octaveBellsF3, octaveBellsE3, octaveBellsA3, octaveBellsBb3];
var c4_loBellArrayb = [octaveBellsD3b, octaveBellsF3b, octaveBellsE3b, octaveBellsA3b, octaveBellsBb3b];

var c4_counter, c4_i, c4_thisBellArray, c4_fadeLock;
// set maximum volume of crunchy sounds here
const c4_sugarChimePeakVol = -9;
// amount to adjust volume with y-axis roll-off
const c4_volFader = (c4_sugarChimePeakVol + 99) * 4;
// cache value of bell array length to avoid computing on each note
const c4_arrLength = c4_hiBellArray.length;

var c4_bellLoop = new Tone.Loop(function(time) {
  // find pitch index from x-axis (tm.accel.x CAN be 1.0, so need to scale)
  c4_i = Math.floor((tm.accel.x * 0.99) * c4_arrLength);
  if (tm.accel.y > 0.5) {
    // high bells when phone flat or upside down
    // alternate buffer to avoid retrigger artifacts
    c4_thisBellArray = (c4_counter % 2) ? c4_hiBellArray : c4_hiBellArrayb;
    c4_thisBellArray[c4_i].start();
  } else if (tm.accel.y > 0.25) {
    // low bells when phone flat or upside down
    c4_thisBellArray = (c4_counter % 2) ? c4_loBellArray : c4_loBellArrayb;
    c4_thisBellArray[c4_i].start();
  } else {
    // no sound when phone mostly upright
  }
  c4_counter++;
}, '16n');

tm.cue[4] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[4].goCue = function() {
  // prevent people from triggering downbeat sound if they stop and start
  if (tm.getElapsedTimeInCue(4) < 500) {
    bellSampler.triggerAttackRelease('D6', 5);
  }
  c4_counter = 0;
  c4_bellLoop.start();
  // sugar chimes have volume control on y-axis, but not during transition fade
  c4_fadeLock = false;
  sugarChimeLoop.volume.value = -99; // start muted or this sounds briefly
  sugarChimeLoop.start();
  tm.publicMessage('Section 4: Hold your phone in different positions to play different bell sounds. Select the note you play by tilting your phone left or right. Play higher bells by tipping your phone upside down. Hold your phone upright to mute it. (There are also sparkly sounds that change based on device position.)');
};
tm.cue[4].updateTiltSounds = function() {
  c4_filter.frequency.value = 50 + tm.accel.y * 12000;
  if (!c4_fadeLock && tm.accel.y < 0.25) {
    // roll off volume only if phone mostly upright. full mute if upright
    sugarChimeLoop.volume.value = -99 + (tm.accel.y * 396);
  } else if (!c4_fadeLock) {
    // full volume if phone not upright AS LONG AS transition is not started
    sugarChimeLoop.volume.value = c4_sugarChimePeakVol;
  }
};
tm.cue[4].cueTransition = function() {
  glassRimD3.playbackRate = (Math.random() > 0.5) ? 2 : 1;
  glassRimD3.start();
  c4_bellLoop.stop();
  c4_fadeLock = true;
  sugarChimeLoop.volume.rampTo(-60, 3);
  sugarChimeLoop.stop('+3');
};
tm.cue[4].stopCue = function() {
  // cueTransition() is not called if user taps "stop"
  // redundant stop methods are for that case
  c4_bellLoop.stop();
  sugarChimeLoop.stop();
};

// *******************************************************************
// CUE 5: shake glass through array
var glassBb5 = new Tone.Player(glass_sounds + "glassRealBb5.mp3").toDestination();

var c5_glassArray = [glassE5, glassG4, glassBb5, glassG6, glassD3, glassD6, glassE5, glassG4, glassBb5, glassG6, glassE4, glassE6, glassE4, glassE6];

var c5_counter, c5_thisGlass;
let c5_fade = false;
let c5_fadeCounter = 0;

tm.cue[5] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[5].goCue = function() {
  c5_counter = c5_fadeCounter = 0;
  tm.publicMessage('Section 5: Shake your phone to play a sound.');
};
tm.cue[5].triggerShakeSound = function() {
  // find next sound in array
  c5_thisGlass = c5_glassArray[c5_counter % c5_glassArray.length];
  // start transposed up major 2nd, bend down over 2.5 minutes
  c5_thisGlass.playbackRate = tm.getSectionBreakpoints(5, [0,1.12246, 30000,1.12246, 150000,1]);
  if (c5_fade) {
    // sounds fade out during transition to next cue
    if (c5_fadeCounter++ < 6) {
      c5_thisGlass.volume.value = -(c5_fadeCounter * 4);
    } else {
      c5_thisGlass.volume.value = -24;
    }
  } else {
    c5_thisGlass.volume.value = -9;
  }
  c5_thisGlass.start();
  c5_counter++;
};
tm.cue[5].cueTransition = function() {
  c5_fade = true; // triggers fade of shake sounds during transition
};
tm.cue[5].stopCue = function() {
};

// *******************************************************************
// CUE 6: struck glass with variable delay on y-axis and pitch in 12 zones
var c6_delay = new Tone.FeedbackDelay({
  // delay time creates triplet effect
  delayTime: 0.5,
  feedback: 0.0
}).toDestination();
// control feedback with yTilt
var c6_delayFeedbackScale = new Tone.Scale(0.0, 0.5);
yTilt.chain(c6_delayFeedbackScale, c6_delay.feedback);

// multiple buffers needed to prevent retrigger artifacts
var glassB3a = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var glassB3b = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var glassB3c = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var glassB3d = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var glassB3e = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var glassB3f = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var glassB3g = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var glassB3h = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c6_delay);
var arrGlassB3 = [glassB3a, glassB3b, glassB3c, glassB3d, glassB3e, glassB3f, glassB3g, glassB3h];

var glassB4a = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c6_delay);
var glassB4b = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c6_delay);
var glassB4c = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c6_delay);
var glassB4d = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c6_delay);
var arrGlassB4 = [glassB4a, glassB4b, glassB4c, glassB4d];

var glassFsharp5a = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c6_delay);
var glassFsharp5b = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c6_delay);
var glassFsharp5c = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c6_delay);
var glassFsharp5d = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c6_delay);
var glassFsharp5e = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c6_delay);
var glassFsharp5f = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c6_delay);
var arrGlassFsharp5 = [glassFsharp5a, glassFsharp5b, glassFsharp5c, glassFsharp5d, glassFsharp5e, glassFsharp5f];

var ziplockClickLoop = new Tone.Player(granulated_sounds + "ziplockClickLoop.mp3").toDestination();
ziplockClickLoop.loop = true;

// array of playbackRates to create pitches: C, D, B, E
var c6_pitchArr = [1.05946, 1.1892, 1, 1.3348];
var c6_thisGlass, c6_counter;

// array of pitches for final transition sound (wrapping back to beginning)
c6_revGlassPitchArray = [0.94387, 1.8877, 3.7755];

var c6_glassLoop = new Tone.Loop(function(time) {
  if (tm.accel.y < 0.25) {
    // no sound trigger if phone upright (still controls delay time)
    return;
  } else if (tm.accel.y < 0.5) {
    // trigger lowest glass sound
    c6_thisGlass = arrGlassB3[c6_counter % arrGlassB3.length];
  } else if (tm.accel.y < 0.75) {
    // trigger mid glass sound
    c6_thisGlass = arrGlassB4[c6_counter % arrGlassB4.length];
  } else {
    // trigger highest glass sound
    c6_thisGlass = arrGlassFsharp5[c6_counter % arrGlassFsharp5.length];
  }
  // select pitch on y-axis by referencing pitch array (scale tm.accel.x first)
  c6_thisGlass.playbackRate = c6_pitchArr[Math.floor((tm.accel.x * 0.99) * c6_pitchArr.length)];
  c6_thisGlass.volume.value = -3;
  c6_thisGlass.start();
  c6_counter++;
}, 0.375);

tm.cue[6] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[6].goCue = function() {
  c6_counter = 0;
  c6_glassLoop.start();
  ziplockClickLoop.volume.value = -99;
  ziplockClickLoop.start();
  tm.publicMessage('Section 6: Hold your phone in different positions to play different bouncing sounds. Select the note you play by tilting your phone left or right. Play higher sounds by tipping your phone upside down. Hold your phone upright to mute it. (There are also clicking sounds that change based on device position.)');
  // set flag to enable transition sounds back to cue 1 after loop
  c0_transitionFlag = true;
};
tm.cue[6].updateTiltSounds = function() {
  // soft clicking sound with speed and volume on y-axis
  ziplockClickLoop.playbackRate = 0.1 + tm.accel.y * 3.9;
  ziplockClickLoop.volume.value = -65 + (tm.accel.y * 65);
};
tm.cue[6].cueTransition = function() {
  // This is only called when going to coda, not looping back to cue 1
  c6_glassLoop.stop();
  ziplockClickLoop.stop();
};
tm.cue[6].stopCue = function() {
  c6_glassLoop.stop();
  ziplockClickLoop.stop();
};

// *******************************************************************
// CUE 7: CODA only accessible through private server - play at end of perf.
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
// same chime sounds starting at 2 oct lower playback rate and bending up
var chLoP4 = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
// use fade out to prevent clicking at end of sound
chLoP4.fadeOut = 5;
var chLoP4b = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toDestination();
chLoP4b.fadeOut = 5;
var chLoP6 = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
chLoP6.fadeOut = 5;
var chLoP6b = new Tone.Player(chime_sounds + "chimeBeats1320Hz.mp3").toDestination();
chLoP6b.fadeOut = 5;
var chLoP7 = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
chLoP7.fadeOut = 5;
var chLoP7b = new Tone.Player(chime_sounds + "chimeBeats1540Hz.mp3").toDestination();
chLoP7b.fadeOut = 5;
var chLoP10b = new Tone.Player(chime_sounds + "chimeBeats2200Hz.mp3").toDestination();
chLoP10b.fadeOut = 5;
var chLoP13 = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
chLoP13.fadeOut = 5;
var chLoP13b = new Tone.Player(chime_sounds + "chimeBeats2860Hz.mp3").toDestination();
chLoP13b.fadeOut = 5;
var chLoP14 = new Tone.Player(chime_sounds + "chimeBeats3080Hz.mp3").toDestination();
chLoP14.fadeOut = 5;

var c7_drop = new Tone.Player(misc_sounds + "finalDrop.mp3").toDestination();

var c7_chimeArr = [chP10, chP7, chP14, chP4, chP13, chP6, chP4b, chP6b, chP10b, chP13b, chP7b];
// array of playback rates that represent targets of pitch bends
var c7_chBendArr = [1.031786, 1.020448, 1.07714, 0.9921, 1.03789, 1.05824, 0.9921, 1.05824, 1.031786, 1.03789, 1.020448];
var c7_chLoArr = [chLoP7, chLoP14, chLoP4, chLoP13, chLoP6, chLoP4b, chLoP6b, chLoP10b, chLoP13b];
// low chimes start 2 oct lower but bend up to 1 oct lower than high chimes
var c7_chLoBendArr = [0.510224, 0.53857, 0.49605, 0.518945, 0.52912, 0.49605, 0.52912, 0.515893, 0.518945];

var c7_chCount, c7_chIndex, c7_thisCh, c7_chLoIndex, c7_thisLoCh;
var c7_chArrLen = c7_chimeArr.length;
var c7_chLoArrLen = c7_chLoArr.length;

tm.cue[7] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[7].goCue = function() {
  c7_drop.start();
  c7_chCount = 0;
  c7_chLoCount = 0;
  Tone.Draw.schedule(function() {
    tm.publicMessage('3');
  }, '+0');
  Tone.Draw.schedule(function() {
    tm.publicMessage('2');
  }, '+1');
  Tone.Draw.schedule(function() {
    tm.publicMessage('1');
  }, '+2');
  Tone.Draw.schedule(function() {
    tm.publicMessage('Section 7: Shake your phone to play a sound.');
  }, '+3');
};
tm.cue[7].triggerShakeSound = function() {
  // no sound until final "drop" sound 3.25 seconds into cue
  if (tm.getElapsedTimeInCue(7) > 3250) {
    // set pitch and properties of lower chime
    c7_chLoIndex = c7_chCount % c7_chLoArrLen;
    c7_thisLoCh = c7_chLoArr[c7_chLoIndex];
    // TODO: decide on exact durations of pitch bend breakpoints
    c7_thisLoCh.playbackRate = tm.getSectionBreakpoints(7, [0,0.25, 15000,0.25, 45000,c7_chLoBendArr[c7_chLoIndex]]);
    c7_thisLoCh.volume.value = -9;
    c7_thisLoCh.start();
    // set pitch and properties of higher chime triggered just after low
    c7_chIndex = c7_chCount % c7_chArrLen;
    c7_thisCh = c7_chimeArr[c7_chIndex];
    c7_thisCh.playbackRate = tm.getSectionBreakpoints(7, [0,1, 15000,1, 45000,c7_chBendArr[c7_chIndex]]);
    c7_thisCh.volume.value = -12;
    c7_thisCh.start('+0.05');
    // increment counter used by BOTH chime layers
    c7_chCount++;
  }
};
tm.cue[7].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 8: turn off all sound (only accessible through private server)
tm.cue[8] = new TMCue('finished', -1);
tm.cue[8].goCue = function() {
  // nothing to do here
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9: tacet and shouldn't be used, but here to avoid errors
tm.cue[9] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[9].goCue = function() {
  // nothing to play
};
tm.cue[9].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// Tutorial cues are below. In concert, I need to cue server directly to cue 10, while cue 9 is used by non-interactive site for final sounds
// *******************************************************************
// CUE 10: piece is in "waiting" state by default
tm.cue[10] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[10].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[10].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 11: SHAKE tutorial
const clave = new Tone.Player(perc_sounds + 'clave.mp3').toDestination();
clave.volume.value = -18;

tm.cue[11] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[11].goCue = function() {
  // nothing to do until shake gestures
};
tm.cue[11].triggerShakeSound = function() {
  clave.start();
};
tm.cue[11].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 12: tacet tutorial
tm.cue[12] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[12].goCue = function() {
  // nothing to play
};
tm.cue[12].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 13: TILT tutorial (volume and timbre on y-axis, pitch on x-axis)
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

let tiltPitchArr_tut = ['E4', 'E4', 'B4', 'E5', 'E5', 'F#5', 'G#5', 'A#5', 'B5']
let len_tut = tiltPitchArr_tut.length;
tm.cue[13] = new TMCue('tilt', 0, NO_LIMIT);
tm.cue[13].goCue = function() {
  fmSynth.volume.value = -99;
  fmSynth.triggerAttack('E4');
};
tm.cue[13].updateTiltSounds = function() {
  fmSynth.frequency.value = tiltPitchArr_tut[Math.floor(tm.accel.x * 0.99 * len_tut)];
  let fmSynVol;
  if (tm.accel.y < 0.25) {
    // set volume with rampTo to avoid zipper noise
    fmSynVol = -18 - (0.25 - tm.accel.y) * 324; // -99 to -18 dB
    fmSynth.volume.rampTo(fmSynVol, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 1.5 - (0.25 - tm.accel.y) * 2; // 1 to 1.5
  } else if (tm.accel.y < 0.5) {
    fmSynth.volume.rampTo(-18, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 4 - (0.5 - tm.accel.y) * 10; // 1.5 to 4
  } else if (tm.accel.y < 0.75) {
    fmSynVol = -12 - (0.75 - tm.accel.y) * 24; // -18 to -12 dB
    fmSynth.volume.rampTo(fmSynVol, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 6 - (0.75 - tm.accel.y) * 8; // 4 to 6
  } else {
    fmSynth.volume.rampTo(-12, tm.motionUpdateInSeconds);
    fmSynth.modulationIndex.value = 8 - (1.0 - tm.accel.y) * 8; // 6 to 8
  }
};
tm.cue[13].stopCue = function() {
  fmSynth.triggerRelease();
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
