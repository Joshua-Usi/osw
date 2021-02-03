define(function(require) {
  "use strict";
	const HitObject = require("./HitObject.js");
	const utils = require("./utils.js");
	return {
		parseBeatMap: function(data) {
			let splited = data.split("\n");
			if (splited[0] !== "osu file format v14") {
				console.warn("Currently parsed beatmap uses \"" + splited[0] + "\" which may be incompatible with the current parser");
			}
			let beatmap = {
				version: splited[0],
				hitObjects: [],
				timingPoints: [],
			};
			let section = "";
			/* start from 1 to ignore version */
			let len = splited.length;
			for (var i = 1; i < len; i++) {
				if (splited[i] === "" || splited[i].substr(0, 2) === "//") {
					continue;
				}
				if (splited[i][0] === "[") {
					section = splited[i];
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
				let l = splited[i].split(/:(.+)/);
				if (l.length === 1) {
					continue;
				}
				if (l[0] === "AudioFilename") {
					if (l[1].substr(0, 1) === " ") {
						l[1] = l[1].substr(1);
					}
					beatmap[l[0]] = l[1];
					continue;
				}
				if (isNaN(parseFloat(l[1]))) {
					if (l[1].substr(0, 1) === " ") {
						l[1] = l[1].substr(1);
					}
					beatmap[l[0]] = l[1];
				} else {
					beatmap[l[0]] = parseFloat(l[1]);
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
			} else {
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
		}
	};
});