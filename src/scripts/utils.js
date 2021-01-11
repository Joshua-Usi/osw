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
		}
	};
});