const tm = new ToneMotion();
tm.debug = false; // if true, skips clock sync and shows console
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/bp-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/bp-server/current-cue');
  }
};

// Shortcuts to audio file paths
const demo_sounds = 'tonemotion-shared/audio/demo/';

// NOTE: This score is linked to /bp-demo-orch.html which is used for demonstrating Concerto Molto Grosso (e.g., at a talk). I can load that site on the podium computer to play through the AV system and have people at the talk go to /bp-demo.html on their phones to participate. The tutorial cues are still triggered live, but cue 5 then triggers a) the playback of the concerto recording from this score, and b) the scheduled fixed cues on phones

// *******************************************************************
// CUE 0: piece is in "waiting" state by default
tm.cue[0] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[0].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

// *******************************************************************
// CUE 1: SHAKE tutorial (triggers SHAKE tutorial for phones)
tm.cue[1] = new TMCue('shake', 0, NO_LIMIT);
tm.cue[1].goCue = function() {
};
tm.cue[1].triggerShakeSound = function() {
};
tm.cue[1].stopCue = function() {
};

// *******************************************************************
// CUE 2: tacet tutorial
tm.cue[2] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[2].goCue = function() {
};
tm.cue[2].stopCue = function() {
};

// *******************************************************************
// CUE 3: TILT tutorial (triggers TILT tutorial on phones)
tm.cue[3] = new TMCue('tilt', 0, NO_LIMIT);
tm.cue[3].goCue = function() {
};
tm.cue[3].updateTiltSounds = function() {
};
tm.cue[3].stopCue = function() {
};

// *******************************************************************
// CUE 4: sets status to 'waitingForPieceToStart'
tm.cue[4] = new TMCue('waiting', 0, NO_LIMIT);
tm.cue[4].goCue = function() {
  tm.publicLog('Waiting for piece to start');
};
tm.cue[4].stopCue = function() {
};

// *******************************************************************
// CUE 5: actual beginning of piece
const recording = new Tone.Player(demo_sounds + 'concerto-recording.mp3').toDestination();

tm.cue[5] = new TMCue('tacet', 0, NO_LIMIT);
tm.cue[5].goCue = function() {
  // optimize motion update loop by turning off motion testing when piece starts
  tm.shouldTestMotion = false;
  tm.clearMotionErrorMessage();
  recording.start();
};
tm.cue[5].stopCue = function() {
  recording.stop();
};
