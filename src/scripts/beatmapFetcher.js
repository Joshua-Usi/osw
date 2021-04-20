// let deps = [
// 	"./src/beatmaps/Peter Lambert - osu! tutorial (peppy) [Gameplay basics].osu",
// 	"./src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Easy].osu",
// 	"./src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Normal].osu",
// 	"./src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Hard].osu",
// 	"./src/beatmaps/Rostik - Liquid (Paul Rosenthal Remix) (Charles445) [Insane].osu",
// 	"./src/beatmaps/Kurokotei - Galaxy Collapse (Doomsday is Bad) [Galaxy].osu",
// 	"./src/beatmaps/Kurokotei - Galaxy Collapse (Doomsday is Bad) [Galactic].osu",
// 	"./src/beatmaps/LeaF - Evanescent (Charles445) [Aspire].osu",
// 	"./src/beatmaps/Soleily - Renatus (Gamu) [Normal].osu",
// 	"./src/beatmaps/Soleily - Renatus (Gamu) [Hard].osu",
// 	"./src/beatmaps/Soleily - Renatus (Gamu) [Insane].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [emillia].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [emillistream].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [ET (Piggey vs Astar)].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Firedigger's peaceful walk].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Friendofox's Galaxy].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Nao's Eclipse].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Piggey's Destruction].osu",
// 	"./src/beatmaps/The Koxx - A FOOL MOON NIGHT (Astar) [Silverboxer's Supernova].osu",
// 	"./src/beatmaps/TheFatRat - Mayday (feat. Laura Brehm) (Voltaeyx) [[2B] Calling Out Mayday].osu",
// 	"./src/beatmaps/Camellia - Exit This Earth's Atomosphere (Camellia's ''PLANETARY200STEP'' Remix) (ProfessionalBox) [Primordial Nucleosynthesis].osu",
// ];
define(function(require) {
	const Parser = require("./parser.js");
	const databaseManager = require("./databaseManager.js");
	let fetchedMaps = [];
	let mapsLoaded = 0;
	let beatmapsSorted = [];
	let beatMapGroups = [];
	let previous = "";

	let returns = {
		values: [],
		complete: false,
	};
	let fullyCompletedLoading = false;

	let database = indexedDB.open("osw-database", 1);
	database.addEventListener("upgradeneeded", function() {
		console.log("A new version of the database exists and will need to be updated");
		let db = event.target.result;
		// existing db version
		switch (event.oldVersion) {
			case 0:
				db.createObjectStore("beatmaps", {
					keyPath: "name"
				});
				db.createObjectStore("audio", {
					keyPath: "name"
				});
				break;
		}
	});
	database.addEventListener("error", function(event) {
		console.error(`Attempt to open database failed: ${event.target.error}`);
	});
	database.addEventListener("success", function(event) {
	let database = event.target.result;
	async function fetchMaps() {
		databaseManager.getAllInDatabase(database, "beatmaps", returns);
		function checkComplete() {
			if (returns.complete && fullyCompletedLoading === false) {
				for (let i = 0; i < returns.values.length; i++) {
					let parsedMap = Parser.parseBeatMap(returns.values[i].data);
					/* ignore other gamemodes... for now */
					if (parsedMap.Mode !== 0) {
						continue;
					}
					if (beatMapGroups.length !== 0 && parsedMap.BeatmapSetID !== previous) {
						beatmapsSorted.push(beatMapGroups);
						beatMapGroups = [];
						previous = parsedMap.BeatmapSetID;
					}
					beatMapGroups.push(parsedMap);
				}
				beatmapsSorted.push(beatMapGroups);
				fullyCompletedLoading = true;
			} else {
				setTimeout(checkComplete, 250);
			}
		}
		checkComplete();
	}
	fetchMaps();
});
	return {
		get: function() {
			return beatmapsSorted;
		},
		allMapsLoaded: function() {
			return fullyCompletedLoading;
		},
	};
});