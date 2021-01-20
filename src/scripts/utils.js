define(function(require) {
  "use strict";
	return {
		map: function(num, numMin, numMax, mapMin, mapMax) {
			return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
		},
		randomInt: function(min, max) {
			return Math.round((Math.random() * (max - min)) + min);
		},
		dist: function(x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		},
		direction: function(x1, y1, x2, y2) {
			return Math.atan2(x1 - x2, y1 - y2);
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
			for (let i = 0; i < items.length; i++) {
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
			let splitString = str.split("");
			let reverseArray = splitString.reverse();
			let joinArray = reverseArray.join("");
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
		lineLine: function(x1, y1, x2, y2, x3, y3, x4, y4) {
			const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
			if (den === 0) return;
			const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
			const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
			if (t > 0 && t < 1 && u > 0 && u < 1) {
				const pt = {
					x: undefined,
					y: undefined,
				};
				pt.x = x1 + t * (x2 - x1);
				pt.y = y1 + t * (y2 - y1);
				return pt;
			} else {
				return;
			}
		},
		// To find orientation of ordered triplet (p1, p2, p3). 
		// The function returns following values 
		// 0 --> p, q and r are colinear 
		// 1 --> Clockwise 
		// 2 --> Counterclockwise 
		orientation: function(p1, p2, p3) 
		{ 
			let val = (p2.y - p1.y) * (p3.x - p2.x) - 
					  (p2.x - p1.x) * (p3.y - p2.y); 
			// colinear
			if (val == 0) {
				return 0;
			}
			// clock or counterclock wise 
			return (val > 0) ? 1 : 2; 
		},
		/* 90 sided circle */
		circleToPoints: function(x, y, r, length, startingAngle, clockwise) {
			let points = [];
			let totalLength = 0;
			let direction;
			if (clockwise === 2) {
				direction = 1;
			}
			if (clockwise === 1) {
				direction = -1;
			}
			for (let i = 0; i < 360; i += 4) {
				points.push({
					x: x + Math.cos(startingAngle + direction * i * Math.PI / 180) * r,
					y: y + Math.sin(startingAngle + direction * i * Math.PI / 180) * r,
				});
				if (i >= 1) {
					totalLength += this.dist(points[i / 4].x, points[i / 4].y, points[i / 4 - 1].x, points[i / 4 - 1].y);
				}
				if (totalLength >= length) {
					break;
				}
			}
			return points;
		},
		circumcircle: function(a, b, c) {
			a = a;
			b = b;
			c = c;
			let EPSILON = 1.0 / 1048576.0;
			let ax = a.x,
				ay = a.y,
				bx = b.x,
				by = b.y,
				cx = c.x,
				cy = c.y,
				fabsy1y2 = Math.abs(ay - by),
				fabsy2y3 = Math.abs(by - cy),
				xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;
			/* Check for coincident points */
			if (fabsy1y2 < EPSILON && fabsy2y3 < EPSILON) {
				throw new Error("Eek! Coincident points!");
			}
			if (fabsy1y2 < EPSILON) {
				m2 = -((cx - bx) / (cy - by));
				mx2 = (bx + cx) / 2.0;
				my2 = (by + cy) / 2.0;
				xc = (bx + ax) / 2.0;
				yc = m2 * (xc - mx2) + my2;
			} else if (fabsy2y3 < EPSILON) {
				m1 = -((bx - ax) / (by - ay));
				mx1 = (ax + bx) / 2.0;
				my1 = (ay + by) / 2.0;
				xc = (cx + bx) / 2.0;
				yc = m1 * (xc - mx1) + my1;
			} else {
				m1 = -((bx - ax) / (by - ay));
				m2 = -((cx - bx) / (cy - by));
				mx1 = (ax + bx) / 2.0;
				mx2 = (bx + cx) / 2.0;
				my1 = (ay + by) / 2.0;
				my2 = (by + cy) / 2.0;
				xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
				yc = (fabsy1y2 > fabsy2y3) ? m1 * (xc - mx1) + my1 : m2 * (xc - mx2) + my2;
			}
			dx = bx - xc;
			dy = by - yc;
			return {
				x: xc,
				y: yc,
				r: Math.sqrt(dx * dx + dy * dy),
			};
		},
		mapToOsuPixels: function(x, y, toWidth, toHeight, offsetX, offsetY) {
			return {
				x: offsetX + this.map(x, 0, 512, 0, toWidth),
				y: offsetY + this.map(y, 0, 384, 0, toHeight),
			}
		},
		htmlCounter: function(digits, container, element, rootSrc, positionTag, positioning) {
			for (let i = 0; i < digits.length; i++) {
				if (document.getElementById(element + i) === null) {
					let image = new Image();
					image.id = element + i;
					document.getElementById(container).insertBefore(image, document.getElementById(container).childNodes[0]);
				}
				let image = document.getElementById(element + i);
				if (/^[0-9]+$/.test(digits[i])) {
					image.src = rootSrc + digits[i] + ".png";
				} else {
					let trueSrc = "0";
					switch (digits[i]) {
						case ".":
							trueSrc = "dot";
							break;
						case ",":
							trueSrc = "comma";
							break;
						case "%":
							trueSrc = "percent";
							break;
						case "x":
							trueSrc = "x";
							break;
					}
					image.src = rootSrc + trueSrc + ".png";
				}
			}
			document.getElementById(container).style[positionTag] = positioning;
		}
	};
});