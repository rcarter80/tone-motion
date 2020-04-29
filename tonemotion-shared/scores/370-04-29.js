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
const class_370 = 'tonemotion-shared/audio/class_370/';
// load audio files for listening to in class
var cue1 = new Tone.Player(class_370 + "if Kaytranada was really bad.mp3").toMaster();
createCue(1, cue1);
var cue3 = new Tone.Player(class_370 + "Theo Katzman - Love Is A Beautiful Thing.mp3").toMaster();
createCue(3, cue3);
var cue5 = new Tone.Player(class_370 + "Halo-Wayfaring Stranger.mp3").toMaster();
createCue(5, cue5);
var cue7 = new Tone.Player(class_370 + "Doom Saloon-Drink to the Dead Remastered_1.mp3").toMaster();
createCue(7, cue7);
var cue9 = new Tone.Player(class_370 + "Final Project Preview - GD's Theme.mp3").toMaster();
createCue(9, cue9);
var cue11 = new Tone.Player(class_370 + "A. try beginning.mp3").toMaster();
createCue(11, cue11);
var cue13 = new Tone.Player(class_370 + "B. Beginning of Song 1.mp3").toMaster();
createCue(13, cue13);
var cue7 = new Tone.Player(class_370 + "C. end of chorus 1.mp3").toMaster();
createCue(15, cue15);
var cue17 = new Tone.Player(class_370 + "D. Chorus Bass and Drums.mp3").toMaster();
createCue(17, cue17);

// create 40 (more than necessary) 'waiting' cues on even numbers
for (var i = 0; i < 48; i = i + 2) {
  tm.cue[i] = new TMCue('waiting', -1);
  tm.cue[i].goCue = function() {
    // nothing to do here
  };
  tm.cue[i].stopCue = function() {
    // nothing to do here
  };
}

// function to generate listening cue
function createCue(cueNum, cue) {
  tm.cue[cueNum] = new TMCue('listen', 2000, NO_LIMIT);
  tm.cue[cueNum].goCue = function() {
    cue.start();
  };
  tm.cue[cueNum].stopCue = function() {
    cue
    .stop();
  };
}
