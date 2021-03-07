define(function(require) {
	"use strict";
	const utils = require("./utils.js");
	let defaultOptions = {
		version: 3,
		types: [
			"slider",
			"slider",
			"slider",

			"text",
			"text",
			"checkbox",
			"slider",

			"selectbox",
			"checkbox",

			"selectbox",
			"slider",
			"checkbox",

			"checkbox",
			"checkbox",
			"selectbox",

			"checkbox",
			"selectbox",
			"checkbox",
			"slider",
			"checkbox",
			"selectbox",

			"selectbox",
		],
		Audio: {
			masterVolume: 1,
			musicVolume: 1,
			effectsVolume: 1,
		},
		Inputs: {
			keyboardLeftButton: "z",
			keyboardRightButton: "x",
			enableMouseButtonsInGameplay: true,
			mouseSensitivity: utils.map(1, 0.1, 6, 0, 1),
		},
		UserInterface: {
			introSequence: "Triangles",
			menuParallax: true,
		},
		Gameplay: {
			notelockStyle: "Full (original osu! implementation)",
			backgroundDim: 0.8,
			draw300Hits: true,
		},
		GameplayRendering: {
			snakingSlidersIn: true,
			snakingSlidersOut: true,
			cursorTrails: "Interpolated",
		},
		Performance: {
			lowPowerMode: false,
			maxFrameRate: "VSync",
			showFps: false,
			sliderResolution: 0,
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