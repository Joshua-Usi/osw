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
	const Song = require("src/scripts/Song.js");
	let Options = require("src/scripts/Options.js");
	const AssetLoader = require("src/scripts/AssetLoader.js");
	const utils = require("src/scripts/utils.js");
	const Beatmaps = require("src/scripts/DefaultBeatMaps.js");
	const AttachAudio = require("src/scripts/AttachAudio.js");

	const BeatMapSelectionPaneTemplate = require("src/scripts/BeatMapSelectionPane.js");
	for (let i = 0; i < Beatmaps.length; i++) {
		document.getElementById("beatmap-selection-right").innerHTML += BeatMapSelectionPaneTemplate.group(Beatmaps[i], i);
	}
	/* Offline context checks, needed to ensure for some effects to work */
	if (window.origin === null) {
		console.warn("You appear to be running this locally without a web server, some effects may not work due to CORS");
	}
	/* Osu!web version incremented manually */
	const version = "osu!web v2021.0.5.5a";
	/* Set element version numbers */
	let classes = document.getElementsByClassName("version-number");
	for (let i = 0; i < classes.length; i++) {
		classes[i].innerText = version;
	}
	/* Initialise mouse module */
	let mouse = new Mouse("body");
	mouse.init();
	/* Initial menu song pool */
	let songs = [
		Song.create("cYsmix - Triangles.mp3", Song.bpm(160)),
		Song.create("nekodex - circles.mp3", Song.bpm([185, 360, 600, 185], [0, 8, 10.5, 12])),
	];
	/* Only add christmas songs to list if the month is December */
	if (new Date().getMonth() === 11) {
		songs.push(Song.create("nekodex - aureole.mp3", Song.bpm(140)));
		songs.push(Song.create("nekodex - Little Drummer Girl.mp3", Song.bpm(140)));
	}
	let chosenSong;
	let bpm;
	let menuAudio = new Audio();
	menuAudio.addEventListener("play", function() {
		document.getElementById("now-playing").innerText = "Now Playing: " + utils.replaceAll(this.src, [window.origin, "/src/audio/", ".wav", ".mp3", ".ogg"]).replaceAll("%20", " ");
	});
	menuAudio.addEventListener("ended", function() {
		this.play();
	});
	menuAudio.addEventListener("DOMAttrModified", function(event) {
    if (event.attrName == "src") {
       document.getElementById("now-playing").innerText = "Now Playing: " + utils.replaceAll(this[src], [".wav", ".mp3", ".ogg"]);
    }
});
	menuAudio.id = "menu-audio";
	/* Need to append for wave.js */
	document.getElementById("body").appendChild(menuAudio);
	/* Create canvas for audio visualizer */
	let canvas = document.getElementById("audio-visualiser");
	canvas.width = 0.9 * window.innerHeight;
	canvas.height = 0.9 * window.innerHeight;
	let settingsSet = false;
	let isFirstClick = true;
	let offset = 0;
	let time = 0;
	let lastTime = 0;
	let accumulator = 0;
	/* States:
	 * just-logo
	 * first
	 * play
	 * settings
	 */
	let menuState = "just-logo";
	let logoX = 50;
	let logoY = 50;
	let logoSize = 50;
	let logoPulseSize = 55;
	/* Profiling variables */
	let times = [];
	let frameRate = 0;
	/* Event Listeners */
	window.addEventListener("click", function() {
		if (isFirstClick === true && document.readyState === "complete") {
			/* Setting settings */
			/* Audio */
			document.getElementById("settings-master-volume").value = Options.Audio.masterVolume * 100;
			document.getElementById("settings-master-volume").dispatchEvent(new CustomEvent("input"));

			document.getElementById("settings-music-volume").value = Options.Audio.musicVolume * 100;
			document.getElementById("settings-music-volume").dispatchEvent(new CustomEvent("input"));

			document.getElementById("settings-effects-volume").value = Options.Audio.effectsVolume * 100;
			document.getElementById("settings-effects-volume").dispatchEvent(new CustomEvent("input"));
			/* Inputs */
			document.getElementById("settings-keyboard-left-button").innerText = Options.Inputs.keyboardLeftButton;
			document.getElementById("settings-keyboard-right-button").innerText = Options.Inputs.keyboardRightButton;
			document.getElementById("settings-enable-mouse-buttons-in-gameplay").checked = Options.Inputs.enableMouseButtonsInGameplay;

			document.getElementById("settings-mouse-sensitivity").value = Options.Inputs.mouseSensitivity * 10;
			document.getElementById("settings-mouse-sensitivity").dispatchEvent(new CustomEvent("input"));
			/* User Interface */
			document.getElementById("settings-intro-sequence").getElementsByClassName("select-box-selected")[0].innerText = Options.UserInterface.introSequence;
			document.getElementById("settings-menu-parallax").checked = Options.UserInterface.menuParallax;
			/* Gameplay */
			document.getElementById("settings-background-dim").value = Options.Gameplay.backgroundDim * 100;
			document.getElementById("settings-background-dim").dispatchEvent(new CustomEvent("input"));
			document.getElementById("settings-draw-300-hits").checked = Options.Gameplay.draw300Hits;
			document.getElementById("settings-snaking-sliders").checked = Options.Gameplay.snakingSliders;
			document.getElementById("settings-cursor-trails").getElementsByClassName("select-box-selected")[0].innerText = Options.Gameplay.cursorTrails;
			/* Performance */
			document.getElementById("settings-low-power-mode").checked = Options.Performance.lowPowerMode;
			document.getElementById("settings-max-frame-rate").getElementsByClassName("select-box-selected")[0].innerText = Options.Performance.maxFrameRate;
			document.getElementById("settings-show-fps").checked = Options.Performance.ShowFPS;
			document.getElementById("settings-slider-resolution").value = Options.Performance.sliderResolution;
			document.getElementById("settings-slider-resolution").dispatchEvent(new CustomEvent("input"));
			document.getElementById("settings-draw-hit-values").checked = Options.Performance.drawHitValues;
			document.getElementById("settings-score-update-rate").getElementsByClassName("select-box-selected")[0].innerText = Options.Performance.scoreUpdateRate;
			settingsSet = true;
			if (document.getElementById("settings-intro-sequence").getElementsByClassName("select-box-selected")[0].innerText === "Triangles") {
				chosenSong = 0;
				menuAudio.src = `src/audio/${songs[chosenSong].src}`;
				bpm = songs[chosenSong].bpm.get();
			} else {
				chosenSong = 1;
				menuAudio.src = `src/audio/${songs[chosenSong].src}`;
				bpm = songs[chosenSong].bpm.get();
			}
			menuAudio.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);;
			menuAudio.play();
			isFirstClick = false;
			time = 0;
			lastTime = 0;
			(function animate() {
				let backgroundImageParallax = document.getElementById("background-blur");
				let menuParallax = document.getElementById("menu-parallax");
				let triangleBackgroundMoves = document.getElementsByClassName("triangle-background");
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

				/* triangle background moves */
				offset -= 0.25;
				for (let i = 0; i < triangleBackgroundMoves.length; i++) {
					triangleBackgroundMoves[i].style.backgroundPositionY = triangleBackgroundMoves[i].getBoundingClientRect().bottom - window.scrollY + offset + "px";
				}
				/* beat detection and accumulation */
				bpm = songs[chosenSong].bpm.get(time);
				lastTime = time;
				time = menuAudio.currentTime;
				if (accumulator < 0) {
					accumulator = 0;
				}
				accumulator += time - lastTime;
				if (accumulator > 1 / (bpm / 60)) {
					while (accumulator > 1 / (bpm / 60)) {
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
						accumulator -= 1 / (bpm / 60);
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
				let innerText = frameRate;
				if (Options.Performance.maxFrameRate === "VSync") {
					innerText += " / 60fps";
				} else if (Options.Performance.maxFrameRate === "2x VSync") {
					innerText += " / 120fps";
				} else if (Options.Performance.maxFrameRate === "Browser Maximum (250fps)") {
					innerText += " / 250fps";
				}
				document.getElementById("frame-rate").innerText = innerText;
				if (frameRate > 60) {
					document.getElementById("frame-rate").style.background = "#6d9eeb";
				} else if (frameRate > 45) {
					document.getElementById("frame-rate").style.background = "#39e639";
				} else if (frameRate > 20) {
					document.getElementById("frame-rate").style.background = "#ffa500";
				} else {
					document.getElementById("frame-rate").style.background = "#B00020";
				}
				requestAnimationFrame(animate);
			})();
		}
	});
/* Omnipotent web listeners */
	window.addEventListener("resize", function() {
		let canvas = document.getElementById("audio-visualiser");
			canvas.width = 0.9 * window.innerHeight;
			canvas.height = 0.9 * window.innerHeight;
			// canvas.width = 0.5 * window.innerHeight;
			// canvas.height = 0.5 * window.innerHeight;
	});
	window.addEventListener("load", function() {
		document.getElementById("splash-screen").style.animation = "splash-screen-text forwards";
		document.getElementById("splash-screen").style.animationDuration = "1s";
		document.getElementById("splash-screen").style.animationDelay = "1s";
		document.getElementById("heart-loader").style.display = "none";
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
		document.getElementById("settings-master-volume-text").innerText = "Master volume: " + this.value + "%";
		document.getElementById("menu-audio").volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
		setSettings();
	});
	document.getElementById("settings-music-volume").addEventListener("input", function() {
		document.getElementById("settings-music-volume-text").innerText = "Music volume: " + this.value + "%";
		document.getElementById("menu-audio").volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-music-volume").value / 100);
		setSettings();
	});
	document.getElementById("settings-effects-volume").addEventListener("input", function() {
		document.getElementById("settings-effects-volume-text").innerText = "Effects volume: " + this.value + "%";
		setSettings();
	});
	document.getElementById("settings-mouse-sensitivity").addEventListener("input", function() {
		document.getElementById("settings-mouse-sensitivity-text").innerText = "Mouse sensitivity: " + (window.parseInt(this.value) / 10).toFixed(1) + "x";
		setSettings();
	});
	document.getElementById("settings-background-dim").addEventListener("input", function() {
		document.getElementById("settings-background-dim-text").innerText = "Background dim: " + this.value + "%";
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
		document.getElementById("settings-slider-resolution-text").innerText = "Slider resolution: " + resolution;
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
				this.parentNode.parentNode.getElementsByClassName("select-box-selected")[0].innerText = this.innerText;
				setSettings();
			});
		}
		selectBoxSelections.style.height = "auto";
		selectBoxSelections.style.cacheHeight = parseFloat(document.defaultView.getComputedStyle(selectBoxSelections).height) / window.innerHeight * 100;
		selectBoxSelections.style.height = "0px";
		selectBoxes[i].addEventListener("click", function() {
			let selectBoxSelections = this.getElementsByClassName("select-box-selections")[0];
			if (selectBoxSelections.style.height === "0px" || selectBoxSelections.style.height === "") {
				console.log(selectBoxSelections.style.cacheHeight);
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
		let canvas = document.getElementById("audio-visualiser");
		canvas.width = 0.5 * window.innerHeight;
		canvas.height = 0.5 * window.innerHeight;
		canvas.style.width = 0.5 * window.innerHeight;
		canvas.style.height = 0.5 * window.innerHeight;
		canvas.style.top = "calc(" + logoY + "vh - " + canvas.width + "px / 2)";
		canvas.style.left = "calc(5vw + " + logoX + "vw - " + canvas.height + "px / 2)";
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
	/* Helper */
	let menuTimeout;
	function resetMenu() {
		logoX = 50;
		logoY = 50;
		logoSize = 50;
		logoPulseSize = 55;
		let canvas = document.getElementById("audio-visualiser");
		canvas.width = 0.9 * window.innerHeight;
		canvas.height = 0.9 * window.innerHeight;
		canvas.style.width = 0.9 * window.innerHeight;
		canvas.style.height = 0.9 * window.innerHeight;
		canvas.style.top = "calc(" + logoY + "vh - " + canvas.width + "px / 2)";
		canvas.style.left = "calc(5vw + " + logoX + "vw - " + canvas.height + "px / 2)";
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
			/* Audio */
			Options.Audio.masterVolume = document.getElementById("settings-master-volume").value / 100;
			Options.Audio.musicVolume = document.getElementById("settings-music-volume").value / 100;
			Options.Audio.effectsVolume = document.getElementById("settings-effects-volume").value / 100;
			/* Inputs */
			Options.Inputs.keyboardLeftButton = document.getElementById("settings-keyboard-left-button").innerText;
			Options.Inputs.keyboardRightButton = document.getElementById("settings-keyboard-right-button").innerText;
			Options.Inputs.enableMouseButtonsInGameplay = document.getElementById("settings-enable-mouse-buttons-in-gameplay").checked;
			Options.Inputs.mouseSensitivity = document.getElementById("settings-mouse-sensitivity").value / 10;
			/* User Interface */
			Options.UserInterface.introSequence = document.getElementById("settings-intro-sequence").getElementsByClassName("select-box-selected")[0].innerText;
			Options.UserInterface.menuParallax = document.getElementById("settings-menu-parallax").checked;
			/* Gameplay */
			Options.Gameplay.backgroundDim = document.getElementById("settings-background-dim").value / 100;
			Options.Gameplay.draw300Hits = document.getElementById("settings-draw-300-hits").checked;
			Options.Gameplay.snakingSliders = document.getElementById("settings-snaking-sliders").checked;
			Options.Gameplay.cursorTrails = document.getElementById("settings-cursor-trails").getElementsByClassName("select-box-selected")[0].innerText;
			/* Performance */
			Options.Performance.lowPowerMode = document.getElementById("settings-low-power-mode").checked;
			Options.Performance.maxFrameRate = document.getElementById("settings-max-frame-rate").getElementsByClassName("select-box-selected")[0].innerText;
			Options.Performance.ShowFPS = document.getElementById("settings-show-fps").checked;
			Options.Performance.sliderResolution = document.getElementById("settings-slider-resolution").value;
			Options.Performance.drawHitValues = document.getElementById("settings-draw-hit-values").checked;
			Options.Performance.scoreUpdateRate = document.getElementById("settings-score-update-rate").getElementsByClassName("select-box-selected")[0].innerText;
			localStorage.setItem("options", JSON.stringify(Options));
			console.log("settings saved!");
		}
	}
	/* Library Stuff */
	if (window.origin !== "null") {
		let wave = new Wave();
		wave.fromElement("menu-audio", "audio-visualiser", {
			stroke: 8,
			type: "flower",
			colors: ["#fff5"]
		});
	} else {
		console.warn("offline context, audio visualiser will not work");
	}
});