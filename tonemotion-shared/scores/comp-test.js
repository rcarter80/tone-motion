const tm = new ToneMotion();
tm.debug = true; // if true, skips clock sync and shows console
tm.meter.isOn = true;
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/jack-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/jack-server/current-cue');
  }
};

const player = new Tone.Player({
  url: "tonemotion-shared/audio/misc/test-square.mp3",
  loop: true,
}).toDestination();

// *******************************************************************
tm.cue[0] = new TMCue('shake', -1);
tm.cue[0].goCue = function() {
  player.start();
};
tm.cue[0].stopCue = function() {
  player.stop();
};
