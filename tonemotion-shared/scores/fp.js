const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  // TODO: create SNM server and use instead of JACK server
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

// Shortcuts to audio file paths
const glass_sounds = 'tonemotion-shared/audio/glass/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const plucked_sounds = 'tonemotion-shared/audio/plucked/';
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
const piano_sounds = 'tonemotion-shared/audio/piano/';
const misc_sounds = 'tonemotion-shared/audio/misc/';

Tone.Transport.bpm.value = 72;
const semitoneUp = 2 ** (1/12);
const semitoneDown = 1 / semitoneUp;
const bendUp = semitoneUp - 1;
const bendDown = 1 - semitoneDown;

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
// CUE 6 [A] glass sounds (getting softer), then one chime, then lower plucked
var glE4 = new Tone.Player(glass_sounds + "glassRealE4.mp3").toMaster();
var glF4 = new Tone.Player(glass_sounds + "glassRealF4.mp3").toMaster();
var glA4 = new Tone.Player(glass_sounds + "glassRealA4.mp3").toMaster();
var glB4 = new Tone.Player(glass_sounds + "glassRealB4.mp3").toMaster();
var glC5 = new Tone.Player(glass_sounds + "glassRealC5.mp3").toMaster();
var glE5 = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
// duplicate file to avoid retriggering artifacts
var glE5b = new Tone.Player(glass_sounds + "glassRealE5.mp3").toMaster();
var glF5 = new Tone.Player(glass_sounds + "glassRealF5.mp3").toMaster();
var glA5 = new Tone.Player(glass_sounds + "glassRealA5.mp3").toMaster();
var glB5 = new Tone.Player(glass_sounds + "glassRealB5.mp3").toMaster();
var glC6 = new Tone.Player(glass_sounds + "glassRealC6.mp3").toMaster();
var glE6 = new Tone.Player(glass_sounds + "glassRealE6.mp3").toMaster();
var chimeD7 = new Tone.Player(chime_sounds + "2sec-chime-D7.mp3").toMaster();
var pluckedD3 = new Tone.Player(plucked_sounds + "pluckedD3.mp3").toMaster();
var pluckedD4 = new Tone.Player(plucked_sounds + "pluckedD4.mp3").toMaster();
var pluckedD4b = new Tone.Player(plucked_sounds + "pluckedD4.mp3").toMaster();
var pluckedD5 = new Tone.Player(plucked_sounds + "pluckedD5.mp3").toMaster();
var pluckedF3 = new Tone.Player(plucked_sounds + "pluckedF3.mp3").toMaster();
var pluckedF4 = new Tone.Player(plucked_sounds + "pluckedF4.mp3").toMaster();
var pluckedF4b = new Tone.Player(plucked_sounds + "pluckedF4.mp3").toMaster();
var pluckedF5 = new Tone.Player(plucked_sounds + "pluckedF5.mp3").toMaster();
var riser = new Tone.Player(misc_sounds + "revHatRiser.mp3").toMaster();

// array of initial glass sounds for first part of cue
var glassArr_c6 = [glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b];
// second array of sounds (no fade out)
var chimeArr_c6 = [chimeD7, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b];
// final array of sounds to keep looping
var pluckedArr_c6 = [pluckedF3, pluckedF4, pluckedF5, pluckedF4b];

var counter_c6 = 0;
var thisVol_c6, thisBend_c6, thisGlass_c6, thisPluck_c6, loopCount_c6, step_c6;

// 1667 ms. = 2 beats @ 72bpm
tm.cue[6] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[6].goCue = function() {
  // reset tempo just in case cue 15 was last triggered (and tempo changed)
  Tone.Transport.bpm.value = 72;
  counter_c6 = 0;
};
tm.cue[6].triggerShakeSound = function() {
  if (counter_c6 < glassArr_c6.length) {
    // glass sounds fade from 0dBfs to -24dBfs over course of array
    thisVol_c6 = -((counter_c6 / 59) * 24);
    thisGlass_c6 = glassArr_c6[counter_c6];
    thisGlass_c6.volume.value = thisVol_c6;
    thisGlass_c6.start();
  } else if (counter_c6 < (glassArr_c6.length + chimeArr_c6.length)) {
    chimeArr_c6[(counter_c6 - glassArr_c6.length)].start();
  } else {
    loopCount_c6 = counter_c6 - glassArr_c6.length - chimeArr_c6.length;
    // plucked sounds fade from 0dBfs to -24dBfs over course of array
    if (loopCount_c6 < 60) {
      // step_c6 counts from 0.0 to 1.0
      step_c6 = loopCount_c6 / 59;
      thisVol_c6 = -(step_c6 * 24);
      thisBend_c6 = 1 - (step_c6 * bendDown);
    } else {
      thisVol_c6 = -24;
      thisBend_c6 = semitoneDown;
    }
    thisPluck_c6 = pluckedArr_c6[loopCount_c6 % pluckedArr_c6.length];
    thisPluck_c6.volume.value = thisVol_c6;
    thisPluck_c6.playbackRate = thisBend_c6;
    thisPluck_c6.start();
  }
  counter_c6++;
};
tm.cue[6].stopCue = function() {
  riser.start();
};

// *******************************************************************
// CUE 7 [B] two pitch layers of FM synths with toggling LFO on amplitude
var fmSynth_c7 = new Tone.FMSynth({
  harmonicity: 1.5,
  envelope: {
    attack: 2,
    decay: 0,
    sustain: 1,
    release: 2,
  },
  modulation: {
    type: 'sine',
  },
  modulationEnvelope: {
    attack: 0.1,
    decay: 0,
    sustain: 1,
    release: 2,
  },
});
fmSynth_c7.oscillator.partials = [1, 0.5, 0, 0.25, 0, 0, 0, 0.125];
var peakVol_c7 = -3;
var lfo_c7 = new Tone.LFO('32n', -99, peakVol_c7);
lfo_c7.connect(fmSynth_c7.volume);
// additional gain stage on y-axis
var synthMult_c7 = new Tone.Multiply().toMaster();
yTilt.connect(synthMult_c7, 0, 0);
fmSynth_c7.connect(synthMult_c7, 0, 1);

var loArr_c7 = ['E3', 'E3', 'E3', 'E3', 'E3', 'E3', 'B2', 'B2', 'B2', 'C3', 'C3', 'C3', 'A2', 'A2', 'A2', 'B2', 'B2', 'B2', 'G2', 'G2', 'G2', 'G2', 'G2', 'G2'];

var counter_c7 = 0;

var loop_c7 = new Tone.Loop(function(time) {
  // only one actual note is played, but note is reset here
  fmSynth_c7.setNote(loArr_c7[counter_c7 % loArr_c7.length]);
  if (counter_c7 === 18) {
    // G2 bends down to F
    fmSynth_c7.detune.rampTo(-200, 15);
  }
  counter_c7++;
},'2n.');
// goes through pitch array only once, then holds on last pitch
loop_c7.iterations = loArr_c7.length;

// cue triggered 2 beats before downbeat. clients have extra 2 beats to join
tm.cue[7] = new TMCue('tilt', 1667, 1667);
tm.cue[7].goCue = function() {
  // reset tempo just in case cue 15 was last triggered (and tempo changed)
  Tone.Transport.bpm.value = 72;
  counter_c7 = 0;
  fmSynth_c7.triggerAttack('E3');
  lfo_c7.start();
  loop_c7.start();
};
tm.cue[7].updateTiltSounds = function() {
  fmSynth_c7.modulationIndex.value = 1 + tm.accel.y * 19;

  // sound pulses when device is turned to right
  if (tm.accel.x < 0.5) {
    lfo_c7.min = peakVol_c7;
  } else {
    lfo_c7.min = peakVol_c7 - ((tm.accel.x-0.5) * 90);
  }
};
tm.cue[7].stopCue = function() {
  fmSynth_c7.triggerRelease();
  lfo_c7.stop();
  loop_c7.stop();
  riser.start();
};

// *******************************************************************
// CUE 8 [C]
// reverb for reversed chime sounds
var reverb = new Tone.Freeverb().toMaster();
reverb.roomSize.value = 0.75;
reverb.dampening.value = 5000;
var glRevF4 = new Tone.Player(glass_sounds + "shortRevGlassF4.mp3").connect(reverb);
var glRevA4 = new Tone.Player(glass_sounds + "shortRevGlassA4.mp3").connect(reverb);
var glRevB4 = new Tone.Player(glass_sounds + "shortRevGlassB4.mp3").connect(reverb);
var glRevC5 = new Tone.Player(glass_sounds + "shortRevGlassC5.mp3").connect(reverb);
var glRevE5 = new Tone.Player(glass_sounds + "shortRevGlassE5.mp3").connect(reverb);
var glRevF5 = new Tone.Player(glass_sounds + "shortRevGlassF5.mp3").connect(reverb);
var glRevA5 = new Tone.Player(glass_sounds + "shortRevGlassA5.mp3").connect(reverb);
var glRevB5 = new Tone.Player(glass_sounds + "shortRevGlassB5.mp3").connect(reverb);
var glRevC6 = new Tone.Player(glass_sounds + "shortRevGlassC6.mp3").connect(reverb);
var glRevE6 = new Tone.Player(glass_sounds + "shortRevGlassE6.mp3").connect(reverb);
var faller = new Tone.Player(misc_sounds + "revHatFaller.mp3").toMaster();

var revChimeArr_c8 = [glRevC5, glRevE5, glRevC6, glRevE6, glRevC5, glRevE5, glRevC6, glRevE6, glRevC5, glRevE5, glRevC6, glRevE6, glRevB4, glRevE5, glRevB5, glRevE6, glRevB4, glRevE5, glRevB5, glRevE6, glRevB4, glRevE5, glRevB5, glRevE6, glRevA4, glRevE5, glRevA5, glRevE6, glRevA4, glRevE5, glRevA5, glRevE6, glRevA4, glRevE5, glRevA5, glRevE6, glRevF4, glRevE5, glRevF5, glRevE6, glRevF4, glRevE5, glRevF5, glRevE6, glRevF4, glRevE5, glRevF5, glRevE6];
var loopArr_c8 = [glE4, glE5, glE6, glE5, glF4, glF5, glF4, glF5];

var counter_c8, thisChime_c8, loopCount_c8, step_c8, thisVol_c8, thisBend_c8, i_c8;

tm.cue[8] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[8].goCue = function() {
  // reset tempo just in case cue 15 was last triggered (and tempo changed)
  Tone.Transport.bpm.value = 72;
  counter_c8 = 0;
};
tm.cue[8].triggerShakeSound = function() {
  if (counter_c8 < revChimeArr_c8.length) {
    thisChime_c8 = revChimeArr_c8[counter_c8];
    thisChime_c8.start();
  } else {
    loopCount_c8 = counter_c8 - revChimeArr_c8.length;
    if (loopCount_c8 < 32) {
      // step_c8 counts from 0.0 to 1.0 (but stops at 1.0)
      step_c8 = loopCount_c8 / 31;
    } else {
      step_c8 = 1;
    }
    // select array index for current chime sound
    i_c8 = loopCount_c8 % loopArr_c8.length;
    thisChime_c8 = loopArr_c8[i_c8];
    thisVol_c8 = -(step_c8 * 18);
    thisChime_c8.volume.value = thisVol_c8;
    if (i_c8 < 4) {
      // Es bend down to Eb, but Fs bend UP to Gb
      thisBend_c8 = 1 - (step_c8 * bendDown);
    } else {
      thisBend_c8 = 1 + (step_c8 * bendUp);
    }
    thisChime_c8.playbackRate = thisBend_c8;
    thisChime_c8.start();
  }
  counter_c8++;
};
tm.cue[8].stopCue = function() {
  faller.start();
};

// *******************************************************************
// CUE 9 [D] TACET (but glass sounds on downbeat)
var downbeat_c9 = new Tone.Player(misc_sounds + "downbeatGlassCue9.mp3").toMaster();

tm.cue[9] = new TMCue('tacet', 1667, NO_LIMIT);
tm.cue[9].goCue = function() {
  downbeat_c9.start();
};
tm.cue[9].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 10 [E] crossfading synth and sparkles
var fmSynth_c10 = new Tone.FMSynth({
  harmonicity: 1.5,
  envelope: {
    attack: 2,
    decay: 0,
    sustain: 1,
    release: 2,
  },
  modulation: {
    type: 'sine',
  },
  modulationEnvelope: {
    attack: 0.1,
    decay: 0,
    sustain: 1,
    release: 2,
  },
});
fmSynth_c10.oscillator.partials = [1, 0.5, 0, 0.25, 0, 0, 0, 0.125];
var peakVol_c10 = -9;
var lfo_c10 = new Tone.LFO('16n', -99, peakVol_c10);
lfo_c10.connect(fmSynth_c10.volume);
// one control signal multiplies y- and x-axes to set volume on both
var rightDownVolTilt = new Tone.Multiply();
yTilt.connect(rightDownVolTilt, 0, 0);
xTilt.connect(rightDownVolTilt, 0, 1);
// next Tone.Multiply sets synth's volume from control signal
var scaledSynth_c10 = new Tone.Multiply().toMaster();
rightDownVolTilt.connect(scaledSynth_c10, 0, 0);
fmSynth_c10.connect(scaledSynth_c10, 0, 1);

var sugarChimeLoop = new Tone.Player(granulated_sounds + 'chimesAndSugarLoop.mp3');
sugarChimeLoop.loop = true;
sugarChimeLoop.volume.value = -9;
// need to invert x-axis to set vol on mute when turned RIGHT
var xTiltInverted = new Tone.Subtract();
var inversionSig = new Tone.Signal(1);
inversionSig.connect(xTiltInverted, 0, 0);
xTilt.connect(xTiltInverted, 0, 1);
// one control signal multiplies y- and x-axes to set volume on both
var leftDownVolTilt = new Tone.Multiply();
yTilt.connect(leftDownVolTilt, 0, 0);
xTiltInverted.connect(leftDownVolTilt, 0, 1);
// next Tone.Multiply sets sparkly sound's volume from control signal
var sparkles_c10 = new Tone.Multiply().toMaster();
leftDownVolTilt.connect(sparkles_c10, 0, 0);
sugarChimeLoop.connect(sparkles_c10, 0, 1);
var chimeRiser = new Tone.Player(misc_sounds + "revChimeRiser.mp3").toMaster();

// pitch array for synth
var pitchArr_c10 = ['C4', 'E4', 'C4', 'B3', 'E4', 'B3', 'B3', 'A3', 'G3', 'G3', 'D4', 'E4', 'C4', 'D4', 'B3', 'B3', 'A3', 'B3', 'C4', 'D4', 'E4', 'E4', 'D4', 'F4'];
// pitch array is for first (untransposed) section, so need to transpose
fmSynth_c10.detune.value = -400;

var counter_c10;

var loop_c10 = new Tone.Loop(function(time) {
  // only one actual note is played, but note is reset here
  fmSynth_c10.setNote(pitchArr_c10[counter_c10 % pitchArr_c10.length]);
  counter_c10++;
},'2n.');
// goes through pitch array only once, then holds on last pitch
loop_c10.iterations = pitchArr_c10.length;

tm.cue[10] = new TMCue('tilt', 1667, 1667);
tm.cue[10].goCue = function() {
  // reset tempo just in case cue 15 was last triggered (and tempo changed)
  Tone.Transport.bpm.value = 72;
  counter_c10 = 0;
  lfo_c10.start();
  fmSynth_c10.triggerAttack('C4');
  loop_c10.start();
  sugarChimeLoop.start();
};
tm.cue[10].updateTiltSounds = function() {
  fmSynth_c10.modulationIndex.value = 1 + tm.accel.y * 19;
  // control playback rate (i.e., pitch) of sparkles on y-axis
  sugarChimeLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
};
tm.cue[10].stopCue = function() {
  fmSynth_c10.triggerRelease();
  sugarChimeLoop.stop();
  lfo_c10.stop();
  loop_c10.stop();
  chimeRiser.playbackRate = 1 + (0.2 * Math.random());
  chimeRiser.start();
};

// *******************************************************************
// CUE 11 [F] SHAKE chimes with feedback delay
var delay = new Tone.FeedbackDelay({
  // delay time creates 16th-note effect
  delayTime: 0.208333,
  feedback: 0.2
}).toMaster();
var chF5 = new Tone.Player(chime_sounds + "chime1secF5.mp3").connect(delay);
var chG5 = new Tone.Player(chime_sounds + "chime1secG5.mp3").connect(delay);
var chAb5 = new Tone.Player(chime_sounds + "chime1secAb5.mp3").connect(delay);
var chC6 = new Tone.Player(chime_sounds + "chime1secC6.mp3").connect(delay);
var chF6 = new Tone.Player(chime_sounds + "chime1secF6.mp3").connect(delay);
var chG6 = new Tone.Player(chime_sounds + "chime1secG6.mp3").connect(delay);
var chAb6 = new Tone.Player(chime_sounds + "chime1secAb6.mp3").connect(delay);
var chC7 = new Tone.Player(chime_sounds + "chime1secC7.mp3").connect(delay);

var counter_c11, thisChime_c11;

var chimeArr_c11 = [chAb5, chAb6, chC6, chC7, chAb5, chAb6, chG5, chG6, chC6, chC7, chG5, chG6, chF5, chF6, chC6, chC7, chF5, chF6, chG5, chG6, chC6, chC7, chG5, chG6];

tm.cue[11] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[11].goCue = function() {
  // reset tempo just in case cue 15 was last triggered (and tempo changed)
  Tone.Transport.bpm.value = 72;
  counter_c11 = 0;
  // reset feedback in case it was changed
  delay.feedback.value = 0.2;
};
tm.cue[11].triggerShakeSound = function() {
  thisChime_c11 = chimeArr_c11[counter_c11 % chimeArr_c11.length];
  // chimes gliss up octave during middle of section
  thisChime_c11.playbackRate = tm.getSectionBreakpoints(11, [0,1, 20000,1, 40000,2]);
  // chimes fade to softer volume at end of section
  thisChime_c11.volume.value = tm.getSectionBreakpoints(11, [0,0, 40000,0, 60000,-18]);
  thisChime_c11.start();
  counter_c11++;
};
tm.cue[11].stopCue = function() {
  // add longer feedback tail as transition to next section
  delay.feedback.rampTo(0.8, 1);
  chimeRiser.playbackRate = 1 + (0.2 * Math.random());
  chimeRiser.start();
};

// *******************************************************************
// CUE 12 [G] TILT crossfading low pulsing synth with higher faster synth
var fmSynthLo_c12 = new Tone.FMSynth({
  harmonicity: 1.5,
  envelope: {
    attack: 2,
    decay: 0,
    sustain: 1,
    release: 2,
  },
  modulation: {
    type: 'sine',
  },
  modulationEnvelope: {
    attack: 0.1,
    decay: 0,
    sustain: 1,
    release: 2,
  },
});
fmSynthLo_c12.oscillator.partials = [1, 0.5, 0, 0.25, 0, 0, 0, 0.125];
var lfoLo_c12 = new Tone.LFO('8t', -99, -3);
lfoLo_c12.type = 'triangle';
lfoLo_c12.connect(fmSynthLo_c12.volume);
var scaledSynthLo_c12 = new Tone.Multiply().toMaster();
// this synth will sound when device is tipped to left
leftDownVolTilt.connect(scaledSynthLo_c12, 0, 0);
fmSynthLo_c12.connect(scaledSynthLo_c12, 0, 1);

var fmSynthHi_c12 = new Tone.FMSynth({
  harmonicity: 1.5,
  envelope: {
    attack: 2,
    decay: 0,
    sustain: 1,
    release: 2,
  },
  modulation: {
    type: 'sine',
  },
  modulationEnvelope: {
    attack: 0.1,
    decay: 0,
    sustain: 1,
    release: 2,
  },
});
fmSynthHi_c12.oscillator.partials = [1, 0.5, 0, 0.25, 0, 0, 0, 0.125];
var lfoHi_c12 = new Tone.LFO('16t', -99, -24);
lfoHi_c12.connect(fmSynthHi_c12.volume);
var scaledSynthHi_c12 = new Tone.Multiply().toMaster();
// this synth will sound when device is tipped to right
rightDownVolTilt.connect(scaledSynthHi_c12, 0, 0);
fmSynthHi_c12.connect(scaledSynthHi_c12, 0, 1);

// pitch array for synth
var pitchArr_c12 = ['Db2', 'Db2', 'Db2', 'Eb2', 'Eb2', 'Eb2', 'F2', 'F2', 'F2', 'G2', 'G2', 'G2', 'Ab2', 'Ab2', 'Ab2', 'Ab2', 'Ab2', 'Ab2', 'G2', 'G2', 'G2', 'Bb2', 'Bb2', 'Bb2'];

var counter_c12, loPitch_c12, hiPitch_c12;
// randomly select a partial for higher synth
var partialsArr_c12 = [3, 4, 5, 6, 7, 8];
var partial_c12 = partialsArr_c12[Math.floor(Math.random()*partialsArr_c12.length)];

var loop_c12 = new Tone.Loop(function(time) {
  // only one actual note is played, but pitch is reset here
  loPitch_c12 = pitchArr_c12[counter_c12 % pitchArr_c12.length];
  fmSynthLo_c12.setNote(loPitch_c12);
  // upper synth plays randomly selected higher partial of lower synth
  hiPitch_c12 = (Tone.Frequency(loPitch_c12).toFrequency()) * partial_c12;
  fmSynthHi_c12.setNote(hiPitch_c12);
  counter_c12++;
},'2n.');
// goes through pitch array only once, then holds on last pitch
loop_c12.iterations = pitchArr_c12.length;

tm.cue[12] = new TMCue('tilt', 1667, 1667);
tm.cue[12].goCue = function() {
  // reset tempo just in case cue 15 was last triggered (and tempo changed)
  Tone.Transport.bpm.value = 72;
  counter_c12 = 0;
  lfoLo_c12.start();
  lfoHi_c12.start();
  fmSynthLo_c12.triggerAttack('F2');
  fmSynthHi_c12.triggerAttack('A4');
  loop_c12.start();
};
tm.cue[12].updateTiltSounds = function() {
  fmSynthLo_c12.modulationIndex.value = 1 + tm.accel.y * 19;
  fmSynthHi_c12.modulationIndex.value = 1 + tm.accel.y * 19;
};
tm.cue[12].stopCue = function() {
  fmSynthLo_c12.triggerRelease();
  fmSynthHi_c12.triggerRelease();
  lfoLo_c12.stop();
  lfoHi_c12.stop();
  loop_c12.stop();
  chimeRiser.playbackRate = 1 + (0.2 * Math.random());
  chimeRiser.start();
};

// *******************************************************************
// CUE 13 [H] TACET
// TODO: add downbeat sound. could be low synth on E2
tm.cue[13] = new TMCue('tacet', 1667, NO_LIMIT);
tm.cue[13].goCue = function() {
};
tm.cue[13].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 14 [I] SHAKE glass sounds (with fade out and gliss up). 1 chime/triangle
var glGsharp4 = new Tone.Player(glass_sounds + "glassRealG4.mp3").toMaster();
glGsharp4.playbackRate = semitoneUp;
var glGsharp5 = new Tone.Player(glass_sounds + "glassRealG5.mp3").toMaster();
glGsharp5.playbackRate = semitoneUp;
var glGsharp6 = new Tone.Player(glass_sounds + "glassRealG6.mp3").toMaster();
glGsharp6.playbackRate = semitoneUp;
var glCsharp5 = new Tone.Player(glass_sounds + "glassRealCsharp5.mp3").toMaster();
var glCsharp6 = new Tone.Player(glass_sounds + "glassRealCsharp6.mp3").toMaster();
var glDsharp5 = new Tone.Player(glass_sounds + "glassRealD5.mp3").toMaster();
glDsharp5.playbackRate = semitoneUp;
var glDsharp6 = new Tone.Player(glass_sounds + "glassRealD6.mp3").toMaster();
glDsharp6.playbackRate = semitoneUp;
var chime_c14 = new Tone.Player(chime_sounds + "chime-1570Hz-G6.mp3").toMaster();
var ride = new Tone.Player(perc_sounds + "rideCymbal.mp3").toMaster();
var riser10sec = new Tone.Player(misc_sounds + "revRideRiser10sec.mp3").toMaster();

var glassArr_c14 = [glE5, glGsharp5, glE6, glGsharp6, glE5, glGsharp5, glE6, glGsharp6, glE5, glGsharp5, glE6, glGsharp6, glE5, glGsharp5, glE6, glGsharp6, glE5, glGsharp5, glE6, glGsharp6, glE5, glGsharp5, glE6, glGsharp6, glDsharp5, glGsharp5, glDsharp6, glGsharp6, glDsharp5, glGsharp5, glDsharp6, glGsharp6, glDsharp5, glGsharp5, glDsharp6, glGsharp6, glDsharp5, glGsharp5, glDsharp6, glGsharp6, glDsharp5, glGsharp5, glDsharp6, glGsharp6, glDsharp5, glGsharp5, glDsharp6, glGsharp6, glCsharp5, glGsharp5, glCsharp6, glGsharp6, glCsharp5, glGsharp5, glCsharp6, glGsharp6, glCsharp5, glGsharp5, glCsharp6, glGsharp6, glCsharp5, glGsharp5, glCsharp6, glGsharp6, glCsharp5, glGsharp5, glCsharp6, glGsharp6, glCsharp5, glGsharp5, glCsharp6, glGsharp6, glA4, glGsharp5, glA5, glGsharp6, glA4, glGsharp5, glA5, glGsharp6, glA4, glGsharp5, glA5, glGsharp6, glA4, glGsharp5, glA5, glGsharp6, glA4, glGsharp5, glA5, glGsharp6, glA4, glGsharp5, glA5, glGsharp6];
var loopArr_c14 = [glGsharp4, glGsharp5, glGsharp6];

var counter_c14, thisSound_c14, loopCount_c14, step_c14, bend_c14, flag_c14, time_c14, singleSound_c14;
// number of G#s before gliss up begins
var preGlissNotes_c14 = 18;
// number of glissing notes before reaching higher pitch
var glissNotes_c14 = 24;
// interval to gliss up (m3 goes from G# to B)
var glissInt_c14 = (semitoneUp ** 4) - semitoneUp;

tm.cue[14] = new TMCue('shake', 1667, NO_LIMIT)
tm.cue[14].goCue = function() {
  // reset tempo just in case cue 15 was last triggered (and tempo changed)
  Tone.Transport.bpm.value = 72;
  counter_c14 = 0;
  // at most once in section, special sound played in one time window
  flag_c14 = false;
  // select random sound (and playback rate) for special sound moment
  if (Math.random() < 0.3) {
    singleSound_c14 = ride;
  } else {
    singleSound_c14 = chime_c14;
  }
  // randomly set playback rate to create splashy effect
  singleSound_c14.playbackRate = 1 + Math.random();
};
tm.cue[14].triggerShakeSound = function() {
  // during time window between 45-50 sec. into section, trigger special sound
  time_c14 = tm.getElapsedTimeInCue(14);
  if ((time_c14 > 45000) && (time_c14 < 50000) && !flag_c14) {
    singleSound_c14.start();
    riser10sec.start();
    // set flag to true to prevent sound from playing twice
    flag_c14 = true;
  } else {
    // first go through initial array of pitches
    if (counter_c14 < glassArr_c14.length) {
      thisSound_c14 = glassArr_c14[counter_c14];
    // continue with loop of G#s that gliss up
    } else {
      // final loop glisses up
      loopCount_c14 = counter_c14 - glassArr_c14.length;
      if (loopCount_c14 < preGlissNotes_c14) {
        // to get G#s, audio file is already transposed up half step
        bend_c14 = semitoneUp;
      } else if (loopCount_c14 < (preGlissNotes_c14 + glissNotes_c14)) {
        // step_c14 counts from 0.0 to 1.0
        step_c14 = (loopCount_c14 - preGlissNotes_c14) / glissNotes_c14;
        bend_c14 = semitoneUp + (glissInt_c14 * step_c14);
      } else {
        // octave higher
        bend_c14 = semitoneUp + glissInt_c14;
      }
      thisSound_c14 = loopArr_c14[counter_c14 % loopArr_c14.length];
      thisSound_c14.playbackRate = bend_c14;
    }
    // all sounds dimin. together in second half of section
    thisSound_c14.volume.value = tm.getSectionBreakpoints(14, [0,0, 30000,0, 60000, -18]);
    thisSound_c14.start();
  }
  counter_c14++;
};
tm.cue[14].stopCue = function() {
  // no transition sound trigger here because it's triggered by shake
};

// *******************************************************************
// CUE 15 [J] TILT piano / reversed piano / clave loops
// TODO: maybe replace these sounds with shorter, more articulate sounds?
var pnoA1 = new Tone.Player(piano_sounds + "pianoA1.mp3").connect(reverb);
var pnoA2 = new Tone.Player(piano_sounds + "pianoA2.mp3").connect(reverb);
var pnoA3 = new Tone.Player(piano_sounds + "pianoA3.mp3").connect(reverb);
var pnoAb2 = new Tone.Player(piano_sounds + "pianoAb2.mp3").connect(reverb);
var pnoAb3 = new Tone.Player(piano_sounds + "pianoAb3.mp3").connect(reverb);
var pnoAb4 = new Tone.Player(piano_sounds + "pianoAb4.mp3").connect(reverb);
var pnoDb2 = new Tone.Player(piano_sounds + "pianoDb2.mp3").connect(reverb);
var pnoDb3 = new Tone.Player(piano_sounds + "pianoDb3.mp3").connect(reverb);
var pnoDb4 = new Tone.Player(piano_sounds + "pianoDb4.mp3").connect(reverb);
var pnoE2 = new Tone.Player(piano_sounds + "pianoE2.mp3").connect(reverb);
var pnoE3 = new Tone.Player(piano_sounds + "pianoE3.mp3").connect(reverb);
var pnoE4 = new Tone.Player(piano_sounds + "pianoE4.mp3").connect(reverb);
var pnoEb2 = new Tone.Player(piano_sounds + "pianoEb2.mp3").connect(reverb);
var pnoEb3 = new Tone.Player(piano_sounds + "pianoEb3.mp3").connect(reverb);
var pnoEb4 = new Tone.Player(piano_sounds + "pianoEb4.mp3").connect(reverb);
var pnoRevA1 = new Tone.Player(piano_sounds + "pianoRevA1.mp3").connect(reverb);
var pnoRevA2 = new Tone.Player(piano_sounds + "pianoRevA2.mp3").connect(reverb);
var pnoRevA3 = new Tone.Player(piano_sounds + "pianoRevA3.mp3").connect(reverb);
var pnoRevAb2 = new Tone.Player(piano_sounds + "pianoRevAb2.mp3").connect(reverb);
var pnoRevAb3 = new Tone.Player(piano_sounds + "pianoRevAb3.mp3").connect(reverb);
var pnoRevAb4 = new Tone.Player(piano_sounds + "pianoRevAb4.mp3").connect(reverb);
var pnoRevDb2 = new Tone.Player(piano_sounds + "pianoRevDb2.mp3").connect(reverb);
var pnoRevDb3 = new Tone.Player(piano_sounds + "pianoRevDb3.mp3").connect(reverb);
var pnoRevDb4 = new Tone.Player(piano_sounds + "pianoRevDb4.mp3").connect(reverb);
var pnoRevE2 = new Tone.Player(piano_sounds + "pianoRevE2.mp3").connect(reverb);
var pnoRevE3 = new Tone.Player(piano_sounds + "pianoRevE3.mp3").connect(reverb);
var pnoRevE4 = new Tone.Player(piano_sounds + "pianoRevE4.mp3").connect(reverb);
var pnoRevEb2 = new Tone.Player(piano_sounds + "pianoRevEb2.mp3").connect(reverb);
var pnoRevEb3 = new Tone.Player(piano_sounds + "pianoRevEb3.mp3").connect(reverb);
var pnoRevEb4 = new Tone.Player(piano_sounds + "pianoRevEb4.mp3").connect(reverb);
var claveLoop = new Tone.Player(granulated_sounds + "claveLoop.mp3").toMaster();
claveLoop.loop = true;

// arrays of octave-transposed piano samples (to select on y-axis)
var pnoA = [pnoA1, pnoA2, pnoA3];
var pnoAb = [pnoAb2, pnoAb3, pnoAb4];
var pnoDb = [pnoDb2, pnoDb3, pnoDb4];
var pnoE = [pnoE2, pnoE3, pnoE4];
var pnoEb = [pnoEb2, pnoEb3, pnoEb4];
var revA = [pnoRevA1, pnoRevA2, pnoRevA3];
var revAb = [pnoRevAb2, pnoRevAb3, pnoRevAb4];
var revDb = [pnoRevDb2, pnoRevDb3, pnoRevDb4];
var revE = [pnoRevE2, pnoRevE3, pnoRevE4];
var revEb = [pnoRevEb2, pnoRevEb3, pnoRevEb4];
// array of pitches (selected by time since cue began - syncs w/ensemble notes)
var loPitch_c15 = [pnoAb, pnoAb, pnoEb, pnoE, pnoDb, pnoEb, pnoA, pnoA];
var hiPitch_c15 = [revAb, revAb, revEb, revE, revDb, revEb, revA, revA];

var countLo_c15, countHi_c15, loSound_c15, hiSound_c15, yVal_c15, loIndex_c15, hiIndex_c15, time_c15;
// 3 bars of 4/4 @ 108bpm is 6.6666 second (or 20/3). time encoded in ms. tho
const noteDur_c15 = 20/3 * 1000;
// no pitch bending during first 6 notes
const noBend_c15 = noteDur_c15 * 6;
const totalDur_c15 = noteDur_c15 * 8;
const upM2 = semitoneUp ** 2;

var loLoop_c15 = new Tone.Loop(function(time) {
  // only play low sound if device is mostly flat
  if ((tm.accel.x >= 0.33) && (tm.accel.x < 0.67)) {
    // select octave among the possibilities on y-axis
    yVal_c15 = Math.floor(tm.accel.y * 2.99)
    // select pitch based on time elapsed in section
    time_c15 = Math.floor(tm.getElapsedTimeInCue(15) / noteDur_c15);
    loIndex_c15 = (time_c15 < loPitch_c15.length) ? time_c15 : (loPitch_c15.length - 1);
    // trigger specific sample (time-determined pitch and y-determined oct)
    loSound_c15 = loPitch_c15[loIndex_c15][yVal_c15];
    // create triplet pulsing effect
    loSound_c15.volume.value = (countLo_c15 % 3) ? -18 : -12;
    // last note bends from B down to A
    if (loIndex_c15 > 5) {
      // gliss lasts 6 measures, after which pitch remains on A
      loSound_c15.playbackRate = tm.getSectionBreakpoints(15, [0,upM2, noBend_c15,upM2, totalDur_c15,1]);
    }
    loSound_c15.start();
  }
  countLo_c15++;
},'8t');
var hiLoop_c15 = new Tone.Loop(function(time) {
  // only play high reversed sound if device is tilted left
  if (tm.accel.x < 0.33) {
    // select octave among the possibilities on y-axis
    yVal_c15 = Math.floor(tm.accel.y * 2.99)
    // select pitch based on time elapsed in section
    time_c15 = Math.floor(tm.getElapsedTimeInCue(15) / noteDur_c15);
    hiIndex_c15 = (time_c15 < hiPitch_c15.length) ? time_c15 : (hiPitch_c15.length - 1);
    // trigger specific sample (time-determined pitch and y-determined oct)
    hiSound_c15 = hiPitch_c15[hiIndex_c15][yVal_c15];
    // create 8th-note pulsing effect
    hiSound_c15.volume.value = (countHi_c15 % 2) ? -18 : -12;
    // last note bends from B down to A
    if (hiIndex_c15 > 5) {
      // gliss lasts 6 measures, after which pitch remains on A
      hiSound_c15.playbackRate = tm.getSectionBreakpoints(15, [0,upM2, noBend_c15,upM2, totalDur_c15,1]);
    }
    hiSound_c15.start();
  }
  countHi_c15++;
},'8n');

tm.cue[15] = new TMCue('tilt', 1667, 1667);
tm.cue[15].goCue = function() {
  // new tempo
  Tone.Transport.bpm.value = 108;
  countLo_c15 = 0;
  countHi_c15 = 0;
  loLoop_c15.start();
  hiLoop_c15.start();
  claveLoop.volume.value = -99;
  claveLoop.start();
};
tm.cue[15].updateTiltSounds = function() {
  // wooden sounds with pitch and speed on y-axis audible only w/ right tilt
  claveLoop.playbackRate = 0.25 + tm.accel.y * 3.75;
  if (tm.accel.x > 0.67) {
    claveLoop.volume.value = -3;
  } else {
    claveLoop.volume.value = -99;
  }
};
tm.cue[15].stopCue = function() {
  // TODO: add transition sound
  loLoop_c15.stop();
  hiLoop_c15.stop();
  claveLoop.stop();
};

// *******************************************************************
// CUE 16 [K] SHAKE

// some glass sounds declared earlier, some new here (some duplicates new)
var glA4b = new Tone.Player(glass_sounds + "glassRealA4.mp3").toMaster();
var glA5b = new Tone.Player(glass_sounds + "glassRealA5.mp3").toMaster();
var glA6 = new Tone.Player(glass_sounds + "glassRealA6.mp3").toMaster();
var glB4b = new Tone.Player(glass_sounds + "glassRealB4.mp3").toMaster();
var glB5b = new Tone.Player(glass_sounds + "glassRealB5.mp3").toMaster();
var glB6 = new Tone.Player(glass_sounds + "glassRealB6.mp3").toMaster();
var glCsharp5b = new Tone.Player(glass_sounds + "glassRealCsharp5.mp3").toMaster();
var glCsharp6b = new Tone.Player(glass_sounds + "glassRealCsharp6.mp3").toMaster();
var glCsharp7 = new Tone.Player(glass_sounds + "glassRealCsharp7.mp3").toMaster();
// earlier version of D# was just D pitched up. could change later.
var glDsharpReal5 = new Tone.Player(glass_sounds + "glassRealDsharp5.mp3").toMaster();
var glDsharpReal5b = new Tone.Player(glass_sounds + "glassRealDsharp5.mp3").toMaster();
var glDsharpReal6 = new Tone.Player(glass_sounds + "glassRealDsharp6.mp3").toMaster();
var glDsharpReal6b = new Tone.Player(glass_sounds + "glassRealDsharp6.mp3").toMaster();
var glDsharpReal7 = new Tone.Player(glass_sounds + "glassRealDsharp7.mp3").toMaster();
var glE6b = new Tone.Player(glass_sounds + "glassRealE6.mp3").toMaster();
var glE7 = new Tone.Player(glass_sounds + "glassRealE7.mp3").toMaster();

var counter_c16, thisGlass_c16, flag_c16;

var glassArr_c16 = [glA4, glA5, glA4b, glB4, glB5, glB4b, glCsharp5, glCsharp6, glCsharp5b, glDsharpReal5, glDsharpReal6, glDsharpReal5b, glE5, glE6, glE5b, glA5, glA6, glA5b, glB5, glB6, glB5b, glCsharp6, glCsharp7, glCsharp6b, glDsharpReal6, glDsharpReal7, glDsharpReal6b, glE6, glE7, glE6b];
var loopArr_c16 = [glE4, glE5, glE6, glE5b, glE6b, glE7];

tm.cue[16] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[16].goCue = function() {
  counter_c16 = 0;
  flag_c16 = false;
};
tm.cue[16].triggerShakeSound = function() {
  // during time window between 45-50 sec. into section, cue final riser
  time_c16 = tm.getElapsedTimeInCue(16);
  if ((time_c16 > 45000) && (time_c16 < 50000) && !flag_c16) {
    riser10sec.start();
    // set flag to true to prevent sound from playing twice
    flag_c16 = true;
  } else {
    // goes through initial loop 3 times
    if (counter_c16 < (glassArr_c16.length * 3)) {
      thisGlass_c16 = glassArr_c16[counter_c16 % glassArr_c16.length];
    } else {
      // then loops through octaves of Es
      thisGlass_c16 = loopArr_c16[(counter_c16 - glassArr_c16.length) % loopArr_c16.length];
    }
    thisGlass_c16.start();
    counter_c16++;
  }
};
tm.cue[16].stopCue = function() {
  // nothing to clean up. transition triggered in window above
};

// *******************************************************************
// CUE 17 [L] TACET
tm.cue[17] = new TMCue('tacet', 1667, NO_LIMIT);
tm.cue[17].goCue = function() {
  // TODO: add final downbeat sound for coda?
};
tm.cue[17].stopCue = function() {
};

// *******************************************************************
// CUE 18: finished
tm.cue[18] = new TMCue('finished', -1);
tm.cue[18].goCue = function() {
  tm.publicLog('The piece is done.');
}
