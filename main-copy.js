let applicationProgrammingInterfaceAccessKey = "0fa1772fa3f264e1f7a21a68773d4bf3c08caa69";
let mouse = {
	x: 0,
	y: 0,
};
let audio = new Audio(`src/audio/${"cYsmix - Triangles"}.mp3`);
audio.addEventListener("play", function() {
	document.getElementById("now-playing").innerText = "Now Playing: " + "cYsmix - Triangles";
})
audio.addEventListener("ended", function() {
	this.play();
})
audio.playbackRate = 1;
audio.id = "menu-audio";
let canvas = document.getElementById("audio-visualiser");
canvas.width = 0.7 * innerHeight;
canvas.height = 0.7 * innerHeight;
/* Need to append for wave.js */
document.querySelector("body").appendChild(audio);
let isFirstClick = true;
let currentSources = 0;
let offset = 0;
let time = 0;
let lastTime = 0;
let accumulator = 0;
let bpm = parseInt(document.getElementById("bpm").value);
/* Fetch --------------------------------------------------------------------------------------------------- */
fetch(`https://osu.ppy.sh/api/get_user?u=experimentator&k=${applicationProgrammingInterfaceAccessKey}`).then(function(response) {
	if (response.status !== 200) {
		console.log('Looks like there was a problem. Status Code: ' + response.status);
		return;
	}
	// Examine the text in the response
	response.json().then(function(res) {
		console.log(res);
		document.getElementById("avatar").src = `https://a.ppy.sh/${res[0].user_id}`;
		document.getElementById("welcome-user").innerText = "Welcome " + res[0].username;
	});
}).catch(function(err) {
	console.log('Fetch Error', err);
});
/* Local Storage ------------------------------------------------------------------------------------------- */
if (window.localStorage.getItem("use_low_power_mode") == parseInt(1)) {
	document.getElementById("low-power-mode").checked = true;
}
if (window.localStorage.getItem("volume_music")) {
	document.getElementById("volume").value = window.localStorage.getItem("volume_music") * 100;
	document.getElementById("volume").dispatchEvent(new CustomEvent("input", {
	"detail": "set slider"
}));
}
/* Event Listeners ----------------------------------------------------------------------------------------- */
window.addEventListener('mousemove', function(event) {
	mouse.x = event.x;
	mouse.y = event.y;
});
window.addEventListener("click", function() {
	if (isFirstClick) {
		audio.volume = window.localStorage.getItem("volume_music");
		audio.play();
		isFirstClick = false;
		time = 0;
		lastTime = 0;
	}
});
window.addEventListener("resize", function() {
	let canvas = document.getElementById("audio-visualiser");
	canvas.width = 0.7 * innerHeight;
	canvas.height = 0.7 * innerHeight;
})
window.addEventListener("load", function() {
	(function animate() {
		let image = document.getElementById("background-blur");
		let enableLowPowerMode = document.getElementById("low-power-mode").checked;
		let logoSizeIncrease = 1.1;
		if (enableLowPowerMode === false) {
			image.style.opacity = 1;
			image.style.top = (mouse.y - window.innerHeight * 0.5) / 64 - window.innerHeight * 0.05 + "px";
			image.style.left = (mouse.x - window.innerWidth * 0.5) / 64 - window.innerWidth * 0.05 + "px";
			let topBar = document.getElementById("top-bar");
			let bottomBar = document.getElementById("bottom-bar");
			let sidenav = document.getElementById("sidenav");
			offset -= 0.25;
			topBar.style.backgroundPositionY = offset + "px";
			bottomBar.style.backgroundPositionY = offset + "px";
			sidenav.style.backgroundPositionY = offset + "px";
			lastTime = time;
			time = audio.currentTime;
			accumulator += time - lastTime;
			let logo = document.getElementById("logo");
			if (accumulator > 1 / (bpm / 60)) {
				/* logo pulse*/
				logo.style.transition = "width 0.05s, top 0.05s, left 0.05s, background-size 0.05s, filter 0.5s";
				logo.style.width = "40vh";
				logo.style.top = "calc(50vh - " + 40 / 2 + "vh)";
				logo.style.left = "calc(50vw - " + 40 / 2 + "vh)";
				logo.style.backgroundSize = 50 + "vh";
				logo.style.backgroundPositionY = offset % (1024 * 0.5) + "px";
				/* logo background pulse */
				let logoCircle = document.createElement("img");
				logoCircle.src = "src/images/circle.png";
				logoCircle.style.position = "fixed";
				logoCircle.style.width = 45 + "vh";
				logoCircle.style.top = "calc(50vh - " + 45 / 2 + "vh)";
				logoCircle.style.left = "calc(50vw - " + 45 / 2 + "vh)";
				logoCircle.style.opacity = 0.5;
				document.getElementById("logo-beat").appendChild(logoCircle);
				/* snow only in december*/
				if (new Date().getMonth() === 11) {
					let snowflake = document.createElement("img");
					snowflake.src = "src/images/snowflake.png";
					snowflake.style.position = "fixed";
					snowflake.style.width = Math.random() * 2 + 1 + "vh";
					snowflake.style.top = -10 + "vh";
					snowflake.style.left = Math.random() * 100 + "vw";
					snowflake.style.opacity = 0.4;
					snowflake.style.zIndex = -5;
					document.getElementById("snow").appendChild(snowflake);
				}
				accumulator -= 1 / (bpm / 60);
				console.log("beat");
			} else {
				logo.style.transition = "width 0.5s, top 0.5s, left 0.5s, background-size 0.5s, filter 0.5s";
				logo.style.backgroundSize = 40 * logoSizeIncrease + "vh";
				logo.style.width = 40 * logoSizeIncrease + "vh";
				logo.style.top = "calc(50vh - " + ((40 * logoSizeIncrease) / 2) + "vh)";
				logo.style.left = "calc(50vw - " + ((40 * logoSizeIncrease) / 2) + "vh)";
				logo.style.backgroundSize = 50 * logoSizeIncrease + "vh";
				logo.style.backgroundPositionY = offset % (1024 * 0.5) * logoSizeIncrease + "px";
			}
		} else {
			image.style.opacity = 0;
		}
		let logoCircles = document.getElementById("logo-beat").querySelectorAll("img");
		for (let i = 0; i < logoCircles.length; i++) {
			if (parseFloat(logoCircles[i].style.opacity) <= 0) {
				logoCircles[i].remove();
				break;
			}
			logoCircles[i].style.opacity = parseFloat(logoCircles[i].style.opacity) - 0.05;
			logoCircles[i].style.width = parseFloat(logoCircles[i].style.width) + 0.5 + "vh";
			logoCircles[i].style.top = "calc(50vh - " + logoCircles[i].style.width + " / 2)";
			logoCircles[i].style.left = "calc(50vw - " + logoCircles[i].style.width + "/ 2)";
		}
		if (new Date().getMonth() === 11) {
			let snow = document.getElementById("snow").querySelectorAll("img");
			for (let i = 0; i < snow.length; i++) {
				if (parseFloat(snow[i].style.top) >= 100) {
					snow[i].remove();
					break;
				}
				snow[i].style.top = parseFloat(snow[i].style.top) + parseFloat(snow[i].style.width) / 10 + "vh";
				snow[i].style.left = parseFloat(snow[i].style.left) + Math.sin(parseFloat(snow[i].style.width) + parseFloat(snow[i].style.top) / 10) / 25 + "vw";
				snow[i].style.transform = "rotate(" + parseFloat(snow[i].style.top) * parseFloat(snow[i].style.width) + "deg)";

			}
		}
		requestAnimationFrame(animate);
	})();
})
document.getElementById("top-bar").addEventListener("mouseenter", function() {
	blurDiv('background-blur', 4);
	brighten('background-dim', 0.75);
	blurDiv('logo', 8);
});
document.getElementById("top-bar").addEventListener("mouseleave", function() {
	blurDiv('background-blur', 0);
	brighten('background-dim', 1);
	blurDiv('logo', 0);
});
document.getElementById("close-btn").addEventListener("click", function() {
	document.getElementById("sidenav").style.width = "0";
});
document.getElementById("settings-icon").addEventListener("click", function() {
	document.getElementById("sidenav").style.width = "20vw";
});
document.getElementById("low-power-mode").addEventListener("change", function(event) {
	let enableLowPowerMode = this.checked;
	if (enableLowPowerMode) {
		window.localStorage.setItem("use_low_power_mode", 1);
	} else {
		window.localStorage.setItem("use_low_power_mode", 0);
	}
});
document.getElementById("bpm").addEventListener("input", function() {
	this.style.background = 'linear-gradient(to right, #FD67AE 0%, #FD67AE ' + map(this.value, this.min, this.max, 0, 100) + '%, #fff ' + map(this.value, this.min, this.max, 0, 100) + '%, white 100%)';
	document.getElementById('bpm-text').innerText = 'BPM ' + this.value;
	bpm = parseInt(this.value);
	currentSources++;
	if (currentSources % 3 === 0) {
		let audio = new Audio("src/audio/sliderbar.mp3");
		audio.volume = 1;
		audio.playbackRate = map(this.value, this.min, this.max, 1, 2);
		audio.play();
		audio.onend = function() {
			currentSources--;
		};
	}
});
document.getElementById("volume").addEventListener("input", function() {
	this.style.background = 'linear-gradient(to right, #FD67AE 0%, #FD67AE ' + map(this.value, this.min, this.max, 0, 100) + '%, #fff ' + map(this.value, this.min, this.max, 0, 100) + '%, white 100%)';
	document.getElementById('volume-text').innerText = 'Volume ' + this.value;
	audio.volume = this.value / 100;
	window.localStorage.setItem("volume_music", audio.volume);
	currentSources++;
	if (currentSources % 3 === 0) {
		let audio = new Audio("src/audio/sliderbar.mp3");
		audio.volume = 1;
		audio.playbackRate = map(this.value, this.min, this.max, 1, 2);
		audio.play();
		audio.onend = function() {
			currentSources--;
		};
	}
});
/* Onload events --------------------------------------------------------------------------------------------*/
blurDiv("background-blur", 0);
document.getElementById("bpm").dispatchEvent(new CustomEvent("input", {
	"detail": "set slider"
}));
document.getElementById("volume").dispatchEvent(new CustomEvent("input", {
	"detail": "set slider"
}));
/* Helper -------------------------------------------------------------------------------------------------- */
function map(num, numMin, numMax, mapMin, mapMax) {
	return mapMin + ((mapMax - mapMin) / (numMax - numMin)) * (num - numMin);
}
function blurDiv(element, value) {
	let blur = document.getElementById(element);
	blur.style.filter = "blur(" + value + "px)";
}
function brighten(element, value) {
	let dim = document.getElementById(element);
	dim.style.filter = "brightness(" + value + ")";
}
/* Library Stuff ------------------------------------------------------------------------------------------- */
if (window.localStorage.getItem("use_low_power_mode") == parseInt(0)) {
	let wave = new Wave();
	wave.fromElement("menu-audio","audio-visualiser", {stroke: 7, type: "flower", colors: ["#fff5"]});
}