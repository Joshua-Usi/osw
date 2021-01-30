define(function(require) {
	const AssetLoader = require("src/scripts/AssetLoader.js");
	return function(element, event, src, masterVolumeId, volumeId) {
		element.addEventListener(event, function() {
			let audio = AssetLoader.audio(src);
			audio.volume = (document.getElementById(masterVolumeId).value / 100) * (document.getElementById(volumeId).value / 100);
			audio.play();
		});
	}
});