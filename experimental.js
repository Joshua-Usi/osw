(function() {
	let canvas = document.createElement("canvas");
	canvas.id = "gameplay";
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
	canvas.style.margin = "0";
	document.querySelector("body").appendChild(canvas);
	let ctx = canvas.getContext("2d");
	let mouse = new Mouse("body", 10);
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

	let p = 0;
	let approaches = [];
	let approachesX = [];
	let approachesY = [];
	let approachNumbers = [];
	let firstClick = true;
	window.addEventListener("click", function() {
		if (firstClick) {
			firstClick = false;
			let song = new Song("tutorial.ogg", new Bpm(160));
			let audio = new Audio(`src/audio//gameplay${song.src}`);
			audio.play();
		}
	})
	window.addEventListener("load", function() {
		(function animate() {
			p++;
			if (p % 5 === 0) {
				approaches.push(1.5 * 2);
				approachesX.push(randomInt(300, 1050));
				approachesY.push(randomInt(70, 620));
				approachNumbers.push((p / 5) % 10);
			}
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			let CircleSize = 0;
			let CircleRadius = CS(2);
			/* Map from osu!pixels to screen pixels */
			CircleRadius = map(CircleRadius, 0, 512, 0, canvas.width);

			for (var i = 0; i < approaches.length; i++) {
				ctx.drawImage(hitCircle, approachesX[i] - CircleRadius / 2, approachesY[i] - CircleRadius / 2, CircleRadius, CircleRadius);
				ctx.drawImage(hitCircleOverlay, approachesX[i] - CircleRadius / 2, approachesY[i] - CircleRadius / 2, CircleRadius, CircleRadius);
				ctx.drawImage(approachCircle, approachesX[i] - (CircleRadius * approaches[i]) / 2, approachesY[i] - (CircleRadius * approaches[i]) / 2, CircleRadius * approaches[i], CircleRadius * approaches[i]);
				ctx.drawImage(numbers[approachNumbers[i]], approachesX[i] - numbers[1].width / 2, approachesY[i] - numbers[1].width / 2);
			}

			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.rect(canvas.width / 2 - canvas.height * 0.8 * (4 / 3) / 2, canvas.height / 2 - canvas.height * 0.8 / 2, canvas.height * 0.8 * (4 / 3), canvas.height * 0.8);
			ctx.stroke();
			ctx.closePath();

			for (var i = 0; i < approaches.length; i++) {
				if (approaches[i] > 1.5) {
					approaches[i] -= 0.05;
				} else {
					approaches.splice(i, 1);
					approachesX.splice(i, 1);
					approachesY.splice(i, 1);
					approachNumbers.splice(i, 1);
					i--;
				}
			}

			let size = 1;
			if (mouse.isLeftButtonDown) {
				size = 0.8;
			}
			mouse.position.x += (approachesX[0] - mouse.position.x) / 8;
			mouse.position.y += (approachesY[0] - mouse.position.y) / 8;
			for (let i = 0; i < mouse.previousPositions.x.length; i++) {
				ctx.drawImage(cursorTrail, mouse.previousPositions.x[i] - cursorTrail.width / 2, mouse.previousPositions.y[i] - cursorTrail.height / 2);
			}
			ctx.drawImage(cursor, mouse.position.x - (cursor.width * size) / 2, mouse.position.y - (cursor.height * size) / 2, cursor.width * size, cursor.height * size);

			ctx.fillText(mouse.events.length + " pointer events per second", 10, 20);
			ctx.fillText(mouse.position.x + ", " + mouse.position.y, 10, 40);
			requestAnimationFrame(animate);
		})();
	})
	function randomInt(min, max) {
		return Math.round((Math.random() * (max - min)) + min);
	}
	function map(num, numMin, numMax, mapMin, mapMax) {
		return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
	}
})();