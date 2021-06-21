define(function(require) {
	"use strict";
	/* RequireJS Module Loading */
	const Options = require("./options.js");
	const Formulas = require("./formulas.js");
	const Mouse = require("./mouse.js");
	const Keyboard = require("./keyboard.js");
	const Bezier = require("./bezier.js");
	const utils = require("./utils.js");
	const HitObject = require("./hitObjects.js");
	const skin = "ajax-transparent";
	const SkinLoader = require("./skinLoader.js");
	const Assets = new SkinLoader(skin);
	const Canvas = require("./canvas.js");
	const PlayDetails = require("./playDetails.js");
	const endScreen = require("./endScreen.js");
	const databaseManager = require("./databaseManager.js");
	let currentLoadedMap;
	/* canvas setup */
	let canvas = new Canvas("gameplay");
	canvas.setHeight(window.innerHeight);
	canvas.setWidth(window.innerWidth);
	let ctx = canvas.context;
	canvas.setFillStyle("#fff");
	/* flashlight canvas setup */
	let flashlightCanvas = document.getElementById("gameplay-flashlight");
	flashlightCanvas.width = window.innerWidth;
	flashlightCanvas.height = window.innerHeight;
	let flashlightCtx = flashlightCanvas.getContext("2d");
	let flashlightSize = utils.map(100, 0, 512, 0, window.innerWidth);
	let isRunning = false;
	/* inputs setup */
	let mouse = new Mouse("body", 100);
	let keyboard = new Keyboard("body");
	mouse.setPosition(window.innerWidth / 2, window.innerHeight / 2);
	mouse.init();
	mouse.positionBound(0, 0, window.innerWidth, window.innerHeight);
	let mouseSize = 1;
	keyboard.init();
	let keyboardLeftReleased = false;
	let keyboardRightReleased = false;
	/* Details about the play, including replays */
	let playDetails;
	let currentOptions;
	/* object arrays */
	let endingTime;
	let currentHitObject = 0;
	let hitEvents = [];
	let hitObjects = [];
	let hitErrors = [];
	let judgementObjects = [];
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
	let audio = document.getElementById("menu-audio");
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
	/* Beatmap difficulty data constants */
	let arTime;
	let arFadeIn;
	let circleDiameter;
	let difficultyMultiplier;
	let odTime;
	/* osu constants */
	const FOLLLOW_CIRCLE_SIZE = 2;
	const APPROACH_CIRCLE_MAX_SIZE = 5;
	const APPROACH_CIRCLE_MIN_SIZE = 1.4;
	const HIDDEN_FADE_IN_PERCENT = 0.4;
	const HIDDEN_FADE_OUT_PERCENT = 0.7;
	const SLIDER_STROKE_SIZE_PERCENT = 0.9;
	let HIT_OBJECT_OFFSET_X = playfieldXOffset + window.innerWidth / 2 - window.innerHeight * playfieldSize * (4 / 3) / 2;
	let HIT_OBJECT_OFFSET_Y = playfieldYOffset + window.innerHeight / 2 - window.innerHeight * playfieldSize / 2;
	const PLAYFIELD_CENTER_X = 256;
	const PLAYFIELD_CENTER_Y = 192;
	const JUDGEMENT_BEZIER_ANIMATION = Bezier.cubic(0, 1.4, 0, 1);
	const MISS_JUDGEMENT_BEZIER_ANIMATION = Bezier.cubic(1, 0, 0.9, 0.7);

	window.addEventListener("resize", function() {
		canvas.canvas.width = window.innerWidth;
		canvas.canvas.height = window.innerHeight;
		flashlightCanvas.width = window.innerWidth;
		flashlightCanvas.height = window.innerHeight;
		/* Playfield calculations and data */
		playfieldYOffset = window.innerHeight / 50;
		HIT_OBJECT_OFFSET_X = playfieldXOffset + window.innerWidth / 2 - window.innerHeight * playfieldSize * (4 / 3) / 2;
		HIT_OBJECT_OFFSET_Y = playfieldYOffset + window.innerHeight / 2 - window.innerHeight * playfieldSize / 2;
		mouse.positionBound(0, 0, window.innerWidth, window.innerHeight);
	});

	function enterPointerLock() {
		if (currentOptions.Inputs.useRawPosition === false) {
			mouse.lockPointer();
		} else {
			mouse.hide();
		}
	}

	function exitPointerLock() {
		if (currentOptions.Inputs.useRawPosition === false) {
			mouse.unlockPointer();
		} else {
			mouse.show();
		}
	}

	function setHitObjectCache(hitObject, useTime, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y) {
		/* Cache setup */
		let sliderSpeedMultiplier = currentLoadedMap.SliderMultiplier;
		if (hitObject.cache.cacheSet === false) {
			/* Immediate Cache setup */
			hitObject.cache.comboNumber = currentComboNumber;
			hitObject.cache.comboColour = currentComboColour;
			currentComboNumber++;
			if (hitObject.type[0] === "1") {
				/* Cache setup for HitCircle */
				hitObject.cache.cacheSet = true;
			} else if (hitObject.type[1] === "1") {
				hitObject.cache.cacheSet = true;
				/* Cache setup for Slider */
				hitObject.cache.hitHead = false;
				hitObject.cache.hitEnd = false;
				hitObject.cache.onFollowCircle = false;
				hitObject.cache.hasHitAtAll = false;
				hitObject.cache.hasEnded = false;
				hitObject.cache.sliderFollowCirclePreviousPosition = 0;
				hitObject.cache.sliderFollowCirclePosition = 0;
				hitObject.cache.sliderFollowCircleSize = 0;
				hitObject.cache.currentSlide = 0;
				hitObject.cache.sliderTicksHit = 0;
				hitObject.cache.repeatsHit = 0;
				hitObject.cache.points = [];
				hitObject.cache.timingPointUninheritedIndex = timingPointUninheritedIndex;
				/* Precalculate Slider Curve Points */
				/* Calculate Slider Points */
				let circle;
				if (hitObject.curvePoints.length === 3) {
					circle = utils.circumcircle(hitObject.curvePoints[0], hitObject.curvePoints[1], hitObject.curvePoints[2]);
				}
				if (hitObject.curveType === "B" || hitObject.curveType === "C" || hitObject.curveType === "L" || isFinite(circle.r) === false) {
					/* Slider Type Bezier, Catmull and Linear */
					/* I will likely not support catmull sliders */
					/* determine slider red / white anchor */
					let bezierTemp = [];
					for (let j = 0; j < hitObject.curvePoints.length; j++) {
						if (hitObject.curvePoints[j + 1] && hitObject.curvePoints[j].x === hitObject.curvePoints[j + 1].x && hitObject.curvePoints[j].y === hitObject.curvePoints[j + 1].y) {
							bezierTemp.push(hitObject.curvePoints[j]);
							let point = Bezier.nGrade(bezierTemp);
							for (let k = 0; k < point.length; k++) {
								hitObject.cache.points.push(point[k]);
							}
							bezierTemp = [];
						} else {
							bezierTemp.push(hitObject.curvePoints[j]);
						}
					}
					let point = Bezier.nGrade(bezierTemp);
					for (let k = 0; k < point.length; k++) {
						hitObject.cache.points.push(point[k]);
					}
				} else if (hitObject.curveType === "P" && hitObject.curvePoints.length === 3) {
					/* Slider Type Perfect Circle */
					/* There are a select few maps that have infinity circle radius. I'm look at your sotarks */
					hitObject.cache.points = utils.circleToPoints(circle.x, circle.y, circle.r, Math.abs(hitObject.length), -utils.direction(circle.x, circle.y, hitObject.curvePoints[0].x, hitObject.curvePoints[0].y) - Math.PI / 2, utils.orientation(hitObject.curvePoints[0], hitObject.curvePoints[1], hitObject.curvePoints[2]));
				}
			} else if (hitObject.type[3] === "1") {
				hitObject.cache.cacheSet = true;
				/* Cache setup for Spinner */
				/* In spinners are measured in radians */
				hitObject.cache.spins = 0;
				hitObject.cache.velocity = 0;
				hitObject.cache.spinnerBonus = false;
				hitObject.cache.spinAngle = 0;
				hitObject.cache.spinAngle = 0;
				hitObject.cache.timeSpentAboveSpinnerMinimum = 0;
				hitObject.cache.cleared = false;
			}
		}
		/* Inherited timing point */
		if (currentLoadedMap.timingPoints[currentTimingPoint].uninherited === 0) {
			sliderSpeedMultiplier *= Formulas.sliderMultiplier(currentLoadedMap.timingPoints[currentTimingPoint].beatLength);
		}
		/* Cache setup after hit objects expected hit time */
		if (useTime >= hitObject.time) {
			/* Cache setup After Object Hit Time */
			if (hitObject.type[0] === "1" && hitObject.cache.cacheSetAfterHit === false) {
				/* Cache setup for HitCircle */
				hitObject.cache.cacheSetAfterHit = true;
			} else if (hitObject.type[1] === "1" && hitObject.cache.cacheSetAfterHit === false) {
				hitObject.cache.cacheSetAfterHit = true;
				/* Cache setup for Slider */
				hitObject.cache.sliderInheritedMultiplier = sliderSpeedMultiplier;
				hitObject.cache.timingPointUninheritedIndex = timingPointUninheritedIndex;
				let time = Math.abs(hitObject.length) / (hitObject.cache.sliderInheritedMultiplier * 100) * currentLoadedMap.timingPoints[hitObject.cache.timingPointUninheritedIndex].beatLength;
				/* Actual ticks is -1 due to unexplicable phenomenon */
				hitObject.cache.totalTicks = time / currentLoadedMap.timingPoints[hitObject.cache.timingPointUninheritedIndex].beatLength * currentLoadedMap.SliderTickRate;
				hitObject.cache.specificSliderTicksHit = [];
				hitObject.cache.specificSliderTicksPosition = [];
				let inc = hitObject.cache.points.length / (hitObject.cache.totalTicks);
				for (let j = 0; j < hitObject.slides; j++) {
					let temporaryTickPositions = [];
					let tempArrayBoolean = [];
					if (j % 2 === 0) {
						for (let k = 0; k < hitObject.cache.points.length; k += inc) {
							if (k > 1 && k < hitObject.cache.points.length - 1) {
								temporaryTickPositions.push(Math.floor(k));
								tempArrayBoolean.push(false);
							}
						}
					} else {
						for (let k = hitObject.cache.points.length - 1; k >= 0; k -= inc) {
							if (k > 1 && k < hitObject.cache.points.length - 1) {
								temporaryTickPositions.push(Math.floor(k));
								tempArrayBoolean.push(false);
							}
						}
					}
					hitObject.cache.specificSliderTicksHit.push(tempArrayBoolean);
					hitObject.cache.specificSliderTicksPosition.push(temporaryTickPositions);
				}
				hitObject.cache.totalTicks = hitObject.cache.specificSliderTicksPosition[0].length;
			} else if (hitObject.type[3] === "1" && hitObject.cache.cacheSetAfterHit === false) {
				hitObject.cache.cacheSetAfterHit = true;
				/* Cache setup for Spinner */
			}
		}
	}

	function processHitObject(hitObject, useTime, previousTime, index, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y) {
		let hasSpliced = false;
		let hitObjectMapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
		let autoSpinSpeed = 50;
		if (playDetails.mods.auto) {
			keyboard.emulateKeyUp("z");
			if (index === 0) {
				if ((hitObject.cache.hasHitAtAll === false || hitObject.cache.hasHitAtAll === undefined) && hitObject.type[3] !== "1") {
					mouse.changePosition((hitObjectMapped.x - mouse.position.x) / 4, (hitObjectMapped.y - mouse.position.y) / 4);
				}
			}
			if (hitObject.type[0] === "1" && useTime > hitObject.time - odTime[2] / 2) {
				mouse.setPosition(hitObjectMapped.x, hitObjectMapped.y);
				keyboard.emulateKeyDown("z");
			}
			if (hitObject.type[1] === "1" && useTime > hitObject.time - odTime[2] / 2) {
				let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
				mouse.setPosition(sliderFollowCirclePos.x, sliderFollowCirclePos.y);
				keyboard.emulateKeyDown("z");
			}
		} else if (playDetails.mods.spunOut) {
			autoSpinSpeed = 30;
		}
		if ((playDetails.mods.auto || playDetails.mods.spunOut) && hitObject.type[3] === "1" && useTime > hitObject.time) {
				angleChange = autoSpinSpeed;
				mouse.setPosition(hitObjectMapped.x + 100 * Math.cos(hitObject.cache.spinAngle), hitObjectMapped.y + 100 * Math.sin(hitObject.cache.spinAngle));
				keyboard.emulateKeyDown("z");
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
				hitEvents.push(new HitObject.Event("hit-circle", hitWindowScore, "increasing", hitObjectMapped.x, hitObjectMapped.y));
				if (playDetails.mods.hidden === false) {
					effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
					effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
				}
			} else {
				hitEvents.push(new HitObject.Event("hit-circle", 0, "reset", hitObjectMapped.x, hitObjectMapped.y));
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
				let time = Math.abs(hitObject.length) / (hitObject.cache.sliderInheritedMultiplier * 100) * currentLoadedMap.timingPoints[hitObject.cache.timingPointUninheritedIndex].beatLength;
				hitObject.cache.sliderFollowCirclePreviousPosition = hitObject.cache.sliderFollowCirclePosition - 10;
				if (hitObject.cache.currentSlide % 2 === 0) {
					hitObject.cache.sliderFollowCirclePosition = Math.floor(utils.map(useTime, hitObject.time + time * hitObject.cache.currentSlide, hitObject.time + time * (hitObject.cache.currentSlide + 1), 0, hitObject.cache.points.length - 1));
					/* Prevent Index Errors */
					if (hitObject.cache.sliderFollowCirclePosition < 0) {
						hitObject.cache.sliderFollowCirclePosition = 0;
					}
					/* Check if slider repeats, then switch direction */
					if (hitObject.cache.sliderFollowCirclePosition > hitObject.cache.points.length - 1) {
						hitObject.cache.sliderFollowCirclePosition = hitObject.cache.points.length - 1;
						sliderRepeat = true;
					}
				} else if (hitObject.cache.currentSlide % 2 === 1) {
					hitObject.cache.sliderFollowCirclePosition = Math.floor(utils.map(useTime, hitObject.time + time * hitObject.cache.currentSlide, hitObject.time + time * (hitObject.cache.currentSlide + 1), hitObject.cache.points.length - 1, 0));
					/* Prevent Index Errors */
					if (hitObject.cache.sliderFollowCirclePosition > hitObject.cache.points.length - 1) {
						hitObject.cache.sliderFollowCirclePosition = hitObject.cache.points.length - 1;
					}
					/* Check if slider repeats, then switch direction */
					if (hitObject.cache.sliderFollowCirclePosition < 0) {
						hitObject.cache.sliderFollowCirclePosition = 0;
						sliderRepeat = true;
					}
				}
				/* Check if slider follow circle went over slider ticks */
				for (let j = 0; j < hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide].length; j++) {
					if (hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j] === false && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
						let mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].x, hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
						if (hitObject.cache.sliderFollowCirclePreviousPosition < hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j] && hitObject.cache.sliderFollowCirclePosition > hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]) {
							hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j] = true;
							hitObject.cache.sliderTicksHit++;
							hitObject.cache.sliderFollowCircleSize += 0.125;
							hitEvents.push(new HitObject.Event("slider-tick", 10, "increasing", mapped.x, mapped.y));
						}
					}
				}
				let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
				if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter * FOLLLOW_CIRCLE_SIZE / 2 && hitObject.cache.onFollowCircle && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
					hitObject.cache.onFollowCircle = true;
				} else if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter / 2 && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
					hitObject.cache.onFollowCircle = true;
				} else {
					hitObject.cache.onFollowCircle = false;
				}
				if (sliderRepeat) {
					hitObject.cache.currentSlide++;
					if (hitObject.cache.currentSlide < hitObject.slides) {
						let sliderFollowCirclePos = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
						if (utils.dist(mouse.position.x, mouse.position.y, sliderFollowCirclePos.x, sliderFollowCirclePos.y) <= circleDiameter * FOLLLOW_CIRCLE_SIZE / 2 && hitObject.cache.onFollowCircle && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
							hitObject.cache.repeatsHit++;
							hitEvents.push(new HitObject.Event("slider-element", 30, "increasing", sliderFollowCirclePos.x));
							if (playDetails.mods.hidden === false) {
								effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], sliderFollowCirclePos.x, sliderFollowCirclePos.y, useTime, useTime + 0.2));
								effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, sliderFollowCirclePos.x, sliderFollowCirclePos.y, useTime, useTime + 0.2));
							}
						} else {
							hitEvents.push(new HitObject.Event("slider-element-miss", 0, "reset", sliderFollowCirclePos.x, sliderFollowCirclePos.y));
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
			hitEvents.push(new HitObject.Event("slider-element", 30, "increasing", hitObjectMapped.x, hitObjectMapped.y));
			if (playDetails.mods.hidden === false) {
				effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
				effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, hitObjectMapped.x, hitObjectMapped.y, useTime, useTime + 0.2));
			}
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
				mapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
			} else {
				mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.points.length - 1].x, hitObject.cache.points[hitObject.cache.points.length - 1].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
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
				hitEvents.push(new HitObject.Event("hit-circle", hitScore, "increasing", mapped.x, mapped.y));
				if (playDetails.mods.hidden === false) {
					effectObjects.push(new HitObject.EffectObject(hitCircleComboBuffers[hitObject.cache.comboColour], mapped.x, mapped.y, useTime, useTime + 0.2));
					effectObjects.push(new HitObject.EffectObject(Assets.hitCircleOverlay, mapped.x, mapped.y, useTime, useTime + 0.2));
				}
			} else {
				hitEvents.push(new HitObject.Event("hit-circle", 0, "reset", mapped.x, mapped.y));
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
				mapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
			} else {
				mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.points.length - 1].x, hitObject.cache.points[hitObject.cache.points.length - 1].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
			}
		}
		if (miss) {
			hitEvents.push(new HitObject.Event("hit-circle", 0, "reset", mapped.x, mapped.y));
			hitObjects.splice(index, 1);
			hasSpliced = true;
			return hasSpliced;
		}
		/* Spinner handling */
		if (hitObject.type[3] === "1") {
			/* velocity changes slowly due to spinner inertia*/
			hitObject.cache.velocity += (angleChange - hitObject.cache.velocity) / 32;
			hitObject.cache.spinAngle += hitObject.cache.velocity * (useTime - previousTime);
			if ((keyboard.getKeyDown("z") || keyboard.getKeyDown("x")) && Math.abs(hitObject.cache.velocity / (Math.PI)) >= Formulas.ODSpinner(currentLoadedMap.OverallDifficulty, playDetails.mods)) {
				hitObject.cache.timeSpentAboveSpinnerMinimum += useTime - previousTime;
			}
			/* spinner is officialy cleared if time spent spinning is above 25% */
			if (hitObject.cache.timeSpentAboveSpinnerMinimum >= (hitObject.endTime - hitObject.time) * 0.25) {
				hitObject.cache.cleared = true;
			}
			while (hitObject.cache.spinAngle >= Math.PI * 2 && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
				hitObject.cache.spins++;
				hitObject.cache.spinAngle -= Math.PI * 2;
				if (hitObject.cache.cleared === false) {
					hitEvents.push(new HitObject.Event("spinner-spin", 100, "no-increase", mapped.x, mapped.y));
				} else {
					hitEvents.push(new HitObject.Event("spinner-bonus-spin", 1100, "no-increase", mapped.x, mapped.y));
				}
			}
			while (hitObject.cache.spinAngle <= -Math.PI * 2 && (keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
				hitObject.cache.spins++;
				hitObject.cache.spinAngle += Math.PI * 2;
				if (hitObject.cache.cleared === false) {
					hitEvents.push(new HitObject.Event("spinner-spin", 100, "no-increase", mapped.x, mapped.y));
				} else {
					hitEvents.push(new HitObject.Event("spinner-bonus-spin", 1100, "no-increase", mapped.x, mapped.y));
				}
			}
		}
		/* Spinner end handling */
		if (hitObject.type[3] === "1" && useTime >= hitObject.endTime) {
			let mapped = utils.mapToOsuPixels(PLAYFIELD_CENTER_X, PLAYFIELD_CENTER_Y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
			/* spinner is cleared is if the time spent spinning is over 18.75% of the spinner length */
			if (hitObject.cache.cleared) {
				hitEvents.push(new HitObject.Event("hit-circle", 300, "increasing", mapped.x, mapped.y));
				/* award 100 if time spent spinning is between 25% and 18.75% */
			} else if (hitObject.cache.timeSpentAboveSpinnerMinimum >= (hitObject.endTime - hitObject.time) * 18.75) {
				hitEvents.push(new HitObject.Event("hit-circle", 100, "increasing", mapped.x, mapped.y));
				/* award 50 if time spent spinning is between 18.75% and 6.25% */
			} else if (hitObject.cache.timeSpentAboveSpinnerMinimum >= (hitObject.endTime - hitObject.time) * 0.0625) {
				hitEvents.push(new HitObject.Event("hit-circle", 50, "increasing", mapped.x, mapped.y));
				/* award miss if time spent spinning is below 6.25% */
			} else if (hitObject.cache.timeSpentAboveSpinnerMinimum < (hitObject.endTime - hitObject.time) * 0.0625) {
				hitEvents.push(new HitObject.Event("hit-circle", 0, "reset", mapped.x, mapped.y));
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

	function renderHitObject(hitObject, useTime, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y) {
		/* Approach Circle Calculations */
		let approachCircleSize = utils.map(useTime - (hitObject.time - arTime), 0, arTime, APPROACH_CIRCLE_MAX_SIZE, APPROACH_CIRCLE_MIN_SIZE);
		let hitObjectMapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
		/* approach circle max size */
		if (approachCircleSize > APPROACH_CIRCLE_MAX_SIZE) {
			approachCircleSize = APPROACH_CIRCLE_MAX_SIZE;
		}
		/* approach circle min size */
		if (approachCircleSize < APPROACH_CIRCLE_MIN_SIZE) {
			approachCircleSize = APPROACH_CIRCLE_MIN_SIZE;
		}
		/* Alpha Calculations */
		if (hitObject.type[0] === "1") {
			if (playDetails.mods.hidden) {
				/* hidden fade in and out for hit circle */
				if (utils.map(useTime - (hitObject.time - arTime), 0, arTime, 0, 1) <= HIDDEN_FADE_IN_PERCENT) {
					canvas.setGlobalAlpha(utils.map(useTime - (hitObject.time - arTime), 0, arTime * HIDDEN_FADE_IN_PERCENT, 0, 1));
				} else if (utils.map(useTime - (hitObject.time - arTime), 0, arTime, 0, 1) <= HIDDEN_FADE_OUT_PERCENT) {
					canvas.setGlobalAlpha(utils.map(useTime - (hitObject.time - arTime), arTime * HIDDEN_FADE_IN_PERCENT, arTime * HIDDEN_FADE_OUT_PERCENT, 1, 0));
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
				/* Slider slide in code */
				let sliderDrawPercent = Math.floor(utils.map(useTime, hitObject.time - arTime, hitObject.time - arTime / 4, hitObject.cache.points.length / 4, hitObject.cache.points.length));
				if (sliderDrawPercent < Math.floor(hitObject.cache.points.length / 4)) {
					sliderDrawPercent = Math.floor(hitObject.cache.points.length / 4);
				}
				if (sliderDrawPercent > hitObject.cache.points.length - 1 || currentOptions.Gameplay.snakingSlidersIn === false) {
					sliderDrawPercent = hitObject.cache.points.length - 1;
				}
				let inc;
				switch (currentOptions.Performance.sliderResolution) {
					case 0:
						inc = 1;
						break;
					case 0.25:
						inc = 2;
						break;
					case 0.5:
						inc = 4;
						break;
					case 0.75:
						inc = 8;
						break;
					case 1:
						inc = 16;
						break;
				}
				if (sliderDrawPercent <= 16) {
					inc = 1;
				}
				/* Slider Curve calculated the at the hitobject time - ar time */
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				/* Draw Outer Slider Body */
				ctx.lineWidth = circleDiameter;
				canvas.setStrokeStyle("rgba(255, 255, 255, " + canvas.getGlobalAlpha() + ")");
				let mapped = utils.mapToOsuPixels(hitObject.cache.points[sliderDrawPercent].x, hitObject.cache.points[sliderDrawPercent].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
				ctx.beginPath();
				for (let j = 0; j < sliderDrawPercent; j += inc) {
					let mapped = utils.mapToOsuPixels(hitObject.cache.points[j].x, hitObject.cache.points[j].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
					ctx.lineTo(mapped.x, mapped.y);
				}
				/* draw last point to make sure slider ends properly */
				ctx.lineTo(mapped.x, mapped.y);
				ctx.stroke();
				/* Draw Inner Slider Body */
				ctx.lineWidth = circleDiameter * SLIDER_STROKE_SIZE_PERCENT;
				canvas.setStrokeStyle("#222");
				ctx.beginPath();
				for (let j = 0; j < sliderDrawPercent; j += inc) {
					let mapped = utils.mapToOsuPixels(hitObject.cache.points[j].x, hitObject.cache.points[j].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
					ctx.lineTo(mapped.x, mapped.y);
				}
				/* draw last point to make sure slider ends properly */
				ctx.lineTo(mapped.x, mapped.y);
				ctx.stroke();
				/* Draw Slider Ticks */
				if (hitObject.cache.totalTicks >= 1 && hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide]) {
					for (let j = 0; j < hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide].length; j++) {
						if (hitObject.cache.specificSliderTicksHit[hitObject.cache.currentSlide][j]) {
							continue;
						}
						let mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].x, hitObject.cache.points[hitObject.cache.specificSliderTicksPosition[hitObject.cache.currentSlide][j]].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
						canvas.drawImage(Assets.sliderScorePoint, mapped.x, mapped.y);
					}
				}
				/* Draw Slider End */
				let showHead = true;
				let isHeadRepeat = false;
				let showEnd = true;
				let isEndRepeat = false;
				if (hitObject.slides > 1 && hitObject.cache.currentSlide < hitObject.slides) {
					ctx.translate(mapped.x, mapped.y);
					let direction = utils.direction(hitObject.cache.points[hitObject.cache.points.length - 2].x, hitObject.cache.points[hitObject.cache.points.length - 2].y, hitObject.cache.points[hitObject.cache.points.length - 1].x, hitObject.cache.points[hitObject.cache.points.length - 1].y) - Math.PI / 2;
					if (playDetails.mods.hardRock) {
						ctx.rotate(direction);
					} else {
						ctx.rotate(-direction);
					}
					canvas.drawImage(hitCircleComboBuffers[hitObject.cache.comboColour], 0, 0, circleDiameter, circleDiameter);
					canvas.drawImage(Assets.reverseArrow, 0, 0, circleDiameter, circleDiameter);
					ctx.resetTransform();
				} else if (hitObject.slides === 1 || hitObject.cache.currentSlide === hitObject.slides - 1) {
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
					let mapped = utils.mapToOsuPixels(hitObject.cache.points[0].x, hitObject.cache.points[0].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
					ctx.translate(mapped.x, mapped.y);
					let direction = utils.direction(hitObject.cache.points[1].x, hitObject.cache.points[1].y, hitObject.cache.points[0].x, hitObject.cache.points[0].y) - Math.PI / 2;
					if (playDetails.mods.hardRock) {
						ctx.rotate(direction);
					} else {
						ctx.rotate(-direction);
					}
					canvas.drawImage(hitCircleComboBuffers[hitObject.cache.comboColour], 0, 0, circleDiameter, circleDiameter);
					canvas.drawImage(Assets.reverseArrow, 0, 0, circleDiameter, circleDiameter);
					ctx.resetTransform();
				}
			}
			if (/*hitObject.cache.sliderFollowCirclePosition !== undefined && */useTime >= hitObject.time) {
				let mapped = utils.mapToOsuPixels(hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].x, hitObject.cache.points[hitObject.cache.sliderFollowCirclePosition].y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
				let tempAlpha = canvas.getGlobalAlpha();
				canvas.setGlobalAlpha(1);
				canvas.drawImage(Assets.sliderBody, mapped.x, mapped.y, circleDiameter, circleDiameter);
				if (hitObject.cache.onFollowCircle) {
					canvas.drawImage(Assets.sliderFollowCircle, mapped.x, mapped.y, circleDiameter * FOLLLOW_CIRCLE_SIZE * hitObject.cache.sliderFollowCircleSize, circleDiameter * FOLLLOW_CIRCLE_SIZE * hitObject.cache.sliderFollowCircleSize);
				}
				canvas.setGlobalAlpha(tempAlpha);
			}
		} else if (hitObject.type[3] === "1") {
			if (hitObject.cache.cleared) {
				canvas.drawImage(Assets.spinnerClear, window.innerWidth / 2, window.innerHeight / 4);
			}
			/* draw spinner */
			let mapped = utils.mapToOsuPixels(hitObject.x, hitObject.y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
			ctx.translate(mapped.x, mapped.y);
			ctx.rotate(hitObject.cache.spinAngle);
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
		if (currentOptions.Performance.scoreUpdateRate === "Equal to frame rate") {
			displayedScore += (score - displayedScore) / 8;
		} else {
			displayedScore = score;
		}
		/* update score html element */
		utils.htmlCounter(Math.round(displayedScore).toString(), "score-container", "score-digit-", Assets.scoreNumbers, "left", "calc(100vw - " + (document.getElementById("score-container").childNodes.length * 2) + "vw)");
		/* update combo html element */
		utils.htmlCounter(combo + "x", "combo-container", "combo-digit-", Assets.scoreNumbers, "top", "calc(100vh - 52 / 32 * " + 2 * (comboPulseSize + 1) + "vw)");
		/* update accuracy html element */
		utils.htmlCounter(playDetails.accuracy.toFixed(2) + "%", "accuracy-container", "accuracy-digit-", Assets.scoreNumbers, "left", "calc(100vw - " + (document.getElementById("accuracy-container").childNodes.length * 1) + "vw)");
		/* rank grade */
		document.getElementById("grade").src = Assets.grades[playDetails.grade].src;
		/* combo pulse size */
		let els = document.getElementById("combo-container").querySelectorAll("img");
		for (let i = 0; i < els.length; i++) {
			els[i].style.width = 2 * (comboPulseSize + 1) + "vw";
		}
	}

	function renderMouse() {
		mouse.deleteMouseTrail(500);
		/* mouse trails */
		let numberOfMouseTrailsRendered = 0;
		let maxMouseTrails = 128;
		if (currentOptions.Gameplay.cursorTrails === "Interpolated") {
			for (let i = mouse.previousPositions.x.length - 1; i >= 0; i--) {
				let distance = utils.dist(mouse.previousPositions.x[i], mouse.previousPositions.y[i], mouse.previousPositions.x[i + 1], mouse.previousPositions.y[i + 1]);
				for (let j = distance; j >= 0; j -= 2) {
					canvas.setGlobalAlpha(utils.map(numberOfMouseTrailsRendered, 0, maxMouseTrails, 0.5, 0));
					canvas.drawImage(Assets.cursorTrail, utils.map(j, 0, distance, mouse.previousPositions.x[i], mouse.previousPositions.x[i + 1]), utils.map(j, 0, distance, mouse.previousPositions.y[i], mouse.previousPositions.y[i + 1]));
					numberOfMouseTrailsRendered++;
					/* prevent the rendering of too many trails otherwise it will lag */
					if (numberOfMouseTrailsRendered >= maxMouseTrails) {
						break;
					}
				}
				if (numberOfMouseTrailsRendered >= maxMouseTrails) {
					break;
				}
			}
		}
		canvas.setGlobalAlpha(1);
		if ((keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
			mouseSize += 1 / 16;
		}
		mouseSize += (1 - mouseSize) / 8;
		canvas.drawImage(Assets.cursor, mouse.position.x, mouse.position.y, Assets.cursor.width * mouseSize, Assets.cursor.height * mouseSize);
	}

	function detectSpinSpeed(useTime, previousTime, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y) {
		let b = utils.mapToOsuPixels(PLAYFIELD_CENTER_X, PLAYFIELD_CENTER_Y, window.innerHeight * playfieldSize * (4 / 3), window.innerHeight * playfieldSize, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y, playDetails.mods.hardRock);
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
			previousSigns.shift();
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
			if ((playDetails.mods.auto || playDetails.mods.relax || playDetails.mods.autopilot || playDetails.mods.noFail) === false) {
				document.getElementById("webpage-state-fail-screen").style.display = "block";
				audio.pause();
				isRunning = false;
				exitPointerLock();
			}
		}
		/* only start draining health 2 seconds before the first hit object*/
		if (useTime > currentLoadedMap.hitObjects[0].time - 2) {
			currentHP -= Formulas.HPDrain(currentLoadedMap.HPDrainRate, useTime - previousTime);
		}
		hpDisplay += (currentHP - hpDisplay) / 8;
	}

	function processHitEvent(useTime) {
		switch (hitEvents[0].score) {
			/* great*/
			case 300:
				playDetails.great++;
				break;
				/* ok */
			case 100:
				if (hitEvents[0].type === "hit-circle") {
					playDetails.ok++;
				}
				break;
				/* meh */
			case 50:
				playDetails.meh++;
				break;
				/* miss */
			case 0:
				playDetails.miss++;
				break;
		}
		if ((hitEvents[0].score > 50 || hitEvents[0].score === 0) && hitEvents[0].type === "hit-circle") {
			score += Formulas.hitScore(hitEvents[0].score, (combo === 0) ? combo : combo - 1, difficultyMultiplier, scoreMultiplier);
			let lifetime = (hitEvents[0].score === 0) ? 1 : 0.4;
			judgementObjects.push(new HitObject.ScoreObject(hitEvents[0].score, hitEvents[0].x, hitEvents[0].y, useTime, useTime + lifetime));
		} else {
			score += hitEvents[0].score;
		}
		if (hitEvents[0].combo === "increasing") {
			combo++;
			if (combo > playDetails.maxCombo) {
				playDetails.maxCombo = combo;
			}
			comboPulseSize = 1;
		} else if (hitEvents[0].combo === "reset") {
			if (combo >= 1) {
				playDetails.comboBreaks++;
			}
			combo = 0;
			document.getElementById("combo-container").innerHTML = "";
		}
		currentHP += Formulas.HP(currentLoadedMap.HPDrainRate, hitEvents[0].score, hitEvents[0].type, playDetails.mods);
		hitEvents.shift();
	}

	function nextHitObject() {
		/* create copy not reference, otherwise retrying wouldn't work */
		hitObjects.push(JSON.parse(JSON.stringify(currentLoadedMap.hitObjects[currentHitObject])));
		/* second bit flag determines new combo */
		if (currentLoadedMap.hitObjects[currentHitObject].type[2] === "1") {
			currentComboNumber = 1;
			currentComboColour++;
			if (currentComboColour >= currentLoadedMap.comboColours.length) {
				currentComboColour -= currentLoadedMap.comboColours.length;
			}
		}
		currentHitObject++;
	}

	function nextTimingPoint() {
		currentTimingPoint++;
		if (currentLoadedMap.timingPoints[currentTimingPoint].uninherited === 1) {
			timingPointUninheritedIndex = currentTimingPoint;
		}
	}

	function renderEffects(useTime) {
		for (let i = 0; i < judgementObjects.length; i++) {
			if (judgementObjects[i].lifetime - useTime >= 0) {
				/* ignore 300 hits */
				if (currentOptions.Gameplay.draw300Hits === false && judgementObjects[i].score === 300) {
					continue;
				}
				let useImage = -1;
				switch (judgementObjects[i].score) {
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
				canvas.setGlobalAlpha(Math.min(utils.map(useTime, judgementObjects[i].initialTime, judgementObjects[i].lifetime, 2, 0), 1));
				let size = circleDiameter * 0.75;
				if (judgementObjects[i].score === 0) {
					let x = Math.sin(utils.map(useTime, judgementObjects[i].initialTime, judgementObjects[i].lifetime, 0, 4 * Math.PI) * judgementObjects[i].rotationVelocity) * size / 64;
					let y = utils.map(useTime, judgementObjects[i].initialTime, judgementObjects[i].lifetime, 0, 75) ** 2 / 75 ** 1;
					ctx.translate(judgementObjects[i].x + x, judgementObjects[i].y + y);
					ctx.rotate(utils.map(useTime, judgementObjects[i].initialTime, judgementObjects[i].lifetime, 0, 1) * judgementObjects[i].rotationVelocity);
					canvas.drawImage(Assets.hitNumbers[useImage], 0, 0, size, size);
					ctx.resetTransform();
				} else {
					size *= JUDGEMENT_BEZIER_ANIMATION[Math.floor(utils.map(useTime, judgementObjects[i].initialTime, judgementObjects[i].lifetime, 0, JUDGEMENT_BEZIER_ANIMATION.length))].y
					canvas.drawImage(Assets.hitNumbers[useImage], judgementObjects[i].x, judgementObjects[i].y, size, size);
				}
			} else {
				judgementObjects.splice(i, 1);
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
			let useError = hitErrors[hitErrors.length - 1 - i];
			let alpha = utils.map(i, 40, 0, 0, 0.5);
			if (alpha <= 0) {
				alpha = 0;
			}
			canvas.setGlobalAlpha(alpha);
			if (utils.withinRange(useError, 0, odTime[2])) {
				canvas.setFillStyle("#66ccff");
			} else if (utils.withinRange(useError, 0, odTime[1])) {
				canvas.setFillStyle("#88b300");
			} else if (utils.withinRange(useError, 0, odTime[0])) {
				canvas.setFillStyle("#ffcc22");
			}
			ctx.fillRect(window.innerWidth / 2 + useError * 1000, window.innerHeight * 0.975 - window.innerHeight * 0.025 / 2, window.innerHeight * 0.005, window.innerHeight * 0.025);
		}
		let mean = utils.mean(hitErrors, (hitErrors.length > 40) ? hitErrors.length - 40 : 0, hitErrors.length);
		canvas.setGlobalAlpha(1);
		canvas.setFillStyle("#fff");
		ctx.fillRect(window.innerWidth / 2 + mean * 1000, window.innerHeight * 0.965 - window.innerHeight * 0.025 / 2, window.innerHeight * 0.005, window.innerHeight * 0.005);

	}
	function renderFlashlight() {
		flashlightCtx.globalCompositeOperation = "source-over";
		flashlightCtx.fillStyle = "rgba(0, 0, 0, 1)";
		flashlightCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
		flashlightCtx.globalCompositeOperation = "destination-out";
		flashlightCtx.beginPath();
		flashlightCtx.arc(mouse.position.x, mouse.position.y, flashlightSize, 0, Math.PI * 2, false);
		flashlightCtx.fillStyle = "white";
		flashlightCtx.shadowOffsetX = 0;
		flashlightCtx.shadowOffsetY = 0;
		flashlightCtx.shadowBlur = 40;
		flashlightCtx.shadowColor = "rgba(255, 255, 255, 1)";
		flashlightCtx.fill();
		flashlightCtx.fill();
		flashlightCtx.fill();
		flashlightCtx.fill();
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
			if (keyboard.getKeyDown("space") && document.getElementById("skip-button").style.opacity === "1") {
				audio.currentTime = currentLoadedMap.hitObjects[0].time - 2.5;
			}
			if (useTime > currentLoadedMap.hitObjects[0].time - 2 && currentHitObject === 0) {
				document.getElementById("skip-button").style.opacity = "0";
			}
			if (currentHitObject >= currentLoadedMap.hitObjects.length || (audio.currentTime > 0 && audio.paused)) {
				if (useTime > endingTime || (audio.currentTime > 0 && audio.paused)) {
					exitPointerLock();
					utils.showWebpageStates([
						"webpage-state-always",
						"top-bar",
						"webpage-state-results-screen",
						"bottom-bar"
					]);
					utils.hideWebpageStates([
						"webpage-state-beatmap-selection",
						"webpage-state-gameplay",
						"webpage-state-fail-screen",
						"webpage-state-pause-screen"
					]);
					let date = new Date();
					playDetails.datePlayed = utils.formatDate(date.getDate(), date.getMonth(), date.getFullYear(), date.getHours(), date.getMinutes());
					playDetails.unstableRate = utils.standardDeviation(hitErrors) * 1000 * 10;
					playDetails.title = currentLoadedMap.Title;
					playDetails.creator = currentLoadedMap.Creator;
					playDetails.artist = currentLoadedMap.Artist;
					playDetails.version = currentLoadedMap.Version;
					if (playDetails.miss === 0 && playDetails.sliderBreaks === 0) {
						playDetails.comboType = "Perfect";
					} else if (playDetails.miss === 0) {
						playDetails.comboType = "Full Combo";
					} else if (playDetails.miss <= 3) {
						playDetails.comboType = "Choke";
					} else {
						playDetails.comboType = "Clear";
					}
					endScreen.displayResults(playDetails);
					isRunning = false;
					audio.playbackRate = 1;
				}
			}
			detectSpinSpeed(useTime, previousTime, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y);
			updateHp(useTime, previousTime);
			/* +1 because the given time is beginning time, not end time */
			while (currentTimingPoint < currentLoadedMap.timingPoints.length - 1 && useTime >= currentLoadedMap.timingPoints[currentTimingPoint + 1].time) {
				nextTimingPoint();
			}
			while (currentHitObject < currentLoadedMap.hitObjects.length && useTime >= currentLoadedMap.hitObjects[currentHitObject].time - arTime) {
				nextHitObject();
			}
			/* Cache Loop */
			for (let i = 0; i < hitObjects.length; i++) {
				setHitObjectCache(hitObjects[i], useTime, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y);
			}
			/* Processing Loop */
			for (let i = 0; i < hitObjects.length; i++) {
				let spliced = processHitObject(hitObjects[i], useTime, previousTime, i, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y);
				if (spliced) {
					i--;
					if (i < 0) {
						i = 0;
					}
				}
			}
			/* Hit Events */
			while (hitEvents.length > 0) {
				processHitEvent(useTime);
			}
			playDetails.score = score;
			playDetails.accuracy = Formulas.accuracy(playDetails.great, playDetails.ok, playDetails.meh, playDetails.miss) * 100;
			playDetails.grade = Formulas.grade(playDetails.great, playDetails.ok, playDetails.meh, playDetails.miss, playDetails.mods);
			previousTime = useTime;

			if (combo >= 200) {
				flashlightSize = utils.map(60, 0, 512, 0, window.innerWidth);
			} else if (combo >= 100) {
				flashlightSize = utils.map(80, 0, 512, 0, window.innerWidth);
			} else {
				flashlightSize = utils.map(100, 0, 512, 0, window.innerWidth);
			}

			if (keyboard.getKeyDown("escape")) {
				document.getElementById("webpage-state-pause-screen").style.display = "block";
				audio.pause();
				exitPointerLock();
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

			canvas.setFillStyle("#ffdf0044");
			let x = utils.map(audio.currentTime, currentLoadedMap.hitObjects[0].time, endingTime, 0, window.innerWidth * 0.13);
			if (x < 0) {
				x = 0;
			}
			ctx.fillRect(window.innerWidth * 0.85, window.innerHeight * 0.065, x, 5);
			/* Render Loop */
			for (let i = hitObjects.length - 1; i >= 0; i--) {
				renderHitObject(hitObjects[i], useTime, HIT_OBJECT_OFFSET_X, HIT_OBJECT_OFFSET_Y);
			}
			renderEffects(useTime);
			/* hit errors */
			renderHitErrors();
			updateScore();
			renderMouse();
			if (playDetails.mods.flashlight) {
				renderFlashlight();
			}
		},
		continue: function() {
			isRunning = true;
			audio.play();
			enterPointerLock();
		},
		pause: function() {
			isRunning = false;
			audio.pause();
			exitPointerLock();
		},
		retry: function() {
			isRunning = false;
			this.playMap(currentLoadedMap, playDetails.mods);
		},
		playMap: function(mapData, mods) {
			currentOptions = Options.read();
			let hex = Math.round(utils.map(currentOptions.Gameplay.backgroundDim, 0, 1, 0, 255)).toString(16);
			document.getElementById("webpage-state-gameplay").style.background = "#000000" + hex;
			mouse.sensitivity = currentOptions.Inputs.mouseSensitivity * 10;
			enterPointerLock();
			if (mapData.hitObjects[0].time > 10) {
				document.getElementById("skip-button").style.opacity = "1";
			} else {
				document.getElementById("skip-button").style.opacity = "0";
			}
			currentLoadedMap = mapData;
			playDetails = new PlayDetails(mods);
			if (mods.flashlight === false) {
				document.getElementById("gameplay-flashlight").style.display = "none";
			} else {
				document.getElementById("gameplay-flashlight").style.display = "block";
			}
			currentHitObject = 0;
			hitEvents = [];
			hitObjects = [];
			hitErrors = [];
			judgementObjects = [];
			effectObjects = [];
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
			let database = indexedDB.open("osw-database");
			database.addEventListener("success", function(event) {
				let database = event.target.result;
				let objectStore = databaseManager.getObjectStore(database, "audio", "readonly");
				let request = objectStore.get(mapData.Creator + mapData.Title + mapData.AudioFilename);
				request.addEventListener("error", function(event) {
					console.error(`Attempt to find query failed: ${event.target.error}`);
				});
				request.addEventListener("success", function(event) {

					let audioType;
					if (event.target.result.name.toLowerCase().includes(".mp3")) {
						audioType = "mp3";
					} else if (event.target.result.name.toLowerCase().includes(".ogg")) {
						audioType = "ogg";
					} else if (event.target.result.name.toLowerCase().includes(".wav")) {
						audioType = "wav";
					}
					audio.src = `data:audio/${audioType};base64,${event.target.result.data}`;
					if (playDetails.mods.doubleTime || playDetails.mods.nightcore) {
						audio.playbackRate = 1.5;
					} else if (playDetails.mods.halfTime) {
						audio.playbackRate = 0.75;
					} else {
						audio.playbackRate = 1;
					}
					if (playDetails.mods.nightcore) {
						audio.preservesPitch = false;
					} else {
						audio.preservesPitch = true;
					}
				});
			});
			audio.currentTime = 0;
			/* Beatmap difficulty data */
			arTime = Formulas.AR(mapData.ApproachRate, playDetails.mods);
			arFadeIn = Formulas.ARFadeIn(mapData.ApproachRate, playDetails.mods);
			/* Map from osu!pixels to screen pixels */
			circleDiameter = utils.map(Formulas.CS(mapData.CircleSize, playDetails.mods) * 2, 0, 512, 0, window.innerHeight * playfieldSize * (4 / 3));
			odTime = Formulas.ODHitWindow(mapData.OverallDifficulty, playDetails.mods);
			let lastHitObject = currentLoadedMap.hitObjects[currentLoadedMap.hitObjects.length - 1];
			if (lastHitObject.type[0] === "1") {
				endingTime = lastHitObject.time + 2;
			}
			if (lastHitObject.type[1] === "1") {	
				let lastUninheritedTimingPoint = 0;
				for (let i = 0; i < currentLoadedMap.timingPoints.length; i++) {
					if (currentLoadedMap.timingPoints[i].uninherited === 1) {
						lastUninheritedTimingPoint = i;
						
					}
				}
				/* thanks to https://github.com/N3bby/osuBMParser/issues/2 */
				let sliderSpeedMultiplier = currentLoadedMap.SliderMultiplier;
				if (currentLoadedMap.timingPoints[currentLoadedMap.timingPoints.length - 1].uninherited === 1) {
					sliderSpeedMultiplier *= Formulas.sliderMultiplier(currentLoadedMap.timingPoints[currentLoadedMap.timingPoints.length - 1].beatLength);
				}
				let pixelsPerBeat = sliderSpeedMultiplier * currentLoadedMap.timingPoints[lastUninheritedTimingPoint].beatLength;
				let sliderLengthInBeats = (Math.abs(lastHitObject.length) * lastHitObject.slides) / pixelsPerBeat;
				let sliderTime = pixelsPerBeat * sliderLengthInBeats / 250;
				endingTime = lastHitObject.time + sliderTime + 2;
			}
			if (lastHitObject.type[3] === "1") {
				endingTime = lastHitObject.endTime + 2;
			}
			let drainTime = endingTime - mapData.hitObjects[0].time;
			difficultyMultiplier = Formulas.difficultyPoints(mapData.CircleSize, mapData.HPDrainRate, mapData.OverallDifficulty, mapData.hitObjects.length, drainTime);
			hitCircleComboBuffers = [];
			approachCircleComboBuffers = [];
			let hitCircleRgbks = canvas.generateRGBKs(Assets.hitCircle);
			let approachCircleRgbks = canvas.generateRGBKs(Assets.approachCircle);
			for (let i = 0; i < mapData.comboColours.length; i++) {
				let comboColours = mapData.comboColours[i];
				hitCircleComboBuffers.push(canvas.generateTintImage(Assets.hitCircle, hitCircleRgbks, comboColours.r, comboColours.g, comboColours.b, circleDiameter, circleDiameter));
				approachCircleComboBuffers.push(canvas.generateTintImage(Assets.approachCircle, approachCircleRgbks, comboColours.r, comboColours.g, comboColours.b));
			}
			isRunning = true;
		},
		playDetails: function() {
			return playDetails;
		},
		isRunning: function() {
			return isRunning;
		},
	};
});