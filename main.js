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
	const Mouse = require("src/scripts/Mouse.js");
	let Options = require("src/scripts/Options.js");
	const AssetLoader = require("src/scripts/AssetLoader.js");
	const utils = require("src/scripts/utils.js");
	const AttachAudio = require("src/scripts/AttachAudio.js");
	const Beatmaps = require("src/scripts/DefaultBeatMaps.js");
	const BeatMapSelectionPaneTemplate = require("src/scripts/BeatMapSelectionPane.js");
	let gameplay = require("src/scripts/gameplay.js");
	/* Offline context checks, needed to ensure for some effects to work */
	if (window.origin === null) {
		console.warn("You appear to be running this locally without a web server, some effects may not work due to CORS");
	}
	/* Osu!web version incremented manually */
	const version = "osu!web v2021.0.8.0b";
	/* Set element version numbers */
	let classes = document.getElementsByClassName("version-number");
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
							menuAudio.src = "src/audio/" + this.dataset.audiosource;
							menuAudio.currentTime = 0;
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
					document.getElementById("menu-audio").pause();
					gameplay.playMap(this.dataset.groupIndex, this.dataset.mapIndex);
				});
			}
		} else {
			/* every 100ms try and load maps from the server*/
			setTimeout(loadMaps, 100);
		}
	})();
	/* Initialise mouse module */
	let mouse = new Mouse("body");
	mouse.init();
	/* Initial menu song pool */
	let songs = [
	"cYsmix - Triangles.mp3",
	"nekodex - circles.mp3",
	];
	/* Only add christmas songs to list if the month is December */
	if (new Date().getMonth() === 11) {
		songs.push("nekodex - aureole.mp3");
		songs.push("nekodex - Little Drummer Girl.mp3");
	}
	let chosenSong;
	let menuAudio = new Audio();
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
	menuAudio.id = "menu-audio";
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
	let audioAnalyserDataPrevious;
	let audioAnalyserDataPreviousSum = 0;
	let audioAnalyserDataSum = 0;
	let beatThreshold = 0.02;
	let volumeThreshold = 300000;
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
	let menuState = "just-logo";
	let logoX = 50;
	let logoY = 50;
	let logoSize = 70;
	let logoPulseSize = 75;
	let audioVisualiserSize = 1.6;
	audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
	audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
	audioVisualiser.style.width = logoSize * audioVisualiserSize + "vh";
	audioVisualiser.style.height = logoSize * audioVisualiserSize + "vh";
	audioVisualiser.style.top = "calc(" + logoY + "vh - " + (logoSize * audioVisualiserSize / 2) + "vh)";
	audioVisualiser.style.left = "calc(5vw + " + logoX + "vw - " + (logoSize * audioVisualiserSize / 2) + "vh)";
	/* Profiling variables */
	let times = [];
	let frameRate = 0;
	/* Event Listeners */
	window.addEventListener("click", function() {
		if (isFirstClick === true && document.readyState === "complete") {
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
									element.dispatchEvent(new CustomEvent("input", {detail: true}));
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
				ctx.clearRect(0, 0, audioVisualiser.width, audioVisualiser.height);
				/* beat detection */
				audioAnalyserDataPrevious = audioAnalyserData;
				audioAnalyserData = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(audioAnalyserData); // passing our Uint audioAnalyserData array
				audioAnalyserData = [...audioAnalyserData];
				audioAnalyserDataPreviousSum = audioAnalyserDataSum;
				audioAnalyserDataSum = 0;
				let len = audioAnalyserData.length / 4;
				for (var i = 0; i < len; i++) {
					audioAnalyserDataSum += audioAnalyserData[i] * Math.sqrt(len - i);
				}
				let triangleBackgroundMoves = document.getElementsByClassName("triangle-background");
				/* triangle background moves */
				offset -= 0.5;
				ctx.lineWidth = 7;
				ctx.beginPath();
				ctx.strokeStyle = "#fff5";
				let length = audioAnalyserData.length * (2 / 3);
				for (var i = 0; i < length; i += 4) {
					let angle = utils.map(i, 0, length, 0, 2 * Math.PI) + Math.PI;
					let mag = audioAnalyserData[i] ** 1.5 / (255 ** 0.55) + 100;
					ctx.moveTo(audioVisualiser.width / 2, audioVisualiser.height / 2);
					ctx.lineTo(audioVisualiser.width / 2 + Math.sin(angle) * utils.map(mag, 0, 255, 0, audioVisualiser.width / 2), audioVisualiser.height / 2 + Math.cos(angle) * utils.map(mag, 0, 255, 0, audioVisualiser.width / 2));
				}
				ctx.stroke();
				for (let i = 0; i < triangleBackgroundMoves.length; i++) {
					triangleBackgroundMoves[i].style.backgroundPositionY = triangleBackgroundMoves[i].getBoundingClientRect().bottom + offset + "px";
				}
				if (document.getElementById("webpage-state-menu").style.display === "block" || document.getElementById("webpage-state-menu").style.display === "") {
					let backgroundImageParallax = document.getElementById("background-blur");
					let menuParallax = document.getElementById("menu-parallax");
					let logo = document.getElementById("logo");
					let logoSizeIncrease = 1.1;
					/* style image parallax based on mouse position */
					backgroundImageParallax.style.opacity = 1;
					if (Options.UserInterface.menuParallax === true) {
						backgroundImageParallax.style.top = (mouse.position.y - window.innerHeight * 0.5) / 128 - window.innerHeight * 0.05 + "px";
						backgroundImageParallax.style.left = (mouse.position.x - window.innerWidth * 0.5) / 128 - window.innerWidth * 0.05 + "px";
						menuParallax.style.top = "calc(5vh + " + ((mouse.position.y - window.innerHeight * 0.5) / 256 - window.innerHeight * 0.05) + "px)";
						menuParallax.style.left = "calc(" + ((mouse.position.x - window.innerWidth * 0.5) / 256 - window.innerWidth * 0.05) + "px)";
					} else {
						backgroundImageParallax.style.top = 0;
						backgroundImageParallax.style.left = 0;
						menuParallax.style.top = 0;
						menuParallax.style.left = 0;
					}
					/* beat detection */
					if (audioAnalyserDataSum - audioAnalyserDataPreviousSum > audioAnalyserDataSum * beatThreshold && audioAnalyserDataSum > volumeThreshold * (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100)) {
						/* logo pulse*/
						logo.style.transition = "width 0.05s, top 0.05s, left 0.05s, background-size 0.05s, filter 0.5s";
						logo.style.width = logoSize + "vh";
						logo.style.top = "calc(" + logoY + "vh - " + logoSize / 2 + "vh)";
						logo.style.left = "calc(5vw + " + logoX + "vw - " + logoSize / 2 + "vh)";
						logo.style.backgroundSize = logoSize + "vh";
						// logo.style.backgroundPositionY = offset % (1024 * 0.5) + "px";
						/* logo background pulse, maximum 5 to prevent lag */
						if (document.getElementById("logo-beat").querySelectorAll("img").length <= 5) {
							let logoCircle = document.createElement("img");
							logoCircle.src = "src/images/circle.png";
							logoCircle.style.position = "absolute";
							logoCircle.style.width = logoPulseSize + "vh";
							logoCircle.style.top = "calc(" + logoY + "vh - " + logoPulseSize / 2 + "vh)";
							logoCircle.style.left = "calc(" + logoX + "vw - " + logoPulseSize / 2 + "vh)";
							logoCircle.style.opacity = 0.5;
							document.getElementById("logo-beat").appendChild(logoCircle);
						}
						/* snow only in december, maximum 50 to prevent lag */
						/* last tested:
						 *	
						 *	27/12/2020, works
						 *	9/01/2021, works
						 */
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
					} else {
						logo.style.transition = "width 0.5s, top 0.5s, left 0.5s, background-size 0.5s, filter 0.5s";
						logo.style.backgroundSize = logoSize * logoSizeIncrease + "vh";
						logo.style.width = logoSize * logoSizeIncrease + "vh";
						logo.style.top = "calc(" + logoY + "vh - " + ((logoSize * logoSizeIncrease) / 2) + "vh)";
						logo.style.left = "calc(5vw + " + logoX + "vw - " + ((logoSize * logoSizeIncrease) / 2) + "vh)";
						logo.style.backgroundSize = logoSize * logoSizeIncrease + "vh";
						// logo.style.backgroundPositionY = offset % (1024 * 0.5) * logoSizeIncrease + "px";
					}
					let logoCircles = document.getElementById("logo-beat").querySelectorAll("img");
					for (let i = 0; i < logoCircles.length; i++) {
						if (parseFloat(logoCircles[i].style.opacity) <= 0) {
							logoCircles[i].remove();
							break;
						}
						logoCircles[i].style.opacity = parseFloat(logoCircles[i].style.opacity) - 0.05;
						logoCircles[i].style.width = parseFloat(logoCircles[i].style.width) + 0.5 + "vh";
						logoCircles[i].style.top = "calc(" + logoY + "vh - " + logoCircles[i].style.width + " / 2)";
						logoCircles[i].style.left = "calc(5vw + " + logoX + "vw - " + logoCircles[i].style.width + " / 2)";
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
					/* Profiling */
					const now = Date.now();
					while (times.length > 0 && times[0] <= now - 1000) {
						times.shift();
					}
					times.push(now);
					frameRate = times.length;
					let textContent = frameRate;
					if (Options.Performance.maxFrameRate === "VSync") {
						textContent += " / 60fps";
					} else if (Options.Performance.maxFrameRate === "2x VSync") {
						textContent += " / 120fps";
					} else if (Options.Performance.maxFrameRate === "Browser Maximum (250fps)") {
						textContent += " / 250fps";
					}
					document.getElementById("frame-rate").textContent = textContent;
					if (frameRate > 60) {
						document.getElementById("frame-rate").style.background = "#6d9eeb";
					} else if (frameRate > 45) {
						document.getElementById("frame-rate").style.background = "#39e639";
					} else if (frameRate > 20) {
						document.getElementById("frame-rate").style.background = "#ffa500";
					} else {
						document.getElementById("frame-rate").style.background = "#B00020";
					}
				}
				requestAnimationFrame(animate);
			})();
		}
	});
	/* Omnipotent web listeners */
	window.addEventListener("resize", function() {
		let audioVisualiser = document.getElementById("audio-visualiser");
		audioVisualiser.width = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		audioVisualiser.height = (logoSize / 100) * audioVisualiserSize * window.innerHeight;
		window.dispatchEvent(new CustomEvent("orientationchange"));
	});
	window.addEventListener("load", function() {
		document.getElementById("splash-screen").style.animation = "splash-screen-text forwards";
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
		if (document.getElementById("menu-audio").paused) {
			document.getElementById("menu-audio").play();
			this.innerHTML = "&#x275A;&#x275A;";
		} else {
			document.getElementById("menu-audio").pause();
			this.innerHTML = "&#x25BA;";
		}
	});
	/* Sidenav event listener */
	AttachAudio(document.getElementById("close-btn"), "click", "src/audio/effects/back-button-click.wav", "settings-master-volume", "settings-effects-volume");
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
				clickSrc = "src/audio/effects/menu-options-click.wav";
				hoverSrc = "src/audio/effects/menu-options-hover.wav";
				break;
			case "menu-bar-play":
				clickSrc = "src/audio/effects/menu-freeplay-click.wav";
				hoverSrc = "src/audio/effects/menu-freeplay-hover.wav";
				break;
			case "menu-bar-edit":
				clickSrc = "src/audio/effects/menu-edit-click.wav";
				hoverSrc = "src/audio/effects/menu-edit-hover.wav";
				break;
			case "menu-bar-direct":
				clickSrc = "src/audio/effects/menu-direct-click.wav";
				hoverSrc = "src/audio/effects/menu-direct-hover.wav";
				break;
			case "menu-bar-exit":
				clickSrc = "src/audio/effects/menu-exit-click.wav";
				hoverSrc = "src/audio/effects/menu-exit-hover.wav";
				break;
		}
		AttachAudio(buttons[i], "click", clickSrc, "settings-master-volume", "settings-effects-volume");
		AttachAudio(buttons[i], "mouseenter", hoverSrc, "settings-master-volume", "settings-effects-volume");
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
	/* All checkboxes listeners */
	let checkbox = document.getElementsByClassName("checkbox");
	for (let i = 0; i < checkbox.length; i++) {
		checkbox[i].addEventListener("change", function() {
			if (this.checked === true) {
				let checkOn = AssetLoader.audio("src/audio/effects/check-on.wav");
				checkOn.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-effects-volume").value / 100);
				checkOn.play();
			} else {
				let checkOff = AssetLoader.audio("src/audio/effects/check-off.wav");
				checkOff.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-effects-volume").value / 100);
				checkOff.play();
			}
			setSettings();
		});
		AttachAudio(checkbox[i], "mouseenter", "src/audio/effects/menuclick.wav", "settings-master-volume", "settings-effects-volume");
	}
	/* Specific checkbox listeners */
	document.getElementById("settings-show-fps").addEventListener("input", function() {
		if (this.checked === true) {
			document.getElementById("frame-rate").style.opacity = 1;
		} else {
			document.getElementById("frame-rate").style.opacity = 0;
		}
	});
	/* All range slider listeners */
	let sliders = document.getElementsByClassName("slider");
	for (let i = 0; i < sliders.length; i++) {
		sliders[i].addEventListener("input", function() {
			this.style.background = "linear-gradient(to right, #FD67AE 0%, #FD67AE " + utils.map(this.value, this.min, this.max, 0, 100) + "%, #7e3c57 " + utils.map(this.value, this.min, this.max, 0, 100) + "%, #7e3c57 100%)";
		});
		AttachAudio(sliders[i], "input", "src/audio/effects/sliderbar.wav", "settings-master-volume", "settings-effects-volume");
		AttachAudio(sliders[i], "mouseenter", "src/audio/effects/menuclick.wav", "settings-master-volume", "settings-effects-volume");
	}
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
		if (this.value === "1") {
			resolution = "Full";
		} else if (this.value === "2") {
			resolution = "Half";
		} else if (this.value === "3") {
			resolution = "Quarter";
		} else if (this.value === "4") {
			resolution = "Eighth";
		} else if (this.value === "5") {
			resolution = "Sixteenth";
		}
		document.getElementById("settings-slider-resolution-text").textContent = "Slider resolution: " + resolution;
		setSettings();
	});
	/* All selectbox listeners */
	let selectBoxes = document.getElementsByClassName("select-box");
	for (let i = 0; i < selectBoxes.length; i++) {
		let selectBoxSelections = selectBoxes[i].getElementsByClassName("select-box-selections")[0];
		let selections = selectBoxSelections.querySelectorAll("p");
		for (let j = 0; j < selections.length; j++) {
			selections[j].addEventListener("click", function() {
				let p = this.parentNode.querySelectorAll("p");
				for (let k = 0; k < p.length; k++) {
					p[k].setAttribute("class", "");
				}
				this.setAttribute("class", "selected");
				this.parentNode.parentNode.getElementsByClassName("select-box-selected")[0].textContent = this.textContent;
				setSettings();
			});
		}
		selectBoxSelections.style.height = "auto";
		selectBoxSelections.style.cacheHeight = parseFloat(document.defaultView.getComputedStyle(selectBoxSelections).height) / window.innerHeight * 100;
		selectBoxSelections.style.height = "0px";
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
		AttachAudio(selectBoxes[i], "mouseenter", "src/audio/effects/menuclick.wav", "settings-master-volume", "settings-effects-volume");
	}
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
	AttachAudio(document.getElementById("logo"), "click", "src/audio/effects/menuHit.wav", "settings-master-volume", "settings-effects-volume");
	document.getElementById("logo").addEventListener("click", function() {
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
	AttachAudio(document.getElementById("back-button"), "click", "src/audio/effects/back-button-click.wav", "settings-master-volume", "settings-effects-volume");
	AttachAudio(document.getElementById("back-button"), "mouseenter", "src/audio/effects/back-button-hover.wav", "settings-master-volume", "settings-effects-volume");
	document.getElementById("menu-bar-play").addEventListener("click", function() {
		document.getElementById("webpage-state-menu").style.display = "none";
		document.getElementById("webpage-state-beatmap-selection").style.display = "block";
		document.getElementById("menu-audio").pause();
	});
	/* Helper */
	let menuTimeout;

	function resetMenu() {
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
		})
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
			document.getElementById("orientation-vertical").style.display = "block"
		} else {
			document.getElementById("orientation-vertical").style.display = "none";
		}
	});
	document.body.addEventListener("touchmove", function(e) {
		e.preventDefault();
	}, {
		passive: false
	});
	window.dispatchEvent(new CustomEvent("orientationchange"));
	document.getElementById("back-button").addEventListener("click", function() {
		let elements = document.getElementsByClassName("webpage-state");
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].id === "webpage-state-always") {
				continue;
			}
			elements[i].style.display = "none";
		}
		document.getElementById("webpage-state-menu").style.display = "block";
		document.getElementById("menu-audio").play();
	});
	document.getElementById("pause-menu-continue").addEventListener("click", function() {
		gameplay.continue();
		document.getElementById("webpage-state-pause-screen").style.display = "none";
	});
	document.getElementById("pause-menu-retry").addEventListener("click", function() {
		gameplay.retry();
		document.getElementById("webpage-state-pause-screen").style.display = "none";
	});
	document.getElementById("pause-menu-quit").addEventListener("click", function() {
		document.getElementById("menu-audio").play();
		document.getElementById("webpage-state-always").style.display = "block";
		document.getElementById("top-bar").style.display = "block";
		document.getElementById("webpage-state-beatmap-selection").style.display = "block";
		document.getElementById("webpage-state-gameplay").style.display = "none";
		document.getElementById("webpage-state-pause-screen").style.display = "none";
	});
});