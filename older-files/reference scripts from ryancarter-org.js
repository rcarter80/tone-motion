// set things up
var deviceType;
$(document).ready(function () {
  // global definition of "deviceType" for jQuery responsive features
  if ( screen.width >= 980 ){
    deviceType = "desktop";
  }
  else if ( (screen.width >= 768) && (screen.width < 980) ) {
    deviceType = "tablet";
  }
  else if ( screen.width < 768 ) {
    deviceType = "phone";
  }
  else {
    deviceType = "unknown";
  }
  // hide collapsible content (in case people have JS disabled(?!), content will still be visible)
  $(".hiddenContent").hide();
  $(".faqAnswer").hide();
});


// prevent default class for <a> elements that don't link anywhere
$(".preventDefault").click(function(event) {
  event.preventDefault();
});

// script for phone navigation
$("#navigation_disclosure").children("a").click(function(event) {
  var phoneNav = $(this).parent("#navigation_disclosure").next("#nav");
  if (phoneNav.css("display") === "none") {
    $("#navigation_disclosure").children("a").html("[ - ]");
    phoneNav.slideDown("fast");
  }
  else {
    $("#navigation_disclosure").children("a").html("[ + ]");
    phoneNav.fadeOut();
  }
});

// function to check if backToTop link is necessary
$.fn.checkFooterLink = function() {
    if ( $(document).height() <= $(window).height() ) { // no need for backToTop link, since whole document fits in viewport
      $(".backToTop").hide();
    }
    else {
      $(".backToTop").show();
    }
  };
// wait for page to fully load before determining if scrollToTop link is needed
$(window).load(function () {
  $(this).checkFooterLink();
});
// remove scroll back to top link if not needed after resize
$(window).resize(function() {
  $(this).checkFooterLink();
});
// otherwise, to use scroll back to top link
$("a.scrollToTop").click(function () {
  $("html:not(:animated), body:not(:animated)").animate( { scrollTop: 0 }, "fast" );
});

// use as callback after slideDown() to test if newly visible element is out of viewport. if so, animate scroll just enough to fit it in.
$.fn.adjustScroll = function() {

  var viewport = {
    top : $(window).scrollTop(),
  };
  viewport.bottom = viewport.top + $(window).height();

  var bounds = this.offset();
  bounds.bottom = bounds.top + this.outerHeight();

  if ( viewport.bottom < bounds.bottom || viewport.top > bounds.top ) {
    // if element is taller than window, scroll to top of element, otherwise place element as low as possible but still all in viewport
    // shouldn't usually happen that element is taller than window, but phone might do this
    /* known issue: iOS6 reports $(window).height() MINUS the menu bar, but scrolling pushes menu bar out of viewport.
    not a terrible problem, since the result is just extra room (equal to height of menu bar) below scrolled element */
    if ( this.outerHeight() > $(window).height() || viewport.top > bounds.top ) { // allow for sticky header
      adjustment = bounds.top - 42;
    }
    else {
      adjustment = bounds.top - $(window).height() + this.outerHeight();
    }
    $("html:not(:animated), body:not(:animated)").animate( { scrollTop: adjustment }, "fast" );
  }

  // document size may have changed, so
  $(window).checkFooterLink();
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
    contentToToggle.slideUp("fast", function() {
      // document height has changed, so check if backToTop link is needed
      $(window).checkFooterLink(); 
    });
  }
});

// script for accordion widget
$(".accordionToggle").mouseenter(function() {
  $(this).parent(".accordionSection").css("border-color", "#368DD9");
});
$(".accordionToggle").mouseleave(function() {
  $(this).parent(".accordionSection").css("border-color", "#b2b7b6");
});

$(".accordionToggle").children("a").click(function(event) {
  var contentToToggle = $(this).parent(".accordionToggle").next(".accordionContent");
  var thisAccordion = $(this).parents(".accordion");
  if (contentToToggle.css("display") === "none") {
    $(".accordionHideOnOpen").slideDown("fast"); // first display hidden content in last opened element
    contentToToggle.children("audio").attr("preload", "auto"); // if <audio> - preload="none" by default, to reduce load time
    $(this).find(".accordionHideOnOpen").slideUp("fast");
    thisAccordion.find(".accordionContent").slideUp("fast");
    contentToToggle.slideDown("fast", function() {
      $(this).parent(".accordionSection").adjustScroll();
    });
  }
  else {
    $(this).find(".accordionHideOnOpen").slideDown("fast");
    contentToToggle.slideUp("fast", function() {
      // document height has changed, so check if backToTop link is needed
      $(window).checkFooterLink(); 
    });
  }
});

// banner background changes source and animation-direction on mouse hover (desktop only)
$(document).ready(function () {
  if (deviceType === "desktop") {
    $("#banner").mouseenter(function() {
      $(this).css({
        "background-image": "url(./assets/img/banner_manuscript.png)",
        "-webkit-animation-direction": "alternate-reverse",
        "-moz-animation-direction": "alternate-reverse",
        "animation-direction": "alternate-reverse"
      });
    });
    $("#banner").mouseleave(function() {
      $(this).css({
        "background-image": "url(./assets/img/banner_engraved.png)",
        "-webkit-animation-direction": "alternate",
        "-moz-animation-direction": "alternate",
        "animation-direction": "alternate"
      });
    });
  }
});

// script for FAQ widget
$(".faqQuestion").click(function(event) {
  var thisAnswer = $(this).next(".faqAnswer");
  if (thisAnswer.css("display") === "none") {
    $(this).children("span.faqTriangle").html("&#9660; "); // rotate disclosure triangle
    thisAnswer.slideDown("fast", function() {
      $(this).adjustScroll();
    });
  }
  else {
    $(this).children("span.faqTriangle").html("&#9658; "); // rotate disclosure triangle back
    thisAnswer.slideUp("fast", function() {
      $(window).checkFooterLink(); // document height has changed, so check if backToTop link is needed
    });
  }
});

$(".faqClose").click(function(event) {
  // also close any footnotes that may be open
  $(".footnoteDisclosure").html("+&nbsp;"); // change back to plus sign, but prevent line break within [ + ]
  $(".footnoteContent").hide();
  $(".faqQuestion").children("span.faqTriangle").html("&#9658; "); // close all disclosure triangles
  $(".faqAnswer").slideUp("fast", function() {
    $(window).checkFooterLink();
  });
});