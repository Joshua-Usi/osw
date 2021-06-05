define(function (require) {
  "use strict"
	const Mods = require("./mods.js");
	return class PlayDetails {
		constructor(mods) {
			this.mapName = "";
			this.mapperName = "";
			this.artist = "";
			this.difficultyName = "";
			this.score = 0;
			this.maxCombo = 0;
			this.comboType = "";
			this.unstableRate = 0;
			this.pp = 0;
			this.great = 0;
			this.ok = 0;
			this.meh = 0;
			this.miss = 0;
			this.comboBreaks = 0;
			this.sliderBreaks = 0;
			this.mods = mods || new Mods();
			this.datePlayed = "";
			this.replay = [];
		}
	};
});