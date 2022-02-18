const tm = new ToneMotion();
tm.debug = true;
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/test-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/test-server/current-cue');
  }
};

// Shortcuts to audio file path
const demo_sounds = 'tonemotion-shared/audio/demo/';

// *******************************************************************
// CUE 0: (same cue copied 3 times so that I can reuse network test server)
var meow = new Tone.Player(demo_sounds + 'meow.mp3').toDestination();

tm.cue[0] = new TMCue('shake', -1);
tm.cue[0].goCue = function() {
  // TODO: add "testing" countdown. Test against motionFailCount (if it's 0, everything is fine, and say so). if error, includes instructions: screenshot and send to me - include email address.
};
tm.cue[0].triggerShakeSound = function() {
  meow.start();
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// TODO: copy cue 0 two more times, bc test server has cue 2 as max
