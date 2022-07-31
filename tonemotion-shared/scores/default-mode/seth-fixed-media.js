const tm = new ToneMotion();
tm.debug = false; // if true, skips clock sync and shows console
tm.showConsoleOnLaunch = true;
tm.localTest = false; // if true, fetches cues from localhost, not Heroku
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/seth-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/seth-server/current-cue');
  }

  // check support for WAV audio file type
  if (silent_buffer.canPlayType('audio/wav')) {
    tm.publicLog('This browser appears to support WAV audio files.');
  } else {
    tm.publicWarning('This browser does not appear to support WAV audio files.');
  }
};

// buttons for fixed media playback / stopping
const stop_all_sound_button = document.querySelector('#stop_all_sound_button');
const play_file_1_button = document.querySelector('#play_file_1_button');
const play_file_2_button = document.querySelector('#play_file_2_button');
const play_file_3_button = document.querySelector('#play_file_3_button');
const play_file_4_button = document.querySelector('#play_file_4_button');

// Shortcuts to audio file paths
const fixed_media_sounds = 'tonemotion-shared/audio/fixed_media/';

// Fixed media audio files loaded into buffers
var fixed_media_1 = new Tone.Player(fixed_media_sounds + "fixed_media_1-2020-01-07.wav").toMaster();

var fixed_media_2 = new Tone.Player(fixed_media_sounds + "fixed_media_2-2020-01-08.wav").toMaster();

var fixed_media_3 = new Tone.Player(fixed_media_sounds + "fixed_media_3-2020-01-08.wav").toMaster();

var fixed_media_4 = new Tone.Player(fixed_media_sounds + "fixed_media_4-2020-01-07.wav").toMaster();

// function triggered by buttons
stop_all_sound_button.addEventListener("click", () => {
  tm.publicLog('All sound stopped.');
  // duck master volume to avoid clicks when stopping files
  Tone.Master.volume.setValueCurveAtTime([0, -99, -99, -99, 0], '+0', 1);
  fixed_media_1.stop('+0.5');
  fixed_media_2.stop('+0.5');
  fixed_media_3.stop('+0.5');
  fixed_media_4.stop('+0.5');
});

play_file_1_button.addEventListener("click", () => {
  tm.publicLog('Fixed media file 1 manually triggered.');
  fixed_media_1.start();
});

play_file_2_button.addEventListener("click", () => {
  tm.publicLog('Fixed media file 2 manually triggered.');
  fixed_media_2.start();
});

play_file_3_button.addEventListener("click", () => {
  tm.publicLog('Fixed media file 3 manually triggered.');
  fixed_media_3.start();
});

play_file_4_button.addEventListener("click", () => {
  tm.publicLog('Fixed media file 4 manually triggered.');
  fixed_media_4.start();
});

// *******************************************************************
// CUE 0: sets status to 'waitingForPieceToStart'
tm.cue[0] = new TMCue('waiting', -1);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};

// *******************************************************************
// CUE 1: tilt tutorial
// Test tone for "tilt" tutorial

tm.cue[1] = new TMCue('tilt', -1);
tm.cue[1].goCue = function() {
  tm.publicLog('Cue 1 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
}
tm.cue[1].updateTiltSounds = function() {
  // no interactivity in this site
}
tm.cue[1].stopCue = function() {
  // nothing to do here
}

// *******************************************************************
// CUE 2: tacet tutorial
tm.cue[2] = new TMCue('tacet', -1);
tm.cue[2].goCue = function() {
  tm.publicLog('Cue 2 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
}
tm.cue[2].stopCue = function() {
  // nothing to clean up
}

// *******************************************************************
// CUE 3: shake tutorial
tm.cue[3] = new TMCue('shake', -1);
tm.cue[3].goCue = function() {
  tm.publicLog('Cue 3 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};
tm.cue[3].triggerShakeSound = function() {
};
tm.cue[3].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 4: sets status to 'waitingForPieceToStart'
tm.cue[4] = new TMCue('waiting', -1);
tm.cue[4].goCue = function() {
  tm.publicLog('Cue 4 triggered. Waiting for piece to start.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};
tm.cue[4].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 5: [intro] Actual beginning of piece, but first section is tacet
tm.cue[5] = new TMCue('tacet', -1);
tm.cue[5].goCue = function() {
  tm.publicLog('Cue 5 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};
tm.cue[5].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 6: [intro] CUE FIXED MEDIA FILE 1
tm.cue[6] = new TMCue('tacet', -1);
tm.cue[6].goCue = function() {
  fixed_media_1.start();
  tm.publicLog('****************');
  tm.publicLog('Cue 6 triggered. Fixed media file 1 triggered.');
};
tm.cue[6].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 7: [A1] Shaking bells through predefined pitch array (with looped tail)
// CUE FIXED MEDIA FILE 2
tm.cue[7] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[7].goCue = function() {
  fixed_media_2.start();
  tm.publicLog('****************');
  tm.publicLog('Cue 7 triggered. Fixed media file 2 triggered.');
};

tm.cue[7].triggerShakeSound = function() {
};
tm.cue[7].stopCue = function() {
};

// *******************************************************************
// CUE 8: [B1 first 5 mm.] short TACET section, just listening to cello
tm.cue[8] = new TMCue('tacet', 1875, NO_LIMIT);
tm.cue[8].goCue = function() {
  tm.publicLog('Cue 8 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};
tm.cue[8].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 9: [B1] quasi-granulated sparkles
tm.cue[9] = new TMCue('tilt', 1875, NO_LIMIT); // 2 beats @ 64bpm

tm.cue[9].goCue = function() {
  tm.publicLog('Cue 9 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};

tm.cue[9].updateTiltSounds = function() {
};
tm.cue[9].stopCue = function() {
};

// *******************************************************************
// CUE 10: [A2] Shaking glass through predefined pitch array (with looped tail)
tm.cue[10] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[10].goCue = function() {
  tm.publicLog('Cue 10 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};

tm.cue[10].triggerShakeSound = function() {
};
tm.cue[10].stopCue = function() {
};

// *******************************************************************
// CUE 11: [B2 first 5 mm.] short TACET section, just listening to cello
tm.cue[11] = new TMCue('tacet', 1875, NO_LIMIT);
tm.cue[11].goCue = function() {
  tm.publicLog('Cue 11 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};
tm.cue[11].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 12: [B2] 3 percussive loops with variable playback speed
tm.cue[12] = new TMCue('tilt', 1875, NO_LIMIT); // 2 beats @ 64bpm
tm.cue[12].goCue = function() {
  tm.publicLog('Cue 12 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};

tm.cue[12].updateTiltSounds = function() {
};
tm.cue[12].stopCue = function() {
};

// *******************************************************************
// CUE 13: [A3] glock / glass sounds through canon
tm.cue[13] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[13].goCue = function() {
  tm.publicLog('Cue 13 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};

tm.cue[13].triggerShakeSound = function() {
};
tm.cue[13].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 14: [C1] triplet synths and clicky sounds (with pitch on tilt)
tm.cue[14] = new TMCue('tilt', 1875, NO_LIMIT);

tm.cue[14].goCue = function() {
  tm.publicLog('Cue 14 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};

tm.cue[14].updateTiltSounds = function() {
};
tm.cue[14].stopCue = function() {
};

// *******************************************************************
// CUE 15: [A4] glock / glass sounds through canon with rising vc pizz
// CUE FIXED MEDIA FILE 3
tm.cue[15] = new TMCue('shake', 1875, NO_LIMIT); // 4 beats @ 128bpm
tm.cue[15].goCue = function() {
  fixed_media_3.start();
  tm.publicLog('****************');
  tm.publicLog('Cue 15 triggered. Fixed media file 3 triggered.');
};

tm.cue[15].triggerShakeSound = function() {
};
tm.cue[15].stopCue = function() {
};

// *******************************************************************
// CUE 16: [C2 first 16"] short TACET section, just listening to cello
tm.cue[16] = new TMCue('tacet', 1875, NO_LIMIT);
tm.cue[16].goCue = function() {
  tm.publicLog('Cue 16 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};

tm.cue[16].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 17: [C2] swirly synth sounds and sparkles
tm.cue[17] = new TMCue('tilt', 1875, NO_LIMIT);
tm.cue[17].goCue = function() {
  tm.publicLog('Cue 17 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
};

tm.cue[17].updateTiltSounds = function() {
};
tm.cue[17].stopCue = function() {
};

// *******************************************************************
// CUE 18: [coda] CUE FIXED MEDIA 4
tm.cue[18] = new TMCue('shake', 1875, NO_LIMIT);
tm.cue[18].goCue = function() {
  fixed_media_4.start();
  tm.publicLog('****************');
  tm.publicLog('Cue 18 triggered. Fixed media file 4 triggered.');
};

tm.cue[18].triggerShakeSound = function() {
};
tm.cue[18].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 19: tacet fermata
tm.cue[19] = new TMCue('tacet', -1);
tm.cue[19].goCue = function() {
  tm.publicLog('Cue 19 triggered. No fixed media for this cue.');
  tm.publicLog('Cues that trigger fixed media files are cue 6 (file 1), cue 7 (file 2), cue 15 (file 3), and cue 18 (file 4).');
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
