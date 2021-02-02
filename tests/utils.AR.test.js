define(function(require) {
	let Test = require("test.js");
	Formulas = require("../src/scripts/Formulas.js");
	Test.table(Formulas.AR, [
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
	]);
});