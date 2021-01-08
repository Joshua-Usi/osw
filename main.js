/*
 *	MIT License
 *	
 *	Copyright (c) 2021 Joshua Usi
 *	
 *	Permission is hereby granted, free of charge, to any person obtaining a copy
 *	of this software and associated documentation files (the "Software"), to deal
 *	in the Software without restriction, including without limitation the rights
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *	copies of the Software, and to permit persons to whom the Software is
 *	furnished to do so, subject to the following conditions:
 *	
 *	The above copyright notice and this permission notice shall be included in all
 *	copies or substantial portions of the Software.
 *	
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *	SOFTWARE.
 */
(function() {
  "use strict";
	/*
	 * First time run setup
	 */
	 if (!window.localStorage.use_low_power_mode) {
		window.localStorage.setItem("use_low_power_mode", 0);
	}
	if (window.origin === null) {
		console.warn("You appear to be running this locally without a web server, some effects may not work due to CORS");
	}
	let mouse = new Mouse("body");
	mouse.init();
	let songs = [
		new Song("cYsmix - Triangles.mp3", new Bpm(160)),
		new Song("nekodex - circles.mp3", new Bpm([185, 360, 600, 185], [0, 8, 10.5, 12])),
	];
	/* only add christmas songs to list if the month is december*/
	if (new Date().getMonth() === 11) {
		songs.push(new Song("nekodex - aureole.mp3", new Bpm(140)));
		songs.push(new Song("nekodex - Little Drummer Girl.mp3", new Bpm(140)));
	}
	let chosenSong = randomInt(0, songs.length - 1);
	let bpm = songs[chosenSong].bpm.get();
	document.getElementById("bpm").value = bpm;
	let menuAudio = new Audio(`src/audio/${songs[chosenSong].src}`);
	menuAudio.addEventListener("play", function() {
		document.getElementById("now-playing").innerText = "Now Playing: " + replaceAll(songs[chosenSong].src, [".wav", ".mp3"]);
	});
	menuAudio.addEventListener("ended", function() {
		chosenSong = randomInt(0, songs.length - 1);
		document.getElementById("now-playing").innerText = "Now Playing: " + songs[chosenSong].src;
		this.src = `src/audio/${songs[chosenSong].src}`;
		bpm = songs[chosenSong].bpm.get();
		this.play();
	});
	menuAudio.id = "menu-audio";
	let canvas = document.getElementById("audio-visualiser");
	canvas.width = 0.7 * innerHeight;
	canvas.height = 0.7 * innerHeight;
	/* Need to append for wave.js */
	document.querySelector("body").appendChild(menuAudio);
	let isFirstClick = true;
	let currentSources = 0;
	let offset = 0;
	let time = 0;
	let lastTime = 0;
	let accumulator = 0;
	/* Fetch --------------------------------------------------------------------------------------------------- */
	/*fetch(`https://osu.ppy.sh/api/get_user?u=experimentator&k=${applicationProgrammingInterfaceAccessKey}`).then(function(response) {
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
	});*/
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
	window.addEventListener("click", function() {
		if (isFirstClick) {
			menuAudio.volume = window.localStorage.getItem("volume_music");
			menuAudio.play();
			isFirstClick = false;
			time = 0;
			lastTime = 0;
		}
	});
	window.addEventListener("resize", function() {
		let canvas = document.getElementById("audio-visualiser");
		canvas.width = 0.7 * innerHeight;
		canvas.height = 0.7 * innerHeight;
	});
	window.addEventListener("load", function() {
		(function animate() {
			let image = document.getElementById("background-blur");
			let enableLowPowerMode = document.getElementById("low-power-mode").checked;
			let logoSizeIncrease = 1.1;
			if (enableLowPowerMode === false) {
				image.style.opacity = 1;
				image.style.top = (mouse.position.y - window.innerHeight * 0.5) / 64 - window.innerHeight * 0.05 + "px";
				image.style.left = (mouse.position.x - window.innerWidth * 0.5) / 64 - window.innerWidth * 0.05 + "px";
				let topBar = document.getElementById("top-bar");
				let bottomBar = document.getElementById("bottom-bar");
				let sidenav = document.getElementById("sidenav");
				offset -= 0.25;
				/* triangle background moves*/
				topBar.style.backgroundPositionY = offset + "px";
				bottomBar.style.backgroundPositionY = offset + "px";
				sidenav.style.backgroundPositionY = offset + "px";
				/* beat detection and accumulation */
				bpm = songs[chosenSong].bpm.get(time);
				lastTime = time;
				time = menuAudio.currentTime;
				if (accumulator < -0.1) {
					accumulator = 0;
				}
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
					/* logo background pulse, maximum 5 to prevent lag */
					if (document.getElementById("logo-beat").querySelectorAll("img").length <= 5) {
						let logoCircle = document.createElement("img");
						logoCircle.src = "src/images/circle.png";
						logoCircle.style.position = "fixed";
						logoCircle.style.width = 45 + "vh";
						logoCircle.style.top = "calc(50vh - " + 45 / 2 + "vh)";
						logoCircle.style.left = "calc(50vw - " + 45 / 2 + "vh)";
						logoCircle.style.opacity = 0.5;
						document.getElementById("logo-beat").appendChild(logoCircle);
					}
					/* snow only in december, maximum 50 to prevent lag*/
					if (new Date().getMonth() === 11 && document.getElementById("snow").querySelectorAll("img").length <= 50) {
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
					snow[i].style.left = parseFloat(snow[i].style.left) + Math.sin(parseFloat(snow[i].style.width) * 9 + parseFloat(snow[i].style.top) / 10) / 25 + "vw";
					snow[i].style.transform = "rotate(" + parseFloat(snow[i].style.top) * parseFloat(snow[i].style.width) + "deg)";
				}
			}
			requestAnimationFrame(animate);
		})();
	});
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
		document.getElementById("sidenav").style.opacity = "0.2";
	});
	document.getElementById("settings-icon").addEventListener("click", function() {
		document.getElementById("sidenav").style.width = "20vw";
		document.getElementById("sidenav").style.opacity = "1";
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
		menuAudio.volume = this.value / 100;
		window.localStorage.setItem("volume_music", menuAudio.volume);
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
	document.getElementById("pause").addEventListener("click", function() {
		if (menuAudio.paused) {
			menuAudio.play();
			this.innerHTML = "&#x275A;&#x275A;";
		} else {
			menuAudio.pause();
			this.innerHTML = "&#x25BA;";
		}
	});
	document.getElementById("previous").addEventListener("click", function() {
		menuAudio.pause();
		chosenSong = randomInt(0, songs.length - 1);
		bpm = songs[chosenSong].bpm.get();
		menuAudio.src = `src/audio/${songs[chosenSong].src}`;
		menuAudio.play();
		document.getElementById("bpm").value = bpm;
		document.getElementById("bpm").dispatchEvent(new CustomEvent("input", {
			"detail": "set slider"
		}));
	});
	document.getElementById("next").addEventListener("click", function() {
		menuAudio.pause();
		chosenSong = randomInt(0, songs.length - 1);
		bpm = songs[chosenSong].bpm.get();
		menuAudio.src = `src/audio/${songs[chosenSong].src}`;
		menuAudio.play();
		document.getElementById("bpm").value = bpm;
		document.getElementById("bpm").dispatchEvent(new CustomEvent("input", {
			"detail": "set slider"
		}));
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

	function randomInt(min, max) {
		return Math.round((Math.random() * (max - min)) + min);
	}

	function blurDiv(element, value) {
		let blur = document.getElementById(element);
		blur.style.filter = "blur(" + value + "px)";
	}

	function brighten(element, value) {
		let dim = document.getElementById(element);
		dim.style.filter = "brightness(" + value + ")";
	}

	function replaceAll(str, items) {
		let s = str;	
		for (var i = 0; i < items.length; i++) {
			s = s.replace(items[i], "");
		}
		return s;
	}
	/* Library Stuff ------------------------------------------------------------------------------------------- */
	if (window.origin !== "null") {
		if (window.localStorage.getItem("use_low_power_mode") == parseInt(0)) {
			let wave = new Wave();
			wave.fromElement("menu-audio", "audio-visualiser", {
				stroke: 7,
				type: "flower",
				colors: ["#fff5"]
			});
		}
	} else {
		console.warn("offline context, audio audio visualiser will not work");
	}
	console.log("running and ok");
})();