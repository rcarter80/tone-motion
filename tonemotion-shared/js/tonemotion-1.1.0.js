/*********************************************************************
************************ APPLICATION SETUP ***************************
*********************************************************************/

/**
 * Global object to encapsulate properties and method for Tone Motion
 * @param {string} status - Application status (set automatically)
 */

function ToneMotion() {
  this.status = 'loading';
}

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
}
TMCue.prototype.stopCue = function() {
  // override this method in score to code the cleanup for this section
  console.log('No clean-up implemented for this section.');
}
