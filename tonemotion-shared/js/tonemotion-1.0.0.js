/*
** CREATE GLOBAL TONE MOTION OBJECT FOR MOTION DATA: TM
*/
// instantiate Tone.Signal objects to connect to Tone.js sounds
var xTilt = new Tone.Signal(0.5); // ranges from 0.0 to 1.0. default: 0.5
var yTilt = new Tone.Signal(0.5);
// TM is a global object with properties visible to Tone.js scripts
var TM = {
  x: 0.5,
  y: 0.5,
  xSig: xTilt, // connects accelerometer to Tone.Signal objects
  ySig: yTilt,
  updateInterval: 0.05, // time (in seconds) for sampling signal and ramp to next value. latency vs. smoothness
  delayBeforePlaying: "+0.1", // longer delay can improve performance
  motionStatus: "unknown", // use to determine if device reports motion
  showStatusLabels: false, // use only for testing
  print: false, // if true, console logs messages in verbose mode
  shouldSyncToUTC: false, // if true, Tone.Transport is set to UTC so all devices will sync anywhere
  deviceShouldSelfCalibrate: false, // if true, device continuously scales troughs to 0.0 and peaks to 1.0
  deviceIsAndroid: false, // Android motion axes are inverted relative to iOS. Will invert if needed.
  debug: true, // Set to default of false for production
  serverLatency: 0, // Compensates for latency in setting cue
  clientServerOffset: 0, // will update with syncClocks()
  status: 'loading', // application status
  currentCue: 0, // will be replaced with TMCue object
  MAX_DELAY: 10000, // (ms.) maximum duration for scheduling into future
  shutdown: function() {
    window.removeEventListener("devicemotion", handleMotionEvent, true); // stops listening for motion
    clearInterval(motionCheckIntervId);
    if (this.print) { console.log("TM.shutdown() called"); }
  }
};

/*
** DOM HOOKS
*/

const statusLabel = document.querySelector('#statusLabel');
const startStopButton = document.querySelector('#startStopButton');
const publicMessageLabel = document.querySelector('#messageLabel');
const consoleCheckbox = document.querySelector('#consoleCheckbox');
const publicConsoleLabel = document.querySelector('#publicConsole');

// Sets text and class name for main status label in center panel
function setStatusLabel(text, className) {
  statusLabel.className = className;
  statusLabel.innerHTML = text;
}

// Sets text and class name for main button in center panel
function setStartStopButton(text, className) {
  startStopButton.className = className;
  startStopButton.innerHTML = text;
}

// Sets application status, updates status label and button in center
function setStatus(status) {
  // no need to reset status if there's no change in status
  if (status === TM.status) {
    return;
  }
  TM.status = status;
  clearMessageLabel(); // clear any previous message from previous state

  switch (status) {
    case 'loading':
      setStatusLabel('loading', 'active');
      setStartStopButton('', 'hidden');
      break;
    case 'synchronizing':
      setStatusLabel('synchronizing', 'active');
      setStartStopButton('', 'hidden');
      break;
    case 'readyToPlay':
      setStatusLabel('ready', 'default');
      setStartStopButton('start', 'start');
      break;
    case 'waitingForPieceToStart':
      setStatusLabel('waiting', 'active');
      setStartStopButton('stop', 'stop');
      publicMessage("The piece hasn't start yet, but you're all set. The music will start automatically.");
    case 'playing':
      setStartStopButton('stop', 'stop');
      setInteractivityMode();
      break;
    case 'stopped':
      setStatusLabel('stopped', 'default')
      setStartStopButton('start', 'start')
      break;
    case 'finished':
      setStatusLabel('finished', 'default');
      setStartStopButton('', 'hidden');
      break;
    case 'error':
      shutEverythingDown();
      setStatusLabel('error', 'error');
      setStartStopButton('try again', 'reload');
      break;
    default:
      publicError('Error setting application status');
  }

  if (TM.debug) {
    publicLog('Application status set to: ' + status);
  }
}

// Updates status label and button when application is 'playing'
function setInteractivityMode() {
  switch (TM.currentCue.mode) {
    case 'waiting': // piece hasn't started yet
      setStatus('waitingForPieceToStart');
      break;
    case 'tacet':
      setStatusLabel('tacet', 'default');
      break;
    case 'tilt':
      setStatusLabel('tilt', 'default');
      break;
    case 'shake':
      setStatusLabel('shake', 'default');
      break;
    case 'tiltAndShake':
      setStatusLabel('tilt and shake', 'default');
      break;
    case 'listen':
      setStatusLabel('just listen', 'default');
      break;
    case 'finished':
    setStatus('finished');
    break;
    default:
      publicError('Error setting interactivity mode')
  }
}

// Determines action associated with startStopButton
startStopButton.onclick = function() {
  switch (TM.status) {
    case 'readyToPlay':
      cueIntervalID = setInterval(updateCueNumber, 500);
      // TODO: start audio context. All additional startup
      break;
    case 'waitingForPieceToStart':
      shutEverythingDown();
      break;
    case 'playing':
      shutEverythingDown();
      break;
    case 'stopped':
      cueIntervalID = setInterval(updateCueNumber, 500);
      // TODO: start audio context
      break;
    case 'error':
      // Reload the current page, without using the cache
      window.location.reload(true);
      break;
    default:
      publicError('Error setting function for button');
  }
}

// Clears all sound, loops, motion handling, and network requests
function shutEverythingDown() {
  publicLog('Shutting down');
  window.clearInterval(cueIntervalID);
  // TODO: clear all cues
  setStatus('stopped');
}

// Monitor progress of loading Tone.Buffer objects for audio files

// Load test audio file into Tone.Buffer (same audio file as <audio> shim to tell Safari that page should play audio)
const bufferLoadingTestFile = new Tone.Players({
  // TODO: simplify this: use PLayer instead of Players?
  // verify that no callback or routing .toMaster() needed
  // if this doesn't work, piece with no audio files will never load
  "bufferLoadingTestFile": "./tonemotion-shared/audio/silent-buffer-to-set-audio-session.mp3"
});

Tone.Buffer.on('progress', function() {
  setStatus('loading');
  if (TM.debug) {
    console.log('Audio buffers loading');
  }
});

Tone.Buffer.on('load', function() {
  setStatus('synchronizing');
  syncClocks(); // as soon as audio buffers load, sync client to server
  if (TM.debug) {
    console.log('Audio buffers finished loading');
  }
});

Tone.Buffer.on('error', function() {
  publicError('There was an error loading the sound files.');
});

/*
** MESSAGES TO CENTER LABEL AND LEFT PANEL CONSOLE
*/

// Prints to message label on center panel
function publicMessage(message) {
  publicMessageLabel.className = 'default';
  publicMessageLabel.innerHTML = message;
}

// Prints to message label (styled as warning)
function publicWarning(message) {
  publicMessageLabel.className = 'warning';
  publicMessageLabel.innerHTML = message;
  console.warn(message);
}

// Prints to message label (styled as error) AND sets TM.status to 'error' AND stops execution (with option to restart)
function publicError(message) {
  setStatus('error');
  publicMessageLabel.className = 'error';
  publicMessageLabel.innerHTML = message;
  console.error(message);
}

// Clears message label
function clearMessageLabel() {
  publicMessageLabel.className = 'hidden';
  publicMessageLabel.innerHTML = '';
}

// Prints to console.log and to interface if consoleCheckbox is checked
function publicLog(message) {
  if (consoleCheckbox.checked) {
    var logMessage = document.createElement('p');
    logMessage.className = 'logMessage';
    logMessage.innerHTML = message;
    publicConsoleLabel.appendChild(logMessage);
  }
  console.log(message);
}

// Clears console label in help panel
function clearConsole() {
  var logMessages = document.getElementsByClassName('logMessage');

  while (logMessages[0]) {
    logMessages[0].parentNode.removeChild(logMessages[0]);
  }
}

/*
** TEST IF DEVICE REPORTS MOTION.
*/
if ("DeviceMotionEvent" in window) {
  window.addEventListener("devicemotion", handleMotionEvent, true);
  // But wait! Chrome on my laptop sometimes says it reports motion but doesn't. Check for that case below.
}
else {
  TM.motionStatus = "deviceDoesNotReportMotion";
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
}

// closure keeps counter of failed attempts at polling device motion
var testForMotion = (function() {
  var counter = 1; // counter incremented *after* test
  return function() {
    if ( (TM.x > loThreshold && TM.x < hiThreshold) && (TM.y > loThreshold & TM.y < hiThreshold) ) {
      // no motion detected. check if motionFailCount is exceeded and increment counter.
      if (TM.print) { console.log("No device motion detected. motionFailCount: " + counter); }
      if (counter > motionFailCount || TM.motionStatus === "deviceDoesNotReportMotion") {
        // Either the device isn't moving or it will not report motion
        TM.motionStatus = "deviceDoesNotReportMotion";
        window.removeEventListener("devicemotion", handleMotionEvent, true); // stops listening for motion
        clearInterval(motionCheckIntervId);
      }
      return counter++;
    }
    else {
      TM.motionStatus = "deviceDoesReportMotion";
      counter = 0; // motion detected. reset counter and use in future if letting user test again
      clearInterval(motionCheckIntervId); // stops testing for motion handling
      return counter;
    }
  };
}());
// check for motion reporting even if browser says it responds to 'devicemotion' because that might be a lie
// Google reference also puts start audio context here:
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
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
  shouldReset: true // if (TM.deviceShouldSelfCalibrate), must reset thresholds once first
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
  TM.deviceIsAndroid = true;
}
else {
  TM.deviceIsAndroid = false;
}

// sets TM.x and .y by polling and normalizing motion data. called in response to "devicemotion"
function handleMotionEvent(event) {
  // get the raw accelerometer values (invert if Android)
  if (TM.deviceIsAndroid) {
    accelRange.rawX = -(event.accelerationIncludingGravity.x);
    accelRange.rawY = -(event.accelerationIncludingGravity.y);
  }
  else {
    accelRange.rawX = event.accelerationIncludingGravity.x;
    accelRange.rawY = event.accelerationIncludingGravity.y;
  }
  // calibrate range of values for clamp (only if device is set to self-calibrate)
  if (TM.deviceShouldSelfCalibrate) {
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
  if (accelRange.rawX < accelRange.loX) { // thresholds are immutable if TM.deviceShouldSelfCalibrate == false
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
  TM.x  = (accelRange.tempX - accelRange.loX) / accelRange.scaleX; // set properties of TM object
  TM.y  = (accelRange.tempY - accelRange.loY) / accelRange.scaleY;
}

// Synchronizes client time to server time
const urlForClockSync = 'https://jack-cue-manager-test.herokuapp.com/test-server/clock-sync';
function syncClocks() {
  var syncClockCounter = 0;
  var shortestRoundtrip = Number.POSITIVE_INFINITY;

  var syncClockID = setInterval(function () {
    var syncTime1 = Date.now(); // client-side timestamp

    fetch(urlForClockSync)
    .then(response => response.text())
    .then(response => {
      var syncTime2 = response; // server-side timestamp
      var syncTime3 = Date.now(); // client-side timestamp on receipt
      var roundtrip = syncTime3 - syncTime1;
      if (TM.debug) {
        publicLog('Time request number ' + syncClockCounter + ' sent at ' + syncTime1 + ' (client time). Response sent at ' + syncTime2 + ' (server time). Response received at ' + syncTime3 + ' (client time). Roundtrip latency: ' + roundtrip + ' milliseconds.');
      }
      if (roundtrip < shortestRoundtrip) {
        // safari caches response despite my very nice request not to
        // it releases cache after first iteration, but if first try
        // is super short roundtrip (e.g., 1 ms), the result is b.s.
        if (syncClockCounter > 1 || roundtrip > 10) {
          shortestRoundtrip = roundtrip;
          // shortest roundtrip considered most accurate
          // subtract TM.clientServerOffset from client time to sync
          TM.clientServerOffset = (syncTime3-syncTime2) - (roundtrip/2);
        } else {
          publicLog('It looks like the last response was served from the disk cache and is invalid.');
        }
      }
      if (syncClockCounter === 6) { // last check
        if (shortestRoundtrip > 2000) {
          publicWarning('There seems to be a lot of latency in your connection to the server (' + shortestRoundtrip + ' milliseconds of round-trip delay). Your device may not be synchronized.');
        } else {
          publicLog('Shortest roundtrip latency was ' + shortestRoundtrip + ' milliseconds. Client time is estimated to be ahead of server time by ' + TM.clientServerOffset + ' milliseconds.');
        }
        setStatus('readyToPlay');
      }
    })
    .catch(error => publicError(error));

    // stop after 6 checks (5 seconds)
    if (++syncClockCounter === 6) {
      window.clearInterval(syncClockID);
    }
  }, 1000);
}

// packet size reduced by subtracting bias on server and adding on client
// at time of coding (2018-07-18) Date.now() returns 1531970463500
const urlForCues = 'https://jack-cue-manager-test.herokuapp.com/test-server/current-cue'
const timestampBias = 1531970463500;
// cueOnClient is set when cue from server doesn't match.
var cueOnClient = -1; // wait period of piece begins at 0
var cueTimeFromServer = 0;
function updateCueNumber() {
  fetch(urlForCues)
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
  .catch(error => publicError(error));
}

// wrap setTimeout in Promise
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function goCue(cue, serverTime) {
  // check that cue exists
  if (cueList[cue]) {
    TM.currentCue = cueList[cue];
  } else {
    publicError('Cue number ' + cue + ' does not exist.');
    return;
  }

  // clear all current cues
  for (var i = 0; i < cueList.length; i++) {
    if (cueList[i] && cueList[i].isPlaying) {
      cueList[i].stopCue();
      cueList[i].isPlaying = false;
    }
  }

  // immediately trigger cue with minimum latency if waitTime is -1
  // This could be faster if moved to top of function,
  // but that makes the code messy.
  if (cueList[cue].waitTime == -1) {
    try { cueList[cue].goCue(); } catch(e) { publicError(e); }
    updateForNewCue(cue);
    return;
  }

  // lower priority cue (may be deliberately delayed). check client time
  var timestamp = Date.now() - TM.clientServerOffset;
  var delay = Math.floor(serverTime - TM.serverLatency + cueList[cue].waitTime - timestamp);

  // trigger new cue (immediately or after wait time)
  if ((cueList[cue].openWindow + delay) < 0) {
    publicWarning('Your device missed its cue by ' + (-delay) + ' milliseconds! If this keeps happening, there may be a problem with your connection.');
  } else if (delay < 20) {
    // shorter delay than 20ms is definitely not aurally perceptible
    try { cueList[cue].goCue(); } catch(e) { publicError(e); }
    updateForNewCue(cue);
  } else {
    if (delay > TM.MAX_DELAY) {
      publicError('Request to delay cue for ' + delay + ' milliseconds exceeds maximum delay of ' + TM.MAX_DELAY + ' milliseconds.');
      return;
    }
    wait(delay).then(() => {
      try { cueList[cue].goCue(); } catch(e) { publicError(e); }
      updateForNewCue(cue);
    })
  }
}

// Sets status to 'playing' (if not already), updates label, current cue
function updateForNewCue(cue) {
  if (TM.currentCue.mode === 'waiting') {
    setStatus('waitingForPieceToStart');
  } else if (TM.currentCue.mode === 'finished') {
    setStatus('finished');
  } else {
    setStatus('playing');
  }
  cueList[cue].isPlaying = true;
}

// empty array to fill with cues
var cueList = [];
// BUG: if cues are added to array in separate source file, they dont' exist here and can't be called here
// HACK: put all cues here until I find a solution

// Test cues
cueList[1] = new TMCue(2000, 0);
cueList[1].mode = 'tilt';
cueList[1].goCue = function() {
  console.log('cueList[1].goCue() called');
}

cueList[2] = new TMCue(0, 0);
cueList[2].goCue = function() {
  console.log('cueList[2].goCue() called');
}

cueList[3] = new TMCue(500, 0);
cueList[3].goCue = function() {
  console.log('cueList[3].goCue() called');
}

cueList[4] = new TMCue(3000, 0);
cueList[4].goCue = function() {
  console.log('cueList[4].goCue() called at ' + Date.now());
}
cueList[4].stopCue = function() {
  console.log('cueList[4].stopCue() called at ' + Date.now());
}

cueList[5] = new TMCue(20000, 0);
cueList[5].goCue = function() {
  console.log('cueList[5].goCue() called at ' + Date.now());
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
  this.mode = 'waiting'; // mode of interactivity
}
TMCue.prototype.goCue = function() {
  // override this method in score to code the music for this section
  console.log('No music coded for this section.');
}
TMCue.prototype.stopCue = function() {
  // override this method in score to code the cleanup for this section
  console.log('No clean-up implemented for this section.');
}

// Cue number 0 sets status to 'waitingForPieceToStart'
cueList[0] = new TMCue(-1);
cueList[0].goCue = function() {
  console.log('cueList[0].goCue() called');
  // TODO: decide whether to set this to new status: 'waiting'
  setStatus('waitingForPieceToStart');
}

/*
** MAKE SOUNDS INTERACTIVE
** Some Tone.js object properties are signals and can be chained to TM signals, e.g.:
** TM.ySig.chain(filterFreqScale, filter.frequency);
** Other properties must be set within repeated function calls, e.g., updateSoundsInCue1()
*/
// updateInteractiveSounds() is called once per TM.updateInterval (default: 0.05 seconds)
// not called until interface is set up and parameters (e.g., TM.updateInterval) are set
function updateInteractiveSounds() {
  if (TM.motionStatus === "deviceDoesReportMotion") {
    // If device reports motion, TM.x and .y are set by accelerometer. Use those to set smooth control signals.
    TM.xSig.linearRampToValue(TM.x, TM.updateInterval); // smooths signals to avoid zipper noise
    TM.ySig.linearRampToValue(TM.y, TM.updateInterval);
  }
  else if (TM.motionStatus === "deviceDoesNotReportMotion") {
    // If device doesn't report motion, signals are set by XY-pad simulator. Sample that to set TM.x and .y
    TM.x = TM.xSig.value;
    TM.y = TM.ySig.value;
  }
  // one solution for stepping through cue list. not great because it limits number of sections arbitrarily.
  switch (TMScore.currentCue) {
    case 0:
      // piece hasn't started yet. no error, but do nothing
      if (TM.print) { console.log("Piece hasn't started yet. No interactive sounds to update."); }
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
  if (TM.showStatusLabels) { updateStatusLabels(); }
}
