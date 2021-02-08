define(function(require) {
	let Test = require("../test.js");
	let Formulas = require("../../src/scripts/Formulas.js");
	/* dependencies */
	let Mods = require("../../src/scripts/Mods.js");
	Test.table(Formulas.CS, [
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
		54.4 - 4.48 * -1,
		54.4 - 4.48 * 0,
		54.4 - 4.48 * 1,
		54.4 - 4.48 * 2,
		54.4 - 4.48 * 3,
		54.4 - 4.48 * 4,
		54.4 - 4.48 * 5,
		54.4 - 4.48 * 6,
		54.4 - 4.48 * 7,
		54.4 - 4.48 * 8,
		54.4 - 4.48 * 9,
		54.4 - 4.48 * 10,
		54.4 - 4.48 * 11,
		Formulas.CS(0),
		Formulas.CS(5),
		Formulas.CS(0),
		Formulas.CS(6.5),
		Formulas.CS(10),
	]);
});