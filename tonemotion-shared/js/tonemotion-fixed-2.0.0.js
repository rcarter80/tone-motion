/*********************************************************************
************************ APPLICATION SETUP ***************************
*********************************************************************/

// NOTE: This all depends on Tone.js, which must appear first
// NOTE: this version number isn't really accurate because this is the fixed library and I should eventually merge the fixed and normal versions. Consider adding fixed supplemental js file?
const VERSION = '2.0.0';

/*
** DOM HOOKS
*/

const help_button = document.querySelector('#help_button');
const status_container = document.querySelector('#status_container');
const status_label = document.querySelector('#status_label');
const start_stop_button = document.querySelector('#start_stop_button');
const message_container = document.querySelector('#message_container');
const message_label = document.querySelector('#message_label');
const help_panel = document.querySelector('#help_panel');
const section_instructions = document.querySelector('#section_instructions');
const motion_data_checkbox = document.querySelector('#motion_data_checkbox');
const motion_data_label = document.querySelector('#motion_data_label');
const console_checkbox = document.querySelector('#console_checkbox');
const console_container = document.querySelector('#console_container');
const html_element = document.querySelector('html');
const body_element = document.querySelector('body');
// NodeLists of all buttons and links
const buttonList = document.querySelectorAll('button');
const linkList = document.querySelectorAll('a');

/*
** Tone.Signal objects: set by accelerometer to act as control signals
*/

var xTilt = new Tone.Signal(0.5); // ranges from 0.0 to 1.0
var yTilt = new Tone.Signal(0.5);

/**
 * Object to encapsulate properties and methods for ToneMotion
 * @param {string} status - Application status (set automatically)
 * @param {boolean} debug - Can set to 'true' in score.js
 * @param {boolean} localTest - Set to 'true' in score.js to test locally
 * @param {boolean} showConsoleOnLaunch - Shows console log by default
 * @param {boolean} shouldSyncToServer - Find time offset between client
 *    and server (clientServerOffset). If false, offset is 0.
 * @param {number} clientServerOffset - (ms.) Adjustment to client time
 * @param {boolean} deviceIsAndroid - Otherwise, device is probably iOS
 * @param {boolean} motionEventListenerAdded - tracks devicemotion handlers
 * @param {object} accel - x and y values for accelerometer. Values
 *    undefined by default, to be set by devicemotion OR desktop testing
 *    "raw" values are as reported by device before normalizing
 * @param {Tone.Signal} xSig - Control signal mapped to x-axis of accel
 * @param {Tone.Signal} ySig - Control signal mapped to y-axis of accel
 * @param {number} shakeThreshold - gyro value to trigger shakeFlag
 * @param {number} shakeGap - (ms.) Min. time between shake gestures
 * @param {boolean} shakeFlag - If gyro values exceed threshold, true
 * @param {boolean} recentShakeFlag - If shake gesture triggered within
 *    the last <shakeGap> milliseconds, this is set to true
 * @param {number} shakeGapCounter - To prevent immediate successive
 *    shake gestures, counter counts down (shakeGap /
 *    motionUpdateLoopInterval) times, then reset recentShakeFlag
 * @param {boolean} shouldTestOnDesktop - Sets motion values to 0
 * @param {boolean} demoOnly - Does not use cue counter at all
 * @param {boolean} showPracticeButtons - shows buttons to practice shake/tilt
 * @param {boolean} glowingTransitions - Makes status label pulse once at end of cue
 * @param {boolean} colorCodeMode - Changes background color with cue mode
 * @param {number} motionUpdateLoopInterval - (ms.) How often the main
 *    ToneMotion event loop happens. Tradeoff: responsiveness vs. cost
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
 */

function ToneMotion() {
  this.status = '';
  this.debug = false;
  this.localTest = false;
  // console was hidden by default, but showing it fixes scroll bug in iOS
  this.showConsoleOnLaunch = true;
  this.shouldSyncToServer = false;
  this.clientServerOffset = 0;
  this.deviceIsAndroid = false;
  this.motionEventListenerAdded = false;
  this.accel = {
    rawX: undefined,
    rawY: undefined,
    x: undefined,
    y: undefined,
  }
  this.xSig = xTilt;
  this.ySig = yTilt;
  this.shakeThreshold = 2;
  this.shakeGap = 250;
  this.shakeFlag = false;
  this.recentShakeFlag = false;
  this.shakeGapCounter = 0;
  this.shouldTestOnDesktop = false;
  this.demoOnly = false;
  this.showPracticeButtons = true;
  this.glowingTransitions = true;
  this.colorCodeMode = true;
  this.motionUpdateLoopInterval = 50;
  this.cuePollingInterval = 500;
  this.intervalIDArray = [];
  this.motionUpdateCounter = 0;
  this.lastMotionUpdateCounter = 0;
  // when server restarts, both cue number and time revert to 0
  // init with -1 for both so cue 0 is still triggered when server restarts
  this.cueOnClient = -1;
  this.cueTimeFromServer = -1;
  this.cue = [];
  this.currentCue = {};
  this.MAX_DELAY = 10000;
  this.serverLatency = 0;
  this.urlForCues = '';
}

// Registers event handlers to interface elements, confirms that buffers are loaded, begins devicemotion handling
// Triggers syncClocks() once buffers have succesfully loaded
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

  this.setStatus('loading');
  this.publicLog('Audio buffers loading');
  Tone.loaded().then(() => {
    this.publicLog('Audio buffers finished loading');
    this.publicLog(`tonemotion v${VERSION} loaded`);
    // Synchronize client clock to server once all resources loaded
    this.syncClocks();
    this.beginMotionHandlingOnAndroid();
  }).catch(() => {
    // BUG: Safari resolves promise even if files don't load
    this.publicError('Error loading the audio files');
  });
};

// Tests if device is Android, registers 'devicemotion' event listener. iOS devices require permission after user interaction, but Android devices can begin polling motion sensor data immediately. Waiting to get motion data on Android until same point as I ask for permission on iOS does NOT work on Android. Motion polling chokes.
ToneMotion.prototype.beginMotionHandlingOnAndroid = function() {
  if (this.debug) {
    this.publicLog('Will begin motion handling if device is Android.');
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
    // Immediately begin polling motion sensors ONLY on Android
    this.addMotionEventListener();
  }
  else {
    this.deviceIsAndroid = false;
    if (this.debug) {
      this.publicLog('This device does not appear to be an Android');
    }
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
    // on iOS, user still needs to give motion access permission
    // music won't play until next status (startNow)
      this.setStatusLabel('ready', 'default');
      this.setStartStopButton('start', 'tap to complete setup');
      break;
    case 'startNow':
      this.setStatusLabel('ready', 'default');
      if (this.demoOnly) {
        this.setStartStopButton('hidden', '');
      } else {
        this.setStartStopButton('start', 'start');
      }
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
    case 'playing_listen':
      this.setStatusLabel('just listen', 'default');
      this.setStartStopButton('stop', 'stop');
      break;
    case 'missedCue':
      this.setStatusLabel('(wait for next cue)', 'default');
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
    // changes background color with interactivity mode (if color code is on)
    if (this.colorCodeMode) {
      switch (status) {
        case 'playing_tilt':
          this.setBackgroundGreen();
          break;
        case 'playing_shake':
        case 'playing_tiltAndShake':
          this.setBackgroundGray();
          break;
        default:
          this.setBackgroundBlue();
      }
    }
    // need to remove 'swell' class to reset pulsing glow at end of next cue
    // need to add 'fade' class to <body> to create background color transition
    if (this.glowingTransitions) {
      status_container.classList.remove('swell');
      body_element.classList.add('fade');
    }

    if (this.debug) {
      this.publicLog('Application status set to ' + this.status);
    }
};

// registers event handler for devicemotion, but only once
ToneMotion.prototype.addMotionEventListener = function() {
  if (!this.motionEventListenerAdded) {
    window.addEventListener('devicemotion', this.handleMotionEvent.bind(this), true);
    this.motionEventListenerAdded = true;
  }
};

// Starts motion handling, but NOT cue fetching because there is none here
var noSleep; // needs global scope
ToneMotion.prototype.startMotionUpdates = function() {
  this.publicLog('Starting motion updates');

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

  // testing iOS 13 motion permission
  // Guard against reference errors by checking that DeviceMotionEvent is defined
  if (typeof DeviceMotionEvent !== 'undefined' &&
  typeof DeviceMotionEvent.requestPermission === 'function') {
    if (this.debug) {
      this.publicLog('Requesting permission for motion data');
    }
    // Device requests motion permission (e.g., iOS 13+)
    DeviceMotionEvent.requestPermission()
    .then(permissionState => {
      if (permissionState === 'granted') {
        this.addMotionEventListener();
      } else {
        // user has not give permission for motion. Pretend device is desktop
        this.testWithoutMotion();
      }
      this.beginMotionUpdates();
    })
    .catch(console.error);
  } else {
    // handle non iOS 13+ devices, which could still report motion
    if (this.debug) {
      this.publicLog('Not an iOS 13+ device');
    }
    if ('DeviceMotionEvent' in window) {
      // If device is Android, handleMotionEvent is already running
      this.addMotionEventListener();
    } else {
      this.testWithoutMotion();
    }
    this.beginMotionUpdates();
  }
  this.setStatus('startNow');
};

// after shutting everything down, need to start motion handling again
// OPTIMIZE: should refactor code above with this
ToneMotion.prototype.resumeMotionUpdates = function() {
  this.publicLog('Resuming motion updates');

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

  // testing iOS 13 motion permission
  // Guard against reference errors by checking that DeviceMotionEvent is defined
  if (typeof DeviceMotionEvent !== 'undefined' &&
  typeof DeviceMotionEvent.requestPermission === 'function') {
    if (this.debug) {
      this.publicLog('Requesting permission for motion data');
    }
    // Device requests motion permission (e.g., iOS 13+)
    DeviceMotionEvent.requestPermission()
    .then(permissionState => {
      if (permissionState === 'granted') {
        this.addMotionEventListener();
      } else {
        // user has not give permission for motion. Pretend device is desktop
        this.testWithoutMotion();
      }
      this.beginMotionUpdates();
    })
    .catch(console.error);
  } else {
    // handle non iOS 13+ devices, which could still report motion
    if (this.debug) {
      this.publicLog('Not an iOS 13+ device');
    }
    if ('DeviceMotionEvent' in window) {
      // If device is Android, handleMotionEvent is already running
      this.addMotionEventListener();
    } else {
      this.testWithoutMotion();
    }
    this.beginMotionUpdates();
  }
};

// Clears all sound, loops, motion handling, and network requests
ToneMotion.prototype.shutEverythingDown = function() {
  // clear all previously scheduled cue triggers
  for (var i = 0; i < this.cue.length; i++) {
    window.clearTimeout(this.cue[i].timeoutID);
  }

  // previously used clearInterval() for each ID below, but sometimes when I started and stopped repeatedly very fast, it didn't work. Testing showed that I could only stop these loops by clearing an OLDER interval ID, which I didn't understand, but clearing every ID should fix that.
  for (let i of this.intervalIDArray) {
    // clear every motionUpdateLoopID (stored in array)
    clearInterval(i);
  }

  this.publicLog('Shutting down Transport, sound, and motion handling');
  this.clearActiveCues();
  Tone.Transport.stop();

  // Reset cue time so that next response from server (if everything is started again) will start cue (whether it's a new cue or the same)
  this.cueTimeFromServer = 0;

  // No need to prevent screen lock any more
  noSleep.disable();
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
    var logMessage = document.createElement('p');
    logMessage.className = 'logMessage';
    logMessage.innerHTML = message;
    console_container.appendChild(logMessage);
  }
  console.log(message);
};

// Clears console in help panel
ToneMotion.prototype.clearConsole = function() {
  console_container.className = 'hidden';
  var logMessages = document.getElementsByClassName('logMessage');
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
ToneMotion.prototype.bindButtonFunctions = function() {
  start_stop_button.addEventListener("click", () => {
    // Audio context can't start without user action
    // Chrome throws warnings that AudioContext was not allowed to start, but that's fine. It's created in suspended state and the first tap here resumes the AudioContext (https://goo.gl/7K7WLu)
    if (Tone.context.state !== 'running') {
      Tone.context.resume().then(() => {
        console.log('Audio context started');
      });
    }

    switch (this.status) {
      case 'readyToPlay':
        this.startMotionUpdates();
        if (this.showPracticeButtons) {
          shake_test_button.classList.remove('hidden');
          tilt_test_button.classList.remove('hidden');
          if (this.demoOnly) {
            this.publicMessage('To try out the two modes of interactive sound, tap the buttons above.');
          } else {
          this.publicMessage('To experience the interactive sounds for this piece, load this site on your phone and load the recording of the piece on another device. Then begin playing that recording at the exact same time that you tap the start button on your phone. You can use the buttons below to practice the two modes of interactive sound before you begin playing the recording.');
          }
        }
        break;
      case 'startNow':
        Tone.Transport.start();
        shake_test_button.classList.add('hidden');
        tilt_test_button.classList.add('hidden');
        break;
      case 'stopped':
        this.resumeMotionUpdates();
        Tone.Transport.start();
        shake_test_button.classList.add('hidden');
        tilt_test_button.classList.add('hidden');
        break;
      case 'waitingForPieceToStart':
      case 'playing_tacet':
      case 'playing_tilt':
      case 'playing_shake':
      case 'playing_tiltAndShake':
      case 'playing_listen':
      case 'missedCue':
        this.setStatus('stopped');
        this.shutEverythingDown();
        if (this.showPracticeButtons) {
          shake_test_button.classList.remove('hidden');
          tilt_test_button.classList.remove('hidden');
          if (this.demoOnly) {
            this.setStartStopButton('hidden', '');
          }
        }
        break;
      case 'error':
        // Reload the current page, without using the cache
        window.location.reload(true);
        break;
      default:
        this.publicError('Error setting function for button');
    }
  });

  shake_test_button.addEventListener("click", () => {
    if (this.status === 'stopped') {
      this.resumeMotionUpdates();
    }
    // cue 3 is shake tutorial (in live piece) or practice in fixed cue site
    this.triggerFixedCue(3, 0);
  });
  tilt_test_button.addEventListener("click", () => {
    if (this.status === 'stopped') {
      this.resumeMotionUpdates();
    }
    // cue 1 is tilt tutorial (in live piece) or practice in fixed cue site
    this.triggerFixedCue(1, 0);
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
  });
};

// Toggles display for motion data monitor in side panel.
ToneMotion.prototype.bindMotionCheckboxFunctions = function() {
  motion_data_checkbox.addEventListener('change', () => {
    if (motion_data_checkbox.checked) {
      motion_container.className = '';
      motion_data_label.innerHTML = 'x: ' + (this.accel.x || 'no value reported') + '<br>' + 'y: ' + (this.accel.y || 'no value reported');
    } else {
      motion_container.className = 'hidden';
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
ToneMotion.prototype.testWithoutMotion = function() {
  this.shouldTestOnDesktop = true;
  this.accel.rawX = 0; // initialize values to be set later by sliders
  this.accel.rawY = 0;

  // Add fieldset to ToneMotion object and make visible
  this.sliderFieldset = document.querySelector('#sliderFieldset');
  sliderFieldset.className = 'visible';

  // Add slider properties to ToneMotion object
  this.sliderX = document.querySelector('#x_slider');
  this.sliderY = document.querySelector('#y_slider');
  this.shakeButton = document.querySelector('#simulateShakeButton');

  this.shakeButton.addEventListener("click", () => {
    this.currentCue.triggerShakeSound();
  });

  if (this.debug) {
    this.publicLog('This device does not appear to report motion. Sliders can be used to simulate motion.');
  }
};

// Changes background to green gradient
ToneMotion.prototype.setBackgroundGreen = function() {
  // remove purple class in case background is currently purple
  html_element.classList.remove('purple', 'gray');
  html_element.classList.add('green');
  body_element.classList.remove('purple', 'gray');
  body_element.classList.add('green');
  help_panel.classList.remove('purple', 'gray');
  help_panel.classList.add('green');
  buttonList.forEach(
    function(currentValue) {
      currentValue.classList.remove('purple', 'gray');
      currentValue.classList.add('green');
    }
  );
  linkList.forEach(
    function(currentValue) {
      currentValue.classList.remove('purple', 'gray');
      currentValue.classList.add('green');
    }
  );
};

// Changes background to purple gradient
ToneMotion.prototype.setBackgroundPurple = function() {
  // remove green class in case background is currently green
  html_element.classList.remove('green', 'gray');
  html_element.classList.add('purple');
  body_element.classList.remove('green', 'gray');
  body_element.classList.add('purple');
  help_panel.classList.remove('green', 'gray');
  help_panel.classList.add('purple');
  buttonList.forEach(
    function(currentValue) {
      currentValue.classList.remove('green', 'gray');
      currentValue.classList.add('purple');
    }
  );
  linkList.forEach(
    function(currentValue) {
      currentValue.classList.remove('green', 'gray');
      currentValue.classList.add('purple');
    }
  );
};

// Changes background to gray gradient
ToneMotion.prototype.setBackgroundGray = function() {
  // remove green class in case background is currently green
  html_element.classList.remove('green', 'purple');
  html_element.classList.add('gray');
  body_element.classList.remove('green', 'purple');
  body_element.classList.add('gray');
  help_panel.classList.remove('green', 'purple');
  help_panel.classList.add('gray');
  buttonList.forEach(
    function(currentValue) {
      currentValue.classList.remove('green', 'purple');
      currentValue.classList.add('gray');
    }
  );
  linkList.forEach(
    function(currentValue) {
      currentValue.classList.remove('green', 'purple');
      currentValue.classList.add('gray');
    }
  );
};

// Changes background to default blue gradient
ToneMotion.prototype.setBackgroundBlue = function() {
  html_element.classList.remove('green', 'purple', 'gray');
  body_element.classList.remove('green', 'purple', 'gray');
  help_panel.classList.remove('green', 'purple', 'gray');
  buttonList.forEach(
    function(currentValue) {
      currentValue.classList.remove('green', 'purple', 'gray')
    }
  );
  linkList.forEach(
    function(currentValue) {
      currentValue.classList.remove('green', 'purple', 'gray')
    }
  );
};

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
  // At standard polling interval of 60 times/sec., this happens every 5 sec.
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
    this.status === 'playing_listen') {
      // start everything up again
      this.cueTimeFromServer = 0;
      // note that noSleep throws error (bc .enable() called w/o user input?)
      this.resumeMotionUpdates();
    }
  }
  this.lastMotionUpdateCounter = this.motionUpdateCounter;
};

// Tests if device actually reports motion or is lying. Starts motionUpdateLoop. Call this to restart motion updates.
ToneMotion.prototype.beginMotionUpdates = function() {
  if (this.debug) {
    this.publicLog('Motion mapping loop starting up');
  }

  // Test if device actually reports motion. Chrome lies and claims that desktop browser handles device motion, but doesn't report it
  // Another possibility is an iOS 12.2 - 12.4 device with motion access off
  // Need to provide instructions for turning it on
  // Automatically make sliders visible for desktop testing if needed
  if (this.accel.rawX === undefined) {
    var motionTestTimeoutID = setTimeout(() => {
      if (this.debug) {
        this.publicLog('Device claims to report motion. Checking if this is true.');
      }
      if (this.accel.rawX === undefined) {
        // still no motion reported. Probably either 1) device is desktop or 2) device is iOS 12.2-12.4 and has motion access permission off
        if (window.confirm("Your device is not reporting motion. You may either be on a desktop computer, or this may be a result of your mobile browser settings. If you're on an iPhone, go to Settings > Safari > Motion & Orientation Access and make sure this setting is on. Reload the page to try again, or continue to launch the desktop version.")) {
          this.testWithoutMotion();
        } else {
          this.setStatus('stopped');
          this.shutEverythingDown();
        }
      }
    }, 500);
  }

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
  // ASSIGN VALUES DIRECTLY FROM SLIDERS IF TESTING ON DESKTOP
  if (this.shouldTestOnDesktop) {
    this.accel.x = this.sliderX.value;
    this.accel.y = this.sliderY.value;
  } else {
    // NORMALIZE ACCELEROMETER DATA
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
  }

  // MAP ACCELEROMETER VALUES TO "TILT" SOUNDS
  // smooths signals to avoid zipper noise
  if (this.shouldTestOnDesktop) {
    // desktop Chrome has issues with linearRampTo next value, so value is set directly and could cause zipper noise on desktop
    this.xSig.value = this.accel.x;
    this.ySig.value = this.accel.y;
  } else {
    // BUT this is for mobile anyway, so use this to smooth signal
    this.xSig.linearRampTo(this.accel.x, (this.motionUpdateLoopInterval/1000));
    this.ySig.linearRampTo(this.accel.y, (this.motionUpdateLoopInterval/1000));
  }

  if (this.status === 'playing_tilt' || this.status === 'playing_tiltAndShake') {
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
  }

  // Left panel has checkbox to allow monitoring of accel values
  if (motion_data_checkbox.checked) {
    motion_data_label.innerHTML = 'x: ' + (this.accel.x || 'no value reported') + '<br>' + 'y: ' + (this.accel.y || 'no value reported');

    // Will display DeviceMotionEvent interval and gyro data if debugging
    if (this.debug) {
      motion_data_label.insertAdjacentHTML('beforeend', '<br>' + 'polling interval: ' +  (this.motionPollingInterval || 'n/a'));
      motion_data_label.insertAdjacentHTML('beforeend', '<br>' + 'gyro y: ' +  (this.gyro_y || 'n/a'));
    }
  }
  // this counter is used by handleMotionEvent to test that this loop is running
  this.motionUpdateCounter++;
};

/*********************************************************************
*********** CLIENT/SERVER SYNCHRONIZATION AND COMMUNICATION **********
*********************************************************************/

// Synchronizes client time to server time
const urlForClockSync = 'https://tonemotion-cue-manager.herokuapp.com/clock-sync';
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
          // Safari caches response despite my very nice request not to
          // It releases cache after first iteration, but first result
          // can't really be trusted
          if (syncClockCounter > 1) {
            shortestRoundtrip = roundtrip;
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

// Called when server has new cue
ToneMotion.prototype.triggerCue = function(cue, serverTime) {
  // Check that cue exists
  if (this.cue[cue]) {
    // A 'hidden' cue is triggered immediately, does NOT set app status
    // and does NOT clear currently playing cue
    // Use for additional sounds that don't interrupt current interaction
    if (this.cue[cue].mode === 'hidden') {
      try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
      return;
    }
  } else {
    this.publicError('Cue number ' + cue + ' does not exist.');
    return;
  }

  // clear all current cues
  this.clearActiveCues();

  // immediately trigger cue with minimum latency if waitTime is -1
  // This could be faster if moved to top of function,
  // but that makes the code messy.
  if (this.cue[cue].waitTime == -1) {
    try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
    this.setStatusForNewCue(cue);
    //  use this timestamp to facilitate gradual process during a section
    this.cue[cue].startedAt = this.cueTimeFromServer;
    return;
  }

  // lower priority cue (may be deliberately delayed). check client time
  var timestamp = Date.now() - this.clientServerOffset;
  var delay = Math.floor(serverTime - this.serverLatency + this.cue[cue].waitTime - timestamp);
  this.cue[cue].startedAt = this.cueTimeFromServer + this.cue[cue].waitTime;

  // trigger new cue (immediately or after wait time)
  if ((this.cue[cue].openWindow + delay) < 0) {
    this.setStatus('missedCue');
    this.publicWarning('Your device missed its cue by ' + (-delay) + ' milliseconds! If this keeps happening, there may be a problem with your connection.');
  } else if (delay < 20) {
    // shorter delay than 20ms is definitely not aurally perceptible
    try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
    this.setStatusForNewCue(cue);
  } else {
    if (delay > this.MAX_DELAY) {
      this.publicError('Request to delay cue for ' + delay + ' milliseconds exceeds maximum delay of ' + this.MAX_DELAY + ' milliseconds.');
      return;
    }
    setTimeout( () => {
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
      return;
    }
  } else {
    this.publicError('Cue number ' + cue + ' does not exist.');
    return;
  }

  // clear all current cues
  this.clearActiveCues();

  // trigger new cue (immediately or after gapTime)
  if (gapTime) {
    setTimeout( () => {
      try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
      // need to set time when cue began to facilitate gradual processes
      this.cue[cue].startedAt = Date.now();
      this.setStatusForNewCue(cue);
    }, gapTime);
  } else {
    try { this.cue[cue].goCue(); } catch(e) { this.publicError(e); }
    this.cue[cue].startedAt = Date.now();
    this.setStatusForNewCue(cue);
  }
};

// Schedules fixed cue triggers from 2-dimensional array of cue/time pairs
ToneMotion.prototype.scheduleFixedCues = function(cues) {
  if (this.debug) {
    // check accuracy of fixed cue trigger timings
    this.fixedCuesStartedAt = Date.now();
  }
  for (let i in cues) {
    this.cue[cues[i][0]].timeoutID = window.setTimeout( () => {
      this.triggerFixedCue(cues[i][0]);
      this.publicLog(`Fixed cue number ${cues[i][0]} triggered`);
      if (this.debug) {
        let now = Date.now();
        this.publicLog(`Scheduled wait time: ${cues[i][1]}. Actual wait time: ${now - this.fixedCuesStartedAt}.`);
      }
    }, cues[i][1]);
  }
};

// Clears all cues that are currently sounding
ToneMotion.prototype.clearActiveCues = function() {
  for (var i = 0; i < this.cue.length; i++) {
    if (this.cue[i] && this.cue[i].isPlaying) {
      this.cue[i].stopCue();
      this.cue[i].isPlaying = false;
    }
  }
  // by default, end of cue causes status label to pulse once
  // new cue causes background to fade out and in. Need to clear previous fade
  if (this.glowingTransitions) {
    status_container.classList.add('swell');
    body_element.classList.remove('fade');
  }
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
    var elapsedTime = Date.now() - this.clientServerOffset - this.cue[cue].startedAt;
  }

  // Go through array of time/value pairs
  for (var i = 0; i < breakpointArray.length; i = i + 2) {
    // Each time needs to be greater than previous
    if (breakpointArray[i] >= breakpointArray[i+2]) {
      this.publicLog('getSectionBreakpoints() requires an array of time/value pairs in which each time is greater than previous (e.g., [1000, 0.5, 2000, 1.0]).');
      return 0;
    }
    // Find which segment current time is in
    if (elapsedTime <= breakpointArray[i]) {
      // time of previous breakpoint (if there was one)
      var prevTime = breakpointArray[i-2] || 0;
      // duration of this segment
      var segTime = breakpointArray[i] - prevTime;
      // progress in this segment
      var segProg = (elapsedTime - prevTime) / segTime;
      // previous value (or zero if none)
      var prevVal = breakpointArray[i-1] || 0;
      // interpolated value for progress along this segment
      return prevVal + segProg * (breakpointArray[i+1] - prevVal);
    }
  }
  // If time has elapsed, return last value
  return breakpointArray[breakpointArray.length-1];
};

// Same as getSectionBreakpoints(), but loops pattern continuously
ToneMotion.prototype.getSectionBreakpointLoop = function(cue, breakpointArray) {
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
    var elapsedTime = Date.now() - this.clientServerOffset - this.cue[cue].startedAt;
    // time elapsed in this iteration of loop determined by final loop time
    var elapsedTimeInLoop = elapsedTime % breakpointArray[breakpointArray.length - 2];
  }

  // Go through array of time/value pairs
  for (var i = 0; i < breakpointArray.length; i = i + 2) {
    // Each time needs to be greater than previous (error check for above)
    if (breakpointArray[i] >= breakpointArray[i+2]) {
      this.publicLog('getSectionBreakpointLoop() requires an array of time/value pairs in which each time is greater than previous (e.g., [1000, 0.5, 2000, 1.0]).');
      return 0;
    }
    // Find which segment current time is in
    if (elapsedTimeInLoop <= breakpointArray[i]) {
      // time of previous breakpoint (if there was one)
      var prevTime = breakpointArray[i-2] || 0;
      // duration of this segment
      var segTime = breakpointArray[i] - prevTime;
      // progress in this segment
      var segProg = (elapsedTimeInLoop - prevTime) / segTime;
      // previous value (or zero if none)
      var prevVal = breakpointArray[i-1] || 0;
      // interpolated value for progress along this segment
      return prevVal + segProg * (breakpointArray[i+1] - prevVal);
    }
  }
};

// Takes cue number and time elapsed since that cue began (or 0 if it hasn't)
ToneMotion.prototype.getElapsedTimeInCue = function(cue) {
  var elapsedTime;

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
  var values = [0, -99];
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
  for (var i = 0; i < audioFiles.length; i++) {
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
 * 'tacet', 'tilt', 'shake', 'tiltAndShake', 'listen', 'finished'
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
  this.timeoutID = 0; // needed to cancel scheduled cues if user stops playing
}

// Override this method in score to code the music for this section
TMCue.prototype.goCue = function() {
  console.log('No music coded for this section.');
};

// Override this method in score to code the cleanup for this section
TMCue.prototype.stopCue = function() {
  console.log('No clean-up implemented for this section.');
};

// Override this method in score to make "tilt" interactive sounds
TMCue.prototype.updateTiltSounds = function() {
  // This will get real annoying unless this method is overridden
  status_label.innerHTML = 'updateTiltSounds() called at ' + Date.now() + ' with xSig value of ' + this.xSig + this.status;
}

// Override this method in score to make "shake" interactive sounds
TMCue.prototype.triggerShakeSound = function() {
  // Override if section uses shake
}
