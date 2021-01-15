/*	Courtesy http://html5tutorial.com/how-to-draw-n-grade-bezier-curve-with-canvas-api/ 
 *	due to substantial use of original code:
 */
/* 
 *	The MIT License (MIT)
 *	
 *	Copyright (c) 2012 Scriptoid
 *	Permission is hereby granted, free of charge, to any person obtaining a copy 
 *	of this software and associated documentation files (the "Software"), to deal 
 *	in the Software without restriction, including without limitation the rights 
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
 *	of the Software, and to permit persons to whom the Software is furnished to 
 *	do so, subject to the following conditions:
 *	The above copyright notice and this permission notice shall be included in 
 *	all copies or substantial portions of the Software.
 * 
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * 	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * 	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 *	SOFTWARE.
 * 
 *	@author Alex Gheorghiu <alex at scriptoid dot com>
 */
define(function(require) {
	console.log("bezier");

	function distance(a, b) {
		return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
	}
	/** Computes factorial*/
	function fact(k) {
		let total = 1;
		for (let i = 2; i <= k; i++) {
			total *= i;
		}
		return total;
	}
	/**	Computes Bernstain
	 *	@param {Integer} i - the i-th index
	 *	@param {Integer} n - the total number of points
	 *	@param {Number} t - the value of parameter t , between 0 and 1
	 **/
	function B(i, n, t) {
		return fact(n) / (fact(i) * fact(n - i)) * Math.pow(t, i) * Math.pow(1 - t, n - i);
	}
	/** Computes a point's coordinates for a value of t
	 *	@param {Number} t - a value between o and 1
	 *	@param {Array} points - an {Array} of [x,y] coodinates. The initial points
	 **/
	function P(t, points) {
		let r = [0, 0];
		let n = points.length - 1;
		for (let i = 0; i <= n; i++) {
			r[0] += points[i][0] * B(i, n, t);
			r[1] += points[i][1] * B(i, n, t);
		}
		return r;
	}
	/** Computes the drawing/support points for the Bezier curve*/
	function computeSupportPoints(points) {
		/** Compute the incremental step*/
		let tLength = 0;
		for (let i = 0; i < points.length - 1; i++) {
			tLength += distance(points[i], points[i + 1]);
		}
		let step = (points.length / 10) / tLength;
		// compute the support points
		let temp = [];
		for (let t = 0; t <= 1; t = t + step) {
			let p = P(t, points);
			temp.push(p);
		}
		return temp;
	}
	/* Draws a N grade bezier curve from current point on the context */
	return function bezier(startX, startY, points) {
		// transform initial arguments into an {x: n, y: n} of [x,y] coordinates
		let initialPoints = [[startX, startY]];
		for (let i = 0; i < points.length; i++) {
			initialPoints.push([points[i].x, points[i].y]);
		}
		return computeSupportPoints(initialPoints);
	}
});