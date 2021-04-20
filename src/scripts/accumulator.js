define(function(require) {
	"use strict";
	return class Accumulator {
		constructor(callback, milliseconds, allowMultipleRuns) {
			this.accumulator = 0;
			this.callback = callback;
			this.milliseconds = milliseconds;
			this.allowMultipleRuns = allowMultipleRuns || false;
		}
		tick(deltaTime) {
			this.accumulator += deltaTime;
			if (this.allowMultipleRuns) {
				while (this.accumulator >= this.milliseconds) {
					this.accumulator -= this.milliseconds;
					this.callback();	
				}
			} else {
				if (this.accumulator >= this.milliseconds) {
					this.accumulator -= this.milliseconds;
					this.callback();	
				}
			}
		}
		forceRun() {
			this.callback();
		}
	}
});