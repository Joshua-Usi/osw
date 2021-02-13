define(function(require) {
	"use strict";
	let defaultOptions = {
		version: 1,
		Audio: {
			masterVolume: 1,
			musicVolume: 1,
			effectsVolume: 1,
		},
		Inputs: {
			keyboardLeftButton: "z",
			keyboardRightButton: "x",
			enableMouseButtonsInGameplay: true,
			mouseSensitivity: 1,
		},
		UserInterface: {
			introSequence: "Triangles",
			menuParallax: true,
		},
		Gameplay: {
			backgroundDim: 0.8,
			draw300Hits: true,
			snakingSliders: true,
			cursorTrails: "Interpolated",
		},
		Performance: {
			lowPowerMode: false,
			maxFrameRate: "VSync",
			ShowFPS: false,
			sliderResolution: 1,
			drawHitValues: true,
			scoreUpdateRate: "Equal to frame rate",
		},
		Skin: {
			currentSkin: "Ajax Transparent",
		},
	};
	if (window.localStorage.options === undefined) {
		window.localStorage.setItem("options", JSON.stringify(defaultOptions));
	} else {
		let optionsTemp = JSON.parse(window.localStorage.getItem("options"));
		if (optionsTemp.version < defaultOptions.version) {
			localStorage.setItem("options", defaultOptions);
			console.log("Your Options was reset due to new version");
		}
		defaultOptions = optionsTemp;
	}
	return defaultOptions;
});