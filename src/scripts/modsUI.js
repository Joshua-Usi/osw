define(function(require) {
	let elements = document.getElementsByClassName("mod-icons");
	for (let i = 0; i < elements.length; i++) {
		elements[i].addEventListener("click", function() {
			let modName = this.id.replace("mod-", "");
			if (this.classList.contains("mod-selected")) {
				this.className = this.className.replace(/\bmod-selected\b/g, "");
			} else {
				this.classList.add("mod-selected");
			}
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
		"1.15s",
		"1.05s",
		"0.95s",
		"0.85s",
	]
	document.getElementById("mods-close-button").addEventListener("click", function() {
		for (let i = 0; i < el.length; i++) {
			let element = document.getElementById(el[i]);
			element.style.transitionDuration = elCloseTimes[i];
			element.style.bottom = "-70vh";	
		}
	});
	document.getElementById("bottom-bar-mods").addEventListener("click", function() {
		if (document.getElementById(el[0]).style.bottom === "-70vh") {
			for (let i = 0; i < el.length; i++) {
				let element = document.getElementById(el[i]);
				element.style.transitionDuration = elOpenTimes[i];
				element.style.bottom = "0";	
			}
		} else {
			for (let i = 0; i < el.length; i++) {
				let element = document.getElementById(el[i]);
				element.style.transitionDuration = elOpenTimes[i];
				element.style.bottom = "-70vh";	
			}
		}
	});
});