define(function(require) {
	"use strict";
	const mods = new (require("./mods.js"))();
	let isOpen = false;
	let el = [
		"mods-ui",
		"mods-blue-one",
		"mods-blue-two",
		"mods-blue-three",
		"mods-blue-four",
	];
	let elOpenTimes = [
		"0.75s",
		"0.35s",
		"0.45s",
		"0.55s",
		"0.65s",
	];
	let elCloseTimes = [
		"0.75s",
		"1.45s",
		"1.25s",
		"1.05s",
		"0.85s",
	];
	return {
		getMods: function() {
			return mods;
		},
		isOpen: function() {
			return isOpen;
		},
		closeModsUI: function() {
			for (let i = 0; i < el.length; i++) {
				let element = document.getElementById(el[i]);
				element.style.transitionDuration = elCloseTimes[i];
				element.style.bottom = "-76vh";	
			}
			isOpen = false;
		},
		openModsUI: function() {
			for (let i = 0; i < el.length; i++) {
				let element = document.getElementById(el[i]);
				element.style.transitionDuration = elOpenTimes[i];
				element.style.bottom = "0";	
			}
			isOpen = true;
		},
		toggleModsUI: function() {
			if (this.isOpen() === false) {
				this.openModsUI();
			} else {
				this.closeModsUI();
			}
		},
		disableAllMods: function() {
			let elements = document.getElementsByClassName("mod-icons");
			for (let i = 0; i < elements.length; i++) {
				elements[i].className = elements[i].className.replace(/\bmod-selected\b/g, "");
				let modName = elements[i].id.replace("mod-", "");
				mods.disableMod(modName)
			}
		},
		showEnabledMods: function() {
			let elements = document.getElementsByClassName("mod-icons");
			for (let i = 0; i < elements.length; i++) {
				let modName = elements[i].id.replace("mod-", "");
				if (this.getMods()[modName]) {
					elements[i].classList.add("mod-selected");
				} else {
					elements[i].classList.remove("mod-selected");
				}
			}
		}
	}
});