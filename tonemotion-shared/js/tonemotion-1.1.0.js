/*********************************************************************
************************ APPLICATION SETUP ***************************
*********************************************************************/

// NOTE: This all depends on Tone.js, which must appear first

/*
** DOM HOOKS
*/

const statusLabel = document.querySelector('#statusLabel');
const startStopButton = document.querySelector('#startStopButton');
const messageLabel = document.querySelector('#messageLabel');
const consoleCheckbox = document.querySelector('#consoleCheckbox');
const publicConsole = document.querySelector('#publicConsole');
const motionDataCheckbox = document.querySelector('#motionDataCheckbox');
const motionDataLabel = document.querySelector('#motionDataLabel');

/**
 * Object to encapsulate properties and methods for ToneMotion
 * @param {string} status - Application status (set automatically)
 * @param {boolean} debug - Can set to 'true' in score.js
 * @param {boolean} showConsoleOnLaunch - Shows console log by default
 * @param {boolean} shouldSyncToServer - Find time offset between client
 *    and server (clientServerOffset). If false, offset is 0.
 * @param {number} clientServerOffset - (ms.) Adjustment to client time
 * @param {boolean} deviceIsAndroid - Otherwise, device is probably iOS
 * @param {object} accel - x and y values for accelerometer. Values
 *    undefined by default, to be set by devicemotion OR desktop testing
 *    "raw" values are as reported by device before normalizing
 * @param {number} shakeThreshold - gyro value to trigger shakeFlag
 * @param {number} shakeGap - (ms.) Min. time between shake gestures
 * @param {boolean} shakeFlag - If gyro values exceed threshold, true
 * @param {boolean} recentShakeFlag - If shake gesture triggered within
 *    the last <shakeGap> milliseconds, this is set to true
 * @param {number} shakeGapCounter - To prevent immediate successive
 *    shake gestures, counter counts down (shakeGap /
 *    motionUpdateLoopInterval) times, then reset recentShakeFlag
 * @param {boolean} shouldTestOnDesktop - Sets motion values to 0
 * @param {number} motionUpdateLoopInterval - (ms.) How often the main
 *    ToneMotion event loop happens. Tradeoff: responsiveness vs. cost
 * @param {number} cueOnClient - Current cue number client side.
 *    Initialized as -1. Server starts at cue number 0.
 * @param {number} cueTimeFromServer - Time when last cue was set on the
 *    server. Default of 0 will never match time of last cue.
 */

function ToneMotion() {
  this.status = 'loading';
  this.debug = false;
  this.showConsoleOnLaunch = false;
  this.shouldSyncToServer = true;
  this.clientServerOffset = 0;
  this.deviceIsAndroid = false;
  this.accel = {
    rawX: undefined,
    rawY: undefined,
    x: undefined,
    y: undefined,
  }
  this.shakeThreshold = 2;
  this.shakeGap = 250;
  this.shakeFlag = false;
  this.recentShakeFlag = false;
  this.shakeGapCounter = 0;
  this.shouldTestOnDesktop = true;
  this.motionUpdateLoopInterval = 50;
  this.cueOnClient = -1;
  this.cueTimeFromServer = 0;
}



// setInterval within object using bind()
ToneMotion.prototype.testInterval = function() {
  this.testIntervID = setInterval(this.testCallback.bind(this), 1000);
};

ToneMotion.prototype.testCallback = function() {
  console.log(this.status);
};

ToneMotion.prototype.clearTestInterval = function() {
  clearInterval(this.testIntervID);
};

// looping setTimeout within object using bind()
ToneMotion.prototype.testTimeout = function() {
  this.testTimeout = setTimeout(this.testCallback2.bind(this), 1000);
};

ToneMotion.prototype.testCallback2 = function() {
  console.log(this.status);

  this.testTimeout = setTimeout(this.testCallback2.bind(this), 1000);
};

ToneMotion.prototype.clearTestTimeout = function() {
  clearTimeout(this.testTimeout);
};



// Registers event handlers to interface elements, confirms that buffers are loaded, begins devicemotion handling
// Triggers syncClocks() once buffers have succesfully loaded
ToneMotion.prototype.init = function() {
  // Can automatically show console in left panel when page loads
  if (this.showConsoleOnLaunch) {
    consoleCheckbox.checked = true;
  }

  // Set up click functions for main button
  this.bindButtonFunctions();
  // Allow hiding and clearing of console
  this.bindConsoleCheckboxFunctions();

  // Load test audio file into Tone.Buffer (same audio file as <audio> shim to tell Safari that page should play audio)
  const bufferLoadingTestFile = new Tone.Buffer('tonemotion-shared/audio/silent-buffer-to-set-audio-session.mp3');

  Tone.Buffer.on('progress', () => {
    this.setStatus('loading');
    if (this.debug) {
      this.publicLog('Audio buffers loading');
    }
  });

  // Called when all buffers are done loading
  Tone.Buffer.on('load', () => {
    if (this.debug) {
      this.publicLog('Audio buffers finished loading');
    }
    // Synchronize client clock to server once all resources loaded
    this.syncClocks();
  });

  Tone.Buffer.on('error', () => {
    this.publicError('Error loading the audio files');
  });

  // Begin motion handling
  this.beginMotionHandling();
};

// Manages application status and interface updates
ToneMotion.prototype.setStatus = function(status) {
  // no need to reset status if there's no change in status
  if (status === this.status) {
    return;
  }
  this.status = status;

  // clear any previous message from previous state
  this.clearMessageLabel();

  switch (status) {
    case 'loading':
      this.setStatusLabel('loading', 'active');
      this.setStartStopButton('', 'hidden');
      break;
    case 'synchronizing':
      this.setStatusLabel('synchronizing', 'active');
      this.setStartStopButton('', 'hidden');
      break;
    case 'readyToPlay':
      this.setStatusLabel('ready', 'default');
      this.setStartStopButton('start', 'start');
      break;
    case 'waitingForPieceToStart':
      this.setStatusLabel('waiting', 'active');
      this.setStartStopButton('stop', 'stop');
      this.publicMessage("The piece hasn't start yet, but you're all set. The music will start automatically.");
      break;
    case 'playing_tacet':
      this.setStatusLabel('tacet', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'playing_tilt':
      this.setStatusLabel('tilt', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'playing_shake':
      this.setStatusLabel('shake', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'playing_tiltAndShake':
      this.setStatusLabel('tilt and shake', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'playing_listen':
      this.setStatusLabel('just listen', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'stopped':
      this.setStatusLabel('stopped', 'default');
      this.setStartStopButton('start', 'start');
      break;
    case 'finished':
      this.setStatusLabel('finished', 'default');
      this.setStartStopButton('', 'hidden');
      break;
    case 'error':
      this.setStatusLabel('error', 'error');
      this.setStartStopButton('try again', 'reload');
      this.shutEverythingDown();
      break;
    default:
      this.publicError('Error setting application status');
    }

    if (this.debug) {
      this.publicLog('Application status set to ' + this.status);
    }
};

// Clears all sound, loops, motion handling, and network requests
ToneMotion.prototype.shutEverythingDown = function() {
  this.publicLog('Shutting down');
  clearInterval(this.motionUpdateLoopID);
  clearTimeout(this.getCuesFromServer);
  // TODO: clear all cues
  // do NOT set status here. could be 'error' OR 'stopped'
};

// Restarts all loops, motion handling, and network requests
ToneMotion.prototype.startEverythingUpAgain = function() {
  this.publicLog('Starting up again');
  this.motionUpdateLoopID = setInterval(this.motionUpdateLoop.bind(this), this.motionUpdateLoopInterval);

  this.cueFetchTimeout = setTimeout(this.getCuesFromServer.bind(this), 500);
  // TODO: must have cue from server set status of app
};

/*
** MESSAGES TO USER
*/

// Prints to message label on center panel
ToneMotion.prototype.publicMessage = function(message) {
  messageLabel.className = 'default';
  messageLabel.innerHTML = message;
};

// Prints to message label (styled as warning), prints console warning
ToneMotion.prototype.publicWarning = function(message) {
  messageLabel.className = 'warning';
  messageLabel.innerHTML = message;
  console.warn(message);
};

// Prints to message label (styled as error) AND sets status to 'error' (which stops execution) AND throws error to console
ToneMotion.prototype.publicError = function(message) {
  this.setStatus('error');
  messageLabel.className = 'error';
  messageLabel.innerHTML = message;
  console.error(message);
};

// Clears message label
ToneMotion.prototype.clearMessageLabel = function() {
  messageLabel.className = 'hidden';
  messageLabel.innerHTML = '';
}

// Prints to console and to help panel if consoleCheckbox is checked
ToneMotion.prototype.publicLog = function(message) {
  if (consoleCheckbox.checked) {
    var logMessage = document.createElement('p');
    logMessage.className = 'logMessage';
    logMessage.innerHTML = message;
    publicConsole.appendChild(logMessage);
  }
  console.log(message);
};

// Clears console in help panel
ToneMotion.prototype.clearConsole = function() {
  var logMessages = document.getElementsByClassName('logMessage');

  while (logMessages[0]) {
    logMessages[0].parentNode.removeChild(logMessages[0]);
  }
}

/*
** INTERFACE LABELS AND ACTIONS
*/

// Sets text and class name for main status label in center panel
ToneMotion.prototype.setStatusLabel = function(text, className) {
  statusLabel.className = className;
  statusLabel.innerHTML = text;
};

// Sets text and class name for main button in center panel
ToneMotion.prototype.setStartStopButton = function(text, className) {
  startStopButton.className = className;
  startStopButton.innerHTML = text;
}

// Handles click events from primary button (startStopButton)
ToneMotion.prototype.bindButtonFunctions = function() {
  startStopButton.addEventListener("click", () => {
    switch (this.status) {
      case 'readyToPlay':
        this.beginMotionUpdates();
        // TODO: make polling interval configurable
        this.cueFetchTimeout = setTimeout(this.getCuesFromServer.bind(this), 500);
        // TODO: start audio context. All additional startup
        break;
      case 'waitingForPieceToStart':
      case 'playing_tacet':
      case 'playing_tilt':
      case 'playing_shake':
      case 'playing_tiltAndShake':
      case 'playing_listen':
        this.setStatus('stopped');
        this.shutEverythingDown();
        break;
      case 'stopped':
        this.startEverythingUpAgain();
        break;
      case 'error':
        // Reload the current page, without using the cache
        window.location.reload(true);
        break;
      default:
        this.publicError('Error setting function for button');
    }
  });
};

// Clears console in left panel when checkbox is unchecked
ToneMotion.prototype.bindConsoleCheckboxFunctions = function() {
  consoleCheckbox.addEventListener('change', () => {
    if (!consoleCheckbox.checked) {
      // Checkbox is unchecked and console should be cleared
      this.clearConsole();
    }
  })
};

/*********************************************************************
********************** DEVICE MOTION HANDLING ************************
*********************************************************************/

// Tests if device is Android, registers 'devicemotion' event listener
ToneMotion.prototype.beginMotionHandling = function() {
  if (this.debug) {
    this.publicLog('Beginning motion detection')
  }

  // Android devices report motion in same range as iOS but with inverted axes. Check if device is Android
  // UA sniffing is supposed to be really bad, but this is the only way to automatically invert axes on Android
  // worse-case scenario: axes are inverted when they shouldn't, which is less bad than not inverting when they should
  // Could also have user select checkbox to invert axes, but that requires more setup of device
  const userAgent = window.navigator.userAgent;
  if (userAgent.match(/Android/i)) {
    this.deviceIsAndroid = true;
    if (this.debug) {
      this.publicLog('This device appears to be an Android');
    }
  }
  else {
    this.deviceIsAndroid = false;
    if (this.debug) {
      this.publicLog('This device does not appear to be an Android');
    }
  }

  // Just sets accelerometer data to object properties and determines
  // if gyro data should set shake flag
  window.addEventListener('devicemotion', this.handleMotionEvent.bind(this), true);
};

// Sets ToneMotion object accel properties and sets shake flag
// Bound to 'devicemotion' event listener, so this is called very often
// but the polling interval is read-only
ToneMotion.prototype.handleMotionEvent = function(event) {
  // Axes on Android on inverted relative to iOS
  if (this.deviceIsAndroid) {
    this.accel.rawX = -(event.accelerationIncludingGravity.x);
    this.accel.rawY = -(event.accelerationIncludingGravity.y);
    if (event.acceleration.y < -this.shakeThreshold) {
      this.shakeFlag = true; // enough motion to trigger shake
    }
  }
  else {
    this.accel.rawX = event.accelerationIncludingGravity.x;
    this.accel.rawY = event.accelerationIncludingGravity.y;
    if (event.acceleration.y > this.shakeThreshold) {
      this.shakeFlag = true; // enough motion to trigger shake
    }
  }
};

// Tests if device actually reports motion or is lying. Starts motionUpdateLoop. Call this to restart motion updates.
ToneMotion.prototype.beginMotionUpdates = function() {
  if (this.debug) {
    this.publicLog('Motion mapping loop starting up');
  }

  // Only mobile device are supported because the piece doesn't make sense on desktop, but for local testing, set all values to 0
  if (this.shouldTestOnDesktop) {
    this.accel.rawX = 0;
    this.accel.rawY = 0;
  }

  // Test if device actually reports motion. Chrome lies and claims that desktop browser handles device motion, but doesn't report it
  if (this.accel.rawX === undefined) {
    this.publicError('This device does not appear to report motion. This is a piece for audience participation on mobile devices, so only mobile devices are supported.');
  } else {
    this.motionUpdateLoopID = setInterval(this.motionUpdateLoop.bind(this), this.motionUpdateLoopInterval);
  }
};

// Primary event loop for ToneMotion. Normalizes motion data, manages shake gestures, and maps motion to sound
ToneMotion.prototype.motionUpdateLoop = function() {
  if (this.accel.rawX < -10) { // clamp
    this.accel.x = 0; // no need to normalize
  }
  else if (this.accel.rawX > 10) {
    this.accel.y = 1;
  }
  else {
    this.accel.x = (this.accel.rawX + 10) / 20; // normalize to 0 - 1
  }

  if (this.accel.rawY < -10) { // clamp
    this.accel.y = 0; // no need to normalize
  }
  else if (this.accel.rawY > 10) {
    this.accel.y = 1;
  }
  else {
    this.accel.y = (this.accel.rawY + 10) / 20; // normalize to 0 - 1
  }

  // TODO: map accel values to "tilt" sounds

  // Trigger shake event if there hasn't been once recently
  if (this.shakeFlag && !(this.recentShakeFlag)) {
    this.recentShakeFlag = true;
    // Determine number of times through event loop before next possible shake gesture is allowed
    this.shakeGapCounter = Math.floor(this.shakeGap / this.motionUpdateLoopInterval);

    // TODO: connect shake to sound

    if (this.debug) {
      var shakeTimestamp = new Date();
      this.publicLog('There was a shake gesture at ' + shakeTimestamp);
    }
  }
  // If there's been a recent shake, decrement counter and reset flag
  if (this.recentShakeFlag) {
    if (this.shakeGapCounter-- === 0) {
      // After waiting for shakeGap ms., reset boths flags
      this.shakeFlag = false;
      this.recentShakeFlag = false;
    }
  }

  // Left panel has checkbox to allow monitoring of accel values
  if (motionDataCheckbox.checked) {
    motionDataLabel.innerHTML = 'x: ' + this.accel.x + '<br>' + 'y: ' + this.accel.y;
  }
};

/*********************************************************************
*********** CLIENT/SERVER SYNCHRONIZATION AND COMMUNICATION **********
*********************************************************************/

// Synchronizes client time to server time
const urlForClockSync = 'https://jack-cue-manager-test.herokuapp.com/test-server/clock-sync';

ToneMotion.prototype.syncClocks = function() {
  if (this.shouldSyncToServer) {
    this.setStatus('synchronizing');
    var syncClockCounter = 0;
    var shortestRoundtrip = Number.POSITIVE_INFINITY;

    var syncClockID = setInterval( () => {
      var syncTime1 = Date.now(); // client-side timestamp

      fetch(urlForClockSync)
      .then(response => response.text())
      .then(response => {
        var syncTime2 = response; // server-side timestamp
        var syncTime3 = Date.now(); // client-side timestamp on receipt
        var roundtrip = syncTime3 - syncTime1;
        if (this.debug) {
          this.publicLog('Time request number ' + syncClockCounter + ' sent at ' + syncTime1 + ' (client time). Response sent at ' + syncTime2 + ' (server time). Response received at ' + syncTime3 + ' (client time). Roundtrip latency: ' + roundtrip + ' milliseconds.');
        }
        if (roundtrip < shortestRoundtrip) {
          // safari caches response despite my very nice request not to
          // it releases cache after first iteration, but if first try
          // is super short roundtrip (e.g., 1 ms), the result is b.s.
          if (syncClockCounter > 1 || roundtrip > 10) {
            shortestRoundtrip = roundtrip;
            // shortest roundtrip considered most accurate
            // subtract this.clientServerOffset from client time to sync
            this.clientServerOffset = (syncTime3-syncTime2) - (roundtrip/2);
          } else {
            this.publicLog('It looks like the last response was served from the disk cache and is invalid.');
          }
        }
        if (syncClockCounter === 6) { // last check
          if (shortestRoundtrip > 2000) {
            ;
            this.publicWarning('There seems to be a lot of latency in your connection to the server (' + shortestRoundtrip + ' milliseconds of round-trip delay). Your device may not be synchronized.');
          } else {
            this.publicLog('Shortest roundtrip latency was ' + shortestRoundtrip + ' milliseconds. Client time is estimated to be ahead of server time by ' + this.clientServerOffset + ' milliseconds.');
          }
          this.setStatus('readyToPlay');
        }
      })
      .catch(error => this.publicError(error));

      // stop after 6 checks (5 seconds)
      if (++syncClockCounter === 6) {
        clearInterval(syncClockID);
      }
    }, 1000);
  } else {
    // no client synchronizing (keep clientServerOffset to default of 0)
    this.setStatus('readyToPlay');
  }
};

// packet size reduced by subtracting bias on server and adding on client
// at time of coding (2018-07-18) Date.now() returns 1531970463500
const urlForCues = 'https://jack-cue-manager-test.herokuapp.com/test-server/current-cue'
const timestampBias = 1531970463500;
// cueOnClient is set when cue from server doesn't match.
ToneMotion.prototype.getCuesFromServer = function() {
  fetch(urlForCues)
  .then(response => response.json())
  .then(jsonRes => {
    // check if there's a new cue
    // checks cue *time* (not number) because in rehearsal the same cue
    // could be retriggered. same cue number, different time.
    if (this.cueTimeFromServer !== jsonRes.t+timestampBias) {
      // Trigger new cue
      this.cueOnClient = jsonRes.c;
      this.cueTimeFromServer = jsonRes.t + timestampBias;
      if (this.debug) {
        this.publicLog('New cue number ' + this.cueOnClient + ' fetched from server at ' + Date.now() + ' after being set on server at ' + this.cueTimeFromServer);
      }
      // this.goCue(cueOnClient, cueTimeFromServer);
    } // else no new cue and control falls through, on to next loop
    this.cueFetchTimeout = setTimeout(this.getCuesFromServer.bind(this), 500);
  })
  .catch(error => this.publicError(error));
};


// wrap setTimeout in Promise
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

ToneMotion.prototype.goCue = function(cue, serverTime) {
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
};

/*********************************************************************
************************ CUE LIST MANAGEMENT *************************
*********************************************************************/

/**
 * Create a new musical section
 * @param {string} mode - Mode of interactivity. Can be: 'waiting',
 * 'tacet', 'tilt', 'shake', 'tiltAndShake', 'listen', 'finished'
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
const NO_LIMIT = Number.POSITIVE_INFINITY; // use for unlimited window
function TMCue(mode, waitTime, openWindow) {
  this.mode = mode;
  this.waitTime = waitTime;
  this.openWindow = openWindow;
  this.isPlaying = false; // not set by constructor
}

TMCue.prototype.goCue = function() {
  // override this method in score to code the music for this section
  console.log('No music coded for this section.');
};

TMCue.prototype.stopCue = function() {
  // override this method in score to code the cleanup for this section
  console.log('No clean-up implemented for this section.');
};
