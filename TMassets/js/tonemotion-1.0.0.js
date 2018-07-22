/*
** MOTION HANDLING - DEPENDS ON TONE.js
** Tests if device reports accelerometer values. If so, reports X and Y values as Tone.Signal objects.
** If not, adds an XY-pad to simulate tilting the device.
**
** TODO: add ToneMotionActivityMonitor object to check if people are interacting and dim interface if not
*/

/*
** CREATE GLOBAL OBJECT FOR MOTION DATA: ToneMotion
*/
// instantiate Tone.Signal objects to connect to Tone.js sounds
var xTilt = new Tone.Signal(0.5); // ranges from 0.0 to 1.0. default: 0.5
var yTilt = new Tone.Signal(0.5);
// ToneMotion is a global object with properties visible to Tone.js scripts
var ToneMotion = {
  x: 0.5,
  y: 0.5,
  xSig: xTilt, // connects accelerometer to Tone.Signal objects
  ySig: yTilt,
  updateInterval: 0.05, // time (in seconds) for sampling signal and ramp to next value. latency vs. smoothness
  delayBeforePlaying: "+0.1", // longer delay can improve performance
  status: "unknown", // use to determine if device reports motion
  showStatusLabels: false, // use only for testing
  print: false, // if true, console logs messages in verbose mode
  shouldSyncToUTC: false, // if true, Tone.Transport is set to UTC so all devices will sync anywhere
  deviceShouldSelfCalibrate: false, // if true, device continuously scales troughs to 0.0 and peaks to 1.0
  deviceIsAndroid: false, // Android motion axes are inverted relative to iOS. Will invert if needed.
  shutdown: function() {
    window.removeEventListener("devicemotion", handleMotionEvent, true); // stops listening for motion
    clearInterval(motionCheckIntervId);
    if (this.print) { console.log("ToneMotion.shutdown() called"); }
  }
};

/*
** TEST IF DEVICE REPORTS MOTION. If not, XY-pad will be added by interface.
*/
if ("DeviceMotionEvent" in window) {
  window.addEventListener("devicemotion", handleMotionEvent, true);
  // But wait! Chrome on my laptop sometimes says it reports motion but doesn't. Check for that case below.
}
else {
  ToneMotion.status = "deviceDoesNotReportMotion";
}
// If motion data doesn't change, either the device doesn't report motion or it's perfectly level
var motionCheckIntervId; // interval ID for checking motion detection
var motionCheckDur = 2; // number of seconds before concluding there is no motion detection
var motionCheckInterval = 250; // number of milliseconds between checks
var motionFailCount = (motionCheckDur*1000)/motionCheckInterval;
// Set sensitivity below. Low sensitivity will say device isn't reporting motion if user is holding it fairly flat
var motionCheckSensitivity = 0.01 // motion beyond this threshold shows device is moving
var loThreshold = 0.5 - motionCheckSensitivity; // 0.5 is perfectly level
var hiThreshold = 0.5 + motionCheckSensitivity;
function beginMotionDetection() {
  motionCheckIntervId = setInterval(testForMotion, motionCheckInterval);

  // TODO: move cue check to after PLAY button is tapped
  cueIntervalID = setInterval(updateCueNumber, 500);
}
// closure keeps counter of failed attempts at polling device motion
var testForMotion = (function() {
  var counter = 1; // counter incremented *after* test
  return function() {
    if ( (ToneMotion.x > loThreshold && ToneMotion.x < hiThreshold) && (ToneMotion.y > loThreshold & ToneMotion.y < hiThreshold) ) {
      // no motion detected. check if motionFailCount is exceeded and increment counter.
      if (ToneMotion.print) { console.log("No device motion detected. motionFailCount: " + counter); }
      if (counter > motionFailCount || ToneMotion.status === "deviceDoesNotReportMotion") {
        // Either the device isn't moving or it will not report motion
        ToneMotion.status = "deviceDoesNotReportMotion";
        window.removeEventListener("devicemotion", handleMotionEvent, true); // stops listening for motion
        clearInterval(motionCheckIntervId);
      }
      return counter++;
    }
    else {
      ToneMotion.status = "deviceDoesReportMotion";
      counter = 0; // motion detected. reset counter and use in future if letting user test again
      clearInterval(motionCheckIntervId); // stops testing for motion handling
      return counter;
    }
  };
}());
// check for motion reporting even if browser says it responds to 'devicemotion' because that might be a lie
window.onload = beginMotionDetection();

/*
** NORMALIZE MOTION DATA FOR USE
*/
// iOS devices report accelerationIncludingGravity in -10 to 10 range. Quick motions yield more extreme values.
// Allow device to self-calibrate if the raw accelerometer data falls in a different range.
var accelRange = {
  rawX: 0.0, // raw value as reported by device motion
  loX: -10.0, // both axes will probably have same ranges, but you never know ..
  hiX: 10.0,
  scaleX: 20.0,   // total range of raw motion data (divide by this to get output in normalized range)
  tempX: 0.0, // clamped raw value to be scaled
  rawY: 0.0,
  loY: -10.0,
  hiY: 10.0,
  scaleY: 20.0,
  tempY: 0.0,
  shouldReset: true // if (ToneMotion.deviceShouldSelfCalibrate), must reset thresholds once first
}
// self-calibrating device will call this often at first, then only with extreme motion
function updateAccelRange() {
  accelRange.scaleX = accelRange.hiX - accelRange.loX; // find full range of raw values
  accelRange.scaleY = accelRange.hiY - accelRange.loY;
}

// Android devices report motion in same range as iOS but with inverted axes. Check if device is Android
// UA sniffing is supposed to be really bad, but this is the only way to automatically invert axes on Android
// worse-case scenario: axes are inverted when they shouldn't, which is less bad than not inverting when they should
// Could also have user select checkbox to invert axes, but that requires more setup of device
const userAgent = window.navigator.userAgent;
if (userAgent.match(/Android/i)) {
  ToneMotion.deviceIsAndroid = true;
}
else {
  ToneMotion.deviceIsAndroid = false;
}

// sets ToneMotion.x and .y by polling and normalizing motion data. called in response to "devicemotion"
function handleMotionEvent(event) {
  // get the raw accelerometer values (invert if Android)
  if (ToneMotion.deviceIsAndroid) {
    accelRange.rawX = -(event.accelerationIncludingGravity.x);
    accelRange.rawY = -(event.accelerationIncludingGravity.y);
  }
  else {
    accelRange.rawX = event.accelerationIncludingGravity.x;
    accelRange.rawY = event.accelerationIncludingGravity.y;
  }
  // calibrate range of values for clamp (only if device is set to self-calibrate)
  if (ToneMotion.deviceShouldSelfCalibrate) {
    if (accelRange.shouldReset) { // only true initially
      accelRange.loX = Number.POSITIVE_INFINITY; // anything will be less than this
      accelRange.hiX = Number.NEGATIVE_INFINITY; // anything will be greater than this
      accelRange.loY = Number.POSITIVE_INFINITY;
      accelRange.hiY = Number.NEGATIVE_INFINITY;
      accelRange.shouldReset = false; // only reset once
    }
    if (accelRange.rawX < accelRange.loX) { // new trough
      accelRange.loX = accelRange.rawX;
      updateAccelRange();
    }
    else if (accelRange.rawX > accelRange.hiX) { // new peak
      accelRange.hiX = accelRange.rawX;
      updateAccelRange();
    }
    if (accelRange.rawY < accelRange.loY) {
      accelRange.loY = accelRange.rawY;
      updateAccelRange();
    }
    else if (accelRange.rawY > accelRange.hiY) {
      accelRange.hiY = accelRange.rawY;
      updateAccelRange();
    }
  }
  // clamp: if device does not self-calibrate, default to iOS range (typically -10 to 10)
  if (accelRange.rawX < accelRange.loX) { // thresholds are immutable if ToneMotion.deviceShouldSelfCalibrate == false
    accelRange.tempX = accelRange.loX;
  }
  else if (accelRange.rawX > accelRange.hiX) {
    accelRange.tempX = accelRange.hiX;
  }
  else {
    accelRange.tempX = accelRange.rawX;
  }
  if (accelRange.rawY < accelRange.loY) {
    accelRange.tempY = accelRange.loY;
  }
  else if (accelRange.rawY > accelRange.hiY) {
    accelRange.tempY = accelRange.hiY;
  }
  else {
    accelRange.tempY = accelRange.rawY;
  }
  // normalize to 0.0 to 1.0
  ToneMotion.x  = (accelRange.tempX - accelRange.loX) / accelRange.scaleX; // set properties of ToneMotion object
  ToneMotion.y  = (accelRange.tempY - accelRange.loY) / accelRange.scaleY;
}

// packet size reduced by subtracting bias on server and adding on client
// at time of coding (2018-07-18) Date.now() returns 1531970463500
var url = 'https://jack-cue-manager-test.herokuapp.com/test-server/current-cue'
const timestampBias = 1531970463500;
// cueOnClient is set when cue from server doesn't match.
var cueOnClient = -1; // wait period of piece begins at 0
var cueTimeFromServer = 0;
function updateCueNumber() {
  fetch(url)
  .then(response => response.json())
  .then(jsonRes => {
    // check if there's a new cue
    // checks cue *time* (not number) because in rehearsal the same cue
    // could be retriggered. same cue number, different time.
    if (cueTimeFromServer !== jsonRes.t+timestampBias) { // go new cue
      cueOnClient = jsonRes.c;
      cueTimeFromServer = jsonRes.t + timestampBias;
      goCue(cueOnClient, cueTimeFromServer);
    } // else no new cue and control falls through
  })
  // TODO: implement a "public" error message on mobile interface
  .catch(error => console.error(`Fetch Error =\n`, error));
}

// wrap setTimeout in Promise
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// estimate latency from POST request to server. move elsewhere later
const serverLatency = 40; // milliseconds

function goCue(cue, serverTime) {
  // clear all current cues
  for (var i = 0; i < cueList.length; i++) {
    if (cueList[i] && cueList[i].isPlaying) {
      // stop this cue
      cueList[i].isPlaying = false;
    }
  }

  // trigger cue with minimum latency if waitTime is -1
  if (cueList[cue] && (cueList[cue].waitTime == -1)) {
    try { cueList[cue].goCue(); } catch(e) { console.log(e); }
    cueList[cue].isPlaying = true;
    return;
  }

  // check that cue exists. if so, calculate delay before triggering cue
  if (cueList[cue]) {
    var delay = serverTime - serverLatency + cueList[cue].waitTime - Date.now();
  } else {
    console.log('Cue number ' + cue + ' does not exist.');
    return;
  }

  // trigger new cue (immediately or after wait time)
  if ((cueList[cue].openWindow + delay) < 0) {
    console.log('you missed your cue!'); // TODO: PUBLIC ERROR
  } else if (delay < 4) {
    // no need for delay shorter than 4ms
    try { cueList[cue].goCue(); } catch(e) { console.log(e); }
    cueList[cue].isPlaying = true;
  } else {
    wait(delay).then(() => {
      try { cueList[cue].goCue(); } catch(e) { console.log(e); }
      cueList[cue].isPlaying = true;
    })
  }
}

// empty array to fill with cues
var cueList = [];

/**
 * Create a new musical section
 * @param {number} waitTime - Delay before cue is triggered.
 * Use -1 for minimum latency response (no need for openWindow param)
 * NB: sounds from previous cue cleared as soon as client gets cue, so
 * a long waitTime can result in silence between cues
 * @param {number} openWindow - How late a cue can be triggered
 * For no limit, just use waitTime of -1 for immediate trigger
 * (total tolerable latency for this cue is waitTime + openWindow)
 * @param {boolean} isPlaying - Set to true when cue is playing
 * No need to set while instantiating object
 */
function TMCue(waitTime, openWindow) {
  this.waitTime = waitTime;
  this.openWindow = openWindow;
  this.isPlaying = false; // not set by constructor
}
TMCue.prototype.goCue = function() {
  // override this method in score to code the music for this section
  console.log('No music coded for this section.');
}

// test cues
cueList[0] = new TMCue(-1);
cueList[0].goCue = function() {
  console.log('cueList[0].goCue() called');
}

cueList[1] = new TMCue(2000, 0);
cueList[1].goCue = function() {
  console.log('cueList[1].goCue() called');
}

cueList[2] = new TMCue(0, 300);

cueList[4] = new TMCue(3000, 0);
cueList[4].goCue = function() {
  console.log('cueList[4].goCue() called at ' + Date.now());
}

cueList[7] = new TMCue(1000, 500);
cueList[7].goCue = function() {
  console.log('cueList[7].goCue() called');
}

cueList[8] = new TMCue(500, 0);
cueList[8].goCue = function() {
  console.log('cueList[8].goCue() called');
}

cueList[9] = new TMCue(-1);
cueList[9].goCue = function() {
  console.log('cueList[9].goCue() called AS SOON AS I CAN at ' + Date.now());
}

/*
** MAKE SOUNDS INTERACTIVE
** Some Tone.js object properties are signals and can be chained to ToneMotion signals, e.g.:
** ToneMotion.ySig.chain(filterFreqScale, filter.frequency);
** Other properties must be set within repeated function calls, e.g., updateSoundsInCue1()
*/
// updateInteractiveSounds() is called once per ToneMotion.updateInterval (default: 0.05 seconds)
// not called until interface is set up and parameters (e.g., ToneMotion.updateInterval) are set
function updateInteractiveSounds() {
  if (ToneMotion.status === "deviceDoesReportMotion") {
    // If device reports motion, ToneMotion.x and .y are set by accelerometer. Use those to set smooth control signals.
    ToneMotion.xSig.linearRampToValue(ToneMotion.x, ToneMotion.updateInterval); // smooths signals to avoid zipper noise
    ToneMotion.ySig.linearRampToValue(ToneMotion.y, ToneMotion.updateInterval);
  }
  else if (ToneMotion.status === "deviceDoesNotReportMotion") {
    // If device doesn't report motion, signals are set by XY-pad simulator. Sample that to set ToneMotion.x and .y
    ToneMotion.x = ToneMotion.xSig.value;
    ToneMotion.y = ToneMotion.ySig.value;
  }
  // one solution for stepping through cue list. not great because it limits number of sections arbitrarily.
  switch (TMScore.currentCue) {
    case 0:
      // piece hasn't started yet. no error, but do nothing
      if (ToneMotion.print) { console.log("Piece hasn't started yet. No interactive sounds to update."); }
      break;
    case 1:
      try { updateSoundsInCue1() } catch(e) { console.log(e); }
      break;
    case 2:
      try { updateSoundsInCue2() } catch(e) { console.log(e); }
      break;
    case 3:
      try { updateSoundsInCue3() } catch(e) { console.log(e); }
      break;
    case 4:
      try { updateSoundsInCue4() } catch(e) { console.log(e); }
      break;
    case 5:
      try { updateSoundsInCue5() } catch(e) { console.log(e); }
      break;
    case 6:
      try { updateSoundsInCue6() } catch(e) { console.log(e); }
      break;
    case 7:
      try { updateSoundsInCue7() } catch(e) { console.log(e); }
      break;
    case 8:
      try { updateSoundsInCue8() } catch(e) { console.log(e); }
      break;
    case 9:
      try { updateSoundsInCue9() } catch(e) { console.log(e); }
      break;
    case 10:
      try { updateSoundsInCue10() } catch(e) { console.log(e); }
      break;
    case 11:
      try { updateSoundsInCue11() } catch(e) { console.log(e); }
      break;
    case 12:
      try { updateSoundsInCue12() } catch(e) { console.log(e); }
      break;
    case 13:
      try { updateSoundsInCue13() } catch(e) { console.log(e); }
      break;
    case 14:
      try { updateSoundsInCue14() } catch(e) { console.log(e); }
      break;
    case 15:
      try { updateSoundsInCue15() } catch(e) { console.log(e); }
      break;
    case 16:
      try { updateSoundsInCue16() } catch(e) { console.log(e); }
      break;
    case 17:
      try { updateSoundsInCue17() } catch(e) { console.log(e); }
      break;
    case 18:
      try { updateSoundsInCue18() } catch(e) { console.log(e); }
      break;
    case 19:
      try { updateSoundsInCue19() } catch(e) { console.log(e); }
      break;
    case 20:
      try { updateSoundsInCue20() } catch(e) { console.log(e); }
      break;
    default:
      console.log("No corresponding cue number found. This should never happen."); // should never happen
  }
  if (ToneMotion.showStatusLabels) { updateStatusLabels(); }
}

/*
** OBJECT FOR MANAGING CUE LIST: TMScore
** different sections may have different interactive sounds and button functions. manage with cuelist
*/
var TMScore = {
  // maximum number of sections set by MAX_CUES. changing this means changing a lot of code
  st: 0, // current transport time to be incremented throughout score
  MAX_CUES: 20, // should not be modified
  currentCue: 0,
  durForCue: { // set duration of each cue in main script
    0: 0, // need for .timeAtCue(cue) function so that .timeAtCue(1) returns 0 (0'00")
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 0,
    20: 0
  },
  timeAtCue: function(cue) {
    // returns time at beginning of any section
    // allows asking for cue time from cue #1 (always 0:00) to cue #MAX_CUES+1 (i.e., end of score)
    if (cue < 1 || cue > (this.MAX_CUES + 1)) {
      console.log("Cue number must be from 1 to " + (this.MAX_CUES + 1));
    }
    else {
      var time = 0;
      for (var i = 0; i < cue; i++)  {
        time += this.durForCue[i];
      }
      if (ToneMotion.print) {
        // shows time at beginning of this cue (e.g., TMScore.timeAtCue(3): 162 seconds (2:42))
        var minutes = Math.floor(time / 60);
        var seconds = time % 60;
        // display seconds with leading zero so we see e.g., 3:02 instead of 3:2
        var paddedSec = (seconds < 10) ? ("0" + seconds) : seconds;
        console.log("TMScore.timeAtCue(" + cue + "): " + time + " seconds (" + minutes + ":" + paddedSec + ")");
      }
      return time;
    }
  },
  totalDur: function() {
    // returns total duration of score by calculating time at "double-bar" (cue #MAX_CUES+1)
    return this.timeAtCue(this.MAX_CUES + 1);
  },
  currentCueAtTime: function(time) {
    // returns current section given any time, which may be in the middle of a section
    if (time < 0 || time > this.totalDur()) {
      console.log("TMScore.currentCueAtTime(time) called with time outside of score: " + time);
      return -1;
    }
    else {
      for (i = this.MAX_CUES; i > 0; i--) {
        if (time >= this.timeAtCue(i)) {
          return i;
        }
      }
    }
  },
  instructionsForCue: { // write instructions as string property of this object to pass to setInstructions()
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: "",
    15: "",
    16: "",
    17: "",
    18: "",
    19: "",
    20: ""
  },
  cueEnablesButtons: { // TMScore.cueEnablesButtons[cue-number][action-buttons-to-enable:1,2,3]
    0: [0,0,0], // all buttons disabled by default. use this property to enable buttons by section.
    1: [0,0,0],
    2: [0,0,0],
    3: [0,0,0],
    4: [0,0,0],
    5: [0,0,0],
    6: [0,0,0],
    7: [0,0,0],
    8: [0,0,0],
    9: [0,0,0],
    10: [0,0,0],
    11: [0,0,0],
    12: [0,0,0],
    13: [0,0,0],
    14: [0,0,0],
    15: [0,0,0],
    16: [0,0,0],
    17: [0,0,0],
    18: [0,0,0],
    19: [0,0,0],
    20: [0,0,0]
  },
  nextCue: function() {
    // increment cue list and set buttons states and instructions for this cue
    if (this.currentCue == this.MAX_CUES) {
      console.log("Cue list already at maximum value of " + this.MAX_CUES);
    }
    else {
      this.currentCue++;
      setActionButtonStatesForCue(this.currentCue);
      setInstructions(this.instructionsForCue[this.currentCue]);
    }
  },
  setCue: function(cue) {
    // jump immediately to this cue and set buttons states and instructions
    if (cue > this.MAX_CUES) {
      console.log("Can't set cue " + cue + " because it exceeds maximum value of " + this.MAX_CUES);
    }
    else {
      this.currentCue = cue - 1; // main script increments to next cue through .nextCue()
      // move Transport position to beginning of new cue
      var transportTimeToAdd = 0;
      for (i = 1; i < cue; i++) {
        transportTimeToAdd += this.durForCue[i];
      }
      Tone.Transport.position = transportTimeToAdd;
    }
  }
};
