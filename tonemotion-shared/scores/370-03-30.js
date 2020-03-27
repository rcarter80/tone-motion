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
var cue1 = new Tone.Player(class_370 + "p1_anthony1").toMaster();
createCue(1, cue1);
var cue3 = new Tone.Player(class_370 + "p1_anthony2").toMaster();
createCue(3, cue3);
var cue5 = new Tone.Player(class_370 + "p1_cconley").toMaster();
createCue(5, cue5);
var cue7 = new Tone.Player(class_370 + "p1_cvictor").toMaster();
createCue(7, cue7);
var cue9 = new Tone.Player(class_370 + "p1_ethan1").toMaster();
createCue(9, cue9);
var cue11 = new Tone.Player(class_370 + "p1_ethan2").toMaster();
createCue(11, cue11);
var cue13 = new Tone.Player(class_370 + "p1_ethan3").toMaster();
createCue(13, cue13);
// var cue15 = new Tone.Player(class_370 + "p1_george").toMaster();
// createCue(15, cue15);
// var cue17 = new Tone.Player(class_370 + "p1_gus1").toMaster();
// createCue(17, cue17);
// var cue19 = new Tone.Player(class_370 + "p1_gus2").toMaster();
// createCue(19, cue19);
// var cue21 = new Tone.Player(class_370 + "p1_jack").toMaster();
// createCue(21, cue21);
// var cue23 = new Tone.Player(class_370 + "p1_jake1").toMaster();
// createCue(23, cue23);
// var cue25 = new Tone.Player(class_370 + "p1_jake2").toMaster();
// createCue(25, cue25);
// var cue27 = new Tone.Player(class_370 + "p1_kevin1").toMaster();
// createCue(27, cue27);
// var cue29 = new Tone.Player(class_370 + "p1_kevin2").toMaster();
// createCue(29, cue29);
// var cue31 = new Tone.Player(class_370 + "p1_kyle").toMaster();
// createCue(31, cue31);
// var cue33 = new Tone.Player(class_370 + "p1_lucas1").toMaster();
// createCue(33, cue33);
// var cue35 = new Tone.Player(class_370 + "p1_lucas2").toMaster();
// createCue(35, cue35);
// var cue37 = new Tone.Player(class_370 + "p1_marc").toMaster();
// createCue(37, cue37);
// var cue39 = new Tone.Player(class_370 + "p1_michaela1").toMaster();
// createCue(39, cue39);
// var cue41 = new Tone.Player(class_370 + "p1_michaela2").toMaster();
// createCue(41, cue41);
// var cue43 = new Tone.Player(class_370 + "p1_taomi1").toMaster();
// createCue(43, cue43);
// var cue45 = new Tone.Player(class_370 + "p1_taomi2").toMaster();
// createCue(45, cue45);

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
