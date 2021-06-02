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
	const starRating = require("./src/scripts/starRating.js");
	const Formulas = require("./src/scripts/formulas.js");

	if (!window.localStorage) {
		console.warn("LocalStorage is not supported on this browser. You will not be able to save your options");
	}
	/* Offline context checks, needed to ensure for some effects to work */
	if (window.origin === null) {
		console.warn("The CORS origin is not set correctly or you may be running this client on the file system. You may experience audio visualiser bugs");
	}
	if (!window.indexedDB) {
		console.warn("IndexedDB is not supported on your browser. You will not be able to save your beatmaps");
	}
	/* osw! version incremented manually */
	const version = "osw! v0.8.0b";
	/* Set element version numbers */
	let classes = document.getElementsByClassName("client-version");
	for (let i = 0; i < classes.length; i++) {
		classes[i].textContent = version;
	}
	let loadedNewMaps = true;
	let lastElementClicked;
	function clickGroup(element) {
		let details = element.getElementsByClassName("beatmap-selection-group-pane")[0];
		let maps = element.getElementsByClassName("beatmap-selection-group-pane-maps")[0];
		let mapsChildren = maps.getElementsByClassName("beatmap-selection-map-pane");
		if (maps.style.display === "block") {
			lastElementClicked = element;
			maps.style.display = "none";
			details.classList.remove("beatmap-selection-selected");
			for (let i = 0; i < mapsChildren.length; i++) {
				mapsChildren[i].classList.remove("beatmap-selection-selected");
			}
		} else {
			clickMap(maps.getElementsByClassName("beatmap-selection-map-pane")[0])
			let groups = document.getElementsByClassName("beatmap-selection-group");
			for (let i = 0; i < groups.length; i++) {
				groups[i].getElementsByClassName("beatmap-selection-group-pane-maps")[0].style.display = "none";
				groups[i].getElementsByClassName("beatmap-selection-group-pane")[0].classList.remove("beatmap-selection-selected");
			}
			maps.style.display = "block";
			document.getElementById("beatmap-selection-right").scrollTo(0, element.offsetTop - window.innerHeight / 2);
			details.classList.add("beatmap-selection-selected");
			for (let i = 0; i < mapsChildren.length; i++) {
				mapsChildren[i].classList.add("beatmap-selection-selected");
			}
			let database = indexedDB.open("osw-database");
			database.addEventListener("success", function(event) {
				let beatmapCache = JSON.parse(localStorage.getItem("beatmapCache"));
				let database = event.target.result;
				let audioObjectStore = databaseManager.getObjectStore(database, "audio", "readonly");
				let audioRequest = audioObjectStore.get(details.getAttribute("data-audio-source"));
				audioRequest.addEventListener("error", function(event) {
					console.error(`Attempt to find query failed: ${event.target.error}`);
				});
				audioRequest.addEventListener("success", function(event) {
					let audioType;
					if (event.target.result.name.toLowerCase().includes(".mp3")) {
						audioType = "mp3";
					} else if (event.target.result.name.toLowerCase().includes(".ogg")) {
						audioType = "ogg";
					}
					let first = maps.getElementsByClassName("beatmap-selection-map-pane")[0];
					logoBeatAccumulator.milliseconds = beatmapCache[parseInt(details.getAttribute("data-index"))].difficulties[0].beatLength;
					menuAudio.src = `data:audio/${audioType};base64,${event.target.result.data}`;
					menuAudio.currentTime = beatmapCache[parseInt(details.getAttribute("data-index"))].previewTime;
					menuAudio.play();
				});
			});
		}
	}
	function clickMap(element) {
		let selectedMods = Mods();
			let selectedModElements = document.getElementsByClassName("mod-selected");
			for (let i = 0; i < selectedModElements.length; i++) {
				selectedMods[selectedModElements[i].id.replace("mod-", "")] = true;
			}
			let beatmapCache = JSON.parse(localStorage.getItem("beatmapCache"));
			if (lastElementClicked != element) {
				setDifficultyBars(beatmapCache[element.getAttribute("data-group-index")].difficulties[element.getAttribute("data-map-index")], selectedMods);
				setStatisticValues(beatmapCache[element.getAttribute("data-group-index")], beatmapCache[element.getAttribute("data-group-index")].difficulties[element.getAttribute("data-map-index")], selectedMods);
				let colour = Formulas.beatmapDifficultyColour(beatmapCache[element.getAttribute("data-group-index")].difficulties[element.getAttribute("data-map-index")].starRating);
				document.getElementById("beatmap-image-difficulty-border").style.backgroundColor = colour;
				document.getElementById("beatmap-image-difficulty-border-2").style.backgroundColor = colour;
				document.getElementById("beatmap-selection-right").scrollTo(0, element.offsetTop - window.innerHeight / 2);
				lastElementClicked = element;
				if (element.getAttribute("data-image-filename") !== "") {
					let database = indexedDB.open("osw-database");
					database.addEventListener("success", function(event) {
						let database = event.target.result;
						let imageObjectStore = databaseManager.getObjectStore(database, "images", "readonly");
						let imageRequest = imageObjectStore.get(element.getAttribute("data-image-filename"));
						imageRequest.addEventListener("error", function(event) {
							console.error(`Attempt to find query failed: ${event.target.error}`);
						});
						imageRequest.addEventListener("success", function(event) {
							if (event.target.result) {
								let imageType;
								if (event.target.result.name.toLowerCase().includes(".jpg")) {
									imageType = "jpg";
								} else if (event.target.result.name.toLowerCase().includes(".jpeg")) {
									imageType = "jpeg";
								} else if (event.target.result.name.toLowerCase().includes(".png")) {
									imageType = "png";
								}
								document.getElementById("beatmap-image").style.backgroundImage = `url("data:image/${imageType};base64,${event.target.result.data}")`;
								document.getElementById("background").src = `data:image/${imageType};base64,${event.target.result.data}`;
								document.getElementById("background").style.filter = `blur(${utils.map(Options.getProperty("UserInterface", "backgroundBlur"), 0, 1, 0, 16)}px)`;
							} else {
								document.getElementById("beatmap-image").style.backgroundImage = `url("./src/images/osw-background.png")`;
								document.getElementById("background").src = "./src/images/osw-background.png";
								document.getElementById("background").style.filter = "blur(0)";
							}
						});
					});
				}
			} else {
				let database = indexedDB.open("osw-database");
				database.addEventListener("success", function(event) {
					let database = event.target.result;
					let beatmapObjectStore = databaseManager.getObjectStore(database, "beatmaps", "readonly");
					let beatmapRequest = beatmapObjectStore.get(beatmapCache[element.getAttribute("data-group-index")].difficulties[element.getAttribute("data-map-index")].databaseKey);
					beatmapRequest.addEventListener("error", function(event) {
						console.error(`Attempt to find query failed: ${event.target.error}`);
					});
					beatmapRequest.addEventListener("success", function(event) {
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
						document.getElementById("sidenav").style.width = "0";
						document.getElementById("sidenav").style.opacity = "0.2";
						menuAudio.pause();
						/* reset */
						menuAudio.currentTime = 0;
						gameplay.playMap(event.target.result.data, selectedMods);
					});
				});
			}
	}
	/* event delegation - reduces event listeners */
	document.getElementById("beatmap-selection-right").addEventListener("click", function(event) {
		let parent = event.target;
		/* find the highest beatmap group or beatmap pane from the click target */
		while (parent.classList.contains("beatmap-selection-group") === false && parent.classList.contains("beatmap-selection-map-pane") === false) {
			parent = parent.parentNode;
		}
		if (parent.classList.contains("beatmap-selection-group")) {
			clickGroup(parent);
		} else if (parent.classList.contains("beatmap-selection-map-pane")) {
			clickMap(parent);
		}
	});
	function setDifficultyBars(map, mods) {
		let parts = ["circle-size", "hp-drain", "accuracy", "approach-rate", "star-rating"];
		let key = ["circleSize", "healthDrain", "overallDifficulty", "approachRate", "starRating"];
		for (let i = 0; i < parts.length; i++) {
			let difficultyValue;
			if (key[i] === "starRating") {
				difficultyValue = map[key[i]];
			} else {
				let multiplier = (key[i] === "circleSize") ? 1.3 : 1.4;
				difficultyValue = Formulas.applyModMultiplier(map[key[i]], mods, multiplier);
			}
			document.getElementById(parts[i] + "-difficulty").style.width = utils.clamp(difficultyValue, 0, 10) + "vw";
			document.getElementById(parts[i] + "-difficulty-value").textContent = Math.round(difficultyValue * 100) / 100;
		}
	}
	function setStatisticValues(group, map, mods) {
		let multiplier = 1;
		if (mods.doubleTime || mods.nightCore) {
			multiplier = 1.5;
		} else if (mods.halfTime) {
			multiplier = 0.75;
		}
		document.getElementById("beatmap-statistics-version").textContent = map.version;
		document.getElementById("beatmap-statistics-title").textContent = group.title;
		document.getElementById("beatmap-statistics-artist").textContent = group.artist;
		document.getElementById("beatmap-statistics-creator").textContent = group.creator;

		document.getElementById("beatmap-statistics-drain-time").textContent = map.drainTime;
		document.getElementById("beatmap-statistics-bpm").textContent = Math.round(60000 / (map.beatLength / multiplier));
		document.getElementById("beatmap-statistics-circle-count").textContent = map.objectCounts.circles;
		document.getElementById("beatmap-statistics-slider-count").textContent = map.objectCounts.sliders;
		document.getElementById("beatmap-statistics-spinner-count").textContent = map.objectCounts.spinners;
	}
	/* if cache already exist, then use it */
	if (localStorage.getItem("beatmapCache") && localStorage.getItem("beatmapCache") !== "[]") {
		/* Beatmap loading and adding to dom */
		let concatenated = "";
		let cache = JSON.parse(localStorage.getItem("beatmapCache"));
		for (let i = 0; i < cache.length; i++) {
			concatenated += BeatMapSelectionPaneTemplate.group(cache[i], i);
		}
		document.getElementById("beatmap-selection-right").innerHTML = concatenated;
	} else {
		Beatmaps.refresh();
		loadMaps();
	}

	function loadMaps() {
		if (Beatmaps.allMapsLoaded()) {
			let loadedMaps = Beatmaps.get();
			/* Beatmap loading and adding to dom */
			let concatenated = "";
			let cache = [];
			for (let i = 0; i < loadedMaps.length; i++) {
				let cacheData = {
					audioFilename: loadedMaps[i][0].data.AudioFilename,
					artist: loadedMaps[i][0].data.Artist,
					creator: loadedMaps[i][0].data.Creator,
					title: loadedMaps[i][0].data.Title,
					previewTime: loadedMaps[i][0].data.PreviewTime / 1000,
					difficulties: [],
				};
				for (let j = 0; j < loadedMaps[i].length; j++) {
					cacheData.difficulties.push({
						databaseKey: loadedMaps[i][j].name,
						version: loadedMaps[i][j].data.Version,
						approachRate: loadedMaps[i][j].data.ApproachRate,
						circleSize: loadedMaps[i][j].data.CircleSize,
						overallDifficulty: loadedMaps[i][j].data.OverallDifficulty,
						healthDrain: loadedMaps[i][j].data.HPDrainRate,
						starRating: starRating.calculate(loadedMaps[i][j].data),
						beatLength: loadedMaps[i][j].data.timingPoints[0].beatLength * 1000,
						backgroundFilename: (loadedMaps[i][j].data.background) ? loadedMaps[i][j].data.background.filename : "",
						objectCounts: Formulas.getObjectCount(loadedMaps[i][j].data),
						drainTime: utils.secondsToMinuteSeconds(loadedMaps[i][j].data.hitObjects[loadedMaps[i][j].data.hitObjects.length - 1].time - loadedMaps[i][j].data.hitObjects[0].time),
					});
				}
				cache.push(cacheData);
			}
			if (cache.length > 0) {
				localStorage.setItem("beatmapCache", JSON.stringify(cache));
			}
			for (let i = 0; i < cache.length; i++) {
				concatenated += BeatMapSelectionPaneTemplate.group(cache[i], i);
			}
			document.getElementById("beatmap-selection-right").innerHTML = concatenated;
		} else {
			/* every 250ms try and load maps from the indexedDB */
			setTimeout(loadMaps, 250);
		}
	}

	function chooseRandomMap() {
		let groups = document.getElementsByClassName("beatmap-selection-group");
		if (groups.length > 0) {
			clickGroup(groups[Math.floor(Math.random() * groups.length)]);
		}
	}

	function logoBeat() {
		/* logo pulse */
		logo.style.transition = "width 0.05s, top 0.05s, left 0.05s, background-size 0.05s, filter 0.05s";
		logo.style.width = logoSize + "vh";
		logo.style.top = "calc(" + logoY + "vh - " + logoSize / 2 + "vh)";
		logo.style.left = "calc(" + logoX + "vw - " + logoSize / 2 + "vh)";
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
		logo.style.left = "calc(" + logoX + "vw - " + ((logoSize * logoSizeIncrease) / 2) + "vh)";
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
	let songs = ["cYsmix - Triangles.mp3"];
	let defaultSongsMs = [375];
	let chosenSong;
	let menuAudio = document.getElementById("menu-audio");
	menuAudio.addEventListener("play", function() {
		beatNumber = 0;
		logoBeatAccumulator.accumulator = 0;
		audioCtx.resume();
	});
	menuAudio.addEventListener("ended", function() {
		if (document.getElementById("webpage-state-menu").style.display === "block") {
			chooseRandomMap();
		} else if (document.getElementById("webpage-state-gameplay").style.display !== "block") {
			this.play();
		}
	});
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
	let logoX = 55;
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
	let audioQueue = [];
	let imageQueue = [];
	/* Event Listeners */
	window.addEventListener("click", function() {
		if (isFirstClick && document.readyState === "complete") {
			AudioManager.load("back-button-click", "./src/audio/effects/back-button-click.wav", "effects", true);
			AudioManager.load("menu-options-click", "./src/audio/effects/menu-options-click.wav", "effects", true);
			AudioManager.load("menu-freeplay-click", "./src/audio/effects/menu-freeplay-click.wav", "effects", true);
			AudioManager.load("menu-edit-click", "./src/audio/effects/menu-edit-click.wav", "effects", true);
			AudioManager.load("menu-direct-click", "./src/audio/effects/menu-direct-click.wav", "effects", true);
			AudioManager.load("menu-exit-click", "./src/audio/effects/menu-exit-click.wav", "effects", true);
			AudioManager.load("menu-hover", "./src/audio/effects/menu-hover.wav", "effects", true);
			AudioManager.load("check-on", "./src/audio/effects/check-on.wav", "effects", true);
			AudioManager.load("check-off", "./src/audio/effects/check-off.wav", "effects", true);
			AudioManager.load("settings-hover", "./src/audio/effects/settings-hover.wav", "effects", true);
			AudioManager.load("sliderbar", "./src/audio/effects/sliderbar.wav", "effects", true);
			AudioManager.load("menu-hit", "./src/audio/effects/menu-hit.wav", "effects", true);
			let userOptions = Options.get();
			introSequence.animate();
			/* Setting settings */
			let index = 0;
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
			chosenSong = 0;
			menuAudio.src = `src/audio/${songs[chosenSong]}`;
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
					case "Browser maximum (250fps)":
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
				let maxFramerate = Options.getProperty("Performance", "maxFrameRate");
				if (maxFramerate === "VSync") {
					gameplayRenderAccumulator.milliseconds = 1000 / 60;
				} else if (maxFramerate === "2x VSync") {
					gameplayRenderAccumulator.milliseconds = 1000 / 120;
				} else if (maxFramerate === "Browser maximum (250fps)") {
					gameplayRenderAccumulator.milliseconds = 1000 / 250;
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
				if (audioQueue.length > 0) {
					Beatmaps.addAudio(audioQueue);
				}
				if (imageQueue.length > 0) {
					Beatmaps.addImage(imageQueue);
				}
				if (beatmapQueue.length > 0) {
					Beatmaps.addNewMaps(beatmapQueue);
					loadedNewMaps = false;
				} else if (loadedNewMaps === false) {
					localStorage.removeItem("beatmapCache");
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
		if (Options.getProperty("UserInterface", "menuParallax") && (document.getElementById("webpage-state-gameplay").style.display === "none" || document.getElementById("webpage-state-gameplay").style.display === "")) {
			let backgroundImageParallax = document.getElementById("background-dim");
			let menuParallax = document.getElementById("menu-parallax");
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
		audioVisualiser.style.left = "calc(" + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
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
			switch (this.id) {
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
				if (this.checked) {
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
					let selections = this.parentNode.getElementsByTagName("p");
					for (let k = 0; k < selections.length; k++) {
						if (selections[k] === this) {
							selections[k].setAttribute("class", "selected");
						} else {
							selections[k].setAttribute("class", "");
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
		if (this.checked) {
			document.getElementById("frame-rate").style.opacity = 1;
		} else {
			document.getElementById("frame-rate").style.opacity = 0;
		}
	});
	/* Specific range slider listeners */
	document.getElementById("settings-master-volume").addEventListener("input", function() {
		document.getElementById("settings-master-volume-text").textContent = "Master volume: " + this.value + "%";
		menuAudio.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
		AudioManager.setEffectsVolume(document.getElementById("settings-master-volume").value / 100 * this.value / 100);
		setSettings();
	});
	document.getElementById("settings-music-volume").addEventListener("input", function() {
		document.getElementById("settings-music-volume-text").textContent = "Music volume: " + this.value + "%";
		menuAudio.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
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
	document.getElementById("settings-background-blur").addEventListener("input", function() {
		document.getElementById("settings-background-blur-text").textContent = "Background blur: " + this.value + "px";
		if (document.getElementById("background").src.includes("osw-background.png") === false) {
			document.getElementById("background").style.filter = `blur(${this.value}px)`;
		}
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
			window.alert("local storage cleared, the webpage will now refresh");
			location.reload();
		}
	});
	document.getElementById("settings-button-delete-beatmap-cache").addEventListener("click", function() {
			window.localStorage.removeItem("beatmapCache");
			window.alert("beatmap cache cleared, the webpage will now refresh");
			location.reload();
	});
	document.getElementById("settings-button-delete-all-beatmaps").addEventListener("click", function() {
		if (window.confirm("Are you sure you want to delete all beatmaps? this option is not undoable")) {
			let database = indexedDB.open("osw-database");
			window.localStorage.removeItem("beatmapCache");
			database.addEventListener("success", function(event) {
				let database = event.target.result;
				const toDelete = ["beatmaps", "audio", "images"];
				for (let i = 0; i < toDelete.length; i++) {
					let transaction = database.transaction(toDelete[i], "readwrite");
					let objectStore = transaction.objectStore(toDelete[i]);
					let objectStoreRequest = objectStore.clear();
					if (i >= toDelete.length - 1) {
						objectStoreRequest.addEventListener("success", function() {
							window.alert("all beatmaps deleted, the webpage will now refresh");
							location.reload();
						});
					}
				}
			});
			database.addEventListener("error", function(event) {
				console.error(`Attempt to open database failed: ${event.target.error}`);
			});
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
		logoX = 35;
		logoY = 50;
		logoSize = 25;
		logo.style.width = logoSize + "vh";
		logo.style.top = "calc(" + logoY + "vh - " + logoSize / 2 + "vh)";
		logo.style.left = "calc(" + logoX + "vw - " + logoSize / 2 + "vh)";
		logo.style.backgroundSize = logoSize + "vh";
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.style.width = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.height = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.top = "calc(" + logoY + "vh - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		audioVisualiser.style.left = "calc(" + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
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
		utils.hideWebpageStates(["webpage-state-menu"]);
		chooseRandomMap();
	});
	/* Helper */
	let menuTimeout;
	function resetMenu() {
		logoX = 55;
		logoY = 50;
		logoSize = 70;
		logo.style.width = logoSize + "vh";
		logo.style.top = "calc(" + logoY + "vh - " + logoSize / 2 + "vh)";
		logo.style.left = "calc(" + logoX + "vw - " + logoSize / 2 + "vh)";
		logo.style.backgroundSize = logoSize + "vh";
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.style.width = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.height = logoSize * audioVisualiserSize + "vh";
		audioVisualiser.style.top = "calc(" + logoY + "vh - " + (logoSize * audioVisualiserSize / 2) + "vh)";
		audioVisualiser.style.left = "calc(" + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
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
		if (settingsSet) {
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
		menuAudio.play();
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
		for (let i = 0; i < this.files.length; i++) {
			let fileReader = new FileReader();
			fileReader.addEventListener("load", function() {
				let new_zip = new JSZip();
				new_zip.loadAsync(event.target.result).then(function(zip) {
					let uniqueIdentifier = undefined;
					let backgroundNames = [];
					let beatmapFiles = [];
					let audioFiles = [];
					let imageFiles = [];
					for (let key in zip.files) {
						if (key.toLowerCase().includes(".mp3") || key.toLowerCase().includes(".ogg")) {
							audioFiles.push(key);
						} else if (key.toLowerCase().includes(".osu")) {
							beatmapFiles.push(key);
						} else if (key.toLowerCase().includes(".jpg") || key.toLowerCase().includes(".jpeg") || key.toLowerCase().includes(".png")) {
							imageFiles.push(key);
						}
					}
					for (let j = 0; j < beatmapFiles.length; j++) {
						zip.files[beatmapFiles[j]].async("string").then(function(content) {
							let parsedMap = Parser.parseBeatmap(content);
							if (uniqueIdentifier === undefined) {
								uniqueIdentifier = parsedMap.Creator + parsedMap.Title;
							}
							if (parsedMap.background) {
								backgroundNames.push(parsedMap.background.filename);
							}
							beatmapQueue.push({
								name: beatmapFiles[j],
								data: parsedMap,
							});
							if (j >= beatmapFiles.length - 1) {
								for (let k = 0; k < audioFiles.length; k++) {
									zip.files[audioFiles[k]].async("binarystring").then(function(content) {
										audioQueue.push({
											name: uniqueIdentifier + audioFiles[k],
											data: btoa(content)
										});
									});
								}
								for (let k = 0; k < imageFiles.length; k++) {
									if (backgroundNames.includes(imageFiles[k])) {
										zip.files[imageFiles[k]].async("binarystring").then(function(content) {
											imageQueue.push({
												name: uniqueIdentifier + imageFiles[k],
												data: btoa(content)
											});
										});
									}
								}
							}
						});
					}
				});
			});
			fileReader.readAsBinaryString(this.files[i]);
		}
	});
	document.getElementById("beatmap-search-bar").addEventListener("input", function() {
		let groups = document.getElementsByClassName("beatmap-selection-group");
		for (let i = 0; i < groups.length; i++) {
			let name = groups[i].getElementsByClassName("beatmap-selection-group-title")[0].textContent;
			/* literal search, searchs for exact character sequences */
			if (name.toLowerCase().includes(this.value.toLowerCase())) {
				groups[i].style.display = "block";
			} else {
				groups[i].style.display = "none";
			}
		}
	});
	document.getElementById("bottom-bar-random").addEventListener("click", function() {
		chooseRandomMap();
	});
});