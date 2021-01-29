define(["require", "./Parser.js",
	"../beatmaps/Peter Lambert - osu tutorial (peppy) [Gameplay basics].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Easy].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Normal].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Hard].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Insane].js"], function(require) {
	let Parser = require("./Parser.js");
	let array = [
		Parser.parseBeatMap(require("../beatmaps/Peter Lambert - osu tutorial (peppy) [Gameplay basics].js")),
		Parser.parseBeatMap(require("../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Easy].js")),
		Parser.parseBeatMap(require("../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Normal].js")),
		Parser.parseBeatMap(require("../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Hard].js")),
		Parser.parseBeatMap(require("../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Insane].js")),
	];
	return array;
});