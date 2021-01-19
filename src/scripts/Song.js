define(function(require) {
  "use strict";
	class Song {
		constructor(src, bpm) {
			this.src = src;
			this.bpm = bpm;
		}
	}
	/* time in seconds */
	class Bpm {
		constructor(bpm, time) {
			this.bpm = [];
			this.time = [];
			if (typeof(bpm) === "number" && time === undefined) {
				this.bpm.push(bpm);
				this.time.push(0);
			}
			if (typeof(bpm) === "object" && typeof(time) === "object") {
				this.bpm = bpm;
				this.time = time;
			}
		}
		append(bpm, time) {
			this.bpm.push(bpm);
			this.time.push(time);
		}
		get(time) {
			if (this.bpm.length === 1 || time === undefined) {
				return this.bpm[0];
			}
			let i = 0;
			while (this.time[i] <= time) {
				i++;
			}
			return this.bpm[i - 1];
		}
	}
	return {
		create: function(src, bpm) {
			return new Song(src, bpm);
		},
		bpm: function(bpm, time) {
			return new Bpm(bpm, time);
		}
	};
});