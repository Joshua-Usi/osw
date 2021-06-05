define(function(require) {
  "use strict";
	return class Mods {
		constructor(easy, noFail, halfTime, hardRock, suddenDeath, perfect, doubleTime, nightcore, hidden, flashlight, relax, autopilot, spunOut, auto, scoreV2) {
			/* difficulty reduction */
			this.easy = easy || false;
			this.noFail = noFail || false;
			this.halfTime = halfTime || false;
			/* difficulty increases */
			this.hardRock = hardRock || false;
			this.suddenDeath = suddenDeath || false;
			this.perfect = perfect || false;
			this.doubleTime = doubleTime || false;
			this.nightcore = nightcore || false;
			this.hidden = hidden || false;
			this.flashlight = flashlight || false;
			/* special */
			this.relax = relax || false;
			this.autopilot = autopilot || false;
			this.spunOut = spunOut || false;
			this.auto = auto || false;
			this.scoreV2 = scoreV2 || false;
		};
	};
});