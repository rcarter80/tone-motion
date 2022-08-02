/*********************************************************************
************************ APPLICATION SETUP ***************************
*********************************************************************/

// NOTE: This all depends on Tone.js, which must appear first
const VERSION = '2.2.0';

/*
** DOM HOOKS
*/

const help_button = document.querySelector('#help_button');
const status_container = document.querySelector('#status_container');
const status_label = document.querySelector('#status_label');
const start_stop_button = document.querySelector('#start_stop_button');
const cue_container = document.querySelector('#cue_container');
const message_container = document.querySelector('#message_container');
const message_label = document.querySelector('#message_label');
const help_panel = document.querySelector('#help_panel');
const section_instructions = document.querySelector('#section_instructions');
const motion_data_checkbox = document.querySelector('#motion_data_checkbox');
const motion_data_label = document.querySelector('#motion_data_label');
const console_checkbox = document.querySelector('#console_checkbox');
const console_container = document.querySelector('#console_container');
const body_element = document.querySelector('body');
// NodeList of all elements that get set by setBackgroundColor()
const colorElements = document.querySelectorAll('button, a, html, body, #help_panel');

/*
** Tone.Signal objects: set by accelerometer to act as control signals
*/

const xTilt = new Tone.Signal(0.5); // ranges from 0.0 to 1.0
const yTilt = new Tone.Signal(0.5);

/**
 * Object to encapsulate properties and methods for ToneMotion
 * @param {string} status - Application status (set automatically)
 * @param {boolean} debug - Can set to 'true' in score.js
 * @param {boolean} localTest - Set to 'true' in score.js to test locally
 * @param {boolean} fixedCuesOnly - if true, does not communicate with server
 * @param {boolean} showConsoleOnLaunch - Set to 'true' to show console
 * @param {boolean} shouldSyncToServer - Find time offset between client
 *    and server (clientServerOffset). If false, offset is 0.
 * @param {number} shortestRoundtrip - shortest server ping (for time offset)
 * @param {number} clientServerOffset - (ms.) Adjustment to client time
 * @param {boolean} deviceIsAndroid - Otherwise, device is probably iOS
 * @param {string} motionPermissionStatus - Shows status of permission request to access motion & orientation data
 * @param {boolean} shouldTestMotion - True by default, turn off to optimize performance (e.g., when piece actually begins)
 * @param {number} motionFailCount - Increments when motion access fails
 * @param {number} motionFailThreshold - Posts error to user when reached
 * @param {boolean} motionFailMessageShown - tracks if error message is visible
 * @param {boolean} motionEventListenerAdded - tracks devicemotion handlers
 * @param {object} accel - x and y values for accelerometer. Values
 *    undefined by default, to be set by devicemotion OR desktop testing
 *    "raw" values are as reported by device before normalizing
 * @param {number} gyroPeak - when debugging, used to monitor peak gyro values
 * @param {Tone.Signal} xSig - Control signal mapped to x-axis of accel
 * @param {Tone.Signal} ySig - Control signal mapped to y-axis of accel
 * @param {number} masterVolume - master volume control optionally set by server
 * @param {number} shakeThreshold - gyro value to trigger shakeFlag
 * @param {number} shakeGap - (ms.) Min. time between shake gestures
 * @param {boolean} shakeFlag - If gyro values exceed threshold, true
 * @param {boolean} recentShakeFlag - If shake gesture triggered within
 *    the last <shakeGap> milliseconds, this is set to true
 * @param {number} shakeGapCounter - To prevent immediate successive
 *    shake gestures, counter counts down (shakeGap /
 *    motionUpdateLoopInterval) times, then reset recentShakeFlag
 * @param {boolean} dipFlag - true when device is upside down. Needs resetting.
 * @param {boolean} shouldSimulateMotion - Sets motion values to 0
 * @param {number} motionUpdateLoopInterval - (ms.) How often the main
 *    ToneMotion event loop happens. Tradeoff: responsiveness vs. cost
 * @param {number} motionUpdateInSeconds - (seconds) Same value as above but in seconds (to minimize calculations for Tone.js objects that take seconds)
 * @param {number} cuePollingInterval - (ms.) How often server is polled
 * @param {array} intervalIDArray - used to store all interval IDs to clear
 * @param {number} motionUpdateCounter - used to check that motion is updating
 * @param {number} lastMotionUpdateCounter - used with above for motion checks
 * @param {number} cueOnClient - Current cue number client side.
 *    Initialized as -1. Server starts at cue number 0.
 * @param {number} cueTimeFromServer - Time when last cue was set on the
 *    server. Default of 0 will never match time of last cue.
 * @param {array} cue - Array of TMCue objects that hold all properties
 *    and methods of each cue
 * @param {TMCue} currentCue - Reference to the current cue
 * @param {number} MAX_DELAY - (ms.) Max. duration for delaying cue
 * @param {number} serverLatency - (ms.) Can use to offset estimated
 *    latency between musician panel and cue being set on server
 * @param {string} urlForCues - URL for cues from this particular ensemble
 * @param {Tone.Meter} masterMeter - meter for master output
 * @param {object} meter - isOn: boolean value to choose whether to use metering. rapid: creates additional loop to poll meter at rate of block size (otherwise metering is embedded in motion loop at slower rate and might miss transients). level: current value of meter. peak: highest peak up to this point, which can be reset by unchecking "Show motion data"
 */
function ToneMotion() {
  this.status = '';
  this.debug = false;
  this.localTest = false;
  this.fixedCuesOnly = false;
  this.showConsoleOnLaunch = false;
  this.shouldSyncToServer = true;
  this.clientServerOffset = 0;
  this.shortestRoundtrip = Number.POSITIVE_INFINITY;
  this.deviceIsAndroid = false;
  this.motionPermissionStatus = 'unknown';
  this.shouldTestMotion = true;
  this.motionFailCount = 0;
  this.motionFailThreshold = 20;
  this.motionFailMessageShown = false;
  this.motionEventListenerAdded = false;
  this.accel = {
    rawX: undefined,
    rawY: undefined,
    x: undefined,
    y: undefined,
  };
  this.gyroPeak = Number.NEGATIVE_INFINITY;
  this.xSig = xTilt;
  this.ySig = yTilt;
  this.masterVolume = 0;
  this.shakeThreshold = 2;
  this.shakeGap = 250;
  this.shakeFlag = false;
  this.recentShakeFlag = false;
  this.shakeGapCounter = 0;
  this.dipFlag = false;
  this.shouldSimulateMotion = false;
  this.motionUpdateLoopInterval = 50;
  this.motionUpdateInSeconds = 0.05;
  this.cuePollingInterval = 500;
  this.intervalIDArray = [];
  this.motionUpdateCounter = 0;
  this.lastMotionUpdateCounter = 0;
  // init with -1 so initial cue is always triggered when server restarts
  this.cueOnClient = -1;
  this.cueTimeFromServer = -1;
  this.cue = [];
  this.currentCue = {};
  this.MAX_DELAY = 10000;
  this.serverLatency = 0;
  this.urlForCues = '';
  this.masterMeter = undefined;
  this.meter = {
    isOn: false,
    rapid: false,
    level: 0,
    peak: Number.NEGATIVE_INFINITY,
  };
}

// called immediately after window.onload() in score
// Registers event handlers to interface elements
// Triggers syncClocks() once Tone.js and buffers have succesfully loaded
// Actual motion updates and cue fetching MUST be triggered by user input
// at bindButtonFunctions() --> startMotionUpdatesAndCueFetching()
ToneMotion.prototype.init = function(urlOfServer) {
  // debug mode shows console, stops sync with server, logs messages
  if (this.debug) {
    this.showConsoleOnLaunch = true;
    // set to false to speed up load time while testing
    this.shouldSyncToServer = false;
  }
  // Can automatically show console in left panel when page loads
  // This was previously NOT the default behavior, but a scrolling issue in iOS Safari is fixed by displaying console by default. If debug mode is on, lots of messages are generated, but otherwise few are.
  if (this.showConsoleOnLaunch) {
    console_checkbox.checked = true;
    console_container.className = '';
  }

  // Set up click functions for main button
  this.bindButtonFunctions();
  // Allow hiding and clearing of console and motion data monitor
  this.bindConsoleCheckboxFunctions();
  this.bindMotionCheckboxFunctions();

  // Set URL for cue fetching, which varies from one piece to another
  this.urlForCues = urlOfServer;

  // Load test audio file into Tone.Buffer (same audio file as <audio> shim to tell Safari that page should play audio)
  const bufferLoadingTestFile = new Tone.Buffer('tonemotion-shared/audio/silent-buffer-to-set-audio-session.mp3');
  // If using metering on master out, create and connect it here
  if (this.meter.isOn) {
    this.masterMeter = new Tone.Meter();
    // by default, meter smooths from one block to the next
    this.masterMeter.smoothing = 0;
    Tone.Destination.connect(this.masterMeter);
    // rapid metering sets up faster rate for meter polling
    // NOTE: This is expensive and probably shouldn't be used on mobile!
    if (this.meter.rapid) {
      setInterval(() => {
        this.meter.level = this.masterMeter.getValue();
        if (this.meter.level > this.meter.peak) {
          this.meter.peak = this.meter.level;
        }
        // default block time is 128 samples @ 44.1kHz (~3 milliseconds)
      }, (Tone.Destination.blockTime * 1000));
    }
  }

  this.setStatus('loading');
  this.publicLog('Audio buffers loading');
  Tone.loaded().then(() => {
    this.publicLog('Audio buffers finished loading');
    this.publicLog(`tonemotion v${VERSION} loaded`);
    // Synchronize client clock to server once all resources loaded
    this.syncClocks();
  }).catch(() => {
    // BUG: Safari resolves promise even if files don't load
    this.publicError('Error loading the audio files');
  });

  // Android devices report motion in same range as iOS but with inverted axes. Check if device is Android
  // UA sniffing is supposed to be really bad, but this is the only way to automatically invert axes on Android
  // worse-case scenario: axes are inverted when they shouldn't, which is less bad than not inverting when they should
  const userAgent = window.navigator.userAgent;
  if (userAgent.match(/Android/i)) {
    this.deviceIsAndroid = true;
    this.publicLog('This device appears to be an Android');
  }
  else {
    this.deviceIsAndroid = false;
    this.publicLog('This device does not appear to be an Android');
  }
};

// Manages application status and interface updates
ToneMotion.prototype.setStatus = function(status) {
  // prevent new status if status is currently error
  // no need to reset status if there's no change in status
  if (this.status === 'error' || status === this.status) {
    return;
  }
  this.status = status;

  switch (status) {
    case 'loading':
      this.setStatusLabel('loading', 'active');
      this.setStartStopButton('hidden', '');
      break;
    case 'synchronizing':
      this.setStatusLabel('synchronizing', 'active');
      this.setStartStopButton('hidden', '');
      break;
    case 'readyToPlay':
      this.setStatusLabel('ready', 'default');
      this.setStartStopButton('start', 'start');
      break;
    case 'waitingForPieceToStart':
      this.setStatusLabel('waiting', 'active');
      this.setStartStopButton('stop', 'stop');
      this.publicMessage("The piece hasn't started yet, but you're all set. The music will start automatically.");
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
    case 'playing_dip':
      this.setStatusLabel('dip', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'playing_listen':
      this.setStatusLabel('just listen', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'missedCue':
      this.setStatusLabel('waiting for next cue', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'stopped':
      this.setStatusLabel('stopped', 'default');
      this.setStartStopButton('start', 'start');
      break;
    case 'finished':
      this.setStatusLabel('finished', 'default');
      this.setStartStopButton('hidden', '');
      this.shutEverythingDown();
      break;
    case 'error':
      this.shutEverythingDown();
      this.setStatusLabel('error', 'error');
      this.setStartStopButton('reload', 'try again');
      break;
    default:
      this.publicError('Error setting application status');
    }
    // changes background color with interactivity mode
    switch (status) {
      case 'playing_tilt':
        this.setBackgroundColor('green');
        break;
      case 'playing_shake':
        this.setBackgroundColor('gray');
        break;
      case 'playing_tiltAndShake':
        this.setBackgroundColor('orange');
        break;
      case 'playing_dip':
        this.setBackgroundColor('purple');
        break;
      default:
        this.setBackgroundColor('blue');
    }
    // need to remove 'swell' class to reset pulsing glow at end of next cue
    // need to add 'fade' class to <body> to create background color transition
    status_container.classList.remove('swell');
    body_element.classList.add('fade');
    this.publicLog('Application status set to ' + this.status);
};

// Starts noSleep, motion permission request, motion handling, cue fetching
// calls beginMotionUpdates() and getCuesFromServer()
let noSleep; // needs global scope
ToneMotion.prototype.startMotionUpdatesAndCueFetching = function() {
  this.publicLog('Starting motion updates and cue fetching');

  // prevents screen from automatically locking, which chokes audio/motion
  // (from https://github.com/richtr/NoSleep.js)
  // NoSleep object must be reconstructed each time it's enabled
  noSleep = new NoSleep();
  noSleep.enable();
  // simply playing back 1-sec. silent file when tapping a button allows
  // audio to sound with ring/silent switch on silent.
  // keeps sound on after 1-sec. silent file elapses.
  //  WITHOUT THIS, THERE MAY BE NO SOUND because phone should be silenced
  silent_buffer.play();

  // testing iOS 13+ motion permission
  // KNOWN ISSUE: iOS 12.2-12.4 requires motion access permission in settings - I test for motion access and provide instructions if it fails
  // BUG: iOS 13.4 does NOT report gyroscope data and can't use SHAKE gesture
  // Guard against reference errors by checking that DeviceMotionEvent is defined
  if (typeof DeviceMotionEvent !== 'undefined' &&
  typeof DeviceMotionEvent.requestPermission === 'function') {
    this.publicLog('Requesting permission for motion data');
    // Device requests motion permission (e.g., iOS 13+)
    DeviceMotionEvent.requestPermission()
    .then(permissionState => {
      if (permissionState === 'granted') {
        this.addMotionEventListener();
        this.motionPermissionStatus = 'granted';
        this.publicLog('Permission for motion data granted');
        this.beginMotionUpdates();
      } else {
        // user has not give permission for motion. Simulate motion
        this.motionPermissionStatus = 'denied';
        this.publicLog('Permission for motion data denied');
        // this won't work, so immediately post motion access error message
        this.postMotionErrorMessage();
        // begin motion updates anyway, in case user simulates motion
        this.beginMotionUpdates();
      }
    })
    .catch(console.error);
  } else {
    // handle non iOS 13+ devices, which could still report motion
    this.motionPermissionStatus = 'unneeded';
    this.publicLog('Permission to access motion data not requested');
    if ('DeviceMotionEvent' in window && !(this.shouldSimulateMotion)) {
      this.addMotionEventListener();
      // Some browsers (e.g., desktop Chrome) lie about reporting motion, but I test for that in the motion update loop
      this.beginMotionUpdates();
    } else {
      this.publicLog('This device does not report motion');
      this.simulateMotion();
      // motion updates still used for motion simulation
      this.beginMotionUpdates();
    }
  }

  if (this.fixedCuesOnly) {
    this.setStatus('readyToPlay');
  } else {
    // while waiting for cue
    this.setStartStopButton('disabled');
    this.setStatusLabel('loading', 'active'); // label will update with new cue
    // starts interval that fetches cues from server
    this.cueFetchIntervalID = setInterval(this.getCuesFromServer.bind(this), this.cuePollingInterval);
    // push ID to array so that I can clear everything later
    this.intervalIDArray.push(this.cueFetchIntervalID);
  }
};

// registers event handler for devicemotion, but only once
ToneMotion.prototype.addMotionEventListener = function() {
  if (!this.motionEventListenerAdded) {
    window.addEventListener('devicemotion', this.handleMotionEvent.bind(this), true);
    this.motionEventListenerAdded = true;
  }
};

// Clears all sound, loops, motion handling, and network requests
ToneMotion.prototype.shutEverythingDown = function() {
  // previously used clearInterval() for each ID below, but sometimes when I started and stopped repeatedly very fast, it didn't work. Testing showed that I could only stop these loops by clearing an OLDER interval ID, which I didn't understand, but clearing every ID should fix that.
  // clearInterval(this.motionUpdateLoopID);
  // clearInterval(this.cueFetchIntervalID);
  for (let i of this.intervalIDArray) {
    // clear both motionUpdateLoopID and cueFetchIntervalID (stored in array)
    clearInterval(i);
  }

  this.publicLog('Shutting down Transport, sound, motion handling, and network requests');
  this.clearActiveCues();
  Tone.Transport.stop();

  // No need to prevent screen lock any more
  try {
    noSleep.disable();
  } catch (e) {
    // possible corner case: noSleep isn't enabled, and can't be disabled
    console.error(e);
  }
};

/*
** MESSAGES TO USER
*/

// Prints to message label on center panel
ToneMotion.prototype.publicMessage = function(message) {
  message_container.className = 'default';
  message_label.innerHTML = message;
};

// Prints to message label (styled as warning), prints console warning
ToneMotion.prototype.publicWarning = function(message) {
  message_container.className = 'warning';
  message_label.innerHTML = message;
  console.warn(message);
};

// Prints to message label (styled as error) AND sets status to 'error' (which stops execution) AND throws error to console
ToneMotion.prototype.publicError = function(message) {
  this.setStatus('error');
  message_container.className = 'error';
  message_label.innerHTML = message;
  console.error(message);
};

// Clears message label
ToneMotion.prototype.clearMessageLabel = function() {
  message_container.className = 'hidden';
  message_label.innerHTML = '';
}

// Prints to console and to help panel if console_checkbox is checked
ToneMotion.prototype.publicLog = function(message) {
  if (console_checkbox.checked) {
    let logMessage = document.createElement('p');
    logMessage.className = 'logMessage';
    logMessage.innerHTML = message;
    console_container.appendChild(logMessage);
  }
  console.log(message);
};

// Clears console in help panel
ToneMotion.prototype.clearConsole = function() {
  console_container.className = 'hidden';
  let logMessages = document.getElementsByClassName('logMessage');
  while (logMessages[0]) {
    logMessages[0].parentNode.removeChild(logMessages[0]);
  }
};

/*
** INTERFACE LABELS AND ACTIONS
*/

// Sets text and class name for main status label in center panel
ToneMotion.prototype.setStatusLabel = function(text, className) {
  // only reset class if it's not the current class. otherwise no need.
  if (!status_container.classList.contains(className)) {
    // first remove existing state classes (but do NOT remove swell class)
    status_container.classList.remove('active', 'default', 'error');
    status_container.classList.add(className);
  }
  status_label.innerHTML = text;
};

// Sets text and class name for main button in center panel
ToneMotion.prototype.setStartStopButton = function(className, text) {
  // only reset class if it's not the current class. otherwise no need.
  if (!start_stop_button.classList.contains(className)) {
    // first remove existing state classes (but do NOT remove green class)
    start_stop_button.classList.remove('hidden', 'start', 'stop', 'reload', 'disabled');
    start_stop_button.classList.add(className);
  }
  if (text) {
    // text is optional argument
    start_stop_button.innerHTML = text;
  }
};

// Handles click events from primary button (startStopButton)
// Stops and starts Transport, calls startMotionUpdatesAndCueFetching()
// TODO: decide how to handle practice buttons for fixed site. Probably need additional status (ready to complete set up?). see tonemotion-fixed-2.0.0.js
ToneMotion.prototype.bindButtonFunctions = function() {
  start_stop_button.addEventListener('click', () => {
    // Audio context can't start without user action
    // Chrome throws warnings that AudioContext was not allowed to start, but that's fine. It's created in suspended state and the first tap here resumes the AudioContext (https://goo.gl/7K7WLu)
    if (Tone.context.state !== 'running') {
      this.publicLog('Starting AudioContext and Transport');
      Tone.start().then(() => {
        // fixed cue sites need secondary setup, so no Transport yet
        if (!this.fixedCuesOnly) {
          Tone.Transport.start();
        }
      });
    } else if (Tone.Transport.state !== 'started') {
      // possible that audio context is running but Transport was stopped
      if (!this.fixedCuesOnly) {
        this.publicLog('Starting Transport');
        Tone.Transport.start();
      }
    } else {
      // Both audio context and Tone.Transport running. Nothing to do here.
    }

    switch (this.status) {
      case 'readyForSetup':
        // fixed cue sites have additional step before fixed cues play (to give people time to practice), so start motion updates, but NOT Transport
        if (this.fixedCuesOnly) {
          this.startMotionUpdatesAndCueFetching();
        }
      case 'readyToPlay':
      case 'stopped':
        if (this.fixedCuesOnly) {
          // NOW is the time when a fixed cue site starts the Transport
          Tone.Transport.start();
        } else {
          // Reset cue time so that next response from server (if everything is started again) will start cue (whether it's a new cue or the same)
          this.cueTimeFromServer = 0;
          this.startMotionUpdatesAndCueFetching();
          break;
        }
      case 'waitingForPieceToStart':
      case 'playing_tacet':
      case 'playing_tilt':
      case 'playing_shake':
      case 'playing_tiltAndShake':
      case 'playing_dip':
      case 'playing_listen':
      case 'missedCue':
        this.shutEverythingDown();
        this.setStatus('stopped');
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

// Toggles display for console in side panel. Hiding clears log.
ToneMotion.prototype.bindConsoleCheckboxFunctions = function() {
  console_checkbox.addEventListener('change', () => {
    if (console_checkbox.checked) {
      // Console is now displayed. Print message to confirm.
      console_container.className = '';
      this.publicLog('(Console messages will go here)');
    } else {
      // Checkbox is unchecked and console should be cleared
      this.clearConsole();
    }
  })
};

// Toggles display for motion data monitor in side panel.
ToneMotion.prototype.bindMotionCheckboxFunctions = function() {
  motion_data_checkbox.addEventListener('change', () => {
    if (motion_data_checkbox.checked) {
      motion_container.className = '';
      motion_data_label.innerHTML = 'x: ' + this.accel.x + '<br>' + 'y: ' + this.accel.y;
    } else {
      motion_container.className = 'hidden';
      // hiding motion monitor also resets peak levels in (optional) monitors
      this.meter.peak = Number.NEGATIVE_INFINITY;
      this.gyroPeak = Number.NEGATIVE_INFINITY;
    }
  })
};

// Slides side panel in and out
help_button.onclick = function() {
  if (help_panel.classList.contains('slide-out')) {
    help_panel.classList.remove('slide-out');
    help_panel.classList.add('slide-in');
    help_button.classList.remove('slide-out');
    help_button.classList.add('slide-in');
  } else {
    help_panel.classList.remove('slide-in');
    help_panel.classList.add('slide-out');
    help_button.classList.remove('slide-in');
    help_button.classList.add('slide-out');
  }
};

// Adds sliders for accelerometer simulation and a "shake" button
ToneMotion.prototype.simulateMotion = function() {
  // only need to set up if not already set up
  if (!this.shouldSimulateMotion) {
    this.shouldSimulateMotion = true;
    this.accel.rawX = 0; // initialize values to be set later by sliders
    this.accel.rawY = 0;

    // Add fieldset to ToneMotion object and make visible
    this.sliderFieldset = document.querySelector('#sliderFieldset');
    sliderFieldset.className = 'visible';

    // Add slider properties to ToneMotion object
    this.sliderX = document.querySelector('#x_slider');
    this.sliderY = document.querySelector('#y_slider');
    this.shakeButton = document.querySelector('#simulateShakeButton');

    this.shakeButton.addEventListener('click', () => {
      if (this.status === 'playing_shake' ||
      this.status === 'playing_tiltAndShake') {
        this.currentCue.triggerShakeSound();
      } else if (this.status === 'playing_dip') {
        this.currentCue.triggerDipSound();
      }
    });
  }
};

// Changes background to any color defined in stylesheet
ToneMotion.prototype.setBackgroundColor = function(color) {
  colorElements.forEach(
    function(currentValue) {
      // default color is blue, so there's no .blue, but remove every other
      // if I add another color to stylesheet, it needs to get added here too
      currentValue.classList.remove('purple', 'gray', 'green', 'orange');
      // if color is blue, no CSS class is needed because that's the default
      // any invalid argument to this function results in default blue
      if (color !== 'blue') {
        currentValue.classList.add(color);
      }
    }
  );
};

// Displays large-font cue number (or other message) in message container
ToneMotion.prototype.displayCueNumber = function(cue) {
  cue_container.classList.remove('hidden');
  cue_label.innerHTML = cue;
}
ToneMotion.prototype.clearCueDisplay = function(cue) {
  cue_container.classList.add('hidden');
  cue_label.innerHTML = '';
}


/*********************************************************************
********************** DEVICE MOTION HANDLING ************************
*********************************************************************/

// Sets ToneMotion object accel properties and sets shake flag
// Bound to 'devicemotion' event listener, so this is called very often
// but the polling interval is read-only
let motionTestCounterTM = 1; // starting at 1 prevents fail check on 1st loop
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

  // sometimes (inexplicably) the cue fetching and motion updates freeze. This event handler keeps running, so I can use it to check for problems
  // At standard polling interval f 60 times/sec., this happens every 5 sec.
  if (motionTestCounterTM % 300 == 0) {
    this.checkForFailure();
  }
  motionTestCounterTM++;

  // For debugging, add properties to read DeviceMotionEvent interval and display acceleration (not including gravity), used for shake gesture
  // OPTIMIZE: This is the only place I can read the interval, and it shouldn't be expensive to test if debugging is on, but this code get called a lot, so it could be eliminated to streamline this loop.
  if (this.debug) {
    this.motionPollingInterval = event.interval;
    this.gyro_y = event.acceleration.y;
  }
};

// Uses the devicemotion handler to periodically check if everything is ok
ToneMotion.prototype.checkForFailure = function() {
  if (this.motionUpdateCounter === this.lastMotionUpdateCounter) {
    // motionUpdateLoop hasn't been called since last check, which is only a problem if the app status is a playing mode, or waiting to play
    if (this.status === 'waitingForPieceToStart' ||
    this.status === 'playing_tacet' ||
    this.status === 'playing_tilt' ||
    this.status === 'playing_shake' ||
    this.status === 'playing_tiltAndShake' ||
    this.status === 'playing_dip' ||
    this.status === 'playing_listen') {
      // start everything up again
      this.cueTimeFromServer = 0;
      // note that noSleep throws error (bc .enable() called w/o user input?)
      this.startMotionUpdatesAndCueFetching();
    }
  }
  this.lastMotionUpdateCounter = this.motionUpdateCounter;
};

// Starts motionUpdateLoop. Call this to restart motion updates.
ToneMotion.prototype.beginMotionUpdates = function() {
  this.motionUpdateInSeconds = this.motionUpdateLoopInterval/1000;
  this.motionUpdateLoopID = setInterval(this.motionUpdateLoop.bind(this), this.motionUpdateLoopInterval);
  // push ID to array so that I can clear everything later
  this.intervalIDArray.push(this.motionUpdateLoopID);
};

// Primary event loop for ToneMotion. Normalizes motion data, manages shake gestures, and maps motion to sound
/*
** Some Tone.js object properties are signals and can be chained:
** (e.g.,) this.ySig.chain(filterFreqScale, filter.frequency);
** Other properties must be set within repeated function calls, e.g., this.currentCue.updateTiltSounds();
*/
ToneMotion.prototype.motionUpdateLoop = function() {
  // Test successful access to motion data before using values. Can optimize by setting shouldTestMotion to false (from score) when actual piece begins
  if (this.shouldTestMotion && !(this.shouldSimulateMotion)) {
    if (this.motionFailCount > this.motionFailThreshold) {
      if (!(this.motionFailMessageShown)) {
        this.postMotionErrorMessage();
      }
    }
    if (this.accel.rawX === undefined) {
      // No motion data (yet). This could be desktop Chrome, which claims to report motion but does not, so accel values always remain undefined
      this.motionFailCount++;
      // do not attempt to use undefined motion data values
      return;
    } else {
      this.motionFailCount = 0;
    }
  }

  // BUG log: I replicated the motion access bug on Tue Feb 22 at 6:20pm. The following happened: I had reloaded the page and the site successfully fetched the SHAKE cue (cue 6) and successfully set status to "playing_shake" BUT there is no sound and the motion monitor does not update values. I DID check tm.accel.rawX and .rawY and those values DID update BUT tm.accel.x and .y did NOT update; they were frozen even when the raw values updated. SO .handleMotionEvent() is definitely being called. this.accel.lastRawX DID have a value and it was the same as .thisRawX so I know this loop was called at least once. tm.motionFailCount was 0, so it appears this loop was called exactly once. tm.shouldSimulateMotion is false. tm.shouldTestMotion is true because I skipped the cue that turns it off. I called tm.motionUpdateLoop() from console and the values DID update, but just once (and shake sound happened once). So .motionUpdateLoop() works BUT clearly the loop is not being called repeatedly.
  // I then went to decrement cue counter on server (from 6 to 5) and got error that negative numbers are not allowed, and cue was 0, so it appears server restarted. That may have caused issue? When I set cue counter to 5, the site did NOT update. It remained on cue 6. (I checked and yes the server restarted at 6:20pm)
  // NEXT I called tm.syncClocks() to make sure there was still a connection to the server. It worked, and so it reset status to readyToPlay and changed button to "start"
  // NEXT I called tm.beginMotionUpdates() from console, and motion monitor showed changing values again.
  // NEXT I called tm.getCuesFromServer() and it started fetching cues again
  // I made changes to fix issue, but I'm keeping this record of what happened

  // ASSIGN VALUES DIRECTLY FROM SLIDERS IF TESTING ON DESKTOP
  if (this.shouldSimulateMotion) {
    this.accel.x = parseFloat(this.sliderX.value);
    this.accel.y = parseFloat(this.sliderY.value);
  } else {
    // NORMALIZE ACCELEROMETER DATA
    if (this.accel.rawX < -10) { // clamp
      this.accel.x = 0; // no need to normalize
    }
    else if (this.accel.rawX > 10) {
      this.accel.x = 1;
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
  }

  // MAP ACCELEROMETER VALUES TO "TILT" SOUNDS
  // smooths signals to avoid zipper noise
  this.xSig.linearRampTo(this.accel.x, this.motionUpdateInSeconds);
  this.ySig.linearRampTo(this.accel.y, this.motionUpdateInSeconds);

  if (this.status === 'playing_tilt' || this.status === 'playing_tiltAndShake' || this.status === 'playing_dip') {
    // DIP mode can also include TILT sounds
    this.currentCue.updateTiltSounds();
  }

  // TRIGGER SHAKE EVENT (only if cue uses shake)
  if (this.status === 'playing_shake' || this.status === 'playing_tiltAndShake') {
    // Trigger shake event if there hasn't been once recently
    if (this.shakeFlag && !(this.recentShakeFlag)) {
      this.recentShakeFlag = true;
      // Determine number of times through event loop before next possible shake gesture is allowed
      this.shakeGapCounter = Math.floor(this.shakeGap / this.motionUpdateLoopInterval);

      // Shake gesture triggered here
      this.currentCue.triggerShakeSound();

      if (this.debug) {
        let shakeTimestamp = new Date();
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
  }

  // TRIGGER DIP EVENT
  if (this.status === 'playing_dip') {
    if (tm.accel.y < 0.2) {
      // tipping phone upright resets flag so that DIP can be triggered again
      if (!tm.dipFlag) {
        // "secret" event happens when device is tipped back up again
        this.currentCue.triggerDipReset();
        tm.dipFlag = true;
      }
    } else if (tm.accel.y > 0.7) {
      if (tm.dipFlag) {
        // Dip gesture triggered here
        this.currentCue.triggerDipSound();
        tm.dipFlag = false; // flag is false until phone tipped back up
      }
    }
  }

  // (optional) meter on master out lets me see if output clips (to set level)
  // NOTE: if rapid metering is on, a separate interval is set for faster rate
  if (this.meter.isOn && !(this.meter.rapid)) {
    this.meter.level = this.masterMeter.getValue();
    if (this.meter.level > this.meter.peak) {
      // new peak will be displayed in motion monitor (also used for metering)
      this.meter.peak = this.meter.level;
    }
  }

  // Left panel has checkbox to allow monitoring of accel values
  if (motion_data_checkbox.checked) {
    motion_data_label.innerHTML = 'x: ' + this.accel.x + '<br>' + 'y: ' + this.accel.y;
    // Will display DeviceMotionEvent interval and gyro data if debugging
    if (this.debug) {
      let pollingInterval = (this.motionPollingInterval) ? this.motionPollingInterval.toFixed(6) : 'n/a';
      motion_data_label.insertAdjacentHTML('beforeend', '<br>' + 'polling interval: ' +  pollingInterval);
      let gyroY = (this.gyro_y) ? this.gyro_y.toFixed(6) : 'n/a';
      motion_data_label.insertAdjacentHTML('beforeend', '<br>' + 'gyro y: ' +  gyroY);
      if (this.gyro_y > this.gyroPeak) {
        // new peak gyro value
        this.gyroPeak = this.gyro_y;
      }
      if (this.gyroPeak) {
        motion_data_label.insertAdjacentHTML('beforeend', '<br>' + 'peak gyro y: ' +  this.gyroPeak.toFixed(6));
      }
    }
    // Can also monitor meter levels
    if (this.meter.isOn) {
      motion_data_label.insertAdjacentHTML('beforeend', '<br>' + 'master output level: ' +  this.meter.level.toFixed(6));
      motion_data_label.insertAdjacentHTML('beforeend', '<br>' + 'peak level: ' +  this.meter.peak.toFixed(6));
    }
  }
  // this counter is used by handleMotionEvent to test that this loop is running
  this.motionUpdateCounter++;
};

// If access to motion fails, give instructions and option to reload or simulate
let motion_error_container; // needs scope outside this method
ToneMotion.prototype.postMotionErrorMessage = function() {
  // create container for error messages and buttons
  this.motionFailMessageShown = true;
  motion_error_container = document.createElement('div');
  motion_error_container.id = 'motion_error_container';
  motion_error_container.classList.add('error');
  start_stop_button.insertAdjacentElement('afterend', motion_error_container);
  let motionErrorMessage = document.createElement('p');
  motion_error_container.appendChild(motionErrorMessage);

  if (this.motionPermissionStatus === 'denied') {
    motionErrorMessage.innerHTML = "It looks like you denied access to your device's motion data, so you won't be able to control sounds by moving your device. If you'd like to see the permissions dialog again, you'll need to force quit your browser and reopen it. Or you can tap the button below to simulate motion with sliders and a button.";
  } else {
    motionErrorMessage.innerHTML = 'Your device is not reporting motion. You may be on a laptop or desktop, or your device settings may be blocking access to motion data. Please check your device settings and reload this page, or you can click the button below to simulate motion with sliders and a button.';
  }
  this.addMotionSimulationButton();
};

ToneMotion.prototype.addMotionSimulationButton = function() {
  let motion_simulation_button = document.createElement('button');
  motion_simulation_button.id = 'motion_simulation_button';
  motion_simulation_button.classList.add('default', 'error');
  motion_simulation_button.innerHTML = 'simulate motion';
  motion_error_container.appendChild(motion_simulation_button);
  motion_simulation_button .addEventListener('click', () => {
    // remove error message and add motion simulation interface
    this.clearMotionErrorMessage();
    this.simulateMotion();
  });
};

ToneMotion.prototype.clearMotionErrorMessage = function() {
  // only remove motion error message if it exists
  if (typeof motion_error_container !== 'undefined') {
    motion_error_container.remove();
  }
  this.motionFailMessageShown = false;
};

/*********************************************************************
*********** CLIENT/SERVER SYNCHRONIZATION AND COMMUNICATION **********
*********************************************************************/

// Synchronizes client time to server time
const urlForClockSync = 'https://tonemotion-cue-manager.herokuapp.com/clock-sync';
ToneMotion.prototype.syncClocks = function() {
  if (this.shouldSyncToServer && !this.fixedCuesOnly) {
    this.setStatus('synchronizing');
    let syncClockCounter = 0;

    let syncClockID = setInterval( () => {
      let syncTime1 = Date.now(); // client-side timestamp

      fetch(urlForClockSync)
      .then(response => response.text())
      .then(response => {
        let syncTime2 = response; // server-side timestamp
        let syncTime3 = Date.now(); // client-side timestamp on receipt
        let roundtrip = syncTime3 - syncTime1;
        this.publicLog('Time request number ' + syncClockCounter + ' sent at ' + syncTime1 + ' (client time). Response sent at ' + syncTime2 + ' (server time). Response received at ' + syncTime3 + ' (client time). Roundtrip latency: ' + roundtrip + ' milliseconds.');
        if (roundtrip < this.shortestRoundtrip) {
          // Safari caches response despite my very nice request not to
          // It releases cache after first iteration, but first result
          // can't really be trusted
          if (syncClockCounter > 1) {
            this.shortestRoundtrip = roundtrip;
            // shortest roundtrip considered most accurate
            // subtract this.clientServerOffset from client time to sync
            this.clientServerOffset = (syncTime3-syncTime2) - (roundtrip/2);
          } else {
            if (this.debug) {
              this.publicLog('The first response may be served from the disk cache and may not be reliable, so it is disregarded.');
            }
          }
        }
        if (syncClockCounter === 6) { // last check
          if (this.shortestRoundtrip > 2000) {
            this.publicWarning('There seems to be a lot of latency in your connection to the server (' + this.shortestRoundtrip + ' milliseconds of round-trip delay). Your device may not be synchronized.');
          } else {
            this.publicLog('Shortest roundtrip latency was ' + this.shortestRoundtrip + ' milliseconds. Client time is estimated to be ahead of server time by ' + this.clientServerOffset + ' milliseconds.');
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
    if (this.fixedCuesOnly) {
      this.setStatus('readyForSetup');
    } else {
      this.setStatus('readyToPlay');
    }
  }
};

// Polls servers for new cues
// Packet size reduced by subtracting bias on server and adding on client. At time of coding (2018-07-18) Date.now() returns 1531970463500
const timestampBias = 1531970463500;
// cueOnClient is set when cue from server doesn't match.
ToneMotion.prototype.getCuesFromServer = function() {
  fetch(this.urlForCues)
  .then(response => response.json())
  .then(jsonRes => {
    // check if there's a new cue
    // checks cue *time* (not number) because in rehearsal the same cue
    // could be retriggered. same cue number, different time.
    if (this.cueTimeFromServer !== jsonRes.t + timestampBias) {
      // Trigger new cue
      this.cueOnClient = jsonRes.c;
      this.cueTimeFromServer = jsonRes.t + timestampBias;
      // Prevent cue triggering if an error has occurred
      if (this.status !== 'error') {
        this.triggerCue(this.cueOnClient, this.cueTimeFromServer);
        if (this.debug) {
          let timestamp = Date.now() - this.clientServerOffset;
          this.publicLog('New cue number ' + this.cueOnClient + ' fetched from server at ' + timestamp + ' after being set on server at ' + this.cueTimeFromServer + '. Total latency: ' + (timestamp - this.cueTimeFromServer) + ' milliseconds.');
        }
      }
    } // else no new cue and control falls through, on to next loop
    // BUT first check if master volume (set from server interface) has changed
    if (this.masterVolume !== jsonRes.v) {
      Tone.Master.volume.rampTo(jsonRes.v, this.motionUpdateInSeconds);
      this.masterVolume = jsonRes.v;
    }
  })
  .catch(error => this.publicError(error));

  // This is also an opportunity to perform another synchronization test between the client and the server if the latency was high during the inital page load. Threshold currently set to 400 ms. roundtrip latency.
  if (this.shortestRoundtrip > 400) {
    if (this.shouldSyncToServer) {
      this.publicLog('High latency was previously detected. Attempting again to synchronize with server.');
      let syncTime1 = Date.now(); // client-side timestamp
      fetch(urlForClockSync)
      .then(response => response.text())
      .then(response => {
        let syncTime2 = response; // server-side timestamp
        let syncTime3 = Date.now(); // client-side timestamp on receipt
        let roundtrip = syncTime3 - syncTime1;
        if (roundtrip < this.shortestRoundtrip) {
          // there was less latency this time, so update clientServerOffset
          this.shortestRoundtrip = roundtrip;
          this.clientServerOffset = (syncTime3-syncTime2) - (roundtrip/2);
          this.publicLog('New shortest roundtrip latency was ' + this.shortestRoundtrip + ' milliseconds. Client time is estimated to be ahead of server time by ' + this.clientServerOffset + ' milliseconds.');
        }
      })
      .catch(error => this.publicError(error));
    }
  }
};

// Called when server has new cue
ToneMotion.prototype.triggerCue = function(cue, serverTime) {
  // Check that cue exists
  if (this.cue[cue]) {
    // A 'hidden' cue is triggered immediately, does NOT set app status
    // and does NOT clear currently playing cue
    // Use for additional sounds that don't interrupt current interaction
    if (this.cue[cue].mode === 'hidden') {
      try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
      // need timestamp for hidden cue to trigger getSectionBreakpoints
      // NB: time is only accurate if waitTime for hidden cue is 0
      this.cue[cue].startedAt = this.cueTimeFromServer;
      return;
    }
  } else {
    this.publicError('Cue number ' + cue + ' does not exist.');
    return;
  }

  // end of cue causes status label to pulse once
  // new cue causes background to fade out / in. Need to clear previous fade
  status_container.classList.add('swell');
  body_element.classList.remove('fade');

  // This method allows sounds to be triggered when new cue is received (but has not yet begun). These sounds will not be synchronized across clients. Like with goCue() sounds, these sounds can be suppressed when user stops and starts by checking getElapsedTimeInCue()
  // NOTE: This was previously attached to PREVIOUS cue number, so if I migrate an older piece to this version of the library, I need to move cueTransition() in the score forward by one cue
  this.cue[cue].cueTransition();

  // immediately trigger cue with minimum latency if waitTime is -1
  if (this.cue[cue].waitTime == -1) {
    // clear all current cues and previous messages
    this.clearActiveCues();
    try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
    this.setStatusForNewCue(cue);
    //  use this timestamp to facilitate gradual process during a section
    this.cue[cue].startedAt = this.cueTimeFromServer;
    return;
  }

  // lower priority cue (may be deliberately delayed). check client time
  let timestamp = Date.now() - this.clientServerOffset;
  let delay = Math.floor(serverTime - this.serverLatency + this.cue[cue].waitTime - timestamp);
  this.cue[cue].startedAt = this.cueTimeFromServer + this.cue[cue].waitTime;

  // trigger new cue (immediately or after wait time)
  if ((this.cue[cue].openWindow + delay) < 0) {
    // clear all current cues and previous messages
    this.clearActiveCues();
    this.setStatus('missedCue');
    this.publicWarning(`Your device missed its cue by ${(-(delay/1000))} seconds. You'll be able to rejoin at the next cue.`);
  } else if (delay < 20) {
    // clear all current cues and previous messages
    this.clearActiveCues();
    // shorter delay than 20ms is definitely not aurally perceptible
    try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
    this.setStatusForNewCue(cue);
  } else {
    if (delay > this.MAX_DELAY) {
      this.publicError('Request to delay cue for ' + delay + ' milliseconds exceeds maximum delay of ' + this.MAX_DELAY + ' milliseconds.');
      return;
    }
    setTimeout( () => {
      // clear all current cues and previous messages
      this.clearActiveCues();
      try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
      this.setStatusForNewCue(cue);
    }, delay);
  }
};


// Called when cue schedule is fixed and does NOT come from server
// This could be used for interactive videos when timeline is predetermined
// gapTime allows final sound from previous cue to happen before new cue
ToneMotion.prototype.triggerFixedCue = function(cue, gapTime) {
  // Check that cue exists
  if (this.cue[cue]) {
    // A 'hidden' cue is triggered immediately, does NOT set app status
    // and does NOT clear currently playing cue
    // Use for additional sounds that don't interrupt current interaction
    if (this.cue[cue].mode === 'hidden') {
      try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
      // need timestamp for hidden cue to trigger getSectionBreakpoints
      // NB: time is only accurate if waitTime for hidden cue is 0
      this.cue[cue].startedAt = this.cueTimeFromServer;
      return;
    }
  } else {
    this.publicError('Cue number ' + cue + ' does not exist.');
    return;
  }

  // end of cue causes status label to pulse once
  // new cue causes background to fade out / in. Need to clear previous fade
  status_container.classList.add('swell');
  body_element.classList.remove('fade');

  // This method allows sounds to be triggered when new cue is received (but has not yet begun). But in fixed cue context, use gapTime to simulate that
  this.cue[cue].cueTransition();

  // trigger new cue (immediately or after gapTime)
  if (gapTime) {
    setTimeout( () => {
      this.clearActiveCues();
      try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
      // need to set time when cue began to facilitate gradual processes
      this.cue[cue].startedAt = Date.now();
      this.setStatusForNewCue(cue);
    }, gapTime);
  } else {
    this.clearActiveCues();
    try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
    this.cue[cue].startedAt = Date.now();
    this.setStatusForNewCue(cue);
  }
};

// Schedules fixed cue triggers from 2-dimensional array of cue/time pairs (or optionally cue, time, gapTime)
ToneMotion.prototype.scheduleFixedCues = function(cues) {
  if (this.debug) {
    // check accuracy of fixed cue trigger timings
    this.fixedCuesStartedAt = Date.now();
  }
  for (let i in cues) {
    this.cue[cues[i][0]].timeoutID = window.setTimeout( () => {
      if (cues[i][2]) {
        // this means there IS a gapTime to pass to triggerFixedCue()
        this.triggerFixedCue(cues[i][0], cues[i][2]);
      } else {
        this.triggerFixedCue(cues[i][0]);
      }
      this.publicLog(`Fixed cue number ${cues[i][0]} was triggered`);
      if (this.debug) {
        let now = Date.now();
        this.publicLog(`Scheduled wait time: ${cues[i][1]}. Actual wait time: ${now - this.fixedCuesStartedAt}.`);
      }
    }, cues[i][1]);
  }
};

// Clears all cues that are currently sounding
ToneMotion.prototype.clearActiveCues = function() {
  for (let i = 0; i < this.cue.length; i++) {
    if (this.cue[i] && this.cue[i].isPlaying) {
      this.cue[i].stopCue();
      this.cue[i].isPlaying = false;
    }
  }
  // clear any previous message from previous cue
  this.clearMessageLabel();
};

// Sets application status from interactivity mode for this new cue
ToneMotion.prototype.setStatusForNewCue = function(cue) {
  switch (this.cue[cue].mode) {
    case 'waiting':
      this.setStatus('waitingForPieceToStart');
      break;
    case 'tacet':
      this.setStatus('playing_tacet');
      break;
    case 'tilt':
      this.setStatus('playing_tilt');
      break;
    case 'shake':
      this.setStatus('playing_shake');
      break;
    case 'tiltAndShake':
      this.setStatus('playing_tiltAndShake');
      break;
    case 'dip':
      this.setStatus('playing_dip');
      break;
    case 'listen':
      this.setStatus('playing_listen');
      break;
    case 'finished':
      this.setStatus('finished');
      break;
    default:
      this.publicError('Error setting application status for new cue');
  }

  this.currentCue = this.cue[cue];
  this.currentCue.isPlaying = true;
};

// Takes cue number and breakpoint array of time/value pairs. Returns interpolated values reflecting elapsed time in current segment of requested cue. Requires cue number since gradual process may overlap with next cue called. Can't use current cue number because that may be next cue.
ToneMotion.prototype.getSectionBreakpoints = function(cue, breakpointArray) {
  let elapsedTime; // needs function scope
  // check that function is passed cue number AND array of breakpoints
  // Each time needs a corresponding value (need even # of elements in array)
  if (arguments.length < 2 || breakpointArray.length % 2 !== 0) {
    this.publicLog('Missing value for getSectionBreakpoints(), which requires a cue number and an array of time/value pairs. Example: getSectionBreakpoints(3, [1000, 0.5, 2000, 1.0]).')
    return 0;
  }

  // check that requested cue has actually begun
  if (this.cue[cue].startedAt === 0) {
    this.publicLog('Section breakpoint value requested for cue that has not started yet.');
    return 0;
  } else {
    elapsedTime = Date.now() - this.clientServerOffset - this.cue[cue].startedAt;
  }

  // Go through array of time/value pairs
  for (let i = 0; i < breakpointArray.length; i = i + 2) {
    // Each time needs to be greater than previous
    if (breakpointArray[i] >= breakpointArray[i+2]) {
      this.publicLog('getSectionBreakpoints() requires an array of time/value pairs in which each time is greater than previous (e.g., [1000, 0.5, 2000, 1.0]).');
      return 0;
    }
    // Find which segment current time is in
    if (elapsedTime <= breakpointArray[i]) {
      // time of previous breakpoint (if there was one)
      let prevTime = breakpointArray[i-2] || 0;
      // duration of this segment
      let segTime = breakpointArray[i] - prevTime;
      // progress in this segment
      let segProg = (elapsedTime - prevTime) / segTime;
      // previous value (or zero if none)
      let prevVal = breakpointArray[i-1] || 0;
      // interpolated value for progress along this segment
      return prevVal + segProg * (breakpointArray[i+1] - prevVal);
    }
  }
  // If time has elapsed, return last value
  return breakpointArray[breakpointArray.length-1];
};

// Same as getSectionBreakpoints(), but loops pattern continuously
ToneMotion.prototype.getSectionBreakpointLoop = function(cue, breakpointArray) {
  let elapsedTimeInLoop; // needs function scope
  // check that function is passed cue number AND array of breakpoints
  // Each time needs a corresponding value (need even # of elements in array)
  if (arguments.length < 2 || breakpointArray.length % 2 !== 0) {
    this.publicLog('Missing value for getSectionBreakpointLoop(), which requires a cue number and an array of time/value pairs. Example: getSectionBreakpointLoop(3, [1000, 0.5, 2000, 1.0]).')
    return 0;
  }

  // check that requested cue has actually begun
  if (this.cue[cue].startedAt === 0) {
    this.publicLog('Section breakpoint value requested for cue that has not started yet.');
    return 0;
  } else {
    let elapsedTime = Date.now() - this.clientServerOffset - this.cue[cue].startedAt;
    // time elapsed in this iteration of loop determined by final loop time
    elapsedTimeInLoop = elapsedTime % breakpointArray[breakpointArray.length - 2];
  }

  // Go through array of time/value pairs
  for (let i = 0; i < breakpointArray.length; i = i + 2) {
    // Each time needs to be greater than previous (error check for above)
    if (breakpointArray[i] >= breakpointArray[i+2]) {
      this.publicLog('getSectionBreakpointLoop() requires an array of time/value pairs in which each time is greater than previous (e.g., [1000, 0.5, 2000, 1.0]).');
      return 0;
    }
    // Find which segment current time is in
    if (elapsedTimeInLoop <= breakpointArray[i]) {
      // time of previous breakpoint (if there was one)
      let prevTime = breakpointArray[i-2] || 0;
      // duration of this segment
      let segTime = breakpointArray[i] - prevTime;
      // progress in this segment
      let segProg = (elapsedTimeInLoop - prevTime) / segTime;
      // previous value (or zero if none)
      let prevVal = breakpointArray[i-1] || 0;
      // interpolated value for progress along this segment
      return prevVal + segProg * (breakpointArray[i+1] - prevVal);
    }
  }
};

// Takes cue number and time elapsed since that cue began (or 0 if it hasn't)
ToneMotion.prototype.getElapsedTimeInCue = function(cue) {
  let elapsedTime;

  // check that function is passed cue number
  if (arguments.length < 1) {
    this.publicLog('Missing value for cue number.');
    return 0;
  }

  // check that requested cue has actually begun
  if (this.cue[cue].startedAt === 0) {
    this.publicLog('Elapsed time requested for cue that has not started yet.');
    return 0;
  } else {
    elapsedTime = Date.now() - this.clientServerOffset - this.cue[cue].startedAt;
    if (elapsedTime < 0) {
      // this cue is still in the waitTime phase
      return 0;
    } else {
      return elapsedTime;
    }
  }
};

// Fades out and stops all audio files. Takes three arguments: an array of Tone.Player objects, a delay time before fade starts, and a duration to fade out
ToneMotion.prototype.fadeFilesOverCurve = function(audioFiles, delayTime, fadeTime) {
  // array of volume values to pass to setValueCurveAtTime()
  let values = [0, -99];
  // error check value for delayTime
  if (isNaN(delayTime) || delayTime < 0) {
    this.publicError('Second argument to fadeFilesOverTime() is delayTime, which must be positive number or 0.');
    return;
  }
  // error check value for fadeTime
  if (isNaN(fadeTime) || fadeTime < 0) {
    this.publicError('Third argument to fadeFilesOverTime() is fadeTime, which must be positive number or 0.');
    return;
  }
  // fade all files in array
  for (let i = 0; i < audioFiles.length; i++) {
    if (audioFiles[i].volume) {
      // reset start point of fade to current volume
      values[0] = audioFiles[i].volume.value;
      audioFiles[i].volume.setValueCurveAtTime(values, '+' + delayTime, fadeTime);
      // stop file playback after fade out is complete
      audioFiles[i].stop('+' + (delayTime + fadeTime));
    } else {
      this.publicError(audioFiles[i] + ' does not have a volume property to fade out.');
    }
  }
};

// picks random element from array
ToneMotion.prototype.pickRand = function(array) {
  return array[Math.floor(Math.random() * array.length)];
};

/*********************************************************************
************************ CUE LIST MANAGEMENT *************************
*********************************************************************/

/**
 * Create a new musical section
 * @param {string} mode - Mode of interactivity. Can be: 'waiting',
 * 'tacet', 'tilt', 'shake', 'tiltAndShake', 'dip', 'listen', 'finished'
 * or 'hidden' (immediate cue without changing application status)
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
  this.startedAt = 0; // not set by constructor. used by getSectionBreakpoints()
}

// All the following methods should be overriden in score for a particular cue
TMCue.prototype.cueTransition = function() {
  // Override if section uses sound as transition from previous cue
};

TMCue.prototype.goCue = function() {
  // Override to set up section (called at beginning of section)
};

TMCue.prototype.stopCue = function() {
  // Override if section needs to release synths, stop loops, etc.
};

TMCue.prototype.updateTiltSounds = function() {
  // Override if section uses TILT (which also applies to DIP)
};

// Override this method in score to make SHAKE interactive sounds
TMCue.prototype.triggerShakeSound = function() {
  // Override if section uses SHAKE
};

TMCue.prototype.triggerDipSound = function() {
  // Override this method in score to make DIP interactive sounds
};

TMCue.prototype.triggerDipReset = function() {
  // Called in DIP section if device is turned BACK right-side up
};
