define(function (require) {
	const Mods = require("./Mods.js");
	return function(mods) {
		return {
			mapName: "",
			mapperName: "",
			artist: "",
			difficultyName: "",
			score: 0,
			accuracy: 0,
			maxCombo: 0,
			fc: "",
			grade: "",
			unstableRate: 0,
			pp: 0,
			hitDetails: {
				total300: 0,
				total100: 0,
				total50: 0,
				totalMiss: 0,
				totalSliderHeads: 0,
				hitSliderHeads: 0,
				totalSliderEnds: 0,
				hitSliderEnds: 0,
				totalSliderRepeats: 0,
				hitSliderRepeats: 0,
				totalSliderTicks: 0,
				hitSliderTicks: 0,
				totalSpinnerSpins: 0,
				totalSpinnerBonusSpin: 0,
				comboBreaks: 0,
			},
			mods: mods || Mods(),
			datePlayed: "",
			replay: "TODO",
		};
	}
});