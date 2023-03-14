/*
** INTERFACE
*/

var ToneMotionInterface = {
  shutdown: function() {
    clearInterval(addXYPadIntervId);
    clearInterval(updateSoundsInterId); // stops calling updateInteractiveSounds()
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
  viewport.bottom = viewport.top + $(window).height() - $("#ChimeButtonWrapper").outerHeight() - 80;
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
      adjustment = bounds.top - $(window).height() + this.outerHeight() + $("#ChimeButtonWrapper").outerHeight();
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

/*
** TRANSPORT HANDLING
*/
// start/stop the transport (I wrote this code before linking to jQuery and didn't want to rewrite it)
var TransportButton = document.getElementById("TransportButton");
// waits until all buffers are loaded
Tone.Buffer.on('load', function(){
  // all buffers are loaded. 
  console.log("All buffers are loaded");
  TransportButton.className = "musicIsReadyToPlay";
  TransportButton.innerHTML = "play";
  if (ToneMotion.status == "deviceDoesReportMotion") {
    setInstructions("The page has loaded. You can now set your device to Airplane Mode. You may also want to set the Orientation Lock to prevent the screen from rotating. When everyone is ready, tap the play button to begin the piece.");
  }
  else {
    setInstructions("Your device does not report motion, so you're probably on a laptop or desktop computer.\
      You can use the two-dimensional sliding interface to the right to simulate device motion.\
      For example, clicking on the button at the intersection of the two axes and dragging to the left will \
      simulate tipping your device to the left, and dragging toward the top of the screen will \
      simulate tipping your device upside down.<br><br>Click the play button to begin the piece.");
  }
})
TransportButton.onclick = function() {
  // page loads with #TransportButton set to .resourcesAreLoading
  if (TransportButton.className === "resourcesAreLoading") {
    TransportButton.innerHTML = "Still loading..."
  }
  // when all audio buffers load, #TransportButton gets set to .musicIsReadyToPlay
  else if (TransportButton.className === "musicIsReadyToPlay") {
    $(".hiddenContent").slideUp("fast"); // minimize height of interface once music starts
    $(".disclosureTriangle").html("&#9658; "); // rotate disclosure triangle back
    TransportButton.innerHTML = "stop";
    TransportButton.className = "musicIsPlaying";
    // user sees accel. data as part of introductory instructions, but those are removed when play starts
    clearInterval(updateIntroStatusLabelIntervId);
    $("#IntroStatusLabel").remove();
    Tone.Transport.start(ToneMotion.delayBeforePlaying); // configurable delay before starting Transport
  }
  else if (TransportButton.className === "musicIsPlaying") {
    TransportButton.className = "userMayStopMusic";
    // add confirmation message and two buttons to confirm or cancel stopping the music
    $("#TransportButtonWrapper").append("<p id='ConfirmStopMessage'>Did you mean to stop the music? Maybe you just bumped the button.</p>");
    $("#TransportButtonWrapper").append("<button id='ConfirmStop'>Yes, stop the music</button>");
    $("#TransportButtonWrapper").append("<button id='CancelStop'>Oops, I didn't mean to do that</button>");
    $("#ConfirmStop").click(function() {
      // stop the music and remove this message
      $("#ConfirmStopMessage").remove();
      $("#ConfirmStop").remove();
      $("#CancelStop").remove();
      // remove buttons they may be visible
      $("#c2-button1").remove();
      $("#c2-button2").remove();
      $("#c2-button3").remove();
      TransportButton.innerHTML = "play again";
      TransportButton.className = "musicIsDonePlaying";
      Tone.Transport.stop();
      stopScript();
    });
    $("#CancelStop").click(function() {
      // keep playing music, but dismiss this message
      $("#ConfirmStopMessage").remove();
      $("#ConfirmStop").remove();
      $("#CancelStop").remove();
      TransportButton.className = "musicIsPlaying";
    });
  }
  else if (TransportButton.className === "userMayStopMusic") {
    // nothing happens in this case because two additional buttons were added to confirm or cancel stopping music
  }
  else if (TransportButton.className === "musicIsDonePlaying") {
    // quick and dirty way to reset page is to just programmatically reload it
    window.location.reload();
  }
  // should never happen
  else {
    console.log("Can't determine class of TransportButton.");
  }
}
// if script reaches end, this function is called
function musicHasFinishedPlaying() {
  $("#TransportButton").removeClass().addClass("musicIsDonePlaying");
  $("#TransportButton").html("play again");
  Tone.Transport.stop();
  stopScript();
}
// on iOS, the context will be started on the first valid user action on the #TransportButton element
// see https://github.com/tambien/StartAudioContext
// Audio Context could be started with #TransportButton (which plays music) or 
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

/*
** STATUS LABELS
*/
// always show an accelerometer label with introductory remarks. dismiss after play is initiated
function updateIntroStatusLabel() {
  if (ToneMotion.status === "deviceDoesNotReportMotion") {
    $("#IntroStatusLabel").html("No device motion detected, so you're probably on a laptop or desktop.\
      You can simulate device motion with the dragging interface to the right.");
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
  $("#ToneTransportTime").html("Tone.Transport time: " + Tone.Transport.seconds.toFixed(2));
  // The AudioContext time
  $("#AudioContextTime").html("Tone.now() time: " + Tone.now().toFixed(2));
}

/*
** XY-PAD TO SIMULATE DEVICE MOTION
*/
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
    // Secret hot keys for chime buttons. 1: cue 2 high chimes; 2: cue 2 medium chimes; 3: cue 3 low chimes
    // 4: cue 3 chimes; 5: cue 4 chimes. Secret because integrating this effectively into interface is work.
    document.addEventListener("keyup", (event) => {
      const keyName = event.key;
      // fired when key is *released*
      if (keyName === "1") {
        chimeButtonClicked(1);
      }
      else if (keyName === "2") {
        chimeButtonClicked(2);
      }
      else if (keyName === "3") {
        chimeButtonClicked(3);
      }
      else if (keyName === "4") {
        c3_chimeButtonClicked();
      }
      else if (keyName === "5") {
        c4_chimeButtonClicked();
      }
      else {
        // This key does nothing
      }
    }, false);
  }
  else if (ToneMotion.status === "deviceDoesReportMotion") {
    clearInterval(addXYPadIntervId); // no XY-pad needed. no need to keep testing
  }
  else {
    // still checking if XY-pad needs to be added
  }
}

/*
** START ToneMotion
*/
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