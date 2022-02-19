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

let meow = new Tone.Player('tonemotion-shared/audio/demo/meow.mp3').toDestination();

function testMotion() {
  tm.publicMessage('Testing: 10');
  setTimeout(() => { tm.publicMessage('Testing: 9'); }, 1000);
  setTimeout(() => { tm.publicMessage('Testing: 8'); }, 2000);
  setTimeout(() => { tm.publicMessage('Testing: 7'); }, 3000);
  setTimeout(() => { tm.publicMessage('Testing: 6'); }, 4000);
  setTimeout(() => { tm.publicMessage('Testing: 5'); }, 5000);
  setTimeout(() => { tm.publicMessage('Testing: 4'); }, 6000);
  setTimeout(() => { tm.publicMessage('Testing: 3'); }, 7000);
  setTimeout(() => { tm.publicMessage('Testing: 2'); }, 8000);
  setTimeout(() => { tm.publicMessage('Testing: 1'); }, 9000);

  setTimeout(() => {
    if (tm.motionFailCount < tm.motionFailThreshold) {
      tm.publicMessage("Everything seems to be working fine! <br><br> If you don't hear any sound when you shake your phone, could you please take a screenshot of the following and email it to me? My email is ryan@ryancarter.org. Thanks so much! <br> user agent: " + window.navigator.userAgent + '<br> motionFailCount: ' + tm.motionFailCount + '<br> motionPermissionStatus: ' + tm.motionPermissionStatus + '<br> accel x: ' + tm.accel.x + '<br> accel y: ' + tm.accel.y + '<br> status: ' + tm.status);
    } else {
      tm.publicMessage('Hmm, there seems to be a problem. Could you please take a screenshot of the following and email it to me? My email is ryan@ryancarter.org. Thanks so much! <br> user agent: ' + window.navigator.userAgent + '<br> motionFailCount: ' + tm.motionFailCount + '<br> motionPermissionStatus: ' + tm.motionPermissionStatus + '<br> accel x: ' + tm.accel.x + '<br> accel y: ' + tm.accel.y + '<br> status: ' + tm.status);
    }
  }, 10000);

}

// *******************************************************************
// CUE 0: (same cue copied 3 times so that I can reuse network test server)

tm.cue[0] = new TMCue('shake', -1);
tm.cue[0].goCue = function() {
  testMotion();
};
tm.cue[0].triggerShakeSound = function() {
  meow.start();
};
tm.cue[0].stopCue = function() {
  // nothing to clean up
};

tm.cue[1] = new TMCue('shake', -1);
tm.cue[1].goCue = function() {
  testMotion();
};
tm.cue[1].triggerShakeSound = function() {
  meow.start();
};
tm.cue[1].stopCue = function() {
  // nothing to clean up
};

tm.cue[2] = new TMCue('shake', -1);
tm.cue[2].goCue = function() {
  testMotion();
};
tm.cue[2].triggerShakeSound = function() {
  meow.start();
};
tm.cue[2].stopCue = function() {
  // nothing to clean up
};
