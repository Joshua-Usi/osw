define(function (require) {
	const Mods = require("./mods.js");
	return function(mods) {
		return {
			mapName: "",
			mapperName: "",
			artist: "",
			difficultyName: "",
			score: 0,
			maxCombo: 0,
			comboType: "",
			unstableRate: 0,
			pp: 0,
			great: 0,
			ok: 0,
			meh: 0,
			miss: 0,
			comboBreaks: 0,
			sliderBreaks: 0,
			mods: mods || Mods(),
			datePlayed: "",
			replay: [],
		};
	}
});