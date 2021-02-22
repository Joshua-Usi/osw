define(function (require) {
	const Mods = require("./Mods.js");
	return function(mods) {
		return {
			score: 0,
			accuracy: 0,
			maxCombo: 0,
			unstableRate: 0,
			hitDetails: {
				total300s: 0,
				total100s: 0,
				total50s: 0,
				totalMisses: 0,
				totalSliderElements: 0,
				totalSliderTicks: 0,
				totalSpinnerSpins: 0,
				totalSpinnerBonusSpin: 0,
			},
			mods: mods || Mods(),
			replay: "TODO",
		};
	}
});