define(function(require) {
	const formulas = require("./formulas.js");
	const mods = require("./mods.js")();
	let isOpen = false;
	let elements = document.getElementsByClassName("mod-icons");
	for (let i = 0; i < elements.length; i++) {
		elements[i].addEventListener("click", function() {
			let modName = this.id.replace("mod-", "");
			if (this.classList.contains("mod-selected")) {
				this.className = this.className.replace(/\bmod-selected\b/g, "");
				mods[modName] = false;
			} else {
				this.classList.add("mod-selected");
				mods[modName] = true;
			}
			document.getElementById("mod-score-multiplier").innerHTML = `Score Multiplier: <b>${formulas.modScoreMultiplier(mods).toFixed(2)}x</b>`;
		});
	}
	let el = [
		"mods-ui",
		"mods-blue-one",
		"mods-blue-two",
		"mods-blue-three",
		"mods-blue-four",
	]
	let elOpenTimes = [
		"0.75s",
		"0.35s",
		"0.45s",
		"0.55s",
		"0.65s",
	]
	let elCloseTimes = [
		"0.75s",
		"1.45s",
		"1.25s",
		"1.05s",
		"0.85s",
	]
	function closeModsUI() {
		for (let i = 0; i < el.length; i++) {
			let element = document.getElementById(el[i]);
			element.style.transitionDuration = elCloseTimes[i];
			element.style.bottom = "-76vh";	
			isOpen = false;
		}
	}
	function openModsUI() {
		for (let i = 0; i < el.length; i++) {
			let element = document.getElementById(el[i]);
			element.style.transitionDuration = elOpenTimes[i];
			element.style.bottom = "0";	
			isOpen = true;
		}
	}
	document.getElementById("mods-close-button").addEventListener("click", closeModsUI);
	document.getElementById("bottom-bar-mods").addEventListener("click", function() {
		if (isOpen === false) {
			openModsUI();
		} else {
			closeModsUI();
		}
	});
	document.getElementById("mods-deselect-all").addEventListener("click", function() {
		let elements = document.getElementsByClassName("mod-icons");
		for (let i = 0; i < elements.length; i++) {
			elements[i].className = elements[i].className.replace(/\bmod-selected\b/g, "");
		}
	});
});