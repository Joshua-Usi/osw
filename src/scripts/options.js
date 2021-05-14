define(function(require) {
	"use strict";
	const utils = require("./utils.js");
	let defaultOptions = {
		version: 4,
		types: [
			"slider",
			"slider",
			"slider",

			"text",
			"text",
			"slider",

			"selectbox",
			"checkbox",

			"selectbox",
			"slider",
			"checkbox",

			"checkbox",
			// "checkbox",
			"selectbox",

			"selectbox",
			"checkbox",
			"slider",
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
			mouseSensitivity: utils.map(100, 0, 1000, 0, 1),
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
			// snakingSlidersOut: true,
			cursorTrails: "Interpolated",
		},
		Performance: {
			maxFrameRate: "VSync",
			showFps: true,
			sliderResolution: 0,
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
			localStorage.setItem("options", JSON.stringify(defaultOptions));
			console.log("Your options was reset due to new version");
		}
		defaultOptions = optionsTemp;
	}
	return {
		get: function() {
			return defaultOptions;
		},
		getProperty(group, option) {
			return defaultOptions[group][option];
		},
		save: function() {
			localStorage.setItem("options", JSON.stringify(defaultOptions));
			console.log("settings saved!");
		},
		update: function(group, option, value) {
			defaultOptions[group][option] = value;
		},
		read: function() {
			return JSON.parse(window.localStorage.getItem("options"));	
		},
	}
});