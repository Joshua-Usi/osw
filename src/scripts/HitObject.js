define(function(require) {
	let utils = require("./utils.js");
	return class HitObject {
		constructor(x, y, time, type, hitSound, objectParams, hitSample) {
			this.x = x;
			this.y = y;
			/* convert to seconds */
			this.time = time / 1000;
			this.type = utils.reverse(utils.binary(type));
			this.hitSound = hitSound;
			this.objectParams = objectParams;
			this.hitSample = hitSample;
		}
	}
})