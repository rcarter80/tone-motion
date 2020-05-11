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
const class_seniors = 'tonemotion-shared/audio/class_seniors/';
// load audio files for listening to in class
var cue1 = new Tone.Player(class_seniors + "Fly Right By (Ft. Ben Leit).mp3").toMaster();
createCue(1, cue1);
var cue3 = new Tone.Player(class_seniors + "Outro - Spring Moonlight.mp3").toMaster();
createCue(3, cue3);

var cue5 = new Tone.Player(class_seniors + "Apple of My Eye.mp3").toMaster();
createCue(5, cue5);
var cue7 = new Tone.Player(class_seniors + "never said THESIS.mp3").toMaster();
createCue(7, cue7);

var cue9 = new Tone.Player(class_seniors + "Deepend.mp3").toMaster();
createCue(9, cue9);

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
