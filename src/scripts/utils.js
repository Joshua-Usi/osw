define(function(require) {
	return {
		map: function(num, numMin, numMax, mapMin, mapMax) {
			return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
		},
		randomInt: function(min, max) {
			return Math.round((Math.random() * (max - min)) + min);
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
	};
});