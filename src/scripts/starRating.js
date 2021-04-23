define(function(require) {
	let utils = require("./utils.js");
	let Mods = require("./mods.js");

	function difficulty(hitObject1, hitObject2, previous, mods) {
		let distanceBetweenObjects = 0;
		if (hitObject1.type[1] === "1") {
			if (hitObject1.type[1].slides % 2 === 1) {
				distanceBetweenObjects = utils.dist(hitObject1.curvePoints[hitObject1.curvePoints.length - 1].x, hitObject1.curvePoints[hitObject1.curvePoints.length - 1].y, hitObject2.x, hitObject2.y);
			} else {
				distanceBetweenObjects = utils.dist(hitObject1.x, hitObject1.y, hitObject2.x, hitObject2.y);
			}
		} else {
			distanceBetweenObjects = utils.dist(hitObject1.x, hitObject1.y, hitObject2.x, hitObject2.y);
		}
		let timeBetweenObjects = hitObject2.time - hitObject1.time;
		if (mods) {
			if (mods.doubleTime) {
				timeBetweenObjects /= 1.5;
			}
			if (mods.halfTime) {
				timeBetweenObjects /= 0.75;
			}
		}
		if (timeBetweenObjects === 0) {
			timeBetweenObjects = 1 / 60;
		}
		let a = utils.dist(previous.x, previous.y, hitObject1.x, hitObject1.y);
		let b = utils.dist(hitObject1.x, hitObject1.y, hitObject2.x, hitObject2.y);
		let c = utils.dist(previous.x, previous.y, hitObject2.x, hitObject2.y);
		/* cosine rule, one of the only uses outside of school lol */
		let angleBetweenHitobjects = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));
		if (isNaN(angleBetweenHitobjects)) {
			angleBetweenHitobjects = 0;
		}
		let angleDifficulty = -((angleBetweenHitobjects - Math.PI) ** 2) / (Math.PI ** (Math.E / 1.35)) + 2;
		return ((distanceBetweenObjects + Math.sqrt(timeBetweenObjects)) / 90) * (1 / (timeBetweenObjects ** (9 / 16))) * angleDifficulty;
	}


	function aimDifficulty(previousHitObject, hitObject, nextHitObject, mods) {
		let distanceBetweenObjects = 0;
		if (hitObject.type[1] === "1") {
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
		return distanceBetweenObjects * 0.05 * angleDifficulty;
	}

	function speedDifficulty(hitObject, previousHitObject, mods) {
		let time = Math.abs(hitObject.time - previousHitObject.time);
		if (time < 1 / 60) {
			time = 1 / 60;
		}
		if (mods.doubleTime || mods.nightCore) {
			time /= 1.5;
		} else if (mods.halfTime) {
			time /= 0.75
		}
		return 0.40 / time;
	}

	return {
		calculate: function(beatmap, mods) {
			if (mods === undefined) {
				mods = Mods();
			}
			if (beatmap.hitObjects.length <= 4) {
				return 0;
			}
			return this.calculateAimDifficulty(beatmap, mods) + this.calculateSpeedDifficulty(beatmap, mods);
		},
		calculateAimDifficulty: function(beatmap, mods) {
			if (mods === undefined) {
				mods = Mods();
			}
			let sum = 0;
			for (var i = 1; i < beatmap.hitObjects.length - 1; i++) {
				sum += aimDifficulty(beatmap.hitObjects[i], beatmap.hitObjects[i - 1], beatmap.hitObjects[i + 1], mods);
			}
			return sum / (beatmap.hitObjects.length - 1);
			return 0;
		},
		calculateSpeedDifficulty: function(beatmap, mods) {
			if (mods === undefined) {
				mods = Mods();
			}
			let sum = 0;
			for (var i = 1; i < beatmap.hitObjects.length; i++) {
				sum += speedDifficulty(beatmap.hitObjects[i], beatmap.hitObjects[i - 1], mods);
			}
			return sum / (beatmap.hitObjects.length - 1);
		},
	}
});