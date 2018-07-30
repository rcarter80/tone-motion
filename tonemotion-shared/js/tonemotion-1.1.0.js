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

/**
 * Object to encapsulate properties and methods for Tone Motion
 * @param {string} status - Application status (set automatically)
 * @param {boolean} debug - Can set to 'true' in score.js
 * @param {boolean} shouldSyncToServer - Find time offset between client
 *    and server (clientServerOffset). If false, offset is 0.
 * @param {number} clientServerOffset - (ms.) Adjustment to client time
 * @param {boolean} deviceIsAndroid - Otherwise, device is probably iOS
 */

function ToneMotion() {
  this.status = 'loading';
  this.debug = false;
  this.shouldSyncToServer = true;
  this.clientServerOffset = 0;
  this.deviceIsAndroid = false;
}



// setInterval within object using bind()
ToneMotion.prototype.testInterval = function() {
  this.testIntervID = window.setInterval(this.testCallback.bind(this), 1000);
};

ToneMotion.prototype.testCallback = function() {
  console.log(this.status);
};

ToneMotion.prototype.clearTestInterval = function() {
  window.clearInterval(this.testIntervID);
};

// looping setTimeout within object using bind()
ToneMotion.prototype.testTimeout = function() {
  this.testTimeout = window.setTimeout(this.testCallback2.bind(this), 1000);
};

ToneMotion.prototype.testCallback2 = function() {
  console.log(this.status);

  this.testTimeout = window.setTimeout(this.testCallback2.bind(this), 1000);
};

ToneMotion.prototype.clearTestTimeout = function() {
  window.clearTimeout(this.testTimeout);
};



// Registers event handler to interface button (not visible while loading), confirms that buffers are loaded and device reports motion
ToneMotion.prototype.init = function() {

  // Set up click functions for main button
  this.bindButtonFunctions();

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
  // window.clearInterval(cueIntervalID);
  // TODO: clear all cues

  // do NOT set status here. could be 'error' OR 'stopped'
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
        // cueIntervalID = setInterval(updateCueNumber, 500);
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
        // cueIntervalID = setInterval(updateCueNumber, 500);
        // TODO: start audio context
        // must have goCue set status
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

/*********************************************************************
********************** DEVICE MOTION HANDLING ************************
*********************************************************************/

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

  if ("DeviceMotionEvent" in window) {
    if (this.debug) {
      this.publicLog('Device claims to report motion, which may be a lie');
    }

    // window.addEventListener("devicemotion", (event) => {
    //   this.publicMessage(event.accelerationIncludingGravity.x);
    // }, true);
    window.addEventListener("devicemotion", this.handleMotionEvent, true);

  } else {
    if (this.debug) {
      this.publicLog('Device does not report motion');
    }
  }
};

// sets TM.x and .y by polling and normalizing motion data. called in response to "devicemotion"
ToneMotion.prototype.handleMotionEvent = function(event) {
  this.publicMessage(event.accelerationIncludingGravity.x);
  // // get the raw accelerometer values (invert if Android)
  // if (this.deviceIsAndroid) {
  //   accelRange.rawX = -(event.accelerationIncludingGravity.x);
  //   accelRange.rawY = -(event.accelerationIncludingGravity.y);
  // }
  // else {
  //   accelRange.rawX = event.accelerationIncludingGravity.x;
  //   accelRange.rawY = event.accelerationIncludingGravity.y;
  // }
  // // clamp: if device does not self-calibrate, default to iOS range (typically -10 to 10)
  // if (accelRange.rawX < accelRange.loX) {
  //   accelRange.tempX = accelRange.loX;
  // }
  // else if (accelRange.rawX > accelRange.hiX) {
  //   accelRange.tempX = accelRange.hiX;
  // }
  // else {
  //   accelRange.tempX = accelRange.rawX;
  // }
  // if (accelRange.rawY < accelRange.loY) {
  //   accelRange.tempY = accelRange.loY;
  // }
  // else if (accelRange.rawY > accelRange.hiY) {
  //   accelRange.tempY = accelRange.hiY;
  // }
  // else {
  //   accelRange.tempY = accelRange.rawY;
  // }
  // // normalize to 0.0 to 1.0
  // TM.x  = (accelRange.tempX - accelRange.loX) / accelRange.scaleX; // set properties of TM object
  // TM.y  = (accelRange.tempY - accelRange.loY) / accelRange.scaleY;
}


/*********************************************************************
******************* CLIENT/SERVER SYNCHRONIZATION ********************
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
        window.clearInterval(syncClockID);
      }
    }, 1000);
  } else {
    // no client synchronizing (keep clientServerOffset to default of 0)
    this.setStatus('readyToPlay');
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
