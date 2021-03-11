define(function(require) {
	const AssetLoader = require("src/scripts/AssetLoader.js");
	return function(element, eventName, src, masterVolumeId, volumeId) {
		element.addEventListener(eventName, function(event) {
			if (event.detail === true) {
				return;
			}
			let audio = AssetLoader.audio(src);
			audio.volume = (document.getElementById(masterVolumeId).value / 100) * (document.getElementById(volumeId).value / 100);
			audio.play();
		});
	}
});