define(function(require) {
	/* RequireJS Module Loading */
	const Formulas = require("./src/scripts/Formulas.js");
	const Mouse = require("./src/scripts/Mouse.js");
	const Keyboard = require("./src/scripts/Keyboard.js");
	const Song = require("./src/scripts/Song.js");
	const beatmap = require("./src/scripts/BeatMap.js");
	const Beizer = require("./src/scripts/Beizer.js");
	const utils = require("./src/scripts/utils.js");
	console.log(beatmap);
	/*canvas setup */
	let canvas = document.createElement("canvas");
	canvas.id = "gameplay";
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
	canvas.style.margin = "0";
	document.querySelector("body").appendChild(canvas);
	let ctx = canvas.getContext("2d");
	/* inputs setup */
	let mouse = new Mouse("body", 10);
	let keyboard = new Keyboard("body");
	mouse.setPosition(0, 0);
	mouse.init();
	keyboard.init();

	class ScoreObject {
		constructor(score, x, y, lifetime) {
			this.score = score;
			this.x = x;
			this.y = y;
			this.lifetime = lifetime;
		}
	}

	/* cursor assets */
	let cursor = new Image();
	cursor.src = "src/images/gameplay/cursor.png";
	let cursorTrail = new Image();
	cursorTrail.src = "src/images/gameplay/cursortrail.png";
	/* hit circle assets */
	let hitCircle = new Image();
	hitCircle.src = "src/images/gameplay/hitCircle.png";
	let hitCircleOverlay = new Image();
	hitCircleOverlay.src = "src/images/gameplay/hitCircleoverlay.png";
	let approachCircle = new Image();
	approachCircle.src = "src/images/gameplay/approachcircle.png";
	/* slider assets */
	sliderBody = new Image();
	sliderBody.src = "src/images/gameplay/sliderb0.png";
	sliderFollowCircle = new Image();
	sliderFollowCircle.src = "src/images/gameplay/sliderfoLlowcircle.png";
	sliderScorePoint = new Image();
	sliderScorePoint.src = "src/images/gameplay/sliderscorepoint.png";
	reverseArrow = new Image();
	reverseArrow.src = "src/images/gameplay/reverseArrow.png";
	/* spinner assets */
	let spinnerApproachCircle = new Image();
	spinnerApproachCircle.src = "src/images/gameplay/spinner-approachcircle.png";
	let spinnerRPM = new Image();
	spinnerRPM.src = "src/images/gameplay/spinner-rpm.png";
	let spinnerTop = new Image();
	spinnerTop.src = "src/images/gameplay/spinner-top.png";
	let hitNumbers = [
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
		new Image(),
	]
	hitNumbers[0].src = "src/images/gameplay/fonts/aller/default-0.png";
	hitNumbers[1].src = "src/images/gameplay/fonts/aller/default-1.png";
	hitNumbers[2].src = "src/images/gameplay/fonts/aller/default-2.png";
	hitNumbers[3].src = "src/images/gameplay/fonts/aller/default-3.png";
	hitNumbers[4].src = "src/images/gameplay/fonts/aller/default-4.png";
	hitNumbers[5].src = "src/images/gameplay/fonts/aller/default-5.png";
	hitNumbers[6].src = "src/images/gameplay/fonts/aller/default-6.png";
	hitNumbers[7].src = "src/images/gameplay/fonts/aller/default-7.png";
	hitNumbers[8].src = "src/images/gameplay/fonts/aller/default-8.png";
	hitNumbers[9].src = "src/images/gameplay/fonts/aller/default-9.png";
	let scoreNumbers = [
		new Image(),
		new Image(),
		new Image(),
		new Image(),
	]
	scoreNumbers[0].src = "src/images/gameplay/hit300.png"
	scoreNumbers[1].src = "src/images/gameplay/hit100.png"
	scoreNumbers[2].src = "src/images/gameplay/hit50.png"
	scoreNumbers[3].src = "src/images/gameplay/hit0.png"
	ctx.font = "16px Arial";
	ctx.fillStyle = "#fff";

	let currentHitObject = 0;
	let hitObjects = [];
	let scoreObjects = [];

	let firstClick = true;

	let playfieldSize = 0.8;
	let playfieldXOffset = 0;
	let playfieldYOffset = canvas.height / 50;

	let arTime = Formulas.AR(beatmap.ApproachRate);
	let arFadeIn = Formulas.ARFadeIn(beatmap.ApproachRate);
	let circleDiameter = Formulas.CS(beatmap.CircleSize) * 2;
	let odTime = Formulas.ODHitWindow(beatmap.OverallDifficulty);
	/* Map from osu!pixels to screen pixels */
	circleDiameter = utils.map(circleDiameter, 0, 512, 0, canvas.height * playfieldSize * (4 / 3));

	let score = 0;
	let scoreDisplay = 0;
	let total300 = 0;
	let total300g = 0;
	let total100 = 0;
	let total100g = 0;
	let total50 = 0;
	let totalMisses = 0;
	let combo = 0;

	let comboPulseSize = 1;

	let spin_speed = 0;

	let song = Song.create(beatmap.AudioFilename);
	let audio = new Audio(`src/audio/${song.src}`);
	audio.playbackRate = 1;
	audio.currentTime = 0;
	let k = 0;
	window.addEventListener("click", function() {
		if (firstClick) {
			firstClick = false;
			audio.play();
		}
		(function animate() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.rect(playfieldXOffset + canvas.width / 2 - canvas.height * playfieldSize * (4 / 3) / 2, playfieldYOffset + canvas.height / 2 - canvas.height * playfieldSize / 2, canvas.height * playfieldSize * (4 / 3), canvas.height * playfieldSize);
			ctx.stroke();
			ctx.closePath();
			/* for auto spin speed at 50 rad/s */
			k += 5 / 6;
			/* for spun out spin speed at 30rad/s */
			// k += 1 / 2;
			while (currentHitObject < beatmap.hitObjects.length && audio.currentTime >= beatmap.hitObjectsParsed[currentHitObject].time) {
					hitObjects.push(beatmap.hitObjectsParsed[currentHitObject]);
					currentHitObject++;
			}

			let hitObjectOffsetX = playfieldXOffset + canvas.width / 2 - canvas.height * playfieldSize * (4 / 3) / 2;
			let hitObjectOffsetY = playfieldYOffset + canvas.height / 2 - canvas.height * playfieldSize / 2;
			for (var i = 0; i < hitObjects.length; i++) {
				let l = utils.map(audio.currentTime - hitObjects[i].time, 0, arTime, 5, 1.6);
				let hitObjectMappedX = utils.map(hitObjects[i].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3));
				let hitObjectMappedY = utils.map(hitObjects[i].y, 0, 384, 0, canvas.height * playfieldSize);
				if (l >= 5) {
					l = 5;
				}
				if (hitObjects[i].type[3] === "1") {
					mouse.setPosition(innerWidth / 2 + Math.sin(k) * 100, innerHeight / 2 + Math.cos(k) * 100);
				} else if (i === 0) {
					mouse.changePosition((hitObjectOffsetX + hitObjectMappedX - mouse.position.x) / 2, (hitObjectOffsetY + hitObjectMappedY - mouse.position.y) / 2);
				}
				if (l <= 1.6) {
					l = 1.6;
					mouse.click();
				}
				// if (hitObjects[i].type[0] === "1") {
				/* hidden fade in and out */
				// if (utils.map(audio.currentTime - hitObjects[i].time, 0, arTime, 0, 1) < 0.4) {
				// 	ctx.globalAlpha = utils.map(audio.currentTime - hitObjects[i].time, 0, arTime * 0.4, 0, 1);
				// } else if (utils.map(audio.currentTime - hitObjects[i].time, 0, arTime, 0, 1) < 0.7) {
				// 	ctx.globalAlpha = utils.map(audio.currentTime - hitObjects[i].time, arTime * 0.4, arTime * 0.7, 1, 0);
				// } else {
				// 	ctx.globalAlpha = 0;
				// }
				/* normal fade in and out */
				if (utils.map(audio.currentTime - hitObjects[i].time, 0, arTime, 0, 1) <= 1) {
					ctx.globalAlpha = utils.map(audio.currentTime - hitObjects[i].time, 0, arFadeIn, 0, 1);
				} else {
					let alpha = utils.map(audio.currentTime - hitObjects[i].time, arTime, arTime + odTime[0] / 2, 1, 0);
					if (alpha < 0) {
						alpha = 0;
					}
					ctx.globalAlpha = alpha;
				}
			// }	
				if (hitObjects[i].type[0] === "1") {
					/* draw hit circle */
					ctx.drawImage(hitCircle, hitObjectOffsetX + hitObjectMappedX - circleDiameter / 2, hitObjectOffsetY + hitObjectMappedY - circleDiameter / 2, circleDiameter, circleDiameter);
					ctx.drawImage(hitCircleOverlay, hitObjectOffsetX + hitObjectMappedX - circleDiameter / 2, hitObjectOffsetY + hitObjectMappedY - circleDiameter / 2, circleDiameter, circleDiameter);
					ctx.drawImage(approachCircle, hitObjectOffsetX + hitObjectMappedX - (circleDiameter * l) / 2, hitObjectOffsetY + hitObjectMappedY - (circleDiameter * l) / 2, circleDiameter * l, circleDiameter * l);
					ctx.drawImage(hitNumbers[1], hitObjectOffsetX + hitObjectMappedX - hitNumbers[1].width / 2, hitObjectOffsetY + hitObjectMappedY - hitNumbers[1].width / 1.25);
				} else if (hitObjects[i].type[1] === "1") {
					/* draw slider */
					if (hitObjects[i].curveType === "B" || hitObjects[i].curveType === "P") {
						let points = [];
						/* determine slider red / white anchor */
						let beizerTemp = [];
						for (var j = 0; j < hitObjects[i].curvePoints.length; j++) {
							if (hitObjects[i].curvePoints[j + 1] && hitObjects[i].curvePoints[j].x === hitObjects[i].curvePoints[j + 1].x && hitObjects[i].curvePoints[j].y === hitObjects[i].curvePoints[j + 1].y) {
								points.push(hitObjects[i].curvePoints[j].x, hitObjects[i].curvePoints[j].y);
								beizerTemp.push(hitObjects[i].curvePoints[j]);
								let point = Beizer(beizerTemp);
								for (var k = 0; k < point.length; k++) {
									points.push(point[k]);
								}
								beizerTemp = [];
							} else {
								if (beizerTemp.length === 0) {
									beizerTemp.push(hitObjects[i].curvePoints[j]);
								}
								beizerTemp.push(hitObjects[i].curvePoints[j]);
							}
						}
						let point = Beizer(beizerTemp);
						for (var k = 0; k < point.length; k++) {
							points.push(point[k]);
						}
						beizerTemp = [];
						// for (var j = -1; j < hitObjects[i].curvePoints.length - 1; j++) {
						// 	if (j === -1) {
						// 		if (hitObjects[i].x === hitObjects[i].curvePoints[0].x && hitObjects[i].y === hitObjects[i].curvePoints[0].y) {
						// 			points.push([hitObjects[i].x, hitObjects[i].y]);
						// 		} else {
						// 			let point = Beizer(hitObjects[i].x, hitObjects[i].y, [hitObjects[i].curvePoints[0]]);
						// 			for (var k = 0; k < point.length; k++) {
						// 				points.push(point[k]);
						// 			}
						// 		}
						// 	} else {
						// 		if (hitObjects[i].curvePoints[j].x === hitObjects[i].curvePoints[j + 1].x && hitObjects[i].curvePoints[j].y === hitObjects[i].curvePoints[j + 1].y) {
						// 			points.push([hitObjects[i].curvePoints[j].x, hitObjects[i].curvePoints[j].y]);
						// 		} else {
						// 			let point = Beizer(hitObjects[i].curvePoints[j].x, hitObjects[i].curvePoints[j].y, [hitObjects[i].curvePoints[j + 1]]);
						// 			for (var k = 0; k < point.length; k++) {
						// 				points.push(point[k]);
						// 			}
						// 		}
						// 	}
						// }
						// points = Beizer(hitObjects[i].curvePoints);
						let inc = 1;
						/* if there are too many points, reduce the amount of drawnPoints */
						ctx.lineWidth = circleDiameter / 1.1;
						ctx.strokeStyle = "#fff";
						ctx.lineCap = "round";
						ctx.lineJoin = 'round';
						ctx.beginPath();
						for (var j = 0; j < points.length; j += inc) {
							ctx.lineTo(hitObjectOffsetX + utils.map(points[j][0], 0, 512, 0, canvas.height * playfieldSize * (4 / 3)), hitObjectOffsetY + utils.map(points[j][1], 0, 384, 0, canvas.height * playfieldSize));
						}
						ctx.stroke();
						ctx.lineWidth = circleDiameter / 1.2;
						ctx.strokeStyle = "#222";
						ctx.lineCap = "round";
						ctx.lineJoin = 'round';
						ctx.beginPath();
						for (var j = 0; j < points.length; j += inc) {
							ctx.lineTo(hitObjectOffsetX + utils.map(points[j][0], 0, 512, 0, canvas.height * playfieldSize * (4 / 3)), hitObjectOffsetY + utils.map(points[j][1], 0, 384, 0, canvas.height * playfieldSize));
						}
						ctx.stroke();
						if (hitObjects[i].slides > 1) {
							// ctx.translate();
							// ctx.rotate(-utils.direction(points[points.length - 4][0], points[points.length - 3][1], points[points.length - 2][0], points[points.length - 1][1]) + Math.PI / 2);
							// ctx.drawImage(reverseArrow, -circleDiameter / 2, -circleDiameter / 2, circleDiameter, circleDiameter);
							// ctx.resetTransform();
						} else {
							// ctx.drawImage(hitCircle, hitObjectOffsetX + utils.map(points[points.length - 1][0], 0, 512, 0, canvas.height * playfieldSize * (4 / 3)) - circleDiameter / 2, hitObjectOffsetY + utils.map(points[points.length - 1][1], 0, 384, 0, canvas.height * playfieldSize) - circleDiameter / 2, circleDiameter, circleDiameter);
							// ctx.drawImage(hitCircleOverlay, hitObjectOffsetX + utils.map(points[points.length - 1][0], 0, 512, 0, canvas.height * playfieldSize * (4 / 3)) - circleDiameter / 2, hitObjectOffsetY + utils.map(points[points.length - 1][1], 0, 384, 0, canvas.height * playfieldSize) - circleDiameter / 2, circleDiameter, circleDiameter);
						}
					} else if (hitObjects[i].curveType === "L") {
						ctx.lineWidth = circleDiameter / 1.1;
						ctx.strokeStyle = "#fff";
						ctx.lineCap = "round";
						ctx.lineJoin = 'round';
						ctx.beginPath();
						for (var j = 0; j < hitObjects[i].curvePoints.length; j++) {
							ctx.lineTo(hitObjectOffsetX + utils.map(hitObjects[i].curvePoints[j].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3)), hitObjectOffsetY + utils.map(hitObjects[i].curvePoints[j].y, 0, 384, 0, canvas.height * playfieldSize));
						}
						ctx.stroke();
						ctx.lineWidth = circleDiameter / 1.2;
						ctx.strokeStyle = "#222";
						ctx.lineCap = "round";
						ctx.lineJoin = 'round';
						ctx.beginPath();
						for (var j = 0; j < hitObjects[i].curvePoints.length; j++) {
							ctx.lineTo(hitObjectOffsetX + utils.map(hitObjects[i].curvePoints[j].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3)), hitObjectOffsetY + utils.map(hitObjects[i].curvePoints[j].y, 0, 384, 0, canvas.height * playfieldSize));
						}
						ctx.stroke();
						if (hitObjects[i].slides > 1) {
							ctx.translate(utils.map(hitObjectOffsetX + hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 1].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3)), hitObjectOffsetY + utils.map(hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 1].y, 0, 384, 0, canvas.height * playfieldSize));
							if (hitObjects[i].curvePoints.length >= 2) {
								ctx.rotate(-utils.direction(hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 4].x, hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 3].y, hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 2].x, hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 1].y) + Math.PI / 2);
							} else {
								ctx.rotate(-utils.direction(hitObjects[i].x, hitObjects[i].y, hitObjects[i].curvePoints[0].x, hitObjects[i].curvePoints[0].y) + Math.PI / 2);
							}
							ctx.drawImage(reverseArrow, -circleDiameter / 2, -circleDiameter / 2, circleDiameter, circleDiameter);
							ctx.resetTransform();
						} else {
							if (hitObjects[i].curvePoints.length >= 2) {
								ctx.drawImage(hitCircle, hitObjectOffsetX + utils.map(hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 1][0], 0, 512, 0, canvas.height * playfieldSize * (4 / 3)) - circleDiameter / 2, hitObjectOffsetY + utils.map(hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 1][1], 0, 384, 0, canvas.height * playfieldSize) - circleDiameter / 2, circleDiameter, circleDiameter);
								ctx.drawImage(hitCircleOverlay, hitObjectOffsetX + utils.map(hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 1][0], 0, 512, 0, canvas.height * playfieldSize * (4 / 3)) - circleDiameter / 2, hitObjectOffsetY + utils.map(hitObjects[i].curvePoints[hitObjects[i].curvePoints.length - 1][1], 0, 384, 0, canvas.height * playfieldSize) - circleDiameter / 2, circleDiameter, circleDiameter);
							} else {
								ctx.drawImage(hitCircle, hitObjectOffsetX + utils.map(hitObjects[i].curvePoints[0].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3)) - circleDiameter / 2, hitObjectOffsetY + utils.map(hitObjects[i].curvePoints[0].y, 0, 384, 0, canvas.height * playfieldSize) - circleDiameter / 2, circleDiameter, circleDiameter);
								ctx.drawImage(hitCircleOverlay, hitObjectOffsetX + utils.map(hitObjects[i].curvePoints[0].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3)) - circleDiameter / 2, hitObjectOffsetY + utils.map(hitObjects[i].curvePoints[0].y, 0, 384, 0, canvas.height * playfieldSize) - circleDiameter / 2, circleDiameter, circleDiameter);
							}
						}
					}
					ctx.drawImage(hitCircle, hitObjectOffsetX + hitObjectMappedX - circleDiameter / 2, hitObjectOffsetY + hitObjectMappedY - circleDiameter / 2, circleDiameter, circleDiameter);
					ctx.drawImage(hitCircleOverlay, hitObjectOffsetX + hitObjectMappedX - circleDiameter / 2, hitObjectOffsetY + hitObjectMappedY - circleDiameter / 2, circleDiameter, circleDiameter);
					ctx.drawImage(approachCircle, hitObjectOffsetX + hitObjectMappedX - (circleDiameter * l) / 2, hitObjectOffsetY + hitObjectMappedY - (circleDiameter * l) / 2, circleDiameter * l, circleDiameter * l);
					ctx.drawImage(hitNumbers[1], hitObjectOffsetX + hitObjectMappedX - hitNumbers[1].width / 2, hitObjectOffsetY + hitObjectMappedY - hitNumbers[1].width / 1.25);
				} else if (hitObjects[i].type[3] === "1") {
					/* draw spinner */
					let size = utils.map(hitObjects[i].endTime - audio.currentTime, 0, hitObjects[i].endTime - hitObjects[i].time, 0, 0.8);
					ctx.drawImage(spinnerApproachCircle, hitObjectOffsetX + hitObjectMappedX - size * innerHeight / 2, hitObjectOffsetY + hitObjectMappedY - size * innerHeight / 2, size * innerHeight, size * innerHeight);
					ctx.drawImage(spinnerTop, hitObjectOffsetX + hitObjectMappedX - 0.2 * innerHeight / 2, hitObjectOffsetY + hitObjectMappedY - 0.2 * innerHeight / 2, 0.2 * innerHeight, 0.2 * innerHeight);
				}
				if (utils.dist(mouse.position.x, mouse.position.y, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY) < circleDiameter / 2 && (mouse.isLeftButtonDown || keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
					if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[2])) {
						total300++;
						score += utils.hitScore(300, combo, utils.difficultyPoints(beatmap.CircleSize, beatmap.HPDrainRate, beatmap.OverallDifficulty), 1);
						combo++;
						// scoreObjects.push(new ScoreObject(300, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY, audio.currentTime + 1));
						comboPulseSize = 1;
					} else if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[1])) {
						total100++;
						score += utils.hitScore(100, combo, utils.difficultyPoints(beatmap.CircleSize, beatmap.HPDrainRate, beatmap.OverallDifficulty), 1);
						combo++;
						scoreObjects.push(new ScoreObject(100, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY, audio.currentTime + 1));
						comboPulseSize = 1;
					} else if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[0])) {
						total50++;
						score += utils.hitScore(50, combo, utils.difficultyPoints(beatmap.CircleSize, beatmap.HPDrainRate, beatmap.OverallDifficulty), 1);
						combo++;
						scoreObjects.push(new ScoreObject(50, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY, audio.currentTime + 1));
						comboPulseSize = 1;
					} else {
						combo = 0
						totalMisses++;
						scoreObjects.push(new ScoreObject(0, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY, audio.currentTime + 1));
						document.getElementById("combo-container").innerHtml = "";
					}
					hitObjects.splice(i, 1);
					i--;
					mouse.unClick();
				}
				if (i <= -1) {
					i = 0;
					if (hitObjects.length === 0) {
						continue;
					}
				}
				if (hitObjects[i].type[0] === "1" && audio.currentTime - hitObjects[i].time > arTime + odTime[0] / 2) {
					let hitObjectMappedX = utils.map(hitObjects[i].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3));
					let hitObjectMappedY = utils.map(hitObjects[i].y, 0, 384, 0, canvas.height * playfieldSize);
					combo = 0;
					totalMisses++;
					scoreObjects.push(new ScoreObject(0, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY, audio.currentTime + 1));
					hitObjects.splice(i, 1);
					i--;
					document.getElementById("combo-container").innerHtml = "";
				} else if (false) {

				} else if (hitObjects[i].type[3] === "1" && audio.currentTime >= hitObjects[i].endTime) {
					let hitObjectMappedX = utils.map(hitObjects[i].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3));
						let hitObjectMappedY = utils.map(hitObjects[i].y, 0, 384, 0, canvas.height * playfieldSize);
						combo = 0;
						totalMisses++;
						scoreObjects.push(new ScoreObject(0, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY, audio.currentTime + 1));
						hitObjects.splice(i, 1);
						i--;
						document.getElementById("combo-container").innerHtml = "";
					}
					ctx.globalAlpha = 1;
				}

			let size = 1;
			if (mouse.isLeftButtonDown || keyboard.getKeyDown("z") || keyboard.getKeyDown("x")) {
				size = 0.8;
			}
			for (var i = 0; i < scoreObjects.length; i++) {
				if (scoreObjects[i].lifetime - audio.currentTime > 0) {
					let useImage = -1;
					if (scoreObjects[i].score === 300) {
						useImage = 0
					} else if (scoreObjects[i].score === 100) {
						useImage = 1;
					} else if (scoreObjects[i].score === 50) {
						useImage = 2;
					} else if (scoreObjects[i].score === 0) {
						useImage = 3
					}
					ctx.globalAlpha = utils.map(scoreObjects[i].lifetime - audio.currentTime, 1, 0, 1, 0);
					let size = circleDiameter * 0.75 * utils.map(scoreObjects[i].lifetime - audio.currentTime, 1, 0, 1, 1.1);
					ctx.drawImage(scoreNumbers[useImage], scoreObjects[i].x - size / 2, scoreObjects[i].y - size / 2, (size), (size));
				} else {
					scoreObjects.splice(i, 1);
					i--;
				}
			}
			comboPulseSize -= comboPulseSize / 8;
			ctx.globalAlpha = 1;
			scoreDisplay += (score - scoreDisplay) / 8;
			let scoreDigits = utils.reverse(Math.round(scoreDisplay) + "");
			for (var i = 0; i < scoreDigits.length; i++) {
				if (document.getElementById("score-digit-" + i) === null) {
					let image = new Image();
					image.src = "src/images/gameplay/fonts/aller/score-" + scoreDigits[i] + ".png"; 
					image.id = "score-digit-" + i;
					document.getElementById("score-container").insertBefore(image, document.getElementById("score-container").childNodes[0]);
				} else {
					document.getElementById("score-digit-" + i).src = "src/images/gameplay/fonts/aller/score-" + scoreDigits[i] + ".png";
				}
			}
			document.getElementById("score-container").style.left = "calc(100vw - " + (document.getElementById("score-container").childNodes.length * 0.02 * innerWidth) + "px)";
			let comboDigits = utils.reverse(combo + "x");
			for (var i = 0; i < comboDigits.length; i++) {
				if (document.getElementById("combo-digit-" + i) === null) {
					let image = new Image();
					image.src = "src/images/gameplay/fonts/aller/score-" + comboDigits[i] + ".png"; 
					image.id = "combo-digit-" + i;
					document.getElementById("combo-container").insertBefore(image, document.getElementById("combo-container").childNodes[0]);
				} else {
					document.getElementById("combo-digit-" + i).src = "src/images/gameplay/fonts/aller/score-" + comboDigits[i] + ".png";
				}
			}
			document.getElementById("combo-container").style.top = "calc(100vh - 52 / 32 * " + 2 * (comboPulseSize + 1) + "vw)";
			let accuracyDigits = ("%" + utils.reverse("" + (utils.accuracy(total300, total100, total50, totalMisses) * 100).toPrecision(4)));
			for (var i = 0; i < accuracyDigits.length; i++) {
				if (document.getElementById("accuracy-digit-" + i) === null) {
					let image = new Image();
					if (/^[0-9]+$/.test(accuracyDigits)) {
						image.src = "src/images/gameplay/fonts/aller/score-" + accuracyDigits[i] + ".png"; 
					} else {
						let trueSrc = "";
						if (accuracyDigits[i] === ".") {
							trueSrc = "dot";
						} else if (accuracyDigits[i] === ",") {
							trueSrc = "comma";
						} else if (accuracyDigits[i] === "%") {
							trueSrc = "percent";
						}
						image.src = "src/images/gameplay/fonts/aller/score-" + trueSrc + ".png"; 
					}
					image.id = "accuracy-digit-" + i;
					document.getElementById("accuracy-container").insertBefore(image, document.getElementById("accuracy-container").childNodes[0]);
				} else {
					let image = document.getElementById("accuracy-digit-" + i);
					if (/^[0-9]+$/.test(accuracyDigits[i])) {
						image.src = "src/images/gameplay/fonts/aller/score-" + accuracyDigits[i] + ".png"; 
					} else {
						let trueSrc = "";
						if (accuracyDigits[i] === ".") {
							trueSrc = "dot";
						} else if (accuracyDigits[i] === ",") {
							trueSrc = "comma";
						} else if (accuracyDigits[i] === "%") {
							trueSrc = "percent";
						}
						image.src = "src/images/gameplay/fonts/aller/score-" + trueSrc + ".png"; 
					}
	
				}
			}
			document.getElementById("accuracy-container").style.left = "calc(100vw - " + (document.getElementById("accuracy-container").childNodes.length * 0.01 * innerWidth) + "px)";
			let els = document.getElementById("combo-container").querySelectorAll("img");
			for (var i = 0; i < els.length; i++) {
				els[i].style.width = 2 * (comboPulseSize + 1) + "vw";
			}
			for (let i = 0; i < mouse.previousPositions.x.length - 1; i++) {
				ctx.globalAlpha = utils.map(i, 0, mouse.previousPositions.x.length - 1, 0, 1);
				for (var j = 0; j < utils.dist(mouse.previousPositions.x[i], mouse.previousPositions.y[i], mouse.previousPositions.x[i + 1], mouse.previousPositions.y[i + 1]) / (cursorTrail.width / 2); j++) {
					ctx.drawImage(cursorTrail,
						utils.map(j, 0, utils.dist(mouse.previousPositions.x[i], mouse.previousPositions.y[i], mouse.previousPositions.x[i + 1], mouse.previousPositions.y[i + 1]) / (cursorTrail.width / 2), mouse.previousPositions.x[i], mouse.previousPositions.x[i + 1]) - cursorTrail.width / 2, 
						utils.map(j, 0, utils.dist(mouse.previousPositions.x[i], mouse.previousPositions.y[i], mouse.previousPositions.x[i + 1], mouse.previousPositions.y[i + 1]) / (cursorTrail.width / 2), mouse.previousPositions.y[i], mouse.previousPositions.y[i + 1]) - cursorTrail.height / 2);
				}
			}
			ctx.globalAlpha = 1;
			ctx.drawImage(cursor, mouse.position.x - (cursor.width * size) / 2, mouse.position.y - (cursor.height * size) / 2, cursor.width * size, cursor.height * size);

			ctx.fillStyle = "#fff";
			ctx.fillText(mouse.events.length + " pointer events per second", 10, 20);
			ctx.fillText(mouse.position.x + ", " + mouse.position.y, 10, 40);
			ctx.fillText(frameRate + "fps", 10, 60);
			ctx.fillText(audio.currentTime + "s", 10, 80);
			ctx.fillText("Score: " + score, 10, 100);
			ctx.fillText("Combo: " + combo, 10, 120);
			document.getElementById("grade").src = "src/images/gameplay/ranking-" + utils.grade(total300, total100, total50, totalMisses, false) + "-small.png"
			ctx.fillText("Accuracy: " + Math.round(utils.accuracy(total300, total100, total50, totalMisses) * 10000) / 100  + "%", 10, 140);
			ctx.fillText("300s: " + total300, 10, 160);
			ctx.fillText("100s: " + total100, 10, 180);
			ctx.fillText("50s: " + total50, 10, 200);
			ctx.fillText("Misses: " + totalMisses, 10, 220);
			requestAnimationFrame(animate);
		})();
	})
	/* Profiling ----------------------------------------------------------------------------------------------- */
	let times = [];
	let time = 0;
	let timeNow = 0;
	let frameRate = 0;
	function calculateFPS() {
		window.requestAnimationFrame(() => {
			const now = window.performance.now();
			while (times.length > 0 && times[0] <= now - 1000) {
				times.shift();
			}
			times.push(now);
			frameRate = times.length;
			calculateFPS();
		});
	}
	calculateFPS();
});
