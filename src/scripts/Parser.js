define(function(require) {
	const HitObject = require("./HitObject.js");
	const Formulas = require("./Formulas.js");
	const utils = require("./utils.js");
	return {
		parseBeatMap: function(data) {
			let splited = data.split("\n");
			let beatmap = {
				version: splited[0],
				hitObjects: [],
				hitObjectsParsed: [],
			}
			let passedHitObjects = false;
			/* start from 1 to ignore version */
			for (var i = 1; i < splited.length; i++) {
				if (splited[i] === "" || splited[i].substr(0, 2) === "//") {
					continue;
				}
				if (splited[i] === "[HitObjects]") {
					passedHitObjects = true;
				}
				let l = splited[i].split(/:(.+)/);
				if (l.length === 1) {
					continue;
				}
				if (passedHitObjects && /\d/.test(l[0])) {
					beatmap.hitObjects.push(splited[i]);
					beatmap.hitObjectsParsed.push(this.parseHitObject(splited[i]));
					beatmap.hitObjectsParsed[beatmap.hitObjectsParsed.length - 1].time -= Formulas.AR(beatmap.ApproachRate);
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
			for (var i = 0; i < beatmap.hitObjectsParsed.length; i++) {
				if (typeof(beatmap.hitObjectsParsed[i].x) === "string") {
					beatmap.hitObjectsParsed.splice(i, 1);
					beatmap.hitObjects.splice(i, 1);
					i--;
				}
			}
			return beatmap;
		},
		parseHitObject: function(data) {
			let splited = data.split(",");
			for (var i = 0; i < splited.length; i++) {
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
			
		}
	};
});