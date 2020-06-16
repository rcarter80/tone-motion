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
// TODO: deleted unused paths
const glass_sounds = 'tonemotion-shared/audio/glass/';
const chime_sounds = 'tonemotion-shared/audio/chimes/';
const plucked_sounds = 'tonemotion-shared/audio/plucked/';
const cello_sounds = 'tonemotion-shared/audio/cello/';
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
var glassArray_c6 = [glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glC5, glE5, glC6, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glB4, glE5, glB5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glA4, glE5, glA5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glF4, glE5, glF5, glE6, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b, glE4, glE5, glE6, glE5b];
// second array of sounds (no fade out)
var chimeArray_c6 = [chimeD7, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b, pluckedD3, pluckedD4, pluckedD5, pluckedD4b];
// final array of sounds to keep looping
var pluckedArray_c6 = [pluckedF3, pluckedF4, pluckedF5, pluckedF4b];

var counter_c6 = 0;
var thisVol_c6, thisBend_c6, thisGlass_c6, thisPluck_c6, loopCount_c6, step_c6;

// 1667 ms. = 2 beats @ 72bpm
tm.cue[6] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[6].goCue = function() {
  counter_c6 = 0;
};
tm.cue[6].triggerShakeSound = function() {
  if (counter_c6 < glassArray_c6.length) {
    // glass sounds fade from 0dBfs to -24dBfs over course of array
    thisVol_c6 = -((counter_c6 / 59) * 24);
    thisGlass_c6 = glassArray_c6[counter_c6];
    thisGlass_c6.volume.value = thisVol_c6;
    thisGlass_c6.start();
  } else if (counter_c6 < (glassArray_c6.length + chimeArray_c6.length)) {
    chimeArray_c6[(counter_c6 - glassArray_c6.length)].start();
  } else {
    loopCount_c6 = counter_c6 - glassArray_c6.length - chimeArray_c6.length;
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
    thisPluck_c6 = pluckedArray_c6[loopCount_c6 % pluckedArray_c6.length];
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
var peakVol_c7 = -9;
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

// CUE 9 [D] TACET (but glass sounds on downbeat)
var downbeat_c9 = new Tone.Player(misc_sounds + "downbeatGlassCue9.mp3").toMaster();

tm.cue[9] = new TMCue('tacet', 1667, NO_LIMIT);
tm.cue[9].goCue = function() {
  downbeat_c9.start();
};
tm.cue[9].stopCue = function() {
  // nothing to clean up
};

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

// pitch array for synth
var pitchArr_c10 = ['C4', 'E4', 'C4', 'B3', 'E4', 'B3', 'B3', 'A3', 'G3', 'G3', 'D4', 'E4', 'C4', 'D4', 'B3', 'B3', 'A3', 'B3', 'C4', 'D4', 'E4', 'E4', 'D4', 'F4'];

var counter_c10;

var loop_c10 = new Tone.Loop(function(time) {
  // only one actual note is played, but note is reset here
  fmSynth_c10.setNote(pitchArr_c10[counter_c10 % pitchArr_c10.length]);
  counter_c10++;
},'2n.');
// goes through pitch array only once, then holds on last pitch
loop_c10.iterations = pitchArr_c10.length;

// TODO: change openWindow to 1667
tm.cue[10] = new TMCue('tilt', 1667, NO_LIMIT);
tm.cue[10].goCue = function() {
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
};

// CUE 11 [F] SHAKE
tm.cue[11] = new TMCue('shake', 1667, NO_LIMIT);
tm.cue[11].goCue = function() {

};
tm.cue[11].triggerShakeSound = function() {

};
tm.cue[11].stopCue = function() {

};

// CUE 12 [G] TILT
tm.cue[12] = new TMCue('tilt', 1667, NO_LIMIT);
tm.cue[12].goCue = function() {

};
tm.cue[12].updateTiltSounds = function() {

};
tm.cue[12].stopCue = function() {

};


/*********************************************************************
************************ EXTRA CODE SNIPPETS *************************
*********************************************************************/
// ideas to possibly use in future, but comment out for now

// determine which of 4 x-axis strips is current position
// 0: left, 1: second-to-left, 2: second-to-right, 3: right
// xZoneNow = Math.floor(tm.accel.x * 3.99);
// if (xZoneNow != xZone) {
//   // position has changed
//   xZone = xZoneNow;
//   switch (xZone) {
//     // uses range of LFOs (min and max) to toggle amplitude mod and mutes
//     case 0:
//       // low vox continuous (no amp mod) and high vox muted
//       lfo_c7.min = peakVol_c7;
//       lfo_c7.max = peakVol_c7;
//       lfoHi_c7.min = -99;
//       lfoHi_c7.max = -99;
//       break;
//     case 1:
//       // low vox pulsing and high vox muted
//       lfo_c7.min = -99;
//       lfo_c7.max = peakVol_c7;
//       lfoHi_c7.min = -99;
//       lfoHi_c7.max = -99;
//       break;
//     case 2:
//       // low vox muted and high vox continuous
//       lfo_c7.min = -99;
//       lfo_c7.max = -99;
//       lfoHi_c7.min = peakVol_c7;
//       lfoHi_c7.max = peakVol_c7;
//       break;
//     case 3:
//       // low vox muted and high vox continuous
//       lfo_c7.min = -99;
//       lfo_c7.max = -99;
//       lfoHi_c7.min = -99;
//       lfoHi_c7.max = peakVol_c7;
//       break;
//   }
// }
