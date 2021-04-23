define(function(require) {
	let utils = require("./utils.js");
	let Mods = require("./mods.js");

	/* Star rating constants */
	let aimWeightMultiplier = 1.25 * 0.35;
	let speedWeightMultiplier = 1.1;

	/* Longer sliders are considered harder by the algorithm */
	function sliderDifficulty(slider) {
		return slider.length / 500 + 0.75;
	}

	/* Consider CS for difficulties */
	function CSDifficulty(CS, mods) {
		let newCS = CS;
		if (mods.easy) {
			newCS *= 0.5;
		} else if (mods.hardRock) {
			newCS *= 1.3;
			if (newCS > 10) {
				newCS = 10;
			}
		}
		return 1.5 * Math.E ** (0.05 * newCS) - 5 / 6;
	}

	function gaussianDistribution(x, a, b, c) {
		return c / (a * Math.sqrt(2 * Math.PI)) * Math.E ** (-1 * (x - b) ** 2 / (2 * a ** 2));
	}

	/* 
	 *	Jumps that are larger are considered more impreesive
	 *	i.e one large jump is more impresssive than two half sized jumps
	 *
	 *	Sliders are also weighted slightly differently
	*/
	function aimDifficultyMultiplier(distance, hitObject) {
		if (hitObject.type[1] === "1") {
			return 1.75 * Math.E ** (Math.E * 0.0035 * distance) * (gaussianDistribution(distance, 200, -110, 8400) + 1) - 10;
		} else {
			return 1.5 * Math.E ** (Math.E * 0.004 * distance) * (gaussianDistribution(distance, 200, -110, 8400) + 1) - 10;
		}
	}

	function aimDifficulty(previousHitObject, hitObject, nextHitObject, mods, circleSize) {
		let time = Math.abs(hitObject.time - previousHitObject.time);
		if (time >= 2) {
			return 0;
		}
		let distanceBetweenObjects = 0;
		let sliderLengthBonus = 1;
		if (hitObject.type[1] === "1") {
			sliderLengthBonus = sliderDifficulty(hitObject);
			if (hitObject.type[1].slides % 2 === 1) {
				distanceBetweenObjects = utils.dist(previousHitObject.curvePoints[previousHitObject.curvePoints.length - 1].x, previousHitObject.curvePoints[previousHitObject.curvePoints.length - 1].y, hitObject.x, hitObject.y);
			} else {
				distanceBetweenObjects = utils.dist(previousHitObject.x, previousHitObject.y, hitObject.x, hitObject.y);
			}
		} else {
			distanceBetweenObjects = utils.dist(previousHitObject.x, previousHitObject.y, hitObject.x, hitObject.y);
		}
		let a = utils.dist(previousHitObject.x, previousHitObject.y, hitObject.x, hitObject.y);
		let b = utils.dist(hitObject.x, hitObject.y, nextHitObject.x, nextHitObject.y);
		let c = utils.dist(previousHitObject.x, previousHitObject.y, nextHitObject.x, nextHitObject.y);
		/* cosine rule, one of the only uses outside of school lol */
		let angleBetweenHitobjects = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));
		if (isNaN(angleBetweenHitobjects)) {
			angleBetweenHitobjects = 0;
		}
		let angleDifficulty = -((angleBetweenHitobjects - Math.PI) ** 2) / (Math.PI ** (Math.E / 1.05)) + 1;
		return aimDifficultyMultiplier(distanceBetweenObjects, hitObject) * 0.15 * angleDifficulty * sliderLengthBonus * CSDifficulty(circleSize, mods);
	}

	function speedDifficulty(hitObject, previousHitObject, mods) {
		let time = Math.abs(hitObject.time - previousHitObject.time);
		let multiplier = 0.5;
		if (hitObject.type[1] === "1") {
			multiplier = 0.45;
		}
		if (time < 1 / 60) {
			time = 1 / 60;
		}
		if (mods.doubleTime || mods.nightCore) {
			time /= 1.5;
		} else if (mods.halfTime) {
			time /= 0.75
		}
		return multiplier / (time + 0.05);
	}

	return {
		calculate: function(beatmap, mods) {
			if (mods === undefined) {
				mods = Mods();
			}
			if (beatmap.hitObjects.length <= 4) {
				return 0;
			}
			let aimDiff = this.calculateAimDifficulty(beatmap, mods);
			let speedDiff = this.calculateSpeedDifficulty(beatmap, mods);
			return (aimDiff + speedDiff);
		},
		calculateAimDifficulty: function(beatmap, mods) {
			if (mods === undefined) {
				mods = Mods();
			}
			let sum = 0;
			let highest = 0;
			for (var i = 1; i < beatmap.hitObjects.length - 1; i++) {
				let difficulty = aimDifficulty(beatmap.hitObjects[i], beatmap.hitObjects[i - 1], beatmap.hitObjects[i + 1], mods, beatmap.CircleSize);
				sum += difficulty;
				if (difficulty > highest) {
					highest = difficulty;
				}
			}
			return (sum / (beatmap.hitObjects.length - 1) + highest / 150) * aimWeightMultiplier;
		},
		calculateSpeedDifficulty: function(beatmap, mods) {
			if (mods === undefined) {
				mods = Mods();
			}
			let sum = 0;
			let numberOfConsideredHitObjects = 0;
			let highest = 0;
			for (var i = 1; i < beatmap.hitObjects.length; i++) {
				if (beatmap.hitObjects[i].type[3] === "1") {
					continue;
				}
				if (beatmap.hitObjects[i - 1].type[3] === "1") {
					continue;
				}
				if (Math.abs(beatmap.hitObjects[i].time - beatmap.hitObjects[i - 1].time) < 2) {
					let difficulty = speedDifficulty(beatmap.hitObjects[i], beatmap.hitObjects[i - 1], mods);
					sum += difficulty;
					if (difficulty > highest) {
						highest = difficulty;
					}
				}
				numberOfConsideredHitObjects++;
			}
			return (sum / numberOfConsideredHitObjects + highest / 150) * speedWeightMultiplier;
		},
	}
});