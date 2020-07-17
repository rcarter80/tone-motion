const tm = new ToneMotion();
// TODO: turn off debug mode
tm.debug = true; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

// Shortcut to audio file path
const class_370 = 'tonemotion-shared/audio/class_370/';
// list of file names (excluding .mp3 file extension) to load into cues
var filesToLoad = [
  "p1_anthony1",
  "p1_anthony2",
  "p1_cconley"
];
// empty array to fill with Tone.Player objects
var playerArray = [];
// sound files alternate with 'waiting' cues, so # of cues > # of files to load
var cueCount = 0;
// reference to current cue
var thisCue;

playerArray[0] = new Tone.Player(class_370 + filesToLoad[0] + '.mp3').toMaster();

for (var i = 0; i < filesToLoad.length; i++) {
  // first create 'waiting' cue for before listening
  tm.cue[cueCount] = new TMCue('waiting', -1);
  tm.cue[cueCount].goCue = function() {
    // nothing to do here
  };
  tm.cue[cueCount].stopCue = function() {
    // nothing to do here
  };
  cueCount++;

  // next create Tone.Player object and create playing cue
  playerArray[i] = new Tone.Player(class_370 + filesToLoad[i] + '.mp3').toMaster();
  createCue(cueCount, playerArray[i]);
  cueCount++;

  // after last audio file, create one additional 'finished' cue
  if (i == (filesToLoad.length - 1)) {
    tm.cue[cueCount] = new TMCue('finished', -1);
    tm.cue[cueCount].goCue = function() {
      // nothing to do here
    };
    tm.cue[cueCount].stopCue = function() {
      // nothing to do here
    };
  }
}

// function to generate listening cue
function createCue(cueNum, cue) {
  tm.cue[cueNum] = new TMCue('listen', 2000, NO_LIMIT);
  tm.cue[cueNum].goCue = function() {
    cue.start();
  };
  tm.cue[cueNum].stopCue = function() {
    cue.stop();
  };
}
