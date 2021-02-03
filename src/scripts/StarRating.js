define(function(require) {
	let utils = require("./utils.js");
	function difficulty(hitObject1, hitObject2) {
		let d = 0;
		if (hitObject1.type[1] === "1") {
			if (hitObject1.type[1].slides % 2 === 1) {
				d = utils.dist(hitObject1.curvePoints[hitObject1.curvePoints.length - 1].x, hitObject1.curvePoints[hitObject1.curvePoints.length - 1].y, hitObject2.x, hitObject2.y);
			} else {
				d = utils.dist(hitObject1.x, hitObject1.y, hitObject2.x, hitObject2.y);
			}
		} else {
			d = utils.dist(hitObject1.x, hitObject1.y, hitObject2.x, hitObject2.y);
		}
		let t = (hitObject2.time - hitObject1.time);
		if (t === 0) {
			t = 1 / 60;
		}
		return ((d + Math.sqrt(t)) / 100) * (1 / (t ** (3 / 4)));
	}

	return function(beatMap, mods) {
		let highest = 0;
		let highestIndex = 0;
		let starRatingSum = 0;
		let total = 0;
		for (let i = 0; i < beatMap.hitObjects.length - 1; i++) {
			if (beatMap.hitObjects[i].type[3] === "1" || beatMap.hitObjects[i + 1].type[3] === "1") {
				continue;
			}
			let diff = difficulty(beatMap.hitObjects[i], beatMap.hitObjects[i + 1]);
			if (diff > highest) {
				highest = diff;
				highestIndex = i;
			}
			starRatingSum += diff;
			total++;
		}
		console.log("star rating: " + ((starRatingSum / total / 2 + highest / 1.5) / 2));
		console.log("highest star rating: " + highest / 1.5 + " at " + beatMap.hitObjects[highestIndex].time);
		return (starRatingSum / total / 2 + highest / 1.5) / 2;
	}	
});