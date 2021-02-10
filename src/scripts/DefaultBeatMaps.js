let deps = ["require", "./Parser.js",
	"../beatmaps/Peter Lambert - osu tutorial (peppy) [Gameplay basics].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Easy].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Normal].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Hard].js",
	"../beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Insane].js",
	"../beatmaps/Kurokotei - Galaxy Collapse (Doomsday is Bad) [Galaxy].js",
	"../beatmaps/Kurokotei - Galaxy Collapse (Doomsday is Bad) [Galactic].js",
	"../beatmaps/Soleily - Renatus (Gamu) [Normal].js",
	"../beatmaps/Soleily - Renatus (Gamu) [Hard].js",
	"../beatmaps/Soleily - Renatus (Gamu) [Insane].js"
]
define(deps, function(require) {
	let Parser = require("./Parser.js");
	let beatmaps = deps.slice(2);
	let beatmapsSorted = [];
	let beatMapGroups = [];
	let previous = "";
	for (var i = 0; i < beatmaps.length; i++) {
		if (beatMapGroups.length !== 0 && beatmaps[i].substr(0, beatmaps[i].match(/\[/).index) !== previous) {
			beatmapsSorted.push(beatMapGroups);
			beatMapGroups = [];
			previous = beatmaps[i].substr(0, beatmaps[i].match(/\[/).index);
		}
		beatMapGroups.push(Parser.parseBeatMap(require(beatmaps[i])));
	}
	beatmapsSorted.push(beatMapGroups);
	return beatmapsSorted;
});