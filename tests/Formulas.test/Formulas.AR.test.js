define(function(require) {
	let Test = require("../test.js");
	let Formulas = require("../../src/scripts/Formulas.js");
	/* dependencies */
	let Mods = require("../../src/scripts/Mods.js");
	Test.table(Formulas.AR, [
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
		1.92,
		1.8,
		1.68,
		1.56,
		1.44,
		1.32,
		1.2,
		1.05,
		0.9,
		0.75,
		0.6,
		0.45,
		0.3,
		Formulas.AR(0),
		Formulas.AR(5),
		Formulas.AR(0),
		Formulas.AR(7),
		Formulas.AR(10),
	]);
});