// (function() {
	let canvas = document.createElement("canvas");
	canvas.id = "gameplay";
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
	canvas.style.margin = "0";
	document.querySelector("body").appendChild(canvas);
	let ctx = canvas.getContext("2d");
	let mouse = new Mouse("body", 10);
	mouse.setPosition(0, 0);
	mouse.init();
	
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
	let numbers = [
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
	numbers[0].src = "src/images/gameplay/fonts/aller/default-0.png";
	numbers[1].src = "src/images/gameplay/fonts/aller/default-1.png";
	numbers[2].src = "src/images/gameplay/fonts/aller/default-2.png";
	numbers[3].src = "src/images/gameplay/fonts/aller/default-3.png";
	numbers[4].src = "src/images/gameplay/fonts/aller/default-4.png";
	numbers[5].src = "src/images/gameplay/fonts/aller/default-5.png";
	numbers[6].src = "src/images/gameplay/fonts/aller/default-6.png";
	numbers[7].src = "src/images/gameplay/fonts/aller/default-7.png";
	numbers[8].src = "src/images/gameplay/fonts/aller/default-8.png";
	numbers[9].src = "src/images/gameplay/fonts/aller/default-9.png";

	ctx.font = "16px Arial";
	ctx.fillStyle = "#fff";

	let currentHitObject = 0;
	let hitObjects = [];

	let firstClick = true;

	let playfieldSize = 0.8;
	let playfieldXOffset = 0;
	let playfieldYOffset = canvas.height / 50;

	let arTime = AR(beatmap.ApproachRate);
	let arFadeIn = ARFadeIn(beatmap.ApproachRate);
	let circleDiameter = CS(beatmap.CircleSize) * 2;
	/* Map from osu!pixels to screen pixels */
	circleDiameter = map(circleDiameter, 0, 512, 0, canvas.height * playfieldSize * (4 / 3));

	let song = new Song(beatmap.AudioFilename);
	let audio = new Audio(`src/audio/${song.src}`);
	audio.playbackRate = 1;
	window.addEventListener("click", function() {
		if (firstClick) {
			firstClick = false;
			audio.play();
		} else {
			audio.currentTime = beatmap.PreviewTime / 1000 - 5;
		}
		(function animate() {
			if (currentHitObject < beatmap.hitObjects.length && audio.currentTime >= beatmap.hitObjectsParsed[currentHitObject].time) {
				hitObjects.push(beatmap.hitObjectsParsed[currentHitObject]);
				currentHitObject++;
			}
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.rect(playfieldXOffset + canvas.width / 2 - canvas.height * playfieldSize * (4 / 3) / 2, playfieldYOffset + canvas.height / 2 - canvas.height * playfieldSize / 2, canvas.height * playfieldSize * (4 / 3), canvas.height * playfieldSize);
			ctx.stroke();
			ctx.closePath();

			let hitObjectOffsetX = playfieldXOffset + canvas.width / 2 - canvas.height * playfieldSize * (4 / 3) / 2;
			let hitObjectOffsetY = playfieldYOffset + canvas.height / 2 - canvas.height * playfieldSize / 2;
			for (var i = 0; i < hitObjects.length; i++) {
				let l = map(audio.currentTime - hitObjects[i].time, 0, arTime, 4, 1.5);
				if (l > 4 || l < 0) {
					continue;
				}
				// ctx.save();
				ctx.globalAlpha = map(audio.currentTime - hitObjects[i].time, 0, arFadeIn, 0, 1)
				ctx.drawImage(hitCircle, hitObjectOffsetX + hitObjects[i].x - circleDiameter / 2, hitObjectOffsetY + hitObjects[i].y - circleDiameter / 2, circleDiameter, circleDiameter);
				ctx.drawImage(hitCircleOverlay, hitObjectOffsetX + hitObjects[i].x - circleDiameter / 2, hitObjectOffsetY + hitObjects[i].y - circleDiameter / 2, circleDiameter, circleDiameter);
				ctx.drawImage(approachCircle, hitObjectOffsetX + hitObjects[i].x - (circleDiameter * l) / 2, hitObjectOffsetY + hitObjects[i].y - (circleDiameter * l) / 2, circleDiameter * l, circleDiameter * l);
				ctx.drawImage(numbers[1], hitObjectOffsetX + hitObjects[i].x - numbers[1].width / 2, hitObjectOffsetY + hitObjects[i].y - numbers[1].width / 1.25);
				// ctx.restore();	
			}
			ctx.globalAlpha = 1;

			for (var i = 0; i < hitObjects.length; i++) {
				if (audio.currentTime - hitObjects[i].time > arTime) {
					hitObjects.splice(i, 1);
					i--;
				}
			}

			let size = 1;
			if (mouse.isLeftButtonDown) {
				size = 0.8;
			}
			for (let i = 0; i < mouse.previousPositions.x.length; i++) {
				ctx.drawImage(cursorTrail, mouse.previousPositions.x[i] - cursorTrail.width / 2, mouse.previousPositions.y[i] - cursorTrail.height / 2);
			}
			ctx.drawImage(cursor, mouse.position.x - (cursor.width * size) / 2, mouse.position.y - (cursor.height * size) / 2, cursor.width * size, cursor.height * size);

			ctx.fillText(mouse.events.length + " pointer events per second", 10, 20);
			ctx.fillText(mouse.position.x + ", " + mouse.position.y, 10, 40);
			ctx.fillText(frameRate + "fps", 10, 60);
			ctx.fillText(audio.currentTime + "s", 10, 80);
			requestAnimationFrame(animate);
		})();
	})
	function randomInt(min, max) {
		return Math.round((Math.random() * (max - min)) + min);
	}
	function map(num, numMin, numMax, mapMin, mapMax) {
		return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
	}
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
// })();