define(function(require) {
	let Test = require("../test.js");
	let Formulas = require("../../src/scripts/Formulas.js");
	/* dependencies */
	let Mods = require("../../src/scripts/Mods.js");
	Test.table(Formulas.hitScore, [
		[300, 0, 0, 0],
		[100, 0, 0, 0],
		[50, 0, 0, 0],
		[0, 0, 0, 0],
		], [
		300,
		100,
		50,
		0,
	]);
});