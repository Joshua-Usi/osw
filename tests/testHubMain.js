define(function(require) {
	let Formulas = require("../src/scripts/Formulas.js")
	for (let key in Formulas) {
		if (Formulas.hasOwnProperty(key)) {
			document.body.innerHTML += `<a href="Formulas.test/Formulas.${key}.test.html">${Object.keys({Formulas})[0] + "." + key} test</a>`;
		}
	}
});