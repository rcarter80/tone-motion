const tm = new ToneMotion();
tm.debug = true;
tm.shouldSyncToServer = true; // to speed up load time while testing

window.onload = function() {
  tm.init();
};
