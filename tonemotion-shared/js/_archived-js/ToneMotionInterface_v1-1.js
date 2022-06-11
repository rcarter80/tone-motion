/******************************************************************
*********************** INTERFACE FUNCTIONS ***********************
*******************************************************************/
var ToneMotionInterface = {
  shutdown: function() {
    clearInterval(addXYPadIntervId);
    clearInterval(updateSoundsInterId); // stops calling updateInteractiveSounds()
    disableAllActionButtons();
    if (ToneMotion.print) { console.log("ToneMotionInterface.shutdown() called"); }
  }
};

// prevent default class for <a> elements that don't link anywhere
$(".preventDefault").click(function(event) {
  event.preventDefault();
});

// use as callback after slideDown() to test if newly visible element is out of viewport. if so, animate scroll just enough to fit it in.
$.fn.adjustScroll = function() {
  var viewport = {
    top: $(window).scrollTop() + $("#TransportButtonWrapper").outerHeight(),
  };
  // bottom of viewport is effectively actual bottom minus space for button wrapper minus extra padding
  viewport.bottom = viewport.top + $(window).height() - $("#ActionButtonWrapper").outerHeight() - 80;
  var bounds = this.offset();
  bounds.bottom = bounds.top + this.outerHeight();
  if ( viewport.bottom < bounds.bottom || viewport.top > bounds.top ) {
    // if element is taller than window, scroll to top of element, otherwise place element as low as possible but still all in viewport
    // shouldn't usually happen that element is taller than window, but phone might do this
    /* known issue: iOS6 reports $(window).height() MINUS the menu bar, but scrolling pushes menu bar out of viewport.
    not a terrible problem, since the result is just extra room (equal to height of menu bar) below scrolled element */
    if ( this.outerHeight() > $(window).height() || viewport.top > bounds.top ) {
      adjustment = bounds.top - $("#TransportButtonWrapper").outerHeight() - 50;
    }
    else {
      // adjustment should make room for footer button wrapper
      adjustment = bounds.top - $(window).height() + this.outerHeight() + $("#ActionButtonWrapper").outerHeight();
    }
    $("html:not(:animated), body:not(:animated)").animate( { scrollTop: adjustment }, "fast" );
  }
};
// script for content that can be toggled visible/hidden
$(".displayToggle").children("a").click(function(event) {
  var contentToToggle = $(this).parent(".displayToggle").next(".hiddenContent");
  if (contentToToggle.css("display") === "none") {
    $(this).children("span.disclosureTriangle").html("&#9660; "); // rotate disclosure triangle
    contentToToggle.slideDown("fast", function() {
      $(this).adjustScroll();
    });
  }
  else {
    $(this).children("span.disclosureTriangle").html("&#9658; "); // rotate disclosure triangle back
    contentToToggle.slideUp("fast");
  }
});

// function for setting text in #InstructionLabel and then adjusting scroll to make sure text is visible
function setInstructions(instructions) {
  $("#Instructions").html(instructions);
  $("#Instructions").adjustScroll();
}

/******************************************************************
*********************** TRANSPORT HANDLING ************************
*******************************************************************/
// waits until all buffers are loaded
Tone.Buffer.on('load', function(){
  // all buffers are loaded.
  if (ToneMotion.print) { console.log("All buffers are loaded"); }
  $("#LoadingAnimation").remove();
  $("#TransportButton").prop('disabled', false);
  $("#TransportButton").removeClass().addClass("musicIsReadyToPlay");
  $("#TransportButton").html("play");
  setIntroInstructions();
});

// Optionally, sync Tone.Transport to UTC to allow devices to synchronize regardless of location
// shim from MDN for browsers that don't support Date.now()
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

// Transport button functions
$("#TransportButton").click(function() {
  if ($("#TransportButton").hasClass("resourcesAreLoading")) {
    // page loads with #TransportButton set to .resourcesAreLoading, but button is disabled
  }
  // when all audio buffers load, #TransportButton gets set to .musicIsReadyToPlay
  else if ($("#TransportButton").hasClass("musicIsReadyToPlay")) {
    $(".hiddenContent").slideUp("fast"); // minimize height of interface once music starts
    $(".disclosureTriangle").html("&#9658; "); // rotate disclosure triangle back
    $("#TransportButton").html("stop");
    $("#TransportButton").removeClass().addClass("musicIsPlaying");
    // user sees accelerometer data with test tone, but those are removed when play starts
    clearInterval(updateIntroStatusLabelIntervId);
    $("#IntroStatusLabel").remove();
    if (ToneMotion.shouldSyncToUTC) {
      // Tone.Transport position jumps to synchronized time (from UTC)
      var syncTime = (Date.now() % (TMScore.totalDur() * 1000)) / 1000;
      Tone.Transport.position = syncTime;
      Tone.Transport.start(ToneMotion.delayBeforePlaying); // configurable delay before starting Transport
      // sets button states and instructions for whatever section we just jumped into
      TMScore.currentCue = TMScore.currentCueAtTime(syncTime);
      setActionButtonStatesForCue(TMScore.currentCue);
      setInstructions(TMScore.instructionsForCue[TMScore.currentCue]);

    }
    else {
      Tone.Transport.start(ToneMotion.delayBeforePlaying); // configurable delay before starting Transport
    }
  }
  else if ($("#TransportButton").hasClass("musicIsPlaying")) {
    $("#TransportButton").removeClass().addClass("userMayStopMusic");
    $("#TransportButton").prop("disabled", true);
    // add confirmation message and two buttons to confirm or cancel stopping the music
    $("#TransportButtonWrapper").append("<p id='ConfirmStopMessage'>Did you mean to stop the music? Maybe you just bumped the button.</p>");
    $("#TransportButtonWrapper").append("<button id='ConfirmStop'>Yes, stop the music</button>");
    $("#TransportButtonWrapper").append("<button id='CancelStop'>Oops, I didn't mean to do that</button>");
    $("#ConfirmStop").click(function() {
      // stop the music and remove this message
      $("#ConfirmStopMessage").remove();
      $("#ConfirmStop").remove();
      $("#CancelStop").remove();
      $("#TransportButton").prop("disabled", false);
      $("#TransportButton").html("&#8635;"); // unicode character for refresh icon (clockwise arrow)
      $("#TransportButton").removeClass().addClass("musicIsDonePlaying");
      Tone.Transport.stop();
      stopScript();
      setInstructions("The music is stopped.");
    });
    $("#CancelStop").click(function() {
      // keep playing music, but dismiss this message
      $("#TransportButton").prop("disabled", false);
      $("#ConfirmStopMessage").remove();
      $("#ConfirmStop").remove();
      $("#CancelStop").remove();
      $("#TransportButton").removeClass().addClass("musicIsPlaying");
    });
  }
  else if ($("#TransportButton").hasClass("userMayStopMusic")) {
    // #TransportButton disabled, and two additional buttons were added to confirm or cancel stopping music
  }
  else if ($("#TransportButton").hasClass("musicIsDonePlaying")) {
    // quick and dirty way to reset page is to just programmatically reload it
    window.location.reload();
  }
  else {
    // should never happen
    console.log("Can't determine class of TransportButton.");
  }
});
// if script reaches end, this function is called
function musicHasFinishedPlaying() {
  $("#TransportButton").removeClass().addClass("musicIsDonePlaying");
  $("#TransportButton").html("&#8635;");
  // in case music finishes playing while listener is deciding whether to stop music
  $("#TransportButton").prop("disabled", false);
  $("#ConfirmStopMessage").remove();
  $("#ConfirmStop").remove();
  $("#CancelStop").remove();
  Tone.Transport.stop();
  stopScript();
}
// on iOS, the context will be started on the first valid user action on the #TransportButton element
// see https://github.com/tambien/StartAudioContext
// Audio Context could be started with #TransportButton (which plays music) or #TestToneButton
StartAudioContext(Tone.context, "#TransportButton").then(function(){
  if (ToneMotion.showStatusLabels) {
    $("#AudioContextStatusLabel").html("AudioContext is started");
  }
});
StartAudioContext(Tone.context, "#TestToneButton").then(function(){
  if (ToneMotion.showStatusLabels) {
    $("#AudioContextStatusLabel").html("AudioContext is started");
  }
});

/******************************************************************
************************* STATUS LABELS ***************************
*******************************************************************/
// always show an accelerometer label with introductory remarks. dismiss after play is initiated
function updateIntroStatusLabel() {
  if (ToneMotion.status === "deviceDoesNotReportMotion") {
    $("#IntroStatusLabel").html("Your device does not report motion, so you're probably on a laptop or desktop computer.\
      You can use the two-dimensional sliding interface to the right to simulate device motion.\
      For example, clicking on the button at the intersection of the two axes and dragging to the left will \
      simulate tipping your device to the left, and dragging toward the top of the screen will \
      simulate tipping your device upside down.");
  }
  else if (ToneMotion.status === "deviceDoesReportMotion") {
    $("#IntroStatusLabel").html("Your device motion data:<br>x-axis: " + ToneMotion.x.toFixed(4) + "<br>y-axis: " + ToneMotion.y.toFixed(4));
  }
  else { $("#IntroStatusLabel").html("Testing for motion detection"); }
}
// ToneMotion.showStatusLabels determines whether to show these values
if (ToneMotion.showStatusLabels) {
  $("#StatusLabels").append("<p id='AccelLabelX'>x-axis with gravity</p>");
  $("#StatusLabels").append("<p id='AccelLabelY'>y-axis with gravity</p>");
  $("#StatusLabels").append("<p id='DeviceMotionStatusLabel'>device motion status</p>");
  $("#StatusLabels").append("<p id='IsDeviceAndroid'></p>");
  $("#StatusLabels").append("<p id='AudioContextStatusLabel'>AudioContext not yet started</p>");
  $("#StatusLabels").append("<p id='ToneTransportTime'>Tone.Transport time</p>");
  $("#StatusLabels").append("<p id='AudioContextTime'>Tone.now() time</p>");
  if (ToneMotion.shouldSyncToUTC) {
    $("#StatusLabels").append("<p id='TimeNow'></p>");
    $("#StatusLabels").append("<p id='SyncTime'></p>");
  }
  if (ToneMotion.deviceIsAndroid) { // need to invert accel. axes if device is Android
    $("#IsDeviceAndroid").html("This appears to be an Android device");
  }
  else {
    $("#IsDeviceAndroid").html("This does not appear to be an Android device");
  }
}
// show status labels for testing only if ToneMotion.showStatusLabels is true
function updateStatusLabels() {
  if (ToneMotion.status === "deviceDoesNotReportMotion") {
    $("#DeviceMotionStatusLabel").html("No device motion detected");
    $("#AccelLabelX").html("simulated x-axis: " + ToneMotion.xSig.value.toFixed(4));
    $("#AccelLabelY").html("simulated y-axis: " + ToneMotion.ySig.value.toFixed(4));
  }
  else if (ToneMotion.status === "deviceDoesReportMotion") {
    $("#DeviceMotionStatusLabel").html("Device motion detected");
    $("#AccelLabelX").html("raw x-axis: " + accelRange.rawX.toFixed(4));
    $("#AccelLabelY").html("raw y-axis: " + accelRange.rawY.toFixed(4));
  }
  else { $("#DeviceMotionStatusLabel").html("Testing for motion detection"); }
  // The transport time elapsed in seconds
  $("#ToneTransportTime").html("Tone.Transport time: " + Tone.Transport.seconds.toFixed(3));
  // The AudioContext time
  $("#AudioContextTime").html("Tone.now() time: " + Tone.now().toFixed(3));
  if (ToneMotion.shouldSyncToUTC) {
    // The Date.now() method returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
    $("#TimeNow").html("Date.now(): " + Date.now());
    $("#SyncTime").html("Date.now() % total duration: " + (Date.now() % (TMScore.totalDur() * 1000)));
  }
}

/******************************************************************
*************** ACTION METHODS TRIGGERED BY BUTTONS ***************
*******************************************************************/
// disable/enable action buttons according to current section
function setActionButtonStatesForCue(cue) {
  // TMScore.cueEnablesButton sets which action button are enabled, but <button> property set is "disabled",
  // so values are flipped
  $("#ActionButton1").prop("disabled", !(TMScore.cueEnablesButtons[cue][0]));
  $("#ActionButton2").prop("disabled", !(TMScore.cueEnablesButtons[cue][1]));
  $("#ActionButton3").prop("disabled", !(TMScore.cueEnablesButtons[cue][2]));
  if (ToneMotion.print) {
    console.log("Current cue: " + cue + " with action buttons enabled: " + TMScore.cueEnablesButtons[cue])
  };
}
// turn all action buttons off (e.g., when piece is done or listener stops music)
function disableAllActionButtons() {
  $("#ActionButton1").prop("disabled", true);
  $("#ActionButton2").prop("disabled", true);
  $("#ActionButton3").prop("disabled", true);
}
// bind functions to buttons or hot keys
$("#ActionButton1").click(function(event) {
  goButton1();
});
$("#ActionButton2").click(function(event) {
  goButton2();
});
$("#ActionButton3").click(function(event) {
  goButton3();
});
// Hot keys for buttons on desktop interface. "1" triggers button 1, etc.
document.addEventListener("keydown", (event) => {
  const keyName = event.key;
  // fired when key is *pressed down*
  if (keyName === "1") {
    if ($("#ActionButton1").is(":disabled")) {
      if (ToneMotion.print) { console.log("Button 1 is disabled."); }
    }
    else {
      $("#ActionButton1").addClass("active");
    }
  }
  else if (keyName === "2") {
    if ($("#ActionButton2").is(":disabled")) {
      if (ToneMotion.print) { console.log("Button 2 is disabled."); }
    }
    else {
      $("#ActionButton2").addClass("active");
    }
  }
  else if (keyName === "3") {
    if ($("#ActionButton3").is(":disabled")) {
      if (ToneMotion.print) { console.log("Button 3 is disabled."); }
    }
    else {
      $("#ActionButton3").addClass("active");
    }
  }
  else {
    // This key does nothing
  }
}, false);
document.addEventListener("keyup", (event) => {
  const keyName = event.key;
  // fired when key is *released*
  if (keyName === "1") {
    if ($("#ActionButton1").is(":disabled")) {
      if (ToneMotion.print) { console.log("1 key released, but button 1 is disabled."); }
    }
    else {
      if (ToneMotion.print) { console.log("1 key released."); }
      goButton1();
      $("#ActionButton1").removeClass("active");
    }
  }
  else if (keyName === "2") {
    if ($("#ActionButton2").is(":disabled")) {
      if (ToneMotion.print) { console.log("2 key released, but button 2 is disabled."); }
    }
    else {
      if (ToneMotion.print) { console.log("2 key released."); }
      goButton2();
      $("#ActionButton2").removeClass("active");
    }
  }
  else if (keyName === "3") {
    if ($("#ActionButton3").is(":disabled")) {
      if (ToneMotion.print) { console.log("3 key released, but button 3 is disabled."); }
    }
    else {
      if (ToneMotion.print) { console.log("3 key released."); }
      goButton3();
      $("#ActionButton3").removeClass("active");
    }
  }
  else {
    // This key does nothing.
  }
}, false);

function goButton1() {
  if (ToneMotion.print) { console.log("goButton1() called"); }
  // What button does varies by musical section.
  switch (TMScore.currentCue) {
    case 0:
      // Piece hasn't started yet. No error, but do nothing. (Button should be disabled anyway.)
      if (ToneMotion.print) { console.log("Piece hasn't started yet. No button actions to trigger."); }
      break;
    case 1:
      // In any section that uses buttons, define the corresponding function in the score.
      try { goButton1Cue1() } catch(e) { console.log(e); }
      break;
    case 2:
      try { goButton1Cue2() } catch(e) { console.log(e); }
      break;
    case 3:
      try { goButton1Cue3() } catch(e) { console.log(e); }
      break;
    case 4:
      try { goButton1Cue4() } catch(e) { console.log(e); }
      break;
    case 5:
      try { goButton1Cue5() } catch(e) { console.log(e); }
      break;
    case 6:
      try { goButton1Cue6() } catch(e) { console.log(e); }
      break;
    case 7:
      try { goButton1Cue7() } catch(e) { console.log(e); }
      break;
    case 8:
      try { goButton1Cue8() } catch(e) { console.log(e); }
      break;
    case 9:
      try { goButton1Cue9() } catch(e) { console.log(e); }
      break;
    case 10:
      try { goButton1Cue10() } catch(e) { console.log(e); }
      break;
    case 11:
      try { goButton1Cue11() } catch(e) { console.log(e); }
      break;
    case 12:
      try { goButton1Cue12() } catch(e) { console.log(e); }
      break;
    case 13:
      try { goButton1Cue13() } catch(e) { console.log(e); }
      break;
    case 14:
      try { goButton1Cue14() } catch(e) { console.log(e); }
      break;
    case 15:
      try { goButton1Cue15() } catch(e) { console.log(e); }
      break;
    case 16:
      try { goButton1Cue16() } catch(e) { console.log(e); }
      break;
    case 17:
      try { goButton1Cue17() } catch(e) { console.log(e); }
      break;
    case 18:
      try { goButton1Cue18() } catch(e) { console.log(e); }
      break;
    case 19:
      try { goButton1Cue19() } catch(e) { console.log(e); }
      break;
    case 20:
      try { goButton1Cue20() } catch(e) { console.log(e); }
      break;
    default:
      console.log("No corresponding cue number found. This should never happen."); // should never happen
  }
}

function goButton2() {
 if (ToneMotion.print) { console.log("goButton2() called"); }
  switch (TMScore.currentCue) {
    case 0:
      if (ToneMotion.print) { console.log("Piece hasn't started yet. No button actions to trigger."); }
      break;
    case 1:
      try { goButton2Cue1() } catch(e) { console.log(e); }
      break;
    case 2:
      try { goButton2Cue2() } catch(e) { console.log(e); }
      break;
    case 3:
      try { goButton2Cue3() } catch(e) { console.log(e); }
      break;
    case 4:
      try { goButton2Cue4() } catch(e) { console.log(e); }
      break;
    case 5:
      try { goButton2Cue5() } catch(e) { console.log(e); }
      break;
    case 6:
      try { goButton2Cue6() } catch(e) { console.log(e); }
      break;
    case 7:
      try { goButton2Cue7() } catch(e) { console.log(e); }
      break;
    case 8:
      try { goButton2Cue8() } catch(e) { console.log(e); }
      break;
    case 9:
      try { goButton2Cue9() } catch(e) { console.log(e); }
      break;
    case 10:
      try { goButton2Cue10() } catch(e) { console.log(e); }
      break;
    case 11:
      try { goButton2Cue11() } catch(e) { console.log(e); }
      break;
    case 12:
      try { goButton2Cue12() } catch(e) { console.log(e); }
      break;
    case 13:
      try { goButton2Cue13() } catch(e) { console.log(e); }
      break;
    case 14:
      try { goButton2Cue14() } catch(e) { console.log(e); }
      break;
    case 15:
      try { goButton2Cue15() } catch(e) { console.log(e); }
      break;
    case 16:
      try { goButton2Cue16() } catch(e) { console.log(e); }
      break;
    case 17:
      try { goButton2Cue17() } catch(e) { console.log(e); }
      break;
    case 18:
      try { goButton2Cue18() } catch(e) { console.log(e); }
      break;
    case 19:
      try { goButton2Cue19() } catch(e) { console.log(e); }
      break;
    case 20:
      try { goButton2Cue20() } catch(e) { console.log(e); }
      break;
    default:
      console.log("No corresponding cue number found. This should never happen."); // should never happen
  }
}

function goButton3() {
 if (ToneMotion.print) { console.log("goButton3() called"); }
  switch (TMScore.currentCue) {
    case 0:
      if (ToneMotion.print) { console.log("Piece hasn't started yet. No button actions to trigger."); }
      break;
    case 1:
      try { goButton3Cue1() } catch(e) { console.log(e); }
      break;
    case 2:
      try { goButton3Cue2() } catch(e) { console.log(e); }
      break;
    case 3:
      try { goButton3Cue3() } catch(e) { console.log(e); }
      break;
    case 4:
      try { goButton3Cue4() } catch(e) { console.log(e); }
      break;
    case 5:
      try { goButton3Cue5() } catch(e) { console.log(e); }
      break;
    case 6:
      try { goButton3Cue6() } catch(e) { console.log(e); }
      break;
    case 7:
      try { goButton3Cue7() } catch(e) { console.log(e); }
      break;
    case 8:
      try { goButton3Cue8() } catch(e) { console.log(e); }
      break;
    case 9:
      try { goButton3Cue9() } catch(e) { console.log(e); }
      break;
    case 10:
      try { goButton3Cue10() } catch(e) { console.log(e); }
      break;
    case 11:
      try { goButton3Cue11() } catch(e) { console.log(e); }
      break;
    case 12:
      try { goButton3Cue12() } catch(e) { console.log(e); }
      break;
    case 13:
      try { goButton3Cue13() } catch(e) { console.log(e); }
      break;
    case 14:
      try { goButton3Cue14() } catch(e) { console.log(e); }
      break;
    case 15:
      try { goButton3Cue15() } catch(e) { console.log(e); }
      break;
    case 16:
      try { goButton3Cue16() } catch(e) { console.log(e); }
      break;
    case 17:
      try { goButton3Cue17() } catch(e) { console.log(e); }
      break;
    case 18:
      try { goButton3Cue18() } catch(e) { console.log(e); }
      break;
    case 19:
      try { goButton3Cue19() } catch(e) { console.log(e); }
      break;
    case 20:
      try { goButton3Cue20() } catch(e) { console.log(e); }
      break;
    default:
      console.log("No corresponding cue number found. This should never happen."); // should never happen
  }
}

/******************************************************************
***************** XY-PAD TO SIMULATE DEVICE MOTION ****************
*******************************************************************/
function addXYPadIfNoMotion() {
  if (ToneMotion.status === "deviceDoesNotReportMotion") {
    $("#DragContainer").slideDown("slow");
    $("#DragContainer").addClass("shouldHaveBorder");
    // this depends on a modified version of Interface.js by Charlie Roberts (copied below)
    // supports two different Tone.Signal objects (one on x-axis, one on y-axis) to use to simulate accelerometer
    // does not deal with smoothing signal
    Interface.Dragger({
      toneX: ToneMotion.xSig, // the Tone.js object connected to the x-axis
      toneY: ToneMotion.ySig, // the Tone.js object connected to the y-axis
      name: " ", // this goes on the intersection of the axes but I don't want text there
      x: {
        param: "value", // i.e., testSigX.value
        min: 0.0,
        max: 1.0
      },
      y: {
        param: "value", // i.e., testSignalY.value
        min: 0.0,
        max: 1.0
      }
    });
    clearInterval(addXYPadIntervId); // XY-pad added. no need to keep testing
  }
  else if (ToneMotion.status === "deviceDoesReportMotion") {
    clearInterval(addXYPadIntervId); // no XY-pad needed. no need to keep testing
  }
  else {
    // still checking if XY-pad needs to be added
  }
}

/******************************************************************
************************* START ToneMotion ************************
*******************************************************************/
function beginToneMotionUpdates() {
  // For interactive sounds not connected to signals. Wait until interface is set up to start calling.
  // updateInteractiveSounds() is defined in ToneMotion.js and calls to cue-specific function in score
  updateSoundsInterId = setInterval(updateInteractiveSounds, ToneMotion.updateInterval*1000);
  // to see if XY-pad is needed
  addXYPadIntervId = setInterval(addXYPadIfNoMotion, 500);
  // show accelerometer label with introduction to piece, then clear this interval when play starts
  updateIntroStatusLabelIntervId = setInterval(updateIntroStatusLabel, 50);
}
window.onload = beginToneMotionUpdates();

/******************************************************************
**************************** TEST TONE ****************************
*******************************************************************/
var testToneFilter = new Tone.Filter(440, "lowpass").toMaster();
var testTone = new Tone.Synth({
  oscillator: {
    type: "sawtooth"
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.9,
    release: 0.1
  }
}).connect(testToneFilter);
testTone.volume.value = -12; // The music is not very loud, so let's encourage people to turn up volume.
var testToneFreqScale = new Tone.Scale(440, 880); // scales control signal (0.0 - 1.0)
var testToneFilterScale = new Tone.Scale(440, 10000);
ToneMotion.xSig.chain(testToneFreqScale, testTone.frequency); // ctl sig is mapped to freq
ToneMotion.ySig.chain(testToneFilterScale, testToneFilter.frequency);

$("#TestToneButton").click(function() {
  if ($(this).hasClass("soundOff")) {
    testTone.triggerAttack(440);
    $(this).html("stop");
    $(this).removeClass("soundOff").addClass("soundOn");
  }
  else if ($(this).hasClass("soundOn")) {
    testTone.triggerRelease();
    $(this).html("test");
    $(this).removeClass("soundOn").addClass("soundOff");
  }
  else if (ToneMotion.print) {
    console.log("Error getting class of #TestToneButton");
  }
});



/*
** NOT MY CODE BELOW
** I'VE MADE CHANGES TO THIS SCRIPT, DELETING WHAT I DON'T NEED AND ADDING SUPPORT FOR TWO TONE.js OBJECTS ON ONE XY-PAD
** original version by Charlie Roberts: https://github.com/charlieroberts/interface.editor
** can add back code from his Interface.js if needed
*/

var Interface = {
  isMobile : false
};


/**
 *
 *
 *  DRAGGER
 *
 */
Interface.Dragger = function(params){

  if (this instanceof Interface.Dragger){

    if ($("#DragContainer").length === 0){
      $("<div>", {
        "id" : "DragContainer"
      }).appendTo(params.parent || "#Content");
    }

    this.container = $("#DragContainer");

    /**
     *  the tone object
     */
    // My modification allows XY-pad to control two different Tone.js objects (one for each axis)
    this.toneX = params.toneX; // changeMadeFrom just using .tone as property of both
    this.toneY = params.toneY; // same - I added this line of code

    /**
     *  callbacks
     */
    this.start = params.start;

    this.end = params.end;

    this.drag = params.drag;

    /**
     *  the name TAKEN FROM THE FIRST TONE OBJECT (CONTROLLED BY X AXIS)
     */
    var name = params.name ? params.name : this.toneX ? this.toneX.toString() : "";

    /**
     *  elements
     */
    this.element = $("<div>", {
      "class" : "Dragger",
      "id" : name
    }).appendTo(this.container)
      .on("dragMove", this._ondrag.bind(this))
      .on("touchstart mousedown", this._onstart.bind(this))
      .on("dragEnd touchend mouseup", this._onend.bind(this));

    this.name = $("<div>", {
      "id" : "Name",
      "text" : name
    }).appendTo(this.element);

    this.element.draggabilly({
      "axis" : this.axis,
      "containment": this.container
    });

    /**
     *  x slider
     */
    var xParams = params.x;
    xParams.axis = "x";
    xParams.element = this.element;
    xParams.tone = this.toneX; // connect x-axis to first Tone.js object
    xParams.container = this.container;
    this.xAxis = new Interface.Slider(xParams);

    /**
     *  y slider
     */
    var yParams = params.y;
    yParams.axis = "y";
    yParams.element = this.element;
    yParams.tone = this.toneY; // connect y-axis to second Tone.js object
    yParams.container = this.container;
    this.yAxis = new Interface.Slider(yParams);

    //set the axis indicator
    var position = this.element.position();
    this.halfSize = this.xAxis.halfSize;
    this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
    this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
  } else {
    return new Interface.Dragger(params);
  }
};

Interface.Dragger.prototype._ondrag = function(e, pointer){
  if (this.drag){
    this.drag();
  }
  this.xAxis._ondrag(e, pointer);
  this.yAxis._ondrag(e, pointer);
  var position = this.element.position();
  this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
  this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};

Interface.Dragger.prototype._onstart = function(e){
  if (this.start){
    this.start();
  }
  this.xAxis._onstart(e);
  this.yAxis._onstart(e);
};

Interface.Dragger.prototype._onend = function(e){
  if (this.end){
    this.end();
  }
  this.xAxis._onend(e);
  this.yAxis._onend(e);
  var position = this.element.position();
  this.xAxis.axisIndicator.css("top", position.top + this.halfSize);
  this.yAxis.axisIndicator.css("left", position.left + this.halfSize);
};


/**
 *
 *
 *  SLIDER
 *
 */
Interface.Slider = function(params){

  if (this instanceof Interface.Slider){

    this.tone = params.tone;

    /**
     *  the name
     */
    var name = params.name ? params.name : this.tone ? this.tone.toString() : "";

    /**
     *  callback functions
     */
    this.start = params.start;

    this.end = params.end;

    this.drag = params.drag;

    /**
     *  the axis indicator
     */
    this.axis = params.axis || "x";

    if (!params.element){

      this.container = $("<div>", {
        "class" : "Slider "+this.axis,
      }).appendTo(params.parent || "#Content");

      this.element = $("<div>", {
        "class" : "Dragger",
        "id" : name
      }).appendTo(this.container)
        .on("dragMove", this._ondrag.bind(this))
        .on("touchstart mousedown", this._onstart.bind(this))
        .on("dragEnd touchend mouseup", this._onend.bind(this));

      this.name = $("<div>", {
        "id" : "Name",
        "text" : name
      }).appendTo(this.element);

      this.element.draggabilly({
        "axis" : this.axis,
        "containment": this.container.get(0)
      });
    } else {
      this.element = params.element;

      this.container = params.container;
    }

    this.axisIndicator = $("<div>", {
      "id" : this.axis + "Axis",
      "class" : "Axis"
    }).appendTo(this.container);

    /**
     *  the initial value / position
     */
    this.parameter = params.param || false;
    //default values
    this.min = typeof params.min === "undefined" ? 0 : params.min;
    this.max = typeof params.max === "undefined" ? 1 : params.max;
    this.exp = typeof params.exp === "undefined" ? 1 : params.exp;
    if (params.options){
      this.options = params.options;
      this.min = 0;
      this.max = this.options.length - 1;
      this.exp = params.exp || 1;
    }

    /**
     *  cache some measurements for later
     */
    this.halfSize = this.element.width() / 2;

    this.maxAxis = this.axis === "x" ? "width" : "height";
    this.posAxis = this.axis === "x" ? "left" : "top";
    this.oppositeAxis = this.axis === "x" ? "top" : "left";

    /**
     *  initial value
     */
    if (this.parameter || typeof params.value !== "undefined"){

      var paramValue = typeof params.value !== "undefined" ? params.value : this.tone.get(this.parameter);

      this.value(paramValue);
    }

  } else {
    return new Interface.Slider(params);
  }
};

Interface.Slider.prototype.value = function(val){
  var maxSize = this.container[this.maxAxis]() - this.element[this.maxAxis]();
  //y gets inverted
  if (this.axis === "y"){
    maxSize = this.container[this.maxAxis]() - maxSize;
  }

  if (val.hasOwnProperty(this.parameter)){
    val = val[this.parameter];
  }

  if (this.options){
    val = this.options.indexOf(val);
  }

  var pos = (val - this.min) / (this.max - this.min);
  pos = Math.pow(pos, 1 / this.exp) * (maxSize );
  this.element.css(this.posAxis, pos);

  if (this.options){
    this._setParam(this.options[val]);
  }
};

Interface.Slider.prototype._ondrag = function(e, pointer){
  if (typeof this.top === "undefined"){
    this.top = this.container.offset().top;
    this.left = this.container.offset().left;
  }

  var normPos;
  if (this.axis === "x"){
    var xVal = Math.max((pointer.pageX - this.left), 0);
    normPos =  xVal / (this.container.width());
  }  else {
    var yVal = Math.max((pointer.pageY - this.top ), 0);
    normPos =  yVal / (this.container.height());
    normPos = 1 - normPos;
  }
  normPos = Math.pow(normPos, this.exp);

  var result = normPos * (this.max - this.min) + this.min;

  result = Math.max(Math.min(this.max, result), this.min);

  var value = result;

  if (this.options){
    value = this.options[Math.round(result)];
  }

  if (this.drag){
    this.drag(value);
  }

  this._setParam(value);
};

Interface.Slider.prototype._onstart = function(e){
  e.preventDefault();
  if (this.start){
    this.start();
  }
};

Interface.Slider.prototype._onend = function(){
  if (this.end){
    this.end();
  }
};

Interface.Slider.prototype._setParam = function(value){
  if (this.parameter && this.tone){
    this.tone.set(this.parameter, value);
  }
};
