define(function(require) {
	let Test = require("testTables.js");
	Formulas = require("../src/scripts/Formulas.js");
	Test.table(Formulas.CS, [
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
	], [
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
	]);
});