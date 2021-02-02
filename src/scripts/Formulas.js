define(function(require) {
	"use strict";

	function applyModMultiplier(n, mods) {
		if (mods) {
			if (mods.easy) {
				n *= 0.5;
			}
			if (mods.hardRock) {
				n *= 1.4;
				if (n >= 10) {
					n = 0;
				}
			}
		}
		return n;
	}
	return {
		AR: function(n, mods) {
			n = applyModMultiplier(n, mods);
			let ar;
			if (n < 5) {
				ar = 1.2 + 0.6 * (5 - n) / 5;
			} else if (n === 5) {
				ar = 1.2;
			} else if (n > 5) {
				ar = 1.2 - 0.75 * (n - 5) / 5;
			}
			return ar;
		},
		ARFadeIn: function(n, mods) {
			n = applyModMultiplier(n, mods);
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
			n = applyModMultiplier(n, mods);
			return 54.4 - 4.48 * n;
		},
		/* values for hit windows (centered around hit object time for 50, 100, 300)*/
		ODHitWindow: function(n, mods) {
			n = applyModMultiplier(n, mods);
			/* in order 50, 100, 300*/
			return [
				0.4 - 0.02 * n,
				0.28 - 0.016 * n,
				0.16 - 0.012 * n,
			];
		},
		/* measured in spins per second required for clear*/
		ODSpinner: function(n, mods) {
			n = applyModMultiplier(n, mods);
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
				case 1000:
					return 0.025;
					break;
					/* great*/
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
			return hitValue + (hitValue * ((comboMultiplier * difficultyMultiplier * modMultiplier) / 25));
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
		sliderMultiplier: function(multiplier) {
			return 1 / (-multiplier / 100);
		},
	};
});