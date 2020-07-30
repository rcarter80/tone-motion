const tm = new ToneMotion();
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
const glock_sounds = 'tonemotion-shared/audio/glockenspiel/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const perc_sounds = 'tonemotion-shared/audio/perc/';

Tone.Transport.bpm.value = 60;
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
// CUE 0: First section (struck glass sounds)
var glassE4 = new Tone.Player(glass_sounds + "glassRealE4.mp3").toMaster();
var glassE5 = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
var glassE6 = new Tone.Player(glass_sounds + "glassRealE6.mp3").toMaster();
var glassG4 = new Tone.Player(glass_sounds + "glassRealG4.mp3").toMaster();
var glassG6 = new Tone.Player(glass_sounds + "glassRealG6.mp3").toMaster();
var glassD3 = new Tone.Player(glass_sounds + "glassRealD3.mp3").toMaster();
var glassFsharp6 = new Tone.Player(glass_sounds + "glassRealFsharp6.mp3").toMaster();
var glassD5 = new Tone.Player(glass_sounds + "glassRealD5.mp3").toMaster();
var glassD6 = new Tone.Player(glass_sounds + "glassRealD6.mp3").toMaster();
var glassC5 = new Tone.Player(glass_sounds + "glassRealC5.mp3").toMaster();
var glassC6 = new Tone.Player(glass_sounds + "glassRealC6.mp3").toMaster();
var glassC5_thirdFlat = new Tone.Player(glass_sounds + "glassRealC5.mp3").toMaster();
// plays a third tone flat
glassC5_thirdFlat.playbackRate = 0.9809;
var glassC6_thirdFlat = new Tone.Player(glass_sounds + "glassRealC6.mp3").toMaster();
glassC6_thirdFlat.playbackRate = 0.9809;
var glassC5_twoThirdsFlat = new Tone.Player(glass_sounds + "glassRealC5.mp3").toMaster();
// plays 2/3 tone flat
glassC5_twoThirdsFlat.playbackRate = 0.962;
var glassC6_twoThirdsFlat = new Tone.Player(glass_sounds + "glassRealC6.mp3").toMaster();
glassC6_twoThirdsFlat.playbackRate = 0.962;
var glassB4 = new Tone.Player(glass_sounds + "glassRealB4.mp3").toMaster();
var glassB5 = new Tone.Player(glass_sounds + "glassRealB5.mp3").toMaster();

var revGlassC5_7s = new Tone.Player(glass_sounds + "revGlassC5_7s.mp3").toMaster();
// randomized playbackRate yields F#4, C5, D5, A5
var c0_revGlassPitchArray = [1, 1.122, 1.682, 2.828];

var c0_glassArray = [glassE4, glassE5, glassE6, glassE4, glassE5, glassE6, glassG4, glassE5, glassG6, glassD3, glassE5, glassFsharp6, glassD5, glassD6, glassD3, glassD5, glassFsharp6, glassG4, glassC5, glassC6, glassC5_thirdFlat, glassC6_thirdFlat, glassC5_twoThirdsFlat, glassC6_twoThirdsFlat, glassB4, glassB5];

var c0_counter;

tm.cue[0] = new TMCue('shake', 3000, NO_LIMIT);

tm.cue[0].goCue = function() {
  c0_counter = 0;
  tm.publicMessage('Section 0: Shake your phone to play a sound.');
};

tm.cue[0].triggerShakeSound = function() {
  c0_glassArray[c0_counter % c0_glassArray.length].start();
  c0_counter++;
};

tm.cue[0].stopCue = function() {
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 4 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c0_revGlassPitchArray[Math.floor(Math.random() * c0_revGlassPitchArray.length)];
  revGlassC5_7s.start();
};

// *******************************************************************
// CUE 1: tilt sparkly sounds that can be muted when phone is upright
var pingPongLoop = new Tone.Player(granulated_sounds + 'pingPongLoop.mp3').toMaster();
pingPongLoop.loop = true;

var popRocksLoop = new Tone.Player(granulated_sounds + 'popRocksLoop.mp3').toMaster();
popRocksLoop.loop = true;

// randomized playbackRate yields D5, D6
var c1_revGlassPitchArray = [1.122, 2.244];

tm.cue[1] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[1].goCue = function() {
  // mute both loops by default - unmute below
  pingPongLoop.volume.value = -99;
  popRocksLoop.volume.value = -99;
  pingPongLoop.start();
  popRocksLoop.start();
  tm.publicMessage('Section 1: Hold your phone in different positions to play different crunchy sounds. Hold your phone upright to mute it.');
};
tm.cue[1].updateTiltSounds = function() {
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
tm.cue[1].stopCue = function() {
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 2 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c1_revGlassPitchArray[Math.floor(Math.random() * c1_revGlassPitchArray.length)];
  revGlassC5_7s.start();
  pingPongLoop.stop();
  popRocksLoop.stop();
};

// *******************************************************************
// CUE 2: shake-triggered chimes with octaves selected by device position
var chimeA6 = new Tone.Player(chime_sounds + "chimeA6.mp3").toMaster();
var chimeA7 = new Tone.Player(chime_sounds + "chimeA7.mp3").toMaster();

// randomized playbackRate yields D5, Ab5, Ab6
var c2_revGlassPitchArray = [1.122, 1.587, 3.175];

tm.cue[2] = new TMCue('shake', 3000, NO_LIMIT);

tm.cue[2].goCue = function() {
  chimeA6.volume.value = -12;
  chimeA7.volume.value = -12;
  tm.publicMessage('Section 2: Shake your phone to play a chime. Shake your phone upside down to play a lower chime.');
};

tm.cue[2].triggerShakeSound = function() {
  if (tm.accel.y < 0.5) {
    // device is shaken while mostly upright
    // pitch bends down half step over 20s and then goes back up
    chimeA7.playbackRate = tm.getSectionBreakpointLoop(2, [0,1, 20000,0.944, 40000,1]);
    chimeA7.start();
  } else {
    // device is mostly upside down
    chimeA6.playbackRate = tm.getSectionBreakpointLoop(2, [0,1, 20000,0.97, 40000,1]);
    chimeA6.start();
  }
};

tm.cue[2].stopCue = function() {
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 3 possible pitches for reversed glass sound
  revGlassC5_7s.playbackRate = c2_revGlassPitchArray[Math.floor(Math.random() * c2_revGlassPitchArray.length)];
  revGlassC5_7s.start();
};

// *******************************************************************
// CUE 3: tilt octaves on D, F, E, A, Bb
var octaveBellsA3 = new Tone.Player(glock_sounds + "octaveBellsA3.mp3").toMaster();
var octaveBellsA3b = new Tone.Player(glock_sounds + "octaveBellsA3.mp3").toMaster();
var octaveBellsA5 = new Tone.Player(glock_sounds + "octaveBellsA5.mp3").toMaster();
var octaveBellsA5b = new Tone.Player(glock_sounds + "octaveBellsA5.mp3").toMaster();
var octaveBellsBb3 = new Tone.Player(glock_sounds + "octaveBellsBb3.mp3").toMaster();
var octaveBellsBb3b = new Tone.Player(glock_sounds + "octaveBellsBb3.mp3").toMaster();
var octaveBellsBb5 = new Tone.Player(glock_sounds + "octaveBellsBb5.mp3").toMaster();
var octaveBellsBb5b = new Tone.Player(glock_sounds + "octaveBellsBb5.mp3").toMaster();
var octaveBellsD3 = new Tone.Player(glock_sounds + "octaveBellsD3.mp3").toMaster();
var octaveBellsD3b = new Tone.Player(glock_sounds + "octaveBellsD3.mp3").toMaster();
var octaveBellsD5 = new Tone.Player(glock_sounds + "octaveBellsD5.mp3").toMaster();
var octaveBellsD5b = new Tone.Player(glock_sounds + "octaveBellsD5.mp3").toMaster();
var octaveBellsE3 = new Tone.Player(glock_sounds + "octaveBellsE3.mp3").toMaster();
var octaveBellsE3b = new Tone.Player(glock_sounds + "octaveBellsE3.mp3").toMaster();
var octaveBellsE5 = new Tone.Player(glock_sounds + "octaveBellsE5.mp3").toMaster();
var octaveBellsE5b = new Tone.Player(glock_sounds + "octaveBellsE5.mp3").toMaster();
var octaveBellsF3 = new Tone.Player(glock_sounds + "octaveBellsF3.mp3").toMaster();
var octaveBellsF3b = new Tone.Player(glock_sounds + "octaveBellsF3.mp3").toMaster();
var octaveBellsF5 = new Tone.Player(glock_sounds + "octaveBellsF5.mp3").toMaster();
var octaveBellsF5b = new Tone.Player(glock_sounds + "octaveBellsF5.mp3").toMaster();
// transition sound
var glassRimD3 = new Tone.Player(glass_sounds + "glassRimRealD3_10s.mp3").toMaster();
// sparkly sound loop (with bandpass filter on y-axis)
var c3_filter = new Tone.Filter(1500, "bandpass").toMaster();
var sugarChimeLoop = new Tone.Player(granulated_sounds + "chimesAndSugarLoop.mp3").connect(c3_filter);
sugarChimeLoop.loop = true;

var c3_hiBellArray = [octaveBellsD5, octaveBellsF5, octaveBellsE5, octaveBellsA5, octaveBellsBb5];
var c3_hiBellArrayb = [octaveBellsD5b, octaveBellsF5b, octaveBellsE5b, octaveBellsA5b, octaveBellsBb5b];
var c3_loBellArray = [octaveBellsD3, octaveBellsF3, octaveBellsE3, octaveBellsA3, octaveBellsBb3];
var c3_loBellArrayb = [octaveBellsD3b, octaveBellsF3b, octaveBellsE3b, octaveBellsA3b, octaveBellsBb3b];

var c3_counter, c3_i, c3_thisBellArray, c3_fadeLock;
// set maximum volume of crunchy sounds here
const c3_sugarChimePeakVol = -9;
// amount to adjust volume with y-axis roll-off
const c3_volFader = (c3_sugarChimePeakVol + 99) * 4;
// cache value of bell array length to avoid computing on each note
const c3_arrLength = c3_hiBellArray.length;

var c3_bellLoop = new Tone.Loop(function(time) {
  // find pitch index from x-axis (tm.accel.x CAN be 1.0, so need to scale)
  c3_i = Math.floor((tm.accel.x * 0.99) * c3_arrLength);
  if (tm.accel.y > 0.5) {
    // high bells when phone flat or upside down
    // alternate buffer to avoid retrigger artifacts
    c3_thisBellArray = (c3_counter % 2) ? c3_hiBellArray : c3_hiBellArrayb;
    c3_thisBellArray[c3_i].start();
  } else if (tm.accel.y > 0.25) {
    // low bells when phone flat or upside down
    c3_thisBellArray = (c3_counter % 2) ? c3_loBellArray : c3_loBellArrayb;
    c3_thisBellArray[c3_i].start();
  } else {
    // no sound when phone mostly upright
  }
  c3_counter++;
}, '16n');

tm.cue[3] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[3].goCue = function() {
  c3_counter = 0;
  c3_bellLoop.start();
  // sugar chimes have volume control on y-axis, but not during transition fade
  c3_fadeLock = false;
  sugarChimeLoop.volume.value = c3_sugarChimePeakVol;
  sugarChimeLoop.start();
  tm.publicMessage('Section 3: Hold your phone in different positions to play different bell sounds. Select the note you play by tilting your phone left or right. Play higher bells by tipping your phone upside down. Hold your phone upright to mute it. (There are also sparkly sounds that change based on device position.)');
};
tm.cue[3].updateTiltSounds = function() {
  c3_filter.frequency.value = 50 + tm.accel.y * 12000;
  if (!c3_fadeLock && tm.accel.y < 0.25) {
    // roll of volume only if phone mostly upright. full mute if upright
    sugarChimeLoop.volume.value = -99 + (tm.accel.y * 396);
  } else if (!c3_fadeLock) {
    // full volume if phone not upright AS LONG AS transition is not started
    sugarChimeLoop.volume.value = c3_sugarChimePeakVol;
  }
};
tm.cue[3].stopCue = function() {
  glassRimD3.playbackRate = (Math.random() > 0.5) ? 2 : 1;
  glassRimD3.start();
  c3_bellLoop.stop();
  c3_fadeLock = true;
  sugarChimeLoop.volume.rampTo(-60, 3);
  sugarChimeLoop.stop('+3');
};

// *******************************************************************
// CUE 4: shake glass through array
var glassBb5 = new Tone.Player(glass_sounds + "glassRealBb5.mp3").toMaster();

var c4_glassArray = [glassE5, glassG4, glassBb5, glassG6, glassD3, glassD6, glassE5, glassG4, glassBb5, glassG6, glassE4, glassE6, glassE4, glassE6];

var c4_counter, c4_thisGlass;

tm.cue[4] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[4].goCue = function() {
  c4_counter = 0;
  tm.publicMessage('Section 4: Shake your phone to play a sound.');
};
tm.cue[4].triggerShakeSound = function() {
  // find next sound in array
  c4_thisGlass = c4_glassArray[c4_counter % c4_glassArray.length];
  // start transposed up major 2nd, bend down over 2.5 minutes
  c4_thisGlass.playbackRate = tm.getSectionBreakpoints(4, [0,1.12246, 30000,1.12246, 150000,1]);
  c4_thisGlass.start();
  c4_counter++;
};
tm.cue[4].stopCue = function() {
};

// *******************************************************************
// CUE 5: struck glass with variable delay on y-axis and pitch in 12 zones
var c5_delay = new Tone.FeedbackDelay({
  // delay time creates triplet effect
  delayTime: 0.5,
  feedback: 0.0
}).toMaster();
// control feedback with yTilt
var c5_delayFeedbackScale = new Tone.Scale(0.0, 0.5);
yTilt.chain(c5_delayFeedbackScale, c5_delay.feedback);

// multiple buffers needed to prevent retrigger artifacts
var glassB3a = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var glassB3b = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var glassB3c = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var glassB3d = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var glassB3e = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var glassB3f = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var glassB3g = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var glassB3h = new Tone.Player(glass_sounds + "glassRealB3_5s.mp3").connect(c5_delay);
var arrGlassB3 = [glassB3a, glassB3b, glassB3c, glassB3d, glassB3e, glassB3f, glassB3g, glassB3h];

var glassB4a = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c5_delay);
var glassB4b = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c5_delay);
var glassB4c = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c5_delay);
var glassB4d = new Tone.Player(glass_sounds + "glassRealSmallB4_2s.mp3").connect(c5_delay);
var arrGlassB4 = [glassB4a, glassB4b, glassB4c, glassB4d];

var glassFsharp5a = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c5_delay);
var glassFsharp5b = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c5_delay);
var glassFsharp5c = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c5_delay);
var glassFsharp5d = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c5_delay);
var glassFsharp5e = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c5_delay);
var glassFsharp5f = new Tone.Player(glass_sounds + "slushyBentGlassFsharp5.mp3").connect(c5_delay);
var arrGlassFsharp5 = [glassFsharp5a, glassFsharp5b, glassFsharp5c, glassFsharp5d, glassFsharp5e, glassFsharp5f];

var ziplockClickLoop = new Tone.Player(granulated_sounds + "ziplockClickLoop.mp3").toMaster();
ziplockClickLoop.loop = true;

// array of playbackRates to create pitches: C, D, B, E
var c5_pitchArr = [1.05946, 1.1892, 1, 1.3348];
var c5_thisGlass, c5_counter;

// array of pitches for final transition sound (wrapping back to beginning)
c5_revGlassPitchArray = [0.94387, 1.8877, 3.7755];

var c5_glassLoop = new Tone.Loop(function(time) {
  if (tm.accel.y < 0.25) {
    // no sound trigger if phone upright (still controls delay time)
    return;
  } else if (tm.accel.y < 0.5) {
    // trigger lowest glass sound
    c5_thisGlass = arrGlassB3[c5_counter % arrGlassB3.length];
  } else if (tm.accel.y < 0.75) {
    // trigger mid glass sound
    c5_thisGlass = arrGlassB4[c5_counter % arrGlassB4.length];
  } else {
    // trigger highest glass sound
    c5_thisGlass = arrGlassFsharp5[c5_counter % arrGlassFsharp5.length];
  }
  // select pitch on y-axis by referencing pitch array (scale tm.accel.x first)
  c5_thisGlass.playbackRate = c5_pitchArr[Math.floor((tm.accel.x * 0.99) * c5_pitchArr.length)];
  c5_thisGlass.start();
  c5_counter++;
}, 0.375);

tm.cue[5] = new TMCue('tilt', 3000, NO_LIMIT);
tm.cue[5].goCue = function() {
  c5_counter = 0;
  // if I need to reset volume because it was changed, there are LOTS to reset
  c5_glassLoop.start();
  ziplockClickLoop.start();
  tm.publicMessage('Section 5: Hold your phone in different positions to play different bouncing sounds. Select the note you play by tilting your phone left or right. Play higher sounds by tipping your phone upside down. Hold your phone upright to mute it. (There are also clicking sounds that change based on device position.)');
};
tm.cue[5].updateTiltSounds = function() {
  // soft clicking sound with speed and volume on y-axis
  ziplockClickLoop.playbackRate = 0.1 + tm.accel.y * 3.9;
  ziplockClickLoop.volume.value = -65 + (tm.accel.y * 65);
};
tm.cue[5].stopCue = function() {
  c5_glassLoop.stop();
  ziplockClickLoop.stop();
  revGlassC5_7s.volume.value = -9;
  // randomly select 1 of 3 possible octaves for reversed glass sound
  revGlassC5_7s.playbackRate = c5_revGlassPitchArray[Math.floor(Math.random() * c5_revGlassPitchArray.length)];
  revGlassC5_7s.start();
};

// *******************************************************************
// CUE 6: CODA only accessible through private server - play at end of perf.
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

// TODO: add duplicate Players for low chime layer, but define octave shift and pitch bend in SEPARATE bend array, not here. still need to add fadeOut to all to prevent tail click
var chLoP4 = new Tone.Player(chime_sounds + "chimeBeats880Hz.mp3").toMaster();
chLoP4.playbackRate = 0.25;
chLoP4.fadeOut = 5;

var c6_chimeArr = [chP10, chP7, chP14, chP4, chP13, chP6, chP4b, chP6b, chP10b, chP13b, chP7b];

var c6_chCount, c6_chIndex, c6_thisCh;
var c6_chArrLen = c6_chimeArr.length;

tm.cue[6] = new TMCue('shake', 3000, NO_LIMIT);
tm.cue[6].goCue = function() {
  c6_chCount = 0;
  // OPTIMIZE: there might be a better way to schedule timed messages
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
    tm.publicMessage('INSTRUCTIONS GO HERE');
  }, '+3');
};
tm.cue[6].triggerShakeSound = function() {
  // no sound until final "drop" sound 3.25 seconds into cue
  if (tm.getElapsedTimeInCue(6) > 3250) {
    c6_chIndex = c6_chCount % c6_chArrLen;
    c6_thisCh = c6_chimeArr[c6_chIndex];
    // TODO: add pitch bend with breakpoints that I haven't decided on yet
    c6_thisCh.start();
    c6_chCount++;
    glassE4.start();

// TODO: add separate counter, array, etc. for low chime (phasing) layer. and add high synth on every 12(?) interations
    chLoP4.start();
  }
};
tm.cue[6].stopCue = function() {
  // nothing to clean up
};

// TODO: increment cue numbers to make room for CODA
// *******************************************************************
// CUE 7: tilt tutorial (available to use in performance)
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
tm.cue[7] = new TMCue('tilt', -1);
tm.cue[7].goCue = function() {
  testTone.triggerAttack(440);
}
tm.cue[7].updateTiltSounds = function() {
  // interactivity handled through tm.xTilt and yTilt signals
}
tm.cue[7].stopCue = function() {
  testTone.triggerRelease();
}

// *******************************************************************
// CUE 8: tacet tutorial
tm.cue[8] = new TMCue('tacet', -1);
tm.cue[8].goCue = function() {
  // nothing to play
}
tm.cue[8].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 9: shake tutorial
var cowbell = new Tone.Player(perc_sounds + 'cowbell.mp3').toMaster();
tm.cue[9] = new TMCue('shake', -1);
tm.cue[9].goCue = function() {
  // nothing to do until shake gestures
};
tm.cue[9].triggerShakeSound = function() {
  cowbell.start();
};
tm.cue[9].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 10: tacet cue (use to end tutorial - can then trigger cue -1 to wait)
tm.cue[10] = new TMCue('tacet', -1);
tm.cue[10].goCue = function() {
  // nothing to play
}
tm.cue[10].stopCue = function() {
  // nothing to clean up
}
