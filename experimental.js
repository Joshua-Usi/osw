define(function(require) {
	/* RequireJS Module Loading */
	const Formulas = require("./src/scripts/Formulas.js");
	const Mouse = require("./src/scripts/Mouse.js");
	const Keyboard = require("./src/scripts/Keyboard.js");
	const Song = require("./src/scripts/Song.js");
	const beatmap = require("./src/scripts/BeatMap.js");
	console.log(beatmap);
	const utils = require("./src/scripts/utils.js");
	let canvas = document.createElement("canvas");
	canvas.id = "gameplay";
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
	canvas.style.margin = "0";
	document.querySelector("body").appendChild(canvas);
	let ctx = canvas.getContext("2d");
	let mouse = new Mouse("body", 10);
	let keyboard = new Keyboard("body");
	mouse.setPosition(0, 0);
	mouse.init();
	keyboard.init();

	
	let cursor = new Image();
	cursor.src = "src/images/gameplay/cursor.png";
	let cursorTrail = new Image();
	cursorTrail.src = "src/images/gameplay/cursortrail.png";
	let hitCircle = new Image();
	hitCircle.src = "src/images/gameplay/hitCircle.png";
	let hitCircleOverlay = new Image();
	hitCircleOverlay.src = "src/images/gameplay/hitCircleoverlay.png";
	let approachCircle = new Image();
	approachCircle.src = "src/images/gameplay/approachcircle.png";
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
	ctx.font = "16px Arial";
	ctx.fillStyle = "#fff";

	let currentHitObject = 0;
	let hitObjects = [];

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

	let song = Song.create(beatmap.AudioFilename);
	let audio = new Audio(`src/audio/${song.src}`);
	audio.playbackRate = 1;
	audio.currentTime = beatmap.hitObjectsParsed[0].time - 5;
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

			while (currentHitObject < beatmap.hitObjects.length && audio.currentTime >= beatmap.hitObjectsParsed[currentHitObject].time) {
					hitObjects.push(beatmap.hitObjectsParsed[currentHitObject]);
					currentHitObject++;
			}

			let hitObjectOffsetX = playfieldXOffset + canvas.width / 2 - canvas.height * playfieldSize * (4 / 3) / 2;
			let hitObjectOffsetY = playfieldYOffset + canvas.height / 2 - canvas.height * playfieldSize / 2;
			for (var i = 0; i < hitObjects.length; i++) {
				let l = utils.map(audio.currentTime - hitObjects[i].time, 0, arTime, 4, 1.6);
				let hitObjectMappedX = utils.map(hitObjects[i].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3));
				let hitObjectMappedY = utils.map(hitObjects[i].y, 0, 384, 0, canvas.height * playfieldSize);
				if (l >= 4) {
					l = 4;
				}
				if (l <= 1.6) {
					l = 1.6;
					mouse.setPosition(hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY);
					mouse.click();
				}
				if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[2])) {
					ctx.fillStyle = "#00f";
				} else if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[1])) {
					ctx.fillStyle = "#0f0";
				} else if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[0])) {
					ctx.fillStyle = "#ffa500";
				} else {
					ctx.fillStyle = "#f00";
				}
				if (audio.currentTime - hitObjects[i].time > arTime) {
					ctx.globalAlpha = utils.map(audio.currentTime - hitObjects[i].time, arTime, arTime + odTime[0], 1, 0);
				} else {
					ctx.globalAlpha = utils.map(audio.currentTime - hitObjects[i].time, 0, arFadeIn, 0, 1);
				}
				ctx.beginPath();
				ctx.arc(hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY, circleDiameter / 2, 0, 2 * Math.PI);
				ctx.fill();
				ctx.drawImage(hitCircle, hitObjectOffsetX + hitObjectMappedX - circleDiameter / 2, hitObjectOffsetY + hitObjectMappedY - circleDiameter / 2, circleDiameter, circleDiameter);
				ctx.drawImage(hitCircleOverlay, hitObjectOffsetX + hitObjectMappedX - circleDiameter / 2, hitObjectOffsetY + hitObjectMappedY - circleDiameter / 2, circleDiameter, circleDiameter);
				ctx.drawImage(approachCircle, hitObjectOffsetX + hitObjectMappedX - (circleDiameter * l) / 2, hitObjectOffsetY + hitObjectMappedY - (circleDiameter * l) / 2, circleDiameter * l, circleDiameter * l);
				ctx.drawImage(hitNumbers[1], hitObjectOffsetX + hitObjectMappedX - hitNumbers[1].width / 2, hitObjectOffsetY + hitObjectMappedY - hitNumbers[1].width / 1.25);
			}
			ctx.globalAlpha = 1;

			for (var i = 0; i < hitObjects.length; i++) {
				if (audio.currentTime - hitObjects[i].time > arTime + odTime[0] / 2) {
					hitObjects.splice(i, 1);
					i--;
				}
			}

			let size = 1;
			if (mouse.isLeftButtonDown || keyboard.getKeyDown("z") || keyboard.getKeyDown("x")) {
				size = 0.8;
				for (var i = 0; i < hitObjects.length; i++) {
					let hitObjectMappedX = utils.map(hitObjects[i].x, 0, 512, 0, canvas.height * playfieldSize * (4 / 3));
					let hitObjectMappedY = utils.map(hitObjects[i].y, 0, 384, 0, canvas.height * playfieldSize);
					if (utils.dist(mouse.position.x, mouse.position.y, hitObjectOffsetX + hitObjectMappedX, hitObjectOffsetY + hitObjectMappedY) < circleDiameter / 2 && (mouse.isLeftButtonDown || keyboard.getKeyDown("z") || keyboard.getKeyDown("x"))) {
						if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[2])) {
							total300++;
							score += utils.hitScore(300, combo, utils.difficultyPoints(beatmap.CircleSize, beatmap.HPDrainRate, beatmap.OverallDifficulty), 1);
							combo++;
						} else if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[1])) {
							total100++;
							score += utils.hitScore(100, combo, utils.difficultyPoints(beatmap.CircleSize, beatmap.HPDrainRate, beatmap.OverallDifficulty), 1);
							combo++;
						} else if (utils.withinRange(audio.currentTime, hitObjects[i].time + arTime, odTime[0])) {
							total50++;
							score += utils.hitScore(50, combo, utils.difficultyPoints(beatmap.CircleSize, beatmap.HPDrainRate, beatmap.OverallDifficulty), 1);
							combo++;
						} else {
							combo = 0
							totalMisses++;
						}
						hitObjects.splice(i, 1);
						i--;
						mouse.unClick();
					}
				}
			}
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
			document.getElementById("score-container").style.left = "calc(100vw - " + (document.getElementById("score-container").childNodes.length * parseFloat(document.getElementById("score-digit-" + 0).width)) + "px)";
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
			for (let i = 0; i < mouse.previousPositions.x.length; i++) {
				ctx.drawImage(cursorTrail, mouse.previousPositions.x[i] - cursorTrail.width / 2, mouse.previousPositions.y[i] - cursorTrail.height / 2);
			}
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