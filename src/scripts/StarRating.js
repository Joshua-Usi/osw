define(function(require) {
	let utils = require("./utils.js");

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

	return {
		version: 1,
		calculate: function(beatMap, mods) {
			let highest = 0;
			let highestIndex = 0;
			let starRatingSum = 0;
			let total = 0;
			for (let i = 1; i < beatMap.hitObjects.length - 1; i++) {
				if (beatMap.hitObjects[i].type[3] === "1" || beatMap.hitObjects[i + 1].type[3] === "1") {
					continue;
				}
				let diff = difficulty(beatMap.hitObjects[i], beatMap.hitObjects[i + 1], beatMap.hitObjects[i - 1], mods);
				if (diff > highest) {
					highest = diff;
					highestIndex = i;
				}
				starRatingSum += diff;
				total++;
			}
			return (starRatingSum / total / 2 + highest / 1.5) / 2;
		},
	}
});