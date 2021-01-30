define(function(require) {
  "use strict";
	return {
		AR: function(n, timingMod) {
			if (timingMod === "easy") {
				n *= 0.5;
			} else if (timingMod === "hardrock") {
				n *= 1.4;
				if (n > 10) {
					n = 10;
				}
			}
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
		ARFadeIn: function(n, timingMod) {
			if (timingMod === "easy") {
				n *= 0.5;
			} else if (timingMod === "hardrock") {
				n *= 1.4;
				if (n > 10) {
					n = 10;
				}
			}
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
		CS: function (n, timingMod) {
			let radius = 54.4 - 4.48 * n;
			if (timingMod === "easy") {
				radius /= 0.5;
			} else if (timingMod === "hardrock") {
				radius /= 1.3;
			}
			return radius;
		},
		/* values for hit windows (centered around hit object time for 50, 100, 300)*/
		ODHitWindow: function(n, timingMod) {
			if (timingMod === "easy") {
				n *= 0.5;
			} else if (timingMod === "hardrock") {
				n *= 1.4;
				if (n > 10) {
					n = 10;
				}
			}
			/* in order 50, 100, 300*/
			return [
				0.4 - 0.02 * n,
				0.28 - 0.016 * n,
				0.16 - 0.012 * n,
			];
		},
		/* measured in spins per second required for clear*/
		ODSpinner: function(n, timingMod) {
			if (timingMod === "easy") {
				n *= 0.5;
			} else if (timingMod === "hardrock") {
				n *= 1.4;
				if (n > 10) {
					n = 10;
				}
			}
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
		HP: function(n, hitScore) {
			switch (hitScore) {
					/* slider bonus spin */
					case 1000:
						return 0;
						break;
					/* great*/
					case 300:
						return 0.5 / ((n / 4) + 1);
						break;
					/* good or spinner spin */
					case 100:
						return 0.2 / ((n / 4) + 1);
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
		}
	};
});