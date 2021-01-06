(function() {
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
	hitCircle.src = "src/images/gameplay/hitcircle.png";
	let hitCircleOverlay = new Image();
	hitCircleOverlay.src = "src/images/gameplay/hitcircleoverlay.png";
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

	let hitObjects = [];

	let p = 0;
	let firstClick = true;

	let arTime = AR(10);
	let arFadeIn = ARFadeIn(10);

	let song = new Song("tutorial.ogg", new Bpm(160));
	let audio = new Audio(`src/audio/${song.src}`);
	audio.playbackRate = 1;
	window.addEventListener("click", function() {
		if (firstClick) {
			firstClick = false;
			audio.play();
		}
		(function animate() {
			if (p % 1 === 0) {
				hitObjects.push(new HitCircle(audio.currentTime, randomInt(300, 1050), randomInt(70, 620), 1));
			}
			p++;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			let CircleSize = 0;
			let CircleRadius = CS(4);
			/* Map from osu!pixels to screen pixels */
			CircleRadius = map(CircleRadius, 0, 512, 0, canvas.width);

			for (var i = 0; i < hitObjects.length; i++) {
				let l = map(audio.currentTime - hitObjects[i].time, 0, arTime, 4, 1.5);
				// ctx.save();
				ctx.globalAlpha = map(audio.currentTime - hitObjects[i].time, 0, arFadeIn, 0, 1)
				ctx.drawImage(hitCircle, hitObjects[i].x - CircleRadius / 2, hitObjects[i].y - CircleRadius / 2, CircleRadius, CircleRadius);
				ctx.drawImage(hitCircleOverlay, hitObjects[i].x - CircleRadius / 2, hitObjects[i].y - CircleRadius / 2, CircleRadius, CircleRadius);
				ctx.drawImage(approachCircle, hitObjects[i].x - (CircleRadius * l) / 2, hitObjects[i].y - (CircleRadius * l) / 2, CircleRadius * l, CircleRadius * l);
				ctx.drawImage(numbers[hitObjects[i].comboNumber], hitObjects[i].x - numbers[hitObjects[i].comboNumber].width / 2, hitObjects[i].y - numbers[hitObjects[i].comboNumber].width / 1.25);
				// ctx.restore();	
			}
			ctx.globalAlpha = 1;

			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			ctx.beginPath();
			let playfieldSize = 0.8;
			let playfieldXOffset = 0;
			let playfieldYOffset = canvas.height / 50;
			ctx.rect(playfieldXOffset + canvas.width / 2 - canvas.height * playfieldSize * (4 / 3) / 2, playfieldYOffset + canvas.height / 2 - canvas.height * playfieldSize / 2, canvas.height * playfieldSize * (4 / 3), canvas.height * playfieldSize);
			ctx.stroke();
			ctx.closePath();

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
			try {
				mouse.changePosition((hitObjects[0].x - mouse.position.x) / 4, (hitObjects[0].y - mouse.position.y) / 4);
			} catch (e) {
				console.error(e);
			}
			for (let i = 0; i < mouse.previousPositions.x.length; i++) {
				ctx.drawImage(cursorTrail, mouse.previousPositions.x[i] - cursorTrail.width / 2, mouse.previousPositions.y[i] - cursorTrail.height / 2);
			}
			ctx.drawImage(cursor, mouse.position.x - (cursor.width * size) / 2, mouse.position.y - (cursor.height * size) / 2, cursor.width * size, cursor.height * size);

			ctx.fillText(mouse.events.length + " pointer events per second", 10, 20);
			ctx.fillText(mouse.position.x + ", " + mouse.position.y, 10, 40);
			ctx.fillText(frameRate + "fps", 10, 60);
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
})();