define(function(require) {
	"use strict";
	let utils = require("./utils.js");
	return {
		HitCircle: class HitCircle {
			constructor(x, y, time, type, hitSound, objectParams, hitSample) {
				this.x = x;
				this.y = y;
				/* convert to seconds */
				this.time = time / 1000;
				this.type = utils.reverse(utils.binary(type));
				this.hitSound = hitSound;
				this.objectParams = objectParams;
				this.hitSample = hitSample;
				this.cache = {
					cacheSet: false,
					cacheSetAfterHit: false,
				};
			}
		},
		Slider: class Slider {
			constructor(x, y, time, type, hitSound, curveTypecurvePoints, slides, length, edgeSounds, edgeSets, hitSample) {
				this.x = x;
				this.y = y;
				this.time = time / 1000;
				this.type = utils.reverse(utils.binary(type));
				this.hitSound = hitSound;
				this.curveType = curveTypecurvePoints[0];
				this.curvePoints = curveTypecurvePoints.substr(1).split("|");
				/* also push hit object origin point for simplicity*/
				this.curvePoints.unshift(x + ":" + y);
				for (var i = 0; i < this.curvePoints.length; i++) {
					if (this.curvePoints[i] === "") {
						this.curvePoints.splice(i, 1);
					}
					let split = this.curvePoints[i].split(":");
					this.curvePoints[i] = {
						x: parseInt(split[0]),
						y: parseInt(split[1]),
					};
				}
				this.slides = slides;
				this.length = length;
				this.edgeSounds = edgeSounds;
				this.edgeSets = edgeSets;
				this.hitSample = hitSample;
				this.cache = {
					cacheSet: false,
					cacheSetAfterHit: false,
				};
			}
		},
		Spinner: class Spinner {
			constructor(x, y, time, type, hitSound, endTime, hitSample) {
				this.x = x;
				this.y = y;
				/* convert to seconds */
				this.time = time / 1000;
				this.type = utils.reverse(utils.binary(type));
				this.hitSound = hitSound;
				this.endTime = endTime / 1000;
				this.hitSample = hitSample;
				this.cache = {
					cacheSet: false,
					cacheSetAfterHit: false,
				};
			}
		},
		TimingPoint: class TimingPoint {
			constructor(time, beatLength, meter, sampleSet, sampleIndex, volume, uninherited, effects) {
				this.time = time / 1000;
				this.beatLength = beatLength / 1000;
				if (uninherited === 0) {
					this.beatLength *= 1000;
				}
				this.meter = meter;
				this.sampleSet = sampleSet;
				this.sampleIndex = sampleIndex;
				this.volume = volume;
				this.uninherited = uninherited;
				this.effects = effects;
			}
		},
		ScoreObject: class ScoreObject {
			constructor(score, x, y, initialTime, lifetime) {
				this.score = score;
				this.x = x;
				this.y = y;
				this.initialTime = initialTime;
				this.lifetime = lifetime;
			}
		},
		EffectObject: class EffectObject {
			constructor(src, x, y, initialTime, lifetime) {
				this.src = src;
				this.x = x;
				this.y = y;
				this.initialTime = initialTime;
				this.lifetime = lifetime;
			}
		},
		Event: class HitEvent {
			constructor(type, score, combo, x, y) {
				this.type = type;
				this.score = score;
				this.combo = combo;
				this.x = x;
				this.y = y;
			}
		},
		MouseReplayEvent: class MouseReplayEvent {
			constructor(x, y, time) {
				this.type = "mouse";
				this.time = time;
				this.x = x;
				this.y = y;
			}
		},
		KeyboardReplayEvent: class KeyboardReplayEvent {
			constructor(key, state, time) {
				this.type = "keyboard";
				this.time = time;
				this.key = key;
				this.state = state;
			}
		}
	};
});