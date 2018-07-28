
// Test cues
cueList[1] = new TMCue(2000, 0);
cueList[1].mode = 'tilt';
cueList[1].goCue = function() {
  console.log('cueList[1].goCue() called');
}

cueList[2] = new TMCue(0, 0);
cueList[2].goCue = function() {
  console.log('cueList[2].goCue() called');
}

cueList[3] = new TMCue(500, 0);
cueList[3].goCue = function() {
  console.log('cueList[3].goCue() called');
}

cueList[4] = new TMCue(3000, 0);
cueList[4].goCue = function() {
  console.log('cueList[4].goCue() called at ' + Date.now());
}
cueList[4].stopCue = function() {
  console.log('cueList[4].stopCue() called at ' + Date.now());
}

cueList[5] = new TMCue(20000, 0);
cueList[5].goCue = function() {
  console.log('cueList[5].goCue() called at ' + Date.now());
}

cueList[7] = new TMCue(1000, 500);
cueList[7].goCue = function() {
  console.log('cueList[7].goCue() called');
}

cueList[8] = new TMCue(500, 0);
cueList[8].goCue = function() {
  console.log('cueList[8].goCue() called');
}

cueList[9] = new TMCue(-1);
cueList[9].goCue = function() {
  console.log('cueList[9].goCue() called AS SOON AS I CAN at ' + Date.now());
}
