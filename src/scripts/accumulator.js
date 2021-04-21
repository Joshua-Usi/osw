define(function(require) {
	"use strict";
	return class Accumulator {
		constructor(callback, milliseconds, allowMultipleRuns, args) {
			this.accumulator = 0;
			this.callback = callback;
			this.milliseconds = milliseconds;
			this.allowMultipleRuns = allowMultipleRuns || false;
			this.args = args || [];
		}
		tick(deltaTime) {
			this.accumulator += deltaTime;
			if (this.allowMultipleRuns) {
				while (this.accumulator >= this.milliseconds) {
					this.accumulator -= this.milliseconds;
					this.callback(...this.args);	
				}
			} else {
				if (this.accumulator >= this.milliseconds) {
					this.accumulator -= this.milliseconds;
					this.callback(...this.args);
				}
			}
		}
		forceRun() {
			this.callback(...this.args);
		}
	}
});