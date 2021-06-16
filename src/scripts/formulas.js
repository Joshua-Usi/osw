define(function(require) {
	"use strict";
	const Mods = require("./mods.js");
	const utils = require("./utils.js");
	const toShorthand = {
		/* difficulty reduction */
		easy: "EZ",
		noFail: "NF",
		halfTime: "HT",
		/* difficulty increases */
		hardRock: "HR",
		suddenDeath: "SD",
		perfect: "PF",
		doubleTime: "DT",
		nightcore: "NC",
		hidden: "HD",
		flashlight: "FL",
		/* special */
		relax: "RX",
		autopilot: "AP",
		spunOut: "SO",
		auto: "AT",
		scoreV2: "V2",
	};
	const toLonghand = {
		/* difficulty reduction */
		EZ: "easy",
		NF: "noFail",
		HT: "halfTime",
		/* difficulty increases */
		HR: "hardRock",
		SD: "suddenDeath",
		PF: "perfect",
		DT: "doubleTime",
		NC: "nightcore",
		HD: "hidden",
		FL: "flashlight",
		/* special */
		RX: "relax",
		AP: "autopilot",
		SO: "spunOut",
		AT: "auto",
		V2: "scoreV2",
	};
	return {
		applyModMultiplier: function(n, mods, multiplier) {
			if (mods) {
				if (mods.easy) {
					n *= 0.5;
				}
				if (mods.hardRock) {
					n *= multiplier;
					if (n >= 10) {
						n = 10;
					}
				}
			}
			return n;
		},
		AR: function(n, mods) {
			n = this.applyModMultiplier(n, mods, 1.4);
			if (n < 5) {
				return 1.2 + 0.6 * (5 - n) / 5;
			} else if (n === 5) {
				return 1.2;
			} else if (n > 5) {
				return 1.2 - 0.75 * (n - 5) / 5;
			}
		},
		msToAR: function(n) {
			let ar;
			if (n > 1.2) {
				ar = -(5 * (n - 1.2)) / 0.6 + 5;
			} else if (n === 1.2) {
				ar = 5;
			} else if (n < 1.2) {
				ar = -(5 * (n - 1.2)) / 0.75 + 5;
			}
			if (ar > -Number.EPSILON * 10 && ar < Number.EPSILON * 10) {
				ar = 0;
			}
			return ar;
		},
		ARFadeIn: function(n, mods) {
			n = this.applyModMultiplier(n, mods, 1.4);
			let ar;
			if (n < 5) {
				ar = 0.8 + 0.4 * (5 - n) / 5;
			} else if (n === 5) {
				ar = 0.8;
			} else if (n > 5) {
				ar = 0.8 - 0.5 * (n - 5) / 5;
			}
			return ar;
		},
		CS: function(n, mods) {
			n = this.applyModMultiplier(n, mods, 1.3);
			return (512 / 16) * (1 - 0.7 * (n - 5) / 5);
		},
		/* values for hit windows (centered around hit object time for 50, 100, 300) */
		ODHitWindow: function(n, mods) {
			n = this.applyModMultiplier(n, mods, 1.4);
			/* in order 50, 100, 300 */
			return [
				0.4 - 0.02 * n,
				0.28 - 0.016 * n,
				0.16 - 0.012 * n,
			];
		},
		/* measured in spins per second required for clear */
		ODSpinner: function(n, mods) {
			n = this.applyModMultiplier(n, mods, 1.4);
			let od;
			if (n < 5) {
				od = 5 - 2 * (5 - n) / 5;
			} else if (n === 5) {
				od = 5;
			} else if (n > 5) {
				od = 5 + 2.5 * (n - 5) / 5;
			}
			return od;
		},
		/* Natural HP drain */
		HPDrain: function(n, time) {
			if (time === 0) {
				return 0;
			}
			return (time / 500) * (100 / (11 - n));
		},
		HP: function(n, hitScore, type, mod) {
			if (mod.suddenDeath && hitScore === 0) {
				return -1;
			}
			if (mod.perfect && hitScore != 300 && type === "hit-circle") {
				return -1;
			}
			switch (hitScore) {
				/* slider bonus spin */
				case 1100:
					return 0.025;
					break;
				/* great */
				case 300:
					return 0.5 / ((n / 4) + 1);
					break;
				/* good or spinner spin */
				case 100:
					if (type === "hit-circle") {
						return 0.2 / ((n / 4) + 1);
					} else {
						return 0.01;
					}
					break;
				/* meh */
				case 50:
					return 0;
					break;
				/* complete miss */
				case 0:
					return -(n + 1) / 55;
					break;
				/* Slider head, repeat and end */
				case 30:
					return 0.05 / ((n / 4) + 1);
					break;
				/* Slider tick */
				case 10:
					return 0.01 / ((n / 4) + 1);
					break;
			}
		},
		beatmapDifficultyIcon: function(starRating) {
			if (starRating <= 1.99) {
				return "easy";
			} else if (starRating <= 2.69) {
				return "normal";
			} else if (starRating <= 3.99) {
				return "hard";
			} else if (starRating <= 5.29) {
				return "insane";
			} else if (starRating <= 6.49) {
				return "expert";
			} else {
				return "expert+";
			}
		},
		beatmapDifficultyColour: function(starRating) {
			if (starRating <= 1.99) {
				return "#a1b855";
			} else if (starRating <= 2.69) {
				return "#78c6d3";
			} else if (starRating <= 3.99) {
				return "#eaca65";
			} else if (starRating <= 5.29) {
				return "#e78fb8";
			} else if (starRating <= 6.49) {
				return "#9b86d8";
			} else {
				return "#515151";
			}
		},
		/* https://osu.ppy.sh/wiki/en/Score#scoring */
		difficultyPoints: function(cs, hp, od, objectCount, drainTime) {
			return Math.round((cs + hp + od + utils.clamp(objectCount / drainTime * 8, 0, 16)) / 38 * 5);
		},
		hitScore: function(hitValue, comboMultiplier, difficultyMultiplier, modMultiplier) {
			return hitValue + (hitValue * ((comboMultiplier * difficultyMultiplier * modMultiplier) / 25));
		},
		grade: function(great, ok, meh, miss, mods) {
			let total = great + ok + meh + miss;
			if (great >= total) {
				if (mods.hidden || mods.flashlight) {
					return "xh";
				} else {
					return "x";
				}
			} else if (great >= total * 0.9 && meh <= total * 0.01 && miss === 0) {
				if (mods.hidden || mods.flashlight) {
					return "sh";
				} else {
					return "s";
				}
			} else if ((great >= total * 0.8 && miss === 0) || great >= total * 0.9) {
				return "a";
			} else if ((great >= total * 0.7 && miss === 0) || great >= total * 0.8) {
				return "b";
			} else if (great >= total * 0.6) {
				return "c";
			} else {
				return "d";
			}
		},
		accuracy: function(great, ok, meh, miss) {
			let total = great + ok + meh + miss;
			if (total === 0) {
				return 1;
			}
			return (50 * meh + 100 * ok + 300 * great) / (300 * total);
		},
		sliderMultiplier: function(multiplier) {
			return 1 / (-multiplier / 100);
		},
		modScoreMultiplier: function(mods) {
			let multiplier = 1;
			/* increases */
			if (mods.hardRock) {
				multiplier *= 1.06;
			}
			if (mods.hidden) {
				multiplier *= 1.06;
			}
			if (mods.doubleTime || mods.nightcore) {
				multiplier *= 1.12;
			}
			if (mods.flashlight) {
				multiplier *= 1.12;
			}
			/* decreases */
			if (mods.easy) {
				multiplier *= 0.5;
			}
			if (mods.noFail) {
				multiplier *= 0.5;
			}
			if (mods.halfTime) {
				multiplier *= 0.3;
			}
			if (mods.spunOut) {
				multiplier *= 0.9;	
			}
			/* special mods */
			if (mods.relax) {
				multiplier *= 0;
			}
			if (mods.autopilot) {
				multiplier *= 0;
			}
			return multiplier;
		},
		parseShorthand: function(string) {
			let splitMods = string.match(/.{1,2}/g);
			let mods = new Mods();
			for (var i = 0; i < splitMods.length; i++) {
				mods[this.shorthandToMod(splitMods[i])] = true;
			}
			return mods;
		},
		toShorthand: function(mods) {
			let output = "";
			for (let mod in mods) {
				if (mods[mod] === true) {
					output += this.modToShorthand(mod);
				}
			}
			if (output === "") {
				return "NM";
			}
			return output;
		},
		toCalculatingShorthand: function(mods) {
			let output = "";
			let valuesThatDontMatter = [
				"noFail",
				"suddenDeath",
				"perfect",
				"hidden",
				"flashlighht",
				"relax",
				"autopilot",
				"spunOut",
				"auto",
				"scoreV2",
			];
			for (let mod in mods) {
				if (mods[mod] === true && valuesThatDontMatter.includes(mod) == false) {
					output += this.modToShorthand(mod);;
				}
			}
			if (output === "") {
				return "NM";
			}
			return output;
		},
		modToShorthand: function(mod) {
			return toShorthand[mod];
		},
		shorthandToMod: function(shorthand) {
			return toLonghand[shorthand];
		},
		getObjectCount: function(beatmap) {
			let counts = {
				circles: 0,
				sliders: 0,
				spinners: 0,
			};
			for (var i = 0; i < beatmap.hitObjects.length; i++) {
				if (beatmap.hitObjects[i].type[0] === "1") {
					counts.circles++;
				} else if (beatmap.hitObjects[i].type[1] === "1") {
					counts.sliders++;
				} else if (beatmap.hitObjects[i].type[3] === "1") {
					counts.spinners++;
				}
			}
			return counts;
		},
	};
});