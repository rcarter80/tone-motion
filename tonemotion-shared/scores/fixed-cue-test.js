const tm = new ToneMotion();
tm.debug = false;
tm.showConsoleOnLaunch = true;
window.onload = function() {
  // must initialize with URL for cue server, which is unique to piece
  // fetch cues from localhost if tm.localTest is true
  if (tm.localTest) {
    tm.init('http://localhost:3000/test-server/current-cue');
  } else {
    tm.init('https://tonemotion-cue-manager.herokuapp.com/test-server/current-cue');
  }
};

// Shortcuts to audio file paths
const granulated_sounds = 'tonemotion-shared/audio/granulated/';
const perc_sounds = 'tonemotion-shared/audio/perc/';
// wait time for every cue
var cueDelay = 1000;
// late cues triggered after more than this much time throw warning
var latencyWarningThresh = 500;
// late cues past this point throw (stern) warning
var latencyErrorThresh = 2000;
var timestamp, cueOffset;
// flag to know when to post first instructional message
var welcomeMessageHasBeenPosted = false;
// function to display latency test result (or welcome message)
function postMessage(cue) {
  // at first, message should give instructions, not test result
  if (!welcomeMessageHasBeenPosted) {
    tm.publicMessage('Welcome! Log into the <a href="https://tonemotion-cue-manager.herokuapp.com/login" target="_blank" style="color:yellow;">test server</a> with username: test and password: test, then click the button to send a cue. Tap the question mark for more instructions.');
    welcomeMessageHasBeenPosted = true;
    // subsequent cues yield test result
  } else {
    timestamp = Date.now() - tm.clientServerOffset;
    // delay between time cue is set on server and time it's triggered should ideally be exactly the same amount as cueDelay (defined above), but if there is very high latency in the network, it may be higher
    cueOffset = (timestamp - tm.cueTimeFromServer) - cueDelay;
    if (cueOffset > latencyErrorThresh) {
      tm.publicWarning('This cue was triggered ' + cueOffset + ' milliseconds late. There appears to be a problem with the network connection (unless you tapped the "stop" button and then tapped "start" again, in which case everything is fine).');
    } else if (cueOffset > latencyWarningThresh) {
      tm.publicWarning('This cue was triggered ' + cueOffset + ' milliseconds late. If you continue to experience similar results, the connection is a bit slow, but the piece will still work. (Some audience members may occasionally miss cues.)');
    } else {
      switch (cue) {
        case 0:
          tm.publicMessage('Everything is working fine! During a section marked "tacet," your device will not make sound.');
          break;
        case 1:
          tm.publicMessage('Everything is working fine! During a section marked "tilt," your device will make sounds that respond to the position of your phone. In this case, you can mute your phone by holding it right-side up. The short, repeated sound gets louder, faster, and higher as you tip your phone upside down.');
          break;
        case 2:
          tm.publicMessage('Everything is working fine! During a section marked "shake," you can trigger sounds by shaking your phone. If you hold your phone still, it will not make sound.');
          break;
        default:
          tm.publicError('Error identifying interactivity mode.');
      }
    }
  }
}

// *******************************************************************
// CUE 0: TACET
tm.cue[0] = new TMCue('tacet', cueDelay, NO_LIMIT);
tm.cue[0].goCue = function() {
  // nothing to do here
};
tm.cue[0].stopCue = function() {
  // nothing to do here
};

// *******************************************************************
// CUE 1: TILT
var claveLoop = new Tone.Player(granulated_sounds + "claveLoop.mp3").toMaster();
claveLoop.loop = true;

tm.cue[1] = new TMCue('tilt', cueDelay, NO_LIMIT);
tm.cue[1].goCue = function() {
  claveLoop.start();
};
tm.cue[1].updateTiltSounds = function() {
  // sound is full scale if phone is mostly upright. muted if upside down.
  if (tm.accel.y < 0.5) {
    claveLoop.volume.value = (tm.accel.y * 198 - 99);
  } else {
    claveLoop.volume.value = 0;
  }
  // pitch and speed go up on y-axis
  claveLoop.playbackRate = 0.1 + tm.accel.y * 2.9;
};
tm.cue[1].stopCue = function() {
  claveLoop.stop();
};

// *******************************************************************
// CUE 2: SHAKE
var clave = new Tone.Player(perc_sounds + 'clave.mp3').toMaster();

tm.cue[2] = new TMCue('shake', cueDelay, NO_LIMIT);
tm.cue[2].goCue = function() {
  // nothing to do here
};
tm.cue[2].triggerShakeSound = function() {
  clave.start();
};
tm.cue[2].stopCue = function() {
  // nothing to clean up
};

// testing calling triggerCue from score
Tone.Transport.schedule((time) => {
	tm.triggerFixedCue(2);
}, "+1");
Tone.Transport.schedule((time) => {
	tm.triggerFixedCue(1, 0);
}, "+2");
Tone.Transport.schedule((time) => {
	tm.triggerFixedCue(2, 4000);
}, "+3");
