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
const class_270 = 'tonemotion-shared/audio/class_270/';
// load audio files for listening to in class
// NOTE: I can instruct students to listen to specific location by having them open the console and invoking e.g., cue1.start(0, 60) (starts immediately playing from 60-second point). They need to call cue1.stop() to stop.

// var cue1 = new Tone.Player(class_270 + "group-project-laura-caius.mp3").toMaster();
// createCue(1, cue1);
// var cue3 = new Tone.Player(class_270 + "group-project-zoe.mp3").toMaster();
// createCue(3, cue3);
var cue5 = new Tone.Player(class_270 + "p1_alejandro.mp3").toMaster();
createCue(5, cue5);
// var cue7 = new Tone.Player(class_270 + "p1_caius.mp3").toMaster();
// createCue(7, cue7);
// var cue9 = new Tone.Player(class_270 + "p1_ethan.mp3").toMaster();
// createCue(9, cue9);
// var cue11 = new Tone.Player(class_270 + "p1_garrett.mp3").toMaster();
// createCue(11, cue11);
var cue13 = new Tone.Player(class_270 + "p1_jade.mp3").toMaster();
createCue(13, cue13);
var cue15 = new Tone.Player(class_270 + "p1_jake.mp3").toMaster();
createCue(15, cue15);
var cue17 = new Tone.Player(class_270 + "p1_julia.mp3").toMaster();
createCue(17, cue17);
var cue19 = new Tone.Player(class_270 + "p1_julian.mp3").toMaster();
createCue(19, cue19);
var cue21 = new Tone.Player(class_270 + "p1_kayla.mp3").toMaster();
createCue(21, cue21);
var cue23 = new Tone.Player(class_270 + "p1_kevin.mp3").toMaster();
createCue(23, cue23);
var cue25 = new Tone.Player(class_270 + "p1_laura.mp3").toMaster();
createCue(25, cue25);
// var cue27 = new Tone.Player(class_270 + "p1_matt.mp3").toMaster();
// createCue(27, cue27);
// var cue29 = new Tone.Player(class_270 + "p1_megan.mp3").toMaster();
// createCue(29, cue29);
// var cue31 = new Tone.Player(class_270 + "p1_rina.mp3").toMaster();
// createCue(31, cue31);
// var cue33 = new Tone.Player(class_270 + "p1_russell.mp3").toMaster();
// createCue(33, cue33);
// var cue35 = new Tone.Player(class_270 + "p1_zoe.mp3").toMaster();
// createCue(35, cue35);

// create 40 (more than necessary) 'waiting' cues on even numbers
for (var i = 0; i < 40; i = i + 2) {
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
