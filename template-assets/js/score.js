const tm = new ToneMotion();
tm.debug = true;
tm.showConsoleOnLaunch = true;
tm.shouldSyncToServer = true; // to speed up load time while testing
tm.shouldTestOnDesktop = true;

window.onload = function() {
  tm.init();
};
