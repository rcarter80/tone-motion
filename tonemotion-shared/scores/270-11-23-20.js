const tm = new ToneMotion();
tm.debug = false; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

// *******************************************************************
// INSERT DATE AND COPY AUDIO FILE NAMES (WITHOUT .mp3 EXTENSION) BELOW
const listeningDate = 'November 23';
// list of file names (excluding .mp3 file extension) to load into cues
// TODO: replace test files below with Fall 2020 MUS 270 group projects
var filesToLoad = [
  "Lindsay",
  "Anthony",
  "Simon"
];

// *******************************************************************
// NO NEED TO CHANGE ANYTHING BELOW

// load date into title
document.querySelector('#dateForTitle').innerHTML = listeningDate;
// Shortcut to audio file path
const class_270 = 'tonemotion-shared/audio/class_270/';
// empty array to fill with Tone.Player objects
var playerArray = [];
// sound files alternate with 'waiting' cues, so # of cues > # of files to load
var cueCount = 0;

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

  // next create Tone.Player object and create listening cue
  playerArray[i] = new Tone.Player(class_270 + filesToLoad[i] + '.mp3').toMaster();
  createCue(cueCount, playerArray[i], filesToLoad[i]);
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
function createCue(cueNum, cue, fileName) {
  tm.cue[cueNum] = new TMCue('listen', 2000, NO_LIMIT);
  tm.cue[cueNum].goCue = function() {
    // calculate elapsed time since file started and convert to seconds
    var elapsedTime = (Date.now() - tm.clientServerOffset - tm.cue[cueNum].startedAt) / 1000;
    // if cue is triggered late (or someone stops and starts), sync listening
    if (elapsedTime > 1) {
      cue.start('+0', elapsedTime);
    } else {
      cue.start();
    }
    // post label with file name currently playing
    tm.publicMessage('Current sound file: ' + fileName);
  };
  tm.cue[cueNum].stopCue = function() {
    cue.stop();
  };
}
