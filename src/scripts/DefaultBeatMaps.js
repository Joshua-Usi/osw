let deps = [
	"../src/beatmaps/Peter Lambert - osu! tutorial (peppy) [Gameplay basics].osu",
	"../src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Easy].osu",
	"../src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Normal].osu",
	"../src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Hard].osu",
	"../src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Insane].osu",
	"../src/beatmaps/Kurokotei - Galaxy Collapse (Doomsday is Bad) [Galaxy].osu",
	"../src/beatmaps/Kurokotei - Galaxy Collapse (Doomsday is Bad) [Galactic].osu",
	"../src/beatmaps/LeaF - Evanescent (Charles445) [Aspire].osu",
	"../src/beatmaps/Soleily - Renatus (Gamu) [Normal].osu",
	"../src/beatmaps/Soleily - Renatus (Gamu) [Hard].osu",
	"../src/beatmaps/Soleily - Renatus (Gamu) [Insane].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [emillia].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [emillistream].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [ET (Piggey vs Astar)].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Firedigger's peaceful walk].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Friendofox's Galaxy].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Nao's Eclipse].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Piggey's Destruction].osu",
	"../src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Silverboxer's Supernova].osu",
	"../src/beatmaps/TheFatRat - Mayday (feat. Laura Brehm) (Voltaeyx) [[2B] Calling Out Mayday].osu",
	"../src/beatmaps/Camellia - Exit This Earth's Atomosphere (Camellia's ''PLANETARY200STEP'' Remix) (ProfessionalBox) [Primordial Nucleosynthesis].osu",

]
define(function(require) {
	let Parser = require("./Parser.js");
	let fetchedMaps = [];
	let mapsLoaded = 0;
	let beatmapsSorted = [];
	let beatMapGroups = [];
	let previous = "";

	async function fetchMaps() {
		for (var i = 0; i < deps.length; i++) {
			const response = await fetch(deps[i]);
			await response.text().then(function(data) {
				fetchedMaps.push(data);
				mapsLoaded++;
			});
		}
		for (var i = 0; i < fetchedMaps.length; i++) {
			let parsedMap = Parser.parseBeatMap(fetchedMaps[i]);
			if (beatMapGroups.length !== 0 && parsedMap.BeatmapSetID !== previous) {
				beatmapsSorted.push(beatMapGroups);
				beatMapGroups = [];
				previous = parsedMap.BeatmapSetID;
			}
			beatMapGroups.push(parsedMap);
		}
		beatmapsSorted.push(beatMapGroups);
	}
	fetchMaps();
	return {
		get: function() {
			return beatmapsSorted;
		},
		allMapsLoaded: function() {
			if (mapsLoaded === deps.length) {
				return true;
			} else {
				false;
			}
		},
	};
});