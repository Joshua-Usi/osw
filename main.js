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
	const Options = require("./src/scripts/options.js");
	const AudioManager = new (require("./src/scripts/audioManager.js"))();
	const utils = require("./src/scripts/utils.js");
	const Beatmaps = require("./src/scripts/beatmapFetcher.js");
	const BeatMapSelectionPaneTemplate = require("./src/scripts/beatMapSelectionPane.js");
	const gameplay = require("./src/scripts/gameplay.js");
	const introSequence = require("./src/scripts/introSequence.js");
	const databaseManager = require("./src/scripts/databaseManager.js");
	const Parser = require("./src/scripts/parser.js");
	require("./src/scripts/modsUI.js");
	const Mods = require("./src/scripts/mods.js");
	let selectedMods;

	let backgroundImageParallax = document.getElementById("background-dim");
	let menuParallax = document.getElementById("menu-parallax");

	/* Offline context checks, needed to ensure for some effects to work */
	if (!window.localStorage) {
		console.warn("LocalStorage is not supported on this browser. You will not be able to save your options");
	}
	if (window.origin === null) {
		console.warn("The CORS origin is not set correctly or you may be running this client on the file system. You may experience audio visualiser bugs");
	}
	if (!window.indexedDB) {
		console.warn("IndexedDB is not supported on your browser. You will not be able to save your beatmaps");
	}
	/* osw! version incremented manually */
	const version = "osw! 0.7.6b";
	/* Set element version numbers */
	let classes = document.getElementsByClassName("client-version");
	for (let i = 0; i < classes.length; i++) {
		classes[i].textContent = version;
	}
	let loadedNewMaps = false;
	function loadMaps() {
		document.getElementById("beatmap-selection-right").innerHTML = "";
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
						let database = indexedDB.open("osw-database", 1);
						let that = this;
						database.addEventListener("success", function(event) {
							let database = event.target.result;
							let audioObjectStore = databaseManager.getObjectStore(database, "audio", "readonly");
							let audioRequest = audioObjectStore.get(that.getAttribute("data-audiosource"));
							audioRequest.addEventListener("error", function(event) {
								console.error(`Attempt to find query failed: ${event.target.error}`);
							});
							audioRequest.addEventListener("success", function(event) {
								let audioType;
								if (event.target.result.name.includes(".mp3")) {
									audioType = "mp3";
								} else if (event.target.result.name.includes(".ogg")) {
									audioType = "ogg";
								}
								let first = that.parentNode.getElementsByClassName("beatmap-selection-group-pane-maps")[0].getElementsByClassName("beatmap-selection-map-pane")[0];
								logoBeatAccumulator.milliseconds = loadedMaps[first.getAttribute("data-group-index")][first.getAttribute("data-map-index")].timingPoints[0].beatLength * 1000;
								menuAudio.src = `data:audio/${audioType};base64,${event.target.result.data}`;
								menuAudio.currentTime = loadedMaps[first.getAttribute("data-group-index")][first.getAttribute("data-map-index")].PreviewTime / 1000;
								menuAudio.play();
							});
						});
					}
				});
			}
			let beatmapSelectionPanes = document.getElementsByClassName("beatmap-selection-map-pane");
			for (let i = 0; i < beatmapSelectionPanes.length; i++) {
				beatmapSelectionPanes[i].addEventListener("click", function() {
					utils.showWebpageStates([
						"webpage-state-gameplay",
					]);
					utils.hideWebpageStates([
						"webpage-state-menu",
						"webpage-state-beatmap-selection",
						"webpage-state-mods",
						"webpage-state-pause-screen", 
						"webpage-state-fail-screen",
						"webpage-state-results-screen",
						"top-bar",
						"bottom-bar",
					]);
					document.getElementById("menu-audio").pause();
					document.getElementById("sidenav").style.width = "0";
					document.getElementById("sidenav").style.opacity = "0.2";
					selectedMods = Mods();
					let selectedModElements = document.getElementsByClassName("mod-selected");
					for (let i = 0; i < selectedModElements.length; i++) {
						selectedMods[selectedModElements[i].id.replace("mod-", "")] = true;
					}
					gameplay.playMap(loadedMaps[this.getAttribute("data-group-index")][this.getAttribute("data-map-index")], selectedMods);
				});
			}
		} else {
			/* every 250ms try and load maps from the server*/
			setTimeout(loadMaps, 250);
		}
	}
	loadMaps();

	function logoBeat() {
		/* logo pulse*/
		logo.style.transition = "width 0.05s, top 0.05s, left 0.05s, background-size 0.05s, filter 0.05s";
		logo.style.width = logoSize + "vh";
		logo.style.top = "calc(" + logoY + "vh - " + logoSize / 2 + "vh)";
		logo.style.left = "calc(5vw + " + logoX + "vw - " + logoSize / 2 + "vh)";
		logo.style.backgroundSize = logoSize + "vh";
		logo.style.filter = "brightness(1.25)";
		if (loudness > 5000 * (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100)) {
			if (beatNumber % 2 === 0 || beatNumber % 4 === 0) {
				let leftBeat = document.getElementById("left-beat");
				leftBeat.style.transition = "opacity 0.05s";
				leftBeat.style.opacity = "1";
			}
			if (beatNumber % 2 === 1 || beatNumber % 4 === 0) {
				let rightBeat = document.getElementById("right-beat");
				rightBeat.style.transition = "opacity 0.05s";
				rightBeat.style.opacity = "1";
			}
		}
		beatNumber++;
		/* snow only in december, maximum 50 to prevent lag */
		/* last tested:
		 *	
		 *	27/12/2020, works
		 *	9/01/2021, works
		 */
		if (new Date().getMonth() === 11 && document.getElementById("snow").getElementsByTagName("img").length <= 50) {
			let snowflake = document.createElement("img");
			snowflake.src = "./src/images/snowflake.png";
			snowflake.style.position = "fixed";
			snowflake.style.width = Math.random() * 2 + 1 + "vh";
			snowflake.style.top = "-10vh";
			snowflake.style.left = Math.random() * 100 + "vw";
			snowflake.style.opacity = 0.4;
			snowflake.style.zIndex = -5;
			document.getElementById("snow").appendChild(snowflake);
		}
		setTimeout(logoResetBeat, 4000 / 60);
	}

	function logoResetBeat() {
		logo.style.transition = "width 0.25s, top 0.25s, left 0.25s, background-size 0.25s, filter 0.25s";
		logo.style.backgroundSize = logoSize * logoSizeIncrease + "vh";
		logo.style.width = logoSize * logoSizeIncrease + "vh";
		logo.style.top = "calc(" + logoY + "vh - " + ((logoSize * logoSizeIncrease) / 2) + "vh)";
		logo.style.left = "calc(5vw + " + logoX + "vw - " + ((logoSize * logoSizeIncrease) / 2) + "vh)";
		logo.style.backgroundSize = logoSize * logoSizeIncrease + "vh";
		logo.style.filter = "brightness(1)";
		let leftBeat = document.getElementById("left-beat");
		let rightBeat = document.getElementById("right-beat");
		leftBeat.style.transition = "opacity 0.5s";
		leftBeat.style.opacity = "0";
		rightBeat.style.transition = "opacity 0.5s";
		rightBeat.style.opacity = "0";
	}

	/* Initial menu song pool */
	let songs = ["cYsmix - Triangles.mp3", "nekodex - circles.mp3", "nekodex - aureole.mp3"];
	let defaultSongsMs = [375, 333, 429];
	let chosenSong;
	let menuAudio = document.getElementById("menu-audio");
	menuAudio.addEventListener("play", function() {
		beatNumber = 0;
		audioCtx.resume();
	});
	menuAudio.addEventListener("ended", function() {
		if (document.getElementById("webpage-state-gameplay").style.display === "none") {
			this.play();
		}
	});
	/* Beat detection */
	document.getElementById("body").appendChild(menuAudio);
	let audioCtx = new AudioContext();
	let analyser = audioCtx.createAnalyser();
	analyser.fftSize = 128;
	let source = audioCtx.createMediaElementSource(menuAudio);
	source.connect(analyser);
	source.connect(audioCtx.destination);
	let audioAnalyserData = new Uint8Array(analyser.frequencyBinCount);
	let visualiserData = [];
	let analyserLength = 128;
	for (let i = 0; i < analyserLength; i++) {
		visualiserData.push(0);
	}
	let visualiserOffset = 0;
	let beatNumber = 0;
	let loudness = 0;
	let logoSizeIncrease = 1.05;
	/* Create audioVisualiser for audio visualiser */
	let audioVisualiser = document.getElementById("audio-visualiser");
	let logo = document.getElementById("logo");
	let ctx = audioVisualiser.getContext("2d");
	let settingsSet = false;
	let isFirstClick = true;
	let offset = 0;
	let logoX = 50;
	let logoY = 50;
	let logoSize = 70;
	let audioVisualiserSize = 1.6;
	/* Profiling letiables */
	let recordedFramesPerSecond = [];
	/* Accumulators */
	let time = 0;
	let previousTime = 0;
	let gameplayRenderAccumulator = new utils.Accumulator(gameplay.render, 1000 / 60);
	let logoBeatAccumulator;
	let beatmapQueue = [];
	/* Event Listeners */
	window.addEventListener("click", function() {
		if (isFirstClick === true && document.readyState === "complete") {
			introSequence.animate();
			AudioManager.load("back-button-click", "./src/audio/effects/back-button-click.wav", "effects", true);
			AudioManager.load("menu-options-click", "./src/audio/effects/menu-options-click.wav", "effects", true);
			AudioManager.load("menu-freeplay-click", "./src/audio/effects/menu-freeplay-click.wav", "effects", true);
			AudioManager.load("menu-edit-click", "./src/audio/effects/menu-edit-click.wav", "effects", true);
			AudioManager.load("menu-direct-click", "./src/audio/effects/menu-direct-click.wav", "effects", true);
			AudioManager.load("menu-exit-click", "./src/audio/effects/menu-exit-click.wav", "effects", true);
			AudioManager.load("menu-hover", "./src/audio/effects/menu-hover.wav", "effects", true);
			AudioManager.load("check-on", "./src/audio/effects/menu-hover.wav", "effects", true);
			AudioManager.load("check-off", "./src/audio/effects/menu-hover.wav", "effects", true);
			AudioManager.load("settings-hover", "./src/audio/effects/settings-hover.wav", "effects", true);
			AudioManager.load("sliderbar", "./src/audio/effects/sliderbar.wav", "effects", true);
			AudioManager.load("menu-hit", "./src/audio/effects/menu-hit.wav", "effects", true);
			/* Setting settings */
			let index = 0;
			let userOptions = Options.get();
			for (let group in userOptions) {
				if (userOptions.hasOwnProperty(group) && typeof(userOptions[group]) === "object" && group !== "types") {
					for (let setting in userOptions[group]) {
						if (userOptions[group].hasOwnProperty(setting)) {
							let element = document.getElementById("settings-" + utils.camelCaseToDash(setting));
							switch (userOptions.types[index]) {
								case "slider":
									let mapped = utils.map(userOptions[group][setting], 0, 1, element.min, element.max);
									if (setting === "sliderResolution") {
										mapped = utils.map(mapped, 10, 14, 1, 5);
									}
									element.value = Math.round(mapped);
									element.dispatchEvent(new CustomEvent("input"));
									break;
								case "checkbox":
									element.checked = userOptions[group][setting];
									break;
								case "selectbox":
									element.getElementsByClassName("select-box-selected")[0].textContent = userOptions[group][setting];
									break;
								case "text":
									element.textContent = userOptions[group][setting];
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
				chosenSong = 2;
				menuAudio.src = `src/audio/${songs[chosenSong]}`;
			}
			logoBeatAccumulator = new utils.Accumulator(logoBeat, defaultSongsMs[chosenSong]);
			menuAudio.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
			menuAudio.play();
			isFirstClick = false;
			time = Date.now();
			previousTime = time;
			(function animate() {
				if ((document.getElementById("webpage-state-gameplay").style.display === "none" || document.getElementById("webpage-state-gameplay").style.display === "")) {
					/* triangle background moves */
					let triangleBackgroundMoves = document.getElementsByClassName("triangle-background");
					offset -= 0.5;
					for (let i = 0; i < triangleBackgroundMoves.length; i++) {
						if (triangleBackgroundMoves[i].style.display !== "none") {
							triangleBackgroundMoves[i].style.backgroundPositionY = offset + "px";
						}
					}
					/* beat detection */
					audioAnalyserData = new Uint8Array(analyser.frequencyBinCount);
					analyser.getByteFrequencyData(audioAnalyserData); // passing our Uint audioAnalyserData array
					audioAnalyserData = [...audioAnalyserData];
					loudness = utils.sum(audioAnalyserData);
					visualiserOffset += 12;
					ctx.clearRect(0, 0, audioVisualiser.width, audioVisualiser.height);
					if (logoSize === 70) {
						ctx.lineWidth = window.innerHeight * 0.01;
					} else {
						ctx.lineWidth = window.innerHeight * 0.007;
					}
					ctx.beginPath();
					ctx.strokeStyle = "#fff2";
					for (let i = 0; i < visualiserData.length; i++) {
						let l = (i * 4 * 5 + visualiserOffset) % (visualiserData.length * 4);
						if (visualiserData[i] < audioAnalyserData[l]) {
							visualiserData[i] += audioAnalyserData[l] / 8 * (255 / (l + 64) - 0.25);
						} else {
							visualiserData[i] *= 0.98;
						}
						/* do not render visualiser lines that are too short*/
						if (visualiserData[i] < 80) {
							continue;
						}
						let mag = (visualiserData[i] ** 1.6 / (255 ** 0.7) + 100);
						let angle = utils.map(i, 0, visualiserData.length, Math.PI, 3 * Math.PI);
						/* optimised rendering by not rendering parts of lines that are unseen */
						ctx.moveTo(audioVisualiser.width / 2 + Math.sin(angle) * audioVisualiser.width / 4, audioVisualiser.height / 2 + Math.cos(angle) * audioVisualiser.height / 4);
						ctx.lineTo(audioVisualiser.width / 2 + Math.sin(angle) * utils.map(mag, 0, 255, 0, audioVisualiser.width / 2), audioVisualiser.height / 2 + Math.cos(angle) * utils.map(mag, 0, 255, 0, audioVisualiser.width / 2));
					}
					ctx.stroke();
					/* beat detection */
					if (new Date().getMonth() === 11) {
						let snow = document.getElementById("snow").getElementsByTagName("img");
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
				switch (Options.getProperty("Performance", "maxFrameRate")) {
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
					gameplayRenderAccumulator.tick(time - previousTime);
				}
				if (logoBeatAccumulator && menuAudio.paused === false) {
					logoBeatAccumulator.tick(time - previousTime);
				} else {
					logoResetBeat();
				}
				if (beatmapQueue.length > 0) {
					Beatmaps.checkForNewMaps(beatmapQueue);
					loadedNewMaps = false;
				} else if (loadedNewMaps === false) {
					Beatmaps.refresh();
					loadMaps();
					loadedNewMaps = true;
				}
				previousTime = time;
				time = Date.now();
				if (gameplay.isRunning()) {
					setTimeout(animate, 0);
				} else {
					requestAnimationFrame(animate);
				}
			})();
		}
	});
	window.addEventListener("mousemove", function(mouse) {
		if (Options.getProperty("UserInterface", "menuParallax") === true && (document.getElementById("webpage-state-gameplay").style.display === "none" || document.getElementById("webpage-state-gameplay").style.display === "")) {
			backgroundImageParallax.style.top = (mouse.y - window.innerHeight * 0.5) / 128 - window.innerHeight * 0.05 + "px";
			backgroundImageParallax.style.left = (mouse.x - window.innerWidth * 0.5) / 128 - window.innerWidth * 0.05 + "px";
			menuParallax.style.top = "calc(5vh + " + ((mouse.y - window.innerHeight * 0.5) / 256 - window.innerHeight * 0.05) + "px)";
			menuParallax.style.left = "calc(" + ((mouse.x - window.innerWidth * 0.5) / 256 - window.innerWidth * 0.05) + "px)";
		}
	});
	/* Omnipotent web listeners */
	window.addEventListener("resize", function() {
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
		let paragraphElements = document.getElementById("splash-screen").getElementsByTagName("p");
		let imageElements = document.getElementById("splash-screen").getElementsByTagName("img");
		for (let i = 0; i < paragraphElements.length; i++) {
			paragraphElements[i].style.animation = "splash-screen-text forwards 1s";
			if (paragraphElements[i].id === "splash-screen-warning") {
				paragraphElements[i].style.animation = "splash-screen-text-2 forwards 1s";
			}
		}
		for (let i = 0; i < imageElements.length; i++) {
			imageElements[i].style.opacity = "1";
		}
		document.getElementById("splash-screen").style.animationDuration = "1s";
		document.getElementById("splash-screen").style.animationDelay = "1s";
		document.getElementById("heart-loader").style.display = "none";
	});
	window.addEventListener("blur", function() {
		if (document.getElementById("webpage-state-gameplay").style.display === "block" && document.getElementById("webpage-state-fail-screen").style.display === "none") {
			utils.showWebpageStates(["webpage-state-pause-screen"]);
			gameplay.pause();
		}
	});
	/* Top bar event listeners */
	document.getElementById("top-bar").addEventListener("mouseenter", function() {
		utils.brighten("background-dim", 0.5);
	});
	document.getElementById("top-bar").addEventListener("mouseleave", function() {
		utils.brighten("background-dim", 1);
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
	document.getElementById("close-btn").addEventListener("click", function() {
		document.getElementById("sidenav").style.width = "0";
		document.getElementById("sidenav").style.opacity = 0.2;
		AudioManager.play("back-button-click");
	});
	document.getElementById("settings-icon").addEventListener("click", function() {
		document.getElementById("menu-bar-settings").dispatchEvent(new CustomEvent("click"));
	});
	/* Menu bar buttons listeners */
	let buttons = document.getElementsByClassName("menu-bar-buttons-parent");
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", function() {
			switch (buttons[i].id) {
				case "menu-bar-settings":
					AudioManager.play("menu-options-click");
					break;
				case "menu-bar-play":
					AudioManager.play("menu-freeplay-click");
					break;
				case "menu-bar-edit":
					AudioManager.play("menu-edit-click");
					break;
				case "menu-bar-direct":
					AudioManager.play("menu-direct-click");
					break;
				case "menu-bar-exit":
					AudioManager.play("menu-exit-click");
					break;
			}
		});
		buttons[i].addEventListener("mouseenter", function() {
			let icon = this.getElementsByClassName("menu-bar-buttons-icon")[0];
			let image = this.getElementsByClassName("menu-bar-image-move")[0];
			icon.classList.add("menu-bar-buttons-icon-animation");
			image.classList.add("menu-bar-image-move-animation");
			if (logoBeatAccumulator.milliseconds !== parseFloat(image.style.animationDuration)) {
				icon.style.animationDuration = logoBeatAccumulator.milliseconds * 4 + "ms";
				image.style.animationDuration = logoBeatAccumulator.milliseconds + "ms";
			}
			AudioManager.play("menu-hover");
		});
		buttons[i].addEventListener("mouseleave", function() {
			this.getElementsByClassName("menu-bar-buttons-icon")[0].classList.remove("menu-bar-buttons-icon-animation");
			this.getElementsByClassName("menu-bar-image-move")[0].classList.remove("menu-bar-image-move-animation");
		});
	}
	/* All checkboxes listeners */
		let checkbox = document.getElementsByClassName("checkbox");
		for (let i = 0; i < checkbox.length; i++) {
			checkbox[i].addEventListener("change", function() {
				if (this.checked === true) {
					AudioManager.play("check-on");
				} else {
					AudioManager.play("check-off");
				}
				setSettings();
			});
			checkbox[i].addEventListener("mouseenter", function() {
				AudioManager.play("settings-hover");
			});
		}
		/* All range slider listeners */
		let sliders = document.getElementsByClassName("slider");
		for (let i = 0; i < sliders.length; i++) {
			sliders[i].addEventListener("input", function() {
				this.style.background = "linear-gradient(to right, #FD67AE 0%, #FD67AE " + utils.map(this.value, this.min, this.max, 0, 100) + "%, #7e3c57 " + utils.map(this.value, this.min, this.max, 0, 100) + "%, #7e3c57 100%)";
				AudioManager.play("sliderbar");
			});
			sliders[i].addEventListener("mouseenter", function() {
				AudioManager.play("settings-hover");
			});
		}
		/* All selectbox listeners */
		let selectBoxes = document.getElementsByClassName("select-box");
		for (let i = 0; i < selectBoxes.length; i++) {
			let selectBoxSelections = selectBoxes[i].getElementsByClassName("select-box-selections")[0];
			let selections = selectBoxSelections.getElementsByTagName("p");
			for (let j = 0; j < selections.length; j++) {
				selections[j].addEventListener("click", function() {
					let p = this.parentNode.getElementsByTagName("p");
					for (let k = 0; k < p.length; k++) {
						if (p[k] === this) {
							p[k].setAttribute("class", "selected");
						} else {
							p[k].setAttribute("class", "");
						}
					}
					this.parentNode.parentNode.getElementsByClassName("select-box-selected")[0].textContent = this.textContent;
					setSettings();
				});
			}
			selectBoxSelections.style.height = "auto";
			selectBoxSelections.style.cacheHeight = parseFloat(document.defaultView.getComputedStyle(selectBoxSelections).height) / window.innerHeight * 100;
			selectBoxSelections.style.height = 0;
			selectBoxes[i].addEventListener("click", function() {
				let selectBoxSelections = this.getElementsByClassName("select-box-selections")[0];
				if (selectBoxSelections.style.height === "0px" || selectBoxSelections.style.height === "") {
					selectBoxSelections.style.height = "calc(" + selectBoxSelections.style.cacheHeight + "vh + 1px)";
					selectBoxSelections.style.opacity = 1;
				} else {
					selectBoxSelections.style.height = 0;
					selectBoxSelections.style.opacity = 0;
				}
			});
			selectBoxes[i].addEventListener("mouseenter", function() {
				AudioManager.play("settings-hover");
			});
		}
	/* Specific menu bar button listeners */
	document.getElementById("menu-bar-settings").addEventListener("click", function() {
		document.getElementById("sidenav").style.width = "25vw";
		document.getElementById("sidenav").style.opacity = 1;
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
		resetMenu();
		logo.style.background = "none";
		logo.style.backgroundColor = "#000";
		document.getElementById("goodbye").style.zIndex = 10000;
		document.getElementById("goodbye").style.opacity = 1;
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
		AudioManager.setEffectsVolume(document.getElementById("settings-master-volume").value / 100 * this.value / 100);
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
			window.alert("local storage cleared, refresh for changes to take effect");
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
	document.getElementById("logo").addEventListener("click", function() {
		AudioManager.play("menu-hit");
		logoX = 30;
		logoY = 50;
		logoSize = 25;
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
			menuBarButtons[i].style.paddingTop = "5vh";
			menuBarButtons[i].style.paddingBottom = "5vh";
		}
		menuBar.style.top = "calc(50vh - 5vh * 1.5)";
		clearTimeout(menuTimeout);
		menuTimeout = setTimeout(resetMenu, 15000);
	});
	document.getElementById("menu-bar-play").addEventListener("click", function() {
		utils.showWebpageStates([
			"webpage-state-beatmap-selection",
			"webpage-state-mods",
			"bottom-bar",
		]);
		chooseRandomMap();
		utils.hideWebpageStates(["webpage-state-menu"]);
	});
	/* Helper */
	function chooseRandomMap() {
		let els = document.getElementsByClassName("beatmap-selection-group-pane");
		if (els.length >= 1) {
			let selectedElement = els[utils.randomInt(0, els.length - 1)];
			selectedElement.scrollIntoView({
				block: "center",
				inline: "end"
			});
			selectedElement.parentNode.parentNode.scrollTo(0, selectedElement.parentNode.parentNode.scrollTop);
			window.scrollTo(0, 0);
			selectedElement.dispatchEvent(new CustomEvent("click"));
		}
	}
	let menuTimeout;
	function resetMenu() {
		logoX = 50;
		logoY = 50;
		logoSize = 70;
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.style.width = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.height = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.top = "calc(" + logoY + "vh - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		audioVisualiser.style.left = "calc(5vw + " + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		let menuBar = document.getElementById("menu-bar");
		menuBar.style.opacity = 0;
		menuBar.style.top = "50vh";
		menuBar.style.visibility = "hidden";
		let menuBarButtons = document.getElementsByClassName("menu-bar-buttons-parent");
		for (let i = 0; i < menuBarButtons.length; i++) {
			menuBarButtons[i].style.paddingTop = 0;
			menuBarButtons[i].style.paddingBottom = 0;
		}
	}

	function setSettings() {
		if (settingsSet === true) {
			let index = 0;
			let userOptions = Options.get();
			for (let group in userOptions) {
				if (userOptions.hasOwnProperty(group) && typeof(userOptions[group]) === "object" && group !== "types") {
					for (let setting in userOptions[group]) {
						if (userOptions[group].hasOwnProperty(setting)) {
							let element = document.getElementById("settings-" + utils.camelCaseToDash(setting));
							switch (userOptions.types[index]) {
								case "slider":
									Options.update(group, setting, utils.map(element.value, element.min, element.max, 0, 1));
									break;
								case "checkbox":
									Options.update(group, setting, element.checked);
									break;
								case "selectbox":
									Options.update(group, setting, element.getElementsByClassName("select-box-selected")[0].textContent);
									break;
								case "text":
									Options.update(group, setting, element.textContent);
									break;
							}
							index++;
						}
					}
				}
			}
			Options.save();
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
		AudioManager.play("back-button-click");
		if (document.getElementById("webpage-state-results-screen").style.display === "block") {
			utils.showWebpageStates([
				"webpage-state-beatmap-selection",
				"webpage-state-mods",
				"top-bar",
			]);
			utils.hideWebpageStates([
				"webpage-state-results-screen",
			]);
		} else {
			utils.showWebpageStates([
				"webpage-state-menu",
			]);
			utils.hideWebpageStates([
				"webpage-state-mods",
				"webpage-state-beatmap-selection",
				"bottom-bar",
			]);
		}
		document.getElementById("menu-audio").play();
	});
	document.getElementById("back-button").addEventListener("mouseenter", function() {
		AudioManager.play("menu-hover");
	});
	document.getElementById("pause-menu-continue").addEventListener("click", function() {
		gameplay.continue();
		utils.hideWebpageStates([
			"webpage-state-pause-screen",
			"webpage-state-fail-screen",
		]);
	});
	function retry() {
		gameplay.retry();
		utils.hideWebpageStates([
			"webpage-state-pause-screen",
			"webpage-state-fail-screen",
		]);
	}
	document.getElementById("pause-menu-retry").addEventListener("click", retry);
	document.getElementById("fail-menu-retry").addEventListener("click", retry);
	function quit() {
		menuAudio.playbackRate = 1;
		menuAudio.play();
		utils.showWebpageStates([
			"webpage-state-beatmap-selection",
			"webpage-state-mods",
			"top-bar",
			"bottom-bar",
		]);
		utils.hideWebpageStates([
			"webpage-state-gameplay",
			"webpage-state-pause-screen",
			"webpage-state-fail-screen",
		]);
	}
	document.getElementById("pause-menu-quit").addEventListener("click", quit);
	document.getElementById("fail-menu-quit").addEventListener("click", quit);
	document.getElementById("upload-beatmap").addEventListener("change", function() {
		let fileReader = new FileReader();
		fileReader.addEventListener("load", function() {
			let new_zip = new JSZip();
			new_zip.loadAsync(event.target.result).then(function(zip) {
				let uniqueIdentifier;
				for (let key in zip.files) {
					if (key.includes(".mp3") || key.includes(".ogg")) {
						zip.files[key].async("binarystring").then(function(content) {
							beatmapQueue.push({
								type: "audio",
								name: uniqueIdentifier + key,
								data: btoa(content)
							});
						});
					} else if (key.includes(".osu")) {
						zip.files[key].async("string").then(function(content) {
							if (uniqueIdentifier === undefined) {
								let parsedMap = Parser.quickParseMap(content);
								uniqueIdentifier = parsedMap.Creator + parsedMap.Title;
							}
							beatmapQueue.push({
								type: "beatmap",
								name: key,
								data: content
							});
						});
					}
				}
			});
		});
		fileReader.readAsBinaryString(this.files[0]);
	});
	document.getElementById("bottom-bar-random").addEventListener("click", function() {
		chooseRandomMap();
	});
});