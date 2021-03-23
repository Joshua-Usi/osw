define(function(require) {
	"use strict";
	return {
		/* View in fullscreen */
		openFullscreen: function() {
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				/* Safari */
				document.documentElement.webkitRequestFullscreen();
			} else if (document.documentElement.msRequestFullscreen) {
				/* IE11 */
				document.documentElement.msRequestFullscreen();
			}
		},
		/* Close fullscreen */
		closeFullscreen: function() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				/* Safari */
				document.webkitExitFullscreen();
			} else if (document.msExitFullscreen) {
				/* IE11 */
				document.msExitFullscreen();
			}
		},
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
		removeInstances: function(str, items) {
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
		// To find orientation of ordered triplet (p1, p2, p3). 
		// The function returns following values 
		// 0 --> p, q and r are colinear 
		// 1 --> Clockwise 
		// 2 --> Counterclockwise 
		orientation: function(p1, p2, p3) {
			let val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
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
			for (let i = 0; i < 360; i += 1) {
				points.push({
					x: x + Math.cos(startingAngle + direction * i * Math.PI / 180) * r,
					y: y + Math.sin(startingAngle + direction * i * Math.PI / 180) * r,
				});
				if (i >= 1) {
					totalLength += this.dist(points[i].x, points[i].y, points[i - 1].x, points[i - 1].y);
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
			};
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
		},
		standardDeviation: function(arr, usePopulation) {
			if (usePopulation === undefined) {
				usePopulation = false;
			}
			if (arr.length === 1) {
				return arr[0];
			}
			const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
			return Math.sqrt(arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) / (arr.length - (usePopulation ? 0 : 1)));
		},
		sum: function(array, maxIndex) {
			let len = array.length;
			if (maxIndex) {
				len = maxIndex;
			}
			let sum = 0;
			for (let i = 0; i < len; i++) {
				sum += array[i];
			}
			return sum;
		},
		mean: function(array) {
			let sum = 0;
			for (let i = 0; i < array.length; i++) {
				sum += array[i];
			}
			return sum / array.length;
		},
		camelCaseToDash(string) {
			return string.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
		}
	};
});