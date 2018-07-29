/*********************************************************************
************************ APPLICATION SETUP ***************************
*********************************************************************/

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
 * @param {number} clientServerOffset - (ms.) Adjustment to client time
 */

function ToneMotion() {
  this.status = 'loading';
  this.debug = 'false';
  this.clientServerOffset = 0;
}

// Confirms that buffers are loaded and that device reports motion
ToneMotion.prototype.init = function() {
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
    console.log('error');
  });

  // TODO: begin motion handling
};

// Manages application status and interface updates
ToneMotion.prototype.setStatus = function(status) {
  // no need to reset status if there's no change in status
  // unless status is 'playing' because interactivity mode may change
  if (status === this.status) {
    return;
  }
  this.status = status;
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


/*********************************************************************
******************* CLIENT/SERVER SYNCHRONIZATION ********************
*********************************************************************/

// Synchronizes client time to server time
const urlForClockSync = 'https://jack-cue-manager-test.herokuapp.com/test-server/clock-sync';

ToneMotion.prototype.syncClocks = function() {
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
          // subtract TM.clientServerOffset from client time to sync
          this.clientServerOffset = (syncTime3-syncTime2) - (roundtrip/2);
        } else {
          this.publicLog('It looks like the last response was served from the disk cache and is invalid.');
        }
      }
      if (syncClockCounter === 6) { // last check
        if (shortestRoundtrip > 2000) {
          ;
          // publicWarning('There seems to be a lot of latency in your connection to the server (' + shortestRoundtrip + ' milliseconds of round-trip delay). Your device may not be synchronized.');
        } else {
          this.publicLog('Shortest roundtrip latency was ' + shortestRoundtrip + ' milliseconds. Client time is estimated to be ahead of server time by ' + this.clientServerOffset + ' milliseconds.');
        }
        this.setStatus('readyToPlay');
      }
    })
    // .catch(error => publicError(error));

    // stop after 6 checks (5 seconds)
    if (++syncClockCounter === 6) {
      window.clearInterval(syncClockID);
    }
  }, 1000);
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
