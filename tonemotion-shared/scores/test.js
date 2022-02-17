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
// CUE 0: (same cue copied 3 times so that I can reuse network test server)
var meow = new Tone.Player(demo_sounds + 'meow.mp3').toDestination();

tm.cue[0] = new TMCue('shake', -1);
tm.cue[0].goCue = function() {
  postMessage(2);
};
tm.cue[0].triggerShakeSound = function() {
  meow.start();
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};
