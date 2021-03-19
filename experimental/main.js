// let canvas = document.getElementById("intro-logo");
// canvas.width = 0.8 * window.innerWidth;
// canvas.height = 0.8 * window.innerWidth;
// let ctx = canvas.getContext("2d");

// let pointArrays = [];


// window.addEventListener("mousemove", function(e) {
// 	console.log(map(e.x, 0, window.innerHeight * 0.8, 0, 1) + ", " + map(e.y, 0, window.innerHeight * 0.8, 0, 1));
// })

// let middle = canvas.height * 0.5;

// /* generate outside of logo */
// pointArrays.push([]);
// for (let i = 0; i <= 2 * Math.PI; i += Math.PI / 64) {
// 	let x = middle + Math.cos(i) * canvas.height * 0.5;
// 	let y = middle + Math.sin(i) * canvas.height * 0.5;
// 	pointArrays[pointArrays.length - 1].push({x: x, y: y});
// }

// /* generate inside of logo */
// pointArrays.push([]);
// for (let i = 0; i <= 2 * Math.PI; i += Math.PI / 64) {
// 	let x = middle + Math.cos(i) * canvas.height * 0.45;
// 	let y = middle + Math.sin(i) * canvas.height * 0.45;
// 	pointArrays[pointArrays.length - 1].push({x: x, y: y});
// }

// /* generate outside of O */
// pointArrays.push([]);
// for (let i = 0; i <= 2 * Math.PI; i += Math.PI / 64) {
// 	let offset = 1;
// 	if (i <= Math.PI / 2) {
// 		offset = map(i, 0, Math.PI / 2, 0.9, 1);
// 	} else if (i <= Math.PI) {
// 		offset = map(i, Math.PI / 2, Math.PI, 1, 0.9);
// 	} else if (i <= Math.PI * 1.5) {
// 		offset = map(i, Math.PI, Math.PI * 1.5, 0.9, 1);
// 	} else {
// 		offset = map(i, Math.PI * 1.5, Math.PI * 2, 1, 0.9);
// 	}
// 	let x = canvas.height * 0.25 + Math.cos(i) * canvas.height * 0.1 * offset;
// 	let y = canvas.height * 0.5 + Math.sin(i) * canvas.height * 0.1;
// 	pointArrays[pointArrays.length - 1].push({x: x, y: y});
// }
// /* generate inside of O */
// pointArrays.push([]);
// for (let i = 0; i <= 2 * Math.PI; i += Math.PI / 64) {
// 	let x = canvas.height * 0.25 + Math.cos(i) * canvas.height * 0.05 * 0.8;
// 	let y = canvas.height * 0.5 + Math.sin(i) * canvas.height * 0.05 * 1.2;
// 	pointArrays[pointArrays.length - 1].push({x: x, y: y});
// }

// /* generate exclamation dot */
// pointArrays.push([
// 	{
// 		x: 0.75 * canvas.height,
// 		y: 0.54 * canvas.height
// 	},
// 	{
// 		x: 0.805 * canvas.height,
// 		y: 0.54 * canvas.height
// 	},
// 	{
// 		x: 0.805 * canvas.height,
// 		y: 0.595 * canvas.height
// 	},
// 	{
// 		x: 0.75 * canvas.height,
// 		y: 0.595 * canvas.height
// 	},
// 	{
// 		x: 0.75 * canvas.height,
// 		y: 0.54 * canvas.height
// 	},
// ]);

// console.log(pointArrays);

// ctx.strokeStyle = "#f00";
// ctx.lineWidth = 3;
// for (let i = 0; i < pointArrays.length; i++) {
// 	ctx.beginPath();
// 	for (let j = 0; j < pointArrays[i].length; j++) {
// 		ctx.lineTo(pointArrays[i][j].x, pointArrays[i][j].y);
// 	}
// 	ctx.stroke();
// }



let first = true;
window.addEventListener("click", function() {
	if (first) {
		document.getElementById("audio").play();
		document.getElementById("audio").playbackRate = 1;
		first = false;
		animate();
	}
	console.log(audio.currentTime);
});

function map(num, numMin, numMax, mapMin, mapMax) {
	return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
}

let eventDone = [false, false, false, false, false, false, false, false, false];
let letterSpacing = 0;
function animate() {
	let audio = document.getElementById("audio");
	if (audio.currentTime >= 0.2 && eventDone[0] === false) {
		document.getElementById("intro-text").textContent = "wel";
		eventDone[0] = true;
	}
	if (audio.currentTime >= 0.4 && eventDone[1] === false) {
		document.getElementById("intro-text").textContent = "welcome";
		eventDone[1] = true;
	}
	if (audio.currentTime >= 0.6 && eventDone[2] === false) {
		document.getElementById("intro-text").textContent = "welcome to";
		eventDone[2] = true;
	}
	if (audio.currentTime >= 0.9 && eventDone[3] === false) {
		document.getElementById("intro-text").textContent = "welcome to osu!";
		document.getElementById("intro-text").style.letterSpacing = "0.325vh";
		eventDone[3] = true;
	}
	if (audio.currentTime >= 1.65 && eventDone[4] === false) {
		let introGamemodes = document.getElementsByClassName("intro-gamemodes");
		document.getElementById("intro-text").style.display = "none";
		for (let i = 0; i < introGamemodes.length; i++) {
			introGamemodes[i].style.display = "block";
			introGamemodes[i].style.top = (50 - 2) + "vh";
			introGamemodes[i].style.left = 50 - 1 + map(i, 0, 3, -25, 25) + "vw";
		}
		eventDone[4] = true;
	}
	if (audio.currentTime >= 1.9 && eventDone[5] === false) {
		let introGamemodes = document.getElementsByClassName("intro-gamemodes");
		document.getElementById("intro-text").style.display = "none";
		for (let i = 0; i < introGamemodes.length; i++) {
			introGamemodes[i].style.width = "8vh"
			introGamemodes[i].style.top = (50 - 4) + "vh";
			introGamemodes[i].style.left = 50 - 2 + map(i, 0, 3, -12.5, 12.5) + "vw";
		}
		eventDone[5] = true;
	}
	if (audio.currentTime >= 2.1 && eventDone[6] === false) {
		let introGamemodes = document.getElementsByClassName("intro-gamemodes");
		document.getElementById("intro-text").style.display = "none";
		for (let i = 0; i < introGamemodes.length; i++) {
			introGamemodes[i].style.width = "16vh"
			introGamemodes[i].style.top = (50 - 8) + "vh";
			introGamemodes[i].style.left = 50 - 4 + map(i, 0, 3, -17.5, 17.5) + "vw";
		}
		eventDone[6] = true;
	}
	if (audio.currentTime >= 2.3 && eventDone[7] === false) {
		let introGamemodes = document.getElementsByClassName("intro-gamemodes");
		document.getElementById("intro-text").style.display = "none";
		for (let i = 0; i < introGamemodes.length; i++) {
			introGamemodes[i].style.display = "none";
		}
		eventDone[7] = true;
	}
	if (audio.currentTime >= 3.2 && eventDone[8] === false) {
		let introGamemodes = document.getElementsByClassName("intro-gamemodes");
		document.getElementById("intro").style.background = "#fff";
		document.getElementById("intro").style.opacity = 0;
		for (let i = 0; i < introGamemodes.length; i++) {
			introGamemodes[i].style.display = "none";
		}
		eventDone[8] = true;
	}
	requestAnimationFrame(animate);
}