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
				timingPoints: [],
				timingPointsParsed: [],
			}
			let section = "";
			/* start from 1 to ignore version */
			for (var i = 1; i < splited.length; i++) {
				if (splited[i] === "" || splited[i].substr(0, 2) === "//") {
					continue;
				}
				if (splited[i][0] === "[") {
					section = splited[i];
				}
				let l = splited[i].split(/:(.+)/);
				if (section === "[TimingPoints]" && /[,]/g.test(splited[i])) {
					beatmap.timingPoints.push(splited[i]);
					beatmap.timingPointsParsed.push(this.parseTimingPoint(splited[i]));
					continue;
				}
				if (section === "[HitObjects]" && /[,]/g.test(splited[i])) {
					beatmap.hitObjects.push(splited[i]);
					beatmap.hitObjectsParsed.push(this.parseHitObject(splited[i]));
					beatmap.hitObjectsParsed[beatmap.hitObjectsParsed.length - 1].time -= Formulas.AR(beatmap.ApproachRate);
					continue;
				}
				if (l.length === 1) {
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
			} else {
			}
		},
		parseTimingPoint: function(data) {
			let splited = data.split(",");
			for (var i = 0; i < splited.length; i++) {
				if (/[0-9.]/g.test(splited[i])) {
					splited[i] = parseFloat(splited[i]);
				}
			}
			return new HitObject.TimingPoint(...splited);
		}
	};
});