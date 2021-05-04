define(function(require) {
	"use strict";
	const HitObject = require("./hitObjects.js");
	const utils = require("./utils.js");
	return {
		parseBeatMap: function(data) {
			let splited = data.split("\n");
			let beatmap = {
				version: splited[0],
				hitObjects: [],
				timingPoints: [],
				comboColours: [],
			};
			let section = "";
			/* start from 1 to ignore version */
			let len = splited.length;
			for (var i = 1; i < len; i++) {
				if (splited[i] === "" || splited[i].substr(0, 2) === "//") {
					continue;
				}
				if (splited[i][0] === "[") {
					section = splited[i].replace(/[\n\r]/g, "");
					continue;
				}
				if (section === "[TimingPoints]" && /[,]/g.test(splited[i])) {
					beatmap.timingPoints.push(this.parseTimingPoint(splited[i]));
					continue;
				}
				if (section === "[HitObjects]" && /[,]/g.test(splited[i])) {
					beatmap.hitObjects.push(this.parseHitObject(splited[i]));
					continue;
				}
				if (section === "[Colours]" && /(Combo)/g.test(splited[i])) {
					beatmap.comboColours.push(this.parseComboColour(splited[i]));
					continue;
				}
				let keyValuePair = splited[i].split(/:(.+)/);
				if (keyValuePair.length === 1) {
					continue;
				}
				if (keyValuePair[0] === "AudioFilename") {
					if (keyValuePair[1].substr(0, 1) === " ") {
						keyValuePair[1] = keyValuePair[1].substr(1);
					}
					beatmap[keyValuePair[0]] = keyValuePair[1];
					continue;
				}
				if (isNaN(parseFloat(keyValuePair[1]))) {
					if (keyValuePair[1].substr(0, 1) === " ") {
						keyValuePair[1] = keyValuePair[1].substr(1);
					}
					beatmap[keyValuePair[0]] = keyValuePair[1];
				} else {
					beatmap[keyValuePair[0]] = parseFloat(keyValuePair[1]);
				}
			}
			if (beatmap.comboColours.length === 0) {
				beatmap.comboColours = this.defaultComboColours();
			}
			return beatmap;
		},
		quickParseMap: function(data) {
			let splited = data.split("\n");
			let beatmap = {
				version: splited[0],
			};
			let section = "";
			/* start from 1 to ignore version */
			let len = splited.length;
			for (var i = 1; i < len; i++) {
				if (splited[i] === "" || splited[i].substr(0, 2) === "//") {
					continue;
				}
				if (splited[i][0] === "[") {
					section = splited[i].replace(/[\n\r]/g, "");
					continue;
				}
				if (section === "[TimingPoints]" || section === "[HitObjects]" || section === "[Colours]") {
					break;
				}
				let keyValuePair = splited[i].split(/:(.+)/);
				if (keyValuePair.length === 1) {
					continue;
				}
				if (keyValuePair[0] === "AudioFilename") {
					if (keyValuePair[1].substr(0, 1) === " ") {
						keyValuePair[1] = keyValuePair[1].substr(1);
					}
					beatmap[keyValuePair[0]] = keyValuePair[1];
					continue;
				}
				if (isNaN(parseFloat(keyValuePair[1]))) {
					if (keyValuePair[1].substr(0, 1) === " ") {
						keyValuePair[1] = keyValuePair[1].substr(1);
					}
					beatmap[keyValuePair[0]] = keyValuePair[1];
				} else {
					beatmap[keyValuePair[0]] = parseFloat(keyValuePair[1]);
				}
			}
			return beatmap;
		},
		parseHitObject: function(data) {
			let splited = data.split(",");
			let len = splited.length;
			for (var i = 0; i < len; i++) {
				if (/^[0-9]+$/.test(splited[i])) {
					splited[i] = parseFloat(splited[i]);
				}
			}
			let asBinary = utils.reverse(utils.binary(splited[3]));
			if (asBinary[0] === "1") {
				/* hitCircle */
				return new HitObject.HitCircle(...splited);
			} else if (asBinary[1] === "1") {
				/* slider */
				return new HitObject.Slider(...splited);
			} else if (asBinary[3] === "1") {
				/* spinner */
				return new HitObject.Spinner(...splited);
			}
		},
		parseTimingPoint: function(data) {
			let splited = data.split(",");
			let len = splited.length;
			for (var i = 0; i < len; i++) {
				if (/^[0-9]+$/.test(splited[i])) {
					splited[i] = parseFloat(splited[i]);
				}
			}
			return new HitObject.TimingPoint(...splited);
		},
		parseComboColour: function(data) {
			let splitTriplets = data.split(":")[1].split(",");
			return {
				r: parseInt(splitTriplets[0]),
				g: parseInt(splitTriplets[1]),
				b: parseInt(splitTriplets[2]),
			}
		},
		defaultComboColours: function() {
			return [
				this.parseComboColour(":255,213,128"),
				this.parseComboColour(":242,121,97"),
				this.parseComboColour(":255,140,179"),
				this.parseComboColour(":187,103,229"),
				this.parseComboColour(":140,236,255"),
				this.parseComboColour(":145,229,103"),
			];
		},
	};
});