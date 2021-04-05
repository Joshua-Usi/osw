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
define(function(require) {
	"use strict";
	/* RequireJS Module Loading */
	const Mouse = require("./src/scripts/Mouse.js");
	let Options = require("./src/scripts/Options.js");
	const AssetLoader = require("./src/scripts/AssetLoader.js");
	const utils = require("./src/scripts/utils.js");
	const AttachAudio = require("./src/scripts/AttachAudio.js");
	const Beatmaps = require("./src/scripts/DefaultBeatMaps.js");
	const BeatMapSelectionPaneTemplate = require("./src/scripts/BeatMapSelectionPane.js");
	let gameplay = require("./src/scripts/gameplay.js");
	const introSequence = require("./src/scripts/introSequence.js");
	require("./src/scripts/formElementsEventListeners.js");
	/* Offline context checks, needed to ensure for some effects to work */
	/* Text suggested by jylescoad-ward */
	if (window.origin === null) {
		console.warn("Looks like you're running this without a web server, this isn't suggested at all due to features breaking because of CORS :/");
	}
	/* osw! version incremented manually */
	/* Set element version numbers */
	const version = "osw! 0.5.0b";
	let classes = document.getElementsByClassName("client-version");
	for (let i = 0; i < classes.length; i++) {
		classes[i].textContent = version;
	}
	(function loadMaps() {
		if (Beatmaps.allMapsLoaded() === true) {
			let loadedMaps = Beatmaps.get();
			/* Beatmap loading and adding to dom */
			for (let i = 0; i < loadedMaps.length; i++) {
				document.getElementById("beatmap-selection-right").innerHTML += BeatMapSelectionPaneTemplate.group(loadedMaps[i], i);
			}
			let beatMapGroups = document.getElementsByClassName("beatmap-selection-group-pane");
			for (let i = 0; i < beatMapGroups.length; i++) {
				beatMapGroups[i].addEventListener("click", function() {
					let maps = this.parentNode.getElementsByClassName("beatmap-selection-group-pane-maps");
					if (maps[0].style.display === "block") {
						maps[0].style.display = "none";
						this.classList.remove("beatmap-selection-selected");
						let mapsChildren = maps[0].getElementsByClassName("beatmap-selection-map-pane");
						for (let i = 0; i < mapsChildren.length; i++) {
							mapsChildren[i].classList.remove("beatmap-selection-selected");
						}
					} else {
						maps[0].style.display = "block";
						this.classList.add("beatmap-selection-selected");
						let mapsChildren = maps[0].getElementsByClassName("beatmap-selection-map-pane");
						for (let i = 0; i < mapsChildren.length; i++) {
							mapsChildren[i].classList.add("beatmap-selection-selected");
						}
						let menuAudio = document.getElementById("menu-audio");
						if (menuAudio.src.replaceAll("%20", " ") !== window.origin + "/src/audio/" + this.dataset.audiosource) {
							menuAudio.src = "./src/audio/" + this.getAttribute("data-audiosource");
							let first = this.parentNode.getElementsByClassName("beatmap-selection-group-pane-maps")[0].getElementsByClassName("beatmap-selection-map-pane")[0];
							menuAudio.currentTime = loadedMaps[first.getAttribute("data-group-index")][first.getAttribute("data-map-index")].PreviewTime / 1000;
							menuAudio.play();
						}
					}
				});
			}
			let beatmapSelectionPanes = document.getElementsByClassName("beatmap-selection-map-pane");
			for (var i = 0; i < beatmapSelectionPanes.length; i++) {
				beatmapSelectionPanes[i].addEventListener("click", function() {
					let elements = document.getElementsByClassName("webpage-state");
					for (var i = 0; i < elements.length; i++) {
						if (elements[i].id === "webpage-state-always") {
							continue;
						}
						elements[i].style.display = "none";
					}
					document.getElementById("top-bar").style.display = "none";
					document.getElementById("webpage-state-gameplay").style.display = "block";
					document.getElementById("bottom-bar").style.display = "none";
					document.getElementById("menu-audio").pause();
					gameplay.playMap(this.getAttribute("data-group-index"), this.getAttribute("data-map-index"));
				});
			}
		} else {
			/* every 250ms try and load maps from the server*/
			setTimeout(loadMaps, 250);
		}
	})();
	/* Initial menu song pool */
	let songs = ["cYsmix - Triangles.mp3", "nekodex - circles.mp3"];
	/* Only add christmas songs to list if the month is December */
	if (new Date().getMonth() === 11) {
		songs.push("nekodex - aureole.mp3");
		songs.push("nekodex - Little Drummer Girl.mp3");
	}
	let chosenSong;
	let menuAudio = new Audio();
	menuAudio.id = "menu-audio";
	menuAudio.addEventListener("play", function() {
		document.getElementById("now-playing").textContent = "Now Playing: " + utils.removeInstances(this.src, [window.origin, "/src/audio/", ".wav", ".mp3", ".ogg"]).replaceAll("%20", " ");
	});
	menuAudio.addEventListener("ended", function() {
		this.play();
	});
	menuAudio.addEventListener("DOMAttrModified", function(event) {
		if (event.attrName == "src") {
			document.getElementById("now-playing").textContent = "Now Playing: " + utils.removeInstances(this[src], [".wav", ".mp3", ".ogg"]);
		}
	});
	menuAudio.addEventListener("play", function() {
		audioCtx.resume();
	});
	/* Beat detection */
	document.getElementById("body").appendChild(menuAudio);
	let audioCtx = new AudioContext();
	let analyser = audioCtx.createAnalyser();
	analyser.fftSize = 2048;
	let source = audioCtx.createMediaElementSource(menuAudio);
	source.connect(analyser);
	source.connect(audioCtx.destination);
	let audioAnalyserData = new Uint8Array(analyser.frequencyBinCount);
	let audioAnalyserDataPreviousSum = 0;
	let audioAnalyserDataSum = 0;
	let beatThreshold = 0.02;
	let beatNumber = 0;
	let volumeThreshold = 20000;
	let beat = 0;
	let lastBeat = 0;
	let lastBeatThreshold = 0.05;
	let logoSizeIncrease = 1.1;
	/* Create audioVisualiser for audio visualizer */
	let audioVisualiser = document.getElementById("audio-visualiser");
	let ctx = audioVisualiser.getContext("2d");
	let settingsSet = false;
	let isFirstClick = true;
	let offset = 0;
	/* States:
	 * just-logo
	 * first
	 * play
	 * settings
	 */
	let logoX = 50;
	let logoY = 50;
	let logoSize = 70;
	let logoPulseSize = 75;
	let audioVisualiserSize = 1.6;
	/* Profiling variables */
	let recordedFramesPerSecond = [];
	/* Event Listeners */
	window.addEventListener("click", function() {
		if (isFirstClick === true && document.readyState === "complete") {
			introSequence.animate();
			/* Setting settings */
			let index = 0;
			for (let group in Options) {
				if (Options.hasOwnProperty(group) && typeof(Options[group]) === "object" && group !== "types") {
					for (let setting in Options[group]) {
						if (Options[group].hasOwnProperty(setting)) {
							let element = document.getElementById("settings-" + utils.camelCaseToDash(setting));
							switch (Options.types[index]) {
								case "slider":
									let mapped = utils.map(Options[group][setting], 0, 1, element.min, element.max);
									if (setting === "sliderResolution") {
										mapped = utils.map(mapped, 10, 14, 1, 5);
									}
									element.value = Math.round(mapped);
									element.dispatchEvent(new CustomEvent("input", {
										detail: true
									}));
									break;
								case "checkbox":
									element.checked = Options[group][setting];
									break;
								case "selectbox":
									element.getElementsByClassName("select-box-selected")[0].textContent = Options[group][setting];
									break;
								case "text":
									element.textContent = Options[group][setting];
									break;
							}
							index++;
						}
					}
				}
			}
			settingsSet = true;
			if (document.getElementById("settings-intro-sequence").getElementsByClassName("select-box-selected")[0].textContent === "Triangles") {
				chosenSong = 0;
				menuAudio.src = `src/audio/${songs[chosenSong]}`;
			} else {
				chosenSong = 1;
				menuAudio.src = `src/audio/${songs[chosenSong]}`;
			}
			if (new Date().getMonth() === 11) {
				chosenSong = utils.randomInt(2, 3);
				menuAudio.src = `src/audio/${songs[chosenSong]}`;
			}
			menuAudio.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
			menuAudio.play();
			isFirstClick = false;
			(function animate() {
				/* triangle background moves */
				let triangleBackgroundMoves = document.getElementsByClassName("triangle-background");
				offset -= 0.5;
				for (let i = 0; i < triangleBackgroundMoves.length; i++) {
					triangleBackgroundMoves[i].style.backgroundPositionY = offset + "px";
				}
				if (document.getElementById("webpage-state-menu").style.display === "block" || document.getElementById("webpage-state-menu").style.display === "") {
					/* beat detection */
					audioAnalyserData = new Uint8Array(analyser.frequencyBinCount);
					analyser.getByteFrequencyData(audioAnalyserData); // passing our Uint audioAnalyserData array
					audioAnalyserData = [...audioAnalyserData];
					audioAnalyserDataPreviousSum = audioAnalyserDataSum;
					audioAnalyserDataSum = 0;
					audioAnalyserDataSum = utils.sum(audioAnalyserData, audioAnalyserData.length / 8);
					ctx.clearRect(0, 0, audioVisualiser.width, audioVisualiser.height);
					ctx.lineWidth = 7;
					ctx.beginPath();
					ctx.strokeStyle = "#fff5";
					let length = audioAnalyserData.length * (2 / 3);
					for (let i = 0; i < length; i += 4) {
						/* do not render visualiser lines that are too short*/
						if (audioAnalyserData[i] < 80) {
							continue;
						}
						let mag = audioAnalyserData[i] ** 1.5 / (255 ** 0.55) + 100;
						let angle = utils.map(i, 0, length, Math.PI, 3 * Math.PI);
						/* optimised rendering by not rendering parts of lines that are unseen */
						ctx.moveTo(audioVisualiser.width / 2 + Math.sin(angle) * audioVisualiser.width / 4, audioVisualiser.height / 2 + Math.cos(angle) * audioVisualiser.height / 4);
						ctx.lineTo(audioVisualiser.width / 2 + Math.sin(angle) * utils.map(mag, 0, 255, 0, audioVisualiser.width / 2), audioVisualiser.height / 2 + Math.cos(angle) * utils.map(mag, 0, 255, 0, audioVisualiser.width / 2));
					}
					ctx.stroke();
					let logo = document.getElementById("logo");
					/* beat detection */
					if (audioAnalyserDataSum - audioAnalyserDataPreviousSum > audioAnalyserDataSum * beatThreshold && audioAnalyserDataSum > volumeThreshold * (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100) && menuAudio.currentTime - lastBeat > lastBeatThreshold) {
						beat = 0;
						lastBeat = menuAudio.currentTime;
						/* logo pulse*/
						logo.style.transition = "width 0.05s, top 0.05s, left 0.05s, background-size 0.05s, filter 0.05s";
						logo.style.width = logoSize + "vh";
						logo.style.top = "calc(" + logoY + "vh - " + logoSize / 2 + "vh)";
						logo.style.left = "calc(5vw + " + logoX + "vw - " + logoSize / 2 + "vh)";
						logo.style.backgroundSize = logoSize + "vh";
						logo.style.filter = "brightness(1.25)";
						if (beatNumber % 2 === 0) {
							let leftBeat = document.getElementById("left-beat");
							leftBeat.style.transition = "opacity 0.05s";
							leftBeat.style.opacity = "1";
						} else {
							let rightBeat = document.getElementById("right-beat");
							rightBeat.style.transition = "opacity 0.05s";
							rightBeat.style.opacity = "1";
						}
						beatNumber++;
						/* snow only in december, maximum 50 to prevent lag */
						/* last tested:
						 *	
						 *	27/12/2020, works
						 *	9/01/2021, works
						 */
						if (new Date().getMonth() === 11 && document.getElementById("snow").querySelectorAll("img").length <= 50) {
							let snowflake = document.createElement("img");
							snowflake.src = "./src/images/snowflake.png";
							snowflake.style.position = "fixed";
							snowflake.style.width = Math.random() * 2 + 1 + "vh";
							snowflake.style.top = -10 + "vh";
							snowflake.style.left = Math.random() * 100 + "vw";
							snowflake.style.opacity = 0.4;
							snowflake.style.zIndex = -5;
							document.getElementById("snow").appendChild(snowflake);
						}
					}
					if (beat === 3) {
						logo.style.transition = "width 0.5s, top 0.5s, left 0.5s, background-size 0.5s, filter 0.5s";
						logo.style.backgroundSize = logoSize * logoSizeIncrease + "vh";
						logo.style.width = logoSize * logoSizeIncrease + "vh";
						logo.style.top = "calc(" + logoY + "vh - " + ((logoSize * logoSizeIncrease) / 2) + "vh)";
						logo.style.left = "calc(5vw + " + logoX + "vw - " + ((logoSize * logoSizeIncrease) / 2) + "vh)";
						logo.style.backgroundSize = logoSize * logoSizeIncrease + "vh";
						logo.style.filter = "brightness(1)";
						let leftBeat = document.getElementById("left-beat");
						let rightBeat = document.getElementById("right-beat");
						leftBeat.style.transition = "opacity 1s";
						leftBeat.style.opacity = "0";
						rightBeat.style.transition = "opacity 1s";
						rightBeat.style.opacity = "0";
					}
					beat++;
					if (new Date().getMonth() === 11) {
						let snow = document.getElementById("snow").querySelectorAll("img");
						for (let i = 0; i < snow.length; i++) {
							if (parseFloat(snow[i].style.top) >= 100) {
								snow[i].remove();
								continue;
							}
							snow[i].style.top = parseFloat(snow[i].style.top) + parseFloat(snow[i].style.width) / 10 + "vh";
							snow[i].style.left = parseFloat(snow[i].style.left) + Math.sin(parseFloat(snow[i].style.width) * 9 + parseFloat(snow[i].style.top) / 10) / 25 + "vw";
							snow[i].style.transform = "rotate(" + parseFloat(snow[i].style.top) * parseFloat(snow[i].style.width) + "deg)";
						}
					}
				}
				/* Profiling */
				const now = Date.now();
				while (recordedFramesPerSecond.length > 0 && recordedFramesPerSecond[0] <= now - 1000) {
					recordedFramesPerSecond.shift();
				}
				recordedFramesPerSecond.push(now);
				/* Update frame counter */
				let frameCounter = document.getElementById("frame-rate");
				switch (Options.Performance.maxFrameRate) {
					case "VSync":
						frameCounter.textContent = recordedFramesPerSecond.length + " / 60fps";
						break;
					case "2x VSync":
						frameCounter.textContent = recordedFramesPerSecond.length + " / 120fps";
						break;
					case "Browser Maximum (250fps)":
						frameCounter.textContent = recordedFramesPerSecond.length + " / 250fps";
						break;
				}
				if (recordedFramesPerSecond.length > 60) {
					frameCounter.style.background = "#6d9eeb";
				} else if (recordedFramesPerSecond.length > 45) {
					frameCounter.style.background = "#39e639";
				} else if (recordedFramesPerSecond.length > 20) {
					frameCounter.style.background = "#ffa500";
				} else {
					frameCounter.style.background = "#B00020";
				}
				if (gameplay.isRunning()) {
					gameplay.tick();
				}
				if (gameplay.isRunning()) {
					setTimeout(animate, 0);
				} else {
					requestAnimationFrame(animate);
				}
			})();
		}
	});
	window.addEventListener("mousemove", function(mouse) {
		if (Options.UserInterface.menuParallax === true && (document.getElementById("webpage-state-menu").style.display === "block" || document.getElementById("webpage-state-menu").style.display === "")) {
			let backgroundImageParallax = document.getElementById("background-blur");
			let menuParallax = document.getElementById("menu-parallax");
			backgroundImageParallax.style.top = (mouse.y - window.innerHeight * 0.5) / 128 - window.innerHeight * 0.05 + "px";
			backgroundImageParallax.style.left = (mouse.x - window.innerWidth * 0.5) / 128 - window.innerWidth * 0.05 + "px";
			menuParallax.style.top = "calc(5vh + " + ((mouse.y - window.innerHeight * 0.5) / 256 - window.innerHeight * 0.05) + "px)";
			menuParallax.style.left = "calc(" + ((mouse.x - window.innerWidth * 0.5) / 256 - window.innerWidth * 0.05) + "px)";
		}
	})
	/* Omnipotent web listeners */
	window.addEventListener("resize", function() {
		let audioVisualiser = document.getElementById("audio-visualiser");
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		window.dispatchEvent(new CustomEvent("orientationchange"));
	});
	window.addEventListener("load", function() {
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.style.width = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.height = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.top = "calc(" + logoY + "vh - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		audioVisualiser.style.left = "calc(5vw + " + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		let paragraphElements = document.getElementById("splash-screen").querySelectorAll("p");
		for (var i = 0; i < paragraphElements.length; i++) {
			paragraphElements[i].style.animation = "splash-screen-text forwards 1s";
			if (paragraphElements[i].id === "splash-screen-warning") {
				paragraphElements[i].style.animation = "splash-screen-text-2 forwards 1s";
			}
		}
		document.getElementById("splash-screen").style.animationDuration = "1s";
		document.getElementById("splash-screen").style.animationDelay = "1s";
		document.getElementById("heart-loader").style.display = "none";
	});
	window.addEventListener("blur", function() {
		if (document.getElementById("webpage-state-gameplay").style.display === "block") {
			document.getElementById("webpage-state-pause-screen").style.display = "block";
			gameplay.pause();
		}
	});
	/* Top bar event listeners */
	document.getElementById("top-bar").addEventListener("mouseenter", function() {
		utils.blurDiv("background-blur", 4);
		utils.brighten("background-dim", 0.75);
		utils.blurDiv("menu-parallax", 8);
	});
	document.getElementById("top-bar").addEventListener("mouseleave", function() {
		utils.blurDiv("background-blur", 0);
		utils.brighten("background-dim", 1);
		utils.blurDiv("menu-parallax", 0);
	});
	document.getElementById("pause").addEventListener("click", function() {
		let menuAudio = document.getElementById("menu-audio");
		if (menuAudio.paused) {
			menuAudio.play();
			this.innerHTML = "&#x275A;&#x275A;";
		} else {
			menuAudio.pause();
			this.innerHTML = "&#x25BA;";
		}
	});
	/* Sidenav event listener */
	AttachAudio(document.getElementById("close-btn"), "click", "./src/audio/effects/back-button-click.wav", "settings-master-volume", "settings-effects-volume");
	document.getElementById("close-btn").addEventListener("click", function() {
		document.getElementById("sidenav").style.width = "0";
		document.getElementById("sidenav").style.opacity = "0.2";
	});
	document.getElementById("settings-icon").addEventListener("click", function() {
		document.getElementById("menu-bar-settings").dispatchEvent(new CustomEvent("click"));
	});
	/* Menu bar buttons listeners */
	let buttons = document.getElementsByClassName("menu-bar-buttons-parent");
	for (let i = 0; i < buttons.length; i++) {
		let clickSrc = "";
		let hoverSrc = "";
		switch (buttons[i].id) {
			case "menu-bar-settings":
				clickSrc = "./src/audio/effects/menu-options-click.wav";
				break;
			case "menu-bar-play":
				clickSrc = "./src/audio/effects/menu-freeplay-click.wav";
				break;
			case "menu-bar-edit":
				clickSrc = "./src/audio/effects/menu-edit-click.wav";
				break;
			case "menu-bar-direct":
				clickSrc = "./src/audio/effects/menu-direct-click.wav";
				break;
			case "menu-bar-exit":
				clickSrc = "./src/audio/effects/menu-exit-click.wav";
				break;
		}
		AttachAudio(buttons[i], "click", clickSrc, "settings-master-volume", "settings-effects-volume");
		AttachAudio(buttons[i], "mouseenter", "./src/audio/effects/menu-hover.wav", "settings-master-volume", "settings-effects-volume");
		buttons[i].addEventListener("mouseenter", function() {
			this.getElementsByClassName("menu-bar-buttons-icon")[0].classList.add("menu-bar-buttons-icon-animation");
			this.getElementsByClassName("menu-bar-image-move")[0].classList.add("menu-bar-image-move-animation");
		});
		buttons[i].addEventListener("mouseleave", function() {
			this.getElementsByClassName("menu-bar-buttons-icon")[0].classList.remove("menu-bar-buttons-icon-animation");
			this.getElementsByClassName("menu-bar-image-move")[0].classList.remove("menu-bar-image-move-animation");
		});
	}
	/* Specific menu bar button listeners */
	document.getElementById("menu-bar-settings").addEventListener("click", function() {
		document.getElementById("sidenav").style.width = "25vw";
		document.getElementById("sidenav").style.opacity = "1";
	});
	document.getElementById("menu-bar-exit").addEventListener("click", function() {
		setTimeout(function() {
			window.close();
		}, 4000);

		function reduceVolume() {
			let volume = menuAudio.volume;
			volume -= 0.05;
			if (volume < 0) {
				volume = 0;
			}
			menuAudio.volume = volume;
			if (menuAudio.volume > 0) {
				requestAnimationFrame(reduceVolume);
			}
		}
		reduceVolume();
		document.getElementById("goodbye").style.zIndex = "10000";
		document.getElementById("goodbye").style.opacity = "1";
	});
	/* Specific checkbox listeners */
	document.getElementById("settings-show-fps").addEventListener("input", function() {
		if (this.checked === true) {
			document.getElementById("frame-rate").style.opacity = 1;
		} else {
			document.getElementById("frame-rate").style.opacity = 0;
		}
	});
	/* Specific range slider listeners */
	document.getElementById("settings-master-volume").addEventListener("input", function() {
		document.getElementById("settings-master-volume-text").textContent = "Master volume: " + this.value + "%";
		document.getElementById("menu-audio").volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
		setSettings();
	});
	document.getElementById("settings-music-volume").addEventListener("input", function() {
		document.getElementById("settings-music-volume-text").textContent = "Music volume: " + this.value + "%";
		document.getElementById("menu-audio").volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
		setSettings();
	});
	document.getElementById("settings-effects-volume").addEventListener("input", function() {
		document.getElementById("settings-effects-volume-text").textContent = "Effects volume: " + this.value + "%";
		setSettings();
	});
	document.getElementById("settings-mouse-sensitivity").addEventListener("input", function() {
		document.getElementById("settings-mouse-sensitivity-text").textContent = "Mouse sensitivity: " + (this.value / 100).toFixed(2) + "x";
		setSettings();
	});
	document.getElementById("settings-background-dim").addEventListener("input", function() {
		document.getElementById("settings-background-dim-text").textContent = "Background dim: " + this.value + "%";
		setSettings();
	});
	document.getElementById("settings-slider-resolution").addEventListener("input", function() {
		let resolution = "";
		switch (this.value) {
			case "1":
				resolution = "Full";
				break;
			case "2":
				resolution = "Half";
				break;
			case "3":
				resolution = "Quarter";
				break;
			case "4":
				resolution = "Eighth";
				break;
			case "5":
				resolution = "Sixteenth";
				break;
		}
		document.getElementById("settings-slider-resolution-text").textContent = "Slider resolution: " + resolution;
		setSettings();
	});
	/* Settings button listeners*/
	document.getElementById("settings-button-clear-local-storage").addEventListener("click", function() {
		if (window.confirm("Are you sure you want to delete local storage? you will lose all your set options")) {
			window.localStorage.clear();
			alert("local storage cleared, refresh for changes to take effect");
		}
	});
	/* Splashscreen listener */
	document.getElementById("splash-screen").addEventListener("click", function() {
		this.style.opacity = 0;
		setTimeout(function() {
			document.getElementById("splash-screen").style.display = "none";
		}, 1000);
	});
	/* logo listener */
	AttachAudio(document.getElementById("logo"), "click", "./src/audio/effects/menuHit.wav", "settings-master-volume", "settings-effects-volume");
	document.getElementById("logo").addEventListener("click", function() {
		beat = 3;
		logoX = 30;
		logoY = 50;
		logoSize = 25;
		logoPulseSize = 26;
		let audioVisualiser = document.getElementById("audio-visualiser");
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.style.width = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.height = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.top = "calc(" + logoY + "vh - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		audioVisualiser.style.left = "calc(5vw + " + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		let menuBar = document.getElementById("menu-bar");
		menuBar.style.visibility = "visible";
		menuBar.style.opacity = 1;
		let menuBarButtons = document.getElementsByClassName("menu-bar-buttons-parent");
		for (let i = 0; i < menuBarButtons.length; i++) {
			menuBarButtons[i].style.paddingTop = 5 + "vh";
			menuBarButtons[i].style.paddingBottom = 5 + "vh";
		}
		menuBar.style.top = "calc(50vh - 5vh * 1.5)";
		clearTimeout(menuTimeout);
		menuTimeout = setTimeout(resetMenu, 15000);
	});
	AttachAudio(document.getElementById("back-button"), "click", "./src/audio/effects/back-button-click.wav", "settings-master-volume", "settings-effects-volume");
	AttachAudio(document.getElementById("back-button"), "mouseenter", "./src/audio/effects/menu-hover.wav", "settings-master-volume", "settings-effects-volume");
	document.getElementById("menu-bar-play").addEventListener("click", function() {
		document.getElementById("webpage-state-menu").style.display = "none";
		document.getElementById("webpage-state-beatmap-selection").style.display = "block";
		document.getElementById("bottom-bar").style.display = "block";
		let els = document.getElementsByClassName("beatmap-selection-group-pane");
		let selectedElement = els[utils.randomInt(0, els.length)];
		selectedElement.scrollIntoView({
			block: "center",
			inline: "end"
		});
		selectedElement.parentNode.parentNode.scrollTo(0, selectedElement.parentNode.parentNode.scrollTop);
		window.scrollTo(0, 0);
		selectedElement.dispatchEvent(new CustomEvent("click"));
	});
	/* Helper */
	let menuTimeout;

	function resetMenu() {
		beat = 3;
		logoX = 50;
		logoY = 50;
		logoSize = 70;
		logoPulseSize = 75;
		let audioVisualiser = document.getElementById("audio-visualiser");
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.style.width = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.height = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.top = "calc(" + logoY + "vh - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		audioVisualiser.style.left = "calc(5vw + " + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		let menuBar = document.getElementById("menu-bar");
		menuBar.style.opacity = 0;
		let menuBarButtons = document.getElementsByClassName("menu-bar-buttons-parent");
		for (let i = 0; i < menuBarButtons.length; i++) {
			menuBarButtons[i].style.paddingTop = 0;
			menuBarButtons[i].style.paddingBottom = 0;
		}
		menuBar.style.top = "calc(50vh)";
		setTimeout(function() {
			let menuBar = document.getElementById("menu-bar");
			menuBar.style.visibility = "hidden";
		});
	}

	function setSettings() {
		if (settingsSet === true) {
			let index = 0;
			for (let group in Options) {
				if (Options.hasOwnProperty(group) && typeof(Options[group]) === "object" && group !== "types") {
					for (let setting in Options[group]) {
						if (Options[group].hasOwnProperty(setting)) {
							let element = document.getElementById("settings-" + utils.camelCaseToDash(setting));
							switch (Options.types[index]) {
								case "slider":
									Options[group][setting] = utils.map(element.value, element.min, element.max, 0, 1);
									break;
								case "checkbox":
									Options[group][setting] = element.checked;
									break;
								case "selectbox":
									Options[group][setting] = element.getElementsByClassName("select-box-selected")[0].textContent;
									break;
								case "text":
									Options[group][setting] = element.textContent;
									break;
							}
							index++;
						}
					}
				}
			}
			localStorage.setItem("options", JSON.stringify(Options));
			console.log("settings saved!");
		}
	}
	window.addEventListener("orientationchange", function(event) {
		if (event.target.screen.orientation.angle === 0 && window.innerWidth < window.innerHeight) {
			document.getElementById("orientation-vertical").style.display = "block";
		} else {
			document.getElementById("orientation-vertical").style.display = "none";
		}
	});
	document.body.addEventListener("touchmove", function(e) {
		e.preventDefault();
	}, {
		passive: false
	});
	document.getElementById("back-button").addEventListener("click", function() {
		let elements = document.getElementsByClassName("webpage-state");
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].id === "webpage-state-always") {
				continue;
			}
			if (elements[i].id === "webpage-state-state-beatmap-selection" && document.getElementById("webpage-state-end-results").style.display === "block") {
				continue;
			}
			elements[i].style.display = "none";
		}
		document.getElementById("webpage-state-menu").style.display = "block";
		document.getElementById("bottom-bar").style.display = "none";
		document.getElementById("menu-audio").play();
	});
	document.getElementById("pause-menu-continue").addEventListener("click", function() {
		gameplay.continue();
		document.getElementById("webpage-state-pause-screen").style.display = "none";
		document.getElementById("webpage-state-fail-screen").style.display = "none";
	});
	function retry() {
		gameplay.retry();
		document.getElementById("webpage-state-pause-screen").style.display = "none";
		document.getElementById("webpage-state-fail-screen").style.display = "none";
	}
	document.getElementById("pause-menu-retry").addEventListener("click", retry);
	document.getElementById("fail-menu-retry").addEventListener("click", retry);
	function quit() {
		document.getElementById("menu-audio").play();
		document.getElementById("webpage-state-always").style.display = "block";
		document.getElementById("top-bar").style.display = "block";
		document.getElementById("webpage-state-beatmap-selection").style.display = "block";
		document.getElementById("webpage-state-gameplay").style.display = "none";
		document.getElementById("webpage-state-pause-screen").style.display = "none";
		document.getElementById("webpage-state-fail-screen").style.display = "none";
	}
	document.getElementById("pause-menu-quit").addEventListener("click", quit);
	document.getElementById("fail-menu-quit").addEventListener("click", quit);
});