define(function(require) {
	const utils = require("./utils.js");
	const AttachAudio = require("./AttachAudio.js");
	/* All checkboxes listeners */
	let checkbox = document.getElementsByClassName("checkbox");
	for (let i = 0; i < checkbox.length; i++) {
		checkbox[i].addEventListener("change", function() {
			if (this.checked === true) {
				let checkOn = AssetLoader.audio("./src/audio/effects/check-on.wav");
				checkOn.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-effects-volume").value / 100);
				checkOn.play();
			} else {
				let checkOff = AssetLoader.audio("./src/audio/effects/check-off.wav");
				checkOff.volume = (document.getElementById("settings-master-volume").value / 100) * (document.getElementById("settings-effects-volume").value / 100);
				checkOff.play();
			}
			setSettings();
		});
		AttachAudio(checkbox[i], "mouseenter", "./src/audio/effects/settings-hover.wav", "settings-master-volume", "settings-effects-volume");
	}
	/* All range slider listeners */
	let sliders = document.getElementsByClassName("slider");
	for (let i = 0; i < sliders.length; i++) {
		sliders[i].addEventListener("input", function() {
			this.style.background = "linear-gradient(to right, #FD67AE 0%, #FD67AE " + utils.map(this.value, this.min, this.max, 0, 100) + "%, #7e3c57 " + utils.map(this.value, this.min, this.max, 0, 100) + "%, #7e3c57 100%)";
		});
		AttachAudio(sliders[i], "input", "./src/audio/effects/sliderbar.wav", "settings-master-volume", "settings-effects-volume");
		AttachAudio(sliders[i], "mouseenter", "./src/audio/effects/settings-hover.wav", "settings-master-volume", "settings-effects-volume");
	}
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
		AttachAudio(selectBoxes[i], "mouseenter", "./src/audio/effects/settings-hover.wav", "settings-master-volume", "settings-effects-volume");
	}
});