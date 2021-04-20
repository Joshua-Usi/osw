define(function(require) {
	"use strict";
	/* RequireJS Module Loading */
	const Formulas = require("./formulas.js");
	const Mouse = require("./mouse.js");
	const Keyboard = require("./keyboard.js");
	const beatmap = require("./defaultBeatMaps.js");
	const Bezier = require("./bezier.js");
	const utils = require("./utils.js");
	const HitObject = require("./hitObjects.js");
	const HitEvent = require("./hitEvent.js");
	const Assets = require("./gameplayAssets.js");
	const Canvas = require("./canvas.js");
	const skin = require("./defaultSkin.js");
	const PlayDetails = require("./playDetails.js");
	const endScreen = require("./endScreen.js");
	let loadedMaps;
	(function loadMaps() {
		if (beatmap.allMapsLoaded() === true) {
			loadedMaps = beatmap.get();
		} else {
			requestAnimationFrame(loadMaps);
		}
	})();
	let useBeatmapSet;
	let useBeatmap;
	/* canvas setup */
	let canvas = new Canvas("gameplay");
	canvas.setHeight(window.innerHeight);
	canvas.setWidth(window.innerWidth);
	let ctx = canvas.context;
	canvas.setFillStyle("#fff");
	let isRunning = false;
	/* inputs setup */
	let mouse = new Mouse("body", 30);
	let keyboard = new Keyboard("body");
	mouse.setPosition(window.innerWidth / 2, window.innerHeight / 2);
	mouse.init();
	mouse.sensitivity = 1;
	mouse.positionBound(0, 0, window.innerWidth, window.innerHeight);
	let mouseSize = 1;
	keyboard.init();
	let keyboardLeftReleased = false;
	let keyboardRightReleased = false;
	/* Details about the play, including replays */
	let playDetails;
	let currentHitObject = 0;
	let hitEvents = [];
	let hitObjects = [];
	let hitErrors = [];
	let scoreObjects = [];
	let effectObjects = [];
	/* Playfield calculations and data */
	let playfieldSize = 0.8;
	let playfieldXOffset = 0;
	let playfieldYOffset = window.innerHeight / 50;
	/* HP values */
	let currentHP = 1;
	let hpDisplay = 1;
	let previousTime = 0;
	/* Timing point indexes */
	let timingPointUninheritedIndex = 0;
	let currentTimingPoint = 0;
	/* Score letiables */
	let scoreMultiplier = 1;
	let score = 0;
	let displayedScore = 0;
	/* Combo letiables */
	let combo = 0;
	let highestCombo = 0;
	let currentComboNumber = 1;
	let currentComboColour = 0;
	let comboPulseSize = 1;
	/* spinner tests */
	let previousSigns = [];
	let angleChange = 0;
	let previousAngle = 0;
	let angle = 0;
	/* Audio letiables */
	let backupStartTime = 0;
	let audio = new Audio();
	let audioFailedToLoad = false;
	/* combo colour tints*/
	let hitCircleComboBuffers = [];
	let approachCircleComboBuffers = [];
	/* 	attempting to run in offline on a chromebook causes audio loading errors
	 *	switch to performance.now instead
	 */
	audio.addEventListener("error", function() {
		audioFailedToLoad = true;
		backupStartTime = window.performance.now();
		console.warn("failed to load audio, switching to window.performance for timing");
	});
	audio.addEventListener("canplaythrough", function() {
		audio.play();
	});
	// audio.addEventListener("ended", function() {
		
	// });
	/* Beatmap difficulty data constants */
	let arTime;
	let arFadeIn;
	let circleDiameter;
	let difficultyMultiplier;
	let odTime;
	/* osu constants */
	let followCircleSize = 2;
	let approachCircleMaxSize = 5;
	let approachCircleMinSize = 1.4;
	let hiddenFadeInPercent = 0.4;
	let hiddenFadeOutPercent = 0.7;
	let sliderStrokeSize = 0.9;
	let hitObjectOffsetX = playfieldXOffset + window.innerWidth / 2 - window.innerHeight * playfieldSize * (4 / 3) / 2;
	let hitObjectOffsetY = playfieldYOffset + window.innerHeight / 2 - window.innerHeight * playfieldSize / 2;

	function setHitObjectCache(hitObject, useTime, hitObjectOffsetX, hitObjectOffsetY) {
		/* Cache Setup */
		let sliderSpeedMultiplier = loadedMaps[useBeatmapSet][useBeatmap].SliderMultiplier;
		if (hitObject.cache.cacheSet === false) {
			/* Immediate Cache Setup */
			hitObject.cache.comboNumber = currentComboNumber;
			hitObject.cache.comboColour = currentComboColour;
			currentComboNumber++;
			if (hitObject.type[0] === "1") {
				/* Cache Setup for HitCircle */
				hitObject.cache.cacheSet = true;
			} else if (hitObject.type[1] === "1") {
				hitObject.cache.cacheSet = true;
				/* Cache Setup for Slider */
				hitObject.cache.hitHead = false;
				hitObject.cache.hitEnd = false;
				hitObject.cache.onFollowCircle = false;
				hitObject.cache.hasHitAtAll = false;
				hitObject.cache.hasEnded = false;
				hitObject.cache.sliderFollowCirclePosition = 0;
				hitObject.cache.sliderFollowCircleSize = 0;
				hitObject.cache.currentSlide = 0;
				hitObject.cache.sliderTicksHit = 0;
				hitObject.cache.repeatsHit = 0;
				hitObject.cache.points = [];
				hitObject.cache.timingPointUninheritedIndex = timingPointUninheritedIndex;
				/* Precalculate Slider Curve Points */
				/* Calculate Slider Points */
				if (hitObject.curveType === "B" || hitObject.curveType === "C" || hitObject.curveType === "L") {
					/* Slider Type Bezier, Catmull and Linear */
					/* determine slider red / white anchor */
					let bezierTemp = [];
					for (let j = 0; j < hitObject.curvePoints.length; j++) {
						if (hitObject.curvePoints[j + 1] && hitObject.curvePoints[j].x === hitObject.curvePoints[j + 1].x && hitObject.curvePoints[j].y === hitObject.curvePoints[j + 1].y) {
							bezierTemp.push(hitObject.curvePoints[j]);
							let point = Bezier(bezierTemp);
							for (let k = 0; k < point.length - 1; k++) {
								hitObject.cache.points.push(point[k]);
							}
							bezierTemp = [];
						} else {
							bezierTemp.push(hitObject.curvePoints[j]);
						}
					}
					let point = Bezier(bezierTemp);
					for (let k = 0; k < point.length; k++) {
						hitObject.cache.points.push(point[k]);
					}
					bezierTemp = [];
				} else if (hitObject.curveType === "P" && hitObject.curvePoints.length === 3) {
					/* Slider Type Perfect Circle */
					let circle = utils.circumcircle(hitObject.curvePoints[0], hitObject.curvePoints[1], hitObject.curvePoints[2]);
					hitObject.cache.points = utils.circleToPoints(circle.x, circle.y, circle.r, Math.abs(hitObject.length), -utils.direction(circle.x, circle.y, hitObject.curvePoints[0].x, hitObject.curvePoints[0].y) - Math.PI / 2, utils.orientation(hitObject.curvePoints[0], hitObject.curvePoints[1], hitObject.curvePoints[2]));
				}
			} else if (hitObject.type[3] === "1") {
				hitObject.cache.cacheSet = true;
				/* Cache Setup for Spinner */
				hitObject.cache.spins = 0;
				/* in rad/s */
				hitObject.cache.velocity = 0;
				hitObject.cache.spinnerBonus = false;
				hitObject.cache.currentAngle = 0;
				hitObject.cache.spinAngle = 0;
				hitObject.cache.timeSpentAboveSpinnerMinimum = 0;
				hitObject.cache.cleared = false;
			}
		}
		/* inherited timing point */
		if (loadedMaps[useBeatmapSet][useBeatmap].timingPoints[currentTimingPoint].uninherited === 0) {
			sliderSpeedMultiplier *= Formulas.sliderMultiplier(loadedMaps[useBeatmapSet][useBeatmap].timingPoints[currentTimingPoint].beatLength);
		}
		/* Cache Setup */
		if (useTime >= hitObject.time) {
			/* Cache Setup After Object Hit Time */
			if (hitObject.type[0] === "1" && hitObject.cache.cacheSetAfterHit === false) {
				/* Cache Setup for HitCircle */
				hitObject.cache.cacheSetAfterHit = true;
			} else if (hitObject.type[1] === "1" && hitObject.cache.cacheSetAfterHit === false) {
				hitObject.cache.cacheSetAfterHit = true;
				/* Cache Setup for Slider */
				hitObject.cache.sliderInheritedMultiplier = sliderSpeedMultiplier;
				hitObject.cache.timingPointUninheritedIndex = timingPointUninheritedIndex;
				hitObject.cache.sliderOnceTime = Math.abs(hitObject.length) / (hitObject.cache.sliderInheritedMultiplier * 100) * loadedMaps[useBeatmapSet][useBeatmap].timingPoints[hitObject.cache.timingPointUninheritedIndex].beatLength;
				hitObject.cache.sliderTotalTime = hitObject.cache.sliderOnceTime * hitObject.slides;
				let time = Math.abs(hitObject.length) / (hitObject.cache.sliderInheritedMultiplier * 100) * loadedMaps[useBeatmapSet][useBeatmap].timingPoints[hitObject.cache.timingPointUninheritedIndex].beatLength;
				/* Actual ticks is -1 due to unexplicable phenomenon */
				hitObject.cache.totalTicks = time / loadedMaps[useBeatmapSet][useBeatmap].timingPoints[hitObject.cache.timingPointUninheritedIndex].beatLength * loadedMaps[useBeatmapSet][useBeatmap].SliderTickRate;
				hitObject.cache.specificSliderTicksHit = [];
				for (let j = 0; j < hitObject.slides; j++) {
					let tempArray = [];
					for (let k = 0; k < hitObject.cache.totalTicks - 1; k++) {
						tempArray.push(false);
					}
					hitObject.cache.specificSliderTicksHit.push(tempArray);
				}
				hitObject.cache.specificSliderTicksPosition = [];
				let inc = hitObject.cache.points.length / (hitObject.cache.totalTicks);
				for (let j = 0; j < hitObject.slides; j++) {
					let tempArray = [];
					if (j % 2 === 0) {
						for (let k = 0; k < hitObject.cache.points.length; k += inc) {
							if (Math.floor(k) !== 0) {
								tempArray.push(Math.floor(k));
							}
						}
					} else {
						for (let k = hitObject.cache.points.length - 1; k >= 0; k -= inc) {
							if (Math.floor(k) !== hitObject.cache.points.length - 1) {
								tempArray.push(Math.floor(k));
							}
						}
					}
					hitObject.cache.specificSliderTicksPosition.push(tempArray);
				}
				hitObject.cache.totalTicks = hitObject.cache.specificSliderTicksPosition[0].length;
			} else if (hitObject.type[3] === "1" && hitObject.cache.cacheSetAfterHit === false) {
				hitObject.cache.cacheSetAfterHit = true;
				/* Cache Setup for Spinner */
			}
		}
	}

	function processHitObject(hitObject, useTime, previousTime, index, hitObjectOffsetX, hitObjectOffsetY) {
		let hasSpliced = false;
		let hitObjectMapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
		if (playDetails.mods.auto) {
			if (index === 0) {
				if ((hitObject.cache.hasHitAtAll === false || hitObject.cache.hasHitAtAll === undefined) && hitObject.type[3] !== "1") {
					mouse.changePosition((hitObjectMapped.x - mouse.position.x) / 8, (hitObjectMapped.y - mouse.position.y) / 8);
				}
			}
			if (hitObject.type[0] === "1" && useTime >= hitObject.time) {
				mouse.setPosition(hitObjectMapped.x, hitObjectMapped.y);
				keyboard.emulateKeyDown("z");
			}
			if (hitObject.type[1] === "1" && useTime >= hitObject.time) {
				let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
				mouse.setPosition(sliderFollowCirclePos.x, sliderFollowCirclePos.y);
				keyboard.emulateKeyDown("z");
			}
			if (hitObject.type[3] === "1" && useTime >= hitObject.time) {
				angleChange = 50;
				mouse.setPosition(hitObjectMapped.x + 100 * Math.cos(hitObject.cache.currentAngle), hitObjectMapped.y + 100 * Math.sin(hitObject.cache.currentAngle));
				keyboard.emulateKeyDown("z");
			}
		}
		/* Hit Circle Hit Handling */
		if (hitObject.type[0] === "1" && utils.dist(mouse.position.x, mouse.position.y, hitObjectMapped.x, hitObjectMapped.y) <= circleDiameter / 2 && ((keyboard.getKeyDown("z") && keyboardLeftReleased) || (keyboard.getKeyDown("x") && keyboardRightReleased))) {
			if (keyboard.getKeyDown("z") && keyboardLeftReleased) {
				keyboardLeftReleased = false;
			}
			if (keyboard.getKeyDown("x") && keyboardRightReleased) {
				keyboardRightReleased = false;
			}
			let hitWindowScore = 0;
			if (utils.withinRange(useTime, hitObject.time, odTime[0])) {
				if (utils.withinRange(useTime, hitObject.time, odTime[2])) {
					hitWindowScore = 300;
				} else if (utils.withinRange(useTime, hitObject.time, odTime[1])) {
					hitWindowScore = 100;
				} else if (utils.withinRange(useTime, hitObject.time, odTime[0])) {
					hitWindowScore = 50;
				}
				hitErrors.push(useTime - hitObject.time);
				hitObject.cache.hasHit = true;
				hitObject.cache.hitTime = useTime;
				hitEvents.push(new HitEvent("hit-circle", hitWindowScore, "increasing", hitObjectMapped.x, hitObjectMapped.y));
				effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
				effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
			} else {
				hitEvents.push(new HitEvent("hit-circle", 0, "reset", hitObjectMapped.x, hitObjectMapped.y));
			}
			hitObjects.splice(index, 1);
			hasSpliced = true;
			return hasSpliced;
		}
		/* Slider Follow Circle Handling */
		if (hitObject.type[1] === "1" && useTime >= hitObject.time) {
			hitObject.cache.sliderFollowCircleSize += (1 - hitObject.cache.sliderFollowCircleSize) / 8;
			if (hitObject.cache.currentSlide < hitObject.slides) {
				let sliderRepeat = false;
				let time = Math.abs(hitObject.length) / (hitObject.cache.sliderInheritedMultiplier * 100) * loadedMaps[useBeatmapSet][useBeatmap].timingPoints[hitObject.cache.timingPointUninheritedIndex].beatLength;
				if (hitObject.cache.currentSlide % 2 === 0) {
					hitObject.cache.sliderFollowCirclePosition = Math.floor(utils.map(useTime, hitObject.time + time * hitObject.cache.currentSlide, hitObject.time + time * (hitObject.cache.currentSlide + 1), 0, hitObject.cache.points.length - 1));
					/* Prevent Index Errors */
					if (hitObject.cache.sliderFollowCirclePosition <= 0) {
						hitObject.cache.sliderFollowCirclePosition = 0;
					}
					/* Check if slider repeats, then switch direction */
					if (hitObject.cache.sliderFollowCirclePosition >= hitObject.cache.points.length - 1) {
						hitObject.cache.sliderFollowCirclePosition = hitObject.cache.points.length - 1;
						sliderRepeat = true;
					}
					/* Check if slider follow circle went over slider ticks */
					for (let j = 0; j < hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide].length; j++) {
						if (hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j] === false && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
							let mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].x, hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
							let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
							if (utils.dist(mapped.x, mapped.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter / 4 && utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter * followCircleSize / 2 && hitObject.cache.onFollowCircle) {
								hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j] = true;
								hitObject.cache.sliderTicksHit++;
								hitObject.cache.sliderFollowCircleSize += 0.125;
								hitEvents.push(new HitEvent("slider-tick", 10, "increasing", mapped.x, mapped.y));
							}
						}
					}
					let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
					if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter * followCircleSize / 2 && hitObject.cache.onFollowCircle && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
						hitObject.cache.onFollowCircle = true;
					} else if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter / 2 && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
						hitObject.cache.onFollowCircle = true;
					} else {
						hitObject.cache.onFollowCircle = false;
					}
				} else if (hitObject.cache.currentSlide % 2 === 1) {
					hitObject.cache.sliderFollowCirclePosition = Math.floor(utils.map(useTime, hitObject.time + time * hitObject.cache.currentSlide, hitObject.time + time * (hitObject.cache.currentSlide + 1), hitObject.cache.points.length - 1, 0));
					/* Prevent Index Errors */
					if (hitObject.cache.sliderFollowCirclePosition >= hitObject.cache.points.length - 1) {
						hitObject.cache.sliderFollowCirclePosition = hitObject.cache.points.length - 1;
					}
					/* Check if Slider Repeats, then switch direction */
					if (hitObject.cache.sliderFollowCirclePosition <= 0) {
						hitObject.cache.sliderFollowCirclePosition = 0;
						sliderRepeat = true;
					}
					/* Check if slider follow circle went over slider ticks */
					for (let j = 0; j < hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide].length; j++) {
						if (hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j] === false && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
							let mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].x, hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
							let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
							if (utils.dist(mapped.x, mapped.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter / 4 && utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter * followCircleSize / 2 && hitObject.cache.onFollowCircle) {
								hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j] = true;
								hitObject.cache.sliderTicksHit++;
								hitObject.cache.sliderFollowCircleSize += 0.125;
								hitEvents.push(new HitEvent("slider-tick", 10, "increasing", mapped.x, mapped.y));
							}
						}
					}
					let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
					if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter * followCircleSize / 2 && hitObject.cache.onFollowCircle && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
						hitObject.cache.onFollowCircle = true;
					} else if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter / 2 && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
						hitObject.cache.onFollowCircle = true;

					} else {
						hitObject.cache.onFollowCircle = false;
					}
				}
				if (sliderRepeat) {
					hitObject.cache.currentSlide++;
					if (hitObject.cache.currentSlide < hitObject.slides) {
						let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
						if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter * followCircleSize / 2 && hitObject.cache.onFollowCircle && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
							hitObject.cache.repeatsHit++;
							hitEvents.push(new HitEvent("slider-element", 30, "increasing", sliderFollowCirclePos.x));
							effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], sliderFollowCirclePos.x, sliderFollowCirclePos.y, useTime, useTime + 0.2));
							effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, sliderFollowCirclePos.x, sliderFollowCirclePos.y, useTime, useTime + 0.2));
						} else if (hitObject.cache.currentSlide < hitObject.slides) {
							hitEvents.push(new HitEvent("slider-element-miss", 0, "reset", sliderFollowCirclePos.x, sliderFollowCirclePos.y));
						}
					}
				}
			} else {
				hitObject.cache.hasEnded = true;
				if (hitObject.cache.currentSlide % 2 === 0) {
					if (utils.dist(mouse.position.x, mouse.position.y, hitObject.cache.points[0].x, hitObject.cache.points[0].y) <= circleDiameter / 2) {
						hitObject.cache.hitEnd = true;
						hitObject.cache.hasHitAtAll = true;
					}
				} else if (hitObject.cache.currentSlide % 2 === 1) {
					if (utils.dist(mouse.position.x, mouse.position.y, hitObject.cache.points[hitObject.cache.points.length - 1].x, hitObject.cache.points[hitObject.cache.points.length - 1].y) <= circleDiameter / 2) {
						hitObject.cache.hitEnd = true;
						hitObject.cache.hasHitAtAll = true;
					}
				}
			}
		}
		/* Slider Head Hit Handling */
		if (hitObject.type[1] === "1" && hitObject.cache.hitHead === false && utils.dist(mouse.position.x, mouse.position.y, hitObjectMapped.x, hitObjectMapped.y) <= circleDiameter / 2 && ((keyboard.getKeyDown("z") && keyboardLeftReleased) || (keyboard.getKeyDown("x") && keyboardRightReleased)) && utils.withinRange(useTime, hitObject.time, odTime[0])) {
			if (keyboard.getKeyDown("z") && keyboardLeftReleased) {
				keyboardLeftReleased = false;
			}
			if (keyboard.getKeyDown("x") && keyboardRightReleased) {
				keyboardRightReleased = false;
			}
			hitErrors.push(useTime - hitObject.time);
			hitEvents.push(new HitEvent("slider-element", 30, "increasing", hitObjectMapped.x, hitObjectMapped.y));
			effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
			effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
			hitObject.cache.hitHead = true;
			hitObject.cache.hasHitAtAll = true;
		}
		/* Slider Tick Miss Check */
		/* todo */
		/* Slider Score Calculations */
		if (hitObject.type[1] === "1" && hitObject.cache.hasEnded) {
			let sliderElementsHit = 0;
			/* 1 head */
			/* 1 end */
			/* 1 follow circle */
			/* n repeats */
			/* m * n ticks */
			let totalSliderElements = 1 + hitObject.slides + hitObject.slides * hitObject.cache.totalTicks;
			if (hitObject.cache.hitHead) {
				sliderElementsHit++;
			}
			if (hitObject.cache.hitEnd) {
				sliderElementsHit++;
			}
			if (hitObject.cache.onFollowCircle) {
				sliderElementsHit++;
			}
			sliderElementsHit += hitObject.cache.repeatsHit;
			for (let j = 0; j < hitObject.cache.specificSliderTicksHit.length; j++) {
				for (let k = 0; k < hitObject.cache.specificSliderTicksHit[j].length; k++) {
					if (hitObject.cache.specificSliderTicksHit[j][k]) {
						sliderElementsHit++;
					}
				}
			}
			let mapped;
			if (hitObject.slides % 2 === 0) {
				mapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
			} else {
				mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.points.length - 1].x, hitObject.cache.points[hitObject.cache.points.length - 1].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
			}
			let hitScore = 0;
			if (sliderElementsHit >= totalSliderElements) {
				hitScore = 300;
			} else if (sliderElementsHit >= 0.5 * totalSliderElements) {
				hitScore = 100;
			} else if (sliderElementsHit > 0) {
				hitScore = 50;
			}
			if (hitScore !== 0) {
				hitEvents.push(new HitEvent("hit-circle", hitScore, "increasing", mapped.x, mapped.y));
				effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], mapped.x, mapped.y, useTime, useTime + 0.2));
				effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, mapped.x, mapped.y, useTime, useTime + 0.2));
			} else {
				hitEvents.push(new HitEvent("hit-circle", 0, "reset", mapped.x, mapped.y));
			}
			hitObjects.splice(index, 1);
			hasSpliced = true;
			return hasSpliced;
		}
		/* Miss (Outside OD window) calculation */
		let miss = false;
		let mapped = hitObjectMapped;
		if (hitObject.type[0] === "1" && useTime >= hitObject.time + odTime[0] / 2) {
			miss = true;
		} else if (hitObject.type[1] === "1" && hitObject.cache.hasEnded && hitObject.cache.hasHitAtAll === false) {
			miss = true;
			let mapped;
			if (hitObject.slides % 2 === 0) {
				mapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
			} else {
				mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.points.length - 1].x, hitObject.cache.points[hitObject.cache.points.length - 1].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
			}
		}
		if (miss) {
			hitEvents.push(new HitEvent("hit-circle", 0, "reset", mapped.x, mapped.y));
			hitObjects.splice(index, 1);
			hasSpliced = true;
			return hasSpliced;
		}
		/* Spinner handling */
		if (hitObject.type[3] === "1") {
			hitObject.cache.velocity += (angleChange - hitObject.cache.velocity) / 32;
			hitObject.cache.currentAngle += hitObject.cache.velocity * (useTime - previousTime);
			hitObject.cache.spinAngle += hitObject.cache.velocity * (useTime - previousTime);
			if ((keyboard.getKeyDown("z") || keyboard.getKeyDown("x")) && Math.abs(hitObject.cache.velocity / (Math.PI)) >= Formulas.ODSpinner(loadedMaps[useBeatmapSet][useBeatmap].OverallDifficulty, playDetails.mods)) {
				hitObject.cache.timeSpentAboveSpinnerMinimum += useTime - previousTime;
			}
			if (hitObject.cache.timeSpentAboveSpinnerMinimum >= (hitObject.endTime - hitObject.time) * 0.25) {
				hitObject.cache.cleared = true;
			}
			while (hitObject.cache.spinAngle >= Math.PI * 2 && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
				hitObject.cache.spins++;
				hitObject.cache.spinAngle -= Math.PI * 2;
				if (hitObject.cache.cleared === false) {
					hitEvents.push(new HitEvent("spinner-spin", 100, "no-increase", mapped.x, mapped.y));
				} else {
					hitEvents.push(new HitEvent("spinner-bonus-spin", 1000, "no-increase", mapped.x, mapped.y));
				}
			}
			while (hitObject.cache.spinAngle <= -Math.PI * 2 && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
				hitObject.cache.spins++;
				hitObject.cache.spinAngle += Math.PI * 2;
				if (hitObject.cache.cleared === false) {
					hitEvents.push(new HitEvent("spinner-spin", 100, "no-increase", mapped.x, mapped.y));
				} else {
					hitEvents.push(new HitEvent("spinner-bonus-spin", 1000, "no-increase", mapped.x, mapped.y));
				}
			}
		}
		/* Spinner end handling */
		if (hitObject.type[3] === "1" && useTime >= hitObject.endTime) {
			let mapped = utils.mapToOsuPixels(256, 192, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
			if (hitObject.cache.cleared) {
				hitEvents.push(new HitEvent("hit-circle", 300, "increasing", mapped.x, mapped.y));
			} else if (hitObject.cache.timeSpentAboveSpinnerMinimum >= (hitObject.endTime - hitObject.time) * 0.25 * 0.75) {
				hitEvents.push(new HitEvent("hit-circle", 100, "increasing", mapped.x, mapped.y));
			} else if (hitObject.cache.timeSpentAboveSpinnerMinimum >= (hitObject.endTime - hitObject.time) * 0.25 * 0.25) {
				hitEvents.push(new HitEvent("hit-circle", 50, "increasing", mapped.x, mapped.y));
			} else if (hitObject.cache.timeSpentAboveSpinnerMinimum < (hitObject.endTime - hitObject.time) * 0.25 * 0.25) {
				hitEvents.push(new HitEvent("hit-circle", 0, "reset", mapped.x, mapped.y));
			}
			hitObjects.splice(index, 1);
			hasSpliced = true;
			return hasSpliced;
		}
		if (playDetails.mods.auto) {
			keyboard.emulateKeyUp("z");
		}
		if (keyboard.getKeyDown("z") === false) {
			keyboardLeftReleased = true;
		}
		if (keyboard.getKeyDown("x") === false) {
			keyboardRightReleased = true;
		}
		return hasSpliced;
	}

	function renderHitObject(hitObject, useTime, hitObjectOffsetX, hitObjectOffsetY) {
		/* Approach Circle Calculations */
		let approachCircleSize = utils.map(useTime - (hitObject.time - arTime), 0, arTime, approachCircleMaxSize, approachCircleMinSize);
		let hitObjectMapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
		/* approach circle max size */
		if (approachCircleSize > approachCircleMaxSize) {
			approachCircleSize = approachCircleMaxSize;
		}
		/* approach circle min size */
		if (approachCircleSize < approachCircleMinSize) {
			approachCircleSize = approachCircleMinSize;
		}
		/* Alpha Calculations */
		if (hitObject.type[0] === "1") {
			if (playDetails.mods.hidden) {
				/* hidden fade in and out for hit circle */
				if (utils.map(useTime - (hitObject.time - arTime), 0, arTime, 0, 1) <= hiddenFadeInPercent) {
					canvas.setGlobalAlpha(utils.map(useTime - (hitObject.time - arTime), 0, arTime * hiddenFadeInPercent, 0, 1));
				} else if (utils.map(useTime - (hitObject.time - arTime), 0, arTime, 0, 1) <= hiddenFadeOutPercent) {
					canvas.setGlobalAlpha(utils.map(useTime - (hitObject.time - arTime), arTime * hiddenFadeInPercent, arTime * hiddenFadeOutPercent, 1, 0));
				} else {
					/* if fully transparent, don't bother rendering */
					return;
				}
			} else {
				/* normal fade in and out for hit circle */
				if (utils.map(useTime - (hitObject.time - arTime), 0, arTime, 0, 1) <= 1) {
					canvas.setGlobalAlpha(utils.map(useTime - (hitObject.time - arTime), 0, arFadeIn, 0, 1));
				} else {
					let alpha = utils.map(useTime - (hitObject.time - arTime), arTime, arTime + odTime[0] / 2, 1, 0);
					if (alpha <= 0) {
						alpha = 0;
					}
					canvas.setGlobalAlpha(alpha);
				}
			}
		} else if (hitObject.type[1] === "1") {
			if (utils.map(useTime - (hitObject.time - arTime), 0, arTime, 0, 1) <= 1) {
				canvas.setGlobalAlpha(utils.map(useTime - (hitObject.time - arTime), 0, arFadeIn, 0, 1));
			} else {
				canvas.setGlobalAlpha(1);
			}
		}
		/* Object Draw */
		if (hitObject.type[0] === "1") {
			/* Draw Hit Circle */
			canvas.drawImage(hitCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, circleDiameter, circleDiameter);
			canvas.drawImage(Assets.hitCircleOverlay, hitObjectMapped.x, hitObjectMapped.y, circleDiameter, circleDiameter);
			if (playDetails.mods.hidden === false) {
				canvas.drawImage(approachCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, circleDiameter * approachCircleSize, circleDiameter * approachCircleSize);
			}
			let individualDigits = hitObject.cache.comboNumber.toString();
			for (let j = 0; j < individualDigits.length; j++) {
				canvas.drawImage(Assets.comboNumbers[individualDigits[j]], hitObjectMapped.x - (individualDigits.length - 1) * circleDiameter / 6 + j * circleDiameter / 3, hitObjectMapped.y, circleDiameter / 3, circleDiameter / 3 * (Assets.comboNumbers[individualDigits[j]].height / Assets.comboNumbers[individualDigits[j]].width));
			}
		} else if (hitObject.type[1] === "1") {
			let sliderOpacity = utils.map(useTime, hitObject.time, hitObject.time + arTime, 1, 0);
			if (playDetails.mods.hidden === false) {
				sliderOpacity = 1;
			}
			if (sliderOpacity > 0) {
				if (useTime > hitObject.time) {
					canvas.setGlobalAlpha(sliderOpacity);
				}
				/* Draw Slider */
				let sliderDrawPercent = Math.floor(utils.map(useTime, hitObject.time - arTime, hitObject.time - arTime / 4, hitObject.cache.points.length / 4, hitObject.cache.points.length));
				if (sliderDrawPercent < Math.floor(hitObject.cache.points.length / 4)) {
					sliderDrawPercent = Math.floor(hitObject.cache.points.length / 4);
				}
				if (sliderDrawPercent > hitObject.cache.points.length - 1) {
					sliderDrawPercent = hitObject.cache.points.length - 1;
				}
				/* Slider Curve calculated the at the hitobject time - ar time */
				ctx.lineCap = "round";
				ctx.lineJoin = 'round';
				/* Draw Outer Slider Body */
				ctx.lineWidth = circleDiameter;
				canvas.setStrokeStyle("rgba(255, 255, 255, " + canvas.getGlobalAlpha() + ")");
				ctx.beginPath();
				for (let j = 0; j < sliderDrawPercent; j += 1) {
					let mapped = utils.mapToOsuPixels(hitObject.cache.points[j].x, hitObject.cache.points[j].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
					ctx.lineTo(mapped.x, mapped.y);
				}
				ctx.stroke();
				/* Draw Inner Slider Body */
				ctx.lineWidth = circleDiameter * sliderStrokeSize;
				canvas.setStrokeStyle("#222");
				ctx.beginPath();
				for (let j = 0; j < sliderDrawPercent; j += 1) {
					let mapped = utils.mapToOsuPixels(hitObject.cache.points[j].x, hitObject.cache.points[j].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
					ctx.lineTo(mapped.x, mapped.y);
				}
				ctx.stroke();
				/* Draw Slider Ticks */
				if (hitObject.cache.totalTicks >= 1 && hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide]) {
					for (let j = 0; j < hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide].length; j++) {
						if (hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j]) {
							continue;
						}
						let mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].x, hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
						canvas.drawImage(Assets.sliderScorePoint, mapped.x, mapped.y);
					}
				}
				/* Draw Slider End */
				let mapped = utils.mapToOsuPixels(hitObject.cache.points[sliderDrawPercent].x, hitObject.cache.points[sliderDrawPercent].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
				if (hitObject.slides > 1 && hitObject.cache.currentSlide < hitObject.slides - 1) {
					ctx.translate(mapped.x, mapped.y);
					ctx.rotate(-utils.direction(hitObject.cache.points[hitObject.cache.points.length - 2].x, hitObject.cache.points[hitObject.cache.points.length - 2].y, hitObject.cache.points[hitObject.cache.points.length - 1].x, hitObject.cache.points[hitObject.cache.points.length - 1].y) + Math.PI / 2);
					canvas.drawImage(hitCircleComboBuffers[hitObject.cache.comboColour], 0, 0, circleDiameter, circleDiameter);
					canvas.drawImage(Assets.reverseArrow, 0, 0, circleDiameter, circleDiameter);
					ctx.resetTransform();
				} else if (hitObject.slides === 1 || hitObject.cache.currentSlide < hitObject.slides - 2) {
					canvas.drawImage(hitCircleComboBuffers[hitObject.cache.comboColour], mapped.x, mapped.y, circleDiameter, circleDiameter);
					canvas.drawImage(Assets.hitCircleOverlay, mapped.x, mapped.y, circleDiameter, circleDiameter);
				}
				/* Draw Slider Head */
				if (hitObject.cache.hasHitAtAll === false || (hitObject.cache.currentSlide === hitObject.slides - 1 && hitObject.slides > 1)) {
					canvas.drawImage(hitCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, circleDiameter, circleDiameter);
					canvas.drawImage(Assets.hitCircleOverlay, hitObjectMapped.x, hitObjectMapped.y, circleDiameter, circleDiameter);
					if (hitObject.cache.currentSlide === 0) {
						if (playDetails.mods.hidden === false) {
							canvas.drawImage(approachCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, circleDiameter * approachCircleSize, circleDiameter * approachCircleSize);
						}
						let individualDigits = hitObject.cache.comboNumber.toString();
						for (let j = 0; j < individualDigits.length; j++) {
							canvas.drawImage(Assets.comboNumbers[individualDigits[j]], hitObjectMapped.x - (individualDigits.length - 1) * circleDiameter / 6 + j * circleDiameter / 3, hitObjectMapped.y, circleDiameter / 3, circleDiameter / 3 * (Assets.comboNumbers[individualDigits[j]].height / Assets.comboNumbers[individualDigits[j]].width));
						}
					}
				} else if (hitObject.cache.currentSlide >= 1 && hitObject.cache.currentSlide < hitObject.slides - 1) {
					let mapped = utils.mapToOsuPixels(hitObject.cache.points[0].x, hitObject.cache.points[0].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
					ctx.translate(mapped.x, mapped.y);
					ctx.rotate(-utils.direction(hitObject.cache.points[1].x, hitObject.cache.points[1].y, hitObject.cache.points[0].x, hitObject.cache.points[0].y) + Math.PI / 2);
					canvas.drawImage(hitCircleComboBuffers[hitObject.cache.comboColour], 0, 0, circleDiameter, circleDiameter);
					canvas.drawImage(Assets.reverseArrow, 0, 0, circleDiameter, circleDiameter);
					ctx.resetTransform();
				}
			}
			if (hitObject.cache.sliderFollowCirclePosition !== undefined && useTime >= hitObject.time) {
				let mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
				let tempAlpha = canvas.getGlobalAlpha();
				canvas.setGlobalAlpha(1);
				canvas.drawImage(Assets.sliderBody, mapped.x, mapped.y, circleDiameter, circleDiameter);
				if (hitObject.cache.onFollowCircle) {
					canvas.drawImage(Assets.sliderFollowCircle, mapped.x, mapped.y, circleDiameter * followCircleSize * hitObject.cache.sliderFollowCircleSize, circleDiameter * followCircleSize * hitObject.cache.sliderFollowCircleSize);
				}
				canvas.setGlobalAlpha(tempAlpha);
			}
		} else if (hitObject.type[3] === "1") {
			if (hitObject.cache.cleared) {
				canvas.drawImage(Assets.spinnerClear, window.innerWidth / 2, window.innerHeight / 4);
			}
			/* draw spinner */
			let mapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
			ctx.translate(mapped.x, mapped.y);
			ctx.rotate(hitObject.cache.currentAngle);
			let size = utils.map(hitObject.endTime - useTime, 0, hitObject.endTime - (hitObject.time - arTime), 0, 0.8) * utils.map(Math.abs(hitObject.cache.velocity), 0, 50, 1, 1.2);
			canvas.drawImage(Assets.spinnerApproachCircle, 0, 0, size * window.innerHeight, size * window.innerHeight);
			let tempAlpha = ctx.globalAlpha;
			canvas.setGlobalAlpha(1);
			canvas.drawImage(Assets.spinnerTop, 0, 0, 0.2 * window.innerHeight, 0.2 * window.innerHeight);
			canvas.setGlobalAlpha(tempAlpha);
			ctx.resetTransform();
		}
		canvas.setGlobalAlpha(1);
	}

	function updateScore() {
		comboPulseSize -= comboPulseSize / 8;
		displayedScore += (score - displayedScore) / 8;
		/* update score html element */
		utils.htmlCounter(utils.reverse(Math.round(displayedScore) + ""), "score-container", "score-digit-", `src/images/skins/${skin}/fonts/aller/score-`, "left", "calc(100vw - " + (document.getElementById("score-container").childNodes.length * 2) + "vw)");
		/* update combo html element */
		utils.htmlCounter(utils.reverse(combo + "x"), "combo-container", "combo-digit-", `src/images/skins/${skin}/fonts/aller/score-`, "top", "calc(100vh - 52 / 32 * " + 2 * (comboPulseSize + 1) + "vw)");
		/* update accuracy html element */
		utils.htmlCounter("%" + utils.reverse("" + (Formulas.accuracy(playDetails.hitDetails.total300, playDetails.hitDetails.total100, playDetails.hitDetails.total50, playDetails.hitDetails.totalMiss) * 100).toFixed(2)), "accuracy-container", "accuracy-digit-", `src/images/skins/${skin}/fonts/aller/score-`, "left", "calc(100vw - " + (document.getElementById("accuracy-container").childNodes.length * 1) + "vw)");
		/* rank grade */
		document.getElementById("grade").src = `./src/images/skins/${skin}/ranking-` + Formulas.grade(playDetails.hitDetails.total300, playDetails.hitDetails.total100, playDetails.hitDetails.total50, playDetails.hitDetails.totalMiss, false) + "-small.png";
		/* combo pulse size */
		let els = document.getElementById("combo-container").querySelectorAll("img");
		for (let i = 0; i < els.length; i++) {
			els[i].style.width = 2 * (comboPulseSize + 1) + "vw";
		}
	}

	function renderMouse() {
		/* mouse trails */
		let numberOfMouseTrailsRendered = 0;
		for (let i = 0; i < mouse.previousPositions.x.length - 1; i++) {
			canvas.setGlobalAlpha(utils.map(i, 0, mouse.previousPositions.x.length - 1, 0, 1));
			let distance = utils.dist(mouse.previousPositions.x[i], mouse.previousPositions.y[i], mouse.previousPositions.x[i + 1], mouse.previousPositions.y[i + 1]) / (Assets.cursorTrail.width / 2);
			for (let j = 0; j <= distance; j++) {
				canvas.drawImage(Assets.cursorTrail, utils.map(j, 0, distance, mouse.previousPositions.x[i], mouse.previousPositions.x[i + 1]) - Assets.cursorTrail.width / 2, utils.map(j, 0, distance, mouse.previousPositions.y[i], mouse.previousPositions.y[i + 1]));
				numberOfMouseTrailsRendered++;
			}
			/* prevent the rendering of too many trails otherwise it will lag */
			if (numberOfMouseTrailsRendered > 256) {
				break;
			}
		}
		canvas.setGlobalAlpha(1);
		if ((keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
			mouseSize += 1 / 16;
		}
		mouseSize += (1 - mouseSize) / 8;
		canvas.drawImage(Assets.cursor, mouse.position.x, mouse.position.y, Assets.cursor.width * mouseSize, Assets.cursor.height * mouseSize);
	}

	function detectSpinSpeed(useTime, previousTime, hitObjectOffsetX, hitObjectOffsetY) {
		let b = utils.mapToOsuPixels(256, 192, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, hitObjectOffsetX, hitObjectOffsetY);
		previousAngle = angle;
		angle = Math.atan2(mouse.position.y - b.y, mouse.position.x - b.x);
		if (Math.sign(angle) === -1) {
			angle = Math.PI * 2 + angle;
		}
		angleChange = ((angle - previousAngle) / (useTime - previousTime));
		if (isNaN(angleChange)) {
			angleChange = 0;
		}
		/* hard limit spinner speed at 50rad/s or ~477 rpm */
		if (angleChange >= 50) {
			angleChange = 50;
		}
		if (angleChange <= -50) {
			angleChange = -50;
		}
		/* Detect sudden sign changes due to rollover every spin */
		if (previousSigns.length > 10) {
			previousSigns.splice(0, 1);
		}
		previousSigns.push(Math.sign(angleChange));
		let averageSign = 0;
		for (let i = 0; i < previousSigns.length; i++) {
			averageSign += previousSigns[i];
		}
		if (Math.sign(averageSign) !== Math.sign(angleChange)) {
			angleChange *= -1;
		}
	}

	function updateHp(useTime, previousTime) {
		if (currentHP > 1) {
			currentHP = 1;
		}
		if (currentHP < 0) {
			currentHP = 0;
			if ((playDetails.mods.auto || playDetails.mods.relax || playDetails.mods.autoPilot || playDetails.mods.noFail) === false) {
				document.getElementById("webpage-state-fail-screen").style.display = "block";
				audio.pause();
				isRunning = false;
				mouse.unlockPointer();
			}
		}
		/* only start draining health 2 seconds before the first hit object*/
		if (useTime > loadedMaps[useBeatmapSet][useBeatmap].hitObjects[0].time - 2) {
			currentHP -= Formulas.HPDrain(loadedMaps[useBeatmapSet][useBeatmap].HPDrainRate, useTime - previousTime);
		}
		hpDisplay += (currentHP - hpDisplay) / 8;
	}

	function processHitEvent(useTime) {
		switch (hitEvents[0].score) {
			/* slider bonus spin */
			case 1000:
				playDetails.hitDetails.totalSliderBonusSpin++;
				break;
				/* great*/
			case 300:
				playDetails.hitDetails.total300++;
				break;
				/* good or spinner spin */
			case 100:
				if (hitEvents[0].type === "hit-circle") {
					playDetails.hitDetails.total100++;
				} else {
					playDetails.hitDetails.totalSpinnerSpins++;
				}
				break;
				/* meh */
			case 50:
				playDetails.hitDetails.total50++;
				break;
				/* complete miss */
			case 0:
				playDetails.hitDetails.totalMiss++;
				break;
				/* Slider head, repeat and end */
			case 30:
				playDetails.hitDetails.totalSliderElements++;
				break;
				/* Slider tick */
			case 10:
				playDetails.hitDetails.totalSliderTicks++;
				break;
		}
		if ((hitEvents[0].score >= 50 || hitEvents[0].score === 0) && hitEvents[0].type === "hit-circle") {
			score += Formulas.hitScore(hitEvents[0].score, combo, difficultyMultiplier, scoreMultiplier);
			scoreObjects.push(new HitObject.ScoreObject(hitEvents[0].score, hitEvents[0].x, hitEvents[0].y, useTime, useTime + 1));
		} else {
			score += hitEvents[0].score;
		}
		if (hitEvents[0].combo === "increasing") {
			combo++;
			if (combo > highestCombo) {
				highestCombo = combo;
			}
			comboPulseSize = 1;
		} else if (hitEvents[0].combo === "reset") {
			combo = 0;
			document.getElementById("combo-container").innerHTML = "";
		}
		currentHP += Formulas.HP(loadedMaps[useBeatmapSet][useBeatmap].HPDrainRate, hitEvents[0].score, hitEvents[0].type, playDetails.mods);
		hitEvents.splice(0, 1);
	}

	function nextHitObject() {
		/* create copy not reference, otherwise retrying wouldn't work*/
		hitObjects.push(JSON.parse(JSON.stringify(loadedMaps[useBeatmapSet][useBeatmap].hitObjects[currentHitObject])));
		/* second bit flag determines new combo */
		if (loadedMaps[useBeatmapSet][useBeatmap].hitObjects[currentHitObject].type[2] === "1") {
			currentComboNumber = 1;
			currentComboColour++;
			if (currentComboColour > loadedMaps[useBeatmapSet][useBeatmap].comboColours.length - 1) {
				currentComboColour = 0;
			}
		}
		currentHitObject++;
	}

	function nextTimingPoint() {
		currentTimingPoint++;
		if (loadedMaps[useBeatmapSet][useBeatmap].timingPoints[currentTimingPoint].uninherited === 1) {
			timingPointUninheritedIndex = currentTimingPoint;
		}
	}

	function renderEffects(useTime) {
		for (let i = 0; i < scoreObjects.length; i++) {
			if (scoreObjects[i].lifetime - useTime >= 0) {
				let useImage = -1;
				switch (scoreObjects[i].score) {
					case 300:
						useImage = 0;
						break;
					case 100:
						useImage = 1;
						break;
					case 50:
						useImage = 2;
						break;
					case 0:
						useImage = 3;
						break;
				}
				canvas.setGlobalAlpha(utils.map(useTime, scoreObjects[i].initialTime, scoreObjects[i].lifetime, 1, 0));
				let size = circleDiameter * 0.75 * utils.map(useTime, scoreObjects[i].initialTime, scoreObjects[i].lifetime, 1, 1.1);
				canvas.drawImage(Assets.scoreNumbers[useImage], scoreObjects[i].x, scoreObjects[i].y, size, size);
			} else {
				scoreObjects.splice(i, 1);
				i--;
			}
		}
		for (let i = 0; i < effectObjects.length; i++) {
			if (effectObjects[i].lifetime - useTime >= 0) {
				let alpha = utils.map(useTime, effectObjects[i].initialTime, effectObjects[i].lifetime, 1, 0);
				if (alpha > 1) {
					alpha = 1;
				}
				canvas.setGlobalAlpha(alpha);
				let size = circleDiameter * utils.map(useTime, effectObjects[i].initialTime, effectObjects[i].lifetime, 1, 1.5);
				canvas.drawImage(effectObjects[i].src, effectObjects[i].x, effectObjects[i].y, size, size);
			} else {
				effectObjects.splice(i, 1);
				i--;
			}
		}
	}

	function renderHitErrors() {
		canvas.setGlobalAlpha(1);
		canvas.setFillStyle("#ffcc22");
		ctx.fillRect(window.innerWidth / 2 - odTime[0] * 1000 / 2, window.innerHeight * 0.975, odTime[0] * 1000, window.innerHeight * 0.005);
		canvas.setFillStyle("#88b300");
		ctx.fillRect(window.innerWidth / 2 - odTime[1] * 1000 / 2, window.innerHeight * 0.975, odTime[1] * 1000, window.innerHeight * 0.005);
		canvas.setFillStyle("#66ccff");
		ctx.fillRect(window.innerWidth / 2 - odTime[2] * 1000 / 2, window.innerHeight * 0.975, odTime[2] * 1000, window.innerHeight * 0.005);
		for (let i = 0; i < hitErrors.length; i++) {
			if (i > 40) {
				break;
			}
			let alpha = utils.map(i, 40, 0, 0, 1);
			if (alpha <= 0) {
				alpha = 0;
			}
			canvas.setGlobalAlpha(alpha);
			if (utils.withinRange(hitErrors[i], 0, odTime[2])) {
				canvas.setFillStyle("#66ccff");
			} else if (utils.withinRange(hitErrors[i], 0, odTime[1])) {
				canvas.setFillStyle("#88b300");
			} else if (utils.withinRange(hitErrors[i], 0, odTime[0])) {
				canvas.setFillStyle("#ffcc22");
			}
			ctx.fillRect(window.innerWidth / 2 + hitErrors[i] * 1000, window.innerHeight * 0.975 - window.innerHeight * 0.025 / 2, window.innerHeight * 0.005, window.innerHeight * 0.025);
		}
	}
	return {
		tick: function() {
			let useTime = audio.currentTime;
			if (audioFailedToLoad) {
				useTime = (window.performance.now() - backupStartTime) / 1000;
				if (playDetails.mods.doubleTime) {
					useTime *= 1.5;
				} else if (playDetails.mods.halfTime) {
					useTime *= 0.75;
				}
			}
			if (currentHitObject >= loadedMaps[useBeatmapSet][useBeatmap].hitObjects.length) {
				let endingTime;
				let lastHitObject = loadedMaps[useBeatmapSet][useBeatmap].hitObjects[loadedMaps[useBeatmapSet][useBeatmap].hitObjects.length - 1];
				if (lastHitObject.type[0] === "1") {
					endingTime = lastHitObject.time + 2;
				}
				if (lastHitObject.type[1] === "1") {
					let sliderOnceTime = Math.abs(lastHitObject.length) / (Formulas.sliderMultiplier(loadedMaps[useBeatmapSet][useBeatmap].timingPoints[currentTimingPoint].beatLength) * 100) * loadedMaps[useBeatmapSet][useBeatmap].timingPoints[timingPointUninheritedIndex].beatLength;
					let sliderTotalTime = sliderOnceTime * lastHitObject.slides;
					endingTime = lastHitObject.time + sliderTotalTime + 2;
				}
				if (lastHitObject.type[3] === "1") {
					endingTime = lastHitObject.endTime + 2;
				}
				if (useTime > endingTime) {
					mouse.unlockPointer();
					document.getElementById("webpage-state-always").style.display = "block";
					document.getElementById("top-bar").style.display = "block";
					document.getElementById("webpage-state-beatmap-selection").style.display = "none";
					document.getElementById("webpage-state-gameplay").style.display = "none";
					document.getElementById("webpage-state-pause-screen").style.display = "none";
					document.getElementById("webpage-state-fail-screen").style.display = "none";
					document.getElementById("webpage-state-results-screen").style.display = "block";
					document.getElementById("bottom-bar").style.display = "block";
					let date = new Date();
					playDetails.datePlayed = utils.formatDate(date.getDate(), date.getMonth(), date.getFullYear(), date.getHours(), date.getMinutes());
					playDetails.unstableRate = utils.standardDeviation(hitErrors) * 1000 * 10;
					playDetails.mapName = loadedMaps[useBeatmapSet][useBeatmap].Title;
					playDetails.mapperName = loadedMaps[useBeatmapSet][useBeatmap].Creator;
					playDetails.artist = loadedMaps[useBeatmapSet][useBeatmap].Artist;
					playDetails.difficultyName = loadedMaps[useBeatmapSet][useBeatmap].Version;
					endScreen.displayResults(playDetails);
					isRunning = false;
				}
			}
			detectSpinSpeed(useTime, previousTime, hitObjectOffsetX, hitObjectOffsetY);
			updateHp(useTime, previousTime);
			/* Hit Events */
			while (hitEvents.length > 0) {
				processHitEvent(useTime);
			}
			while (currentHitObject < loadedMaps[useBeatmapSet][useBeatmap].hitObjects.length && useTime >= loadedMaps[useBeatmapSet][useBeatmap].hitObjects[currentHitObject].time - arTime) {
				nextHitObject();
			}
			/* +1 because the given time is beginning time, not end time */
			while (currentTimingPoint < loadedMaps[useBeatmapSet][useBeatmap].timingPoints.length - 1 && useTime >= loadedMaps[useBeatmapSet][useBeatmap].timingPoints[currentTimingPoint + 1].time) {
				nextTimingPoint();
			}
			/* Cache Loop */
			for (let i = 0; i < hitObjects.length; i++) {
				setHitObjectCache(hitObjects[i], useTime, hitObjectOffsetX, hitObjectOffsetY);
			}
			/* Processing Loop */
			for (let i = 0; i < hitObjects.length; i++) {
				let spliced = processHitObject(hitObjects[i], useTime, previousTime, i, hitObjectOffsetX, hitObjectOffsetY);
				if (spliced) {
					i--;
					if (i < 0) {
						i = 0;
					}
				}
			}
			playDetails.score = score;
			playDetails.accuracy = Formulas.accuracy(playDetails.hitDetails.total300, playDetails.hitDetails.total100, playDetails.hitDetails.total50, playDetails.hitDetails.totalMiss) * 100;
			playDetails.grade = Formulas.grade(playDetails.hitDetails.total300, playDetails.hitDetails.total100, playDetails.hitDetails.total50, playDetails.hitDetails.totalMiss, false);
			playDetails.maxCombo = highestCombo;
			previousTime = useTime;

			if (keyboard.getKeyDown("esc")) {
				document.getElementById("webpage-state-pause-screen").style.display = "block";
				audio.pause();
				mouse.unlockPointer();
				isRunning = false;
			}
		},
		render: function() {
			let useTime = audio.currentTime;
			if (audioFailedToLoad) {
				useTime = (window.performance.now() - backupStartTime) / 1000;
				if (playDetails.mods.doubleTime) {
					useTime *= 1.5;
				} else if (playDetails.mods.halfTime) {
					useTime *= 0.75;
				}
			}
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
			canvas.setStrokeStyle("#fff");
			ctx.lineWidth = 5;
			canvas.setImageAlignment("top-left");
			canvas.drawImage(Assets.scoreBarBg, 10, 10, window.innerWidth / 2, Assets.scoreBarBg.height);
			canvas.drawImage(Assets.scoreBarColour, 0, 0, utils.map(hpDisplay, 0, 1, 0, Assets.scoreBarColour.width), Assets.scoreBarColour.height, 15, 10 + Assets.scoreBarColour.height / 1.5, utils.map(hpDisplay, 0, 1, 0, window.innerWidth / 2 - 0.01 * window.innerWidth), Assets.scoreBarColour.height);
			canvas.setImageAlignment("center");
			/* Render Loop */
			for (let i = hitObjects.length - 1; i >= 0; i--) {
				renderHitObject(hitObjects[i], useTime, hitObjectOffsetX, hitObjectOffsetY);
			}
			renderEffects(useTime);
			/* hit errors */
			renderHitErrors();
			updateScore();
			renderMouse();
		},
		continue: function() {
			audio.play();
			mouse.lockPointer();
			isRunning = true;
		},
		pause: function() {
			audio.pause();
			mouse.unlockPointer();
			isRunning = false;
		},
		retry: function() {
			this.playMap(useBeatmapSet, useBeatmap, playDetails.mods);
		},
		playMap: function(groupIndex, mapIndex, mods) {
			useBeatmapSet = groupIndex;
			useBeatmap = mapIndex;
			playDetails = PlayDetails(mods);
			currentHitObject = 0;
			hitEvents = [];
			hitObjects = [];
			hitErrors = [];
			scoreObjects = [];
			effectObjects = [];
			/* Playfield calculations and data */
			playfieldSize = 0.8;
			playfieldXOffset = 0;
			playfieldYOffset = window.innerHeight / 50;
			/* HP values */
			currentHP = 1;
			hpDisplay = 1;
			previousTime = 0;
			/* Timing point indexes */
			timingPointUninheritedIndex = 0;
			currentTimingPoint = 0;
			/* Score letiables */
			scoreMultiplier = Formulas.modScoreMultiplier(playDetails.mods);
			score = 0;
			displayedScore = 0;
			/* Combo letiables */
			combo = 0;
			highestCombo = 0;
			currentComboNumber = 1;
			currentComboColour = 0;
			comboPulseSize = 1;
			/* spinner tests */
			previousSigns = [];
			angleChange = 0;
			previousAngle = 0;
			angle = 0;
			/* Audio letiables */
			backupStartTime = window.performance.now();
			audioFailedToLoad = false;
			audio.src = `src/audio/${loadedMaps[useBeatmapSet][useBeatmap].AudioFilename}`;
			audio.currentTime = 0;
			if (playDetails.mods.doubleTime) {
				audio.playbackRate = 1.5;
			} else if (playDetails.mods.halfTime) {
				audio.playbackRate = 0.75;
			}
			/* Beatmap difficulty data */
			arTime = Formulas.AR(loadedMaps[useBeatmapSet][useBeatmap].ApproachRate, playDetails.mods);
			arFadeIn = Formulas.ARFadeIn(loadedMaps[useBeatmapSet][useBeatmap].ApproachRate, playDetails.mods);
			/* Map from osu!pixels to screen pixels */
			circleDiameter = utils.map(Formulas.CS(loadedMaps[useBeatmapSet][useBeatmap].CircleSize, playDetails.mods) * 2, 0, 512, 0, window.innerHeight * playfieldSize * (4 / 3));
			difficultyMultiplier = Formulas.difficultyPoints(loadedMaps[useBeatmapSet][useBeatmap].CircleSize, loadedMaps[useBeatmapSet][useBeatmap].HPDrainRate, loadedMaps[useBeatmapSet][useBeatmap].OverallDifficulty);
			odTime = Formulas.ODHitWindow(loadedMaps[useBeatmapSet][useBeatmap].OverallDifficulty, playDetails.mods);
			mouse.lockPointer();
			isRunning = true;
			hitCircleComboBuffers = [];
			approachCircleComboBuffers = [];
			let hitCircleRgbks = canvas.generateRGBKs(Assets.hitCircle);
			let approachCircleRgbks = canvas.generateRGBKs(Assets.approachCircle);
			for (let i = 0; i < loadedMaps[useBeatmapSet][useBeatmap].comboColours.length; i++) {
				let comboColours = loadedMaps[useBeatmapSet][useBeatmap].comboColours[i];
				hitCircleComboBuffers.push(canvas.generateTintImage(Assets.hitCircle, hitCircleRgbks, comboColours.r, comboColours.g, comboColours.b, circleDiameter, circleDiameter));
				approachCircleComboBuffers.push(canvas.generateTintImage(Assets.approachCircle, approachCircleRgbks, comboColours.r, comboColours.g, comboColours.b));
			}
		},
		playDetails: function() {
			return playDetails;
		},
		isRunning: function() {
			return isRunning;
		}
	};
});