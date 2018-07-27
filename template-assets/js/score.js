
var needBufferForLoadingToComplete = new Tone.Players({
  "revCh2417D7": "./tonemotion-shared/audio/revChime-2417Hz-D7.mp3",
  // "biggerFileToMakeLoadTimeLonger": "./tonemotion-shared/audio/bigger-file.mp3"
}, function() {
  // putting a callback here seems to be required
}).toMaster();
