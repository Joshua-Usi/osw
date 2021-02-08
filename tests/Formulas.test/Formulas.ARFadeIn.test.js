define(function(require) {
	let Test = require("../test.js");
	let Formulas = require("../../src/scripts/Formulas.js");
	/* dependencies */
	let Mods = require("../../src/scripts/Mods.js");
	Test.table(Formulas.ARFadeIn, [
		-1,
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		[0, Mods(true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false)],
		[10, Mods(true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false)],
		[0, Mods(false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false)],
		[5, Mods(false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false)],
		[10, Mods(false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false)],
	], [
		1.28,
		1.2,
		1.12,
		1.04,
		0.96,
		0.88,
		0.8,
		0.7,
		0.6,
		0.5,
		0.4,
		0.3,
		0.2,
		Formulas.ARFadeIn(0),
		Formulas.ARFadeIn(5),
		Formulas.ARFadeIn(0),
		Formulas.ARFadeIn(7),
		Formulas.ARFadeIn(10),
	]);
});