define(function(require) {
	return {
		map: function(num, numMin, numMax, mapMin, mapMax) {
			return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
		},
		randomInt: function(min, max) {
			return Math.round((Math.random() * (max - min)) + min);
		},
		dist: function(x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		},
		direction: function(x1, y1, x2, y2) {
			return Math.atan2(x1 - x2, y1 - y2);
		},
		blurDiv: function(element, value) {
			let blur = document.getElementById(element);
			blur.style.filter = "blur(" + value + "px)";
		},
		brighten: function(element, value) {
			let dim = document.getElementById(element);
			dim.style.filter = "brightness(" + value + ")";
		},
		replaceAll: function(str, items) {
			let s = str;
			for (var i = 0; i < items.length; i++) {
				s = s.replace(items[i], "");
			}
			return s;
		},
		binary: function(number, length) {
			let asBinary = (number >>> 0).toString(2);
			while (asBinary.length <= 8) {
				asBinary = "0" + asBinary;
			}
			return asBinary;
		},
		reverse: function(str) {
			var splitString = str.split("");;
			var reverseArray = splitString.reverse();
			var joinArray = reverseArray.join("");
			return joinArray;
		},
		/* range centered around value */
		withinRange: function(reference, value, range) {
			if (Math.abs(reference - value) <= range / 2) {
				return true;
			} else {
				return false;
			}
		},
		beatMapDifficulty: function(starRating) {
			if (starRating <= 1.99) {
				return "Easy";
			} else if (starRating <= 2.69) {
				return "Normal";
			} else if (starRating <= 3.99) {
				return "Hard";
			} else if (starRating <= 5.29) {
				return "Insane";
			} else if (starRating <= 6.49) {
				return "Expert";
			} else {
				return "Expert+";
			}
		},
		difficultyPoints: function(cs, hp, od) {
			let total = cs + hp + od;
			if (total < 5) {
				return 2;
			} else if (total < 12) {
				return 3;
			} else if (total < 17) {
				return 4;
			} else if (total < 24) {
				return 5;
			} else if (total < 30) {
				return 6;
			}
		},
		hitScore: function(hitValue, comboMultiplier, difficultyMultiplier, modMultiplier) {
			return hitValue + (hitValue * ((comboMultiplier * difficultyMultiplier * modMultiplier) / 25))
		},
		grade: function(perfects, goods, bads, misses, hiddenOrFlashlight) {
			let total = perfects + goods + bads + misses;
			if (perfects >= total) {
				if (hiddenOrFlashlight) {
					return "xh";
				} else {
					return "x";
				}
			} else if (perfects >= total * 0.9 && bads <= total * 0.01 && misses === 0) {
				if (hiddenOrFlashlight) {
					return "sh";
				} else {
					return "s";
				}
			} else if ((perfects >= total * 0.8 && misses === 0) || perfects >= total * 0.9) {
				return "a";
			} else if ((perfects >= total * 0.7 && misses === 0) || perfects >= total * 0.8) {
				return "b";
			} else if (perfects >= total * 0.6) {
				return "c";
			} else {
				return "d";
			}
		},
		accuracy: function(perfects, goods, bads, misses) {
			let total = perfects + goods + bads + misses;
			if (total === 0) {
				return 1;
			}
			return (50 * bads + 100 * goods + 300 * perfects) / (300 * total);

		},
		sliderMultiplier(multiplier) {
			return 1 / (-multiplier / 100);
		},
	};
});