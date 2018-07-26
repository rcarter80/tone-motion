/*
** ToneMotion is an object of global scope that exposes device motion
** properties and default values:
** x (current x-axis value): 0.5
** y (current y-axis value): 0.5
** xSig (a Tone.Signal object to connect x value to signals): 0.5
** ySig (a Tone.Signal object to connect y value to signals): 0.5
** updateInterval (time in seconds for sampling signal and linear ramp to next value): 0.05
** delayBeforePlaying (schedules Tone.Transport events in future): "+0.1"
** status (whether device reports motion): "unknown"
** showStatusLabels (should interface show motion values, etc.): false
** print (whether to print debugging messages to console): false
** shouldSyncToUTC (if true, transport starts at position set by UTC): false
** deviceShouldSelfCalibrate (allows device to continuously report new troughs and peaks): false
** deviceIsAndroid (detects if accelerometer axes need to be inverted because device is Android): false
** shutdown(): removes event listeners and clears intervals
*/
/*
** TMScore is an object for managing the cuelist
** properties and default values:
** st (current transport time at this point in the score): 0
** MAX_CUES (maximum number of sections - value can not be changed without significant work): 20
** currentCue (the current section of the score): 0
** durForCue[cue] (duration of each section - initialized to 0): 0
** timeAtCue(cue) (function to return time at beginning of a section)
** totalDur() (function to return total duration of score)
** currentCueAtTime(time) (function to return the section in which any time falls)
** instructionsForCue[cue] (array of empty strings to be filled by instructions): ""
** cueEnablesButtons[cue] (array of 3 elements to manage whether buttons are enabled): [0,0,0]
** nextCue() (function to advance cue list and set button states and instructions for new cue)
** setCue() (function to jump immediately to given section
*/
/******************************************************************
************************* GENERAL PARAMETERS **********************
*******************************************************************/
ToneMotion.showStatusLabels = false;
ToneMotion.delayBeforePlaying = "+0.3";
ToneMotion.deviceShouldSelfCalibrate = false;
ToneMotion.print = false;
ToneMotion.shouldSyncToUTC = true;
// sets lookAhead. "interactive": lookAhead = 0.1; "playback": 0.8; "balanced": 0.25; "fastest": 0.01;
Tone.context.latencyHint = ToneMotion.updateInterval / 2.0;


// TODO: delete this buffer that is used to test loading animation
var needBufferForLoadingToComplete = new Tone.MultiPlayer({
  "revCh2417D7": "./tonemotion-shared/audio/revChime-2417Hz-D7.mp3",
  // "biggerFileToMakeLoadTimeLonger": "./tonemotion-shared/audio/bigger-file.mp3"
}, function() {
  // putting a callback here seems to be required
}).toMaster();


/******************************************************************
****************************SCORE MAP *****************************
*******************************************************************/
TMScore.durForCue[1] = 32;
TMScore.durForCue[2] = 32;
TMScore.durForCue[3] = 32;
function setIntroInstructions() {
  // called when buffers have loaded and music is ready to play
  if (ToneMotion.status == "deviceDoesReportMotion") {
    setInstructions("The page has loaded. You can now set your device to Airplane Mode. You may also want to set the Orientation Lock to prevent the screen from rotating. When everyone is ready, tap the play button to begin the piece.");
  }
  else {
    setInstructions("The page has loaded and I'll put more instructions here later.");
  }
}
// use TMScore.setCue() to skip to a specific section for testing/composing (overriden if .shouldSynctoUTC is true)
TMScore.setCue(1);

/******************************************************************
****************************** CUE 1 ******************************
*******************************************************************/
TMScore.instructionsForCue[1] = "Section 1: instructions";
// following block scheduled to be called at beginning of this section
Tone.Transport.schedule(function(time){ Tone.Draw.schedule(function(){
  TMScore.nextCue();
}, time) }, TMScore.st);

// UTC sync testing
var testSynth1 = new Tone.Synth().toMaster();

var testPart1 = new Tone.Part(function(time, note){
  testSynth1.triggerAttackRelease(note, "16n", time);
}, [
  ["0:0:0", "C4"], ["0:0:2", "D4"], ["0:1:0", "E4"], ["0:1:2", "F4"],
  ["0:2:0", "G4"], ["0:2:2", "A4"], ["0:3:0", "B4"], ["0:3:2", "C5"],
  ["1:0:0", "C5"], ["1:0:2", "D5"], ["1:1:0", "E5"], ["1:1:2", "F5"],
  ["1:2:0", "G5"], ["1:2:2", "A5"], ["1:3:0", "B5"], ["1:3:2", "C6"]
]).start(TMScore.st);
testPart1.loopEnd = "2m";
testPart1.loop = 8;

// Action button methods
TMScore.cueEnablesButtons[1] = [1,0,0]; // cue 1 enables action button 1, but disables actions buttons 2 and 3
function goButton1Cue1() {
  if (ToneMotion.print) { console.log("goButton1Cue1() called"); }
}
// Interactive sounds in this cue
function updateSoundsInCue1() {
  if (ToneMotion.print) { console.log("updating cue 1 sounds"); }
}

/******************************************************************
****************************** CUE 2 ******************************
*******************************************************************/
TMScore.st += TMScore.durForCue[1]; // duration of each section set by SCORE MAP at top
TMScore.instructionsForCue[2] = "Section 2: instructions";
// following block scheduled to be called at beginning of this section
Tone.Transport.schedule(function(time){ Tone.Draw.schedule(function(){
  TMScore.nextCue();
}, time) }, TMScore.st);

var testPart1 = new Tone.Part(function(time, note){
  testSynth1.triggerAttackRelease(note, "16n", time);
}, [
  ["0:0:0", "C4"], ["0:0:2", "D4"], ["0:1:0", "E4"], ["0:1:2", "F4"],
  ["0:2:0", "G4"], ["0:2:2", "A4"], ["0:3:0", "B4"], ["0:3:2", "C5"],
  ["1:0:0", "C5"], ["1:0:2", "D5"], ["1:1:0", "E5"], ["1:1:2", "F5"],
  ["1:2:0", "G5"], ["1:2:2", "A5"], ["1:3:0", "B5"], ["1:3:2", "C6"]
]).start(TMScore.st);
testPart1.loopEnd = "2m";
testPart1.loop = 8;

// Action button methods
TMScore.cueEnablesButtons[2] = [1,1,0];
function goButton1Cue2() {
  if (ToneMotion.print) { console.log("goButton1Cue2() called"); }
}
function goButton2Cue2() {
  if (ToneMotion.print) { console.log("goButton2Cue2() called"); }
}
// Interactive sounds in this cue
function updateSoundsInCue2() {
  if (ToneMotion.print) { console.log("updating cue 2 sounds"); }
}

/******************************************************************
****************************** CUE 3 ******************************
*******************************************************************/
TMScore.st += TMScore.durForCue[2]; // duration of each section set by SCORE MAP at top
TMScore.instructionsForCue[3] = "Section 3: instructions";
// following block scheduled to be called at beginning of this section
Tone.Transport.schedule(function(time){ Tone.Draw.schedule(function(){
  TMScore.nextCue();
}, time) }, TMScore.st);

var testPart1 = new Tone.Part(function(time, note){
  testSynth1.triggerAttackRelease(note, "16n", time);
}, [
  ["0:0:0", "C5"], ["0:0:2", "D5"], ["0:1:0", "E5"], ["0:1:2", "F5"],
  ["0:2:0", "G5"], ["0:2:2", "A5"], ["0:3:0", "B5"], ["0:3:2", "C6"],
  ["1:0:0", "C6"], ["1:0:2", "D6"], ["1:1:0", "E6"], ["1:1:2", "F6"],
  ["1:2:0", "G6"], ["1:2:2", "A6"], ["1:3:0", "B6"], ["1:3:2", "C7"]
]).start(TMScore.st);
testPart1.loopEnd = "2m";
testPart1.loop = 8;

// Action button methods
TMScore.cueEnablesButtons[3] = [1,1,1];
function goButton1Cue3() {
  if (ToneMotion.print) { console.log("goButton1Cue3() called"); }
}
function goButton2Cue3() {
  if (ToneMotion.print) { console.log("goButton2Cue3() called"); }
}
function goButton3Cue3() {
  if (ToneMotion.print) { console.log("goButton3Cue3() called"); }
}
// Interactive sounds in this cue
function updateSoundsInCue3() {
  if (ToneMotion.print) { console.log("updating cue 3 sounds"); }
}

/******************************************************************
*********************** OUTPUT AND CLEAN-UP ***********************
*******************************************************************/
TMScore.st += TMScore.durForCue[3];
Tone.Transport.schedule(function(time){ Tone.Draw.schedule(function(){
  // setInstructions("(All done)");
  // clean-up and reset of interface handled in ToneMotionInterface.js
  // musicHasFinishedPlaying();

  // loop everything by just going back to cue 1
  TMScore.setCue(1);

}, time) }, TMScore.st);

/*
// I thought about adding some light compression on master output. Decided not to.
var masterCompressor = new Tone.Compressor({
  "threshold" : -3,
  "ratio" : 20,
  "attack" : 0.005,
  "release" : 1 // 1 second is maximum value. Lots of long tails, so keep it here.
});
Tone.Master.chain(masterCompressor);
Tone.Master.volume.value = 3; // makeup gain
*/

// In performance, this shouldn't be used, but stopping the piece will call this function
function stopScript() {
  // shut down sounds here

  if (ToneMotion.print) { console.log("stopScript() called"); }
  ToneMotion.shutdown();
  ToneMotionInterface.shutdown();
}
