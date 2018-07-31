const tm = new ToneMotion();
tm.debug = true;
tm.shouldSyncToServer = false; // to speed up load time while testing
tm.shouldTestOnDesktop = false;

window.onload = function() {
  tm.init();
};
