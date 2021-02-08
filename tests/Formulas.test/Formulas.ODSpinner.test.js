define(function(require) {
	let Test = require("../test.js");
	let Formulas = require("../../src/scripts/Formulas.js");
	/* dependencies */
	let Mods = require("../../src/scripts/Mods.js");
	Test.table(Formulas.ODSpinner, [
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
		2.6,
		3,
		3.4,
		3.8,
		4.2,
		4.6,
		5,
		5.5,
		6,
		6.5,
		7,
		7.5,
		8,
		Formulas.ODSpinner(0),
		Formulas.ODSpinner(5),
		Formulas.ODSpinner(0),
		Formulas.ODSpinner(7),
		Formulas.ODSpinner(10),
	]);
});