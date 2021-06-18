define(function(require) {
	"use strict";
	const HitObject = require("./hitObjects.js");
	const Utils = require("./utils.js");
	/* refer to https://osu.ppy.sh/wiki/sk/osu!_File_Formats/Osu_(file_format) */
	let typeMap = {
		/* under [General] */
		AudioFilename: "string",
		AudioLeadIn: "number",
		/* depreciated, but might as well support it */
		AudioHash: "string",
		PreviewTime: "number",
		Countdown: "number",
		SampleSet: "string",
		StackLeniency: "number",
		Mode: "number",
		LetterboxInBreaks: "number",
		/* depreciated */
		StoryFireInFront: "number",
		UseSkinSprites: "number",
		/* depreciated */
		AlwaysShowPlayfield: "number",
		OverlayPosition: "string",
		SkinPreference: "string",
		EpilepsyWarning: "number",
		CountdownOffset: "number",
		SpecialStyle: "number",
		WidescreenStoryboard: "number",
		SamplesMatchPlaybackRate: "number",
		/* under [Editor] */
		Bookmarks: "string",
		DistanceSpacing: "number",
		BeatDivisor: "number",
		GridSize: "number",
		TimelineZoom: "number",
		/* under [Metadata] */
		Title: "string",
		TitleUnicode: "string",
		Artist: "string",
		ArtistUnicode: "string",
		Creator: "string",
		Version: "string",
		Source: "string",
		Tags: "string",
		BeatmapID: "number",
		BeatmapSetID: "number",
		/* under [Difficulty] */
		HPDrainRate: "number",
		CircleSize: "number",
		OverallDifficulty: "number",
		ApproachRate: "number",
		SliderMultiplier: "number",
		SliderTickRate: "number",
	};

	function parseHitObject(data) {
		let splited = data.split(",");
		let len = splited.length;
		for (var i = 0; i < len; i++) {
			if (/^[0-9]+$/.test(splited[i])) {
				splited[i] = parseFloat(splited[i]);
			}
		}
		let asBinary = Utils.reverse(Utils.binary(splited[3], 8));
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
	}
	function parseTimingPoint(data) {
		let splited = data.split(",");
		let len = splited.length;
		for (var i = 0; i < len; i++) {
			if (/^[0-9]+$/.test(splited[i])) {
				splited[i] = parseFloat(splited[i]);
			}
		}
		return new HitObject.TimingPoint(...splited);
	}
	function parseComboColour(data) {
		let splitTriplets = data.split(":")[1].split(",");
		return {
			r: parseInt(splitTriplets[0]),
			g: parseInt(splitTriplets[1]),
			b: parseInt(splitTriplets[2]),
		};
	}
	function parseBreakPeriod(data) {
		let splited = data.split(",");
		return new HitObject.BreakPeriod(...splited);
	}
	function parseBackground(data) {
		let splited = data.replaceAll("\"", "").split(",");
		/* ignore video files for now */
		if (splited[0] !== "Video") {
			return new HitObject.Background(...splited);
		}
	}
	function defaultComboColours() {
		return [
			parseComboColour(":255,213,128"),
			parseComboColour(":242,121,97"),
			parseComboColour(":255,140,179"),
			parseComboColour(":187,103,229"),
			parseComboColour(":140,236,255"),
			parseComboColour(":145,229,103"),
		];
	}
	return {
		parseBeatmap: function(data) {
			let splited = data.split(/[\n\r]/g);
			let beatmap = {
				version: splited[0],
				hitObjects: [],
				timingPoints: [],
				comboColours: [],
				breakPeriods: [],
				background: "",
			};
			let section = "";
			let subSection = "";
			/* start from 1 to ignore version */
			let len = splited.length;
			for (var i = 1; i < len; i++) {
				if (splited[i] === "") {
					continue;
				}
				if (splited[i].substr(0, 2) === "//") {
					subSection = splited[i];
				}
				if (splited[i][0] === "[") {
					section = splited[i].replace(/[\n\r]/g, "");
					continue;
				}
				if (section === "[TimingPoints]" && /[,]/g.test(splited[i])) {
					beatmap.timingPoints.push(parseTimingPoint(splited[i]));
					continue;
				}
				if (section === "[HitObjects]" && /[,]/g.test(splited[i])) {
					beatmap.hitObjects.push(parseHitObject(splited[i]));
					continue;
				}
				if (section === "[Colours]" && /(Combo)/g.test(splited[i])) {
					beatmap.comboColours.push(parseComboColour(splited[i]));
					continue;
				}
				if (section === "[Events]" && splited[i] !== subSection) {
					if (subSection === "//Background and Video events") {
						let parsedBackground = parseBackground(splited[i]);
						if (parsedBackground !== undefined) {
							beatmap.background = parsedBackground;
						}
					}
					if (subSection === "//Break Periods") {
						beatmap.breakPeriods.push(parseBreakPeriod(splited[i]));
					}
					// if (subSection === "//Storyboard Layer 0 (Background)") {
					// }
					// if (subSection === "//Storyboard Layer 1 (Fail)") {
					// }
					// if (subSection === "//Storyboard Layer 2 (Pass)") {
					// }
					// if (subSection === "//Storyboard Layer 3 (Foreground)") {
					// }
					continue;
				}
				let keyValuePair = splited[i].split(/:(.+)/);
				if (keyValuePair.length === 1) {
					continue;
				}
				if (keyValuePair[1].substr(0, 1) === " ") {
					keyValuePair[1] = keyValuePair[1].substr(1);
				}
				if (typeMap[keyValuePair[0]] === "string") {
					beatmap[keyValuePair[0]] = keyValuePair[1];
				} else {
					beatmap[keyValuePair[0]] = parseFloat(keyValuePair[1]);
				}
			}
			if (beatmap.comboColours.length === 0) {
				beatmap.comboColours = defaultComboColours();
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
	};
});